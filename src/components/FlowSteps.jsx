import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "../lib/gsap";

// Numbered flow (auth flow, sharing flow). The spine draws as you scroll, each step lands with it.
const FlowSteps = ({ title, steps }) => {
  const root = useRef(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.fromTo(".fs-fill", { scaleY: 0 }, { scaleY: 1, ease: "none", transformOrigin: "top", scrollTrigger: { trigger: ".fs-list", start: "top 75%", end: "bottom 70%", scrub: true } });
      gsap.utils.toArray(".fs-step").forEach((el) => {
        gsap.from(el, { x: -30, opacity: 0, duration: 0.7, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 85%" } });
        gsap.from(el.querySelector(".fs-dot"), { scale: 0, duration: 0.5, ease: "back.out(3)", scrollTrigger: { trigger: el, start: "top 85%" } });
      });
    },
    { scope: root }
  );

  return (
    <div ref={root}>
      <p className="mb-6 font-mono text-[11px] uppercase tracking-widest text-muted">{title}</p>
      <div className="relative">
        <span aria-hidden="true" className="absolute bottom-2 left-[7px] top-2 w-px bg-line/15">
          <span className="fs-fill block h-full w-full bg-accent" />
        </span>
        <ol className="fs-list pl-8">
        {steps.map((s, i) => (
          <li key={i} className="fs-step relative pb-8 last:pb-0">
            <span className="fs-dot absolute -left-[31px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-accent bg-bg" />
            <p className="font-mono text-[11px] uppercase tracking-widest text-accent">{String(i + 1).padStart(2, "0")} · {s.actor}</p>
            <p className="mt-1.5 max-w-2xl text-muted">{s.text}</p>
          </li>
        ))}
        </ol>
      </div>
    </div>
  );
};

export default FlowSteps;
