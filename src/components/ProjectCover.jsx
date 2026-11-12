// Screenshot if there is one, otherwise a generated browser mock so every project still looks like a real image.
import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "../lib/gsap";
import { useTheme } from "../context/Theme";

const hue = (str) => [...str].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 360, 7);

// A short looping clip that plays while the visitor hovers (or tabs onto) the card, and rests on the screenshot otherwise.
// Never plays in reduced-motion mode, with Data Saver on, or on touch screens (they just see the screenshot).
// Hover host: the nearest [data-hover-play] element or link around it. The archive's floating preview ignores the mouse,
// so it listens for the "project-preview" event its rows send instead.
const Clip = ({ src, poster, slug, cls, preview }) => {
  const ref = useRef(null);
  useEffect(() => {
    const v = ref.current;
    if (!v || prefersReducedMotion() || navigator.connection?.saveData) return;
    const play = () => v.play().catch(() => {});
    const stop = () => {
      v.pause();
      try { v.currentTime = 0; } catch { /* not loaded yet */ }
    };
    if (preview) {
      const on = (e) => (e.detail === slug ? play() : stop());
      window.addEventListener("project-preview", on);
      return () => window.removeEventListener("project-preview", on);
    }
    const host = v.closest("[data-hover-play]") || v.closest("a");
    if (!host) return;
    const enter = (e) => e.pointerType === "mouse" && play();
    const focus = (e) => e.target.matches?.(":focus-visible") && play(); // keyboard focus only, a tap or click is not
    host.addEventListener("pointerenter", enter);
    host.addEventListener("pointerleave", stop);
    host.addEventListener("focusin", focus);
    host.addEventListener("focusout", stop);
    return () => {
      host.removeEventListener("pointerenter", enter);
      host.removeEventListener("pointerleave", stop);
      host.removeEventListener("focusin", focus);
      host.removeEventListener("focusout", stop);
    };
  }, [preview, slug]);
  return <video ref={ref} src={src} poster={poster} muted loop playsInline preload="metadata" aria-hidden="true" className={cls} />;
};

// Dark mode shows the dark capture, but only for sites that really have a dark mode (the others keep their one screenshot).
const ProjectCover = ({ project, className = "", imgClass = "", preview = false }) => {
  const { mode } = useTheme();
  const dark = mode === "dark" && (project.imageDark || project.videoDark);
  const image = dark ? project.imageDark || project.image : project.image;
  const video = dark ? project.videoDark : project.video;
  const cls = `h-full w-full object-cover object-top ${imgClass} ${className}`;
  if (video) return <Clip key={video} src={video} poster={image || undefined} slug={project.slug} cls={cls} preview={preview} />;
  if (image) {
    return (
      <img
        src={image}
        alt={`${project.name} screenshot`}
        loading="lazy"
        decoding="async"
        className={cls}
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
