import { createContext, useCallback, useContext, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { gsap, prefersReducedMotion } from "../lib/gsap";
import { useLenis } from "./SmoothScroll";
import { setFlip } from "../lib/flip";

const TransitionContext = createContext(null);
// eslint-disable-next-line react-refresh/only-export-components
export const usePageNav = () => useContext(TransitionContext);

// Curtain wipe between routes. Wrap the app, then use <TLink> instead of <Link>.
export const TransitionProvider = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const lenis = useLenis();
  const curtain = useRef(null);
  const strip = useRef(null);
  const busy = useRef(false);

  const go = useCallback(
    (to, opts) => {
      if (busy.current || to === location.pathname) return;
      if (prefersReducedMotion()) {
        navigate(to);
        lenis ? lenis.scrollTo(0, { immediate: true }) : window.scrollTo(0, 0);
        return;
      }
      busy.current = true;
      const cyber = document.documentElement.getAttribute("data-skin") === "cyber";
      const tl = gsap.timeline({ onComplete: () => (busy.current = false) });
      if (cyber) {
        // neon strips slam in from the left in random order, page swaps, strips exit to the right
        const strips = strip.current.children;
        tl.set(strip.current, { display: "block" })
          .set(strips, { scaleX: 0, transformOrigin: "left" })
          .to(strips, { scaleX: 1, duration: 0.35, ease: "power4.in", stagger: { each: 0.035, from: "random" } })
          .add(() => {
            navigate(to);
            lenis ? lenis.scrollTo(0, { immediate: true }) : window.scrollTo(0, 0);
          })
          .set(strips, { transformOrigin: "right" })
          .to(strips, { scaleX: 0, duration: 0.45, ease: "power4.out", stagger: { each: 0.035, from: "random" }, delay: 0.12 })
          .set(strip.current, { display: "none" });
        return;
      }
      // project card: its image frame expands to fill the screen, the case-study page then shrinks it into its cover
      if (opts?.flip?.isConnected) {
        const src = opts.flip;
        const r = src.getBoundingClientRect();
        const clone = src.cloneNode(true);
        [...clone.children].filter((c) => c.tagName === "SPAN").forEach((c) => c.remove()); // status chip + arrow badge
        clone.removeAttribute("data-flip-src");
        clone.className = "";
        Object.assign(clone.style, { position: "fixed", top: `${r.top}px`, left: `${r.left}px`, width: `${r.width}px`, height: `${r.height}px`, margin: "0", zIndex: "79", overflow: "hidden", borderRadius: "2rem 2rem 0 0", pointerEvents: "none" });
        document.body.appendChild(clone);
        tl.to(clone, { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight, borderRadius: 0, duration: 0.75, ease: "power4.inOut" })
          .add(() => {
            setFlip(clone);
            navigate(to);
            lenis ? lenis.scrollTo(0, { immediate: true }) : window.scrollTo(0, 0);
          });
        // safety net: if nothing picked the clone up, fade it out
        setTimeout(() => { if (clone.isConnected) gsap.to(clone, { opacity: 0, duration: 0.4, onComplete: () => clone.remove() }); }, 4500);
        return;
      }
      tl.set(curtain.current, { yPercent: 100, display: "block" })
        .to(curtain.current, { yPercent: 0, duration: 0.6, ease: "power4.inOut" })
        .add(() => {
          navigate(to);
          lenis ? lenis.scrollTo(0, { immediate: true }) : window.scrollTo(0, 0);
        })
        .to(curtain.current, { yPercent: -100, duration: 0.7, ease: "power4.inOut", delay: 0.15 })
        .set(curtain.current, { display: "none" });
    },
    [navigate, location.pathname, lenis]
  );

  return (
    <TransitionContext.Provider value={{ go }}>
      {children}
      <div ref={strip} className="pointer-events-none fixed inset-0 z-[80] hidden" aria-hidden="true">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className={`h-[10vh] w-full ${["bg-accent", "bg-accent2", "bg-accent3"][i % 3]}`} />
        ))}
      </div>
      <div
        ref={curtain}
        className="fixed inset-0 z-[80] hidden bg-accent"
        aria-hidden="true"
      />
    </TransitionContext.Provider>
  );
};

export const TLink = ({ to, children, ...rest }) => {
  const { go } = usePageNav();
  return (
    <Link
      to={to}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey) return;
        e.preventDefault();
        const frame = e.currentTarget.querySelector("[data-flip-src]");
        go(to, frame ? { flip: frame } : undefined);
      }}
      {...rest}
    >
      {children}
    </Link>
  );
};
