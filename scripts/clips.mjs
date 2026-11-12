// Makes the short looping clips for the project cards: src/assets/projects/<slug>.webm
// Same setup as the screenshots (Playwright is already installed for `npm run shots`). Nothing else to install.
//
//   node scripts/clips.mjs                         only slugs without a clip yet
//   node scripts/clips.mjs --all                   redo everything
//   node scripts/clips.mjs --only=ordly            redo just one (comma separate for more)
//   node scripts/clips.mjs --max=3000              scroll at most 3000px down (default 6000, enough for most pages)
//
// Sites that have a dark mode (run `npm run shots` first: it creates <slug>-dark.jpg for them) also get <slug>-dark.webm,
// which the portfolio plays when the visitor is in dark mode.
//
// For each live site it opens the page, waits until it has settled, then records a calm scroll down and back up
// (the whole page, a bit longer for taller pages), so the loop starts and ends on the same frame. The loading part is cut off, and the result is
// resized to 960px wide and compressed to roughly 0.5 to 1.5 MB. A site that needs longer: add "wait": 8000 in src/data/repos.json.
// Uses the ffmpeg Playwright installed next to its browser, and falls back to a system ffmpeg if that one cannot encode.
import { readFile, mkdir, mkdtemp, rm, readdir, stat, access } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import os from "node:os";
import path from "node:path";
import { chromium } from "playwright";
import { darkConfig, lightConfig, forceDark, forceLight, afterSettleDark } from "./darkmode.mjs";

const repos = JSON.parse(await readFile(new URL("../src/data/repos.json", import.meta.url), "utf8"));
let gh = {};
try { gh = JSON.parse(await readFile(new URL("../src/data/github.json", import.meta.url), "utf8")); } catch { /* optional */ }

const dir = fileURLToPath(new URL("../src/assets/projects/", import.meta.url));
await mkdir(dir, { recursive: true });

const all = process.argv.includes("--all");
const arg = (name) => process.argv.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);
const only = arg("only")?.split(",").map((s) => s.trim());
// --url=slug=https://... points one project somewhere else (handy for testing)
const urlOverride = arg("url") ? Object.fromEntries([arg("url").split(/=(.*)/s).slice(0, 2)]) : {};
const exists = (f) => access(f).then(() => true, () => false);

// ---------- ffmpeg ----------
// Candidates, best first: the ffmpeg Playwright installed next to its browser (it can always make VP8, that is how it records video),
// then a system ffmpeg. Some system builds have no VP8 encoder ("Unknown encoder libvpx"), so each one is tried until one works.
const findFfmpegs = async () => {
  const found = [];
  try {
    // walk up from chrome to the ms-playwright folder, where ffmpeg-NNNN/ lives
    let browsers = path.dirname(chromium.executablePath());
    while (!path.basename(browsers).startsWith("chromium") && path.dirname(browsers) !== browsers) browsers = path.dirname(browsers);
    browsers = path.dirname(browsers);
    for (const d of (await readdir(browsers)).filter((n) => n.startsWith("ffmpeg"))) {
      for (const f of await readdir(path.join(browsers, d))) {
        if (/^ffmpeg-(win64|win32|mac|linux)/.test(f) && !f.endsWith(".txt")) found.push(path.join(browsers, d, f));
      }
    }
  } catch { /* no Playwright ffmpeg folder, fall through to the system one */ }
  if (spawnSync("ffmpeg", ["-version"], { stdio: "ignore" }).status === 0) found.push("ffmpeg");
  return found;
};
const ffmpegs = await findFfmpegs();
if (!ffmpegs.length) {
  console.error("Could not find ffmpeg. Run `npx playwright install ffmpeg` and try again.");
  process.exit(1);
}

