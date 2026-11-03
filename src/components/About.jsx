import { useRef } from "react";
import { gsap, SplitText, useGSAP, prefersReducedMotion } from "../lib/gsap";
import { about, stats } from "../data";
import SectionHead from "./SectionHead";
import Parallax from "./Parallax";

const About = () => {
  const root = useRef(null);

  useGSAP(
    () => {
      const reduce = prefersReducedMotion();

      // headline slides up
      gsap.from(".sh-title, .sh-meta", {
        yPercent: 40, opacity: 0, duration: 1.1, ease: "power4.out", stagger: 0.1,
        scrollTrigger: { trigger: root.current, start: "top 75%" },
      });

      // paragraph: words light up one by one as you scroll through it
      const split = new SplitText(".about-text", { type: "words" });
      if (!reduce) {
        gsap.fromTo(split.words, { opacity: 0.12 }, {
          opacity: 1, ease: "none", stagger: 0.1,
          scrollTrigger: { trigger: ".about-text", start: "top 80%", end: "bottom 45%", scrub: true },
        });
      }

      // stat counters
      gsap.utils.toArray(".stat-num").forEach((el) => {
        const end = Number(el.dataset.value);
        const obj = { v: 0 };
        gsap.to(obj, {
          v: end, duration: 2, ease: "power3.out",
          onUpdate: () => (el.firstChild.textContent = Math.round(obj.v)),
          scrollTrigger: { trigger: el, start: "top 90%", once: true },
        });
      });
      gsap.from(".stat", {
        y: 50, opacity: 0, duration: 0.9, stagger: 0.12, ease: "power3.out",
        scrollTrigger: { trigger: ".stats", start: "top 85%" },
      });

      return () => split.revert();
    },
    { scope: root }
  );

  return (
    <section id="about" ref={root} className="relative px-5 py-28 sm:px-10 sm:py-44">
      <Parallax speed={0.5} className="pointer-events-none absolute right-[4vw] top-10 select-none font-display text-[22vw] font-extrabold leading-none text-outline opacity-40" aria-hidden="true">
        01
      </Parallax>
      <div className="relative mx-auto max-w-[1500px]">
        <SectionHead index="01" label="About" title={<>Hello<span className="text-accent">.</span></>} />
        <p className="about-text max-w-5xl text-balance font-display text-[clamp(1.5rem,3.6vw,3.2rem)] font-medium leading-[1.2] tracking-tight">
          {about}
        </p>

        <div className="stats mt-20 grid grid-cols-1 gap-px overflow-hidden rounded-3xl border hairline bg-line/10 sm:mt-32 sm:grid-cols-3">
          {stats.map((s) => (
            <div key={s.label} className="stat bg-bg p-8 sm:p-10">
              <div className="font-display text-7xl font-extrabold tracking-tighter sm:text-8xl">
                <span className="stat-num" data-value={s.value}><span>0</span></span>
                <span className="text-accent">{s.suffix}</span>
              </div>
              <p className="mt-3 font-mono text-xs uppercase tracking-widest text-muted">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;
