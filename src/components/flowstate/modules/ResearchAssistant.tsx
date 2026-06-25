import { useEffect, useState } from "react";
import { useApp } from "../state";
import { DisclaimerBanner, SectionShell, SkeletonLines, EmptyState } from "../shared";
import { Search, Sparkles, RotateCcw, ShieldCheck, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { aiClient, ApiError, type ResearchResponse } from "@/lib/aiClient";

const STRENGTH_STYLE = {
  strong: "bg-success/10 text-success",
  moderate: "bg-warning/15 text-warning-foreground",
  weak: "bg-destructive/10 text-destructive",
} as const;

export function ResearchAssistant() {
  const { researchPrefill, setResearchPrefill, setSettingsOpen } = useApp();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResearchResponse | null>(null);
  const [skeptic, setSkeptic] = useState(false);

  useEffect(() => {
    if (researchPrefill?.text) {
      setText(researchPrefill.text);
      setResearchPrefill(null);
    }
  }, [researchPrefill, setResearchPrefill]);

  const run = async () => {
    if (!text.trim()) { toast.error("Paste an article or URL first."); return; }
    setLoading(true);
    setResult(null);
    try {
      const data = await aiClient.analyzeResearch({ text, skeptic });
      setResult(data);
      toast.success("Analysis ready");
    } catch (err) {
      const e = err as ApiError;
      toast.error(e.message);
      if (e.isMissingKey) setSettingsOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <DisclaimerBanner moduleId="research" />

      <SectionShell title="Source" description="Paste article text or a URL.">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste article text or URL…"
          rows={6}
          className="w-full p-3 rounded-lg border border-input bg-surface text-sm focus:border-ring outline-none resize-y"
        />
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button onClick={run} disabled={loading} className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-60">
            <Sparkles className="h-4 w-4" /> {loading ? "Analyzing…" : "Analyze"}
          </button>
          <label className="ml-auto inline-flex items-center gap-2 text-sm cursor-pointer">
            <span className="text-muted-foreground">Skeptic mode</span>
            <button
              role="switch"
              aria-checked={skeptic}
              onClick={() => setSkeptic(!skeptic)}
              className={`relative h-5 w-9 rounded-full transition-colors ${skeptic ? "bg-primary" : "bg-muted"}`}
            >
              <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-surface shadow-[var(--shadow-soft)] transition-transform ${skeptic ? "translate-x-4" : "translate-x-0.5"}`} />
            </button>
          </label>
        </div>
        <p className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 mt-0.5 text-success shrink-0" />
          Always verify sources independently. AI summaries can miss nuance or cite outdated information.
        </p>
      </SectionShell>

      <SectionShell
        title="Analysis"
        description="Structured breakdown with bias flags and practical recommendations."
        action={result && (
          <button onClick={run} className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md text-xs border border-border hover:bg-muted">
            <RotateCcw className="h-3.5 w-3.5" /> Regenerate
          </button>
        )}
      >
        {loading ? (
          <SkeletonLines lines={8} />
        ) : !result ? (
          <EmptyState
            icon={Search}
            title="Your analysis will appear here"
            description="We'll surface key claims, evidence quality, and bias flags."
          />
        ) : (
          <div className="space-y-5">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">TL;DR</h3>
              <p className="text-sm leading-relaxed">{result.tldr}</p>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Key claims</h3>
              <ul className="space-y-2">
                {result.key_claims.map((c, i) => (
                  <li key={i} className="p-3 rounded-lg border border-border bg-background">
                    <div className="flex items-start gap-2">
                      <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${STRENGTH_STYLE[c.strength] ?? STRENGTH_STYLE.moderate}`}>{c.strength}</span>
                      <p className="text-sm flex-1">{c.text}</p>
                    </div>
                    {skeptic && c.counter_argument && (
                      <div className="mt-2 ml-1 flex items-start gap-1.5 text-xs text-muted-foreground border-l-2 border-destructive/40 pl-3">
                        <AlertTriangle className="h-3 w-3 mt-0.5 text-destructive shrink-0" />
                        <span><span className="font-medium text-foreground">Counter:</span> {c.counter_argument}</span>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Evidence quality</h3>
                <p className="text-sm leading-relaxed">{result.evidence_quality}</p>
              </div>
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Bias flags</h3>
                <ul className="space-y-1.5">
                  {result.bias_flags.map((b, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-warning shrink-0" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Practical recommendations</h3>
              <ul className="space-y-1.5">
                {result.recommendations.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="mt-0.5 text-primary font-semibold">{i + 1}.</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </SectionShell>
    </div>
  );
}
