import { useEffect } from "react";
import { gsap, prefersReducedMotion } from "../lib/gsap";
import { scrambleText } from "../lib/scramble";
import { unlock } from "../lib/achievements";
import { notice } from "../lib/toasts";

// Easter eggs that need a listener (each one is a secret in the Secrets panel):
//  logo      click the AS. logo five times, fast
//  tabs      the title changes while you are away
//  dizzy     drag across the rotating badge in the hero
//  name      triple-click the big name in the hero
//  bottom    keep scrolling at the very bottom of the page
//  owl       visit between 2 and 4 in the morning
//  copy      copy a longer piece of text and it gets a signature
//  tiny      make the window really small
//  patient   stay idle for a minute (also a quiet hint about the arrow keys)
// Elsewhere: the console one lives in lib/hints.js, the 404 one in NotFound, shift + hover in DefaultFX.
const Eggs = () => {
  useEffect(() => {
    const cleanups = [];
    const on = (target, type, fn, opts) => {
      target.addEventListener(type, fn, opts);
      cleanups.push(() => target.removeEventListener(type, fn, opts));
    };

    // ---- logo: five quick clicks ----
    let n = 0;
    let last = 0;
    on(document, "click", (e) => {
      const logo = e.target.closest?.("[data-egg-logo]");
      if (!logo) return;
      const now = performance.now();
      n = now - last < 900 ? n + 1 : 1;
      last = now;
      if (n < 5) return;
      n = 0;
      unlock("logo");
      if (prefersReducedMotion()) return;
      gsap.fromTo(logo, { rotationX: 0, transformPerspective: 600 }, { rotationX: 720, duration: 1.1, ease: "power3.inOut", onComplete: () => gsap.set(logo, { rotationX: 0 }) });
      scrambleText(logo, { duration: 1.1 });
    });

    // ---- name: triple-click the hero title ----
    on(document, "click", (e) => {
      if (e.detail !== 3) return;
      const title = e.target.closest?.(".hero-title");
      if (!title) return;
      unlock("name");
      if (!prefersReducedMotion()) scrambleText(title, { duration: 1.4 });
    });

    // ---- dizzy: drag across the badge to spin it up ----
    let drag = null;
    on(document, "pointerdown", (e) => {
      const badge = e.target.closest?.("[data-egg-badge]");
      drag = badge ? { badge, x: e.clientX, y: e.clientY, dist: 0 } : null;
    });
    on(document, "pointermove", (e) => {
      if (!drag) return;
      drag.dist += Math.hypot(e.clientX - drag.x, e.clientY - drag.y);
      drag.x = e.clientX;
      drag.y = e.clientY;
      if (drag.dist < 500) return;
      const { badge } = drag;
      drag = null;
      unlock("dizzy");
      const ring = badge.querySelector(".hero-badge-ring");
      const spin = ring && gsap.getTweensOf(ring).find((t) => t.vars.rotate === 360);
      if (spin && !prefersReducedMotion()) gsap.fromTo(spin, { timeScale: 14 }, { timeScale: 1, duration: 3.5, ease: "power2.out", overwrite: "auto" });
    }, { passive: true });
    on(document, "pointerup", () => { drag = null; });

    // ---- bottom: keep scrolling at the very bottom ----
    let acc = 0;
    let lastWheel = 0;
    on(window, "wheel", (e) => {
      const el = document.documentElement;
      const atBottom = Math.ceil(window.scrollY + window.innerHeight) >= el.scrollHeight - 2;
      const now = performance.now();
      if (!atBottom || e.deltaY <= 0 || now - lastWheel > 1200) acc = 0;
      lastWheel = now;
      if (!atBottom || e.deltaY <= 0) return;
      acc += e.deltaY;
      if (acc < 900) return;
      acc = 0;
      if (unlock("bottom")) notice("That is the bottom. There is nothing below. Go say hi.", 4200);
    }, { passive: true });

    // ---- owl: visiting in the small hours ----
    const hour = new Date().getHours();
    if (hour >= 2 && hour < 4) {
      const t = setTimeout(() => {
        unlock("owl");
        if (!sessionStorage.getItem("owl")) {
          sessionStorage.setItem("owl", "1");
          notice("You should be asleep. Thanks for stopping by.", 4200);
        }
      }, 5000);
      cleanups.push(() => clearTimeout(t));
    }

    // ---- copy: a longer copy gets a signature ----
    on(document, "copy", (e) => {
      const sel = window.getSelection();
      const text = sel ? sel.toString() : "";
      if (text.length < 40) return;
      const from = sel.anchorNode?.parentElement;
      if (from?.closest("input, textarea, pre, code, [contenteditable]")) return;
      e.clipboardData.setData("text/plain", `${text}\n\n- Aditya Sharma, adityasharma.site`);
      e.preventDefault();
      if (unlock("copy")) notice("Copied. Signed, too.", 3000);
    });

    // ---- tiny: a really small window ----
    let tinyTimer = 0;
    const tinyCheck = () => {
      if (window.innerWidth < 300 || window.innerHeight < 280) {
        if (unlock("tiny")) notice("This is the smallest I go.", 3200);
      }
    };
    on(window, "resize", () => { clearTimeout(tinyTimer); tinyTimer = setTimeout(tinyCheck, 250); });
    tinyCheck();
    cleanups.push(() => clearTimeout(tinyTimer));

    // ---- patient: a minute without doing anything ----
    let idleTimer = 0;
    const arm = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        unlock("patient");
        if (!sessionStorage.getItem("idle-hint")) {
          sessionStorage.setItem("idle-hint", "1");
          notice("Still there? The arrow keys know more than you think.", 6000);
        }
      }, 60000);
    };
    ["pointermove", "keydown", "wheel", "click", "touchstart", "scroll"].forEach((t) => on(window, t, arm, { passive: true }));
    arm();
    cleanups.push(() => clearTimeout(idleTimer));

    // ---- tabs: the title notices when you leave ----
    let away = null;
    on(document, "visibilitychange", () => {
      if (document.hidden) {
        away = document.title;
        document.title = "Come back, I saved your spot";
      } else if (away !== null) {
        const back = away;
        away = null;
        document.title = "Welcome back";
        setTimeout(() => { if (document.title === "Welcome back") document.title = back; }, 1800);
        unlock("tabs");
      }
    });

    return () => cleanups.forEach((fn) => fn());
  }, []);
  return null;
};

export default Eggs;
