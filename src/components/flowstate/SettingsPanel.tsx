import { useEffect, useState } from "react";
import { useApp } from "./state";
import { getStoredApiKey, setStoredApiKey } from "@/lib/aiClient";
import { Key, X, ExternalLink, Eye, EyeOff, Check } from "lucide-react";
import { toast } from "sonner";

export function SettingsPanel() {
  const { settingsOpen, setSettingsOpen } = useApp();
  const [value, setValue] = useState("");
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (settingsOpen) setValue(getStoredApiKey());
  }, [settingsOpen]);

  if (!settingsOpen) return null;

  const save = () => {
    const trimmed = value.trim();
    if (trimmed && !trimmed.startsWith("sk-")) {
      toast.error("OpenAI keys start with 'sk-'. Double-check the value.");
      return;
    }
    setStoredApiKey(trimmed);
    toast.success(trimmed ? "API key saved" : "API key removed");
    setSettingsOpen(false);
  };

  const clear = () => {
    setStoredApiKey("");
    setValue("");
    toast("API key cleared");
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={() => setSettingsOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Settings"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-2xl bg-surface border border-border shadow-[var(--shadow-pop)] overflow-hidden"
      >
        <header className="flex items-center gap-2 px-5 h-14 border-b border-border">
          <div className="grid place-items-center h-8 w-8 rounded-lg bg-primary-soft text-primary">
            <Key className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold leading-none">Settings</h2>
            <p className="text-[11px] text-muted-foreground mt-1">Connect your OpenAI account</p>
          </div>
          <button
            onClick={() => setSettingsOpen(false)}
            className="grid place-items-center h-8 w-8 rounded-md hover:bg-muted text-muted-foreground"
            aria-label="Close settings"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="p-5 space-y-4">
          <div>
            <label htmlFor="oai-key" className="text-xs font-medium text-muted-foreground">
              OpenAI API key
            </label>
            <div className="mt-1.5 relative">
              <input
                id="oai-key"
                type={show ? "text" : "password"}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="sk-..."
                autoComplete="off"
                spellCheck={false}
                className="w-full h-10 pl-3 pr-10 rounded-lg border border-input bg-background text-sm font-mono focus:border-ring outline-none"
              />
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 grid place-items-center h-7 w-7 rounded-md hover:bg-muted text-muted-foreground"
                aria-label={show ? "Hide key" : "Show key"}
              >
                {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground leading-relaxed">
              Stored only in your browser's localStorage and sent to your own backend via the
              <code className="mx-1 px-1 py-0.5 rounded bg-surface-muted text-[10px]">X-OpenAI-Key</code>
              header on each request. We never log it.
            </p>
          </div>

          <div className="rounded-lg border border-border bg-surface-muted p-3 text-xs space-y-2">
            <p className="font-medium text-foreground">How to get a key</p>
            <ol className="space-y-1 text-muted-foreground list-decimal pl-4">
              <li>Sign in at platform.openai.com</li>
              <li>Open <span className="font-medium text-foreground">API keys</span> and create a new secret key</li>
              <li>Paste it above and click Save</li>
            </ol>
            <a
              href="https://platform.openai.com/api-keys"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline font-medium"
            >
              Open OpenAI dashboard <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        <footer className="px-5 py-3 border-t border-border flex items-center justify-between gap-2 bg-surface-muted/40">
          <button
            onClick={clear}
            className="h-9 px-3 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            Clear saved key
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSettingsOpen(false)}
              className="h-9 px-3 rounded-lg border border-border text-sm font-medium hover:bg-muted"
            >
              Cancel
            </button>
            <button
              onClick={save}
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
            >
              <Check className="h-4 w-4" /> Save
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
