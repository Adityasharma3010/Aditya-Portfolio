import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { gsap, SplitText, useGSAP, prefersReducedMotion } from "../lib/gsap";
import { profile } from "../data";
import Magnetic from "./Magnetic";
import CyberGrid from "./CyberGrid";
import { useTheme } from "../context/Theme";
import Terminal from "./Terminal";
import { blip } from "../lib/sound";

// three.js only downloads when the contact section is about to appear
const Stars = lazy(() => import("./StarsBackground"));

const Contact = () => {
  const root = useRef(null);
  const { cyber } = useTheme();
  const [showStars, setShowStars] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState({ type: "idle", text: "" });
  const [copied, setCopied] = useState(false);
  const [trap, setTrap] = useState(""); // honeypot, real visitors never see or fill this
  const openedAt = useRef(Date.now());

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setShowStars(true), io.disconnect()), { rootMargin: "700px" });
    io.observe(root.current);
    return () => io.disconnect();
  }, []);

  useGSAP(
    () => {
      const split = new SplitText(".ct-big", { type: "lines,chars", mask: "lines" });
      if (!prefersReducedMotion()) {
        gsap.from(split.chars, {
          yPercent: 115, duration: 1.1, ease: "power4.out", stagger: 0.025,
          scrollTrigger: { trigger: root.current, start: "top 65%" },
        });
        gsap.from(".ct-fade", {
          y: 40, opacity: 0, duration: 0.9, stagger: 0.1, ease: "power3.out",
          scrollTrigger: { trigger: ".ct-form", start: "top 85%" },
        });
        gsap.to(".ct-big-wrap", {
          yPercent: -12, ease: "none",
          scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom bottom", scrub: true },
        });
      }
      if (!prefersReducedMotion()) {
        // planet rises and drifts, nebulas move at their own speed
        if (!cyber) gsap.fromTo(".planet", { yPercent: 25, rotate: -8 }, {
          yPercent: -15, rotate: 6, ease: "none",
          scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom bottom", scrub: true },
        });
        gsap.fromTo(".nebula", { yPercent: 15 }, {
          yPercent: -15, ease: "none", stagger: 0.2,
          scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom bottom", scrub: true },
        });
        gsap.to(".stars-layer", {
          yPercent: -6, ease: "none",
          scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom bottom", scrub: true },
        });

        // shooting stars at random spots and delays
        gsap.utils.toArray(".shooting").forEach((el, i) => {
          const fire = () => {
            gsap.set(el, { left: gsap.utils.random(5, 70) + "%", top: gsap.utils.random(4, 45) + "%", rotate: 28, x: 0, y: 0, opacity: 0 });
            gsap.timeline({ onComplete: () => gsap.delayedCall(gsap.utils.random(2, 6), fire) })
              .to(el, { opacity: 1, duration: 0.1 })
              .to(el, { x: 420, y: 230, duration: 0.9, ease: "power2.in" }, "<")
              .to(el, { opacity: 0, duration: 0.3 }, "-=0.3");
          };
          gsap.delayedCall(1 + i * 2.2, fire);
        });

        // pointer parallax on the star layer (desktop)
        if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
          const xTo = gsap.quickTo(".stars-layer", "x", { duration: 1.5, ease: "power3" });
          const move = (e) => xTo((e.clientX / innerWidth - 0.5) * -40);
          window.addEventListener("pointermove", move);
          return () => { split.revert(); window.removeEventListener("pointermove", move); };
        }
      }
      return () => split.revert();
    },
    { scope: root, dependencies: [cyber], revertOnUpdate: true }
  );

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "loading", text: "Sending..." });
    try {
      const r = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, website: trap, t: openedAt.current }),
      });
      const out = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(out.error || "Something went wrong. Please try again or email me directly.");
      setStatus({ type: "ok", text: "Thanks! I'll get back to you soon." });
      setForm({ name: "", email: "", message: "" });
      openedAt.current = Date.now();
      blip.success();
    } catch (err) {
      setStatus({ type: "err", text: err.message || "Something went wrong. Please try again or email me directly." });
      blip.error();
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* clipboard blocked, mailto link still works */ }
  };

  const field = "w-full rounded-2xl border border-white/15 bg-black/40 px-5 py-4 font-display text-lg text-fg outline-none backdrop-blur-md transition-colors placeholder:text-white/70 focus:border-accent";

  return (
    <section id="contact" ref={root} className="px-2 pb-2 pt-10 sm:px-4 sm:pb-4">
     {/* always dark: it is a night sky, whatever the site theme is */}
     <div data-theme="dark" className="space relative isolate overflow-hidden rounded-[2rem] bg-bg px-5 pb-10 pt-28 text-fg sm:rounded-[3rem] sm:px-10 sm:pt-44">
      {/* nebula glows */}
      <div className="nebula nebula-a pointer-events-none absolute -left-[20%] top-[10%] -z-[1] h-[70vmax] w-[70vmax] will-change-transform">
        <div className="orb-glow absolute inset-0 rounded-full bg-[#7a2cff]/25 blur-[120px]" />
      </div>
      <div className="nebula nebula-b pointer-events-none absolute -right-[25%] bottom-[-10%] -z-[1] h-[60vmax] w-[60vmax] will-change-transform">
        <div className="orb-glow absolute inset-0 rounded-full bg-[#f272c8]/20 blur-[130px]" />
      </div>

      <div className="stars-layer absolute -inset-[6%] -z-[1]">
        {showStars && (
          <Suspense fallback={null}>
            <Stars key={cyber ? "c" : "d"} cyber={cyber} />
          </Suspense>
        )}
      </div>

      {/* shooting stars */}
      {[0, 1, 2].map((i) => (
        <span key={i} className="shooting pointer-events-none absolute -z-[1] h-px w-40 origin-left bg-gradient-to-r from-white via-white/50 to-transparent opacity-0" />
      ))}

      {cyber ? (
        <CyberGrid sun className="absolute inset-x-0 bottom-0 -z-[1] h-[62%]" />
      ) : (
      <div className="planet pointer-events-none absolute -bottom-[20vmax] -right-[8vmax] -z-[1] h-[36vmax] w-[36vmax] will-change-transform">
        <div className="absolute inset-0 rounded-full" style={{ background: "radial-gradient(circle at 30% 25%, #ffd1f1 0%, #f272c8 28%, #5b2cff 62%, #12082e 100%)", boxShadow: "inset -4vmax -2vmax 6vmax rgba(0,0,0,.55), 0 0 12vmax rgba(242,114,200,.25)" }} />
        <div className="planet-ring absolute left-1/2 top-1/2 h-[34%] w-[165%] -translate-x-1/2 -translate-y-1/2 rotate-[-18deg] rounded-[50%] border border-white/25" style={{ boxShadow: "0 0 30px rgba(200,255,61,.15)" }} />
      </div>
      )}

      <div className="mx-auto max-w-[1500px]">
        <div className="ct-big-wrap">
          <h2 className="ct-big font-display text-[clamp(3.2rem,12.5vw,11rem)] font-extrabold leading-[0.88] tracking-[-0.045em]">
            Let&apos;s build <span data-neon className="text-accent">something</span> great.
          </h2>
        </div>

        <div className="ct-form mt-16 grid gap-14 lg:mt-28 lg:grid-cols-[1fr_1.2fr]">
          <div className="ct-fade space-y-8 self-start rounded-3xl border border-white/15 bg-black/40 p-6 backdrop-blur-md sm:p-8">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-white/75">Email</p>
              <div className="mt-2 flex flex-wrap items-center gap-4">
                <a href={`mailto:${profile.email}`} className="break-all font-display text-2xl font-semibold underline-offset-8 hover:underline sm:text-3xl">{profile.email}</a>
                <button onClick={copy} className="rounded-full border hairline px-4 py-2 font-mono text-[11px] uppercase tracking-widest hover:bg-fg/10">
                  {copied ? "Copied ✓" : "Copy"}
                </button>
              </div>
            </div>
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-white/75">Elsewhere</p>
              <div className="mt-3 flex flex-wrap gap-3">
                {profile.booking && (
                  <Magnetic>
                    <a href={profile.booking} target="_blank" rel="noreferrer" data-cursor="Book" data-scramble className="inline-block rounded-full bg-accent px-6 py-3 font-mono text-xs font-medium uppercase tracking-widest text-accent-ink">
                      Book a call ↗
                    </a>
                  </Magnetic>
                )}
                <Magnetic>
                  <a href={profile.github} target="_blank" rel="noreferrer" data-cursor="Open" data-scramble className="inline-block rounded-full border hairline px-6 py-3 font-mono text-xs uppercase tracking-widest hover:bg-fg/10">
                    GitHub ↗
                  </a>
                </Magnetic>
              </div>
            </div>
          </div>

          <form onSubmit={onSubmit} className="ct-fade space-y-4">
            <input className={field} name="name" value={form.name} onChange={onChange} placeholder="Your name" aria-label="Your name" required autoComplete="name" />
            <input className={field} type="email" name="email" value={form.email} onChange={onChange} placeholder="Your email" aria-label="Your email" required autoComplete="email" />
            <input type="text" name="hp_field" value={trap} onChange={(e) => setTrap(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />
            <textarea className={`${field} resize-none`} rows={4} name="message" value={form.message} onChange={onChange} placeholder="Tell me about your project" aria-label="Tell me about your project" required />
            <div className="flex flex-wrap items-center gap-5">
              <Magnetic>
                <button type="submit" disabled={status.type === "loading"} data-cursor="Send" className="rounded-full bg-accent px-9 py-5 font-mono text-xs font-medium uppercase tracking-widest text-accent-ink disabled:opacity-60">
                  {status.type === "loading" ? "Sending..." : "Send message →"}
                </button>
              </Magnetic>
              <p role="status" className={`text-sm ${status.type === "err" ? "text-red-400" : "text-white/85"}`}>{status.text}</p>
            </div>
          </form>
        </div>

        {cyber && <Terminal />}

        <footer className="relative z-10 mt-24 flex flex-col justify-between gap-3 border-t border-white/20 pt-6 font-mono text-[11px] uppercase tracking-widest text-white/85 [text-shadow:0_1px_10px_rgba(0,0,0,0.8)] sm:flex-row">
          <span>© {new Date().getFullYear()} Aditya Sharma</span>
          <span>Built with React · GSAP · Tailwind<span aria-hidden="true" className="ml-3 select-none opacity-[0.14]">↑ ↑ ↓ ↓</span></span>
        </footer>
      </div>
     </div>
    </section>
  );
};

export default Contact;
