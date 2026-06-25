# FlowState

> **Calm, AI-powered automation for everyday workplace tasks.**

FlowState is a single-page dashboard that helps professionals draft email, summarize meeting notes, plan their week, and analyze research — all from one focused workspace, with a persistent AI assistant one shortcut away.

---

## Overview

FlowState bundles five AI modules into a quiet, keyboard-first interface designed around the "Calm Tech" aesthetic. It uses OpenAI (`gpt-4o-mini`) under the hood, but every output is editable, explainable, and exportable — the human stays in the driver's seat.

## Problem Statement

Knowledge workers lose hours every week to repetitive writing tasks: rewording emails for tone, reformatting messy meeting notes into action items, juggling task lists across tools, and skimming long articles for the parts that actually matter. Existing AI tools solve fragments of this, but force users to swap between five tabs, copy-paste prompts, and trust opaque outputs.

## Solution

FlowState gives each common task its own purpose-built module, sharing a single state, settings panel, and chat assistant:

1. **Smart Email Generator** — role + tone + bullets → editable draft
2. **Meeting Notes Summarizer** — raw notes → summary, action items, decisions
3. **AI Task Planner** — natural language → weekly schedule + overload detection
4. **AI Research Assistant** — article/URL → TL;DR, key claims, bias flags, skeptic mode
5. **Analytics** — local usage, time saved, average confidence

A floating chatbot can classify intent and pre-fill any module — "Summarize the notes I just pasted" routes you straight to the right tool.

## Features

### 📧 Smart Email Generator
- Recipient role, subject, free-form context, four tones (Formal / Friendly / Persuasive / Diplomatic)
- Editable output with responsible-AI disclaimer
- Copy to clipboard · Download as `.txt`
- Typing reveal animation with skip button

### 📝 Meeting Notes Summarizer
- Tabs for Executive Summary, Action Items (owner + deadline), Key Decisions, Follow-ups
- Per-item confidence scores with tooltips
- Export as PDF (print-to-PDF) · Email summary via `mailto:` link
- Check off action items with a success micro-animation

### 🗓 AI Task Planner
- Natural language → 5-day grid with priority (High / Medium / Low) and durations
- Drag-and-drop reschedule · per-day total hours · `>8h` overload warning
- **List ↔ Calendar** toggle with month view, colored priority dots, "Today" button
- Overdue tasks shown with strikethrough + red border
- Export as `.ics` · Copy as plain text

### 🔍 AI Research Assistant
- TL;DR, key claims with evidence-strength rating, bias flags, recommendations
- **Skeptic Mode** surfaces counter-arguments inline
- Export as `.md` markdown · Copy citations list

### 📊 Analytics
- Weekly module usage bar chart (Recharts)
- Estimated time saved · average meeting confidence
- Empty state until you start using FlowState
- 100% local — `localStorage` only

### 🤖 Persistent Chatbot
- Floating bubble, `⌘K` to toggle
- Intent classification routes you to the right module with pre-filled forms
- History persisted (last 10 turns)

### ✨ Premium polish
- Progressive typing animation with cursor blink, variable cadence, skip-after-1s
- Respects `prefers-reduced-motion`
- Pop-in checkmark micro-animation on copy / export / save
- `⌘?` opens a keyboard-shortcut overlay
- Help & Support modal in sidebar footer
- Dark mode · collapsible "Focus Mode" sidebar · bottom tabbar on mobile

## Tech Stack

| Layer            | Choice                                            |
| ---------------- | ------------------------------------------------- |
| Framework        | React 18 + TanStack Start (file-based routing)    |
| Styling          | Tailwind CSS v4 (OKLCH tokens, custom theme)      |
| UI Components    | Custom + shadcn primitives, `sonner` for toasts   |
| State            | React Context + `localStorage` persistence        |
| Backend          | TanStack Start serverless routes (`/api/*`)       |
| AI Provider      | OpenAI `gpt-4o-mini` (JSON mode)                  |
| Icons            | `lucide-react`                                    |
| Charts           | `recharts`                                        |
| Runtime          | Bun (Node 18+ also supported)                     |

## Getting Started

### Prerequisites
- **Bun** ≥ 1.1 *(or Node ≥ 18 + npm)*
- An **OpenAI API key** (`sk-…`)

### Installation
```bash
git clone https://github.com/<your-org>/flowstate.git
cd flowstate
bun install        # or: npm install
```

### Run locally
```bash
bun dev            # or: npm run dev
# open http://localhost:5173
```

On first run, click the **Settings** gear and paste your OpenAI API key. It's stored only in your browser's `localStorage` and forwarded to the backend per request via an `X-OpenAI-Key` header — never logged.

