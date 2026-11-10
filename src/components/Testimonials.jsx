import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "../lib/gsap";
import { testimonials } from "../data/testimonials";
import SectionHead from "./SectionHead";

// Renders nothing until src/data/testimonials.js has real quotes in it.
const Testimonials = () => {
  const root = useRef(null);

  useGSAP(
    () => {
      if (prefersReducedMotion() || !testimonials.length) return;
      gsap.from(".sh-title, .sh-meta", { yPercent: 40, opacity: 0, duration: 1.1, ease: "power4.out", stagger: 0.1, scrollTrigger: { trigger: root.current, start: "top 75%" } });
      gsap.from(".tm-card", { y: 50, opacity: 0, duration: 0.9, ease: "power3.out", stagger: 0.12, scrollTrigger: { trigger: root.current, start: "top 70%" } });
    },
    { scope: root }
  );

  if (!testimonials.length) return null;

  return (
    <section id="testimonials" ref={root} className="px-5 py-24 sm:px-10 sm:py-36">
      <div className="mx-auto max-w-[1500px]">
        <SectionHead index="05" label="Kind words" title={<>Kind words<span className="text-accent">.</span></>} />
        <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <li key={t.name + t.quote.slice(0, 12)} className="tm-card">
              <figure className="flex h-full flex-col justify-between rounded-3xl border hairline p-6 sm:p-8">
                <blockquote className="text-lg leading-relaxed text-fg/90">
                  <span aria-hidden="true" className="mr-1 font-display text-3xl leading-none text-accent">“</span>{t.quote}
                </blockquote>
                <figcaption className="mt-8 border-t hairline pt-4">
                  <p className="font-display text-lg font-bold">{t.name}</p>
                  <p className="font-mono text-[11px] uppercase tracking-widest text-muted">{[t.role, t.company].filter(Boolean).join(" · ")}</p>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default Testimonials;
