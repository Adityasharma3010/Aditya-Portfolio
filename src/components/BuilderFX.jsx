import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from "../lib/gsap";
import { useLenis } from "./SmoothScroll";
import { CURSORS, PREFER, GROUPS, SKIP, ELEMENTS, KIND_ITEM, BEHAVE, SWATCHES } from "../lib/builder";

/*
  Builder mode, v3: a little React builder, like Bricks. The page is the canvas, an Elements panel (HTML, React and GSAP blocks) slides in on the
  left and a Styles panel (theme colours, typography, spacing) on the right. Four cursors work the panels: click an element, drop it on the canvas,
  type the text live, click a colour. The page's real DOM is always there (SEO, a11y, no layout shift): blocks are only masked until a cursor builds them.

  1. Just before a section scrolls in, its blocks are found (headings, text, images, buttons, cards, ...) as a tree and masked, so nothing is "already built".
  2. A cursor takes the next block on screen (parents first): Elements panel -> canvas (drop frame) -> text typed line by line / box dragged out ->
     colour in the Styles panel -> sometimes a GSAP / React behaviour. The panels slide away when it is quiet.
  3. A backlog makes the cursors hurry and drops the extra steps, fast scrolls or nav jumps just show the content, scrolled-past blocks show at once.
  Safety: every mask is removed when a block is done, on unmount, and by a watchdog, so content can never stay hidden.
*/
const POINTER = '<svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><path d="M3 2l14 7.2-6.6 1.8-2.2 6.6L3 2z"/></svg>';
const HANDLES = ["tl", "tr", "bl", "br"].map((c) => `<i class="bm-handle bm-h-${c}"></i>`).join("");
const GRAD = "linear-gradient(#000,#000)";
const PFX = ["", "-webkit-"];
const rand = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

const mset = (el, k, v) => PFX.forEach((p) => el.style.setProperty(`${p}mask-${k}`, v));
// Some elements already have a mask of their own (the fade on the Cyberpunk grid, for one), so it is saved first and put back afterwards.
const KEYS = PFX.flatMap((p) => ["image", "repeat", "position", "size"].map((k) => `${p}mask-${k}`)).concat("mask-clip");
const save = (el) => Object.fromEntries(KEYS.map((k) => [k, [el.style.getPropertyValue(k), el.style.getPropertyPriority(k)]]));
// hidden = a 1px mask parked far away, which works the same in every browser
const hide = (n) => {
  n.saved = save(n.el);
  mset(n.el, "image", GRAD); mset(n.el, "repeat", "no-repeat"); mset(n.el, "position", "-99999px -99999px"); mset(n.el, "size", "1px 1px");
};
const unmask = (n) => {
  for (const k of KEYS) {
    const [v, pr] = n.saved?.[k] || ["", ""];
    if (v) n.el.style.setProperty(k, v, pr); else n.el.style.removeProperty(k);
  }
};
const cut = (n, p) => {
  if (p <= 0) return;
  if (n.kind === "decor" || n.kind === "line") {
    // backgrounds fade in through a soft edge (a growing glow, or a sweep for wide things), never a hard rectangle
    const wide = n.w / Math.max(n.h, 1) > 3 || n.kind === "line";
    const g = wide
      ? `linear-gradient(100deg, #000 ${p * 135 - 35}%, transparent ${p * 135}%)`
      : `radial-gradient(circle farthest-corner at 50% 50%, #000 ${p * 135 - 35}%, transparent ${p * 135}%)`;
    mset(n.el, "image", g);
    if (wide) { mset(n.el, "position", "0 0"); mset(n.el, "size", "100% 100%"); }
    else {
      // glows spill past their box: let the mask reach beyond it too (3x the box), so the edge is soft and not the box's
      n.el.style.setProperty("mask-clip", "no-clip");
      mset(n.el, "position", "50% 50%");
      mset(n.el, "size", "300% 300%");
    }
    return;
  }
  mset(n.el, "position", "0 0");
  mset(n.el, "size", `${n.w * p}px ${n.h * p}px`);
};

