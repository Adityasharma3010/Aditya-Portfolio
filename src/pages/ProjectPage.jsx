import { useRef } from "react";
import { useParams } from "react-router-dom";
import { gsap, SplitText, useGSAP, prefersReducedMotion } from "../lib/gsap";
import { projects, formatDate } from "../data";
import { TLink } from "../components/PageTransition";
import ProjectCover from "../components/ProjectCover";
import Magnetic from "../components/Magnetic";
import NotFound from "./NotFound";
import Diagram from "../components/Diagram";
import FlowSteps from "../components/FlowSteps";
import { diagrams } from "../data/diagrams";
import { useSeo } from "../hooks/useSeo";

const LANG_COLORS = {
  JavaScript: "#f7df1e",
  TypeScript: "#3178c6",
  HTML: "#e34c26",
  CSS: "#a855f7",
  Python: "#3776ab",
  SCSS: "#c6538c",
  Shell: "#89e051",
  PHP: "#777bb4",
};

const Fact = ({ label, value }) => (
  <div className="pt-4 border-t pp-fact hairline">
    <p className="font-mono text-[11px] uppercase tracking-widest text-muted">
      {label}
    </p>
    <p className="mt-2 text-xl font-semibold font-display sm:text-2xl">
      {value}
    </p>
  </div>
);

