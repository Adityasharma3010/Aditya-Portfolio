import { useMemo, useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "../lib/gsap";
import { SCRAMBLE_CHARS } from "../lib/cyber";

const GLYPHS = "01アイウエオカキクケコサシスセソ<>/{}[]#$%".split("");
const DEPTH = 220; // lines per column: taller than the section so the stream never runs dry
const column = (len) => Array.from({ length: len }, () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)]).join("");

// Falling data streams (cyberpunk only): columns drift down at different speeds, random ones re-scramble.
const DataRain = ({ className = "", columns = 9 }) => {
  const root = useRef(null);
  const cols = useMemo(() => Array.from({ length: columns }, () => column(DEPTH)), [columns]);

  useGSAP(
    (_, contextSafe) => {
      if (prefersReducedMotion()) return;
      gsap.utils.toArray(".dr-col").forEach((el, i) => {
        gsap.fromTo(el, { yPercent: -50 }, { yPercent: 0, duration: gsap.utils.random(14, 30), ease: "none", repeat: -1, delay: -i * 2 });
        gsap.fromTo(el, { opacity: 0 }, { opacity: gsap.utils.random(0.45, 1), duration: 1.2, delay: i * 0.15 });
      });
      const refresh = contextSafe(() => {
        const el = gsap.utils.random(gsap.utils.toArray(".dr-col"));
        gsap.to(el, { duration: 1.4, scrambleText: { text: column(DEPTH), chars: SCRAMBLE_CHARS, speed: 0.4 } });
        gsap.delayedCall(gsap.utils.random(0.6, 1.6), refresh);
      });
      gsap.delayedCall(1, refresh);
    },
    { scope: root }
  );

  return (
    <div
      ref={root}
      className={`pointer-events-none absolute overflow-hidden font-mono text-[12px] leading-[1.2] text-accent2 [text-shadow:0_0_8px_rgb(var(--accent2)/0.7)] ${className}`}
      style={{ maskImage: "linear-gradient(to bottom, transparent, #000 25%, #000 75%, transparent)", WebkitMaskImage: "linear-gradient(to bottom, transparent, #000 25%, #000 75%, transparent)" }}
      aria-hidden="true"
    >
      <div className="flex h-full justify-around overflow-hidden">
        {cols.map((c, i) => (
          <div key={i} className="dr-col" style={{ writingMode: "vertical-rl", textOrientation: "upright", letterSpacing: "0.18em", lineHeight: 1.2 }}>{c}</div>
        ))}
      </div>
    </div>
  );
};

export default DataRain;
