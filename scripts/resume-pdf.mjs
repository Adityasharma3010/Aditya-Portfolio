// Renders the /resume page to public/resume.pdf (light theme, reduced motion, A4) with Playwright.
// Run it after you change your experience or projects:   npm run build   then   node scripts/resume-pdf.mjs
// It serves the built site (dist/) itself, so nothing else needs to be running.
// Set CHROME_PATH if Playwright cannot find a browser (npx playwright install chromium also works).
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const root = process.cwd();
if (!fs.existsSync(path.join(root, "dist/index.html"))) {
  console.error("No dist/ folder. Run `npm run build` first.");
  process.exit(1);
}
const port = 4399;
const server = spawn(process.execPath, [path.join(root, "node_modules/vite/bin/vite.js"), "preview", "--port", String(port), "--strictPort"], { stdio: "ignore" });
await new Promise((r) => setTimeout(r, 2500));

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, args: ["--no-sandbox"] });
try {
  const ctx = await browser.newContext({ viewport: { width: 1200, height: 1600 }, colorScheme: "light", reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.addInitScript(() => {
    sessionStorage.setItem("intro", "1");
    localStorage.setItem("skin", "default");
    localStorage.setItem("mode", "light");
    localStorage.setItem("motion", "reduced");
  });
  await page.goto(`http://localhost:${port}/resume`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts?.ready);
  await page.waitForTimeout(800);
  await page.emulateMedia({ media: "print" });
  const out = path.join(root, "public/resume.pdf");
  await page.pdf({ path: out, format: "A4", scale: 0.92, printBackground: true, margin: { top: "14mm", bottom: "14mm", left: "14mm", right: "14mm" } });
  console.log(`wrote ${path.relative(root, out)} (${(fs.statSync(out).size / 1024).toFixed(0)} KB)`);
} finally {
  await browser.close();
  server.kill();
}
