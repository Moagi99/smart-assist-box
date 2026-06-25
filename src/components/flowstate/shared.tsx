import { useApp, type ModuleId } from "./state";
import { ShieldAlert, X } from "lucide-react";

export function DisclaimerBanner({ moduleId }: { moduleId: ModuleId }) {
  const { dismissedBanner, dismissBanner } = useApp();
  if (dismissedBanner[moduleId]) return null;
  return (
    <div
      role="note"
      className="flex items-start gap-3 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm"
    >
      <ShieldAlert className="h-4 w-4 mt-0.5 text-warning-foreground shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="font-medium text-foreground">Responsible AI notice</p>
        <p className="text-muted-foreground">AI assists, not replaces, human judgment. Review outputs before acting.</p>
      </div>
      <button
        onClick={() => dismissBanner(moduleId)}
        className="grid place-items-center h-7 w-7 rounded-md hover:bg-warning/20 text-muted-foreground"
        aria-label="Dismiss notice"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function SectionShell({
  title, description, children, action,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-surface border border-border shadow-[var(--shadow-card)] overflow-hidden">
      <div className="flex items-start gap-3 px-5 py-4 border-b border-border bg-surface-muted/40">
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
          {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export function TypingDots() {
  return (
    <span className="dot-typing inline-flex items-center" aria-label="Generating">
      <span /><span /><span />
    </span>
  );
}

export function SkeletonLines({ lines = 4 }: { lines?: number }) {
  return (
    <div className="space-y-2.5" aria-hidden>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-3 rounded-md shimmer"
          style={{ width: `${85 - i * 8}%` }}
        />
      ))}
    </div>
  );
}

export function EmptyState({
  title, description, sampleLabel, onSample, icon: Icon,
}: {
  title: string;
  description: string;
  sampleLabel?: string;
  onSample?: () => void;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-6">
      <div className="grid place-items-center h-12 w-12 rounded-2xl bg-primary-soft text-primary mb-4">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm">{description}</p>
      {sampleLabel && onSample && (
        <button
          onClick={onSample}
          className="mt-4 inline-flex items-center h-9 px-3 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          {sampleLabel}
        </button>
      )}
    </div>
  );
}
