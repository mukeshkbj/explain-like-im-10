import { findQuote } from "./match.js";
import { SAMPLES } from "./samples.js";

const MAX = 6000;
const $ = (id) => document.getElementById(id);
const doc = $("doc");
const explainBtn = $("explain");
const errorBox = $("error");
const result = $("result");
let questions = [];

function updateCount() {
  const n = doc.value.length;
  $("count").textContent = `${n.toLocaleString()} / ${MAX.toLocaleString()}`;
  $("count").classList.toggle("over", n > MAX);
  explainBtn.disabled = !doc.value.trim() || n > MAX;
}

function showError(msg) {
  errorBox.textContent = msg;
  errorBox.hidden = !msg;
}

function setLoading(on) {
  explainBtn.classList.toggle("loading", on);
  explainBtn.disabled = on;
  explainBtn.textContent = on ? "Reading it carefully…" : "Explain it";
  if (!on) updateCount();
}

function renderOriginal(original, spans) {
  const box = $("r-original");
  box.textContent = "";
  const sorted = spans.filter((s) => s.range).sort((a, b) => a.range.start - b.range.start);
  let pos = 0;
  for (const s of sorted) {
    if (s.range.start < pos) continue; // overlapping quote: its point still links to the earlier mark
    box.append(original.slice(pos, s.range.start));
    const mark = document.createElement("mark");
    mark.id = s.id;
    mark.textContent = original.slice(s.range.start, s.range.end);
    box.append(mark);
    pos = s.range.end;
  }
  box.append(original.slice(pos));
  for (const s of spans) {
    if (!s.range) continue;
    if (!document.getElementById(s.id)) {
      const host = sorted.find((o) => document.getElementById(o.id) && o.range.start <= s.range.start && o.range.end >= s.range.start);
      s.id = host ? host.id : null;
    }
  }
}

function activate(li, markId) {
  document.querySelectorAll(".points li.active, mark.active").forEach((el) => el.classList.remove("active"));
  li.classList.add("active");
  const mark = markId && document.getElementById(markId);
  if (mark) {
    mark.classList.add("active");
    mark.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

function renderList(listEl, items, kind, original, spans, emptyText) {
  listEl.textContent = "";
  if (!items.length) {
    const li = document.createElement("p");
    li.className = "empty";
    li.textContent = emptyText;
    listEl.append(li);
    return;
  }
  items.forEach((item, i) => {
    const span = { id: `src-${kind}-${i}`, range: findQuote(original, item.source_quote) };
    spans.push(span);
    const li = document.createElement("li");
    li.tabIndex = 0;
    li.append(item.text);
    if (item.deadline && item.deadline.trim()) {
      const b = document.createElement("span");
      b.className = "deadline";
      b.textContent = item.deadline;
      li.append(b);
    }
    if (!span.range) {
      const n = document.createElement("span");
      n.className = "nosrc";
      n.textContent = "source not found in the original";
      li.append(n);
    }
    const go = () => activate(li, span.range && span.id);
    li.addEventListener("click", go);
    li.addEventListener("keydown", (e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), go()));
    listEl.append(li);
  });
}

function render(data, original) {
  $("r-title").textContent = data.title || "Here's what it means";
  $("r-summary").textContent = data.summary || "";
  const spans = [];
  renderList($("r-actions"), data.actions || [], "do", original, spans, "Nothing here needs action.");
  renderList($("r-watch"), data.watch_outs || [], "watch", original, spans, "Nothing tricky spotted.");
  renderList($("r-questions"), data.questions || [], "ask", original, spans, "No questions suggested.");
  renderOriginal(original, spans);
  questions = (data.questions || []).map((q) => q.text);
  $("copy").hidden = !questions.length;
  result.hidden = false;
  document.getElementById("input-section").hidden = true;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function explain() {
  const text = doc.value.trim();
  if (!text) return;
  showError("");
  setLoading(true);
  try {
    const res = await fetch("/api/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const data = await res.json().catch(() => ({ error: "Something went wrong. Please try again." }));
    if (!res.ok || data.error) throw new Error(data.error || "Something went wrong. Please try again.");
    render(data, text);
  } catch (e) {
    showError(e.message === "Failed to fetch" ? "Can't reach the ELI10 server. Is it running?" : e.message);
  } finally {
    setLoading(false);
  }
}

document.querySelectorAll("[data-sample]").forEach((btn) =>
  btn.addEventListener("click", () => {
    doc.value = SAMPLES[btn.dataset.sample].text;
    updateCount();
    showError("");
    doc.focus();
  })
);
doc.addEventListener("input", updateCount);
explainBtn.addEventListener("click", explain);
doc.addEventListener("keydown", (e) => (e.metaKey || e.ctrlKey) && e.key === "Enter" && !explainBtn.disabled && explain());

$("copy").addEventListener("click", async () => {
  const txt = questions.map((q, i) => `${i + 1}. ${q}`).join("\n");
  try {
    await navigator.clipboard.writeText(txt);
  } catch {
    const t = document.createElement("textarea");
    t.value = txt;
    document.body.append(t);
    t.select();
    document.execCommand("copy");
    t.remove();
  }
  $("copy").textContent = "Copied!";
  setTimeout(() => ($("copy").textContent = "Copy questions"), 1800);
});

$("restart").addEventListener("click", () => {
  result.hidden = true;
  document.getElementById("input-section").hidden = false;
  doc.value = "";
  updateCount();
  doc.focus();
});

updateCount();
