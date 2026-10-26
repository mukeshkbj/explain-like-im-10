const QUOTES = { "\u2018": "'", "\u2019": "'", "\u201C": '"', "\u201D": '"', "\u2013": "-", "\u2014": "-" };

function normalise(str) {
  let out = "";
  const map = [];
  let lastSpace = true;
  for (let i = 0; i < str.length; i++) {
    let ch = QUOTES[str[i]] || str[i];
    if (/\s/.test(ch)) {
      if (lastSpace) continue;
      ch = " ";
      lastSpace = true;
    } else {
      lastSpace = false;
    }
    out += ch.toLowerCase();
    map.push(i);
  }
  if (out.endsWith(" ")) {
    out = out.slice(0, -1);
    map.pop();
  }
  return { out, map };
}

export function findQuote(original, quote) {
  if (!quote || !quote.trim()) return null;
  const exact = original.indexOf(quote);
  if (exact !== -1) return { start: exact, end: exact + quote.length };

  const o = normalise(original);
  const q = normalise(quote).out.replace(/^[\s"'.,;:…]+|[\s"'.,;:…]+$/g, "");
  if (q.length < 4) return null;
  const idx = o.out.indexOf(q);
  if (idx === -1) return null;
  return { start: o.map[idx], end: o.map[idx + q.length - 1] + 1 };
}
