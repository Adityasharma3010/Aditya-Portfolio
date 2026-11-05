import { useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useLenis } from "../components/SmoothScroll";
import { usePageNav } from "../components/PageTransition";

// Scroll to a home page section, going back home first when needed. Used by the nav, palette and terminal.
export const useJump = () => {
  const lenis = useLenis();
  const { go } = usePageNav();
  const { pathname } = useLocation();

  return useCallback(
    (id) => {
      const run = () => {
        const el = id === "top" ? null : document.getElementById(id);
        if (id === "top") return lenis ? lenis.scrollTo(0, { duration: 1.4 }) : window.scrollTo({ top: 0, behavior: "smooth" });
        if (el) lenis ? lenis.scrollTo(el, { offset: -20, duration: 1.4 }) : el.scrollIntoView({ behavior: "smooth" });
      };
      if (pathname !== "/") {
        go("/");
        setTimeout(run, 1400);
      } else run();
    },
    [lenis, go, pathname]
  );
};
