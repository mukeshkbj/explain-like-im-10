---
doc: scope
status: approved
---

# ELI10 — Explain Like I'm 10

Paste a confusing official text (a hospital leaflet, a tenancy clause, a school form) and get a plain-English version a 10-year-old could follow — with every point linked back to the exact original words it came from.

> How this scope was made: the learner chose the idea ("Explain it like I'm 10": paste a confusing form, contract clause or medical leaflet and get the plain-English version, plus a list of questions to ask) and the goal ("nice and useful for everyone"). On a same-day deadline the learner asked the agent to propose the details ("you decide it"); the details below are agent proposals that the learner reviewed and approved.

## The Unique Kernel
**Trust you can check.** Every plain-English point shows the exact quote from the original it came from; click a point and the original sentence lights up. Plus, the output is shaped for action — not just "simpler words" but *what you need to do, by when*, *what to watch out for*, and *questions to ask* the doctor, landlord, or school.

## Who It's For
Someone helping a parent or relative with a confusing document — e.g. an adult child reading their mum's hospital discharge leaflet, or a first-time renter looking at a tenancy clause. Today they paste it into a chatbot, get a wall of text, and can't tell which parts the AI made up.

## The Core Loop
Open the page → paste text (or tap a sample) → press **Explain** → read a short card: summary, things to do, watch-outs, questions to ask → click any point to see where it came from in the original → copy the questions list to take along.
They come back every time a new letter, leaflet, or contract lands.

## Inspiration & Identity
Calm, friendly, reassuring — like a patient older sibling explaining a letter at the kitchen table. Large readable type, warm off-white background, one accent color, no jargon in the UI.

## Why This Matters to the Learner
"A nice and useful for everyone" app — almost everyone gets a document they don't understand.

## What "Working" Looks Like
Paste a real-looking tenancy clause or hospital leaflet, press Explain, and within a few seconds see the four-part card. The "oh, that's cool" beat: click "You must give 2 months' notice" and the original legal sentence highlights in the source text.

## The POC Boundary
- One page: paste box, Explain button, result card, original text with highlights.
- Three built-in sample texts for the demo.
- Real AI explanation (Gemini) returning structured points, each with its source quote.
- Copy "questions to ask" to clipboard.

## Later
- Upload a photo or PDF of the letter.
- Translate the explanation into other languages.
- Reading-level slider (age 7 / 10 / adult).
- Read-aloud.

## Explicitly Cut
- Accounts and saved history — not needed to prove the kernel; also avoids storing private medical/legal text.
- Legal or medical advice — the app explains, it does not advise; a disclaimer says so.
- Deployment — optional for the hackathon; a local app is recorded for the demo.
