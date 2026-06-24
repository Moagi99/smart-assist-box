import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";

export type ModuleId = "email" | "meeting" | "tasks" | "research";

export type EmailPrefill = {
  recipientRole?: string;
  subject?: string;
  context?: string;
  tone?: "Formal" | "Friendly" | "Persuasive" | "Diplomatic";
};

type AppState = {
  module: ModuleId;
  setModule: (m: ModuleId) => void;
  dark: boolean;
  toggleDark: () => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  chatOpen: boolean;
  setChatOpen: (v: boolean) => void;
  focusMode: boolean;
  setFocusMode: (v: boolean) => void;
  emailPrefill: EmailPrefill | null;
  setEmailPrefill: (p: EmailPrefill | null) => void;
  dismissedBanner: Record<ModuleId, boolean>;
  dismissBanner: (m: ModuleId) => void;
};

const AppCtx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [module, setModule] = useState<ModuleId>("email");
  const [dark, setDark] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [emailPrefill, setEmailPrefill] = useState<EmailPrefill | null>(null);
  const [dismissedBanner, setDismissed] = useState<Record<ModuleId, boolean>>({
    email: false, meeting: false, tasks: false, research: false,
  });

  // hydrate
  useEffect(() => {
    try {
      const d = localStorage.getItem("flowstate.dark");
      if (d === "1") setDark(true);
      const sc = localStorage.getItem("flowstate.sidebar");
      if (sc === "1") setSidebarCollapsed(true);
    } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    try { localStorage.setItem("flowstate.dark", dark ? "1" : "0"); } catch {}
  }, [dark]);

  useEffect(() => {
    try { localStorage.setItem("flowstate.sidebar", sidebarCollapsed ? "1" : "0"); } catch {}
  }, [sidebarCollapsed]);

  const dismissBanner = useCallback((m: ModuleId) => {
    setDismissed((prev) => ({ ...prev, [m]: true }));
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setChatOpen((v) => !v);
        return;
      }
      if (meta && ["1", "2", "3", "4"].includes(e.key)) {
        e.preventDefault();
        const map: ModuleId[] = ["email", "meeting", "tasks", "research"];
        setModule(map[parseInt(e.key, 10) - 1]);
        return;
      }
      if (e.key === "Escape") {
        setChatOpen(false);
        setFocusMode(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const value: AppState = {
    module, setModule,
    dark, toggleDark: () => setDark((v) => !v),
    sidebarCollapsed, toggleSidebar: () => setSidebarCollapsed((v) => !v),
    chatOpen, setChatOpen,
    focusMode, setFocusMode,
    emailPrefill, setEmailPrefill,
    dismissedBanner, dismissBanner,
  };

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp() {
  const v = useContext(AppCtx);
  if (!v) throw new Error("useApp must be used within AppProvider");
  return v;
}
