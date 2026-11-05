import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "../lib/gsap";
import { projects, formatDate } from "../data";
import { TLink } from "../components/PageTransition";
import { useSeo } from "../hooks/useSeo";
import ProjectCover from "../components/ProjectCover";

const ProjectsArchive = () => {
  const root = useRef(null);
  useSeo("Projects — Aditya Sharma", `All ${projects.length} projects by Aditya Sharma, newest first: React, MERN, Supabase and WordPress builds.`);
  const preview = useRef(null);

  useGSAP(
    () => {
      gsap.from(".ar-title", { yPercent: 110, duration: 1.1, ease: "power4.out", delay: 0.9 });
      gsap.from(".ar-row", { y: 50, opacity: 0, duration: 0.9, stagger: 0.07, ease: "power3.out", delay: 1.1 });

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

  const show = (i) => {
    if (!preview.current) return;
    gsap.to(".pv", { opacity: (idx) => (idx === i ? 1 : 0), duration: 0.2 });
    gsap.to(preview.current, { opacity: 1, scale: 1, duration: 0.5, ease: "power3.out" });
  };
  const hide = () => preview.current && gsap.to(preview.current, { opacity: 0, scale: 0.6, duration: 0.3 });

  return (
    <main ref={root} className="min-h-screen px-5 pb-24 pt-36 sm:px-10">
      <div className="mx-auto max-w-[1500px]">
        <div className="mask">
          <h1 className="ar-title font-display text-[clamp(3rem,11vw,10rem)] font-extrabold leading-[0.9] tracking-[-0.04em]">
            Archive<span className="text-accent">.</span>
          </h1>
        </div>
        <p className="mt-4 font-mono text-xs uppercase tracking-widest text-muted">{projects.length} projects · newest first</p>

        <ul className="mt-14 border-t hairline">
          {projects.map((p, i) => (
            <li key={p.slug} className="ar-row border-b hairline">
              <TLink
                to={`/projects/${p.slug}`}
                onMouseEnter={() => show(i)}
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
          <div key={p.slug} className="pv absolute inset-0 opacity-0">
            <ProjectCover project={p} />
          </div>
        ))}
      </div>
    </main>
  );
};

export default ProjectsArchive;
