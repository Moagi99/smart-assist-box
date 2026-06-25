import { useEffect, useMemo, useState, type DragEvent } from "react";
import { useApp } from "../state";
import { DisclaimerBanner, SectionShell, SkeletonLines, EmptyState } from "../shared";
import { CalendarDays, Sparkles, RotateCcw, AlertTriangle, Focus, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { aiClient, ApiError, type PlanResponse } from "@/lib/aiClient";

type Priority = "High" | "Medium" | "Low";
type Task = { id: string; title: string; day: number; hours: number; priority: Priority };

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const DAY_INDEX: Record<string, number> = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4 };

function flatten(plan: PlanResponse): Task[] {
  const out: Task[] = [];
  plan.schedule.forEach((d, di) => {
    const day = DAY_INDEX[d.day] ?? di % 5;
    (d.tasks ?? []).forEach((t, ti) => {
      out.push({
        id: `${day}-${ti}-${Math.random().toString(36).slice(2, 6)}`,
        title: t.title ?? "Untitled",
        day,
        hours: Number.isFinite(t.hours) ? Number(t.hours) : 1,
        priority: (t.priority as Priority) ?? "Medium",
      });
    });
  });
  return out;
}

function PriorityBadge({ p }: { p: Priority }) {
  const color =
    p === "High"
      ? "bg-destructive/10 text-destructive"
      : p === "Medium"
      ? "bg-warning/15 text-warning-foreground"
      : "bg-muted text-muted-foreground";
  return (
    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${color}`}>{p}</span>
  );
}

export function TaskPlanner() {
  const { focusMode, setFocusMode, taskPrefill, setTaskPrefill, setSettingsOpen } = useApp();
  const [input, setInput] = useState("");
  const [constraints, setConstraints] = useState("");
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [dragId, setDragId] = useState<string | null>(null);

  useEffect(() => {
    if (taskPrefill?.input) {
      setInput(taskPrefill.input);
      setTaskPrefill(null);
    }
  }, [taskPrefill, setTaskPrefill]);

  const dayTotals = useMemo(() => {
    const t = Array(5).fill(0);
    tasks?.forEach((task) => { t[task.day] += task.hours; });
    return t;
  }, [tasks]);

  const run = async () => {
    if (!input.trim()) { toast.error("Describe what you need to do."); return; }
    setLoading(true);
    setTasks(null);
    setWarnings([]);
    try {
      const plan = await aiClient.planTasks({ input, constraints });
      setTasks(flatten(plan));
      setWarnings(plan.warnings ?? []);
      toast.success("Schedule generated");
    } catch (err) {
      const e = err as ApiError;
      toast.error(e.message);
      if (e.isMissingKey) setSettingsOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const onDrop = (e: DragEvent, day: number) => {
    e.preventDefault();
    if (!dragId || !tasks) return;
    setTasks(tasks.map((t) => t.id === dragId ? { ...t, day } : t));
    setDragId(null);
  };

  return (
    <div className="space-y-5">
      <DisclaimerBanner moduleId="tasks" />

      <SectionShell title="What's on your plate?" description="Describe tasks in plain language. Example: 'Finish Q3 report, call client, review resumes by Friday.'">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Finish Q3 report, call client, review resumes by Friday…"
          rows={3}
          className="w-full p-3 rounded-lg border border-input bg-surface text-sm focus:border-ring outline-none resize-y"
        />
        <input
          value={constraints}
          onChange={(e) => setConstraints(e.target.value)}
          placeholder="Optional constraints — e.g. 'no meetings Thu, max 6h/day'"
          className="mt-2 w-full h-10 px-3 rounded-lg border border-input bg-surface text-sm focus:border-ring outline-none"
        />
        <div className="mt-4 flex flex-wrap gap-2">
          <button onClick={run} disabled={loading} className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-60">
            <Sparkles className="h-4 w-4" /> {loading ? "Planning…" : "Plan my week"}
          </button>
          <button onClick={() => setInput("Finish Q3 report, call client, review resumes by Friday, prep Monday board deck, 1:1 with Sam")} className="inline-flex items-center h-10 px-4 rounded-lg border border-border text-sm font-medium hover:bg-muted">
            Load sample
          </button>
          <button
            onClick={() => setFocusMode(!focusMode)}
            className={`ml-auto inline-flex items-center gap-2 h-10 px-3 rounded-lg border text-sm font-medium ${focusMode ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted"}`}
          >
            <Focus className="h-4 w-4" /> Focus mode
          </button>
        </div>
      </SectionShell>

      <SectionShell
        title="Your week"
        description="Drag blocks between days. Daily total turns red over 8h."
        action={tasks && (
          <button onClick={run} className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md text-xs border border-border hover:bg-muted">
            <RotateCcw className="h-3.5 w-3.5" /> Regenerate
          </button>
        )}
      >
        {loading ? (
          <SkeletonLines lines={5} />
        ) : !tasks ? (
          <EmptyState
            icon={CalendarDays}
            title="Your weekly schedule will appear here"
            description="Tell us what you need to do — we'll prioritize and slot it into your week."
            sampleLabel="Try a sample"
            onSample={() => setInput("Finish Q3 report, call client, review resumes by Friday")}
          />
        ) : (
          <>
            {warnings.length > 0 && (
              <div className="mb-3 space-y-1.5">
                {warnings.map((w, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-destructive bg-destructive/10 rounded-md px-3 py-2">
                    <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    <span>{w}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {DAYS.map((day, di) => {
                const overload = dayTotals[di] > 8;
                return (
                  <div
                    key={day}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => onDrop(e, di)}
                    className="rounded-xl border border-border bg-background min-h-[200px] flex flex-col"
                  >
                    <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                      <span className="text-xs font-semibold">{day}</span>
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${overload ? "bg-destructive/10 text-destructive" : "text-muted-foreground"}`}>
                        {dayTotals[di]}h
                      </span>
                    </div>
                    {overload && (
                      <div className="mx-2 mt-2 flex items-start gap-1.5 text-[10px] text-destructive bg-destructive/10 rounded-md px-2 py-1.5">
                        <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
                        <span>Overloaded — consider moving a task.</span>
                      </div>
                    )}
                    <div className="p-2 space-y-1.5 flex-1">
                      {tasks.filter((t) => t.day === di).map((t) => (
                        <div
                          key={t.id}
                          draggable
                          onDragStart={() => setDragId(t.id)}
                          className="group flex items-start gap-1.5 p-2 rounded-lg bg-primary-soft/60 border border-primary/15 cursor-grab active:cursor-grabbing"
                        >
                          <GripVertical className="h-3.5 w-3.5 text-muted-foreground mt-0.5 opacity-0 group-hover:opacity-100" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium leading-snug">{t.title}</p>
                            <div className="mt-1 flex items-center gap-1.5">
                              <PriorityBadge p={t.priority} />
                              <span className="text-[10px] text-muted-foreground">{t.hours}h</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </SectionShell>
    </div>
  );
}
