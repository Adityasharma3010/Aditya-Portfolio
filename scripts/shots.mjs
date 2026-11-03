// Screenshots every live site into src/assets/projects/<slug>.jpg
// One time setup:  npm i -D playwright   then   npx playwright install chromium
//
//   npm run shots                          only slugs without a screenshot yet
//   npm run shots -- --all                 redo everything
//   npm run shots -- --only=games-listing  redo just one (comma separate for more)
//
// A site that needs longer: add  "wait": 8000  next to its "live" in src/data/repos.json
// It waits for: network idle, images loaded, spinners/skeletons gone, content stopped changing.
import { readFile, access, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const repos = JSON.parse(await readFile(new URL("../src/data/repos.json", import.meta.url), "utf8"));
let gh = {};
try { gh = JSON.parse(await readFile(new URL("../src/data/github.json", import.meta.url), "utf8")); } catch { /* optional */ }

const dir = new URL("../src/assets/projects/", import.meta.url);
await mkdir(dir, { recursive: true });

const all = process.argv.includes("--all");
const onlyArg = process.argv.find((a) => a.startsWith("--only="));
const only = onlyArg ? onlyArg.slice(7).split(",").map((s) => s.trim()) : null;
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

const settle = async (page, minWait) => {
  await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => {});
  await page.evaluate(() => document.fonts && document.fonts.ready);
  // scroll through once so lazy images and scroll animations fire, then come back
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 500) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 100));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(minWait);
  await page.waitForFunction(imagesLoaded, null, { timeout: 30000 }).catch(() => {});
  await page.waitForFunction(noLoader, null, { timeout: 45000 }).catch(() => {});
  await page.evaluate(domQuiet, { quiet: 1500, max: 15000 });
  await page.waitForTimeout(800);
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

for (const [slug, meta] of Object.entries(repos)) {
  const live = meta.live || gh[slug]?.homepage;
  if (!live) { console.log("no live url, skip", slug); continue; }
  if (only && !only.includes(slug)) continue;

  const file = new URL(`${slug}.jpg`, dir);
  if (!all && !only && (await exists(file))) { console.log("have", slug); continue; }

  const started = Date.now();
  try {
    await page.goto(live, { waitUntil: "domcontentloaded", timeout: 90000 });
    await settle(page, meta.wait ?? 3000);
    await page.screenshot({ path: fileURLToPath(file), type: "jpeg", quality: 82 });
    console.log("shot", slug, `(${Math.round((Date.now() - started) / 1000)}s)`);
  } catch (e) {
    console.log("FAIL", slug, "-", e.message.split("\n")[0]);
  }
}
await browser.close();
