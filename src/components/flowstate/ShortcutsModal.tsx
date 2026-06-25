import { useApp } from "./state";
import { Modal } from "./Modal";

const SHORTCUTS: { keys: string; label: string }[] = [
  { keys: "⌘ K", label: "Open AI assistant" },
  { keys: "⌘ 1", label: "Email Generator" },
  { keys: "⌘ 2", label: "Meeting Notes" },
  { keys: "⌘ 3", label: "Task Planner" },
  { keys: "⌘ 4", label: "Research Assistant" },
  { keys: "⌘ 5", label: "Analytics" },
  { keys: "⌘ /", label: "Show this help" },
  { keys: "Esc", label: "Close panels / exit Focus Mode" },
];

export function ShortcutsModal() {
  const { shortcutsOpen, setShortcutsOpen } = useApp();
  return (
    <Modal open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} title="Keyboard shortcuts">
      <ul className="divide-y divide-border -mx-1">
        {SHORTCUTS.map((s) => (
          <li key={s.keys} className="flex items-center justify-between py-2.5 px-1">
            <span className="text-sm">{s.label}</span>
            <kbd className="px-2 py-1 rounded-md bg-surface-muted border border-border text-[11px] font-mono">{s.keys}</kbd>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-[11px] text-muted-foreground">
        Tip: hold <kbd className="px-1 rounded bg-surface-muted border text-[10px]">Shift</kbd> + Enter in the chat to add a newline.
      </p>
    </Modal>
  );
}
