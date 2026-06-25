import { useEffect, useRef, useState } from "react";
import { useApp, type ModuleId } from "./state";
import { TypingDots } from "./shared";
import { aiClient, ApiError, type ChatTurn } from "@/lib/aiClient";
import { MessageSquare, X, Send, Trash2, Mail, FileText, CalendarDays, Search, Workflow } from "lucide-react";

type Route = { module: ModuleId; label: string; prefill: Record<string, string> } | null;

type Msg = {
  id: string;
  role: "user" | "assistant";
  text: string;
  route?: Route;
};

const MODULE_ICON: Record<ModuleId, typeof Mail> = {
  email: Mail, meeting: FileText, tasks: CalendarDays, research: Search,
};
const MODULE_LABEL: Record<ModuleId, string> = {
  email: "Email Generator", meeting: "Meeting Notes", tasks: "Task Planner", research: "Research Assistant",
};

const STORAGE_KEY = "flowstate.chat";

export function Chatbot() {
  const {
    chatOpen, setChatOpen, setModule,
    setEmailPrefill, setMeetingPrefill, setTaskPrefill, setResearchPrefill,
    setSettingsOpen,
  } = useApp();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setMessages(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-10))); } catch {}
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text) return;
    const userMsg: Msg = { id: Math.random().toString(36).slice(2), role: "user", text };
    setMessages((prev) => [...prev.slice(-9), userMsg]);
    setInput("");
    setTyping(true);
    try {
      // Maintain memory of last 5 turns (10 messages)
      const history: ChatTurn[] = [...messages, userMsg]
        .slice(-10)
        .map((m) => ({ role: m.role, text: m.text }));
      const data = await aiClient.chatRoute({ message: text, history });
      const route: Route = data.module
        ? { module: data.module, label: `Open ${MODULE_LABEL[data.module]}`, prefill: data.prefill ?? {} }
        : null;
      const assistantMsg: Msg = {
        id: Math.random().toString(36).slice(2),
        role: "assistant",
        text: data.reply || "Here's what I came up with.",
        route: route ?? undefined,
      };
      setMessages((prev) => [...prev.slice(-9), assistantMsg]);
    } catch (err) {
      const e = err as ApiError;
      const assistantMsg: Msg = {
        id: Math.random().toString(36).slice(2),
        role: "assistant",
        text: e.message,
      };
      setMessages((prev) => [...prev.slice(-9), assistantMsg]);
      if (e.isMissingKey) setSettingsOpen(true);
    } finally {
      setTyping(false);
    }
  };

  const goTo = (r: Route) => {
    if (!r) return;
    if (r.module === "email") {
      setEmailPrefill({
        recipientRole: r.prefill.recipientRole,
        subject: r.prefill.subject,
        context: r.prefill.context,
        tone: (r.prefill.tone as "Formal" | "Friendly" | "Persuasive" | "Diplomatic") || undefined,
      });
    } else if (r.module === "meeting") {
      setMeetingPrefill({ notes: r.prefill.notes });
    } else if (r.module === "tasks") {
      setTaskPrefill({ input: r.prefill.input });
    } else if (r.module === "research") {
      setResearchPrefill({ text: r.prefill.text });
    }
    setModule(r.module);
    setChatOpen(false);
  };

  const turns = messages.slice(-10);

  return (
    <>
      {!chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-20 lg:bottom-6 right-4 lg:right-6 z-50 grid place-items-center h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-pop)] hover:scale-105 active:scale-95 transition-transform"
          aria-label="Open AI assistant"
        >
          <MessageSquare className="h-5 w-5" />
        </button>
      )}
      {chatOpen && (
        <div
          role="dialog"
          aria-label="AI assistant"
          className="fixed bottom-20 lg:bottom-6 right-4 lg:right-6 z-50 w-[calc(100vw-2rem)] max-w-[380px] h-[min(560px,calc(100vh-7rem))] rounded-2xl bg-surface border border-border shadow-[var(--shadow-pop)] flex flex-col overflow-hidden"
        >
          <header className="flex items-center gap-2 px-4 h-12 border-b border-border">
            <div className="grid place-items-center h-7 w-7 rounded-lg bg-primary text-primary-foreground">
              <Workflow className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold leading-none">FlowState Assistant</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Remembers your last 5 turns</p>
            </div>
            <button
              onClick={() => { setMessages([]); try { localStorage.removeItem(STORAGE_KEY); } catch {} }}
              className="grid place-items-center h-7 w-7 rounded-md hover:bg-muted text-muted-foreground"
              aria-label="Clear chat"
              title="Clear chat"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setChatOpen(false)}
              className="grid place-items-center h-7 w-7 rounded-md hover:bg-muted text-muted-foreground"
              aria-label="Close"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </header>
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
            {turns.length === 0 && (
              <div className="text-center text-xs text-muted-foreground py-8 px-4">
                <p className="mb-2">Hi 👋 I can route you to any module.</p>
                <p>Try: <span className="italic">"draft an email to my manager"</span></p>
              </div>
            )}
            {turns.map((m) => (
              <div key={m.id} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                <div className={`max-w-[85%] ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-surface-muted text-foreground"} rounded-2xl px-3 py-2 text-sm`}>
                  <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>
                  {m.route && (
                    <button
                      onClick={() => goTo(m.route!)}
                      className="mt-2 w-full inline-flex items-center gap-2 px-2.5 h-8 rounded-lg bg-surface border border-border text-foreground text-xs font-medium hover:bg-muted"
                    >
                      {(() => { const Icon = MODULE_ICON[m.route.module]; return <Icon className="h-3.5 w-3.5 text-primary" />; })()}
                      <span>{m.route.label}</span>
                      <span className="ml-auto text-[10px] text-muted-foreground">{MODULE_LABEL[m.route.module]}</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="bg-surface-muted rounded-2xl px-3 py-3">
                  <TypingDots />
                </div>
              </div>
            )}
          </div>
          <div className="p-3 border-t border-border">
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
                }}
                rows={1}
                placeholder="Ask anything…"
                className="flex-1 resize-none p-2.5 rounded-lg border border-input bg-surface text-sm focus:border-ring outline-none max-h-32"
              />
              <button
                onClick={send}
                disabled={!input.trim() || typing}
                className="grid place-items-center h-9 w-9 rounded-lg bg-primary text-primary-foreground disabled:opacity-50"
                aria-label="Send"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
