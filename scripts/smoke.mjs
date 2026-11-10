// Browser smoke test used by CI (.github/workflows/ci.yml). Run it locally after `npm run build`:
//   node scripts/smoke.mjs        (set CHROME_PATH if Playwright cannot find a browser)
// It serves dist/, visits every page in sitemap.xml and fails on JavaScript errors or empty pages,
// then checks the feed, manifest, resume PDF, service worker and the command palette.
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const root = process.cwd();
const dist = path.join(root, "dist");
if (!fs.existsSync(path.join(dist, "index.html"))) {
  console.error("No dist/ folder. Run `npm run build` first.");
  process.exit(1);
}

const port = 4398;
const base = `http://localhost:${port}`;
const server = spawn(process.execPath, [path.join(root, "node_modules/vite/bin/vite.js"), "preview", "--port", String(port), "--strictPort"], { stdio: "ignore" });
const failures = [];
const fail = (msg) => { failures.push(msg); console.error("FAIL", msg); };
const ok = (msg) => console.log("ok  ", msg);

try {
  // wait for the preview server
  for (let i = 0; i < 40; i++) {
    try { if ((await fetch(base)).ok) break; } catch { /* not up yet */ }
    await new Promise((r) => setTimeout(r, 250));
  }

  const sitemap = fs.readFileSync(path.join(dist, "sitemap.xml"), "utf8");
  const paths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
  if (!paths.length) fail("sitemap.xml has no pages");

  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, args: ["--no-sandbox"] });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error" && !/Failed to load resource|fonts\.g|api\/github/.test(m.text())) errors.push(m.text());
  });
  // the preview has no /api, so give the GitHub section something to draw
  await page.route("**/api/github**", (r) => r.fulfill({ json: { days: [], commits: [] } }));
  await page.addInitScript(() => { sessionStorage.setItem("intro", "1"); localStorage.setItem("motion", "reduced"); });

  for (const p of paths) {
    errors.length = 0;
    await page.goto(base + p, { waitUntil: "networkidle" });
    await page.waitForTimeout(600);
    const info = await page.evaluate(() => ({
      title: document.title,
      h1: document.querySelector("h1")?.textContent?.trim() || "",
      words: (document.querySelector("main")?.innerText || "").split(/\s+/).length,
    }));
    if (!info.h1) fail(`${p}: no <h1>`);
    else if (info.words < 20) fail(`${p}: page looks empty`);
    else if (errors.length) fail(`${p}: ${errors[0]}`);
    else ok(`${p}  (${info.title})`);
  }

  // unknown URL -> 404 page, not a blank screen
  await page.goto(`${base}/this-page-does-not-exist`, { waitUntil: "networkidle" });
  (await page.locator("main").innerText()).includes("404") ? ok("404 page") : fail("404 page did not render");

  // command palette
  await page.goto(base + "/", { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await page.keyboard.press("Control+k");
  await page.waitForTimeout(600);
  (await page.getByRole("dialog").count()) || (await page.locator("input[type=text], input:not([type])").count())
    ? ok("command palette opens") : fail("command palette did not open");

  await browser.close();

  // static files
  const text = async (u) => { const r = await fetch(base + u); return r.ok ? r.text() : null; };
  const feed = await text("/feed.xml");
  feed && feed.includes("<item>") ? ok("feed.xml") : fail("feed.xml missing or empty");
  try { JSON.parse(await text("/manifest.webmanifest")); ok("manifest.webmanifest"); } catch { fail("manifest.webmanifest missing or invalid"); }
  (await fetch(base + "/resume.pdf")).ok ? ok("resume.pdf") : fail("resume.pdf missing");
  const sw = await text("/sw.js");
  sw && !sw.includes('"__BUILD__"') && !sw.includes('"__PRECACHE__"') ? ok("sw.js stamped") : fail("sw.js missing or not stamped at build");
} finally {
  server.kill();
}

if (failures.length) {
  console.error(`\n${failures.length} check(s) failed`);
  process.exit(1);
}
console.log("\nAll smoke checks passed");
