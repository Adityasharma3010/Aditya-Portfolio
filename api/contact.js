import { json, clientIp, rateLimit, allowedOrigin, escapeHtml, oneLine } from "./_lib.js";

/*
  POST /api/contact   { name, email, message, website, t }

  Spam protection, cheapest first:
  - origin check            only this site may post from a browser
  - honeypot ("website")    hidden field, humans never fill it, bots do -> answered with a fake success
  - timing ("t")            form must have been open for 1.5s+, instant posts are bots
  - rate limit              5 messages / 10 minutes / IP (best effort, see _lib.js)
  - strict validation       lengths, email shape, control characters stripped

  Env (Vercel -> Settings -> Environment Variables):
    RESEND_API_KEY        required
    CONTACT_TO_EMAIL      required, where messages are delivered
    CONTACT_FROM_EMAIL    optional, default "Portfolio <onboarding@resend.dev>" (Resend's test sender)
*/
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { error: "Method not allowed" });
  }
  if (!allowedOrigin(req)) return json(res, 403, { error: "Forbidden" });
  if (!rateLimit(`contact:${clientIp(req)}`, 5, 10 * 60 * 1000)) {
    return json(res, 429, { error: "Too many messages. Please try again in a few minutes." });
  }

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { return json(res, 400, { error: "Invalid request" }); }
  }
  const { name = "", email = "", message = "", website = "", t = 0 } = body || {};

  if (website) return json(res, 200, { ok: true }); // honeypot: look successful, send nothing
  const elapsed = Date.now() - Number(t);
  if (!(elapsed > 1500 && elapsed < 24 * 3600 * 1000)) {
    return json(res, 400, { error: "That was quick! Please take a moment and try again." });
  }

  const n = oneLine(name);
  const e = oneLine(email);
  const m = String(message).replace(/\r\n/g, "\n").trim();
  if (n.length < 1 || n.length > 100) return json(res, 400, { error: "Please enter your name." });
  if (e.length > 254 || !EMAIL.test(e)) return json(res, 400, { error: "Please enter a valid email address." });
  if (m.length < 10 || m.length > 4000) return json(res, 400, { error: "Message must be between 10 and 4000 characters." });

  const { RESEND_API_KEY, CONTACT_TO_EMAIL } = process.env;
  if (!RESEND_API_KEY || !CONTACT_TO_EMAIL) {
    console.error("contact: RESEND_API_KEY / CONTACT_TO_EMAIL are not set");
    return json(res, 500, { error: "The contact form is not configured yet. Please email me directly." });
  }

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM_EMAIL || "Portfolio <onboarding@resend.dev>",
        to: [CONTACT_TO_EMAIL],
        reply_to: e,
        subject: `Portfolio message from ${n}`.slice(0, 120),
        text: `From: ${n} <${e}>\n\n${m}`,
        html: `<p><strong>${escapeHtml(n)}</strong> &lt;${escapeHtml(e)}&gt;</p><p style="white-space:pre-wrap">${escapeHtml(m)}</p>`,
      }),
    });
    if (!r.ok) {
      console.error("contact: resend failed", r.status, await r.text().catch(() => ""));
      return json(res, 502, { error: "Could not send your message right now. Please email me directly." });
    }
    return json(res, 200, { ok: true });
  } catch (err) {
    console.error("contact: resend error", err);
    return json(res, 502, { error: "Could not send your message right now. Please email me directly." });
  }
}
