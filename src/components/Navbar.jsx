import { useRef, useState } from "react";
import {
  gsap,
  ScrollTrigger,
  useGSAP,
  prefersReducedMotion,
} from "../lib/gsap";
import { navLinks, profile } from "../data";
import { TLink } from "./PageTransition";
import { useJump } from "../hooks/useJump";
import { useTheme } from "../context/Theme";
import SoundToggle from "./SoundToggle";
import { useLenis } from "./SmoothScroll";
import ThemeToggle from "./ThemeToggle";
import ThemeMenu from "./ThemeMenu";
import MotionToggle from "./MotionToggle";

const Navbar = ({ ready }) => {
  const root = useRef(null);
  const menu = useRef(null);
  const tl = useRef(null);
  const [open, setOpen] = useState(false);
  const lenis = useLenis();
  const { cyber } = useTheme();

  // slide in after the loader, hide on scroll down, show on scroll up
  useGSAP(
    () => {
      // reduced motion: header just sits there, always visible, no slide-in and no hide on scroll
      if (!ready || prefersReducedMotion()) return;
      gsap.from(root.current, {
        yPercent: -120,
        duration: 1,
        ease: "power4.out",
        delay: 0.2,
      });
      ScrollTrigger.create({
        start: 80,
        end: "max",
        onUpdate: (self) =>
          gsap.to(root.current, {
            yPercent: self.direction === 1 && !open ? -120 : 0,
            duration: 0.4,
            ease: "power3.out",
            overwrite: true,
          }),
      });
    },
    { scope: root, dependencies: [ready] },
  );

  // fullscreen mobile menu timeline
  useGSAP(
    () => {
      tl.current = gsap
        .timeline({ paused: true, defaults: { ease: "power4.inOut" } })
        .set(menu.current, { display: "flex" })
        .fromTo(
          menu.current,
          { clipPath: "circle(0% at 100% 0%)" },
          { clipPath: "circle(150% at 100% 0%)", duration: 0.9 },
        )
        .from(
          ".mm-link",
          { yPercent: 120, duration: 0.8, stagger: 0.07, ease: "power4.out" },
          "-=0.5",
        )
        .from(".mm-foot", { opacity: 0, y: 20, duration: 0.5 }, "-=0.4");
    },
    { scope: menu },
  );

  const toggleMenu = (next) => {
    setOpen(next);
    if (next) {
      lenis?.stop();
      tl.current.timeScale(1).play();
    } else {
      lenis?.start();
      tl.current.timeScale(1.4).reverse();
    }
  };

  const jumpTo = useJump();
  const jump = (id) => {
    if (open) toggleMenu(false);
    jumpTo(id);
  };

  return (
    <>
      <header
        ref={root}
        className="fixed inset-x-0 top-0 z-50 px-5 py-4 no-print sm:px-10"
      >
        <nav className="mx-auto flex max-w-[1500px] items-center justify-between rounded-full border hairline bg-bg/60 px-5 py-2 backdrop-blur-xl">
          <TLink
            to="/"
            data-glitch
            className="text-xl font-bold tracking-tight font-display"
            data-cursor="Home"
          >
            AS<span className="text-accent">.</span>
          </TLink>

          <ul className="items-center hidden gap-8 md:flex">
            {navLinks.map((l, i) => (
              <li key={l.id}>
                <button
                  onClick={() => jump(l.id)}
                  className="relative overflow-hidden font-mono text-xs tracking-widest uppercase transition-colors group text-muted hover:text-fg"
                >
                  <span className="mr-1 text-accent">0{i + 1}</span>
                  <span data-scramble>{l.title}</span>
                  <span className="absolute inset-x-0 bottom-0 h-px transition-transform duration-500 origin-left scale-x-0 bg-accent group-hover:scale-x-100" />
                </button>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.dispatchEvent(new Event("open-palette"))}
              aria-label="Open command palette"
              data-cursor="Search"
              className="hidden h-10 items-center gap-2 rounded-full border hairline px-3.5 font-mono text-[11px] uppercase tracking-widest text-muted transition-colors hover:bg-fg/10 hover:text-fg lg:flex"
            >
              Search{" "}
              <kbd className="rounded border hairline px-1.5 py-px text-[10px]">
                {/Mac|iPhone|iPad/.test(navigator.platform) ? "⌘K" : "Ctrl K"}
              </kbd>
            </button>
            <ThemeMenu />
            <ThemeToggle />
            <MotionToggle />
            {cyber && <SoundToggle />}
            <button
              onClick={() => toggleMenu(!open)}
              className="grid w-10 h-10 border rounded-full place-items-center hairline md:hidden"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
            >
              <span className="relative block w-5 h-3">
                <span
                  className={`absolute left-0 h-px w-5 bg-fg transition-all duration-300 ${open ? "top-1/2 rotate-45" : "top-0"}`}
                />
                <span
                  className={`absolute left-0 h-px w-5 bg-fg transition-all duration-300 ${open ? "top-1/2 -rotate-45" : "bottom-0"}`}
                />
              </span>
            </button>
          </div>
        </nav>
      </header>

      <div
        ref={menu}
        className="fixed inset-0 z-40 hidden flex-col justify-between bg-bg px-8 pb-10 pt-28 md:!hidden"
      >
        <ul className="flex flex-col gap-2">
          {navLinks.map((l, i) => (
            <li key={l.id} className="mask">
              <button
                onClick={() => jump(l.id)}
                className="flex items-baseline gap-4 text-6xl font-bold tracking-tight mm-link font-display"
              >
                <span className="font-mono text-xs text-accent">0{i + 1}</span>
                {l.title}
              </button>
            </li>
          ))}
        </ul>
        <div className="font-mono text-xs mm-foot text-muted">
          <a href={`mailto:${profile.email}`} className="block text-fg">
            {profile.email}
          </a>
          <a
            href={profile.github}
            target="_blank"
            rel="noreferrer"
            className="block mt-2"
          >
            GitHub ↗
          </a>
        </div>
      </div>
    </>
  );
};

export default Navbar;
