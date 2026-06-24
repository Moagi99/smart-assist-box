import { createFileRoute } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { AppProvider, useApp } from "@/components/flowstate/state";
import { Sidebar, MobileTabBar } from "@/components/flowstate/Sidebar";
import { Header } from "@/components/flowstate/Header";
import { Chatbot } from "@/components/flowstate/Chatbot";
import { EmailGenerator } from "@/components/flowstate/modules/EmailGenerator";
import { MeetingSummarizer } from "@/components/flowstate/modules/MeetingSummarizer";
import { TaskPlanner } from "@/components/flowstate/modules/TaskPlanner";
import { ResearchAssistant } from "@/components/flowstate/modules/ResearchAssistant";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FlowState — AI workflows for professionals" },
      { name: "description", content: "Draft emails, summarize meetings, plan your week, and analyze research with AI assistance." },
      { property: "og:title", content: "FlowState — AI workflows for professionals" },
      { property: "og:description", content: "Five AI modules to automate workplace tasks, with human oversight by design." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <AppProvider>
      <Shell />
      <Toaster position="top-right" richColors closeButton />
    </AppProvider>
  );
}

function Shell() {
  const { module, focusMode } = useApp();
  return (
    <div className="min-h-screen grid grid-cols-1 lg:[grid-template-columns:auto_1fr] bg-background text-foreground">
      <Sidebar />
      <div className="flex flex-col min-w-0">
        <Header />
        <main className="flex-1 px-4 py-5 lg:px-8 lg:py-7 pb-24 lg:pb-10 max-w-5xl w-full mx-auto">
          {!focusMode && (
            <div className="mb-5 hidden lg:block">
              <p className="text-xs text-muted-foreground">Module {moduleNumber(module)} of 4</p>
            </div>
          )}
          {module === "email" && <EmailGenerator />}
          {module === "meeting" && <MeetingSummarizer />}
          {module === "tasks" && <TaskPlanner />}
          {module === "research" && <ResearchAssistant />}
        </main>
      </div>
      <MobileTabBar />
      <Chatbot />
    </div>
  );
}

function moduleNumber(m: string) {
  return { email: 1, meeting: 2, tasks: 3, research: 4 }[m as "email"] ?? 1;
}
