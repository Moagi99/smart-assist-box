import { useEffect, useState } from "react";
import { useApp } from "../state";
import { DisclaimerBanner, SectionShell, SkeletonLines, EmptyState } from "../shared";
import { Mail, Copy, RotateCcw, Undo2, Sparkles, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

type Tone = "Formal" | "Friendly" | "Persuasive" | "Diplomatic";
const TONES: Tone[] = ["Formal", "Friendly", "Persuasive", "Diplomatic"];

const SAMPLE = {
  recipientRole: "Engineering Manager",
  subject: "Proposal: Q4 platform reliability initiative",
  context: "- We had 3 incidents in Q3\n- Propose dedicated reliability squad for Q4\n- Need 2 engineers + 1 SRE\n- ROI: 40% fewer incidents projected",
  tone: "Persuasive" as Tone,
};

function generateEmail(input: { recipientRole: string; subject: string; context: string; tone: Tone }) {
  // Placeholder simulation. Real API call would go here.
  const greeting = input.tone === "Friendly" ? "Hi there," : input.tone === "Formal" ? "Dear Colleague," : "Hello,";
  const closing = input.tone === "Friendly" ? "Cheers," : input.tone === "Formal" ? "Sincerely," : "Best regards,";
  const bullets = input.context.split("\n").filter(Boolean).map((l) => l.replace(/^[-*•]\s*/, "")).filter(Boolean);
  const intro =
    input.tone === "Persuasive"
      ? `I'd like to share a focused proposal regarding ${input.subject.toLowerCase()}.`
      : input.tone === "Diplomatic"
      ? `I wanted to gather your perspective on ${input.subject.toLowerCase()} before we move forward.`
      : `I'm writing to ${input.recipientRole ? `you as ${input.recipientRole.toLowerCase()} ` : ""}about ${input.subject.toLowerCase()}.`;
  const body = bullets.length
    ? `\n\nHere are the key points:\n${bullets.map((b) => `• ${b}`).join("\n")}`
    : "";
  const cta =
    input.tone === "Persuasive"
      ? "\n\nCould we set up 20 minutes this week to align on next steps?"
      : "\n\nLet me know what you think when you have a moment.";
  return `${greeting}\n\n${intro}${body}${cta}\n\n${closing}\nYour Name`;
}

export function EmailGenerator() {
  const { emailPrefill, setEmailPrefill } = useApp();
  const [recipientRole, setRecipientRole] = useState("");
  const [subject, setSubject] = useState("");
  const [context, setContext] = useState("");
  const [tone, setTone] = useState<Tone>("Formal");
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState("");
  const [original, setOriginal] = useState("");
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    if (emailPrefill) {
      if (emailPrefill.recipientRole) setRecipientRole(emailPrefill.recipientRole);
      if (emailPrefill.subject) setSubject(emailPrefill.subject);
      if (emailPrefill.context) setContext(emailPrefill.context);
      if (emailPrefill.tone) setTone(emailPrefill.tone);
      setEmailPrefill(null);
    }
  }, [emailPrefill, setEmailPrefill]);

  const handleGenerate = () => {
    if (!subject && !context) {
      toast.error("Add a subject or some context first.");
      return;
    }
    setLoading(true);
    setOutput("");
    // Simulate AI call
    setTimeout(() => {
      const result = generateEmail({ recipientRole, subject, context, tone });
      setOutput(result);
      setOriginal(result);
      setLoading(false);
      toast.success("Email drafted");
    }, 900);
  };

  const loadSample = () => {
    setRecipientRole(SAMPLE.recipientRole);
    setSubject(SAMPLE.subject);
    setContext(SAMPLE.context);
    setTone(SAMPLE.tone);
  };

  const copy = async () => {
    await navigator.clipboard.writeText(output);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="space-y-5">
      <DisclaimerBanner moduleId="email" />

      <SectionShell title="Compose" description="Describe the recipient and what you want to say.">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Recipient role</label>
            <input
              value={recipientRole}
              onChange={(e) => setRecipientRole(e.target.value)}
              placeholder="e.g. VP of Sales"
              className="w-full h-10 px-3 rounded-lg border border-input bg-surface text-sm focus:border-ring outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Subject</label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="What's this about?"
              className="w-full h-10 px-3 rounded-lg border border-input bg-surface text-sm focus:border-ring outline-none"
            />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-medium text-muted-foreground">Context / bullet points</label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="- Key point one&#10;- Key point two"
              rows={5}
              className="w-full p-3 rounded-lg border border-input bg-surface text-sm focus:border-ring outline-none resize-y"
            />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-medium text-muted-foreground">Tone</label>
            <div className="flex flex-wrap gap-2">
              {TONES.map((t) => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className={`h-9 px-3 rounded-lg text-sm font-medium border transition-colors ${
                    tone === t
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-surface border-border text-foreground hover:bg-muted"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-60"
          >
            <Sparkles className="h-4 w-4" />
            {loading ? "Generating…" : "Generate email"}
          </button>
          <button
            onClick={loadSample}
            className="inline-flex items-center h-10 px-4 rounded-lg border border-border text-sm font-medium hover:bg-muted"
          >
            Load sample
          </button>
        </div>
      </SectionShell>

      <SectionShell
        title="Draft"
        description="Edit inline — your changes stay until you regenerate."
        action={
          output && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPreview((v) => !v)}
                className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md text-xs border border-border hover:bg-muted"
              >
                {preview ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                Send preview
              </button>
              <button
                onClick={copy}
                className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md text-xs border border-border hover:bg-muted"
              >
                <Copy className="h-3.5 w-3.5" />
                Copy
              </button>
              <button
                onClick={handleGenerate}
                className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md text-xs border border-border hover:bg-muted"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Regenerate
              </button>
              {output !== original && (
                <button
                  onClick={() => { setOutput(original); toast("Reverted to original"); }}
                  className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md text-xs border border-border hover:bg-muted"
                >
                  <Undo2 className="h-3.5 w-3.5" />
                  Revert
                </button>
              )}
            </div>
          )
        }
      >
        {loading ? (
          <SkeletonLines lines={6} />
        ) : !output ? (
          <EmptyState
            icon={Mail}
            title="Your draft will appear here"
            description="Fill in the form above and we'll generate a tone-appropriate email."
            sampleLabel="Try a sample"
            onSample={loadSample}
          />
        ) : preview ? (
          <div className="rounded-xl border border-border bg-background overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-surface-muted">
              <p className="text-xs text-muted-foreground">To: <span className="text-foreground">{recipientRole || "recipient"}@company.com</span></p>
              <p className="text-xs text-muted-foreground">Subject: <span className="text-foreground font-medium">{subject || "(no subject)"}</span></p>
            </div>
            <pre className="whitespace-pre-wrap font-sans text-sm p-4 leading-relaxed">{output}</pre>
          </div>
        ) : (
          <textarea
            value={output}
            onChange={(e) => setOutput(e.target.value)}
            rows={14}
            className="w-full p-3 rounded-lg border border-input bg-surface text-sm font-sans leading-relaxed resize-y focus:border-ring outline-none"
          />
        )}
      </SectionShell>
    </div>
  );
}
