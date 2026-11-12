// Shared by shots.mjs and clips.mjs: open a site in dark mode and tell whether it really has one.
//
// Most sites follow the browser's dark preference, and that is turned on for every dark capture. Sites with their own
// dark mode switch usually remember it (localStorage) or put a class on <html>, so the common conventions are set too.
// A capture only counts as "dark" when it looks clearly different from the light one, so sites without a dark mode
// simply keep their light screenshot in both themes.
//
// Many sites are dark BY DEFAULT and only show their light look when asked (a saved setting). Those need "light" below,
// otherwise both captures would be dark and the site would look like it has no dark mode.
//
// Per project, in src/data/repos.json (all optional):
//   "light": { "storage": { "theme": "light" } }  how to force the LIGHT look: same options as "dark", but nothing is set by default
//   "dark": false                              never capture a dark version of this site
//   "dark": { "storage": { "theme": "night" } }   extra localStorage values to set before the page loads
//   "dark": { "class": "dark-theme" }          class to put on <html> (default "dark"; "" for none)
//   "dark": { "attr": { "data-bs-theme": "dark" } }   attributes to put on <html> (default data-theme="dark")
//   "dark": { "click": "#theme-toggle" }       a button to click once the page has loaded (also works in "light")
const DEFAULT_STORAGE = { theme: "dark", "color-theme": "dark", darkMode: "true", "vueuse-color-scheme": "dark", "chakra-ui-color-mode": "dark" };

export const lightConfig = (meta) => (typeof meta.light === "object" && meta.light ? meta.light : null);

export const darkConfig = (meta) => (meta.dark === false ? null : typeof meta.dark === "object" && meta.dark ? meta.dark : {});

// target: a Playwright context or page. Call before the first goto.
export const forceDark = (target, cfg = {}) =>
  target.addInitScript(
    ({ storage, htmlClass, attr }) => {
      try { for (const [k, v] of Object.entries(storage)) localStorage.setItem(k, v); } catch { /* storage blocked */ }
      const apply = () => {
        const root = document.documentElement;
        if (htmlClass) root.classList.add(htmlClass);
        for (const [k, v] of Object.entries(attr)) root.setAttribute(k, v);
      };
      apply();
      document.addEventListener("DOMContentLoaded", apply);
    },
    { storage: { ...DEFAULT_STORAGE, ...(cfg.storage || {}) }, htmlClass: cfg.class ?? "dark", attr: cfg.attr ?? { "data-theme": "dark" } }
  );

// Force the light look (only for sites that need it, see above). target: a Playwright context or page, before the first goto.
export const forceLight = (target, cfg = {}) =>
  target.addInitScript(
    ({ storage, removeClass, attr }) => {
      try { for (const [k, v] of Object.entries(storage)) localStorage.setItem(k, v); } catch { /* storage blocked */ }
      const apply = () => {
        const root = document.documentElement;
        if (removeClass) root.classList.remove(removeClass);
        for (const [k, v] of Object.entries(attr)) root.setAttribute(k, v);
      };
      apply();
      document.addEventListener("DOMContentLoaded", apply);
    },
    { storage: cfg.storage || {}, removeClass: cfg.removeClass ?? "dark", attr: cfg.attr || {} }
  );

export const afterSettleDark = async (page, cfg = {}) => {
  if (!cfg.click) return;
  await page.click(cfg.click, { timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(1200);
};

// Average brightness difference (0 to 255) between two JPEG screenshots. Dark vs light is usually 40+, the same site twice is under 3.
// helper: any blank Playwright page, used only to decode the images.
export const lookDifference = (helper, bufA, bufB) =>
  helper.evaluate(
    async ([a, b]) => {
      const sample = async (b64) => {
        const img = new Image();
        img.src = `data:image/jpeg;base64,${b64}`;
        await img.decode();
        const c = document.createElement("canvas");
        c.width = c.height = 64;
        const ctx = c.getContext("2d");
        ctx.drawImage(img, 0, 0, 64, 64);
        return ctx.getImageData(0, 0, 64, 64).data;
      };
      const A = await sample(a);
      const B = await sample(b);
      let sum = 0;
      for (let i = 0; i < A.length; i += 4) sum += Math.abs((A[i] + A[i + 1] + A[i + 2]) / 3 - (B[i] + B[i + 1] + B[i + 2]) / 3);
      return sum / (64 * 64);
    },
    [bufA.toString("base64"), bufB.toString("base64")]
  );

export const DARK_THRESHOLD = 8;
