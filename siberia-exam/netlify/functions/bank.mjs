// Siberian Induction Exam: question bank storage.
//   GET  /api/bank   -> the saved question bank (or null if never saved; the page then uses its built-in bank)
//   PUT  /api/bank   -> save a new bank (needs header x-admin-password)
//   POST /api/admin  -> check the admin password before opening review mode
// The admin password lives only in the ADMIN_PASSWORD environment variable on Netlify.
import { getStore } from "@netlify/blobs";
import { createHash, timingSafeEqual } from "node:crypto";

const MAX_BYTES = 500_000;
const TYPES = new Set(["mcq", "multi", "typed", "number", "verdicts", "match", "order", "cloze", "ledger", "sort", "forgery", "builder"]);
const SECTIONS = new Set(["ant", "tun", "arc"]);

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function passwordOK(given) {
  const real = Netlify.env.get("ADMIN_PASSWORD");
  if (!real) return null; // not configured yet
  const a = createHash("sha256").update(String(given ?? "")).digest();
  const b = createHash("sha256").update(real).digest();
  return timingSafeEqual(a, b);
}

function validBank(d) {
  if (!d || typeof d !== "object") return false;
  const { questions, gate } = d;
  if (!Array.isArray(questions) || questions.length < 1 || questions.length > 500) return false;
  if (!gate || typeof gate.q !== "string" || !gate.q.trim()) return false;
  if (!Array.isArray(gate.accept) || !gate.accept.length || gate.accept.some((a) => typeof a !== "string")) return false;
  const ids = new Set();
  for (const q of questions) {
    if (!q || typeof q !== "object") return false;
    if (typeof q.id !== "string" || ids.has(q.id)) return false;
    ids.add(q.id);
    if (!SECTIONS.has(q.s) || !TYPES.has(q.t)) return false;
    if (typeof q.p !== "string" || !q.p.trim()) return false;
    if (typeof q.w !== "number" || !(q.w > 0) || q.w > 100) return false;
  }
  return true;
}

export default async (req) => {
  const { pathname } = new URL(req.url);
  const store = getStore({ name: "siberia-exam", consistency: "strong" });

  if (pathname === "/api/admin") {
    if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
    let body = {};
    try { body = await req.json(); } catch {}
    const ok = passwordOK(body.password);
    if (ok === null) return json({ error: "not_configured" }, 503);
    if (!ok) { await sleep(800); return json({ error: "wrong_password" }, 401); }
    return json({ ok: true });
  }

  if (req.method === "GET") {
    const bank = await store.get("bank", { type: "json" });
    return json(bank ?? null);
  }

  if (req.method === "PUT") {
    const ok = passwordOK(req.headers.get("x-admin-password"));
    if (ok === null) return json({ error: "not_configured" }, 503);
    if (!ok) { await sleep(800); return json({ error: "wrong_password" }, 401); }
    const text = await req.text();
    if (text.length > MAX_BYTES) return json({ error: "too_large" }, 413);
    let data;
    try { data = JSON.parse(text); } catch { return json({ error: "bad_json" }, 400); }
    if (!validBank(data)) return json({ error: "invalid_bank" }, 400);
    await store.setJSON("bank", { v: 2, questions: data.questions, gate: data.gate, updatedAt: Date.now() });
    return json({ ok: true });
  }

  return json({ error: "method_not_allowed" }, 405);
};

export const config = { path: ["/api/bank", "/api/admin"] };
