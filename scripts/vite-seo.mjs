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

      const pages = [
        { path: "/", title: "Aditya Sharma — Full Stack Developer", desc: "Full stack developer building fast, animated web experiences with React, GSAP, Node and WordPress. Projects, experience and contact." },
        { path: "/projects", title: "Projects — Aditya Sharma", desc: `All ${projects.length} projects by Aditya Sharma, newest first: React, MERN, Supabase and WordPress builds.` },
        { path: "/resume", title: "Resume — Aditya Sharma", desc: "Resume of Aditya Sharma, full stack developer: experience, skills and selected projects." },
        { path: "/uses", title: "Uses — Aditya Sharma", desc: "The languages, frameworks, services and tools Aditya Sharma builds with." },
        ...projects.map((p) => ({ path: `/projects/${p.slug}`, title: `${p.name} — Aditya Sharma`, desc: p.summary, image: `/og/${p.slug}.png` })),
      ];

      const page = (p) => {
        const url = site + (p.path === "/" ? "" : p.path);
        // per-project card (node scripts/og.mjs) when it exists, otherwise the shared one
        const image = `${site}${p.image && fs.existsSync(path.join(outDir, p.image)) ? p.image : "/og.png"}`;
        const ld = {
          "@context": "https://schema.org",
          "@type": p.path === "/" ? "Person" : "WebPage",
          name: p.path === "/" ? "Aditya Sharma" : p.title,
          url,
          description: p.desc,
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

      const today = new Date().toISOString().slice(0, 10);
      const urls = pages.map((p) => `  <url><loc>${site}${p.path === "/" ? "" : p.path}</loc><lastmod>${today}</lastmod><priority>${p.path === "/" ? "1.0" : p.path.startsWith("/projects/") ? "0.6" : "0.8"}</priority></url>`).join("\n");
      fs.writeFileSync(path.join(outDir, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
      fs.writeFileSync(path.join(outDir, "robots.txt"), `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${site}/sitemap.xml\n`);
      console.log(`[seo] wrote ${pages.length} pages, sitemap.xml, robots.txt for ${site}`);
    },
  };
}
