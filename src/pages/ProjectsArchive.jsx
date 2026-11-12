import { useMemo, useRef, useState } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "../lib/gsap";
import { projects, formatDate } from "../data";
import { TLink } from "../components/PageTransition";
import { useSeo } from "../hooks/useSeo";
import ProjectCover from "../components/ProjectCover";

// "React 18" and "React" count as the same tech, so the filter chips stay short
const norm = (s) => s.replace(/\s+v?\d+(\.\d+)*$/i, "");
const techsOf = (p) => [...new Set(p.stack.flatMap((g) => g.items).map(norm))];
const types = [...new Set(projects.map((p) => p.category))];
const techs = Object.entries(
  projects.flatMap(techsOf).reduce((m, t) => ((m[t] = (m[t] || 0) + 1), m), {})
)
  .filter(([, n]) => n >= 3) // only techs used in 3+ projects, so the chips stay meaningful
  .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  .slice(0, 10)
  .map(([t]) => t);

const Chip = ({ on, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={on}
    className={`rounded-full border px-4 py-2 font-mono text-[11px] uppercase tracking-widest transition-colors ${on ? "border-accent bg-accent text-accent-ink" : "hairline text-muted hover:bg-fg/10 hover:text-fg"}`}
  >
    {children}
  </button>
);

const ProjectsArchive = () => {
  const root = useRef(null);
  const [type, setType] = useState("");
  const [tech, setTech] = useState("");
  const list = useMemo(() => projects.filter((p) => (!type || p.category === type) && (!tech || techsOf(p).includes(tech))), [type, tech]);
  useSeo("Projects — Aditya Sharma", `All ${projects.length} projects by Aditya Sharma, newest first: React, MERN, Supabase and WordPress builds.`);
  const preview = useRef(null);

  useGSAP(
    () => {
      if (!prefersReducedMotion()) {
        gsap.from(".ar-title", { yPercent: 110, duration: 1.1, ease: "power4.out", delay: 0.9 });
        gsap.from(".ar-row", { y: 50, opacity: 0, duration: 0.9, stagger: 0.07, ease: "power3.out", delay: 1.1 });
      }

      // floating preview follows the pointer on desktop
      if (prefersReducedMotion() || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
      gsap.set(preview.current, { xPercent: -50, yPercent: -50, scale: 0.6, opacity: 0 });
      const x = gsap.quickTo(preview.current, "x", { duration: 0.6, ease: "power3" });
      const y = gsap.quickTo(preview.current, "y", { duration: 0.6, ease: "power3" });
      const move = (e) => { x(e.clientX); y(e.clientY); };
      window.addEventListener("pointermove", move);
      return () => window.removeEventListener("pointermove", move);
    },
    { scope: root }
  );

  const show = (slug) => {
    if (!preview.current) return;
    gsap.to(".pv", { opacity: (idx, el) => (el.dataset.slug === slug ? 1 : 0), duration: 0.2 });
    gsap.to(preview.current, { opacity: 1, scale: 1, duration: 0.5, ease: "power3.out" });
    window.dispatchEvent(new CustomEvent("project-preview", { detail: slug })); // plays that project's clip
  };
  const hide = () => {
    window.dispatchEvent(new CustomEvent("project-preview", { detail: null }));
    return preview.current && gsap.to(preview.current, { opacity: 0, scale: 0.6, duration: 0.3 });
  };

  return (
    <main id="main" ref={root} className="min-h-screen px-5 pb-24 pt-36 sm:px-10">
      <div className="mx-auto max-w-[1500px]">
        <div className="mask">
          <h1 className="ar-title font-display text-[clamp(3rem,11vw,10rem)] font-extrabold leading-[0.9] tracking-[-0.04em]">
            Archive<span className="text-accent">.</span>
          </h1>
        </div>
        <p role="status" className="mt-4 font-mono text-xs uppercase tracking-widest text-muted">
          {list.length === projects.length ? `${projects.length} projects` : `${list.length} of ${projects.length} projects`} · newest first
        </p>

        <div className="mt-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by type">
            <span className="mr-2 w-12 font-mono text-[11px] uppercase tracking-widest text-muted">Type</span>
            <Chip on={!type} onClick={() => setType("")}>All</Chip>
            {types.map((t) => <Chip key={t} on={type === t} onClick={() => setType(type === t ? "" : t)}>{t}</Chip>)}
          </div>
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by tech">
            <span className="mr-2 w-12 font-mono text-[11px] uppercase tracking-widest text-muted">Tech</span>
            <Chip on={!tech} onClick={() => setTech("")}>All</Chip>
            {techs.map((t) => <Chip key={t} on={tech === t} onClick={() => setTech(tech === t ? "" : t)}>{t}</Chip>)}
          </div>
        </div>

        <ul className="mt-10 border-t hairline">
          {list.length === 0 && (
            <li className="border-b hairline py-10 text-muted">
              Nothing matches both filters. <button type="button" onClick={() => { setType(""); setTech(""); }} className="text-fg underline underline-offset-4">Clear them</button>.
            </li>
          )}
          {list.map((p) => (
            <li key={p.slug} className="ar-row border-b hairline">
              <TLink
                to={`/projects/${p.slug}`}
                onMouseEnter={() => show(p.slug)}
                onMouseLeave={hide}
                className="group flex items-center justify-between gap-4 py-6 transition-all duration-500 hover:px-4 sm:py-8"
              >
                <span className="flex items-baseline gap-5 sm:gap-10">
                  <span className="font-mono text-xs text-accent">{p.index}</span>
                  <span className="font-display text-3xl font-bold tracking-tight sm:text-6xl">{p.name}</span>
                </span>
                <span className="hidden text-right font-mono text-xs uppercase tracking-widest text-muted sm:block">
                  {p.tags.slice(0, 2).join(" · ")}
                </span>
                <span className="font-mono text-xs uppercase tracking-widest text-muted">{formatDate(p.createdAt)}</span>
              </TLink>
            </li>
          ))}
        </ul>
      </div>

      <div ref={preview} className="pointer-events-none fixed left-0 top-0 z-30 hidden h-[260px] w-[380px] overflow-hidden rounded-2xl border hairline lg:block">
        {projects.map((p) => (
          <div key={p.slug} data-slug={p.slug} className="pv absolute inset-0 opacity-0">
            <ProjectCover project={p} preview />
          </div>
        ))}
      </div>
    </main>
  );
};

export default ProjectsArchive;
