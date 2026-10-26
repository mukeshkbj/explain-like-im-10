---
doc: spec
status: approved
---

# ELI10 — Technical Spec

## How This Works, In Plain Language
There are two pieces. A **web page** (plain HTML, CSS and JavaScript) where you paste text and see the result card. A tiny **Node.js server** that serves the page and passes your text to Google's **Gemini** AI, using a secret API key that stays on the server and never reaches the browser.
The server asks Gemini to answer in a fixed shape (JSON): a short summary, plus lists of actions, watch-outs and questions — and for every point, the exact words from the original it is based on. The page then finds those exact words in your original text and highlights them when you click a point.
No framework, no database, no build step: one `npm start` and it runs. That keeps a 1-afternoon proof of concept small and easy to read.

## The Core Journey Through the System
PRD ref: `prd.md > The Core Journey`.
1. Browser loads `/` → server sends `public/index.html`, `app.js`, `style.css`.
2. User taps a sample → `app.js` fills the textarea from `public/samples.js`.
3. User presses **Explain it** → `app.js` POSTs `{ text }` to `/api/explain`.
4. Server validates length → calls Gemini `generateContent` with the ELI10 instructions and a JSON response schema → returns the parsed JSON.
5. `app.js` renders the four sections; for each point it locates `source_quote` in the original text (exact match, then whitespace/case-insensitive match) and wraps it in a `<mark>` with an id.
6. Click a point → the matching `<mark>` gets the active style and scrolls into view. Unmatched quotes show "source not found".
7. **Copy questions** → `navigator.clipboard.writeText` with a numbered list.

## Stack
- **Node.js 20+** (built-in `http`, `fs`, `fetch`; zero npm dependencies) — https://nodejs.org/api/http.html. Rationale: nothing to install, easiest to read.
- **Plain HTML/CSS/JS** in the browser — https://developer.mozilla.org/. Rationale: one page doesn't need a framework.
- **Google Gemini API**, model `gemini-3.5-flash` (verified available on this key; `gemini-2.5-flash` is retired for new users) — https://ai.google.dev/gemini-api/docs/structured-output. Rationale: fast, free tier, supports structured JSON output.

## Where It Runs and How Someone Tries It
Runs locally in a browser.
```
cp .env.example .env      # put GEMINI_API_KEY=... in .env
npm start                 # node server.js
open http://localhost:3000
```
Optional env: `GEMINI_MODEL` (default `gemini-3.5-flash`), `PORT` (default 3000).
Demo recording: run locally, record the browser window. Submission needs a short demo video **and** a public GitHub repo; deployment is optional and not planned.

## Look and Feel
From `prd.md > Look and Feel`: background `#FBF8F3`, ink `#1F2933`, accent teal `#0F766E`, soft card shadows, 14px radius. System sans-serif stack (`-apple-system, Segoe UI, Roboto, …`), 18px base, 1.6 line height. Highlights: soft yellow `<mark>`, active = teal outline. Calm, spacious, kind copy.

## Components

### Static page (`public/index.html`, `public/style.css`)
Headline, textarea with counter, sample buttons, Explain button, result area (card + original panel), footer disclaimer.
PRD ref: `prd.md > Screens and Layout`, `prd.md > Paste and samples`.

### Samples (`public/samples.js`)
Three realistic, invented sample documents (hospital discharge leaflet, tenancy notice clause, school trip consent form). Clearly sample data.
PRD ref: `prd.md > Paste and samples`.

### Client logic (`public/app.js`)
Calls `/api/explain`, renders sections, source matching + highlighting, click-to-trace, copy questions, loading/error/empty states.
PRD ref: `prd.md > Explain like I'm 10`, `prd.md > Trace it back (the kernel)`, `prd.md > Copy questions`, `prd.md > States and Boundaries`.

### Source matcher (`public/match.js`)
Pure function `findQuote(original, quote)` → `{start, end}` or `null`. Exact match first, then normalised (collapse whitespace, case-insensitive, straight/curly quotes) match mapped back to original offsets. Shared by browser and the Node check script.
PRD ref: `prd.md > Trace it back (the kernel)`.

### Server (`server.js`)
Serves `public/`; `POST /api/explain` validates (non-empty, ≤ 6,000 chars), calls Gemini, returns JSON or `{error}` with a friendly message. Loads `.env` manually (no dotenv dependency).
PRD ref: `prd.md > Explain like I'm 10`, `prd.md > States and Boundaries`.

### Prompt and schema (`lib/explain.js`)
System instruction (explain for a 10-year-old; short sentences; copy `source_quote` word-for-word from the original; never invent items — empty lists allowed; no advice) + response schema:
```json
{ "title": "string", "summary": "string",
  "actions":    [{ "text": "string", "deadline": "string|empty", "source_quote": "string" }],
  "watch_outs": [{ "text": "string", "source_quote": "string" }],
  "questions":  [{ "text": "string", "source_quote": "string" }] }
```
PRD ref: `prd.md > Explain like I'm 10`.

## Data Model
Request: `{ text }`. Response: the schema above. Nothing persists — state lives in browser memory and is cleared on refresh (`prd.md > States and Boundaries`).

## File Structure
```
explain-like-im-10/
├── server.js            # HTTP server, static files, /api/explain
├── lib/explain.js       # Gemini call, prompt, response schema
├── public/
│   ├── index.html       # the one page
│   ├── style.css        # calm look and feel
│   ├── app.js           # UI behaviour, render, highlight, copy
│   ├── match.js         # findQuote() source matcher (also used by checks)
│   └── samples.js       # three sample documents
├── scripts/check.js     # node checks: matcher unit cases + live API smoke test
├── .env.example         # GEMINI_API_KEY= (no real secrets)
├── package.json         # "start": "node server.js", "check": "node scripts/check.js"
├── README.md            # what it is, how to run
└── devpost/             # scope, prd, spec, checklist (learner-profile is git-ignored)
```

## External Services and Dependencies
**Gemini API** — `POST https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent`, header `x-goog-api-key`. Body: `systemInstruction`, `contents`, `generationConfig: { responseMimeType: "application/json", responseSchema, temperature: 0.2 }`. Response text at `candidates[0].content.parts[0].text` (JSON string). Key: `GEMINI_API_KEY` (free tier from https://aistudio.google.com/apikey). Rate limits: free-tier per-minute limits — fine for a demo.

## Important Failure Modes
- **Gemini busy / rate-limited (503/429)** → each call has a 30-second timeout; on failure it tries `gemini-3.1-flash-lite`, then `gemini-flash-lite-latest`, then the main model once more, then shows "The explainer is busy — try again in a moment." Text stays in the box.
- **AI paraphrases instead of quoting** → normalised matching; if still not found, the point shows "source not found" (honest, no fake highlight).
- **Missing key** → server starts but `/api/explain` returns "Server has no GEMINI_API_KEY set."

## What Was Simplified and Why
- **Paste only** instead of photo/PDF upload — paste proves the kernel; upload needs OCR.
- **No database** — privacy and time; nothing to save in the PoC.
- **No framework** — one page; fewer moving parts to explain.

## Decisions and Open Issues
- Stack, model and architecture were recommended by the agent and accepted by the learner ("you decide it" + approval). Zero-dependency Node chosen so the repo is tiny and readable.
- Learner uncertainty: not established (the learner did not raise one). The genuine technical unknown in this plan is whether the AI will copy source quotes word-for-word; the build checks it with the live smoke test in `scripts/check.js` (count of matched quotes on all three samples).
- No open issues carried from `prd.md > Open Questions`.
