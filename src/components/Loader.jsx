import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "../lib/gsap";

// Intro: counter 0-100, name reveal, two panels split open. Plays once per session.
const Loader = ({ onDone }) => {
  const root = useRef(null);
  const count = useRef(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) {
        onDone();
        return;
      }
      const counter = { v: 0 };
      const tl = gsap.timeline({ onComplete: onDone });
      tl.from(".ld-word", { yPercent: 110, duration: 0.9, ease: "power4.out", stagger: 0.08 })
        .to(
          counter,
          {
            v: 100,
            duration: 1.4,
            ease: "power2.inOut",
            onUpdate: () => {
              if (count.current) count.current.textContent = String(Math.round(counter.v)).padStart(3, "0");
            },
          },
          0
        )
        .to(".ld-bar", { scaleX: 1, duration: 1.4, ease: "power2.inOut" }, 0)
        .to(".ld-content", { opacity: 0, y: -30, duration: 0.4, ease: "power2.in" })
        .to(".ld-top", { yPercent: -100, duration: 0.9, ease: "power4.inOut" }, "<0.1")
        .to(".ld-bottom", { yPercent: 100, duration: 0.9, ease: "power4.inOut" }, "<");
    },
    { scope: root }
  );

  return (
    <div ref={root} className="fixed inset-0 z-[100]" role="status" aria-label="Loading">
      <div className="ld-top absolute inset-x-0 top-0 h-1/2 bg-bg" />
      <div className="ld-bottom absolute inset-x-0 bottom-0 h-1/2 bg-bg" />
      <div className="ld-content absolute inset-0 flex flex-col items-center justify-center px-6">
        <div className="mask">
          <div className="ld-word font-display text-[clamp(2.5rem,10vw,7rem)] font-bold leading-none tracking-tight text-fg">
            Aditya Sharma
          </div>
        </div>
        <div className="mt-6 h-px w-48 origin-left bg-line/20 sm:w-72">
          <div className="ld-bar h-full origin-left scale-x-0 bg-accent" />
        </div>
        <span ref={count} className="mt-4 font-mono text-xs tracking-widest text-muted">
          000
        </span>
      </div>
    </div>
  );
};

export default Loader;
