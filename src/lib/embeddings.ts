const GEMINI_EMBED_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedContent";

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
 * Embed text with Google Gemini embedding-001 (768 dimensions) via REST.
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
      model: "models/embedding-001",
      content: {
        parts: [{ text }],
      },
    }),
  });

  const body = (await response.json()) as GeminiEmbedResponse;

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

  return values;
}
