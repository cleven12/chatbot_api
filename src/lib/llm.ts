const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
/** llama-3.1-70b-versatile was decommissioned on Groq — use 3.3 */
const GROQ_MODEL = "llama-3.3-70b-versatile";
const GROQ_TIMEOUT_MS = 15_000;

/** Fallback generate model (embed key may still work when free-tier generate is limited) */
const GEMINI_GENERATE_MODEL = "gemini-2.5-flash";
const GEMINI_GENERATE_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_GENERATE_MODEL}:generateContent`;

interface GroqChoice {
  message?: { content?: string };
}

interface GroqResponse {
  choices?: GroqChoice[];
  error?: { message?: string };
}

interface GeminiGenerateResponse {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
  }>;
  error?: { message?: string };
}

/**
 * Ask an LLM: try Groq first, fall back to Gemini on any failure.
 * Logs which provider served the response.
 */
export async function askLLM(
  message: string,
  systemPrompt: string
): Promise<string> {
  let groqError: string | null = null;
  try {
    const answer = await askGroq(message, systemPrompt);
    console.log("[llm] provider=groq model=" + GROQ_MODEL);
    return answer;
  } catch (err) {
    groqError = err instanceof Error ? err.message : String(err);
    console.warn("[llm] groq failed, falling back to gemini:", groqError);
  }

  try {
    const answer = await askGemini(message, systemPrompt);
    console.log("[llm] provider=gemini model=" + GEMINI_GENERATE_MODEL);
    return answer;
  } catch (err) {
    const geminiError = err instanceof Error ? err.message : String(err);
    throw new Error(
      `LLM failed. Groq: ${groqError}. Gemini: ${geminiError}`
    );
  }
}

async function askGroq(message: string, systemPrompt: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GROQ_API_KEY");
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), GROQ_TIMEOUT_MS);

  try {
    const response = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        temperature: 0.3,
        max_tokens: 1024,
      }),
      signal: controller.signal,
    });

    const body = (await response.json()) as GroqResponse;

    if (!response.ok) {
      throw new Error(body.error?.message ?? `Groq HTTP ${response.status}`);
    }

    const content = body.choices?.[0]?.message?.content?.trim();
    if (!content) {
      throw new Error("Groq returned empty content");
    }
    return content;
  } finally {
    clearTimeout(timer);
  }
}

async function askGemini(
  message: string,
  systemPrompt: string
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY for Gemini fallback");
  }

  const url = `${GEMINI_GENERATE_URL}?key=${encodeURIComponent(apiKey)}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: {
        parts: [{ text: systemPrompt }],
      },
      contents: [
        {
          role: "user",
          parts: [{ text: message }],
        },
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1024,
      },
    }),
  });

  const body = (await response.json()) as GeminiGenerateResponse;

  if (!response.ok) {
    throw new Error(
      body.error?.message ?? `Gemini generateContent HTTP ${response.status}`
    );
  }

  const content = body.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!content) {
    throw new Error("Gemini returned empty content");
  }
  return content;
}
