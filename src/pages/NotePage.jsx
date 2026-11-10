import { Fragment, useRef } from "react";
import { useParams } from "react-router-dom";
import { gsap, useGSAP, ScrollTrigger, prefersReducedMotion } from "../lib/gsap";
import { notes, noteDate, readTime } from "../data/notes";
import { TLink } from "../components/PageTransition";
import { useSeo } from "../hooks/useSeo";
import NotFound from "./NotFound";

// `inline code` inside a text string
const Inline = ({ text }) =>
  text.split(/(`[^`]+`)/g).map((part, i) =>
    part.startsWith("`") ? (
      <code key={i} className="rounded bg-fg/10 px-1.5 py-0.5 font-mono text-[0.88em]">{part.slice(1, -1)}</code>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    )
  );

const Block = ({ b }) => {
  if (b.type === "h") return <h2 className="np-block mt-14 font-display text-3xl font-bold tracking-tight sm:text-4xl">{b.text}</h2>;
  if (b.type === "code")
    return (
      <pre tabIndex={0} className="np-block mt-6 overflow-x-auto rounded-2xl border hairline bg-surface p-5 font-mono text-[13px] leading-relaxed">
        <code>{b.text}</code>
      </pre>
    );
  if (b.type === "list")
    return (
      <ul className="np-block mt-6 space-y-3 text-lg leading-relaxed text-fg/85">
        {b.items.map((it, i) => (
          <li key={i} className="flex gap-4">
            <span className="mt-[0.7em] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
            <span><Inline text={it} /></span>
          </li>
        ))}
      </ul>
    );
  return <p className="np-block mt-6 text-lg leading-relaxed text-fg/85"><Inline text={b.text} /></p>;
};

const NotePage = () => {
  const { slug } = useParams();
  const i = notes.findIndex((n) => n.slug === slug);
  const n = notes[i];
  const next = notes[(i + 1) % notes.length];
  const root = useRef(null);
  useSeo(n ? `${n.title} — Aditya Sharma` : "Note not found — Aditya Sharma", n?.summary);

  useGSAP(
    () => {
      if (!n || prefersReducedMotion()) return;
      gsap.from(".np-fade", { y: 40, opacity: 0, duration: 1, stagger: 0.1, ease: "power4.out", delay: 0.9 });
      ScrollTrigger.batch(".np-block", {
        start: "top 90%",
        once: true,
        onEnter: (els) => gsap.from(els, { y: 24, opacity: 0, duration: 0.8, stagger: 0.08, ease: "power3.out" }),
      });
      // reading progress along the top edge
      gsap.to(".np-progress", { scaleX: 1, ease: "none", scrollTrigger: { trigger: root.current, start: "top top", end: "bottom bottom", scrub: 0.3 } });
    },
    { scope: root, dependencies: [slug] }
  );

  if (!n) return <NotFound />;

  return (
    <main id="main" ref={root} className="min-h-screen px-5 pb-24 pt-36 sm:px-10">
      <div className="np-progress pointer-events-none fixed left-0 top-0 z-[60] h-[3px] w-full origin-left scale-x-0 bg-accent" aria-hidden="true" />
      <article className="mx-auto max-w-[760px]">
        <TLink to="/notes" className="np-fade font-mono text-xs uppercase tracking-widest text-muted hover:text-fg">← All notes</TLink>
        <p className="np-fade mt-10 font-mono text-xs uppercase tracking-widest text-muted">
          {noteDate(n.date)} · {readTime(n)} min read · {n.tags.join(" · ")}
        </p>
        <h1 className="np-fade mt-5 font-display text-[clamp(2.4rem,6vw,4.6rem)] font-extrabold leading-[0.98] tracking-[-0.035em]">{n.title}</h1>
        <p className="np-fade mt-6 text-xl leading-relaxed text-muted">{n.summary}</p>
        <div className="mt-6 border-t hairline pt-2">
          {n.body.map((b, k) => <Block key={k} b={b} />)}
        </div>

        <div className="mt-20 flex flex-wrap items-center justify-between gap-6 border-t hairline pt-8">
          <TLink to="/notes" className="font-mono text-xs uppercase tracking-widest text-muted hover:text-fg">← All notes</TLink>
          {notes.length > 1 && (
            <TLink to={`/notes/${next.slug}`} className="group text-right">
              <span className="block font-mono text-[11px] uppercase tracking-widest text-muted">Next note</span>
              <span className="block font-display text-2xl font-bold tracking-tight transition-colors group-hover:text-accent">{next.title} →</span>
            </TLink>
          )}
        </div>
      </article>
    </main>
  );
};

export default NotePage;
