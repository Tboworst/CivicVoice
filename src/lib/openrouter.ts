/**
 * OpenRouter API client — server-side only.
 * Never import this file in client components.
 */

export const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
export const OPENROUTER_MODEL =
  process.env.OPENROUTER_MODEL ?? "openai/gpt-4o-mini";

export function hasOpenRouterConfig(): boolean {
  return Boolean(OPENROUTER_API_KEY);
}

export type OpenRouterMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export interface OpenRouterOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  /** Request JSON output mode (supported by most OpenRouter models) */
  jsonMode?: boolean;
}

export type OpenRouterErrorCode =
  | "NO_KEY"
  | "MALFORMED"
  | "SERVICE"
  | "TIMEOUT";

export class OpenRouterError extends Error {
  constructor(
    message: string,
    public readonly code: OpenRouterErrorCode
  ) {
    super(message);
    this.name = "OpenRouterError";
  }
}

/** Call the OpenRouter chat completions endpoint and return the raw string response. */
export async function callOpenRouter(
  messages: OpenRouterMessage[],
  options: OpenRouterOptions = {}
): Promise<string> {
  if (!OPENROUTER_API_KEY) {
    throw new OpenRouterError(
      "OpenRouter API key not configured. Add OPENROUTER_API_KEY to your .env.local.",
      "NO_KEY"
    );
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30_000);

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer":
          process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
        "X-Title": "CivicVoice",
      },
      body: JSON.stringify({
        model: options.model ?? OPENROUTER_MODEL,
        messages,
        temperature: options.temperature ?? 0.3,
        max_tokens: options.maxTokens ?? 1024,
        ...(options.jsonMode
          ? { response_format: { type: "json_object" } }
          : {}),
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new OpenRouterError(
        `OpenRouter returned HTTP ${res.status}: ${body.slice(0, 200)}`,
        "SERVICE"
      );
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    if (typeof content !== "string") {
      throw new OpenRouterError(
        "Unexpected response shape from OpenRouter.",
        "MALFORMED"
      );
    }
    return content;
  } catch (err) {
    if (err instanceof OpenRouterError) throw err;
    if ((err as Error).name === "AbortError") {
      throw new OpenRouterError(
        "OpenRouter request timed out after 30s.",
        "TIMEOUT"
      );
    }
    throw new OpenRouterError(
      `Network error: ${(err as Error).message}`,
      "SERVICE"
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

/** Strip markdown fences and parse JSON safely; throws OpenRouterError on failure. */
export function parseJsonSafely<T>(raw: string): T {
  const cleaned = raw
    .replace(/^```json\s*/im, "")
    .replace(/^```\s*/im, "")
    .replace(/\s*```\s*$/im, "")
    .trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    throw new OpenRouterError(
      `AI returned malformed JSON: ${cleaned.slice(0, 300)}`,
      "MALFORMED"
    );
  }
}
