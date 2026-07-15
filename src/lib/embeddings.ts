/** Gemini embedding model — embedding-001 is retired; use gemini-embedding-001 @ 768 dims */
const GEMINI_EMBED_MODEL = "gemini-embedding-001";
const GEMINI_EMBED_DIM = 768;
const GEMINI_EMBED_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_EMBED_MODEL}:embedContent`;

interface GeminiEmbedResponse {
  embedding?: {
    values?: number[];
  };
  error?: {
    message?: string;
    status?: string;
  };
}

/**
 * Embed text with Gemini (768 dimensions) for pgvector match_documents.
 */
export async function embed(text: string): Promise<number[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY environment variable");
  }

  if (!text || text.trim() === "") {
    throw new Error("Cannot embed empty text");
  }

  const url = `${GEMINI_EMBED_URL}?key=${encodeURIComponent(apiKey)}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: `models/${GEMINI_EMBED_MODEL}`,
      content: {
        parts: [{ text }],
      },
      outputDimensionality: GEMINI_EMBED_DIM,
    }),
  });

  let body: GeminiEmbedResponse;
  try {
    body = (await response.json()) as GeminiEmbedResponse;
  } catch {
    throw new Error(
      `Embedding error: Gemini returned non-JSON (HTTP ${response.status})`
    );
  }

  if (!response.ok) {
    const msg =
      body.error?.message ??
      `Gemini embedContent failed with status ${response.status}`;
    throw new Error(`Embedding error: ${msg}`);
  }

  const values = body.embedding?.values;
  if (!values || !Array.isArray(values) || values.length === 0) {
    throw new Error("Embedding error: empty or missing embedding values");
  }

  if (values.length !== GEMINI_EMBED_DIM) {
    throw new Error(
      `Embedding error: expected ${GEMINI_EMBED_DIM} dims, got ${values.length}`
    );
  }

  return values;
}
