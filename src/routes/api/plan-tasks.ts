import { createFileRoute } from "@tanstack/react-router";
import {
  callOpenAI,
  errorResponse,
  getApiKey,
  jsonResponse,
  parseJsonSafe,
} from "@/lib/openai.server";

type PlanJson = {
  schedule?: {
    day?: string;
    tasks?: { title?: string; hours?: number; priority?: "High" | "Medium" | "Low" }[];
    total_hours?: number;
  }[];
  warnings?: string[];
};

export const Route = createFileRoute("/api/plan-tasks")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const apiKey = getApiKey(request);
          const { input = "", constraints = "" } = (await request.json()) ?? {};
          if (!String(input).trim()) {
            return jsonResponse({ error: "Describe the tasks you need to plan." }, 400);
          }
          const system =
            "You are an executive scheduler. Convert the user's natural-language task list " +
            "into a realistic Monday-to-Friday plan. Respect explicit deadlines and urgency cues. " +
            "Respond ONLY with valid JSON matching this schema: " +
            `{
  "schedule": [
    { "day": "Mon"|"Tue"|"Wed"|"Thu"|"Fri",
      "tasks": [{ "title": string, "hours": number, "priority": "High"|"Medium"|"Low" }],
      "total_hours": number }
  ],
  "warnings": [string]
}` +
            " Always include all five weekdays even if some are empty. " +
            "Add a warning for any day exceeding 8 total hours. " +
            "Keep task hours realistic (0.5 – 4h per block).";
          const userMsg = `Tasks:\n${input}\n\nConstraints:\n${constraints || "(none)"}`;
          const raw = await callOpenAI({
            apiKey,
            json: true,
            temperature: 0.4,
            messages: [
              { role: "system", content: system },
              { role: "user", content: userMsg },
            ],
          });
          const data = parseJsonSafe<PlanJson>(raw);
          return jsonResponse({
            schedule: Array.isArray(data.schedule) ? data.schedule : [],
            warnings: Array.isArray(data.warnings) ? data.warnings : [],
          });
        } catch (err) {
          return errorResponse(err);
        }
      },
    },
  },
});
