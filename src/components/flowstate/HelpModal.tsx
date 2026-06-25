import { useApp } from "./state";
import { Modal } from "./Modal";
import { ShieldAlert, Keyboard, HelpCircle } from "lucide-react";

const FAQ = [
  { q: "Where does my data go?", a: "Your OpenAI API key and chat history live in your browser's localStorage. Each AI request is forwarded from FlowState's backend route to OpenAI using your key on that request only." },
  { q: "Why do I see confidence scores?", a: "AI extraction is probabilistic. Confidence reflects how strongly the model believes an item was correctly extracted — always verify before acting." },
  { q: "Can I edit AI output?", a: "Yes — every draft, summary, and plan is editable inline. AI assists; humans decide." },
  { q: "What if a request fails?", a: "You'll see a toast with the reason. Common causes: missing key, network blip, or rate limit. Open Settings to verify your key." },
];

export function HelpModal() {
  const { helpOpen, setHelpOpen, setShortcutsOpen } = useApp();
  return (
    <Modal open={helpOpen} onClose={() => setHelpOpen(false)} title="Help & Support">
      <div className="space-y-5 text-sm">
        <button
          onClick={() => { setHelpOpen(false); setShortcutsOpen(true); }}
          className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted text-left"
        >
          <Keyboard className="h-4 w-4 text-primary" />
          <div className="flex-1">
            <p className="font-medium">Keyboard shortcuts</p>
            <p className="text-xs text-muted-foreground">Faster navigation across modules.</p>
          </div>
          <kbd className="px-1.5 py-0.5 rounded bg-surface-muted border border-border text-[10px]">⌘/</kbd>
        </button>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1.5">
            <HelpCircle className="h-3 w-3" /> FAQ
          </h3>
          <ul className="space-y-3">
            {FAQ.map((f) => (
              <li key={f.q}>
                <p className="font-medium">{f.q}</p>
                <p className="text-muted-foreground text-[13px] leading-relaxed mt-0.5">{f.a}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2.5 text-[13px]">
          <ShieldAlert className="h-4 w-4 mt-0.5 text-warning-foreground shrink-0" />
          <p className="text-muted-foreground">
            <span className="text-foreground font-medium">Responsible AI:</span>{" "}
            FlowState never auto-sends emails or commits actions for you. Every output is editable and intended for human review.
          </p>
        </div>
      </div>
    </Modal>
  );
}
