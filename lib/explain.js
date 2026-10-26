const API = "https://generativelanguage.googleapis.com/v1beta/models";
const FALLBACK_MODELS = ["gemini-3.1-flash-lite", "gemini-flash-lite-latest"];

const point = (extra = {}) => ({
  type: "OBJECT",
  properties: {
    text: { type: "STRING" },
    ...extra,
    source_quote: { type: "STRING" },
  },
  required: ["text", ...Object.keys(extra), "source_quote"],
});

export const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    title: { type: "STRING" },
    summary: { type: "STRING" },
    actions: { type: "ARRAY", items: point({ deadline: { type: "STRING" } }) },
    watch_outs: { type: "ARRAY", items: point() },
    questions: { type: "ARRAY", items: point() },
  },
  required: ["title", "summary", "actions", "watch_outs", "questions"],
};

export const INSTRUCTIONS = `You explain confusing documents (medical leaflets, contracts, forms, official letters) so a 10-year-old could understand them.

Write for a 10-year-old: short sentences, everyday words, no jargon. If you must use a hard word, explain it in brackets. Speak to the reader as "you".

Return:
- title: a 2-6 word plain name for the document.
- summary: 2-3 short sentences saying what this document is and what it means for the reader.
- actions: things the reader must do. Put any time limit or date in "deadline" in plain words (e.g. "within 2 months", "by 14 March"); use "" if there is none.
- watch_outs: risky, unusual, costly or easy-to-miss parts.
- questions: 3-5 useful questions the reader could ask (the doctor, landlord, school, company...). Each should be about something specific in the document.

Every item MUST have source_quote: a short passage (one sentence or phrase, under 30 words) copied EXACTLY, character for character, from the original document, that the item is based on. Never paraphrase the quote. Never quote text that is not in the document.

Only include items that are really in the document. If there are no actions or watch-outs, return an empty list. Do not give legal or medical advice; explain what the document says.`;

async function callModel(model, text, apiKey) {
  const res = await fetch(`${API}/${model}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    signal: AbortSignal.timeout(30000),
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: INSTRUCTIONS }] },
      contents: [{ role: "user", parts: [{ text: `Document:\n"""\n${text}\n"""` }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
        temperature: 0.2,
      },
    }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(body?.error?.message || `Gemini error ${res.status}`);
    err.status = res.status;
    throw err;
  }
  const out = body?.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("");
  if (!out) throw new Error("Gemini returned an empty answer");
  return JSON.parse(out);
}

const retryable = (e) =>
  [429, 500, 503, 504].includes(e.status) || e instanceof SyntaxError || e.name === "TimeoutError";

export async function explain(text, { apiKey, model }) {
  const attempts = [model, ...FALLBACK_MODELS.filter((m) => m !== model), model];
  let lastError;
  for (const [i, m] of attempts.entries()) {
    if (i > 0) await new Promise((r) => setTimeout(r, 500));
    try {
      return await callModel(m, text, apiKey);
    } catch (e) {
      lastError = e;
      if (!retryable(e)) break;
    }
  }
  throw lastError;
}