const mk = (cls, parent, html) => {
  const d = document.createElement("div");
  d.className = cls;
  if (html) d.innerHTML = html;
  parent.appendChild(d);
  return d;
};
const alpha = (c) => {
  if (!c || c === "transparent") return 0;
  const n = c.match(/[\d.]+/g);
  return n && n.length >= 4 ? +n[3] : 1;
};
const isBox = (cs) =>
  (parseFloat(cs.borderTopWidth) > 0 && cs.borderTopStyle !== "none" && alpha(cs.borderTopColor) > 0.02) ||
  alpha(cs.backgroundColor) > 0.03 || cs.backgroundImage !== "none" || cs.boxShadow !== "none";
const inlineOnly = (el) =>
  el.childNodes.length > 0 && [...el.childNodes].every((n) => n.nodeType === 3 || (n.nodeType === 1 && getComputedStyle(n).display.startsWith("inline")));
const ownText = (el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
const SKIPSEL = SKIP.join(",");
const GROUPSEL = GROUPS.join(",");

// What kind of block is this? null = ignore, atomic = build it as one piece
const classify = (el, cs, r) => {
  const tag = el.tagName;
  const area = r.width * r.height;
  if (el.matches(SKIPSEL)) return null;
  if ((cs.pointerEvents === "none" && cs.position === "absolute" && area > 6000) || parseInt(cs.zIndex, 10) < 0) return { kind: "decor", atomic: true };
  if (r.height <= 3 || r.width <= 3) return { kind: "line", atomic: true };
  if (el.matches(GROUPSEL)) return { kind: "group", atomic: true };
  if (/^H[1-6]$/.test(tag)) return { kind: "heading", atomic: true };
  if (tag === "P" || tag === "BLOCKQUOTE" || tag === "FIGCAPTION") return { kind: "text", atomic: true };
  if (tag === "UL" || tag === "OL" || tag === "DL") {
    // a short list is built item by item, a long one in one go
    return el.children.length >= 2 && el.children.length <= 14 && tag !== "DL" ? { kind: "wrap", atomic: false } : { kind: "list", atomic: true };
  }
  if (tag === "BUTTON" || tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return { kind: "control", atomic: true };
  if (tag === "IMG" || tag === "VIDEO" || tag === "CANVAS" || tag === "PICTURE" || tag.toLowerCase() === "svg") {
    return r.width >= 24 && r.height >= 24 ? { kind: "media", atomic: true } : null;
  }
  const box = isBox(cs);
  const small = r.width <= 240 && r.height <= 240;
  if (tag === "A" && (inlineOnly(el) || small)) return { kind: "control", atomic: true };
  if (inlineOnly(el) || ownText(el)) return { kind: box ? "chip" : "text", atomic: true }; // loose text inside: one piece, so none is left behind
  if (el.children.length >= 10) {
    const kids = [...el.children];
    if (kids.every((c) => { const b = c.getBoundingClientRect(); return b.width * b.height < 4000; })) return { kind: "group", atomic: true };
  }
  if (box) return small ? { kind: "chip", atomic: true } : { kind: "box", atomic: false };
  if (small && el.children.length) return { kind: "chip", atomic: true }; // a small wrapper (badge, pill) is one piece
  return { kind: "wrap", atomic: false };
};

// All blocks of a section as a tree
const discover = (section) => {
  const all = [];
  const walk = (el, parent) => {
    const kids = [...el.children].filter((c) => !c.classList.contains("bm-layer") && !/^(SCRIPT|STYLE|NOSCRIPT|BR|HR|SOURCE|TRACK|TEMPLATE)$/.test(c.tagName));
    for (const c of kids) {
      const cs = getComputedStyle(c);
      if (cs.display === "none" || cs.visibility === "hidden" || cs.position === "fixed") continue;
      const r = c.getBoundingClientRect();
      if (r.width < 2 && r.height < 2) continue;
      const k = classify(c, cs, r);
      if (!k) continue;
      if (k.kind === "wrap") { walk(c, parent); continue; }
      const n = { el: c, kind: k.kind, parent, depth: parent ? parent.depth + 1 : 0, state: "pending", p: 0, ax: 0, ay: 0, sweep: k.kind === "decor" || k.kind === "line", top: 0, bottom: 0, left: 0, w: 0, h: 0 };
      all.push(n);
      if (!k.atomic) walk(c, n);
    }
  };
  walk(section, null);
  return all;
};

const cutType = (n, p) => {
  if (p <= 0) return;
  const lh = n.h / n.lines;
  const pos = p * n.lines;
  const i = Math.min(n.lines - 1, Math.floor(pos));
  const f = pos - i;
  mset(n.el, "image", `${GRAD},${GRAD}`);
  mset(n.el, "repeat", "no-repeat,no-repeat");
  mset(n.el, "position", `0 0,0 ${i * lh}px`);
  mset(n.el, "size", `${n.w}px ${i * lh}px,${f * n.w}px ${lh}px`);
};

const panelHtml = {
  left: () =>
    `<div class="bm-ph"><b>Elements</b><span>drag to canvas</span></div>` +
    ELEMENTS.map((g) => `<div class="bm-gl">${g.group}</div><div class="bm-items">${g.items.map(([id, label, ic]) => `<div class="bm-item" data-id="${id}"><i>${ic}</i>${label}</div>`).join("")}</div>`).join(""),
  right: () =>
    `<div class="bm-ph"><b>Styles</b><span><em data-sel>nothing selected</em></span></div>` +
    `<div class="bm-gl">Colour</div><div class="bm-sws">${SWATCHES.map((t) => `<div class="bm-sw" data-t="${t}" title="--${t}" style="background:rgb(var(--${t}))"></div>`).join("")}</div>` +
    `<div class="bm-row" data-row="col"><span>Text colour</span><b data-col>—</b></div><div class="bm-row" data-row="bg"><span>Background</span><b data-bg>—</b></div>` +
    `<div class="bm-gl">Typography</div><div class="bm-row" data-row="fs"><span>Size · weight</span><b data-fs>—</b></div><div class="bm-row"><span>Family</span><b data-ff>—</b></div>` +
    `<div class="bm-gl">Spacing</div><div class="bm-row" data-row="pd"><span>Padding</span><b data-pd>—</b></div><div class="bm-row"><span>Radius</span><b data-rd>—</b></div><div class="bm-row"><span>Box</span><b data-wh>—</b></div>` +
    `<div class="bm-gl">Content</div><div class="bm-ct" data-ct></div>`,
};

const BuilderFX = ({ ready }) => {
  const readyRef = useRef(ready);
  readyRef.current = ready;
  const lenisRef = useRef(null);
  lenisRef.current = useLenis();
  useGSAP(
    () => {
      if (prefersReducedMotion() || !window.matchMedia("(min-width: 768px)").matches) return;
      const main = document.querySelector("main");
      if (!main) return;
      const root = document.documentElement;

      const layer = document.createElement("div");
      layer.className = "bm-layer";
      layer.setAttribute("aria-hidden", "true");
      document.body.appendChild(layer);
      const grid = mk("bm-grid", layer);

      // the editor: Elements on the left, Styles on the right, a status bar at the bottom
      const left = mk("bm-panel bm-left", layer, panelHtml.left());
      const right = mk("bm-panel bm-right", layer, panelHtml.right());
      const seg = window.location.pathname.split("/").filter(Boolean)[0];
      const pageName = seg ? seg.replace(/-/g, " ").replace(/^./, (ch) => ch.toUpperCase()) : "Home";
      const bar = mk("bm-bar", layer, `<span class="bm-dot"></span><b>Builder</b><span class="bm-crumb">${pageName} › main</span><span class="bm-prog"><i></i></span><em>0 / 0</em><button type="button" class="bm-skip" tabindex="-1" title="Show the finished page (Esc)">Skip ›</button>`);
      const items = Object.fromEntries([...left.querySelectorAll("[data-id]")].map((e) => [e.dataset.id, e]));
      const sws = Object.fromEntries([...right.querySelectorAll("[data-t]")].map((e) => [e.dataset.t, e]));
      const q = (k) => right.querySelector(`[data-${k}]`);
      const rows = Object.fromEntries([...right.querySelectorAll("[data-row]")].map((e) => [e.dataset.row, e]));
      const [sel, whEl, ctEl] = ["sel", "wh", "ct"].map(q);
      const setVal = (k, v) => { const e = q(k); if (e) e.textContent = v; };
      const tokens = SWATCHES.map((t) => [t, (getComputedStyle(root).getPropertyValue(`--${t}`) || "0 0 0").trim().split(/\s+/).map(Number)]);
      const prog = bar.querySelector(".bm-prog i");
      const pc = bar.querySelector("em");
      gsap.set(left, { xPercent: -120 });
      gsap.set(right, { xPercent: 120 });
      gsap.set(bar, { yPercent: 160 });

      let panelsOn = false;
      let panelsReadyAt = 0;
      let idleAt = performance.now();
      const showPanels = (on) => {
        panelsOn = on;
        if (on) panelsReadyAt = performance.now() + 700;
        gsap.to([left, right], { xPercent: 0, duration: 0.6, ease: "power3.out", overwrite: "auto", ...(on ? {} : { xPercent: (i) => (i ? 120 : -120), duration: 0.5, ease: "power2.in" }) });
        gsap.to(bar, { yPercent: on ? 0 : 160, duration: 0.5, ease: on ? "power3.out" : "power2.in", overwrite: "auto" });
      };

      const nodes = [];          // every hidden block that is not done yet
      const timelines = new Set();
      let total = 0;
      let doneCount = 0;
      let built = 0;
      const updateBar = () => { prog.style.width = `${total ? (doneCount / total) * 100 : 0}%`; pc.textContent = `${doneCount} / ${total}`; };

      const cursors = CURSORS.map((def) => {
        const el = mk("bm-cursor", layer, `${POINTER}<span class="bm-tag">${def.name}</span>`);
        el.style.setProperty("--c", `rgb(var(${def.color}))`);
        const ink = (() => {
          const [r, g, b] = (getComputedStyle(document.documentElement).getPropertyValue(def.color) || "255 255 255").trim().split(/\s+/).map(Number);
          return 0.299 * r + 0.587 * g + 0.114 * b > 150 ? "0 0 0" : "255 255 255";
        })();
        el.style.setProperty("--ink", ink);
        return { def, el, ink, x: 0, y: 0, from: null, tgt: null, s: 1, started: false, job: null, idleSince: performance.now(), shown: false };
      });

      // auto scroll (stops for good as soon as the visitor scrolls, presses a scroll key or touches the screen)
      let auto = true;
      let stepping = false;
      let calmSince = 0;
      let endAt = 0;
      let stepTween = null;
      const glide = (y, dur) => {
        stepping = true;
        const lenis = lenisRef.current;
        const end = () => { stepping = false; calmSince = 0; };
        if (lenis) lenis.scrollTo(y, { duration: dur, easing: (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2), onComplete: end });
        else {
          const o = { y: window.scrollY };
          stepTween = gsap.to(o, { y, duration: dur, ease: "power2.inOut", onUpdate: () => window.scrollTo(0, o.y), onComplete: end });
        }
      };
      const stopAuto = (e) => {
        if (e.type === "keydown" && !["ArrowDown", "ArrowUp", "PageDown", "PageUp", " ", "Home", "End"].includes(e.key)) return;
        if (!auto) return;
        auto = false;
        stepTween?.kill();
        stepping = false;
      };
      const stopEvents = ["wheel", "touchstart", "keydown"];
      stopEvents.forEach((ev) => window.addEventListener(ev, stopAuto, { passive: true }));
      // printing / saving as PDF: show everything first
      const onPrint = () => { for (const n of [...nodes]) finish(n); };
      // skip: show the finished page right now (the Skip button in the status pill, or Esc)
      const skipAll = () => {
        auto = false;
        stepTween?.kill();
        stepping = false;
        lenisRef.current?.scrollTo(window.scrollY, { immediate: true });
        paintQueue.length = 0;
        for (const n of [...nodes]) finish(n);
        for (const c of cursors) if (c.job) free(c);
      };
      const onEsc = (e) => { if (e.key === "Escape" && nodes.length) skipAll(); };
      bar.querySelector(".bm-skip").addEventListener("click", skipAll);
      window.addEventListener("keydown", onEsc);
      window.addEventListener("beforeprint", onPrint);

      const paintQueue = []; // backgrounds wait here until the page is ready
      let lastY = window.scrollY;
      let speed = 0;

      const done = (n) => {
        if (n.state === "done") return;
        n.state = "done";
        n.p = 1;
        unmask(n);
        n.caret?.remove();
        doneCount += 1;
        updateBar();
        const i = nodes.indexOf(n);
        if (i >= 0) nodes.splice(i, 1);
      };
      const free = (c) => { c.job = null; c.tgt = null; c.idleSince = performance.now(); };
      // show a block right now, without a cursor (fast scrolling, already scrolled past, watchdog)
      const finish = (n) => {
        n.tl?.kill();
        if (n.state === "building") {
          n.frame?.remove();
          const c = cursors.find((x) => x.job === n);
          if (c) free(c);
        }
        done(n);
      };

      const click = (c, el) => {
        const col = `rgb(var(${c.def.color}))`;
        el.style.setProperty("--c", col);
        el.classList.add("bm-on");
        gsap.delayedCall(0.6, () => el.classList.remove("bm-on"));
        const r = mk("bm-rip", layer);
        r.style.setProperty("--c", col);
        r.style.transform = `translate(${c.x}px,${c.y}px)`;
        gsap.fromTo(r, { scale: 0.3, opacity: 0.9 }, { scale: 2.6, opacity: 0, duration: 0.5, ease: "power2.out", onComplete: () => r.remove() });
        gsap.fromTo(c.el.querySelector("svg"), { scale: 1 }, { scale: 0.78, duration: 0.07, yoyo: true, repeat: 1, overwrite: "auto" });
      };
      const centre = (el) => () => { const r = el.getBoundingClientRect(); return { x: r.left + r.width * 0.5, y: r.top + r.height * 0.5 }; };
      const corner = (n) => () => {
        const r = n.el.getBoundingClientRect();
        return { x: clamp(r.left + 14, 8, window.innerWidth - 24), y: clamp(r.top + 10, 8, window.innerHeight - 24) };
      };
      const move = (tl, c, tgt, dur, ease = "power3.inOut") => {
        tl.call(() => { c.from = { x: c.x, y: c.y }; c.tgt = tgt; c.s = 0; }).to(c, { s: 1, duration: dur, ease });
      };
      const fill = (n) => {
        sel.textContent = `<${n.tag}>`;
        for (const k of ["col", "bg", "fs", "ff", "pd", "rd"]) setVal(k, "—");
        whEl.textContent = `${Math.round(n.w)} × ${Math.round(n.h)}`;
        ctEl.textContent = "";
      };
      // the block's real colour -> the theme token it uses (or null for a one-off colour)
      const tokenOf = (css) => {
        const m = (css || "").match(/[\d.]+/g);
        if (!m || m.length < 3) return null;
        const a = m.length >= 4 ? +m[3] : 1;
        if (a < 0.05) return null;
        const rgb = m.slice(0, 3).map(Number);
        const hit = tokens.find(([, t]) => Math.hypot(t[0] - rgb[0], t[1] - rgb[1], t[2] - rgb[2]) < 14);
        const hex = `#${rgb.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`;
        const pct = a < 0.97 ? ` / ${Math.round(a * 100)}%` : "";
        return hit ? { tok: hit[0], text: `--${hit[0]}${pct}` } : { tok: null, text: hex + pct };
      };
      // what the Styles panel has to "set" for this block, from what it really looks like
      const stylesFor = (n, backlog) => {
        const cs = getComputedStyle(n.el);
        const acts = [];
        const textish = ["heading", "text", "control", "chip", "list"].includes(n.kind);
        const boxish = ["box", "chip", "control", "group"].includes(n.kind);
        if (backlog < 6 && textish) acts.push({ row: "fs", vals: { fs: `${cs.fontSize} · ${cs.fontWeight}`, ff: (cs.fontFamily.split(",")[0] || "").replace(/["']/g, "") }, chip: `font-size: ${cs.fontSize}` });
        if (textish) { const t = tokenOf(cs.color); if (t) acts.push({ row: "col", tok: t.tok, vals: { col: t.text }, chip: `color: ${t.tok || t.text}` }); }
        if (boxish) { const t = tokenOf(cs.backgroundColor); if (t) acts.push({ row: "bg", tok: t.tok, vals: { bg: t.text }, chip: `background: ${t.tok || t.text}` }); }
        const pad = parseFloat(cs.paddingTop) + parseFloat(cs.paddingLeft);
        if (backlog < 6 && boxish && pad > 0) acts.push({ row: "pd", vals: { pd: cs.paddingTop === cs.paddingLeft ? cs.paddingTop : `${cs.paddingTop} ${cs.paddingLeft}`, rd: cs.borderTopLeftRadius }, chip: `padding: ${cs.paddingTop}` });
        return backlog >= 10 ? [] : acts.slice(0, 3);
      };

      const start = (c, n, backlog) => {
        n.state = "building";
        c.job = n;
        const sp = clamp(1 - backlog * 0.06, 0.35, 1) * 0.65 * (n.depth >= 2 ? 0.7 : 1); // a backlog makes everybody hurry, and so does being deep inside a card
        const r = n.el.getBoundingClientRect();
        n.w = n.el.offsetWidth || r.width;
        n.h = n.el.offsetHeight || r.height;
        n.tag = n.el.tagName.toLowerCase();
        n.typed = n.kind === "heading" || n.kind === "text";
        if (n.typed) {
          const cs = getComputedStyle(n.el);
          const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.25;
          n.lines = Math.max(1, Math.round(n.h / lh));
          n.txt = (n.el.textContent || "").replace(/\s+/g, " ").trim();
          n.caret = mk("bm-caret", layer);
          n.caret.style.setProperty("--c", `rgb(var(${c.def.color}))`);
          n.caret.style.opacity = "0";
        }
        if (!c.started) { c.started = true; c.x = window.innerWidth * 0.5; c.y = window.innerHeight + 40; }
        const f = mk("bm-frame", layer, HANDLES);
        f.style.setProperty("--c", `rgb(var(${c.def.color}))`);
        f.style.setProperty("--ink", c.ink);
        n.chip = mk("bm-chip", f);
        n.frame = f;
        c.shown = true;
        gsap.to(c.el, { opacity: 1, duration: 0.2, overwrite: "auto" });

        const item = items[KIND_ITEM[n.kind]] || items.container;
        let acts = stylesFor(n, backlog);
        if (n.depth >= 2) acts = acts.filter((a) => a.tok).slice(0, 1); // small parts inside a card: one quick colour at most
        const behave = BEHAVE[n.kind];
        const withBehave = backlog < 5 && n.depth < 2 && behave && built++ % 2 === 0;
        const chars = n.typed ? n.txt.length : 0;
        const buildDur = n.typed ? clamp(chars * 0.02, 0.45, 2) * clamp(sp + 0.2, 0.5, 1) : clamp((n.w + n.h) / 2600, 0.35, 0.8) * sp;

        const tl = gsap.timeline({
          onComplete: () => {
            const fr = n.frame;
            gsap.to(fr, { opacity: 0, duration: 0.3, delay: 0.4, ease: "power1.in", onComplete: () => fr.remove() });
            n.frameOn = false;
            timelines.delete(tl);
            free(c);
          },
        });
        n.tl = tl;
        timelines.add(tl);

        // 1. pick the element in the Elements panel
        // (a cursor that already holds this element skips the trip)
        if (c.held !== item) {
          move(tl, c, centre(item), 0.55 * sp);
          tl.call(() => { click(c, item); c.held = item; }).to({}, { duration: 0.16 * sp });
        }
        // 2. carry it to the canvas and drop it
        move(tl, c, corner(n), 0.5 * sp);
        tl.call(() => {
          fill(n);
          n.frameOn = true;
          n.frame.style.opacity = "1";
          n.chip.style.opacity = "1";
          n.chip.textContent = `<${n.tag}>  ${Math.round(n.w)} × ${Math.round(n.h)}`;
          c.from = { x: c.x, y: c.y };
          c.s = 1;
          c.tgt = () => n.edge || { x: c.x, y: c.y };
          if (n.caret) n.caret.style.opacity = "1";
        });
        // 3. it appears (text is typed, the rest is dragged out)
        tl.to(n, { p: 1, duration: buildDur, ease: n.typed ? "none" : "power2.inOut" }).call(() => done(n));
        // 4. set the block's real styles in the Styles panel: its own colour swatch, size, padding...
        for (const act of acts) {
          const target = act.tok ? sws[act.tok] : rows[act.row];
          move(tl, c, centre(target), 0.42 * sp);
          tl.call(() => {
            click(c, target);
            if (target !== rows[act.row]) { rows[act.row].style.setProperty("--c", `rgb(var(${c.def.color}))`); rows[act.row].classList.add("bm-on"); gsap.delayedCall(0.6, () => rows[act.row].classList.remove("bm-on")); }
            for (const [k, v] of Object.entries(act.vals)) setVal(k, v);
            if (n.frame) {
              if (["accent", "accent2", "accent3"].includes(act.tok)) n.frame.style.setProperty("--c", `rgb(var(--${act.tok}))`);
              n.chip.textContent = act.chip;
            }
          }).to({}, { duration: 0.2 * sp });
        }
        // 5. add some behaviour from the GSAP / React group
        if (withBehave) {
          move(tl, c, centre(items[behave]), 0.45 * sp);
          tl.call(() => { click(c, items[behave]); if (n.frame) n.chip.textContent = `+ ${items[behave].textContent}`; }).to({}, { duration: 0.35 * sp });
        }
      };

      // backgrounds and lines are painted in without a cursor
      const paint = (n, delay) => {
        n.state = "painting";
        n.w = n.el.offsetWidth || n.el.getBoundingClientRect().width;
        n.h = n.el.offsetHeight || n.el.getBoundingClientRect().height;
        const tl = gsap.to(n, { p: 1, duration: n.kind === "line" ? 0.7 : rand(1, 1.6), delay, ease: "power2.out", onUpdate: () => cut(n, n.p), onComplete: () => { done(n); timelines.delete(tl); } });
        n.tl = tl;
        timelines.add(tl);
      };

      const setup = (section) => {
        if (speed > 3000) return; // a nav jump: just show the page
        let found;
        try { found = discover(section); } catch { return; }
        let d = 0;
        for (const n of found) {
          hide(n);
          nodes.push(n);
          if (n.kind === "decor" || n.kind === "line") { n.delay = (d++) * 0.1; paintQueue.push(n); }
        }
        total += found.length;
        updateBar();
      };

      const tick = (time, dtMs) => {
        const now = performance.now();
        if (readyRef.current) while (paintQueue.length) { const p = paintQueue.shift(); if (p.state === "pending") paint(p, p.delay); }
        const sy = window.scrollY;
        const vh = window.innerHeight;
        speed = (Math.abs(sy - lastY) / Math.max(dtMs, 1)) * 1000;
        lastY = sy;

        const line = vh * 0.92;
        const fast = speed > 3000;
        const ready2 = [];
        // read every rect first (live: the project strip moves sideways), then decide
        const pend = nodes.filter((n) => n.state === "pending");
        const prects = pend.map((n) => n.el.getBoundingClientRect());
        pend.forEach((n, i) => {
          const r = prects[i];
          n.top = r.top + sy; n.bottom = r.bottom + sy; n.left = r.left;
          n.vis = r.top < line && r.bottom > 0 && r.left < window.innerWidth && r.right > 0;
          n.gone = r.bottom < -40 || r.right < -40;
        });
        for (const n of pend) {
          if (n.gone || (fast && n.vis)) { finish(n); continue; }
          if (!n.vis) continue;
          n.seen = n.seen || now;
          if (now - n.seen > 12000) { finish(n); continue; } // watchdog: nothing may stay hidden
          if (!n.parent || n.parent.state === "done" || (n.parent.state === "building" && n.parent.p > 0.9)) ready2.push(n);
        }
        const backlog = ready2.length;
        const working = cursors.some((c) => c.job);

        // auto scroll: when everything on screen is built, glide down to the next part; at the end go back to the top
        if (auto && readyRef.current && !stepping) {
          if (working || backlog) calmSince = 0;
          else if (!calmSince) calmSince = now;
          else if (now - calmSince > 400) {
            const maxY = document.documentElement.scrollHeight - vh;
            if (sy >= maxY - 4) {
              if (!endAt) endAt = now;
              else if (now - endAt > 1600) { auto = false; glide(0, 3.4); }
            } else {
              endAt = 0;
              glide(Math.min(maxY, sy + vh * 0.7), clamp((vh * 0.7) / 520, 0.9, 2));
            }
          }
        }

        // the editor slides in while there is work and out again when it has been quiet for a while
        if (working || backlog) { idleAt = now; if (!panelsOn) showPanels(true); }
        else if (panelsOn && now - idleAt > 2600) showPanels(false);

        if (!window.__bmPause && readyRef.current && panelsOn && now >= panelsReadyAt) {
          for (const c of cursors) {
            if (c.job || !ready2.length) continue;
            let best = null, bestScore = Infinity;
            for (const n of ready2) {
              if (n.state !== "pending") continue;
              const score = Math.hypot(n.left - c.x, n.top - sy - c.y) + (PREFER[n.kind]?.includes(c.def.name) ? 0 : 500);
              if (score < bestScore) { bestScore = score; best = n; }
            }
            if (best) { start(c, best, backlog); ready2.splice(ready2.indexOf(best), 1); }
          }
        }

        // update what is being built: read everything first, then write
        const active = cursors.filter((c) => c.job);
        const rects = active.map((c) => c.job.el.getBoundingClientRect());
        active.forEach((c, i) => {
          const n = c.job;
          const r = rects[i];
          if (n.state === "building") {
            if (n.typed) {
              cutType(n, n.p);
              const pos = n.p * n.lines;
              const li = Math.min(n.lines - 1, Math.floor(pos));
              const lh = r.height / n.lines;
              n.edge = { x: r.left + (pos - li) * r.width, y: r.top + li * lh + lh * 0.7 };
              if (n.caret) { n.caret.style.height = `${lh}px`; n.caret.style.transform = `translate(${n.edge.x}px,${r.top + li * lh}px)`; }
              ctEl.textContent = n.txt.slice(0, Math.floor(n.p * n.txt.length)) + "▏";
            } else {
              cut(n, n.p);
              n.edge = { x: r.left + r.width * n.p, y: r.top + r.height * n.p };
            }
          }
          if (n.frameOn) {
            n.frame.style.transform = `translate(${r.left}px,${r.top}px)`;
            n.frame.style.width = `${r.width}px`;
            n.frame.style.height = `${r.height}px`;
          }
          if (c.tgt) {
            const t = c.tgt();
            const f = c.from || t;
            c.x = f.x + (t.x - f.x) * c.s;
            c.y = f.y + (t.y - f.y) * c.s;
          }
          c.el.style.transform = `translate(${c.x}px,${c.y}px)`;
        });
        for (const c of cursors) {
          if (!c.job && c.shown && now - c.idleSince > 1400) { c.shown = false; gsap.to(c.el, { opacity: 0, duration: 0.4, overwrite: "auto" }); }
        }
        grid.style.opacity = active.length || backlog ? "1" : "0";
      };
      gsap.ticker.add(tick);

      // each section is set up just before it scrolls in
      for (const sec of [...main.children]) {
        if (sec.classList.contains("bm-layer") || !sec.getBoundingClientRect().height) continue;
        const r = sec.getBoundingClientRect();
        if (r.top < window.innerHeight + 250 && r.bottom > 0) setup(sec); // before the first paint, so nothing is seen unbuilt
        else if (r.top >= 0) ScrollTrigger.create({ trigger: sec, start: "top bottom+=250", once: true, onEnter: () => setup(sec) });
      }

      return () => {
        gsap.ticker.remove(tick);
        stopEvents.forEach((ev) => window.removeEventListener(ev, stopAuto));
        window.removeEventListener("beforeprint", onPrint);
        window.removeEventListener("keydown", onEsc);
        stepTween?.kill();
        timelines.forEach((t) => t.kill());
        for (const n of [...nodes]) unmask(n); // whatever is still hidden is shown again
        layer.remove();
      };
    },
    { dependencies: [] }
  );
  return null;
};

export default BuilderFX;
