// After `vite build`, writes real HTML for every route so crawlers and link previews (which don't run JS)
// see the right title, description, canonical URL and Open Graph tags. Also writes sitemap.xml and robots.txt.
// Set SITE_URL in Vercel (e.g. https://adityasharma.site). On Vercel it falls back to the production domain.
import fs from "node:fs";
import path from "node:path";

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

const siteUrl = () => {
  const u = process.env.SITE_URL || process.env.VITE_SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "https://adityasharma.site");
  return u.replace(/\/$/, "");
};

// pull slug / name / summary of each project out of src/data/projects.js (no bundler needed)
const readProjects = (root) => {
  const src = fs.readFileSync(path.join(root, "src/data/projects.js"), "utf8");
  const out = [];
  const re = /slug:\s*"([^"]+)",[\s\S]*?name:\s*"([^"]+)",[\s\S]*?summary:\s*"((?:[^"\\]|\\.)*)"/g;
  let m;
  while ((m = re.exec(src))) out.push({ slug: m[1], name: m[2], summary: m[3].replace(/\\"/g, '"') });
  return out;
};

// same idea for the notes in src/data/notes.js (keep slug, title, date, summary in that order)
const readNotes = (root) => {
  const file = path.join(root, "src/data/notes.js");
  if (!fs.existsSync(file)) return [];
  const src = fs.readFileSync(file, "utf8");
  const out = [];
  const re = /slug:\s*"([^"]+)",[\s\S]*?title:\s*"((?:[^"\\]|\\.)*)",[\s\S]*?date:\s*"([^"]+)",[\s\S]*?summary:\s*"((?:[^"\\]|\\.)*)"/g;
  let m;
  while ((m = re.exec(src))) out.push({ slug: m[1], title: m[2].replace(/\\"/g, '"'), date: m[3], summary: m[4].replace(/\\"/g, '"') });
  return out;
};

export default function seo() {
  let outDir = "dist";
  let root = process.cwd();
  return {
    name: "portfolio-seo",
    apply: "build",
    configResolved(c) {
      root = c.root;
      outDir = path.resolve(c.root, c.build.outDir);
    },
    closeBundle() {
      const tplPath = path.join(outDir, "index.html");
      if (!fs.existsSync(tplPath)) return;
      const tpl = fs.readFileSync(tplPath, "utf8");
      const site = siteUrl();
      const projects = readProjects(root);
      const notes = readNotes(root);

      const pages = [
        { path: "/", title: "Aditya Sharma — Full Stack Developer", desc: "Full stack developer building fast, animated web experiences with React, GSAP, Node and WordPress. Projects, experience and contact." },
        { path: "/projects", title: "Projects — Aditya Sharma", desc: `All ${projects.length} projects by Aditya Sharma, newest first: React, MERN, Supabase and WordPress builds.` },
        { path: "/resume", title: "Resume — Aditya Sharma", desc: "Resume of Aditya Sharma, full stack developer: experience, skills and selected projects." },
        { path: "/uses", title: "Uses — Aditya Sharma", desc: "The languages, frameworks, services and tools Aditya Sharma builds with." },
        { path: "/changelog", title: "Changelog — Aditya Sharma", desc: "What changed on adityasharma.site: new pages, features and fixes, newest first." },
        { path: "/guestbook", title: "Guestbook — Aditya Sharma", desc: "Leave a short message for Aditya Sharma. Messages appear after approval." },
        { path: "/work-with-me", title: "Work with me — Aditya Sharma", desc: "Hire Aditya Sharma, a full stack developer, to build a fast, SEO-ready website or web app with React, the MERN stack or WordPress and Bricks." },
        ...(notes.length ? [{ path: "/notes", title: "Notes — Aditya Sharma", desc: "Short write-ups from building this site and other projects: GSAP, React, performance and debugging." }] : []),
        ...notes.map((n) => ({ path: `/notes/${n.slug}`, title: `${n.title} — Aditya Sharma`, desc: n.summary, date: n.date })),
        ...projects.map((p) => ({ path: `/projects/${p.slug}`, title: `${p.name} — Aditya Sharma`, desc: p.summary, image: `/og/${p.slug}.png` })),
      ];

      const page = (p) => {
        const url = site + (p.path === "/" ? "" : p.path);
        // per-project card (node scripts/og.mjs) when it exists, otherwise the shared one
        const image = `${site}${p.image && fs.existsSync(path.join(outDir, p.image)) ? p.image : "/og.png"}`;
        const ld = {
          "@context": "https://schema.org",
          "@type": p.path === "/" ? "Person" : p.date ? "BlogPosting" : "WebPage",
          name: p.path === "/" ? "Aditya Sharma" : p.title,
          url,
          description: p.desc,
          ...(p.date && { datePublished: p.date, author: { "@type": "Person", name: "Aditya Sharma" } }),
          ...(p.path === "/" && { jobTitle: "Full Stack Developer", sameAs: ["https://github.com/Adityasharma3010"] }),
        };
        const head = [
          `<link rel="canonical" href="${url}" />`,
          `<meta property="og:url" content="${url}" />`,
          `<meta property="og:title" content="${esc(p.title)}" />`,
          `<meta property="og:description" content="${esc(p.desc)}" />`,
          `<meta property="og:image" content="${image}" />`,
          `<meta name="twitter:title" content="${esc(p.title)}" />`,
          `<meta name="twitter:description" content="${esc(p.desc)}" />`,
          `<meta name="twitter:image" content="${image}" />`,
          ...(notes.length ? [`<link rel="alternate" type="application/rss+xml" title="Aditya Sharma — Notes" href="${site}/feed.xml" />`] : []),
          `<script type="application/ld+json">${JSON.stringify(ld)}</script>`,
        ].join("\n    ");
        return tpl
          .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(p.title)}</title>`)
          .replace(/(<meta name="description" content=")[^"]*(")/, `$1${esc(p.desc)}$2`)
          .replace(/<meta property="og:title"[^>]*>\s*/, "")
          .replace(/<meta property="og:description"[^>]*>\s*/, "")
          .replace(/<meta property="og:image"[^>]*>\s*/, "")
          .replace(/<meta name="twitter:image"[^>]*>\s*/, "")
          .replace("</head>", `    ${head}\n  </head>`);
      };

      for (const p of pages) {
        const html = page(p);
        if (p.path === "/") fs.writeFileSync(tplPath, html);
        else {
          const dir = path.join(outDir, p.path);
          fs.mkdirSync(dir, { recursive: true });
          fs.writeFileSync(path.join(dir, "index.html"), html);
        }
      }

      // stamp the service worker so every deploy gets fresh caches (see public/sw.js)
      const swPath = path.join(outDir, "sw.js");
      if (fs.existsSync(swPath)) {
        // every JS/CSS chunk except the 480 KB three.js star field, so any page opens offline without a big first download
        const chunks = fs.readdirSync(path.join(outDir, "assets")).filter((f) => /\.(js|css)$/.test(f) && !f.startsWith("StarsBackground")).map((f) => `/assets/${f}`);
        fs.writeFileSync(
          swPath,
          fs.readFileSync(swPath, "utf8").replace('"__BUILD__"', JSON.stringify(Date.now().toString(36))).replace('"__PRECACHE__"', JSON.stringify(chunks))
        );
      }

      const today = new Date().toISOString().slice(0, 10);
      const urls = pages.map((p) => `  <url><loc>${site}${p.path === "/" ? "" : p.path}</loc><lastmod>${today}</lastmod><priority>${p.path === "/" ? "1.0" : p.path.startsWith("/projects/") ? "0.6" : "0.8"}</priority></url>`).join("\n");
      fs.writeFileSync(path.join(outDir, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
      if (notes.length) {
        const x = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        const items = notes
          .map((n) => `    <item>\n      <title>${x(n.title)}</title>\n      <link>${site}/notes/${n.slug}</link>\n      <guid isPermaLink="true">${site}/notes/${n.slug}</guid>\n      <pubDate>${new Date(n.date).toUTCString()}</pubDate>\n      <description>${x(n.summary)}</description>\n    </item>`)
          .join("\n");
        fs.writeFileSync(
          path.join(outDir, "feed.xml"),
          `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n  <channel>\n    <title>Aditya Sharma — Notes</title>\n    <link>${site}/notes</link>\n    <atom:link href="${site}/feed.xml" rel="self" type="application/rss+xml" />\n    <description>Short write-ups from building this site and other projects.</description>\n    <language>en</language>\n${items}\n  </channel>\n</rss>\n`
        );
      }
      fs.writeFileSync(path.join(outDir, "robots.txt"), `User-agent: *\nAllow: /\nDisallow: /api/\n\n# the neon side has no handle. only keys.\n\nSitemap: ${site}/sitemap.xml\n`);
      console.log(`[seo] wrote ${pages.length} pages, sitemap.xml, robots.txt${notes.length ? ", feed.xml" : ""} for ${site}`);
    },
  };
}
