// Screenshots every live site into src/assets/projects/<slug>.jpg
// One time setup:  npm i -D playwright   then   npx playwright install chromium
//
//   npm run shots                          only slugs without a screenshot yet
//   npm run shots -- --all                 redo everything
//   npm run shots -- --only=games-listing  redo just one (comma separate for more)
//   npm run shots -- --light-only          skip the dark-mode screenshots
//
// Slow or endless sites: in src/data/repos.json give them "wait": 8000 (extra ms), "waitFor": "img.card" with "waitCount": 6
// (wait until that many of them are there, images fully loaded) and "warm": false (do not scroll through the page first).
//
// Every site is also opened in dark mode. If it really has one, that is saved as <slug>-dark.jpg and the portfolio shows
// it when the visitor is in dark mode. Sites without a dark mode keep just the light one. See scripts/darkmode.mjs
// for how to help a site that has a dark toggle (the "dark" option in src/data/repos.json).
//
// A site that needs longer: add  "wait": 8000  next to its "live" in src/data/repos.json
// It waits for: network idle, images loaded, spinners/skeletons gone, content stopped changing.
import { readFile, access, mkdir, writeFile, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { darkConfig, lightConfig, forceDark, forceLight, afterSettleDark, lookDifference, DARK_THRESHOLD } from "./darkmode.mjs";

const repos = JSON.parse(await readFile(new URL("../src/data/repos.json", import.meta.url), "utf8"));
let gh = {};
try { gh = JSON.parse(await readFile(new URL("../src/data/github.json", import.meta.url), "utf8")); } catch { /* optional */ }

const dir = new URL("../src/assets/projects/", import.meta.url);
await mkdir(dir, { recursive: true });

const all = process.argv.includes("--all");
const onlyArg = process.argv.find((a) => a.startsWith("--only="));
const only = onlyArg ? onlyArg.slice(7).split(",").map((s) => s.trim()) : null;
const lightOnly = process.argv.includes("--light-only");
// --url=slug=https://... points one project somewhere else (handy for testing)
const urlArg = process.argv.find((a) => a.startsWith("--url="));
const urlOverride = urlArg ? Object.fromEntries([urlArg.slice(6).split(/=(.*)/s).slice(0, 2)]) : {};
const exists = (f) => access(f).then(() => true, () => false);

// ---- code that runs inside the page ----
const noLoader = () =>
  ![...document.querySelectorAll('[class*="spinner" i],[class*="loader" i],[class*="loading" i],[class*="skeleton" i],[class*="shimmer" i],[role="progressbar"],[aria-busy="true"]')].some((e) => {
    const r = e.getBoundingClientRect();
    const cs = getComputedStyle(e);
    return r.width > 0 && r.height > 0 && cs.display !== "none" && cs.visibility !== "hidden" && cs.opacity !== "0";
  });

const imagesLoaded = () => [...document.images].every((i) => !i.src || (i.complete && i.naturalWidth > 0));

const domQuiet = ({ quiet, max }) =>
  new Promise((resolve) => {
    let t;
    const done = () => { obs.disconnect(); resolve(); };
    // childList + text only: continuous CSS/GSAP animation changes attributes and must not count
    const obs = new MutationObserver(() => { clearTimeout(t); t = setTimeout(done, quiet); });
    obs.observe(document.documentElement, { subtree: true, childList: true, characterData: true });
    t = setTimeout(done, quiet);
    setTimeout(done, max);
  });

const settle = async (page, minWait, meta = {}) => {
  await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => {});
  await page.evaluate(() => document.fonts && document.fonts.ready);
  // scroll through once so lazy images and scroll animations fire, then come back
  // ("warm": false in repos.json skips this, for infinite-scroll sites where the page never ends)
  if (meta.warm !== false) {
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 500) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 100));
      }
      window.scrollTo(0, 0);
    });
  }
  await page.waitForTimeout(minWait);
  // "waitFor": a selector, "waitCount": how many of them must be there (images must also have loaded). For slow data.
  if (meta.waitFor) {
    await page
      .waitForFunction(
        ({ s, n }) => [...document.querySelectorAll(s)].filter((e) => !(e instanceof HTMLImageElement) || (e.complete && e.naturalWidth > 0)).length >= n,
        { s: meta.waitFor, n: meta.waitCount ?? 1 },
        { timeout: 90000 }
      )
      .catch(() => console.log("  note: waited 90s for", meta.waitFor, "and it never showed up"));
    await page.waitForTimeout(1500);
  }
  await page.waitForFunction(imagesLoaded, null, { timeout: 30000 }).catch(() => {});
  await page.waitForFunction(noLoader, null, { timeout: 45000 }).catch(() => {});
  await page.evaluate(domQuiet, { quiet: 1500, max: 15000 });
  await page.waitForTimeout(800);
};

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, args: process.env.CHROME_PATH ? ["--no-sandbox"] : [] });
const helper = await browser.newPage(); // blank page, only used to compare screenshots

// the same site in dark mode; keeps the file only when it really looks different from the light one
const darkShot = async (slug, live, meta, lightBuf) => {
  const cfg = darkConfig(meta);
  const file = new URL(`${slug}-dark.jpg`, dir);
  if (!cfg) { await rm(file, { force: true }); return; }
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
  try {
    await forceDark(ctx, cfg);
    const dp = await ctx.newPage();
    await dp.goto(live, { waitUntil: "domcontentloaded", timeout: 90000 });
    await settle(dp, meta.wait ?? 3000, meta);
    await afterSettleDark(dp, cfg);
    const buf = await dp.screenshot({ type: "jpeg", quality: 82 });
    const diff = await lookDifference(helper, lightBuf, buf);
    if (diff > DARK_THRESHOLD) {
      await writeFile(fileURLToPath(file), buf);
      console.log("  dark", slug, `(looks ${Math.round(diff)} apart from light)`);
    } else {
      await rm(file, { force: true });
      console.log("  no dark mode found for", slug, "(same as light), keeping the light one for both");
    }
  } catch (e) {
    console.log("  dark FAIL", slug, "-", e.message.split("\n")[0]);
  } finally {
    await ctx.close();
  }
};

for (const [slug, meta] of Object.entries(repos)) {
  const live = urlOverride[slug] || meta.live || gh[slug]?.homepage;
  if (!live) { console.log("no live url, skip", slug); continue; }
  if (only && !only.includes(slug)) continue;

  const file = new URL(`${slug}.jpg`, dir);
  if (!all && !only && (await exists(file))) { console.log("have", slug); continue; }

  const started = Date.now();
  // a fresh browser context per site, so a site's saved settings never leak into the next one
  const lctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "light" });
  const lcfg = lightConfig(meta);
  if (lcfg) await forceLight(lctx, lcfg);
  const page = await lctx.newPage();
  try {
    await page.goto(live, { waitUntil: "domcontentloaded", timeout: 90000 });
    await settle(page, meta.wait ?? 3000, meta);
    if (lcfg) await afterSettleDark(page, lcfg);
    const lightBuf = await page.screenshot({ type: "jpeg", quality: 82 });
    await writeFile(fileURLToPath(file), lightBuf);
    console.log("shot", slug, `(${Math.round((Date.now() - started) / 1000)}s)`);
    if (!lightOnly) await darkShot(slug, live, meta, lightBuf);
  } catch (e) {
    console.log("FAIL", slug, "-", e.message.split("\n")[0]);
  } finally {
    await lctx.close();
  }
}
await browser.close();
