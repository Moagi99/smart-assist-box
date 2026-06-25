// Local-only analytics tracker — counts module usage and aggregates time saved.
// Persisted in localStorage. No network, no PII.

const KEY = "flowstate.analytics.v1";

export type ModuleEvent = "email" | "meeting" | "tasks" | "research" | "chat";

type UseEvent = {
  date: string; // YYYY-MM-DD
  module: ModuleEvent;
};

type ConfRecord = { date: string; score: number };

type Store = {
  events: UseEvent[];
  confidences: ConfRecord[];
};

function load(): Store {
  if (typeof window === "undefined") return { events: [], confidences: [] };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { events: [], confidences: [] };
    const parsed = JSON.parse(raw);
    return { events: parsed.events ?? [], confidences: parsed.confidences ?? [] };
  } catch { return { events: [], confidences: [] }; }
}

function save(s: Store) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {}
}

function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function trackUse(module: ModuleEvent) {
  const s = load();
  s.events.push({ date: today(), module });
  // cap history
  if (s.events.length > 1000) s.events = s.events.slice(-1000);
  save(s);
}

export function trackConfidence(scores: number[]) {
  if (!scores.length) return;
  const s = load();
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  s.confidences.push({ date: today(), score: avg });
  if (s.confidences.length > 500) s.confidences = s.confidences.slice(-500);
  save(s);
}

// Estimated minutes saved per module run (conservative).
const TIME_SAVED: Record<ModuleEvent, number> = {
  email: 8, meeting: 15, tasks: 10, research: 20, chat: 2,
};

export type AnalyticsSummary = {
  totalRuns: number;
  byModule: { module: ModuleEvent; count: number; label: string }[];
  weeklyByDay: { day: string; count: number }[];
  minutesSaved: number;
  avgConfidence: number | null;
};

const LABELS: Record<ModuleEvent, string> = {
  email: "Email", meeting: "Meeting", tasks: "Tasks", research: "Research", chat: "Chat",
};

export function getAnalytics(): AnalyticsSummary {
  const { events, confidences } = load();

  // Past 7 days window
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - 6);
  const inWindow = events.filter((e) => new Date(e.date + "T00:00:00") >= new Date(start.toDateString()));

  const byModule: AnalyticsSummary["byModule"] = (["email", "meeting", "tasks", "research", "chat"] as ModuleEvent[])
    .map((m) => ({ module: m, label: LABELS[m], count: inWindow.filter((e) => e.module === m).length }));

  const weeklyByDay: AnalyticsSummary["weeklyByDay"] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const label = d.toLocaleDateString(undefined, { weekday: "short" });
    weeklyByDay.push({ day: label, count: events.filter((e) => e.date === iso).length });
  }

  const minutesSaved = inWindow.reduce((sum, e) => sum + (TIME_SAVED[e.module] ?? 5), 0);
  const recentConf = confidences.slice(-20);
  const avgConfidence = recentConf.length
    ? recentConf.reduce((a, b) => a + b.score, 0) / recentConf.length
    : null;

  return { totalRuns: inWindow.length, byModule, weeklyByDay, minutesSaved, avgConfidence };
}
