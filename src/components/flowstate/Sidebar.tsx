import { useApp, type ModuleId } from "./state";
import { Mail, FileText, CalendarDays, Search, Menu, Workflow, BarChart3, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export const MODULES: { id: ModuleId; label: string; icon: typeof Mail; hint: string }[] = [
  { id: "email", label: "Email Generator", icon: Mail, hint: "⌘1" },
  { id: "meeting", label: "Meeting Notes", icon: FileText, hint: "⌘2" },
  { id: "tasks", label: "Task Planner", icon: CalendarDays, hint: "⌘3" },
  { id: "research", label: "Research Assistant", icon: Search, hint: "⌘4" },
  { id: "analytics", label: "Analytics", icon: BarChart3, hint: "⌘5" },
];

export function Sidebar() {
  const { module, setModule, sidebarCollapsed, toggleSidebar, focusMode, setHelpOpen } = useApp();
  if (focusMode) return null;
  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200 ease-out",
        sidebarCollapsed ? "w-[68px]" : "w-[248px]",
      )}
      aria-label="Primary navigation"
    >
      <div className="flex items-center gap-2 px-4 h-16 border-b border-sidebar-border">
        <button
          onClick={toggleSidebar}
          className="grid place-items-center h-9 w-9 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground transition-colors shrink-0"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-4 w-4" />
        </button>
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2 min-w-0">
            <div className="grid place-items-center h-8 w-8 rounded-lg bg-primary text-primary-foreground">
              <Workflow className="h-4 w-4" />
            </div>
            <span className="font-semibold tracking-tight text-sidebar-foreground truncate">FlowState</span>
          </div>
        )}
      </div>
      <nav className="flex-1 p-2 space-y-1">
        {MODULES.map((m) => {
          const Icon = m.icon;
          const active = module === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setModule(m.id)}
              className={cn(
                "w-full group flex items-center gap-3 px-3 h-10 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-primary"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground",
              )}
              aria-current={active ? "page" : undefined}
              title={sidebarCollapsed ? m.label : undefined}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!sidebarCollapsed && (
                <>
                  <span className="truncate">{m.label}</span>
                  <span className="ml-auto text-[10px] text-muted-foreground font-normal">{m.hint}</span>
                </>
              )}
            </button>
          );
        })}
      </nav>
      <div className="p-2 border-t border-sidebar-border">
        <button
          onClick={() => setHelpOpen(true)}
          className="w-full flex items-center gap-3 px-3 h-10 rounded-lg text-sm font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
          title="Help & support"
        >
          <HelpCircle className="h-4 w-4 shrink-0" />
          {!sidebarCollapsed && <span>Help & Support</span>}
        </button>
      </div>
      {!sidebarCollapsed && (
        <div className="p-3 m-3 rounded-xl bg-primary-soft text-xs text-accent-foreground">
          <p className="font-medium mb-1">Tip</p>
          <p className="text-muted-foreground">Press <kbd className="px-1 py-0.5 rounded bg-surface border text-[10px]">⌘/</kbd> for all shortcuts.</p>
        </div>
      )}
    </aside>
  );
}

export function MobileTabBar() {
  const { module, setModule, focusMode } = useApp();
  if (focusMode) return null;
  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/80"
      aria-label="Primary navigation"
    >
      <ul className="grid grid-cols-5">
        {MODULES.map((m) => {
          const Icon = m.icon;
          const active = module === m.id;
          return (
            <li key={m.id}>
              <button
                onClick={() => setModule(m.id)}
                className={cn(
                  "w-full flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium",
                  active ? "text-primary" : "text-muted-foreground",
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="h-5 w-5" />
                <span className="truncate max-w-[60px]">{m.label.split(" ")[0]}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
