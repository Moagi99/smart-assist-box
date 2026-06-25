import { useEffect, useRef, useState } from "react";

const SKIP_PREF_KEY = "flowstate.skipTyping";

export function getSkipPref(): boolean {
  if (typeof window === "undefined") return false;
  try { return localStorage.getItem(SKIP_PREF_KEY) === "1"; } catch { return false; }
}
export function setSkipPref(v: boolean) {
  try { localStorage.setItem(SKIP_PREF_KEY, v ? "1" : "0"); } catch {}
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
}

/**
 * Animated typewriter reveal with variable per-char delay (human-like rhythm).
 * Honors prefers-reduced-motion and a persistent skip preference.
 */
export function useTypewriter(text: string, opts: { speed?: number } = {}) {
  const { speed = 14 } = opts;
  const [shown, setShown] = useState("");
  const [done, setDone] = useState(false);
  const skipRef = useRef(false);

  useEffect(() => {
    skipRef.current = false;
    if (!text) { setShown(""); setDone(true); return; }

    if (prefersReducedMotion() || getSkipPref()) {
      setShown(text);
      setDone(true);
      return;
    }

    setShown("");
    setDone(false);
    let i = 0;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const tick = () => {
      if (cancelled) return;
      if (skipRef.current) {
        setShown(text);
        setDone(true);
        return;
      }
      i += 1;
      setShown(text.slice(0, i));
      if (i >= text.length) { setDone(true); return; }
      const ch = text.charAt(i - 1);
      // variable rhythm: longer on punctuation/newlines
      const jitter = Math.random() * speed;
      const punct = /[.,;:!?]/.test(ch) ? 90 : /\n/.test(ch) ? 110 : 0;
      timer = setTimeout(tick, speed + jitter + punct);
    };
    timer = setTimeout(tick, speed);
    return () => { cancelled = true; if (timer) clearTimeout(timer); };
  }, [text, speed]);

  return { shown, done, skip: () => { skipRef.current = true; } };
}

/** Renders text with progressive reveal + blinking cursor + skip button. */
export function TypedText({
  text,
  className = "",
  onDone,
}: {
  text: string;
  className?: string;
  onDone?: () => void;
}) {
  const { shown, done, skip } = useTypewriter(text);
  const [showSkip, setShowSkip] = useState(false);

  useEffect(() => {
    if (done) { onDone?.(); return; }
    const t = setTimeout(() => setShowSkip(true), 1000);
    return () => clearTimeout(t);
  }, [done, onDone]);

  return (
    <div className="relative">
      <div className={className}>
        <span className="whitespace-pre-wrap">{shown}</span>
        {!done && (
          <span
            aria-hidden
            className="inline-block w-[2px] h-[1em] align-text-bottom bg-primary ml-0.5 animate-pulse"
          />
        )}
      </div>
      {!done && showSkip && (
        <button
          onClick={skip}
          className="absolute -top-1 right-0 text-[10px] px-2 py-0.5 rounded-md border border-border bg-surface text-muted-foreground hover:text-foreground hover:bg-muted"
        >
          Skip animation
        </button>
      )}
    </div>
  );
}
