import { createFileRoute } from "@tanstack/react-router";
import { callOpenAI, errorResponse, getApiKey, jsonResponse } from "@/lib/openai.server";

export const Route = createFileRoute("/api/generate-email")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const apiKey = getApiKey(request);
          const body = await request.json();
          const { recipientRole = "", subject = "", context = "", tone = "Formal" } = body ?? {};
          if (!String(context).trim() && !String(subject).trim()) {
            return jsonResponse({ error: "Please provide a subject or some context." }, 400);
          }
          const system =
            "You are an executive communications assistant. Draft concise, professional emails. " +
            "Match the requested tone exactly. Return only the email body — no preamble, no markdown, " +
            "no subject line. Use short paragraphs and a clear sign-off.";
          const user = [
            `Recipient role: ${recipientRole || "colleague"}`,
            `Subject: ${subject || "(unspecified)"}`,
            `Tone: ${tone}`,
            `Context / bullet points:\n${context || "(none)"}`,
          ].join("\n");
          const content = await callOpenAI({
            apiKey,
            temperature: 0.6,
            messages: [
              { role: "system", content: system },
              { role: "user", content: user },
            ],
          });
          return jsonResponse({ email: content.trim() });
        } catch (err) {
          return errorResponse(err);
        }
      },
    },
  },
});
