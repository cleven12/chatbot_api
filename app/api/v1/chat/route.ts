import { getTenant } from "@/lib/auth";
import { MATCH_COUNT, MAX_MESSAGE_LENGTH } from "@/lib/constants";
import { embed } from "@/lib/embeddings";
import { jsonError, jsonOk } from "@/lib/errors";
import { askLLM } from "@/lib/llm";
import { checkRateLimit } from "@/lib/rate-limit";
import { getSupabase } from "@/lib/supabase";
import type {
  ChatRequest,
  ChatResponse,
  ChatSource,
  MatchDocument,
} from "@/types";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const apiKey = request.headers.get("x-api-key");
    const tenant = await getTenant(apiKey);
    if (!tenant) {
      return jsonError(401, "UNAUTHORIZED", "Invalid or missing API key");
    }

    const rate = await checkRateLimit(tenant.id);
    if (!rate.allowed) {
      return new Response(
        JSON.stringify({
          error: "Rate limit exceeded. Try again later.",
          code: "RATE_LIMITED",
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(rate.retryAfterSeconds),
          },
        }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return jsonError(400, "INVALID_JSON", "Request body must be valid JSON");
    }

    const { message, session_id } = body as Partial<ChatRequest>;

    if (typeof message !== "string" || message.trim() === "") {
      return jsonError(400, "VALIDATION_ERROR", "message is required");
    }
    if (typeof session_id !== "string" || session_id.trim() === "") {
      return jsonError(400, "VALIDATION_ERROR", "session_id is required");
    }
    if (message.length > MAX_MESSAGE_LENGTH) {
      return jsonError(
        400,
        "VALIDATION_ERROR",
        `message must be at most ${MAX_MESSAGE_LENGTH} characters`
      );
    }

    const queryEmbedding = await embed(message.trim());
    const supabase = getSupabase();

    const { data: matches, error: matchError } = await supabase.rpc(
      "match_documents",
      {
        query_embedding: queryEmbedding,
        match_tenant: tenant.id,
        match_count: MATCH_COUNT,
      }
    );

    if (matchError) {
      console.error("[chat] match_documents failed:", matchError.message);
      return jsonError(500, "RETRIEVAL_ERROR", "Failed to retrieve context");
    }

    const docs = (matches ?? []) as MatchDocument[];

    const contextBlock =
      docs.length === 0
        ? "No relevant knowledge base documents were found."
        : docs.map((d, i) => `[Source ${i + 1}]\n${d.content}`).join("\n\n");

    const systemPrompt = [
      tenant.system_prompt.trim(),
      "",
      "Use the following knowledge base context to answer the user.",
      "If the context does not contain the answer, say so honestly.",
      "Do not invent prices, dates, or itineraries not present in the context.",
      "",
      "--- CONTEXT ---",
      contextBlock,
      "--- END CONTEXT ---",
    ].join("\n");

    const answer = await askLLM(message.trim(), systemPrompt);

    const historyRows = [
      {
        tenant_id: tenant.id,
        session_id: session_id.trim(),
        role: "user" as const,
        content: message.trim(),
      },
      {
        tenant_id: tenant.id,
        session_id: session_id.trim(),
        role: "assistant" as const,
        content: answer,
      },
    ];

    const { error: historyError } = await supabase
      .from("chat_history")
      .insert(historyRows);

    if (historyError) {
      console.error("[chat] history insert failed:", historyError.message);
    }

    const sources: ChatSource[] = docs.map((d) => ({
      id: d.id,
      content: d.content,
      metadata: d.metadata ?? {},
      similarity: d.similarity,
    }));

    const response: ChatResponse = {
      answer,
      sources,
      session_id: session_id.trim(),
    };

    return jsonOk(response);
  } catch (err) {
    console.error("[chat] unhandled error:", err);
    return jsonError(500, "INTERNAL_ERROR", "An unexpected error occurred");
  }
}
