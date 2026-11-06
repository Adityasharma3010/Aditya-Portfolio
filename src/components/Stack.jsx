import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "../lib/gsap";
import { stack } from "../data";
import Marquee from "./Marquee";

// uniform icon tile: real logo if we have one, otherwise a monogram so every pill looks the same
const Pill = ({ s }) => (
  <div className="group flex items-center gap-3 rounded-2xl border hairline bg-surface py-2.5 pl-2.5 pr-6 transition-colors duration-300 hover:border-accent/60">
    <span className="grid h-10 w-10 place-items-center rounded-xl bg-fg/[0.06] transition-colors duration-300 group-hover:bg-accent">
      {s.icon ? (
        <img src={s.icon} alt="" className={`h-5 w-5 object-contain ${s.mono ? "icon-mono" : ""}`} loading="lazy" />
      ) : (
        <span className="font-mono text-[11px] font-medium uppercase text-accent transition-colors duration-300 group-hover:text-accent-ink">
          {s.name.replace(/[^A-Za-z]/g, "").slice(0, 2)}
        </span>
      )}
    </span>
    <span className="font-mono text-xs uppercase tracking-wider">{s.name}</span>
  </div>
);

const half = Math.ceil(stack.length / 2);
const rowA = stack;
const rowB = [...stack.slice(half), ...stack.slice(0, half)].reverse();

const Stack = () => {
  const root = useRef(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from(".stack-rows", {
        y: 60, opacity: 0, duration: 1, ease: "power3.out",
        scrollTrigger: { trigger: ".stack-rows", start: "top 88%" },
      });
    },
    { scope: root }
  );

  const edge = { maskImage: "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)", WebkitMaskImage: "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)" };

  return (
    <section ref={root} className="overflow-hidden py-20 sm:py-32">
      <Marquee
        items={["React", "GSAP", "Node.js", "WordPress", "Tailwind", "MongoDB", "Supabase"]}
        speed={50}
        className="font-display text-[clamp(2.2rem,6.5vw,5.5rem)] font-extrabold uppercase leading-none tracking-tighter"
      />
      <div className="stack-rows mt-14 space-y-4 sm:mt-20" style={edge}>
        <Marquee items={rowA.map((s) => <Pill key={s.name} s={s} />)} separator={false} speed={60} pauseOnHover itemClass="!pr-4" />
        <Marquee items={rowB.map((s) => <Pill key={s.name} s={s} />)} separator={false} speed={70} reverse pauseOnHover itemClass="!pr-4" />
      </div>
    </section>
  );
};

export default Stack;
