import { useEffect, useState } from "react";
import { SectionShell } from "../shared";
import { getAnalytics, type AnalyticsSummary } from "@/lib/analytics";
import { BarChart3, Clock, Gauge } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export function Analytics() {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  useEffect(() => { setData(getAnalytics()); }, []);

  if (!data) return null;
  const empty = data.totalRuns === 0;

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat icon={BarChart3} label="Runs this week" value={data.totalRuns.toString()} />
        <Stat icon={Clock} label="Estimated time saved" value={formatMinutes(data.minutesSaved)} />
        <Stat
          icon={Gauge}
          label="Avg meeting confidence"
          value={data.avgConfidence == null ? "—" : `${Math.round(data.avgConfidence * 100)}%`}
        />
      </div>

      <SectionShell title="Weekly activity" description="Module runs over the last 7 days.">
        {empty ? (
          <div className="text-center py-10 text-sm text-muted-foreground">
            Start using FlowState to see insights.
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.weeklyByDay} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="count" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </SectionShell>

      <SectionShell title="By module" description="Where you've been spending your AI time.">
        {empty ? (
          <p className="text-sm text-muted-foreground">No usage yet.</p>
        ) : (
          <ul className="space-y-2">
            {data.byModule.map((m) => {
              const max = Math.max(...data.byModule.map((b) => b.count), 1);
              const pct = (m.count / max) * 100;
              return (
                <li key={m.module} className="flex items-center gap-3">
                  <span className="w-20 text-sm">{m.label}</span>
                  <div className="flex-1 h-2 rounded-full bg-surface-muted overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-[width] duration-500" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-8 text-right text-xs text-muted-foreground tabular-nums">{m.count}</span>
                </li>
              );
            })}
          </ul>
        )}
      </SectionShell>
    </div>
  );
}

function formatMinutes(min: number) {
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

function Stat({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}
