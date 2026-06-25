import { createFileRoute } from "@tanstack/react-router";
import {
  callOpenAI,
  errorResponse,
  getApiKey,
  jsonResponse,
  parseJsonSafe,
} from "@/lib/openai.server";

type ResearchJson = {
  tldr?: string;
  key_claims?: { text?: string; strength?: "strong" | "moderate" | "weak"; counter_argument?: string }[];
  evidence_quality?: string;
  bias_flags?: string[];
  recommendations?: string[];
};

export const Route = createFileRoute("/api/analyze-research")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const apiKey = getApiKey(request);
          const { text = "", skeptic = false } = (await request.json()) ?? {};
          if (!String(text).trim()) {
            return jsonResponse({ error: "Paste article text or a URL." }, 400);
          }
          const system =
            "You are a critical research analyst. Read the user's article/text and produce a structured analysis. " +
            "Respond ONLY with valid JSON matching this schema: " +
            `{
  "tldr": string (2-3 sentences),
  "key_claims": [{ "text": string, "strength": "strong"|"moderate"|"weak"${
    skeptic ? ', "counter_argument": string' : ""
  } }],
  "evidence_quality": string (1-2 sentences),
  "bias_flags": [string],
  "recommendations": [string]
}` +
            (skeptic
              ? " SKEPTIC MODE is ON: for every claim provide a substantive counter_argument or methodological critique. Be rigorous, not contrarian."
              : " Be balanced and fair.") +
            " Base everything strictly on the provided text — do not invent facts.";
          const raw = await callOpenAI({
            apiKey,
            json: true,
            temperature: 0.3,
            messages: [
              { role: "system", content: system },
              { role: "user", content: `Source:\n${text}` },
            ],
          });
          const data = parseJsonSafe<ResearchJson>(raw);
          return jsonResponse({
            tldr: data.tldr ?? "",
            key_claims: Array.isArray(data.key_claims) ? data.key_claims : [],
            evidence_quality: data.evidence_quality ?? "",
            bias_flags: Array.isArray(data.bias_flags) ? data.bias_flags : [],
            recommendations: Array.isArray(data.recommendations) ? data.recommendations : [],
          });
        } catch (err) {
          return errorResponse(err);
        }
      },
    },
  },
});
