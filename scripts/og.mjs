// Renders a 1200x630 Open Graph card for every project into public/og/<slug>.png.
// Same idea as shots.mjs: Playwright renders a small HTML template and takes a screenshot.
//
//   node scripts/og.mjs            all projects
//   node scripts/og.mjs ordly      just one (slug)
//
// Re-run it when a project's name, summary or screenshot changes, then commit public/og/.
// The vite SEO plugin picks public/og/<slug>.png up automatically (falls back to /og.png when a card is missing).
// Fonts come from Google Fonts. Offline? Point OG_FONT_DIR at a folder holding bricolage.woff2 and mono.woff2.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "public", "og");

// slug / name / category / status / summary of each project, read straight out of src/data/projects.js
const readProjects = () => {
  const src = fs.readFileSync(path.join(root, "src/data/projects.js"), "utf8");
  return src
    .split(/\n\s*slug:\s*"/)
    .slice(1)
    .map((block) => {
      const slug = block.slice(0, block.indexOf('"'));
      const pick = (k) => (new RegExp(`\\b${k}:\\s*"((?:[^"\\\\]|\\\\.)*)"`).exec(block) || [])[1]?.replace(/\\"/g, '"') || "";
      return { slug, name: pick("name"), category: pick("category"), status: pick("status"), summary: pick("summary") };
    })
    .filter((p) => p.slug && p.name);
};

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
const hue = (str) => [...str].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 360, 7);
const b64 = (file) => fs.readFileSync(file).toString("base64");

const fontCss = () => {
  const dir = process.env.OG_FONT_DIR;
  if (dir && fs.existsSync(path.join(dir, "bricolage.woff2"))) {
    return `@font-face{font-family:"Bricolage Grotesque";font-weight:200 800;src:url(data:font/woff2;base64,${b64(path.join(dir, "bricolage.woff2"))}) format("woff2")}
@font-face{font-family:"JetBrains Mono";font-weight:500;src:url(data:font/woff2;base64,${b64(path.join(dir, "mono.woff2"))}) format("woff2")}`;
  }
  return `@import url("https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500..800&family=JetBrains+Mono:wght@500&display=swap");`;
};

const card = (p) => {
  const shot = path.join(root, "src/assets/projects", `${p.slug}.jpg`);
  const h = hue(p.slug);
  const image = fs.existsSync(shot)
    ? `<img src="data:image/jpeg;base64,${b64(shot)}" />`
    : `<div class="fallback" style="background:radial-gradient(120% 90% at 15% 0%, hsl(${h} 75% 55% / .6), transparent 60%), radial-gradient(100% 80% at 100% 100%, hsl(${(h + 70) % 360} 75% 50% / .5), transparent 55%), #14141a"></div>`;
  return `<!doctype html><html><head><meta charset="utf-8"><style>
${fontCss()}
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;overflow:hidden;background:#0b0b0d;color:#f3f0e9;font-family:"Bricolage Grotesque",system-ui,sans-serif;position:relative}
.glow{position:absolute;border-radius:50%;filter:blur(110px)}
.g1{width:560px;height:560px;right:-120px;top:-160px;background:rgba(200,255,61,.22)}
.g2{width:460px;height:460px;left:-160px;bottom:-200px;background:rgba(114,227,255,.14)}
.mono{font-family:"JetBrains Mono",ui-monospace,monospace;font-weight:500;text-transform:uppercase;letter-spacing:.2em}
.top{position:absolute;left:64px;top:52px;font-size:17px;color:#8c8a92;display:flex;gap:14px;align-items:center}
.top b{color:#c8ff3d;font-weight:500}
.left{position:absolute;left:64px;top:150px;width:560px}
.meta{display:flex;gap:10px;margin-bottom:26px}
.pill{font-size:15px;padding:8px 16px;border:1px solid rgba(255,255,255,.18);border-radius:999px;color:#f3f0e9}
.pill.on{background:#c8ff3d;border-color:#c8ff3d;color:#0b0b0d}
h1{font-size:132px;line-height:.92;letter-spacing:-.04em;font-weight:800;white-space:nowrap}
h1 i{font-style:normal;color:#c8ff3d}
.sum{margin-top:28px;font-size:27px;line-height:1.32;color:#a9a7ae;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.url{position:absolute;left:64px;bottom:52px;font-size:17px;color:#c8ff3d}
.shot{position:absolute;right:56px;top:140px;width:500px;height:340px;border-radius:26px;overflow:hidden;border:1px solid rgba(255,255,255,.14);box-shadow:0 30px 80px rgba(0,0,0,.55),0 0 0 8px rgba(255,255,255,.03);background:#14141a}
.shot img,.fallback{width:100%;height:100%;object-fit:cover;object-position:top;display:block}
.tag{position:absolute;right:56px;bottom:52px;font-size:15px;color:#8c8a92}
</style></head><body>
<div class="glow g1"></div><div class="glow g2"></div>
<div class="top mono"><b>AS.</b> Aditya Sharma <span style="opacity:.5">/ Full stack developer</span></div>
<div class="left">
  <div class="meta mono">${p.category ? `<span class="pill">${esc(p.category)}</span>` : ""}${p.status ? `<span class="pill on">${esc(p.status)}</span>` : ""}</div>
  <h1>${esc(p.name)}<i>.</i></h1>
  <p class="sum">${esc(p.summary)}</p>
</div>
<div class="shot">${image}</div>
<div class="url mono">adityasharma.site/projects/${esc(p.slug)}</div>
<div class="tag mono">Case study</div>
</body></html>`;
};

const only = process.argv[2];
const projects = readProjects().filter((p) => !only || p.slug === only);
if (!projects.length) {
  console.error(only ? `No project with slug "${only}"` : "No projects found in src/data/projects.js");
  process.exit(1);
}
fs.mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH, args: ["--no-sandbox"] } : {});
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
for (const p of projects) {
  await page.setContent(card(p), { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready).catch(() => {});
  // shrink the title until it fits its column (the screenshot starts at x=644)
  await page.evaluate(() => {
    const h = document.querySelector("h1");
    let size = 132;
    while (h.scrollWidth > 556 && size > 48) { size -= 4; h.style.fontSize = `${size}px`; }
  });
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(outDir, `${p.slug}.png`) });
  console.log(`og  public/og/${p.slug}.png`);
}
await browser.close();
