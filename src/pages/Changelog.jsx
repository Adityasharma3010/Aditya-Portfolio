import { useRef } from "react";
import { gsap, SplitText, useGSAP, prefersReducedMotion } from "../lib/gsap";
import { changelog } from "../data/changelog";
import { noteDate } from "../data/notes";
import { useSeo } from "../hooks/useSeo";
import { TLink } from "../components/PageTransition";

const Changelog = () => {
  const root = useRef(null);
  useSeo("Changelog — Aditya Sharma", "What changed on adityasharma.site: new pages, features and fixes, newest first.");

  useGSAP(
    () => {
      const title = new SplitText(".cl-title", { type: "chars,lines", mask: "lines" });
      if (!prefersReducedMotion()) {
        gsap.from(title.chars, { yPercent: 120, duration: 1.1, ease: "power4.out", stagger: 0.03, delay: 0.9 });
        gsap.from(".cl-lead", { y: 30, opacity: 0, duration: 0.9, ease: "power3.out", delay: 1.3 });
        gsap.utils.toArray(".cl-entry").forEach((el) => {
          gsap.from(el, { y: 40, opacity: 0, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 85%" } });
        });
      }
      return () => title.revert();
    },
    { scope: root }
  );

  return (
    <main id="main" ref={root} className="min-h-screen px-5 pb-24 pt-36 sm:px-10">
      <div className="mx-auto max-w-[1500px]">
        <TLink to="/" className="font-mono text-xs uppercase tracking-widest text-muted hover:text-fg">← Home</TLink>
        <h1 className="cl-title mt-8 font-display text-[clamp(3rem,11vw,10rem)] font-extrabold leading-[0.9] tracking-[-0.04em]">Changelog<span className="text-accent">.</span></h1>
        <p className="cl-lead mt-6 max-w-xl text-lg text-muted">What changed on this site, newest first. I keep shipping.</p>

        <ol className="mt-20 border-t hairline">
          {changelog.map((e) => (
            <li key={e.title} className="cl-entry grid gap-4 border-b hairline py-10 lg:grid-cols-[1fr_2.2fr] lg:gap-16">
              <p className="font-mono text-xs uppercase tracking-widest text-muted">{e.date ? noteDate(e.date) : "Earlier"}</p>
              <div>
                <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">{e.title}</h2>
                <ul className="mt-5 space-y-3 text-muted">
                  {e.items.map((i) => (
                    <li key={i} className="flex gap-3"><span aria-hidden="true" className="mt-[0.7em] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" /><span>{i}</span></li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </main>
  );
};

export default Changelog;
