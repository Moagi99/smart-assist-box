// Centralized API client for FlowState.
// All AI features hit these endpoints — no mocks, no setTimeout.
// The user's OpenAI API key is read from localStorage and sent as
// the X-OpenAI-Key request header on every call.

const KEY_STORAGE = "flowstate.openaiKey";
const DEFAULT_TIMEOUT = 45_000;

export class ApiError extends Error {
  status: number;
  isMissingKey: boolean;
  constructor(message: string, status = 500) {
    super(message);
    this.status = status;
    this.isMissingKey = status === 401;
  }
}

export function getStoredApiKey(): string {
  if (typeof window === "undefined") return "";
  try {
    return localStorage.getItem(KEY_STORAGE) ?? "";
  } catch {
    return "";
  }
}

export function setStoredApiKey(key: string) {
  try {
    if (key) localStorage.setItem(KEY_STORAGE, key);
    else localStorage.removeItem(KEY_STORAGE);
  } catch {}
}

async function postJson<T>(path: string, body: unknown, timeoutMs = DEFAULT_TIMEOUT): Promise<T> {
  const apiKey = getStoredApiKey();
  if (!apiKey) {
    throw new ApiError(
      "Add your OpenAI API key in Settings to use AI features.",
      401,
    );
  }
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(path, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-OpenAI-Key": apiKey,
      },
      body: JSON.stringify(body ?? {}),
      signal: ctrl.signal,
    });
    const text = await res.text();
    let data: unknown = null;
    try { data = text ? JSON.parse(text) : null; } catch {}
    if (!res.ok) {
      const message =
        (data && typeof data === "object" && "error" in data && typeof (data as any).error === "string"
          ? (data as any).error
          : `Request failed (${res.status})`);
      throw new ApiError(message, res.status);
    }
    return data as T;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if ((err as { name?: string })?.name === "AbortError") {
      throw new ApiError("The AI request timed out. Please try again.", 504);
    }
    throw new ApiError(
      err instanceof Error ? err.message : "Network error contacting the AI service.",
    );
  } finally {
    clearTimeout(timer);
  }
}

// ─── Types ──────────────────────────────────────────────────────────────────

export type EmailRequest = {
  recipientRole: string;
  subject: string;
  context: string;
  tone: "Formal" | "Friendly" | "Persuasive" | "Diplomatic";
};
export type EmailResponse = { email: string };

export type SummarizeRequest = { notes: string };
export type ActionItem = { task: string; owner: string; deadline: string; confidence: number };
export type Decision = { text: string; confidence: number };
export type SummarizeResponse = {
  summary: string;
  action_items: ActionItem[];
  decisions: Decision[];
  follow_up: string[];
};

export type PlanRequest = { input: string; constraints?: string };
export type PlanTask = { title: string; hours: number; priority: "High" | "Medium" | "Low" };
export type PlanDay = { day: string; tasks: PlanTask[]; total_hours: number };
export type PlanResponse = { schedule: PlanDay[]; warnings: string[] };

export type ResearchRequest = { text: string; skeptic: boolean };
export type ResearchClaim = {
  text: string;
  strength: "strong" | "moderate" | "weak";
  counter_argument?: string;
};
export type ResearchResponse = {
  tldr: string;
  key_claims: ResearchClaim[];
  evidence_quality: string;
  bias_flags: string[];
  recommendations: string[];
};

export type ChatTurn = { role: "user" | "assistant"; text: string };
export type ChatRouteRequest = { message: string; history: ChatTurn[] };
export type ChatRouteResponse = {
  reply: string;
  module: "email" | "meeting" | "tasks" | "research" | null;
  prefill: Record<string, string>;
};

// ─── Calls ──────────────────────────────────────────────────────────────────

export const aiClient = {
  generateEmail: (body: EmailRequest) =>
    postJson<EmailResponse>("/api/generate-email", body),
  summarizeNotes: (body: SummarizeRequest) =>
    postJson<SummarizeResponse>("/api/summarize-notes", body),
  planTasks: (body: PlanRequest) =>
    postJson<PlanResponse>("/api/plan-tasks", body),
  analyzeResearch: (body: ResearchRequest) =>
    postJson<ResearchResponse>("/api/analyze-research", body),
  chatRoute: (body: ChatRouteRequest) =>
    postJson<ChatRouteResponse>("/api/chat-route", body),
};
