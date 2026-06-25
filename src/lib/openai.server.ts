// Server-only helper: calls OpenAI Chat Completions using the API key
// provided by the client in the X-OpenAI-Key request header.
// REAL API CALL — no mocks.

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export class OpenAIError extends Error {
  status: number;
  constructor(message: string, status = 500) {
    super(message);
    this.status = status;
  }
}

export function getApiKey(request: Request): string {
  const key =
    request.headers.get("x-openai-key") ||
    request.headers.get("X-OpenAI-Key") ||
    process.env.OPENAI_API_KEY ||
    "";
  if (!key || !key.startsWith("sk-")) {
    throw new OpenAIError(
      "Missing or invalid OpenAI API key. Open Settings and paste your key (starts with sk-).",
      401,
    );
  }
  return key;
}

export async function callOpenAI(opts: {
  apiKey: string;
  messages: ChatMessage[];
  json?: boolean;
  model?: string;
  temperature?: number;
}): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${opts.apiKey}`,
    },
    body: JSON.stringify({
      model: opts.model ?? "gpt-4o-mini",
      temperature: opts.temperature ?? 0.7,
      messages: opts.messages,
      ...(opts.json ? { response_format: { type: "json_object" } } : {}),
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    let msg = `OpenAI error (${res.status})`;
    try {
      const j = JSON.parse(text);
      if (j?.error?.message) msg = j.error.message;
    } catch {}
    throw new OpenAIError(msg, res.status);
  }
  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string") throw new OpenAIError("Empty response from OpenAI");
  return content;
}

export function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export function errorResponse(err: unknown) {
  if (err instanceof OpenAIError) {
    return jsonResponse({ error: err.message }, err.status);
  }
  const message = err instanceof Error ? err.message : "Unknown error";
  return jsonResponse({ error: message }, 500);
}

export function parseJsonSafe<T>(raw: string): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    // strip markdown fences if present
    const cleaned = raw.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
    return JSON.parse(cleaned) as T;
  }
}
