import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "../lib/gsap";

// Dot + ring follower. Hover anything with data-cursor="Label" to grow the ring with a label.
const Cursor = () => {
  const ring = useRef(null);
  const dot = useRef(null);
  const label = useRef(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!fine || prefersReducedMotion()) return;
    document.body.classList.add("has-cursor");

    const rx = gsap.quickTo(ring.current, "x", { duration: 0.45, ease: "power3" });
    const ry = gsap.quickTo(ring.current, "y", { duration: 0.45, ease: "power3" });
    const dx = gsap.quickTo(dot.current, "x", { duration: 0.1, ease: "power3" });
    const dy = gsap.quickTo(dot.current, "y", { duration: 0.1, ease: "power3" });
    gsap.set([ring.current, dot.current], { xPercent: -50, yPercent: -50, opacity: 0 });

    const move = (e) => {
      gsap.to([ring.current, dot.current], { opacity: 1, duration: 0.3, overwrite: "auto" });
      rx(e.clientX); ry(e.clientY); dx(e.clientX); dy(e.clientY);
    };
    const over = (e) => {
      const t = e.target.closest?.("[data-cursor], a, button");
      if (!t) return;
      const text = t.getAttribute("data-cursor");
      gsap.to(ring.current, {
        scale: text ? 3.4 : 1.8,
        backgroundColor: text ? "rgb(var(--accent))" : "transparent",
        duration: 0.35,
        ease: "power3.out",
      });
      label.current.textContent = text || "";
      gsap.to(dot.current, { scale: text ? 0 : 1, duration: 0.2 });
    };
    const out = (e) => {
      if (!e.target.closest?.("[data-cursor], a, button")) return;
      gsap.to(ring.current, { scale: 1, backgroundColor: "transparent", duration: 0.35, ease: "power3.out" });
      gsap.to(dot.current, { scale: 1, duration: 0.2 });
      label.current.textContent = "";
    };
    const leave = () => gsap.to([ring.current, dot.current], { opacity: 0, duration: 0.2 });

    window.addEventListener("pointermove", move);
    document.addEventListener("pointerover", over);
    document.addEventListener("pointerout", out);
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      document.body.classList.remove("has-cursor");
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerover", over);
      document.removeEventListener("pointerout", out);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, []);

  return (
    <>
      <div
        ref={ring}
        className="pointer-events-none fixed left-0 top-0 z-[95] flex h-9 w-9 items-center justify-center rounded-full border border-fg/40"
        aria-hidden="true"
      >
        <span ref={label} className="select-none font-mono text-[4px] font-medium uppercase tracking-wider text-accent-ink" />
      </div>
      <div
        ref={dot}
        className="pointer-events-none fixed left-0 top-0 z-[95] h-1.5 w-1.5 rounded-full bg-accent"
        aria-hidden="true"
      />
    </>
  );
};

export default Cursor;
