import { json, clientIp, rateLimit, allowedOrigin, oneLine } from "./_lib.js";

/*
  GET  /api/guestbook   ->  { configured, entries: [{ id, name, message, createdAt }] }   approved entries only
  POST /api/guestbook      { name, message, website, t }   ->  stored as NOT approved, you approve it in Supabase

  Spam protection, same idea as /api/contact:
  origin check, honeypot ("website"), form-open timing ("t"), rate limit (3 / 30 min / IP), strict validation,
  and links are rejected outright (a guestbook has no reason to contain them).

  Env (Vercel -> Settings -> Environment Variables, never prefix with VITE_):
    SUPABASE_URL                 e.g. https://abcdxyz.supabase.co
    SUPABASE_SERVICE_ROLE_KEY    the service_role key (Project Settings > API). Server only, it bypasses RLS.
  Table: run supabase/guestbook.sql once.
*/
const LINK = /(https?:|www\.|\b[a-z0-9-]+\.(?:com|net|org|io|xyz|ru|cn|biz|info|site|online|shop)\b)/i;

const rest = (path, init = {}) => {
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY: key } = process.env;
  return fetch(`${SUPABASE_URL.replace(/\/$/, "")}/rest/v1/${path}`, {
    ...init,
    headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", ...init.headers },
  });
};

export default async function handler(req, res) {
  const configured = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

  if (req.method === "GET") {
    if (!configured) return json(res, 200, { configured: false, entries: [] });
    try {
      const r = await rest("guestbook?select=id,name,message,created_at&approved=eq.true&order=created_at.desc&limit=60");
      if (!r.ok) throw new Error(`supabase ${r.status} ${await r.text().catch(() => "")}`);
      const rows = await r.json();
      res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
      return json(res, 200, { configured: true, entries: rows.map((x) => ({ id: x.id, name: x.name, message: x.message, createdAt: x.created_at })) });
    } catch (err) {
      console.error("guestbook: read failed", err);
      return json(res, 502, { error: "Could not load the guestbook right now." });
    }
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return json(res, 405, { error: "Method not allowed" });
  }
  if (!allowedOrigin(req)) return json(res, 403, { error: "Forbidden" });
  if (!rateLimit(`guestbook:${clientIp(req)}`, 3, 30 * 60 * 1000)) {
    return json(res, 429, { error: "Too many messages. Please try again later." });
  }

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { return json(res, 400, { error: "Invalid request" }); }
  }
  const { name = "", message = "", website = "", t = 0 } = body || {};

  if (website) return json(res, 200, { ok: true }); // honeypot: look successful, store nothing
  const elapsed = Date.now() - Number(t);
  if (!(elapsed > 2000 && elapsed < 24 * 3600 * 1000)) {
    return json(res, 400, { error: "That was quick! Please take a moment and try again." });
  }

  const n = oneLine(name);
  const m = oneLine(message);
  if (n.length < 1 || n.length > 60) return json(res, 400, { error: "Please enter your name (up to 60 characters)." });
  if (m.length < 3 || m.length > 280) return json(res, 400, { error: "Message must be between 3 and 280 characters." });
  if (LINK.test(n) || LINK.test(m)) return json(res, 400, { error: "Please leave links out of your message." });

  if (!configured) {
    console.error("guestbook: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not set");
    return json(res, 503, { error: "The guestbook is not switched on yet." });
  }

  try {
    const r = await rest("guestbook", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ name: n, message: m, approved: false }) });
    if (!r.ok) {
      console.error("guestbook: insert failed", r.status, await r.text().catch(() => ""));
      return json(res, 502, { error: "Could not save your message right now." });
    }
    return json(res, 200, { ok: true });
  } catch (err) {
    console.error("guestbook: insert error", err);
    return json(res, 502, { error: "Could not save your message right now." });
  }
}
