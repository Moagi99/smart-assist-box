import { useState } from "react";
import { DisclaimerBanner, SectionShell, SkeletonLines, EmptyState } from "../shared";
import { FileText, Download, Mail, Sparkles, RotateCcw, Info } from "lucide-react";
import { toast } from "sonner";

type ActionItem = { id: string; text: string; owner: string; due: string; done: boolean; confidence: number };
type Decision = { id: string; text: string; confidence: number };
type Result = { summary: string; actions: ActionItem[]; decisions: Decision[] };

const SAMPLE_NOTES = `Team standup - Sept 23
Attendees: Maya (PM), Tom (Eng), Priya (Design), Alex (Marketing)

- Maya kicked off: Q3 launch slipped 2 weeks. Need to lock scope by Friday.
- Tom: API rate limiter is done. Still blocked on auth migration; needs Priya's input on the consent screen by Wed.
- Priya: Will deliver auth screens Wed EOD. Pushing back on the dark mode toggle - says it's out of scope.
- Alex: Press embargo lifts Oct 5. Needs final feature list from Tom by Oct 1.
- Decision: We're cutting dark mode from launch. Will revisit Q4.
- Decision: Marketing gets feature list by Oct 1, no exceptions.
- Action: Tom to send Priya auth wireframes today.
- Maya to update roadmap doc by Thursday.`;

function summarize(notes: string): Result {
  // Placeholder. Real model call would go here.
  const lines = notes.split("\n").map((l) => l.trim()).filter(Boolean);
  const actionLines = lines.filter((l) => /action|will|todo|need(s)?\s|by\s+\w/i.test(l));
  const decisionLines = lines.filter((l) => /^decision/i.test(l));
  return {
    summary:
      "The team reviewed Q3 launch slippage and agreed to lock scope by Friday. Engineering is blocked on auth migration pending design input. Marketing needs a finalized feature list before the Oct 5 press embargo. Dark mode was cut from launch to protect timeline.",
    actions: actionLines.slice(0, 5).map((l, i) => ({
      id: `a${i}`,
      text: l.replace(/^[-•]\s*/, "").replace(/^(Action:?\s*)/i, ""),
      owner: ["Tom", "Maya", "Priya", "Alex", "Team"][i % 5],
      due: ["Wed", "Thu", "Fri", "Oct 1", "Oct 5"][i % 5],
      done: false,
      confidence: 0.6 + (i % 4) * 0.1,
    })),
    decisions: decisionLines.length
      ? decisionLines.map((l, i) => ({
          id: `d${i}`,
          text: l.replace(/^decision:?\s*/i, ""),
          confidence: 0.75 + (i % 3) * 0.08,
        }))
      : [
          { id: "d0", text: "Cut dark mode from launch; revisit Q4.", confidence: 0.92 },
          { id: "d1", text: "Final feature list to marketing by Oct 1.", confidence: 0.88 },
        ],
  };
}

