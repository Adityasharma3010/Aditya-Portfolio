import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "../lib/gsap";

const ARROW = "M2 2 L2 21 L7.2 16.2 L10.6 24 L14 22.5 L10.6 15 L17.5 15 Z";
const TARGETS = "a, button, input, textarea, [data-cursor]";
const TRAIL = 9;

const Arrow = ({ stroke, fill = "none", glow, className = "", innerRef }) => (
  <svg
    ref={innerRef}
    className={`pointer-events-none fixed left-0 top-0 z-[96] ${className}`}
    width="26"
    height="28"
    viewBox="0 0 26 28"
    aria-hidden="true"
    style={{ overflow: "visible", filter: glow ? `drop-shadow(0 0 6px ${stroke})` : "none" }}
  >
    <path d={ARROW} style={{ fill, stroke }} strokeWidth="1.6" strokeLinejoin="miter" />
  </svg>
);

// A real arrow pointer (not a circle): exact position, chromatic ghosts, a pixel trail,
// full-screen crosshair lines, a reticle that locks onto anything clickable, and sparks on click.
// All colours come from the theme tokens, so it works in cyberpunk dark and light.
const CyberCursor = () => {
  const arrow = useRef(null);
  const ghostA = useRef(null);
  const ghostB = useRef(null);
  const reticle = useRef(null);
  const tag = useRef(null);
  const lineH = useRef(null);
  const lineV = useRef(null);
  const trail = useRef([]);

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const reduce = prefersReducedMotion();
    document.body.classList.add("has-cursor");

    gsap.set([arrow.current, ghostA.current, ghostB.current, reticle.current, lineH.current, lineV.current, ...trail.current], { opacity: 0 });
    gsap.set(reticle.current, { xPercent: -50, yPercent: -50, width: 28, height: 28 });

    const gax = gsap.quickTo(ghostA.current, "x", { duration: 0.18, ease: "power3" });
    const gay = gsap.quickTo(ghostA.current, "y", { duration: 0.18, ease: "power3" });
    const gbx = gsap.quickTo(ghostB.current, "x", { duration: 0.34, ease: "power3" });
    const gby = gsap.quickTo(ghostB.current, "y", { duration: 0.34, ease: "power3" });

    let locked = null;
    let seen = false;
    const pos = { x: -100, y: -100 };
    const pts = Array.from({ length: TRAIL }, () => ({ x: -100, y: -100 }));

    const move = (e) => {
      pos.x = e.clientX; pos.y = e.clientY;
      if (!seen) {
        seen = true;
        pts.forEach((p) => { p.x = e.clientX; p.y = e.clientY; });
        gsap.set([ghostA.current, ghostB.current], { x: e.clientX, y: e.clientY });
      }
      gsap.set(arrow.current, { x: e.clientX, y: e.clientY, opacity: 1 });
      gax(e.clientX); gay(e.clientY); gbx(e.clientX); gby(e.clientY);
      gsap.to([ghostA.current, ghostB.current], { opacity: 0.7, duration: 0.2, overwrite: "auto" });
      gsap.to([lineH.current, lineV.current], { opacity: 0.16, duration: 0.3, overwrite: "auto" });
      gsap.set(lineH.current, { y: e.clientY });
      gsap.set(lineV.current, { x: e.clientX });
      if (!locked) gsap.set(reticle.current, { x: e.clientX + 8, y: e.clientY + 8 });
    };

    // reticle lock-on: corners snap to the element, the label sits above it (or below when there is no room)
    const lock = (el) => {
      locked = el;
      const r = el.getBoundingClientRect();
      const label = el.getAttribute("data-cursor");
      tag.current.textContent = label ? `[ ${label} ]` : "";
      const below = r.top < 44;
      tag.current.style.top = below ? "calc(100% + 6px)" : "-24px";
      gsap.to(reticle.current, {
        x: r.left + r.width / 2, y: r.top + r.height / 2,
        width: r.width + 16, height: r.height + 16,
        opacity: 1, duration: reduce ? 0 : 0.35, ease: "expo.out", overwrite: "auto",
      });
      gsap.to(arrow.current, { scale: 0.8, rotate: -12, transformOrigin: "2px 2px", duration: 0.2 });
    };
    const unlock = () => {
      locked = null;
      tag.current.textContent = "";
      gsap.to(reticle.current, { width: 28, height: 28, opacity: 0, duration: 0.25, ease: "power3.out", overwrite: "auto" });
      gsap.to(arrow.current, { scale: 1, rotate: 0, duration: 0.25 });
    };
    const over = (e) => {
      const t = e.target.closest?.(TARGETS);
      if (t && t !== locked) lock(t);
    };
    const out = (e) => {
      const t = e.target.closest?.(TARGETS);
      if (t && t === locked && !t.contains(e.relatedTarget)) unlock();
    };

    // every frame: keep the reticle glued to moving elements, drag the pixel trail behind the pointer
    const tick = () => {
      if (locked) {
        if (!document.contains(locked)) unlock();
        else {
          const r = locked.getBoundingClientRect();
          gsap.set(reticle.current, { x: r.left + r.width / 2, y: r.top + r.height / 2, width: r.width + 16, height: r.height + 16 });
        }
      }
      if (reduce || !seen) return;
      let px = pos.x, py = pos.y;
      pts.forEach((p, i) => {
        p.x += (px - p.x) * 0.38;
        p.y += (py - p.y) * 0.38;
        gsap.set(trail.current[i], { x: p.x - 2, y: p.y - 2, opacity: 0.55 * (1 - i / TRAIL), scale: 1 - i / (TRAIL + 2) });
        px = p.x; py = p.y;
      });
    };
    gsap.ticker.add(tick);

    // click: spark burst in the three theme colours + arrow punch
    const down = (e) => {
      gsap.fromTo(arrow.current, { scale: 0.7 }, { scale: locked ? 0.8 : 1, duration: 0.35, ease: "back.out(3)" });
      if (reduce) return;
      const cols = ["--accent", "--accent2", "--accent3"];
      for (let i = 0; i < 12; i++) {
        const s = document.createElement("i");
        const c = `rgb(var(${cols[i % 3]}))`;
        s.style.cssText = `position:fixed;left:${e.clientX}px;top:${e.clientY}px;width:5px;height:5px;background:${c};z-index:96;pointer-events:none;box-shadow:0 0 8px ${c}`;
        document.body.appendChild(s);
        const a = (Math.PI * 2 * i) / 12 + Math.random() * 0.4;
        const d = gsap.utils.random(30, 80);
        gsap.to(s, { x: Math.cos(a) * d, y: Math.sin(a) * d, rotate: gsap.utils.random(-180, 180), opacity: 0, scale: 0.2, duration: gsap.utils.random(0.4, 0.8), ease: "power3.out", onComplete: () => s.remove() });
      }
    };
    const leave = () => gsap.to([arrow.current, ghostA.current, ghostB.current, reticle.current, lineH.current, lineV.current, ...trail.current], { opacity: 0, duration: 0.2 });

    window.addEventListener("pointermove", move);
    document.addEventListener("pointerover", over);
    document.addEventListener("pointerout", out);
    window.addEventListener("pointerdown", down);
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      document.body.classList.remove("has-cursor");
      gsap.ticker.remove(tick);
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerover", over);
      document.removeEventListener("pointerout", out);
      window.removeEventListener("pointerdown", down);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, []);

  return (
    <>
      <div ref={lineH} className="pointer-events-none fixed inset-x-0 top-0 z-[91] h-px bg-accent2" aria-hidden="true" />
      <div ref={lineV} className="pointer-events-none fixed inset-y-0 left-0 z-[91] w-px bg-accent2" aria-hidden="true" />
      {Array.from({ length: TRAIL }).map((_, i) => (
        <i key={i} ref={(el) => (trail.current[i] = el)} className="pointer-events-none fixed left-0 top-0 z-[92] h-1 w-1 bg-accent2" aria-hidden="true" />
      ))}

      <Arrow innerRef={ghostB} stroke="rgb(var(--accent3))" className="z-[94]" />
      <Arrow innerRef={ghostA} stroke="rgb(var(--accent2))" className="z-[95]" />
      <Arrow innerRef={arrow} stroke="rgb(var(--accent))" fill="rgb(var(--bg) / 0.85)" glow />

      <div ref={reticle} className="pointer-events-none fixed left-0 top-0 z-[93]" aria-hidden="true">
        {["left-0 top-0 border-l-2 border-t-2", "right-0 top-0 border-r-2 border-t-2", "bottom-0 left-0 border-b-2 border-l-2", "bottom-0 right-0 border-b-2 border-r-2"].map((c) => (
          <span key={c} className={`absolute h-3 w-3 border-accent ${c}`} />
        ))}
        <span ref={tag} className="absolute left-0 top-[-24px] whitespace-nowrap bg-accent px-1.5 font-mono text-[10px] font-bold uppercase leading-4 text-accent-ink empty:hidden" />
      </div>
    </>
  );
};

export default CyberCursor;
