import { createContext, useCallback, useContext, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { gsap, prefersReducedMotion } from "../lib/gsap";
import { useLenis } from "./SmoothScroll";

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
    (to) => {
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
        go(to);
      }}
      {...rest}
    >
      {children}
    </Link>
  );
};
