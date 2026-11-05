// Shared helpers for the serverless functions. Files starting with "_" are not exposed as routes.

export const json = (res, status, body) => {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  if (!res.getHeader?.("Cache-Control")) res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
};

export const clientIp = (req) =>
  String(req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "unknown").split(",")[0].trim();

// Best-effort limiter kept in memory. Serverless instances come and go, so this slows bursts down;
// for strict limits put Upstash/Vercel KV behind the same function.
const hits = new Map();
export const rateLimit = (key, limit, windowMs) => {
  const now = Date.now();
  const recent = (hits.get(key) || []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.some((t) => now - t < windowMs)) hits.delete(k);
  return true;
};

// Only accept browser requests coming from this site (or localhost while developing).
export const allowedOrigin = (req) => {
  const origin = req.headers.origin;
  if (!origin) return true; // same-origin form posts and curl have no Origin
  try {
    const host = new URL(origin).host;
    const own = req.headers["x-forwarded-host"] || req.headers.host;
    const site = process.env.SITE_URL ? new URL(process.env.SITE_URL).host : null;
    return host === own || host === site || host.startsWith("localhost") || host.startsWith("127.0.0.1");
  } catch {
    return false;
  }
};

export const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

// strip control characters / newlines so a value can never inject extra headers or lines
// eslint-disable-next-line no-control-regex
export const oneLine = (s) => String(s).replace(/[\u0000-\u001f\u007f]+/g, " ").trim();
