import { useEffect, useRef, useState } from "react";
import { gsap, SplitText, useGSAP, prefersReducedMotion } from "../lib/gsap";
import { profile } from "../data";
import { workIntro, offers, fastSeo, process, brief } from "../data/work";
import { useSeo } from "../hooks/useSeo";
import { useJump } from "../hooks/useJump";
import { TLink } from "../components/PageTransition";
import Magnetic from "../components/Magnetic";
import FlowSteps from "../components/FlowSteps";

const Label = ({ children }) => <h2 className="font-mono text-xs uppercase tracking-widest text-muted">{children}</h2>;

const WorkWithMe = () => {
  const root = useRef(null);
  const timer = useRef(null);
  const [copied, setCopied] = useState(false);
  const jump = useJump();
  useSeo("Work with me — Aditya Sharma", "Hire Aditya Sharma, a full stack developer, to build a fast, SEO-ready website or web app with React, the MERN stack or WordPress and Bricks.");

  useEffect(() => () => clearTimeout(timer.current), []);

  useGSAP(
    () => {
      const reduce = prefersReducedMotion();
      const title = new SplitText(".wm-title", { type: "chars,lines", mask: "lines" });
      if (!reduce) {
        gsap.from(title.chars, { yPercent: 120, duration: 1.1, ease: "power4.out", stagger: 0.03, delay: 0.9 });
        gsap.from(".wm-lead", { y: 30, opacity: 0, duration: 0.9, ease: "power3.out", delay: 1.3 });
        gsap.utils.toArray(".wm-group").forEach((g) => {
          gsap.from(g.querySelector(".wm-head"), { y: 30, opacity: 0, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: g, start: "top 85%" } });
          gsap.from(g.querySelectorAll(".wm-item"), { y: 40, opacity: 0, duration: 0.8, ease: "power3.out", stagger: 0.09, scrollTrigger: { trigger: g, start: "top 80%" } });
        });
      }
      return () => title.revert();
    },
    { scope: root }
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1800);
    } catch { /* clipboard blocked, the mailto link still works */ }
  };

  const mail = `mailto:${profile.email}?subject=${encodeURIComponent("Project enquiry")}`;
  const pill = "inline-block rounded-full border hairline px-6 py-3 font-mono text-xs uppercase tracking-widest hover:bg-fg/10";

  return (
    <main ref={root} className="min-h-screen px-5 pb-24 pt-36 sm:px-10">
      <div className="mx-auto max-w-[1500px]">
        <TLink to="/" className="font-mono text-xs uppercase tracking-widest text-muted hover:text-fg">← Home</TLink>
        <h1 className="wm-title mt-8 font-display text-[clamp(3rem,11vw,10rem)] font-extrabold leading-[0.9] tracking-[-0.04em]">Work with me<span className="text-accent">.</span></h1>
        <p className="wm-lead mt-6 max-w-2xl text-lg text-muted">{workIntro}</p>
        <div className="wm-lead mt-8 flex flex-wrap gap-3">
          <Magnetic>
            <button onClick={() => jump("contact")} data-cursor="Contact" className="rounded-full bg-accent px-9 py-5 font-mono text-xs font-medium uppercase tracking-widest text-accent-ink">
              Start a project →
            </button>
          </Magnetic>
          <Magnetic>
            <TLink to="/projects" data-cursor="Browse" className={pill}>See my work</TLink>
          </Magnetic>
        </div>

        <div className="mt-24 space-y-20">
          <section className="wm-group grid gap-6 lg:grid-cols-[1fr_2.2fr] lg:gap-16">
            <div className="wm-head"><Label>What I build</Label></div>
            <div className="grid gap-4 md:grid-cols-3">
              {offers.map((o) => (
                <article key={o.title} className="wm-item flex flex-col rounded-3xl border hairline p-6 sm:p-7">
                  <h3 className="font-display text-2xl font-bold tracking-tight">{o.title}</h3>
                  <p className="mt-3 text-muted">{o.text}</p>
                  <ul className="mt-6 flex flex-wrap gap-2 pt-2">
                    {o.tags.map((t) => <li key={t} className="rounded-full border hairline px-3 py-1 font-mono text-[11px] uppercase tracking-widest text-muted">{t}</li>)}
                  </ul>
                </article>
              ))}
            </div>
          </section>

          <section className="wm-group grid gap-6 lg:grid-cols-[1fr_2.2fr] lg:gap-16">
            <div className="wm-head"><Label>Fast and SEO-ready</Label></div>
            <ul className="border-t hairline">
              {fastSeo.map((f) => (
                <li key={f.title} className="wm-item flex flex-col gap-2 border-b hairline py-6 sm:flex-row sm:items-baseline sm:justify-between sm:gap-10">
                  <span className="font-display text-2xl font-bold tracking-tight sm:text-3xl">{f.title}</span>
                  <span className="text-sm text-muted sm:max-w-md sm:text-right">{f.text}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="wm-group grid gap-6 lg:grid-cols-[1fr_2.2fr] lg:gap-16">
            <div className="wm-head"><Label>How I work</Label></div>
            <div className="min-w-0"><FlowSteps title="From first message to launch" steps={process} /></div>
          </section>

          <section className="wm-group grid gap-6 lg:grid-cols-[1fr_2.2fr] lg:gap-16">
            <div className="wm-head"><Label>What to send me</Label></div>
            <div className="wm-item">
              <p className="max-w-xl text-lg text-muted">No formal brief needed. A few lines on these is plenty to get started:</p>
              <ul className="mt-6 border-t hairline">
                {brief.map((b, i) => (
                  <li key={b} className="flex items-baseline gap-5 border-b hairline py-4">
                    <span className="font-mono text-xs text-accent">{String(i + 1).padStart(2, "0")}</span>
                    <span className="font-display text-xl font-semibold tracking-tight sm:text-2xl">{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>

        {/* always dark, like the contact section */}
        <section data-theme="dark" className="mt-24 rounded-[2rem] bg-bg px-6 py-14 text-fg sm:rounded-[3rem] sm:px-12 sm:py-20">
          <h2 className="font-display text-[clamp(2.4rem,7vw,6rem)] font-extrabold leading-[0.95] tracking-[-0.04em]">
            Got something in mind<span className="text-accent">?</span>
          </h2>
          <p className="mt-5 max-w-xl text-lg text-muted">Send me a message with the details above and I will get back to you.</p>
          <a href={mail} className="mt-10 block break-all font-display text-2xl font-semibold underline-offset-8 hover:underline sm:text-4xl">{profile.email}</a>
          <div className="mt-8 flex flex-wrap gap-3">
            <Magnetic>
              <button onClick={() => jump("contact")} data-cursor="Contact" className="rounded-full bg-accent px-9 py-5 font-mono text-xs font-medium uppercase tracking-widest text-accent-ink">
                Use the form →
              </button>
            </Magnetic>
            <Magnetic>
              <button onClick={copy} className={pill}>{copied ? "Copied ✓" : "Copy email"}</button>
            </Magnetic>
            <Magnetic>
              <a href={profile.github} target="_blank" rel="noreferrer" data-cursor="Open" className={pill}>GitHub ↗</a>
            </Magnetic>
          </div>
          <p role="status" className="sr-only">{copied ? "Email address copied" : ""}</p>
        </section>
      </div>
    </main>
  );
};

export default WorkWithMe;
