import { useRef } from "react";
import { gsap, useGSAP, isDesktop, prefersReducedMotion } from "../lib/gsap";
import { projects, formatDate } from "../data";
import { TLink } from "./PageTransition";
import ProjectCover from "./ProjectCover";
import SectionHead from "./SectionHead";

const Card = ({ p }) => (
  <TLink
    to={`/projects/${p.slug}`}
    data-cursor="View"
    className="project-card group relative flex h-[68svh] w-full shrink-0 flex-col overflow-hidden rounded-[2rem] border hairline bg-surface lg:h-[70vh] lg:w-[36vw] lg:max-w-[640px]"
  >
    {/* image: solid frame so it never washes out in light mode */}
    <div className="relative h-[52%] overflow-hidden">
      <div className="card-img absolute -inset-[8%] transition-transform duration-700 ease-out group-hover:scale-105">
        <ProjectCover project={p} />
      </div>
      <span className="absolute left-4 top-4 rounded-full bg-bg/80 px-3 py-1 font-mono text-[10px] uppercase tracking-widest backdrop-blur">
        {p.status}
      </span>
      <span className="absolute right-4 top-4 grid h-10 w-10 -rotate-45 place-items-center rounded-full bg-accent text-accent-ink transition-transform duration-500 group-hover:rotate-0">
        →
      </span>
    </div>

    <div className="flex flex-1 flex-col justify-between p-6 sm:p-7">
      <div>
        <div className="mb-2 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
          <span><span className="text-accent">{p.index}</span> · {p.category}</span>
          <span>{formatDate(p.createdAt)}</span>
        </div>
        <h3 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{p.name}</h3>
        <p className="mt-2 line-clamp-2 text-sm text-muted">{p.summary}</p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {p.tags.map((t) => (
          <span key={t} className="rounded-full border hairline px-3 py-1 font-mono text-[10px] uppercase tracking-wider">{t}</span>
        ))}
      </div>
    </div>
  </TLink>
);

const Projects = () => {
  const root = useRef(null);
  const track = useRef(null);

  useGSAP(
    () => {
      gsap.from(".work-head > *", {
        yPercent: 40, opacity: 0, duration: 1.1, ease: "power4.out", stagger: 0.1,
        scrollTrigger: { trigger: root.current, start: "top 75%" },
      });
      if (prefersReducedMotion()) return;

      const mm = gsap.matchMedia();

      // desktop: pin the section and scroll the cards sideways, images drift inside their frames
      mm.add(isDesktop, () => {
        const getDist = () => track.current.scrollWidth - window.innerWidth + 120;
        const move = gsap.to(track.current, {
          x: () => -getDist(),
          ease: "none",
          scrollTrigger: {
            trigger: ".pin-area",
            pin: true,
            scrub: 0.6,
            start: "top top",
            end: () => "+=" + getDist(),
            invalidateOnRefresh: true,
            onUpdate: (self) => gsap.set(".progress-bar", { scaleX: self.progress }),
          },
        });
        gsap.utils.toArray(".project-card").forEach((card) => {
          gsap.fromTo(card.querySelector(".card-img"), { xPercent: 6 }, {
            xPercent: -6, ease: "none",
            scrollTrigger: { trigger: card, containerAnimation: move, start: "left right", end: "right left", scrub: true },
          });
          gsap.from(card, {
            scale: 0.88, opacity: 0.4, ease: "none",
            scrollTrigger: { trigger: card, containerAnimation: move, start: "left 98%", end: "left 60%", scrub: true },
          });
        });
      });

      // mobile / tablet: vertical stack, each card unmasks and its image drifts
      mm.add("(max-width: 1023px)", () => {
        gsap.utils.toArray(".project-card").forEach((card) => {
          gsap.from(card, {
            clipPath: "inset(12% 8% 12% 8% round 2rem)", opacity: 0.4, duration: 1, ease: "power3.out",
            scrollTrigger: { trigger: card, start: "top 88%" },
          });
          gsap.fromTo(card.querySelector(".card-img"), { yPercent: -6, xPercent: 0 }, {
            yPercent: 6, ease: "none",
            scrollTrigger: { trigger: card, start: "top bottom", end: "bottom top", scrub: true },
          });
        });
      });

      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section id="work" ref={root}>
      <div className="work-head mx-auto max-w-[1500px] px-5 pt-28 sm:px-10 sm:pt-44">
        <SectionHead index="02" label={`Selected work (${projects.length})`} title={<>Work<span className="text-accent">.</span></>} />
      </div>

      <div className="pin-area relative flex flex-col justify-center overflow-hidden pb-24 lg:min-h-screen lg:pb-0">
        <div ref={track} className="flex flex-col gap-6 px-5 will-change-transform sm:px-10 lg:flex-row lg:gap-10 lg:pl-[8vw] lg:pr-[8vw]">
          {projects.map((p) => (
            <Card key={p.slug} p={p} />
          ))}
          <TLink
            to="/projects"
            data-cursor="Open"
            className="group flex h-[30svh] w-full shrink-0 items-center justify-center rounded-[2rem] border border-dashed hairline lg:h-[70vh] lg:w-[24vw]"
          >
            <span className="text-center font-display text-4xl font-bold tracking-tight transition-transform duration-500 group-hover:translate-x-2 sm:text-5xl">
              Full archive <span className="text-accent">→</span>
            </span>
          </TLink>
        </div>
        <div className="mx-auto mt-10 hidden h-px w-[60vw] bg-line/15 lg:block">
          <div className="progress-bar h-full origin-left scale-x-0 bg-accent" />
        </div>
      </div>
    </section>
  );
};

export default Projects;