### Build for production
```bash
bun run build      # or: npm run build
bun run start      # or: npm run start
```

## Project Structure

```
src/
├── components/
│   └── flowstate/
│       ├── modules/
│       │   ├── EmailGenerator.tsx
│       │   ├── MeetingSummarizer.tsx
│       │   ├── TaskPlanner.tsx
│       │   ├── ResearchAssistant.tsx
│       │   └── Analytics.tsx
│       ├── Chatbot.tsx
│       ├── Sidebar.tsx
│       ├── Header.tsx
│       ├── SettingsPanel.tsx
│       ├── ShortcutsModal.tsx
│       ├── HelpModal.tsx
│       ├── Modal.tsx
│       ├── Flash.tsx          ← success/warn micro-animation
│       ├── typing.tsx         ← typewriter hook + <TypedText>
│       ├── shared.tsx         ← Disclaimer, Skeletons, EmptyState
│       └── state.tsx          ← AppProvider + keyboard shortcuts
├── lib/
│   ├── aiClient.ts            ← frontend fetch wrapper
│   ├── openai.server.ts       ← server OpenAI client
│   ├── analytics.ts           ← usage + time-saved tracking
│   └── exports.ts             ← Blob/.ics/.md/mailto helpers
├── routes/
│   ├── __root.tsx
│   ├── index.tsx              ← dashboard shell
│   └── api/
│       ├── generate-email.ts
│       ├── summarize-notes.ts
│       ├── plan-tasks.ts
│       ├── analyze-research.ts
│       └── chat-route.ts
└── styles.css
```

## API Endpoints

| Method | Endpoint                  | Purpose                                                      |
| ------ | ------------------------- | ------------------------------------------------------------ |
| POST   | `/api/generate-email`     | Tone-controlled email draft from role + subject + context    |
| POST   | `/api/summarize-notes`    | Structured summary, actions, decisions, follow-ups (JSON)    |
| POST   | `/api/plan-tasks`         | Weekly schedule + overload warnings + totals (JSON)          |
| POST   | `/api/analyze-research`   | TL;DR, claims, evidence, bias flags; optional skeptic mode   |
| POST   | `/api/chat-route`         | Intent classification + module routing + form pre-fill       |

All routes accept the user's OpenAI key via the `X-OpenAI-Key` request header.

## Configuration

**Option 1 — In-app (recommended for evaluators):**
Click the gear icon → paste your `sk-…` key → Save. Stored in `localStorage`.

**Option 2 — Environment variable (server fallback):**
```bash
# .env.local
OPENAI_API_KEY=sk-...
```
When the header is absent, the server falls back to `process.env.OPENAI_API_KEY`.

## Keyboard Shortcuts

| Shortcut         | Action                              |
| ---------------- | ----------------------------------- |
| `⌘K` / `Ctrl+K`  | Toggle chatbot                      |
| `⌘1` … `⌘5`     | Jump to Email / Meeting / Tasks / Research / Analytics |
| `⌘?`             | Open keyboard-shortcut overlay      |
| `⌘.`             | Toggle Focus Mode (collapsed sidebar) |
| `Esc`            | Close any open modal or panel       |
| `Tab` / `Shift+Tab` | Standard focus navigation        |

## Prompt Engineering

- **Email** — few-shot tone exemplars + explicit constraints ("no fabricated facts", "preserve every bullet").
- **Meeting Notes** — JSON-mode structured output with confidence scores; chain-of-thought is hidden via "think first, then return only the JSON".
- **Task Planner** — JSON schema with priorities/durations; the model is instructed to flag any day exceeding 8 hours.
- **Research Assistant** — two-pass behaviour: standard mode extracts claims; **skeptic mode** re-runs each claim through a "devil's advocate" prompt and adds counter-arguments.
- **Chat Router** — strict intent-classification prompt returns one of `{email|meeting|tasks|research|null}` plus a `prefill` object, enabling deterministic UI routing on top of free-form chat.

## Responsible AI

FlowState ships with concrete safeguards rather than vague disclaimers:

- 🟡 **Inline disclaimers** on every module ("AI-generated — review before sending")
- ✏️ **Always editable** — generated text is a starting point, never the final word
- 📊 **Confidence scores** on extracted action items and decisions
- 🧭 **Skeptic Mode** for counter-arguments and bias flags on research
- ⚠️ **Overload warnings** when the planner exceeds 8 hours/day
- 📤 **No auto-send** — email drafts open `mailto:` or download as `.txt`; the user always hits Send
- 🔒 **Local-first** — API keys, chat history, preferences, and analytics live in your browser

## License

[MIT](./LICENSE) © FlowState contributors
