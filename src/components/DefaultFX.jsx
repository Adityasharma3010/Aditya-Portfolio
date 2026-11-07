import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { gsap, useGSAP, ScrollTrigger, prefersReducedMotion } from "../lib/gsap";
import { scrambleText } from "../lib/scramble";
import { unlock } from "../lib/achievements";

// Default skin only (Cyberpunk has its own CyberFX):
//  - text scramble: nav links and buttons on hover, section labels and headings when they scroll into view
//  - project cards: the image and text lean toward the pointer at different depths, a glint sweeps across and a
//    soft spotlight follows the pointer
const DefaultFX = ({ ready }) => {
  const { pathname } = useLocation();

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      ScrollTrigger.batch("[data-scramble-in]", {
        start: "top 92%",
        once: true,
        onEnter: (els) => els.forEach((el, i) => scrambleText(el, { duration: 0.9, delay: i * 0.08 })),
      });
      ScrollTrigger.batch(".sh-title", {
        start: "top 80%",
        once: true,
        onEnter: (els) => els.forEach((el) => scrambleText(el, { duration: 1.1 })),
      });
    },
    { dependencies: [pathname, ready], revertOnUpdate: true }
  );

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const canHover = window.matchMedia("(hover: hover)").matches;

    // ---- hover scramble ----
    const over = (e) => {
      const host = e.target.closest?.("[data-scramble], a, button");
      const el = host?.matches("[data-scramble]") ? host : host?.querySelector("[data-scramble]");
      if (el && !el.dataset.scrambling) {
        el.dataset.scrambling = "1";
        scrambleText(el, { duration: 0.5, onDone: () => delete el.dataset.scrambling });
      }
    };

    // ---- project cards ----
    const cards = new WeakMap();
    let cur = null;
    const setup = (card) => {
      if (cards.has(card)) return cards.get(card);
      const body = card.lastElementChild; // read before the overlays below are appended
      const make = (css) => { const i = document.createElement("i"); i.setAttribute("aria-hidden", "true"); i.style.cssText = `position:absolute;z-index:5;pointer-events:none;opacity:0;${css}`; card.appendChild(i); return i; };
      const spot = make("inset:0;background:radial-gradient(380px circle at var(--mx, 50%) var(--my, 50%), rgba(255,255,255,.16), transparent 60%);");
      const glint = make("top:-20%;bottom:-20%;left:0;width:34%;background:linear-gradient(90deg, transparent, rgba(255,255,255,.3), transparent);");
      const img = card.querySelector(".card-img > *");
      const q = (el, p, d) => (el ? gsap.quickTo(el, p, { duration: d, ease: "power3.out" }) : () => {});
      const s = { spot, glint, img, body, ix: q(img, "x", 0.6), iy: q(img, "y", 0.6), bx: q(body, "x", 0.7), by: q(body, "y", 0.7) };
      cards.set(card, s);
      return s;
    };
    const enter = (card) => {
      const s = setup(card);
      gsap.to(s.spot, { opacity: 1, duration: 0.4 });
      gsap.fromTo(s.glint, { xPercent: -140, skewX: -18, opacity: 1 }, { xPercent: 420, duration: 0.9, ease: "power2.inOut", onComplete: () => gsap.set(s.glint, { opacity: 0 }) });
    };
    const leave = (card) => {
      card.removeAttribute("data-xray");
      const s = cards.get(card);
      if (!s) return;
      s.ix(0); s.iy(0); s.bx(0); s.by(0);
      gsap.to(s.spot, { opacity: 0, duration: 0.4 });
    };
    const overCard = (e) => {
      if (!canHover) return;
      const card = e.target.closest?.(".project-card") || null;
      if (card === cur) return;
      if (cur) leave(cur);
      cur = card;
      if (card) enter(card);
    };
    // easter egg: hold Shift while hovering a card for an x-ray look
    const xray = (on) => {
      if (!cur) return;
      if (!on) return cur.removeAttribute("data-xray");
      if (!cur.hasAttribute("data-xray")) {
        cur.setAttribute("data-xray", "");
        unlock("xray");
      }
    };
    const shift = (e) => { if (e.key === "Shift") xray(e.type === "keydown"); };
    const move = (e) => {
      if (!cur) return;
      xray(e.shiftKey);
      const r = cur.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      const s = cards.get(cur);
      if (!s) return;
      s.ix(px * 30); s.iy(py * 22);
      s.bx(-px * 10); s.by(-py * 8);
      s.spot.style.setProperty("--mx", `${e.clientX - r.left}px`);
      s.spot.style.setProperty("--my", `${e.clientY - r.top}px`);
    };

    document.addEventListener("pointerover", over);
    document.addEventListener("pointerover", overCard);
    document.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("keydown", shift);
    window.addEventListener("keyup", shift);
    return () => {
      window.removeEventListener("keydown", shift);
      window.removeEventListener("keyup", shift);
      document.removeEventListener("pointerover", over);
      document.removeEventListener("pointerover", overCard);
      document.removeEventListener("pointermove", move);
      if (cur) leave(cur);
    };
  }, []);

  return null;
};

export default DefaultFX;