// What does this ffmpeg build offer? Ask it, instead of guessing encoder names.
const encodersOf = (bin) => {
  const r = spawnSync(bin, ["-hide_banner", "-encoders"], { encoding: "utf8" });
  return new Set([...(r.stdout || "").matchAll(/^\s*V\S*\s+(\S+)/gm)].map((m) => m[1]));
};
// Ways to make the clip, best first (small VP8 webm, then VP9 webm, then H.264 mp4). Both file types work on the site.
const plansFor = (bin) => {
  const have = encodersOf(bin);
  const blind = have.size === 0; // could not list encoders: just try everything
  const plans = [];
  for (const name of ["libvpx", "vp8"]) if (blind || have.has(name)) plans.push({ ext: "webm", name, args: ["-c:v", name, "-b:v", "900k", "-crf", "12"] });
  for (const name of ["libvpx-vp9", "vp9"]) if (blind || have.has(name)) plans.push({ ext: "webm", name, args: ["-c:v", name, "-b:v", "0", "-crf", "34"] });
  if (blind || have.has("libx264")) plans.push({ ext: "mp4", name: "libx264", args: ["-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "28", "-preset", "veryfast", "-movflags", "+faststart"] });
  return plans;
};

let working = null; // the first ffmpeg + encoder that worked, reused for the other projects
const run = (bin, raw, out, startAt, length, plan, scale) => {
  const args = ["-y", "-loglevel", "error", "-i", raw, "-ss", startAt.toFixed(2), "-t", length.toFixed(2), ...(scale ? ["-vf", "scale=960:-2"] : []), ...plan.args, "-an", out];
  const r = spawnSync(bin, args, { encoding: "utf8" });
  return { ok: r.status === 0, err: (r.stderr || r.error?.message || "").replace(/\r/g, "").split("\n")[0] };
};
const encode = (raw, slug, startAt, length) => {
  let lastErr = "";
  const tries = working ? [working] : ffmpegs.flatMap((bin) => plansFor(bin).map((plan) => ({ bin, plan })));
  for (const { bin, plan } of tries) {
    const out = path.join(dir, `${slug}.${plan.ext}`);
    for (const scale of [true, false]) {
      const r = run(bin, raw, out, startAt, length, plan, scale);
      if (r.ok) {
        if (!working) console.log(`encoding with ${plan.name} (${path.basename(bin)})`);
        working = { bin, plan };
        return out;
      }
      lastErr = r.err;
    }
  }
  // last resort, needs no encoder: cut the recording as it is (full size, may keep a moment of the loading screen)
  const out = path.join(dir, `${slug}.webm`);
  const r = run(ffmpegs[0], raw, out, startAt, length, { args: ["-c", "copy"] }, false);
  if (r.ok) {
    console.log("note: no video encoder found in your ffmpeg, saved the raw recording instead (bigger file)");
    return out;
  }
  throw new Error(`no ffmpeg could write the clip. Last error: ${lastErr || r.err}. Tried: ${ffmpegs.join(", ")}`);
};

// ---------- code that runs inside the page (same waiting rules as shots.mjs) ----------
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
    const obs = new MutationObserver(() => { clearTimeout(t); t = setTimeout(done, quiet); });
    obs.observe(document.documentElement, { subtree: true, childList: true, characterData: true });
    t = setTimeout(done, quiet);
    setTimeout(done, max);
  });
const smoothScroll = ({ to, ms }) =>
  new Promise((resolve) => {
    const from = window.scrollY;
    const t0 = performance.now();
    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const step = (now) => {
      const t = Math.min(1, (now - t0) / ms);
      window.scrollTo(0, from + (to - from) * ease(t));
      t < 1 ? requestAnimationFrame(step) : resolve();
    };
    requestAnimationFrame(step);
  });

const settle = async (page, minWait, meta = {}) => {
  await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => {});
  await page.evaluate(() => document.fonts && document.fonts.ready);
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

const SCROLL_MS = 3200; // one-screen pages: how long to just show the page
const PX_PER_SEC = 600; // scroll speed, slow enough to see what goes past
const MAX_SCROLL = Number(arg("max")) || 6000;
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, args: process.env.CHROME_PATH ? ["--no-sandbox"] : [] });
const tmp = await mkdtemp(path.join(os.tmpdir(), "clips-"));

const hasClip = async (name) => (await exists(path.join(dir, `${name}.webm`))) || (await exists(path.join(dir, `${name}.mp4`)));
const hasDarkShot = async (slug) => {
  for (const ext of ["jpg", "jpeg", "png", "webp"]) if (await exists(path.join(dir, `${slug}-dark.${ext}`))) return true;
  return false;
};

// records one clip: scheme is "light" or "dark", name is the file name without extension
const makeClip = async ({ name, live, meta, scheme }) => {
  const started = Date.now();
  const cfg = scheme === "dark" ? darkConfig(meta) || {} : lightConfig(meta);
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    colorScheme: scheme,
    recordVideo: { dir: tmp, size: { width: 1280, height: 720 } },
  });
  if (cfg) await (scheme === "dark" ? forceDark : forceLight)(ctx, cfg);
  const page = await ctx.newPage();
  const t0 = Date.now(); // the video starts here
  try {
    await page.goto(live, { waitUntil: "domcontentloaded", timeout: 90000 });
    await settle(page, meta.wait ?? 3000, meta);
    if (cfg) await afterSettleDark(page, cfg);

    const startAt = (Date.now() - t0) / 1000 + 0.3; // everything before this is loading, cut it off
    await page.waitForTimeout(300);
    const max = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
    const to = Math.max(0, Math.min(max, meta.clip?.max ?? MAX_SCROLL)); // "clip": { "max": 2500 } in repos.json shortens one site
    if (to > 100) {
      const down = Math.min(9000, Math.max(SCROLL_MS, (to / PX_PER_SEC) * 1000));
      await page.evaluate(smoothScroll, { to, ms: down });
      await page.waitForTimeout(700);
      await page.evaluate(smoothScroll, { to: 0, ms: Math.max(2200, down * 0.65) }); // back up a bit faster
    } else {
      await page.waitForTimeout(SCROLL_MS * 2); // a one-screen site: just show it alive for a few seconds
    }
    await page.waitForTimeout(400);
    const length = (Date.now() - t0) / 1000 - startAt - 0.2;

    const video = page.video();
    await ctx.close(); // flushes the recording
    const raw = path.join(tmp, `${name}-raw.webm`);
    await video.saveAs(raw);
    const out = encode(raw, name, startAt, length);
    const kb = Math.round((await stat(out)).size / 1024);
    console.log("clip", name, `(${length.toFixed(1)}s, ${kb} KB, ${Math.round((Date.now() - started) / 1000)}s)`, kb > 2500 ? "<- big, consider re-running with a shorter page" : "");
  } catch (e) {
    await ctx.close().catch(() => {});
    console.log("FAIL", name, "-", e.message.split("\n")[0]);
  }
};

try {
  for (const [slug, meta] of Object.entries(repos)) {
    const live = urlOverride[slug] || meta.live || gh[slug]?.homepage;
    if (!live) { console.log("no live url, skip", slug); continue; }
    if (only && !only.includes(slug)) continue;

    const variants = [{ scheme: "light", name: slug }];
    if (darkConfig(meta) && (await hasDarkShot(slug))) variants.push({ scheme: "dark", name: `${slug}-dark` });

    for (const v of variants) {
      if (!all && !only && (await hasClip(v.name))) { console.log("have", v.name); continue; }
      await makeClip({ ...v, live, meta });
    }
  }
} finally {
  await browser.close();
  await rm(tmp, { recursive: true, force: true });
}
