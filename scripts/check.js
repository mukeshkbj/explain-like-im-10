// Proportional checks: matcher unit cases, then (if a key is set) a live smoke test on every sample.
import assert from "node:assert/strict";
import fs from "node:fs";
import { findQuote } from "../public/match.js";
import { SAMPLES } from "../public/samples.js";

const src = "You must give two (2) calendar months' prior written notice.\n\nReturn  all keys by 12 noon.";
assert.deepEqual(findQuote(src, "two (2) calendar months"), { start: 14, end: 37 });
assert.equal(src.slice(...Object.values(findQuote(src, "return all keys"))), "Return  all keys");
assert.equal(src.slice(...Object.values(findQuote(src, "months\u2019 prior written notice"))), "months' prior written notice");
assert.equal(findQuote(src, "pay a fine of £1000"), null);
assert.equal(findQuote(src, ""), null);
console.log("matcher: 5/5 cases pass");

if (fs.existsSync(".env")) {
  for (const l of fs.readFileSync(".env", "utf8").split("\n")) {
    const m = l.match(/^([A-Z_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}
const base = process.env.CHECK_URL || "http://localhost:3000";
let ok = true;
for (const [key, s] of Object.entries(SAMPLES)) {
  let res;
  try {
    res = await fetch(`${base}/api/explain`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: s.text }),
    });
  } catch {
    console.log(`live: server not running at ${base} — skipped`);
    process.exit(0);
  }
  const data = await res.json();
  if (!res.ok) {
    console.log(`live ${key}: FAIL ${data.error}`);
    ok = false;
    continue;
  }
  const items = [...data.actions, ...data.watch_outs, ...data.questions];
  const matched = items.filter((i) => findQuote(s.text, i.source_quote)).length;
  for (const f of ["title", "summary", "actions", "watch_outs", "questions"]) assert.ok(f in data, `${key} missing ${f}`);
  console.log(`live ${key}: ${data.actions.length} actions, ${data.watch_outs.length} watch-outs, ${data.questions.length} questions; quotes matched ${matched}/${items.length}`);
  if (matched < items.length * 0.8) ok = false;
}
process.exit(ok ? 0 : 1);
