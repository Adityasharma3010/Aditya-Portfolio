import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from "../lib/gsap";

// Endless marquee that speeds up and flips with scroll velocity.
// items: strings or nodes. reverse: run the other way. separator: show the star between items.
const Marquee = ({ items, speed = 40, reverse = false, separator = true, pauseOnHover = false, className = "", itemClass = "" }) => {
  const root = useRef(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const tween = reverse
        ? gsap.fromTo(".mq-track", { xPercent: -50 }, { xPercent: 0, duration: speed, ease: "none", repeat: -1 })
        : gsap.to(".mq-track", { xPercent: -50, duration: speed, ease: "none", repeat: -1 });

      ScrollTrigger.create({
        trigger: root.current,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          const boost = 1 + Math.min(Math.abs(self.getVelocity()) / 400, 6);
          gsap.to(tween, { timeScale: self.direction * boost, duration: 0.2, overwrite: true });
          gsap.to(tween, { timeScale: self.direction, duration: 1, delay: 0.2 });
        },
      });

      if (pauseOnHover) {
        const slow = () => gsap.to(tween, { timeScale: 0.15, duration: 0.5, overwrite: true });
        const fast = () => gsap.to(tween, { timeScale: 1, duration: 0.5, overwrite: true });
        root.current.addEventListener("pointerenter", slow);
        root.current.addEventListener("pointerleave", fast);
        return () => {
          root.current?.removeEventListener("pointerenter", slow);
          root.current?.removeEventListener("pointerleave", fast);
        };
      }
    },
    { scope: root }
  );

  const row = items.map((t, i) => (
    <span key={i} className={`flex shrink-0 items-center gap-8 pr-8 ${itemClass}`}>
      <span>{t}</span>
      {separator && <span className="text-accent">✦</span>}
    </span>
  ));

  return (
    <div ref={root} className={`overflow-hidden whitespace-nowrap ${className}`}>
      <div className="mq-track flex w-max">
        <div className="flex" aria-hidden="false">{row}</div>
        <div className="flex" aria-hidden="true">{row}</div>
      </div>
    </div>
  );
};

export default Marquee;