const ProjectPage = () => {
  const { slug } = useParams();
  const i = projects.findIndex((p) => p.slug === slug);
  const p = projects[i];
  const next = projects[(i + 1) % projects.length];
  const root = useRef(null);
  useSeo(
    p ? `${p.name} — Aditya Sharma` : "Project not found — Aditya Sharma",
    p?.summary,
  );

  useGSAP(
    () => {
      if (!p) return;
      const reduce = prefersReducedMotion();

      // ---- intro ----
      const title = new SplitText(".pp-title", {
        type: "chars,lines",
        mask: "lines",
      });
      if (reduce) return () => title.revert();
      const tl = gsap.timeline({
        delay: 0.9,
        defaults: { ease: "power4.out" },
      });
      tl.from(title.chars, { yPercent: 120, duration: 1.1, stagger: 0.025 })
        .from(
          ".pp-fade",
          { y: 30, opacity: 0, duration: 0.9, stagger: 0.08 },
          "-=0.7",
        )
        .from(
          ".pp-cover",
          {
            clipPath: "inset(18% 12% 18% 12% round 2rem)",
            duration: 1.4,
            ease: "power3.inOut",
          },
          "-=0.9",
        );

      // ---- cover parallax ----
      gsap.fromTo(
        ".pp-img",
        { yPercent: -8, scale: 1.12 },
        {
          yPercent: 8,
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: ".pp-cover",
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );

      // ---- facts ----
      gsap.from(".pp-fact", {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: { trigger: ".pp-facts", start: "top 85%" },
      });

      // ---- overview: words light up while scrolling ----
      const ov = new SplitText(".pp-overview", { type: "words" });
      gsap.fromTo(
        ov.words,
        { opacity: 0.12 },
        {
          opacity: 1,
          ease: "none",
          stagger: 0.1,
          scrollTrigger: {
            trigger: ".pp-overview",
            start: "top 80%",
            end: "bottom 50%",
            scrub: true,
          },
        },
      );

      // ---- features: each row draws its line, then text rises ----
      gsap.utils.toArray(".feat").forEach((row) => {
        const t = gsap.timeline({
          scrollTrigger: { trigger: row, start: "top 85%" },
        });
        t.from(row.querySelector(".feat-line"), {
          scaleX: 0,
          transformOrigin: "left",
          duration: 1,
          ease: "power3.inOut",
        }).from(
          row.querySelectorAll(".feat-num, .feat-title, .feat-desc"),
          {
            y: 30,
            opacity: 0,
            duration: 0.8,
            stagger: 0.08,
            ease: "power3.out",
          },
          "-=0.7",
        );
      });

      // ---- stack chips ----
      gsap.from(".pp-chip", {
        y: 30,
        opacity: 0,
        scale: 0.92,
        duration: 0.7,
        ease: "back.out(1.6)",
        stagger: { each: 0.04, from: "start" },
        scrollTrigger: { trigger: ".pp-stack", start: "top 82%" },
      });

      // ---- language bar grows from the left ----
      gsap.from(".lang-seg", {
        scaleX: 0,
        transformOrigin: "left",
        duration: 1.2,
        ease: "power3.out",
        stagger: 0.12,
        scrollTrigger: { trigger: ".lang-bar", start: "top 90%" },
      });

      gsap.from(".pp-cta > *, .pp-next", {
        y: 60,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        stagger: 0.12,
        scrollTrigger: { trigger: ".pp-cta", start: "top 88%" },
      });

      return () => {
        title.revert();
        ov.revert();
      };
    },
    { scope: root, dependencies: [slug] },
  );

  if (!p) return <NotFound />;

  const langs = p.github?.languages;
  const total = langs ? Object.values(langs).reduce((a, b) => a + b, 0) : 0;
  const languages = langs
    ? Object.entries(langs).map(([name, bytes]) => ({
        name,
        pct: (bytes / total) * 100,
      }))
    : [];

  return (
    <main ref={root} className="px-5 pb-16 pt-36 sm:px-10">
      <div className="mx-auto max-w-[1500px]">
        <TLink
          to="/projects"
          className="font-mono text-xs tracking-widest uppercase pp-fade text-muted hover:text-fg"
        >
          ← All projects
        </TLink>

        <h1 className="pp-title mt-8 font-display text-[clamp(3rem,12vw,11rem)] font-extrabold leading-[0.9] tracking-[-0.045em]">
          {p.name}
        </h1>
        <p className="max-w-2xl mt-6 text-lg pp-fade text-balance text-muted sm:text-2xl">
          {p.summary}
        </p>

        <div className="flex flex-wrap gap-4 mt-8 pp-fade">
          {p.site && (
            <Magnetic>
              <a
                href={p.site}
                target="_blank"
                rel="noreferrer"
                data-cursor="Open"
                className="inline-block px-8 py-4 font-mono text-xs font-medium tracking-widest uppercase rounded-full bg-accent text-accent-ink"
              >
                Live site ↗
              </a>
            </Magnetic>
          )}
          <Magnetic>
            <a
              href={p.source}
              target="_blank"
              rel="noreferrer"
              data-cursor="Open"
              className="inline-block px-8 py-4 font-mono text-xs tracking-widest uppercase border rounded-full hairline hover:bg-fg/10"
            >
              Source code ↗
            </a>
          </Magnetic>
        </div>

        <div className="pp-cover mt-14 aspect-[16/10] overflow-hidden rounded-[2rem] border hairline">
          <div className="w-full h-full pp-img will-change-transform">
            <ProjectCover project={p} />
          </div>
        </div>

        {/* quick facts */}
        <div className="grid grid-cols-2 mt-12 pp-facts gap-x-6 gap-y-8 lg:grid-cols-4">
          <Fact label="Type" value={p.category} />
          <Fact label="Status" value={p.status} />
          <Fact label="Started" value={formatDate(p.createdAt)} />
          <Fact
            label={p.github ? "Last update" : "Project"}
            value={p.github ? formatDate(p.github.pushedAt) : `No. ${p.index}`}
          />
        </div>

        {/* overview */}
        <section className="mt-28 grid gap-8 lg:grid-cols-[1fr_2.2fr] lg:gap-16">
          <p className="font-mono text-xs tracking-widest uppercase text-muted">
            <span className="text-accent">01</span> / Overview
          </p>
          <p className="max-w-4xl text-2xl font-medium leading-snug tracking-tight pp-overview text-balance font-display sm:text-4xl">
            {p.overview}
          </p>
        </section>

        {/* features */}
        {p.features.length > 0 && (
          <section className="mt-28 grid gap-8 lg:grid-cols-[1fr_2.2fr] lg:gap-16">
            <p className="font-mono text-xs tracking-widest uppercase text-muted lg:sticky lg:top-32 lg:self-start">
              <span className="text-accent">02</span> / What it does
            </p>
            <ol>
              {p.features.map((f, n) => (
                <li key={f.title} className="relative feat group py-7 sm:py-9">
                  <span className="absolute inset-x-0 top-0 h-px feat-line bg-line/20" />
                  <div className="grid gap-3 sm:grid-cols-[4rem_1fr] sm:gap-6">
                    <span className="font-mono text-xs feat-num text-accent">
                      {String(n + 1).padStart(2, "0")}
                    </span>
                    <div className="transition-transform duration-500 group-hover:translate-x-2">
                      <h3 className="text-2xl font-bold tracking-tight feat-title font-display sm:text-3xl">
                        {f.title}
                      </h3>
                      <p className="max-w-2xl mt-3 feat-desc text-muted">
                        {f.desc}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* stack */}
        <section className="pp-stack mt-28 grid gap-8 lg:grid-cols-[1fr_2.2fr] lg:gap-16">
          <p className="font-mono text-xs tracking-widest uppercase text-muted lg:sticky lg:top-32 lg:self-start">
            <span className="text-accent">03</span> / Tech stack
          </p>
          <div className="space-y-10">
            {p.stack.map((g) => (
              <div key={g.label}>
                <p className="mb-4 font-mono text-[11px] uppercase tracking-widest text-muted">
                  {g.label}
                </p>
                <div className="flex flex-wrap gap-3">
                  {g.items.map((t) => (
                    <span
                      key={t}
                      className="pp-chip rounded-full border hairline bg-surface px-5 py-2.5 font-mono text-xs uppercase tracking-wider"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}

            {languages.length > 0 && (
              <div>
                <p className="mb-4 font-mono text-[11px] uppercase tracking-widest text-muted">
                  Languages in the repo
                </p>
                <div className="flex h-3 overflow-hidden rounded-full lang-bar bg-fg/10">
                  {languages.map((l) => (
                    <span
                      key={l.name}
                      className="h-full lang-seg"
                      style={{
                        width: `${l.pct}%`,
                        background: LANG_COLORS[l.name] || "rgb(var(--accent))",
                      }}
                      title={`${l.name} ${l.pct.toFixed(1)}%`}
                    />
                  ))}
                </div>
                <div className="flex flex-wrap mt-4 font-mono text-xs gap-x-6 gap-y-2 text-muted">
                  {languages.map((l) => (
                    <span key={l.name} className="flex items-center gap-2">
                      <i
                        className="w-2 h-2 rounded-full"
                        style={{
                          background:
                            LANG_COLORS[l.name] || "rgb(var(--accent))",
                        }}
                      />
                      {l.name} {l.pct.toFixed(1)}%
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* architecture + flows */}
        {diagrams[p.slug] && (
          <section className="pp-arch mt-28 grid gap-8 lg:grid-cols-[1fr_2.2fr] lg:gap-16">
            <p className="font-mono text-xs tracking-widest uppercase text-muted lg:sticky lg:top-32 lg:self-start">
              <span className="text-accent">04</span> / How it works
            </p>
            <div className="space-y-16">
              <div>
                <p className="mb-6 font-mono text-[11px] uppercase tracking-widest text-muted">
                  Architecture
                </p>
                <div className="p-4 border rounded-3xl hairline bg-surface sm:p-8">
                  <Diagram {...diagrams[p.slug].architecture} />
                </div>
              </div>
              {diagrams[p.slug].flows?.map((f) => (
                <FlowSteps key={f.title} {...f} />
              ))}
            </div>
          </section>
        )}

        {/* cta + next */}
        <div className="mt-32 pp-cta">
          <TLink
            to={`/projects/${next.slug}`}
            data-cursor="Next"
            className="block pt-10 border-t pp-next group hairline"
          >
            <p className="font-mono text-xs tracking-widest uppercase text-muted">
              Next project
            </p>
            <p className="mt-3 font-display text-[clamp(2.5rem,9vw,8rem)] font-extrabold leading-none tracking-tighter transition-transform duration-500 group-hover:translate-x-4">
              {next.name} <span className="text-accent">→</span>
            </p>
          </TLink>
        </div>
      </div>
    </main>
  );
};

export default ProjectPage;
