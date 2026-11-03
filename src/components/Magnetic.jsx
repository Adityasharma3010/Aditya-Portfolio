import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "../lib/gsap";

// Wrap a button/link: it leans toward the pointer and springs back.
const Magnetic = ({ children, strength = 0.35, className = "" }) => {
  const el = useRef(null);

  useGSAP(
    () => {
      if (prefersReducedMotion() || !window.matchMedia("(hover: hover)").matches) return;
      const node = el.current;
      const xTo = gsap.quickTo(node, "x", { duration: 0.8, ease: "elastic.out(1, 0.4)" });
      const yTo = gsap.quickTo(node, "y", { duration: 0.8, ease: "elastic.out(1, 0.4)" });
      const move = (e) => {
        const r = node.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * strength);
        yTo((e.clientY - (r.top + r.height / 2)) * strength);
      };
      const leave = () => { xTo(0); yTo(0); };
      node.addEventListener("pointermove", move);
      node.addEventListener("pointerleave", leave);
      return () => {
        node.removeEventListener("pointermove", move);
        node.removeEventListener("pointerleave", leave);
      };
    },
    { scope: el }
  );

  return (
    <div ref={el} className={`inline-block ${className}`}>
      {children}
    </div>
  );
};

export default Magnetic;
