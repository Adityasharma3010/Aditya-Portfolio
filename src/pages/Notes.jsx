import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "../lib/gsap";
import { notes, noteDate, readTime } from "../data/notes";
import { TLink } from "../components/PageTransition";
import { useSeo } from "../hooks/useSeo";

const Notes = () => {
  const root = useRef(null);
  useSeo("Notes — Aditya Sharma", "Short write-ups from building this site and other projects: GSAP, React, performance and debugging.");

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from(".nt-title", { yPercent: 110, duration: 1.1, ease: "power4.out", delay: 0.9 });
      gsap.from(".nt-row", { y: 50, opacity: 0, duration: 0.9, stagger: 0.08, ease: "power3.out", delay: 1.1 });
    },
    { scope: root }
  );

  return (
    <main ref={root} className="min-h-screen px-5 pb-24 pt-36 sm:px-10">
      <div className="mx-auto max-w-[1500px]">
        <div className="mask">
          <h1 className="nt-title font-display text-[clamp(3rem,11vw,10rem)] font-extrabold leading-[0.9] tracking-[-0.04em]">
            Notes<span className="text-accent">.</span>
          </h1>
        </div>
        <p className="mt-4 font-mono text-xs uppercase tracking-widest text-muted">{notes.length} notes · newest first</p>

        <ul className="mt-14 border-t hairline">
          {notes.map((n, i) => (
            <li key={n.slug} className="nt-row border-b hairline">
              <TLink to={`/notes/${n.slug}`} className="group grid gap-3 py-6 transition-all duration-500 hover:px-4 sm:py-8 lg:grid-cols-[4rem_1fr_16rem] lg:items-baseline lg:gap-10">
                <span className="font-mono text-xs text-accent">{String(notes.length - i).padStart(2, "0")}</span>
                <span>
                  <span className="block font-display text-3xl font-bold tracking-tight sm:text-5xl">{n.title}</span>
                  <span className="mt-3 block max-w-[60ch] text-muted">{n.summary}</span>
                </span>
                <span className="font-mono text-xs uppercase tracking-widest text-muted lg:text-right">
                  {noteDate(n.date)} · {readTime(n)} min
                  <span className="mt-1 block">{n.tags.join(" · ")}</span>
                </span>
              </TLink>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
};

export default Notes;
