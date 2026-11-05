import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "../lib/gsap";
import { glitchOnce, SCRAMBLE_CHARS } from "../lib/cyber";

const BOOT = [
  "> BOOT SEQUENCE INITIATED",
  "> MOUNTING NEURAL_LINK.SYS ........ OK",
  "> LOADING GSAP.CORE ............... OK",
  "> SPOOFING CORPO FIREWALL ......... OK",
  "> ACCESS GRANTED // WELCOME, CHOOMBA",
];

// Intro. Default themes: counter + name reveal + split panels.
// Cyberpunk: terminal boot log typed with scramble, glitching name, CRT power-on.
const Loader = ({ onDone }) => {
  const root = useRef(null);
  const count = useRef(null);
  const cyber = document.documentElement.getAttribute("data-skin") === "cyber";

  useGSAP(
    () => {
      if (prefersReducedMotion()) {
        onDone();
        return;
      }
      const counter = { v: 0 };
      const setCount = () => count.current && (count.current.textContent = String(Math.round(counter.v)).padStart(3, "0"));
      const tl = gsap.timeline({ onComplete: onDone });

      if (cyber) {
        tl.to(".ld-bar", { scaleX: 1, duration: 2.6, ease: "steps(24)" }, 0)
          .to(counter, { v: 100, duration: 2.6, ease: "none", onUpdate: setCount }, 0);
        gsap.utils.toArray(".ld-line").forEach((el, i) => {
          const text = el.dataset.text;
          tl.set(el, { opacity: 1 }, 0.15 + i * 0.5)
            .to(el, { duration: 0.45, scrambleText: { text, chars: SCRAMBLE_CHARS, speed: 1.2 } }, 0.15 + i * 0.5);
        });
        tl.from(".ld-word", { yPercent: 110, duration: 0.7, ease: "power4.out" }, 2.4)
          .add(() => glitchOnce(".ld-word", 8), 3.1)
          .to(".ld-content", { opacity: 0, scaleY: 0.01, duration: 0.35, ease: "power4.in" }, 3.7)
          .to(".ld-top", { yPercent: -100, duration: 0.8, ease: "power4.inOut" }, 3.7)
          .to(".ld-bottom", { yPercent: 100, duration: 0.8, ease: "power4.inOut" }, 3.7);
        return;
      }

      tl.from(".ld-word", { yPercent: 110, duration: 0.9, ease: "power4.out", stagger: 0.08 })
        .to(counter, { v: 100, duration: 1.4, ease: "power2.inOut", onUpdate: setCount }, 0)
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
        {cyber && (
          <div className="mb-10 w-[min(92vw,520px)] space-y-1.5 font-mono text-[11px] text-accent2 sm:text-sm">
            {BOOT.map((l) => (
              <p key={l} className="ld-line opacity-0" data-text={l}>{l}</p>
            ))}
          </div>
        )}
        <div className="mask">
          <div className="ld-word font-display text-[clamp(2.2rem,10vw,7rem)] font-bold leading-none tracking-tight text-fg">
            {cyber ? "ADITYA//SHARMA" : "Aditya Sharma"}
          </div>
        </div>
        <div className="mt-6 h-px w-48 origin-left bg-line/20 sm:w-72">
          <div className="ld-bar h-full origin-left scale-x-0 bg-accent" style={cyber ? { height: 3, boxShadow: "0 0 12px rgb(var(--accent))" } : undefined} />
        </div>
        <span ref={count} className="mt-4 font-mono text-xs tracking-widest text-muted">000</span>
      </div>
    </div>
  );
};

export default Loader;
