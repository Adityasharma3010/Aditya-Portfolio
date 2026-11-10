// Screenshot if there is one, otherwise a generated browser mock so every project still looks like a real image.
import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "../lib/gsap";

const hue = (str) => [...str].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 360, 7);

// A short looping clip. It only plays while it is on screen, and not at all in reduced-motion mode or with Data Saver on
// (those visitors just see the screenshot as the poster).
const Clip = ({ project, cls }) => {
  const ref = useRef(null);
  useEffect(() => {
    const v = ref.current;
    if (!v || prefersReducedMotion() || navigator.connection?.saveData) return;
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()), { threshold: 0.25 });
    io.observe(v);
    return () => io.disconnect();
  }, []);
  return (
    <video
      ref={ref}
      src={project.video}
      poster={project.image || undefined}
      muted
      loop
      playsInline
      preload={project.image ? "none" : "metadata"}
      aria-hidden="true"
      tabIndex={-1}
      className={cls}
    />
  );
};

const ProjectCover = ({ project, className = "", imgClass = "" }) => {
  if (project.video) return <Clip project={project} cls={`h-full w-full object-cover object-top ${imgClass} ${className}`} />;
  if (project.image) {
    return (
      <img
        src={project.image}
        alt={`${project.name} screenshot`}
        loading="lazy"
        decoding="async"
        className={`h-full w-full object-cover object-top ${imgClass} ${className}`}
      />
    );
  }
  const h = hue(project.slug);
  return (
    <div
      className={`relative h-full w-full overflow-hidden ${imgClass} ${className}`}
      style={{
        background: `radial-gradient(120% 90% at 15% 0%, hsl(${h} 75% 55% / 0.6), transparent 60%), radial-gradient(100% 80% at 100% 100%, hsl(${(h + 70) % 360} 75% 50% / 0.5), transparent 60%), rgb(var(--surface))`,
      }}
      role="img"
      aria-label={`${project.name} cover`}
    >
      <div className="absolute inset-x-[9%] bottom-0 top-[16%] overflow-hidden rounded-t-2xl border border-fg/15 bg-bg/85 shadow-2xl backdrop-blur">
        <div className="flex items-center gap-1.5 border-b border-fg/10 px-4 py-2.5">
          <i className="h-2 w-2 rounded-full bg-fg/25" />
          <i className="h-2 w-2 rounded-full bg-fg/25" />
          <i className="h-2 w-2 rounded-full bg-fg/25" />
          <span className="ml-3 truncate rounded-full bg-fg/[0.07] px-3 py-0.5 font-mono text-[9px] text-muted">{project.slug}.app</span>
        </div>
        <div className="p-5 sm:p-6">
          <p className="font-display text-2xl font-extrabold leading-none tracking-tight sm:text-3xl">{project.name}</p>
          <p className="mt-2 line-clamp-2 max-w-[28ch] text-[11px] leading-snug text-muted">{project.summary}</p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {project.tags.slice(0, 3).map((t) => (
              <span key={t} className="rounded-full bg-accent px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-accent-ink">{t}</span>
            ))}
          </div>
          <div className="mt-5 grid grid-cols-3 gap-2">
            {[0, 1, 2].map((n) => (
              <div key={n} className="h-14 rounded-lg bg-fg/[0.06]" style={{ opacity: 1 - n * 0.2 }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCover;
