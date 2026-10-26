# ELI10 — Explain Like I'm 10

Paste a confusing document (a hospital leaflet, a tenancy clause, a school form) and get it explained in plain words:

- **In short**: what the document is about
- **What you need to do**, with deadline badges
- **Watch out for**: risks and warnings
- **Questions to ask**, which you can copy as a numbered list

Every point carries the exact quote it came from. Click a point and that sentence lights up in the original text. If the AI's quote can't be found in the original, the app says so instead of showing a false highlight.

Nothing is stored. The text you paste is only sent to Gemini for that one explanation.

> ELI10 explains what a document says. It does not give legal or medical advice.

## Run it

Requires Node.js 20+. There are no npm dependencies.

```bash
cp .env.example .env      # then put your GEMINI_API_KEY in .env
npm start                 # http://localhost:3000
```

You can get a free Gemini API key at https://aistudio.google.com/apikey. Optional settings: `GEMINI_MODEL` (default `gemini-3.5-flash`) and `PORT` (default `3000`).

## Check it

```bash
npm run check
```

This runs the quote-matcher cases. If the server is running, it also sends the three built-in samples to `/api/explain` and reports how many quotes were found in the original.

## How it was built

ELI10 was planned and built with the [Devpost Learn skill pack](https://github.com/challengepost/learn-ai-basics) for Build With AI: Basics. The planning documents are in [`devpost/`](devpost/):

- [`scope.md`](devpost/scope.md)
- [`prd.md`](devpost/prd.md)
- [`spec.md`](devpost/spec.md)
- [`checklist.md`](devpost/checklist.md)
- [`app-map.html`](devpost/app-map.html), a short guide to the code

The sample documents in `public/samples.js` are invented for the demo.

## License

MIT
