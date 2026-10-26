---
doc: prd
status: approved
---

# ELI10 — Product Requirements

A one-page web app that turns a confusing document into a plain-English, action-focused card where every point is traceable to the original words. For someone helping a parent or relative with a letter, leaflet, or contract.
Source: `scope.md > The Unique Kernel`, `scope.md > Who It's For`.

## The Core Journey
1. The user opens the app and sees a short headline ("Paste something confusing. Get it explained like you're 10."), a large text box, three sample buttons (Hospital leaflet, Tenancy clause, School trip form), and an **Explain it** button.
2. They paste text or tap a sample (which fills the box).
3. They press **Explain it**. The button shows a friendly loading state ("Reading it carefully…").
4. A result card appears with four sections: **In short** (2–3 sentences), **What you need to do** (actions, with any deadline shown as a badge), **Watch out for** (risky, unusual, or easily missed bits), **Questions to ask** (ready to take to the doctor/landlord/school).
5. Next to the card, the original text is shown. Clicking any point in the card highlights the exact original passage it came from and scrolls to it.
6. They press **Copy questions** and the questions list is copied to the clipboard.
Success: the user understands the document and knows what to do and what to ask.
Source: `scope.md > The Core Loop`.

## Screens and Layout
One screen. Top: headline and input area. After explaining: two columns on desktop — result card (left), original text with highlights (right); stacked on mobile. A **Start over** link clears everything.

## Look and Feel
Calm and reassuring (`scope.md > Inspiration & Identity`): warm off-white background, dark ink text, one teal accent, rounded cards, large readable sans-serif type (18px base), generous spacing. Section headings have simple emoji-free icons/labels. Plain, kind UI copy; no jargon. Avoid generic purple-gradient "AI app" styling.

## Features and Behavior

### Paste and samples
- [ ] Text box accepts up to ~6,000 characters; a counter shows length.
- [ ] Each sample button fills the box with a realistic sample document.

### Explain like I'm 10
- [ ] Pressing **Explain it** with text returns the four-section card within roughly 10 seconds.
- [ ] Language in the card is short sentences, everyday words — readable by a 10-year-old.
- [ ] Deadlines/time limits found in the text appear as a badge on the related action (e.g. "within 2 months").

### Trace it back (the kernel)
- [ ] Every point in every section has a source quote taken word-for-word from the original.
- [ ] Clicking a point highlights that quote in the original text panel and scrolls it into view; the clicked point is marked active.
- [ ] If a quote cannot be found exactly in the original, the point shows "source not found" instead of a false highlight.

### Copy questions
- [ ] **Copy questions** copies the questions as a numbered plain-text list and shows "Copied!".

## States and Boundaries
- **First use / empty** — samples and an example placeholder invite the user; Explain is disabled until there is text.
- **Loading** — button disabled, "Reading it carefully…".
- **Error** (AI unavailable, key missing, too long) — a friendly message and the text stays in the box so they can retry.
- **Nothing to do** — if the document has no actions or watch-outs, that section says "Nothing here needs action." rather than inventing items.
- **Persistence** — nothing is stored; refreshing clears everything (privacy for medical/legal text).
- **Disclaimer** — small footer: "This explains, it doesn't give legal or medical advice."

## Product Decisions
- Idea and goal chosen by the learner; details proposed by the agent at the learner's request ("you decide it") and approved by the learner.
- Four fixed sections, not free-form chat — makes the output scannable and action-focused.
- Source quotes for every point — the trust kernel.
- Nothing saved — private documents shouldn't be stored.

## What We're Building
Everything under **Features and Behavior** and **States and Boundaries**, on one page, with three samples.

## Deferred From the POC
- Photo/PDF upload — needs OCR/file handling; paste proves the kernel.
- History of past explanations — needs storage; cut for privacy and time.

## Possible Later Enhancements
Translation, reading-level slider, read-aloud, print-friendly view.

## Non-Goals
- Giving legal or medical advice.
- Chatting back and forth about the document.
- User accounts.

## Open Questions
None blocking `4-spec`.
