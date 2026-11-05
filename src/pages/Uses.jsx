import { useRef } from "react";
import { gsap, SplitText, useGSAP, prefersReducedMotion } from "../lib/gsap";
import { uses } from "../data/uses";
import { useSeo } from "../hooks/useSeo";
import { TLink } from "../components/PageTransition";

const Uses = () => {
  const root = useRef(null);
  useSeo("Uses — Aditya Sharma", "The languages, frameworks, services and tools Aditya Sharma builds with.");

  useGSAP(
    () => {
      const reduce = prefersReducedMotion();
      const title = new SplitText(".us-title", { type: "chars,lines", mask: "lines" });
      if (!reduce) gsap.from(title.chars, { yPercent: 120, duration: 1.1, ease: "power4.out", stagger: 0.03, delay: 0.9 });
      if (!reduce) {
        gsap.utils.toArray(".us-group").forEach((g) => {
          gsap.from(g.querySelector(".us-head"), { y: 30, opacity: 0, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: g, start: "top 85%" } });
          gsap.from(g.querySelectorAll(".us-row"), { x: -24, opacity: 0, duration: 0.7, ease: "power3.out", stagger: 0.07, scrollTrigger: { trigger: g, start: "top 80%" } });
        });
      }
      return () => title.revert();
    },
    { scope: root }
  );

  return (
    <main ref={root} className="min-h-screen px-5 pb-24 pt-36 sm:px-10">
      <div className="mx-auto max-w-[1500px]">
        <TLink to="/" className="font-mono text-xs uppercase tracking-widest text-muted hover:text-fg">← Home</TLink>
        <h1 className="us-title mt-8 font-display text-[clamp(3rem,11vw,10rem)] font-extrabold leading-[0.9] tracking-[-0.04em]">Uses<span className="text-accent">.</span></h1>
        <p className="mt-6 max-w-xl text-lg text-muted">What I build this site, and everything else, with.</p>

        <div className="mt-20 space-y-16">
          {uses.filter((g) => g.items.length).map((g) => (
            <section key={g.title} className="us-group grid gap-6 lg:grid-cols-[1fr_2.2fr] lg:gap-16">
              <h2 className="us-head font-mono text-xs uppercase tracking-widest text-muted">{g.title}</h2>
              <ul className="border-t hairline">
                {g.items.map((it) => (
                  <li key={it.name} className="us-row flex flex-col gap-1 border-b hairline py-5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8">
                    <span className="font-display text-2xl font-bold tracking-tight sm:text-3xl">{it.name}</span>
                    <span className="text-sm text-muted sm:max-w-md sm:text-right">{it.note}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
};

export default Uses;
