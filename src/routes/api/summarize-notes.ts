import { createFileRoute } from "@tanstack/react-router";
import {
  callOpenAI,
  errorResponse,
  getApiKey,
  jsonResponse,
  parseJsonSafe,
} from "@/lib/openai.server";

type SummaryJson = {
  summary?: string;
  action_items?: { task?: string; owner?: string; deadline?: string; confidence?: number }[];
  decisions?: { text?: string; confidence?: number }[];
  follow_up?: string[];
};

export const Route = createFileRoute("/api/summarize-notes")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const apiKey = getApiKey(request);
          const { notes = "" } = (await request.json()) ?? {};
          if (!String(notes).trim()) {
            return jsonResponse({ error: "Please paste meeting notes." }, 400);
          }
          const system =
            "You are a meeting analyst. Extract structured insights from raw notes. " +
            "Respond ONLY with valid JSON matching this schema: " +
            `{
  "summary": string (2-4 sentences executive summary),
  "action_items": [{ "task": string, "owner": string, "deadline": string, "confidence": number 0-1 }],
  "decisions": [{ "text": string, "confidence": number 0-1 }],
  "follow_up": [string]
}` +
            ' Confidence MUST reflect your actual certainty that the item was clearly stated in the notes (1.0 = explicit, 0.5 = ambiguous, <0.4 = inferred). Use "Unassigned" or "TBD" when missing — never fabricate.';
          const raw = await callOpenAI({
            apiKey,
            json: true,
            temperature: 0.2,
            messages: [
              { role: "system", content: system },
              { role: "user", content: `Meeting notes:\n${notes}` },
            ],
          });
          const data = parseJsonSafe<SummaryJson>(raw);
          return jsonResponse({
            summary: data.summary ?? "",
            action_items: Array.isArray(data.action_items) ? data.action_items : [],
            decisions: Array.isArray(data.decisions) ? data.decisions : [],
            follow_up: Array.isArray(data.follow_up) ? data.follow_up : [],
          });
        } catch (err) {
          return errorResponse(err);
        }
      },
    },
  },
});
