import { createFileRoute } from "@tanstack/react-router";
import {
  callOpenAI,
  errorResponse,
  getApiKey,
  jsonResponse,
  parseJsonSafe,
  type ChatMessage,
} from "@/lib/openai.server";

type RouteJson = {
  reply?: string;
  module?: "email" | "meeting" | "tasks" | "research" | null;
  prefill?: Record<string, string>;
};

export const Route = createFileRoute("/api/chat-route")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const apiKey = getApiKey(request);
          const { message = "", history = [] } = (await request.json()) ?? {};
          if (!String(message).trim()) {
            return jsonResponse({ error: "Empty message." }, 400);
          }
          const system =
            "You are the FlowState assistant. Decide whether the user wants to use one of four modules " +
            "and respond conversationally. Available modules: " +
            "'email' (Smart Email Generator — prefill { recipientRole, subject, context, tone }), " +
            "'meeting' (Meeting Notes Summarizer — prefill { notes }), " +
            "'tasks' (AI Task Planner — prefill { input }), " +
            "'research' (AI Research Assistant — prefill { text }). " +
            "Respond ONLY with valid JSON: " +
            `{ "reply": string, "module": "email"|"meeting"|"tasks"|"research"|null, "prefill": { [key: string]: string } }` +
            ' Use module=null for general chat. Keep reply under 60 words. Extract any concrete info from the message into prefill (e.g. subject, tone, task list).';
          const trimmedHistory: ChatMessage[] = (Array.isArray(history) ? history : [])
            .slice(-10)
            .map((m: { role: string; text: string }) => ({
              role: m.role === "user" ? "user" : "assistant",
              content: String(m.text ?? ""),
            }));
          const raw = await callOpenAI({
            apiKey,
            json: true,
            temperature: 0.5,
            messages: [
              { role: "system", content: system },
              ...trimmedHistory,
              { role: "user", content: String(message) },
            ],
          });
          const data = parseJsonSafe<RouteJson>(raw);
          return jsonResponse({
            reply: data.reply ?? "",
            module: data.module ?? null,
            prefill: data.prefill && typeof data.prefill === "object" ? data.prefill : {},
          });
        } catch (err) {
          return errorResponse(err);
        }
      },
    },
  },
});
