import { useEffect, useState } from "react";
import { Check, AlertTriangle } from "lucide-react";

/**
 * Tiny inline pop animation for success/warning feedback.
 * Use via `useFlash()` → returns [flash, fire].
 * Render <Flash kind={flash} /> next to the triggering button.
 */
export type FlashKind = "success" | "warning" | null;

export function useFlash(): [FlashKind, (k: Exclude<FlashKind, null>) => void] {
  const [flash, setFlash] = useState<FlashKind>(null);
  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setFlash(null), 1100);
    return () => clearTimeout(t);
  }, [flash]);
  return [flash, (k) => setFlash(k)];
}

export function Flash({ kind }: { kind: FlashKind }) {
  if (!kind) return null;
  const Icon = kind === "success" ? Check : AlertTriangle;
  return (
    <span
      aria-hidden
      className={
        "ml-1 inline-grid place-items-center h-4 w-4 rounded-full text-white " +
        (kind === "success" ? "bg-success" : "bg-warning") +
        " animate-[flashPop_300ms_ease-out]"
      }
      style={{ animation: "flashPop 300ms ease-out" }}
    >
      <Icon className="h-2.5 w-2.5" />
    </span>
  );
}
