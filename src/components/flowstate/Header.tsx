import { useApp } from "./state";
import { MODULES } from "./Sidebar";
import { Moon, Sun, MessageSquare, Menu, Workflow } from "lucide-react";

export function Header() {
  const { dark, toggleDark, module, setChatOpen, toggleSidebar, focusMode } = useApp();
  const current = MODULES.find((m) => m.id === module);
  if (focusMode) {
    return (
      <header className="h-14 border-b border-border bg-surface px-4 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Focus Mode — press Esc to exit</span>
        <button
          onClick={toggleDark}
          className="grid place-items-center h-9 w-9 rounded-lg hover:bg-muted text-foreground"
          aria-label="Toggle dark mode"
        >
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </header>
    );
  }
  return (
    <header className="h-16 border-b border-border bg-surface px-4 lg:px-6 flex items-center gap-3">
      <button
        onClick={toggleSidebar}
        className="lg:hidden grid place-items-center h-9 w-9 rounded-lg hover:bg-muted text-foreground"
        aria-label="Toggle navigation"
      >
        <Menu className="h-4 w-4" />
      </button>
      <div className="flex lg:hidden items-center gap-2">
        <div className="grid place-items-center h-8 w-8 rounded-lg bg-primary text-primary-foreground">
          <Workflow className="h-4 w-4" />
        </div>
        <span className="font-semibold tracking-tight">FlowState</span>
      </div>
      <div className="hidden lg:flex flex-col min-w-0">
        <h1 className="text-base font-semibold leading-tight truncate">{current?.label}</h1>
        <p className="text-xs text-muted-foreground">AI-assisted workflows for professionals</p>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={() => setChatOpen(true)}
          className="hidden sm:inline-flex items-center gap-2 h-9 px-3 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Open AI assistant (Cmd+K)"
        >
          <MessageSquare className="h-4 w-4" />
          <span>Ask AI</span>
          <kbd className="ml-1 px-1.5 py-0.5 rounded bg-surface-muted text-[10px] border border-border">⌘K</kbd>
        </button>
        <button
          onClick={toggleDark}
          className="grid place-items-center h-9 w-9 rounded-lg hover:bg-muted text-foreground transition-colors"
          aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>
    </header>
  );
}
