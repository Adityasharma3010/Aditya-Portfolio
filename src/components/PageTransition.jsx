import { createContext, useCallback, useContext, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { gsap } from "../lib/gsap";
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
  const busy = useRef(false);

  const go = useCallback(
    (to) => {
      if (busy.current || to === location.pathname) return;
      busy.current = true;
      const tl = gsap.timeline({ onComplete: () => (busy.current = false) });
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
