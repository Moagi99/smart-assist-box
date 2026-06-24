import { useEffect, useRef, useState } from "react";
import { useApp, type ModuleId } from "./state";
import { TypingDots } from "./shared";
import { MessageSquare, X, Send, Trash2, Mail, FileText, CalendarDays, Search, Workflow } from "lucide-react";

type Route = { module: ModuleId; label: string; icon: typeof Mail; prefillContext?: string } | null;

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

function detectRoute(input: string): Route {
  const s = input.toLowerCase();
  if (/(email|draft|reply|write to|message)/.test(s)) {
    return { module: "email", label: "Open Email Generator", icon: Mail, prefillContext: input };
  }
  if (/(meeting|summary|summarize|notes|transcript|action items)/.test(s)) {
    return { module: "meeting", label: "Open Meeting Summarizer", icon: FileText };
  }
  if (/(plan|schedule|task|todo|by friday|by monday|week)/.test(s)) {
    return { module: "tasks", label: "Open Task Planner", icon: CalendarDays };
  }
  if (/(research|analyze|article|source|claim|bias|fact)/.test(s)) {
    return { module: "research", label: "Open Research Assistant", icon: Search };
  }
  return null;
}

function reply(input: string, route: Route): string {
  if (route?.module === "email") return "I can help draft that email. Open the Email Generator and I'll pre-fill the context.";
  if (route?.module === "meeting") return "Paste your raw notes in the Meeting Summarizer and I'll extract decisions, owners, and deadlines.";
  if (route?.module === "tasks") return "Drop your task list in the Planner and I'll lay out a weekly schedule with priority scores.";
  if (route?.module === "research") return "Open the Research Assistant and paste the article — I'll flag weak claims and bias.";
  return "I can route you to any of the four modules. Try: \"draft an email to my manager\", \"summarize these notes\", \"plan my week\", or \"analyze this article\".";
}

export function Chatbot() {
  const { chatOpen, setChatOpen, setModule, setEmailPrefill } = useApp();
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

  const send = () => {
    const text = input.trim();
    if (!text) return;
    const route = detectRoute(text);
    const userMsg: Msg = { id: Math.random().toString(36).slice(2), role: "user", text };
    setMessages((prev) => [...prev.slice(-9), userMsg]);
    setInput("");
    setTyping(true);
    // Simulated response
    setTimeout(() => {
      const assistantMsg: Msg = {
        id: Math.random().toString(36).slice(2),
        role: "assistant",
        text: reply(text, route),
        route: route ?? undefined,
      };
      setMessages((prev) => [...prev.slice(-9), assistantMsg]);
      setTyping(false);
    }, 700);
  };

  const route = (r: Route) => {
    if (!r) return;
    setModule(r.module);
    if (r.module === "email" && r.prefillContext) {
      setEmailPrefill({ context: r.prefillContext.replace(/^(draft|write|send|reply|email)\s*(an?|the)?\s*/i, "").trim() });
    }
    setChatOpen(false);
  };

  const turns = messages.slice(-10); // last 5 turns = 10 messages

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
                      onClick={() => route(m.route!)}
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
                disabled={!input.trim()}
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
