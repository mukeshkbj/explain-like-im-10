---
doc: checklist
status: approved
---

# Build Checklist

Build mode: fast (learner chose speed on a same-day deadline; checkpoints: final kick-the-tires only)

## Slices

- [x] **1. Paste a sample, press Explain, see the four-section card**
  Becomes usable: A running app where a sample (or pasted text) is explained by Gemini into In short / What you need to do / Watch out for / Questions to ask.
  Why now: Proves the whole path — page, server, Gemini structured output — and the kernel data (source quotes) on the first slice.
  PRD ref: `prd.md > The Core Journey` (steps 1-4), `prd.md > Paste and samples`, `prd.md > Explain like I'm 10`
  Spec ref: `spec.md > Server (server.js)`, `spec.md > Prompt and schema (lib/explain.js)`, `spec.md > Static page`, `spec.md > Samples`, `spec.md > File Structure`
  Build: Scaffold package.json, server.js, lib/explain.js, public/ files and samples; render the card.
  Verify (mechanical): `npm start` boots with no errors; POST each sample to `/api/explain` returns valid JSON with all four sections.
  Learner check: Open the app, tap a sample, press Explain it, and say whether the card reads like it's for a 10-year-old.
  Commit: `Explain a pasted document into a four-part card`

- [x] **2. Click a point to see where it came from (the kernel)**
  Becomes usable: Clicking any point highlights its exact original passage; unmatched quotes show "source not found".
  Why now: This is the unique kernel; it must work before polish.
  PRD ref: `prd.md > Trace it back (the kernel)`
  Spec ref: `spec.md > Source matcher (public/match.js)`, `spec.md > Client logic (public/app.js)`
  Build: findQuote() exact + normalised match, wrap marks in the original panel, click-to-highlight and scroll.
  Verify (mechanical): `npm run check` — matcher unit cases pass; live smoke test reports matched-quote counts for all three samples.
  Learner check: Click three different points and confirm the right sentence lights up each time.
  Commit: `Trace each point back to the original text`

- [x] **3. Copy questions, states, and calm look**
  Becomes usable: Copy questions to clipboard; empty, loading, error, nothing-to-do states; disclaimer; final styling and responsive layout.
  Why now: Completes the product experience for the demo.
  PRD ref: `prd.md > Copy questions`, `prd.md > States and Boundaries`, `prd.md > Look and Feel`
  Spec ref: `spec.md > Look and Feel`, `spec.md > Important Failure Modes`
  Build: Copy button, state handling, retry/fallback model on 429/503, styles.
  Verify (mechanical): Browser run-through of the full core journey; error path with an empty/oversized input; copy shows "Copied!".
  Learner check: Run the whole journey once on a sample and once on your own pasted text.
  Commit: `Add copy questions, states and final styling`

## Hands-on Checkpoints

- [ ] Early usable behavior explored — shared final-review session (fast mode, tiny build)
- [ ] Final kick-the-tires exploration and feedback completed

## Final Review

- [ ] Final review complete — feedback resolved and learner confirms ready to ship

## Code Tour and App Map

- [ ] Learning activity complete — guided route, focused alternative, prior practice connected, or brief recap
- [ ] Optional edit and transfer reflection addressed — offered/declined/already covered/not applicable as appropriate
- [ ] `devpost/app-map.html` generated from finished code, checked, and shown, including a project-grounded practice to reuse

Activity and evidence:
Route and stops:
Edit outcome:
Reflection:
Activity mode:

## Revisions

- Fast mode on a same-day deadline: the three slices were implemented in one pass and verified together, so they landed as one code commit rather than three. Verification: `npm run check` (matcher 5/5; live quotes matched 10/10, 9/9, 11/11) and a scripted browser run (empty/oversize disable Explain, sample → card, click → highlighted source, Copy questions → numbered list in clipboard, mobile layout).
- Gemini sometimes returned 503 "high demand" and once hung for minutes. Added a per-call timeout and model fallbacks (`lib/explain.js > explain`). Later the free-tier quota for `gemini-3.5-flash` ran out (429) while `gemini-flash-latest` stayed overloaded, so the fallbacks became `gemini-3.1-flash-lite` and `gemini-flash-lite-latest`; both returned 100% exact quotes on the hospital sample. The timeout is 30 seconds.
