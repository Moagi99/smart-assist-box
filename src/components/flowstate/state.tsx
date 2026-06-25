import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";

export type ModuleId = "email" | "meeting" | "tasks" | "research" | "analytics";

export type EmailPrefill = {
  recipientRole?: string;
  subject?: string;
  context?: string;
  tone?: "Formal" | "Friendly" | "Persuasive" | "Diplomatic";
};

export type MeetingPrefill = { notes?: string };
export type TaskPrefill = { input?: string };
export type ResearchPrefill = { text?: string };

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
  settingsOpen: boolean;
  setSettingsOpen: (v: boolean) => void;
  shortcutsOpen: boolean;
  setShortcutsOpen: (v: boolean) => void;
  helpOpen: boolean;
  setHelpOpen: (v: boolean) => void;
  emailPrefill: EmailPrefill | null;
  setEmailPrefill: (p: EmailPrefill | null) => void;
  meetingPrefill: MeetingPrefill | null;
  setMeetingPrefill: (p: MeetingPrefill | null) => void;
  taskPrefill: TaskPrefill | null;
  setTaskPrefill: (p: TaskPrefill | null) => void;
  researchPrefill: ResearchPrefill | null;
  setResearchPrefill: (p: ResearchPrefill | null) => void;
  dismissedBanner: Record<Exclude<ModuleId, "analytics">, boolean>;
  dismissBanner: (m: Exclude<ModuleId, "analytics">) => void;
};

const AppCtx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [module, setModule] = useState<ModuleId>("email");
  const [dark, setDark] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [emailPrefill, setEmailPrefill] = useState<EmailPrefill | null>(null);
  const [meetingPrefill, setMeetingPrefill] = useState<MeetingPrefill | null>(null);
  const [taskPrefill, setTaskPrefill] = useState<TaskPrefill | null>(null);
  const [researchPrefill, setResearchPrefill] = useState<ResearchPrefill | null>(null);
  const [dismissedBanner, setDismissed] = useState<Record<Exclude<ModuleId, "analytics">, boolean>>({
    email: false, meeting: false, tasks: false, research: false,
  });

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

  const dismissBanner = useCallback((m: Exclude<ModuleId, "analytics">) => {
    setDismissed((prev) => ({ ...prev, [m]: true }));
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setChatOpen((v) => !v);
        return;
      }
      if (meta && (e.key === "/" || e.key === "?")) {
        e.preventDefault();
        setShortcutsOpen((v) => !v);
        return;
      }
      if (meta && ["1", "2", "3", "4", "5"].includes(e.key)) {
        e.preventDefault();
        const map: ModuleId[] = ["email", "meeting", "tasks", "research", "analytics"];
        setModule(map[parseInt(e.key, 10) - 1]);
        return;
      }
      if (e.key === "Escape") {
        setChatOpen(false);
        setFocusMode(false);
        setShortcutsOpen(false);
        setHelpOpen(false);
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
    settingsOpen, setSettingsOpen,
    shortcutsOpen, setShortcutsOpen,
    helpOpen, setHelpOpen,
    emailPrefill, setEmailPrefill,
    meetingPrefill, setMeetingPrefill,
    taskPrefill, setTaskPrefill,
    researchPrefill, setResearchPrefill,
    dismissedBanner, dismissBanner,
  };

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp() {
  const v = useContext(AppCtx);
  if (!v) throw new Error("useApp must be used within AppProvider");
  return v;
}
