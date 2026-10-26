import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { explain } from "./lib/explain.js";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(ROOT, "public");
const MAX_CHARS = 6000;

function loadEnv() {
  const file = path.join(ROOT, ".env");
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
loadEnv();

const PORT = Number(process.env.PORT) || 3000;
const MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash";
const TYPES = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml" };

const send = (res, status, data) => {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
};

async function readJson(req) {
  let raw = "";
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > MAX_CHARS * 4) throw new Error("too large");
  }
  return JSON.parse(raw || "{}");
}

async function handleExplain(req, res) {
  let text;
  try {
    ({ text } = await readJson(req));
  } catch {
    return send(res, 400, { error: "That text is too long or not readable. Try a shorter piece." });
  }
  text = typeof text === "string" ? text.trim() : "";
  if (!text) return send(res, 400, { error: "Paste some text first." });
  if (text.length > MAX_CHARS)
    return send(res, 400, { error: `That's a lot! Please paste up to ${MAX_CHARS.toLocaleString()} characters at a time.` });
  if (!process.env.GEMINI_API_KEY) return send(res, 500, { error: "Server has no GEMINI_API_KEY set." });
  try {
    const result = await explain(text, { apiKey: process.env.GEMINI_API_KEY, model: MODEL });
    send(res, 200, result);
  } catch (e) {
    console.error("explain failed:", e.status || "", e.message);
    const busy = [429, 500, 503, 504].includes(e.status);
    send(res, 502, {
      error: busy ? "The explainer is busy right now. Please try again in a moment." : "Something went wrong explaining that. Please try again.",
    });
  }
}

function serveStatic(req, res) {
  const urlPath = decodeURIComponent(new URL(req.url, "http://x").pathname);
  const file = path.join(PUBLIC, urlPath === "/" ? "index.html" : urlPath);
  if (!file.startsWith(PUBLIC) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404);
    return res.end("Not found");
  }
  res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" });
  fs.createReadStream(file).pipe(res);
}

http
  .createServer((req, res) => {
    if (req.method === "POST" && req.url === "/api/explain") return handleExplain(req, res);
    if (req.method === "GET") return serveStatic(req, res);
    res.writeHead(405);
    res.end();
  })
  .listen(PORT, () => console.log(`ELI10 running at http://localhost:${PORT} (model: ${MODEL})`));
