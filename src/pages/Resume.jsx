import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "../lib/gsap";
import { profile, about, experiences, stack, projects } from "../data";
import { useSeo } from "../hooks/useSeo";
import { TLink } from "../components/PageTransition";
import Magnetic from "../components/Magnetic";

const Section = ({ title, children }) => (
  <section className="rs-section grid gap-4 border-t hairline py-8 sm:grid-cols-[10rem_1fr] sm:gap-10 print:block print:py-5">
    <h2 className="font-mono text-xs uppercase tracking-widest text-muted print:mb-3">{title}</h2>
    <div>{children}</div>
  </section>
);

// A resume that lives on the site and prints cleanly: use "Print / Save as PDF".
const Resume = () => {
  const root = useRef(null);
  useSeo("Resume — Aditya Sharma", "Resume of Aditya Sharma, full stack developer: experience, skills and selected projects.");

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from(".rs-head > *", { y: 30, opacity: 0, duration: 0.9, stagger: 0.1, ease: "power3.out", delay: 0.9 });
      gsap.utils.toArray(".rs-section").forEach((s) => gsap.from(s, { y: 40, opacity: 0, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: s, start: "top 88%" } }));
    },
    { scope: root }
  );

  const picked = projects.slice(0, 6);

  return (
    <main id="main" ref={root} className="min-h-screen px-5 pb-24 pt-36 print:p-0 sm:px-10">
      <div className="mx-auto max-w-4xl">
        <div className="no-print mb-10 flex flex-wrap items-center justify-between gap-4">
          <TLink to="/" className="font-mono text-xs uppercase tracking-widest text-muted hover:text-fg">← Home</TLink>
          <div className="flex flex-wrap items-center gap-3">
            <Magnetic>
              <a href="/resume.pdf" download="Aditya-Sharma-Resume.pdf" data-cursor="Download" className="inline-block rounded-full bg-accent px-7 py-3.5 font-mono text-xs font-medium uppercase tracking-widest text-accent-ink">
                Download PDF ↓
              </a>
            </Magnetic>
            <Magnetic>
              <button onClick={() => window.print()} data-cursor="Print" className="rounded-full border hairline px-7 py-3.5 font-mono text-xs uppercase tracking-widest hover:bg-fg/10">
                Print
              </button>
            </Magnetic>
          </div>
        </div>

        <header className="rs-head pb-10">
          <h1 className="font-display text-5xl font-extrabold tracking-[-0.03em] sm:text-7xl">{profile.name}</h1>
          <p className="mt-3 font-display text-2xl text-accent">Full Stack Developer</p>
          <p className="mt-5 flex flex-wrap gap-x-6 gap-y-1 font-mono text-xs uppercase tracking-widest text-muted">
            <a href={`mailto:${profile.email}`}>{profile.email}</a>
            <a href={profile.github} target="_blank" rel="noreferrer">github.com/Adityasharma3010</a>
            <span>India</span>
          </p>
        </header>

        <Section title="Summary"><p className="max-w-2xl text-lg leading-relaxed">{about}</p></Section>

        <Section title="Experience">
          <div className="space-y-8">
            {experiences.map((e) => (
              <article key={e.title + e.date} className="print:break-inside-avoid">
                <div className="flex flex-wrap items-baseline justify-between gap-x-6">
                  <h3 className="font-display text-2xl font-bold">{e.title} <span className="font-normal text-muted">· {e.company}</span></h3>
                  <span className="font-mono text-xs uppercase tracking-widest text-accent">{e.date}</span>
                </div>
                <ul className="mt-3 list-disc space-y-1.5 pl-5 text-muted marker:text-accent">
                  {e.points.map((p, i) => <li key={i}>{p}</li>)}
                </ul>
              </article>
            ))}
          </div>
        </Section>

        <Section title="Selected projects">
          <div className="space-y-6">
            {picked.map((p) => (
              <article key={p.slug} className="print:break-inside-avoid">
                <h3 className="font-display text-xl font-bold">{p.name} <span className="font-normal text-muted">· {p.category}</span></h3>
                <p className="mt-1 text-muted">{p.summary}</p>
                <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-muted">{p.tags.join(" · ")}{p.site ? ` · ${p.site.replace(/^https?:\/\//, "")}` : ""}</p>
              </article>
            ))}
          </div>
        </Section>

        <Section title="Skills">
          <p className="font-mono text-xs uppercase leading-loose tracking-wider">{stack.map((s) => s.name).join("  ·  ")}</p>
        </Section>
      </div>
    </main>
  );
};

export default Resume;
