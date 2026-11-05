// Runs the files in /api during `npm run dev`, the same way Vercel runs them in production.
// Put secrets (RESEND_API_KEY, CONTACT_TO_EMAIL, GITHUB_TOKEN ...) in your local .env file.
import { loadEnv } from "vite";

const readBody = (req) =>
  new Promise((resolve) => {
    let data = "";
    req.on("data", (c) => (data += c));
    req.on("end", () => {
      if (!data) return resolve(undefined);
      try { resolve(req.headers["content-type"]?.includes("json") ? JSON.parse(data) : data); } catch { resolve(data); }
    });
  });

export default function apiDev() {
  return {
    name: "portfolio-api-dev",
    apply: "serve",
    configResolved(config) {
      for (const [k, v] of Object.entries(loadEnv(config.mode, config.root, ""))) if (!(k in process.env)) process.env[k] = v;
    },
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url, "http://localhost");
        if (!url.pathname.startsWith("/api/")) return next();
        const name = url.pathname.slice(5).replace(/\/$/, "");
        if (!/^[a-z0-9-]+$/i.test(name)) return next();
        try {
          const mod = await server.ssrLoadModule(`/api/${name}.js`);
          req.query = Object.fromEntries(url.searchParams);
          req.body = req.method === "GET" ? undefined : await readBody(req);
          res.status = (code) => { res.statusCode = code; return res; };
          res.json = (obj) => { res.setHeader("Content-Type", "application/json"); res.end(JSON.stringify(obj)); };
          await mod.default(req, res);
        } catch (err) {
          console.error(`[api/${name}]`, err);
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "API error" }));
        }
      });
    },
  };
}
