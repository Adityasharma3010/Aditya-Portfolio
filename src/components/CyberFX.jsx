import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from "../lib/gsap";
import { glitchOnce, cv, SCRAMBLE_CHARS } from "../lib/cyber";

const TOKENS = ["accent", "accent2", "accent3"];

// Everything that makes the whole page feel like a CRT / neon city:
// scanlines, flicker, rolling band, tear bars, flickering neon signs, glitching + stepped-in headings,
// decrypting text, beacon dots on the timeline, scan sweeps and chromatic hover on cards, live input effects.
const CyberFX = ({ ready = true }) => {
  const root = useRef(null);
  const { pathname } = useLocation();

  // ---- screen layer (once while cyberpunk is active) ----
  useGSAP(
    (_, contextSafe) => {
      if (prefersReducedMotion()) return;
      gsap.fromTo(".cfx-roll", { y: "-30vh" }, { y: "110vh", duration: 7, ease: "none", repeat: -1 });
      gsap.to(".cfx-scan", { opacity: () => gsap.utils.random(0.7, 1), duration: 0.09, repeat: -1, repeatRefresh: true, repeatDelay: 0.05 });

      const bars = gsap.utils.toArray(".cfx-bar");
      const fire = contextSafe(() => {
        const b = gsap.utils.random(bars);
        const c = cv(gsap.utils.random(TOKENS), 0.55);
        gsap.timeline({ onComplete: () => gsap.delayedCall(gsap.utils.random(3, 8), fire) })
          .set(b, { top: gsap.utils.random(4, 94) + "%", height: gsap.utils.random(2, 26), x: gsap.utils.random(-30, 30), opacity: 1, backgroundColor: c })
          .to(b, { x: () => gsap.utils.random(-90, 90), duration: 0.06, repeat: 4, yoyo: true, ease: "none" })
          .set(b, { opacity: 0 });
      });
      gsap.delayedCall(2, fire);
    },
    { scope: root }
  );

  // ---- per page (re-runs on route change) ----
  useGSAP(
    (_, contextSafe) => {
      if (!ready || prefersReducedMotion()) return;

      // headings glitch on a random schedule
      gsap.utils.toArray("[data-glitch]").forEach((el, i) => {
        const loop = contextSafe(() => {
          glitchOnce(el);
          gsap.delayedCall(gsap.utils.random(3, 7), loop);
        });
        gsap.delayedCall(1.5 + i * 0.6, loop);
      });

      // broken neon sign: accent words flicker like a failing tube
      gsap.utils.toArray("[data-neon]").forEach((el, i) => {
        const flicker = contextSafe(() => {
          const tl = gsap.timeline({ onComplete: () => gsap.delayedCall(gsap.utils.random(2, 6), flicker) });
          [0.25, 1, 0.4, 1, 0.15, 0.9, 0.3, 1].forEach((o) => tl.to(el, { opacity: o, duration: gsap.utils.random(0.03, 0.08), ease: "none" }));
        });
        gsap.delayedCall(1 + i * 1.3, flicker);
      });

      // timeline dots pulse like beacons
      const dots = gsap.utils.toArray(".exp-dot");
      if (dots.length) {
        gsap.fromTo(dots, { boxShadow: `0 0 0 0 ${cv("accent", 0.7)}` }, { boxShadow: `0 0 0 16px ${cv("accent", 0)}`, duration: 1.6, ease: "power2.out", repeat: -1, stagger: 0.35 });
      }

      // text decrypts when it appears
      gsap.utils.toArray("[data-decrypt]").forEach((el) => {
        const text = el.dataset.final || (el.dataset.final = el.textContent);
        gsap.to(el, { duration: 1.6, delay: 1.2, ease: "none", scrambleText: { text, chars: SCRAMBLE_CHARS, speed: 0.5 } });
      });

      // section labels scramble in; big titles snap in with a stepped scan reveal
      ScrollTrigger.batch("[data-scramble-in]", {
        start: "top 92%",
        once: true,
        onEnter: (els) =>
          els.forEach((el, i) => {
            const text = el.dataset.final || (el.dataset.final = el.textContent);
            gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.2, delay: i * 0.08 });
            gsap.to(el, { duration: 0.9, delay: i * 0.08, scrambleText: { text, chars: SCRAMBLE_CHARS, speed: 0.6 } });
          }),
      });
      ScrollTrigger.batch(".sh-title", {
        start: "top 88%",
        once: true,
        onEnter: (els) =>
          els.forEach((el) => {
            gsap.fromTo(el, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: 0.7, ease: "steps(10)", clearProps: "clipPath", onComplete: () => glitchOnce(el, 4) });
          }),
      });
    },
    { dependencies: [pathname, ready], revertOnUpdate: true }
  );

  // ---- delegated interactions ----
  useEffect(() => {
    const reduce = prefersReducedMotion();

    const over = (e) => {
      // hover scramble for anything marked data-scramble
      const el = e.target.closest?.("[data-scramble]");
      if (el && !el.dataset.scrambling && !reduce) {
        const text = el.textContent;
        el.dataset.scrambling = "1";
        gsap.to(el, { duration: 0.6, scrambleText: { text, chars: SCRAMBLE_CHARS, speed: 0.8, revealDelay: 0.1 }, onComplete: () => delete el.dataset.scrambling });
      }
      // project cards: scan line sweeps down, title glitches, image flashes an RGB split
      const card = e.target.closest?.(".project-card");
      if (card && !card.dataset.sweeping && !reduce) {
        card.dataset.sweeping = "1";
        const s = document.createElement("i");
        s.style.cssText = `position:absolute;left:0;right:0;top:0;height:2px;z-index:6;pointer-events:none;background:linear-gradient(90deg,transparent,${cv("accent")},${cv("accent2")},transparent);box-shadow:0 0 14px ${cv("accent")}`;
        card.appendChild(s);
        gsap.to(s, { y: card.clientHeight, duration: 0.7, ease: "power2.inOut", onComplete: () => { s.remove(); delete card.dataset.sweeping; } });
        const title = card.querySelector("h3");
        if (title) glitchOnce(title, 4);
        const img = card.querySelector(".card-img");
        if (img) {
          gsap.fromTo(img, { filter: "drop-shadow(0 0 0 rgba(0,0,0,0))" }, { filter: `drop-shadow(5px 0 ${cv("accent2")}) drop-shadow(-5px 0 ${cv("accent3")})`, duration: 0.08, repeat: 5, yoyo: true, ease: "none", clearProps: "filter" });
        }
      }
    };

    // inputs: glow on focus, jitter + chromatic flash on every keystroke
    const isField = (t) => t?.matches?.("input, textarea");
    const focusin = (e) => {
      if (!isField(e.target)) return;
      gsap.to(e.target, { boxShadow: `0 0 22px ${cv("accent", 0.4)}, inset 0 0 14px ${cv("accent", 0.1)}`, duration: 0.4 });
    };
    const focusout = (e) => {
      if (!isField(e.target)) return;
      gsap.to(e.target, { boxShadow: `0 0 0 ${cv("accent", 0)}`, duration: 0.4 });
    };
    const input = (e) => {
      if (!isField(e.target) || reduce) return;
      gsap.fromTo(e.target, { x: gsap.utils.random(-3, 3) }, { x: 0, duration: 0.25, ease: "elastic.out(1, 0.3)" });
      gsap.fromTo(e.target, { color: cv("accent2") }, { color: cv("fg"), duration: 0.3 });
    };
    const submit = (e) => {
      const b = e.target.closest?.('button[type="submit"]');
      if (b && !reduce) glitchOnce(b, 5);
    };

    document.addEventListener("pointerover", over);
    document.addEventListener("focusin", focusin);
    document.addEventListener("focusout", focusout);
    document.addEventListener("input", input);
    document.addEventListener("click", submit);
    return () => {
      document.removeEventListener("pointerover", over);
      document.removeEventListener("focusin", focusin);
      document.removeEventListener("focusout", focusout);
      document.removeEventListener("input", input);
      document.removeEventListener("click", submit);
    };
  }, []);

  return (
    <div ref={root} className="cfx-layer" aria-hidden="true">
      <div className="cfx-scan" />
      <div className="cfx-roll" />
      {[0, 1, 2].map((i) => (
        <div key={i} className="cfx-bar" />
      ))}
    </div>
  );
};

export default CyberFX;
