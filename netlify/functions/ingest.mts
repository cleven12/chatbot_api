import type { Context } from "@netlify/functions";
import { isValidAdminKey } from "../../src/lib/admin.ts";
import {
  MAX_CHUNK_LENGTH,
  MAX_CHUNKS_PER_REQUEST,
} from "../../src/lib/constants.ts";
import { embed } from "../../src/lib/embeddings.ts";
import { jsonError, jsonOk } from "../../src/lib/errors.ts";
import { getSupabase } from "../../src/lib/supabase.ts";
import type {
  IngestChunk,
  IngestRequest,
  IngestResponse,
} from "../../src/types/index.ts";

export default async function handler(
  request: Request,
  _context: Context
): Promise<Response> {
  if (request.method !== "POST") {
    return jsonError(405, "METHOD_NOT_ALLOWED", "Use POST");
  }

  try {
    if (!isValidAdminKey(request.headers.get("x-admin-key"))) {
      return jsonError(401, "UNAUTHORIZED", "Invalid or missing admin key");
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return jsonError(400, "INVALID_JSON", "Request body must be valid JSON");
    }

    const { tenant_id, chunks } = body as Partial<IngestRequest>;

    if (typeof tenant_id !== "string" || tenant_id.trim() === "") {
      return jsonError(400, "VALIDATION_ERROR", "tenant_id is required");
    }
    if (!Array.isArray(chunks) || chunks.length === 0) {
      return jsonError(
        400,
        "VALIDATION_ERROR",
        "chunks must be a non-empty array"
      );
    }
    if (chunks.length > MAX_CHUNKS_PER_REQUEST) {
      return jsonError(
        400,
        "VALIDATION_ERROR",
        `chunks must have at most ${MAX_CHUNKS_PER_REQUEST} items`
      );
    }

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i] as IngestChunk | undefined;
      if (!chunk || typeof chunk.content !== "string" || chunk.content.trim() === "") {
        return jsonError(
          400,
          "VALIDATION_ERROR",
          `chunks[${i}].content is required`
        );
      }
      if (chunk.content.length > MAX_CHUNK_LENGTH) {
        return jsonError(
          400,
          "VALIDATION_ERROR",
          `chunks[${i}].content must be at most ${MAX_CHUNK_LENGTH} characters`
        );
      }
    }

    const supabase = getSupabase();

    // Ensure tenant exists
    const { data: tenant, error: tenantError } = await supabase
      .from("tenants")
      .select("id")
      .eq("id", tenant_id.trim())
      .maybeSingle();

    if (tenantError) {
      console.error("[ingest] tenant lookup failed:", tenantError.message);
      return jsonError(500, "INTERNAL_ERROR", "Failed to validate tenant");
    }
    if (!tenant) {
      return jsonError(404, "NOT_FOUND", "Tenant not found");
    }

    const rows: Array<{
      tenant_id: string;
      content: string;
      metadata: Record<string, unknown>;
      embedding: number[];
    }> = [];

    for (const chunk of chunks as IngestChunk[]) {
      const embedding = await embed(chunk.content.trim());
      rows.push({
        tenant_id: tenant_id.trim(),
        content: chunk.content.trim(),
        metadata: chunk.metadata ?? {},
        embedding,
      });
    }

    const { data: inserted, error: insertError } = await supabase
      .from("documents")
      .insert(rows)
      .select("id");

    if (insertError) {
      console.error("[ingest] insert failed:", insertError.message);
      return jsonError(500, "INSERT_ERROR", "Failed to insert documents");
    }

    const response: IngestResponse = {
      inserted: inserted?.length ?? rows.length,
    };

    return jsonOk(response, 201);
  } catch (err) {
    console.error("[ingest] unhandled error:", err);
    return jsonError(500, "INTERNAL_ERROR", "An unexpected error occurred");
  }
}
