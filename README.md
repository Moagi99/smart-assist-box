# FlowState

**AI-powered workplace automation for professionals.**

FlowState is a modern, responsive single-page dashboard that helps you automate common workplace tasks using AI. It features five integrated modules — Smart Email Generator, Meeting Notes Summarizer, AI Task Planner, Research Assistant, and an intelligent Chatbot — all wrapped in a clean, calm-tech interface.

## Features

### 1. Smart Email Generator
Draft professional emails in seconds. Choose from four tones — Formal, Friendly, Persuasive, or Diplomatic — and let AI compose a polished message from bullet-point context. Edit inline and copy to your clipboard with one click.

### 2. Meeting Notes Summarizer
Paste raw meeting notes and get structured output across three tabs: an Executive Summary, Action Items (with owner, deadline, and confidence scores), and Key Decisions. Every extraction is rated so you know where to double-check.

### 3. AI Task Planner
Describe your week in natural language and receive a visual 5-day schedule with priority levels (High / Medium / Low), estimated durations, and overload warnings when any day exceeds 8 hours.

### 4. AI Research Assistant
Paste an article or research topic for instant analysis: a TL;DR summary, Key Claims with evidence-strength ratings, bias flags, and — in Skeptic Mode — counter-arguments and potential weaknesses.

### 5. AI Chatbot Interface
A persistent floating assistant that routes you to the right module, pre-fills forms from natural-language requests (e.g. *"Draft a formal email to HR about leave"*), and remembers the last 5 conversation turns.

### Design & UX
- **Calm Tech** aesthetic — Slate, Indigo, and Emerald palette
- Collapsible sidebar with a **Focus Mode** for distraction-free work
- Full **dark mode** support (system preference + manual toggle)
- Mobile-responsive: sidebar becomes a bottom navigation bar on small screens
- Subtle animations — loading skeletons, shimmer effects, smooth transitions
- Keyboard shortcuts: `Cmd/Ctrl+K` for chat, `Cmd/Ctrl+1–4` to switch modules
- Accessible: ARIA labels, focus rings, keyboard navigation, reduced-motion support

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [TanStack Start](https://tanstack.com/start) (React 19 + Vite 7 + file-based routing) |
| Styling | Tailwind CSS v4 with custom OKLCH theme tokens |
| UI Components | Radix UI primitives + shadcn/ui |
| State | React Context + `useReducer` |
| Backend | TanStack server functions (edge-compatible) |
| AI Provider | OpenAI GPT-4o-mini via backend API routes |
| Icons | Lucide React |
| Charts | Recharts |

---

## Getting Started

### Prerequisites
- [Bun](https://bun.sh/) (recommended) or Node.js 20+
- An [OpenAI API key](https://platform.openai.com/api-keys)

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd flowstate

# Install dependencies
bun install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local and add your OpenAI API key (optional — users can also enter it in-app)
```

### Running locally

```bash
bun dev
```

The dev server starts on `http://localhost:8080` by default.

### Building for production

```bash
bun run build
```

---

## Project Structure

```
src/
├── components/
│   ├── flowstate/          # App-specific components
│   │   ├── modules/        # Email, Meeting, Tasks, Research modules
│   │   ├── state.tsx        # Global state provider
│   │   ├── Sidebar.tsx      # Desktop sidebar + mobile tab bar
│   │   ├── Header.tsx       # Top bar with settings toggle
│   │   ├── Chatbot.tsx      # Floating chat interface
│   │   ├── SettingsPanel.tsx# API key & preferences
│   │   └── shared.tsx       # Disclaimer banners, shells, skeletons
│   └── ui/                 # shadcn/ui primitives (Button, Card, Dialog, Tabs, etc.)
├── lib/
│   ├── aiClient.ts         # Centralized frontend API client
│   ├── openai.server.ts    # Shared server-side OpenAI helper
│   └── utils.ts            # cn() and other utilities
├── routes/
│   ├── index.tsx           # Main dashboard shell
│   ├── __root.tsx          # Root layout + error boundaries
│   └── api/                # Server API routes
│       ├── generate-email.ts
│       ├── summarize-notes.ts
│       ├── plan-tasks.ts
│       ├── analyze-research.ts
│       └── chat-route.ts
├── styles.css              # Tailwind v4 theme, animations, custom utilities
└── router.tsx               # TanStack Router configuration
```

---

## API Endpoints

All AI features are powered by backend routes that proxy requests to OpenAI. The frontend sends the user's OpenAI API key via the `X-OpenAI-Key` header.

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/api/generate-email` | Compose professional emails by tone |
| `POST` | `/api/summarize-notes` | Extract summaries, action items, and decisions |
| `POST` | `/api/plan-tasks` | Generate a weekly schedule from natural language |
| `POST` | `/api/analyze-research` | Summarize and critique research text |
| `POST` | `/api/chat-route` | Classify intent, route to modules, pre-fill forms |

---

## Configuration

### OpenAI API Key

You can provide your OpenAI API key in two ways:

1. **In-app Settings panel** (recommended for personal use) — the key is stored in `localStorage` and sent with every request.
2. **Environment variable** — set `OPENAI_API_KEY` in `.env.local` as a server-side fallback.

> The in-app Settings panel key always takes precedence. If neither is set, the app shows a friendly prompt to open Settings.

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + K` | Open chatbot |
| `Cmd/Ctrl + 1` | Switch to Email Generator |
| `Cmd/Ctrl + 2` | Switch to Meeting Summarizer |
| `Cmd/Ctrl + 3` | Switch to Task Planner |
| `Cmd/Ctrl + 4` | Switch to Research Assistant |
| `Esc` | Close panels / exit Focus Mode |

---

## License

MIT
