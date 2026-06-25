// Browser-native exports (no external libs).

export function downloadBlob(content: BlobPart, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function copyText(text: string) {
  await navigator.clipboard.writeText(text);
}

/** Open a mailto: link prefilled with subject + body. */
export function emailDraft(subject: string, body: string, to = "") {
  const url = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = url;
}

/** Build a printable HTML doc, open new window, trigger print → user saves as PDF. */
export function exportAsPdf(title: string, html: string) {
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title>
    <style>
      body { font-family: -apple-system, system-ui, sans-serif; color:#0f172a; padding:32px; max-width:780px; margin:auto; }
      h1 { font-size: 22px; margin-bottom: 4px; }
      h2 { font-size: 14px; margin-top: 24px; color: #475569; text-transform: uppercase; letter-spacing: .05em; }
      ul { padding-left: 18px; } li { margin: 6px 0; }
      .meta { color:#64748b; font-size: 12px; margin-bottom: 20px; }
      .card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin: 8px 0; }
    </style></head><body>${html}</body></html>`);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 250);
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]!));
}

// ─── ICS (calendar) export ──────────────────────────────────────────────────
type IcsEvent = { title: string; date: Date; hours: number; description?: string };

function pad(n: number) { return String(n).padStart(2, "0"); }
function toIcsDate(d: Date) {
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
}

export function buildIcs(events: IcsEvent[]): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//FlowState//Task Planner//EN",
    "CALSCALE:GREGORIAN",
  ];
  for (const ev of events) {
    const start = new Date(ev.date);
    start.setHours(9, 0, 0, 0);
    const end = new Date(start);
    end.setHours(start.getHours() + Math.max(1, Math.round(ev.hours)));
    lines.push(
      "BEGIN:VEVENT",
      `UID:${crypto.randomUUID()}@flowstate`,
      `DTSTAMP:${toIcsDate(new Date())}`,
      `DTSTART:${toIcsDate(start)}`,
      `DTEND:${toIcsDate(end)}`,
      `SUMMARY:${ev.title.replace(/\n/g, " ")}`,
      ev.description ? `DESCRIPTION:${ev.description.replace(/\n/g, "\\n")}` : "",
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  return lines.filter(Boolean).join("\r\n");
}