function ConfidenceBadge({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const color = pct >= 80 ? "text-success bg-success/10" : pct >= 60 ? "text-warning-foreground bg-warning/15" : "text-destructive bg-destructive/10";
  return (
    <span className={`group relative inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded ${color}`}>
      {pct}%
      <Info className="h-3 w-3 opacity-60" />
      <span className="pointer-events-none absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 w-52 rounded-md bg-foreground text-background text-[10px] leading-relaxed px-2 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-md">
        Confidence the model correctly extracted this item from your notes. Always verify before acting.
      </span>
    </span>
  );
}

export function MeetingSummarizer() {
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [tab, setTab] = useState<"summary" | "actions" | "decisions">("summary");

  const run = () => {
    if (!notes.trim()) {
      toast.error("Paste some notes first.");
      return;
    }
    setLoading(true);
    setResult(null);
    setTimeout(() => {
      setResult(summarize(notes));
      setLoading(false);
      toast.success("Notes summarized");
    }, 1100);
  };

  const toggleDone = (id: string) => {
    if (!result) return;
    setResult({
      ...result,
      actions: result.actions.map((a) => a.id === id ? { ...a, done: !a.done } : a),
    });
  };

  return (
    <div className="space-y-5">
      <DisclaimerBanner moduleId="meeting" />

      <SectionShell title="Raw notes" description="Paste meeting notes, transcript, or rough bullets.">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Paste your raw meeting notes or transcript here…"
          rows={8}
          className="w-full p-3 rounded-lg border border-input bg-surface text-sm focus:border-ring outline-none resize-y"
        />
        <div className="mt-4 flex flex-wrap gap-2">
          <button onClick={run} disabled={loading} className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-60">
            <Sparkles className="h-4 w-4" />
            {loading ? "Summarizing…" : "Summarize"}
          </button>
          <button onClick={() => setNotes(SAMPLE_NOTES)} className="inline-flex items-center h-10 px-4 rounded-lg border border-border text-sm font-medium hover:bg-muted">
            Load sample
          </button>
        </div>
      </SectionShell>

      <SectionShell
        title="Structured results"
        description="Review summary, action items, and decisions with confidence scores."
        action={result && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => { toast.success("PDF export queued (simulated)"); }}
              className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md text-xs border border-border hover:bg-muted"
            >
              <Download className="h-3.5 w-3.5" /> Export PDF
            </button>
            <button
              onClick={() => { toast.success("Summary email drafted"); }}
              className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md text-xs border border-border hover:bg-muted"
            >
              <Mail className="h-3.5 w-3.5" /> Email summary
            </button>
            <button onClick={run} className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md text-xs border border-border hover:bg-muted">
              <RotateCcw className="h-3.5 w-3.5" /> Regenerate
            </button>
          </div>
        )}
      >
        {loading ? (
          <SkeletonLines lines={6} />
        ) : !result ? (
          <EmptyState
            icon={FileText}
            title="Your structured summary will appear here"
            description="Drop raw notes above and we'll surface decisions, owners, and deadlines."
            sampleLabel="Try a sample"
            onSample={() => setNotes(SAMPLE_NOTES)}
          />
        ) : (
          <div>
            <div role="tablist" className="inline-flex p-1 rounded-lg bg-surface-muted mb-4">
              {([
                ["summary", "Executive summary"],
                ["actions", `Action items (${result.actions.length})`],
                ["decisions", `Key decisions (${result.decisions.length})`],
              ] as const).map(([id, label]) => (
                <button
                  key={id}
                  role="tab"
                  aria-selected={tab === id}
                  onClick={() => setTab(id)}
                  className={`px-3 h-8 rounded-md text-xs font-medium transition-colors ${tab === id ? "bg-surface text-foreground shadow-[var(--shadow-soft)]" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {label}
                </button>
              ))}
            </div>

            {tab === "summary" && (
              <textarea
                value={result.summary}
                onChange={(e) => setResult({ ...result, summary: e.target.value })}
                rows={6}
                className="w-full p-3 rounded-lg border border-input bg-surface text-sm leading-relaxed focus:border-ring outline-none"
              />
            )}

            {tab === "actions" && (
              <ul className="space-y-2">
                {result.actions.map((a) => (
                  <li key={a.id} className="flex items-start gap-3 p-3 rounded-lg border border-border bg-background">
                    <input
                      type="checkbox"
                      checked={a.done}
                      onChange={() => toggleDone(a.id)}
                      className="mt-1 h-4 w-4 rounded border-input accent-[var(--color-primary)]"
                      aria-label={`Mark ${a.text} as done`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm ${a.done ? "line-through text-muted-foreground" : "text-foreground"}`}>{a.text}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-primary" />{a.owner}</span>
                        <span>·</span>
                        <span>Due {a.due}</span>
                        <ConfidenceBadge score={a.confidence} />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {tab === "decisions" && (
              <ul className="space-y-2">
                {result.decisions.map((d) => (
                  <li key={d.id} className="flex items-start gap-3 p-3 rounded-lg border border-border bg-background">
                    <div className="min-w-0 flex-1 text-sm">{d.text}</div>
                    <ConfidenceBadge score={d.confidence} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </SectionShell>
    </div>
  );
}
