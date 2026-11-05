import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger, SplitText, useGSAP, prefersReducedMotion } from "../lib/gsap";
import { profile } from "../data";
import Magnetic from "./Magnetic";
import { useLenis } from "./SmoothScroll";
import CyberGrid from "./CyberGrid";
import { useTheme } from "../context/Theme";

// live local time, a small human touch
const useClock = () => {
  const fmt = () => new Date().toLocaleTimeString("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit" });
  const [t, setT] = useState(fmt);
  useEffect(() => {
    const id = setInterval(() => setT(fmt()), 20000);
    return () => clearInterval(id);
  }, []);
  return t;
};

const Hero = ({ ready }) => {
  const root = useRef(null);
  const lenis = useLenis();
  const time = useClock();
  const { cyber } = useTheme();

  useGSAP(
    () => {
      if (!ready) return;
      const reduce = prefersReducedMotion();

      // ---- intro: split headline into chars, rise from behind a mask ----
      const split = new SplitText(".hero-title", { type: "lines,chars", mask: "lines" });
      const intro = gsap.timeline({ defaults: { ease: "power4.out" } });
      if (!reduce) {
        intro
          .from(split.chars, { yPercent: 120, rotate: 8, duration: 1.2, stagger: 0.02 })
          .from(".hero-fade", { opacity: 0, y: 24, duration: 1, stagger: 0.12 }, "-=0.8")
          .from(".hero-orb", { scale: 0, opacity: 0, duration: 1.6, stagger: 0.15, ease: "expo.out" }, 0)
          .from(".hero-line", { scaleX: 0, duration: 1.4, ease: "power3.inOut" }, "-=1.2");
      }

      // ---- rotating role text ----
      const roles = gsap.utils.toArray(".role");
      gsap.set(roles, { yPercent: 110 });
      if (reduce) {
        gsap.set(roles[0], { yPercent: 0 });
        return () => split.revert();
      }
      const loop = gsap.timeline({ repeat: -1, delay: 1.2 });
      roles.forEach((r) => {
        loop.to(r, { yPercent: 0, duration: 0.7, ease: "power4.out" })
          .to(r, { yPercent: -110, duration: 0.6, ease: "power4.in" }, "+=1.4");
      });

      if (reduce) return () => split.revert();

      // ---- scroll parallax: layers travel at different speeds, title fades + shrinks ----
      const scroll = { trigger: root.current, start: "top top", end: "bottom top", scrub: true };
      gsap.to(".hero-title-wrap", { yPercent: 25, opacity: 0.1, scale: 0.94, ease: "none", scrollTrigger: scroll });
      gsap.to(".hero-orb-a", { yPercent: -80, ease: "none", scrollTrigger: scroll });
      gsap.to(".hero-orb-b", { yPercent: 60, xPercent: -20, ease: "none", scrollTrigger: scroll });
      gsap.to(".hero-bgword", { xPercent: -25, ease: "none", scrollTrigger: scroll });
      gsap.to(".hero-scroll", { yPercent: -60, opacity: 0, ease: "none", scrollTrigger: scroll });

      // ---- rotating badge: spins constantly, spins faster when you scroll ----
      const spin = gsap.to(".hero-badge-ring", { rotate: 360, duration: 18, ease: "none", repeat: -1 });
      ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: (self) => {
          const boost = 1 + Math.min(Math.abs(self.getVelocity()) / 300, 8);
          gsap.to(spin, { timeScale: self.direction * boost, duration: 0.3, overwrite: true });
          gsap.to(spin, { timeScale: 1, duration: 1.2, delay: 0.3 });
        },
      });

      // ---- pointer parallax (desktop only) ----
      const mm = gsap.matchMedia();
      mm.add("(hover: hover) and (pointer: fine)", () => {
        const layers = [
          { sel: ".hero-orb-a", d: 50 },
          { sel: ".hero-orb-b", d: -35 },
          { sel: ".hero-title-wrap", d: 12 },
          { sel: ".hero-bgword", d: -18 },
        ].map(({ sel, d }) => ({
          d,
          x: gsap.quickTo(sel, "x", { duration: 1.2, ease: "power3" }),
          y: gsap.quickTo(sel, "y", { duration: 1.2, ease: "power3" }),
        }));
        const move = (e) => {
          const nx = e.clientX / innerWidth - 0.5;
          const ny = e.clientY / innerHeight - 0.5;
          layers.forEach((l) => { l.x(nx * l.d); l.y(ny * l.d); });
        };
        window.addEventListener("pointermove", move);
        return () => window.removeEventListener("pointermove", move);
      });

      return () => { split.revert(); mm.revert(); };
    },
    { scope: root, dependencies: [ready] }
  );

  const scrollToWork = () => {
    const el = document.getElementById("work");
    lenis ? lenis.scrollTo(el, { duration: 1.6 }) : el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section ref={root} className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden px-5 pb-10 pt-32 sm:px-10">
      {cyber && <CyberGrid sun className="absolute inset-x-0 bottom-0 h-[70%] opacity-80" />}

      {/* parallax layers */}
      <div className="hero-orb hero-orb-a pointer-events-none absolute -right-[10vw] top-[12vh] h-[45vmax] w-[45vmax] rounded-full bg-accent/25 blur-[90px] will-change-transform" />
      <div className="hero-orb hero-orb-b pointer-events-none absolute -left-[15vw] bottom-[5vh] h-[35vmax] w-[35vmax] rounded-full bg-fg/10 blur-[110px] will-change-transform" />
      <div className="hero-bgword pointer-events-none absolute left-0 top-[18vh] select-none whitespace-nowrap font-display text-[32vw] font-extrabold leading-none text-outline opacity-60 will-change-transform" aria-hidden="true">
        DEVELOPER
      </div>

      {/* rotating badge */}
      <div className="hero-scroll absolute right-5 top-32 hidden h-36 w-36 sm:block md:right-10 md:top-36 md:h-44 md:w-44">
       <div className="hero-fade relative flex h-full w-full items-center justify-center">
        <svg className="hero-badge-ring absolute inset-0 h-full w-full" viewBox="0 0 200 200" aria-hidden="true">
          <defs><path id="badgePath" d="M100,100 m-80,0 a80,80 0 1,1 160,0 a80,80 0 1,1 -160,0" /></defs>
          <text className="fill-fg font-mono text-[13px] uppercase">
            <textPath href="#badgePath" textLength="498" lengthAdjust="spacing">Full stack · React · GSAP · WordPress · </textPath>
          </text>
        </svg>
        <span className="grid h-14 w-14 place-items-center rounded-full bg-accent font-display text-lg font-extrabold text-accent-ink">AS</span>
       </div>
      </div>

      <div className="relative mx-auto w-full max-w-[1500px]">
        <div className="hero-scroll mb-6">
          <p className="hero-fade flex items-center gap-3 font-mono text-xs uppercase tracking-[0.25em] text-muted">
            <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
            Available for work · India · {time} IST
          </p>
        </div>

        <div data-glitch className="hero-title-wrap origin-bottom will-change-transform">
          <h1 className="hero-title font-display text-[clamp(3.2rem,13.5vw,12rem)] font-extrabold leading-[0.88] tracking-[-0.04em]">
            Aditya
            <br />
            <span data-neon className="text-accent">Sharma</span>
          </h1>
        </div>

        <div className="hero-line my-8 h-px origin-left bg-line/20" />

        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div className="hero-fade">
            <div className="mask relative h-9 sm:h-11">
              {profile.roles.map((r) => (
                <div key={r} className="role absolute font-display text-3xl font-semibold sm:text-4xl">{r}</div>
              ))}
            </div>
            <p data-decrypt className="mt-4 max-w-md text-balance text-base text-muted sm:text-lg">
              I build fast, animated web experiences with React, GSAP and WordPress.
            </p>
          </div>

          <div className="hero-fade flex items-center gap-4">
            <Magnetic>
              <button onClick={scrollToWork} data-cursor="Go" data-scramble className="rounded-full bg-accent px-7 py-4 font-mono text-xs font-medium uppercase tracking-widest text-accent-ink">
                See my work ↓
              </button>
            </Magnetic>
            <Magnetic>
              <a href={`mailto:${profile.email}`} data-scramble className="inline-block rounded-full border hairline px-7 py-4 font-mono text-xs uppercase tracking-widest transition-colors hover:bg-fg/10">
                Say hi
              </a>
            </Magnetic>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
