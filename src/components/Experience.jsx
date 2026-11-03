import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "../lib/gsap";
import { experiences } from "../data";
import SectionHead from "./SectionHead";

const Experience = () => {
  const root = useRef(null);

  useGSAP(
    () => {
      gsap.from(".sh-title, .sh-meta", {
        yPercent: 40, opacity: 0, duration: 1.1, ease: "power4.out", stagger: 0.1,
        scrollTrigger: { trigger: root.current, start: "top 75%" },
      });
      if (prefersReducedMotion()) return;

      // the spine draws itself as you scroll
      gsap.fromTo(".spine-fill", { scaleY: 0 }, {
        scaleY: 1, ease: "none", transformOrigin: "top",
        scrollTrigger: { trigger: ".timeline", start: "top 70%", end: "bottom 60%", scrub: true },
      });

      gsap.utils.toArray(".exp").forEach((row) => {
        const tl = gsap.timeline({ scrollTrigger: { trigger: row, start: "top 80%" } });
        tl.from(row.querySelector(".exp-dot"), { scale: 0, duration: 0.5, ease: "back.out(3)" })
          .from(row.querySelector(".exp-card"), { y: 60, opacity: 0, duration: 0.9, ease: "power3.out" }, "<0.1")
          .from(row.querySelectorAll("li"), { x: -20, opacity: 0, duration: 0.6, stagger: 0.1, ease: "power2.out" }, "-=0.5");
      });
    },
    { scope: root }
  );

  return (
    <section id="experience" ref={root} className="px-5 py-28 sm:px-10 sm:py-44">
      <div className="mx-auto max-w-[1500px]">
        <SectionHead index="03" label="Experience" title={<>Journey<span className="text-accent">.</span></>} />

        <div className="timeline relative pl-8 sm:pl-16">
          <div className="absolute bottom-0 left-[7px] top-0 w-px bg-line/15 sm:left-[15px]">
            <div className="spine-fill h-full w-full bg-accent" />
          </div>

          {experiences.map((e) => (
            <article key={e.title + e.date} className="exp relative pb-14 last:pb-0 sm:pb-20">
              <span className="exp-dot absolute -left-[33px] top-3 h-4 w-4 rounded-full border-2 border-accent bg-bg sm:-left-[57px] sm:h-[18px] sm:w-[18px]" />
              <div className="exp-card grid gap-6 rounded-3xl border hairline bg-surface p-6 sm:p-10 lg:grid-cols-[1fr_2fr]">
                <div>
                  <p className="font-mono text-xs uppercase tracking-widest text-accent">{e.date}</p>
                  <h3 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">{e.title}</h3>
                  <div className="mt-4 flex items-center gap-3 text-muted">
                    <img src={e.icon} alt="" className="h-7 w-7 rounded-full bg-white/90 object-contain p-0.5" loading="lazy" />
                    {e.company}
                  </div>
                </div>
                <ul className="space-y-3 text-muted">
                  {e.points.map((p, i) => (
                    <li key={i} className="flex gap-3 leading-relaxed">
                      <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Experience;
