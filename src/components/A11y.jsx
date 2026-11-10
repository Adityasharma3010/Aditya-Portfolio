import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useLenis } from "./SmoothScroll";

// First tab stop on every page: jumps past the navbar to the page content.
export const SkipLink = () => {
  const lenis = useLenis();
  const onClick = (e) => {
    e.preventDefault();
    const main = document.querySelector("main");
    if (!main) return;
    main.tabIndex = -1;
    main.focus({ preventScroll: true });
    if (lenis) lenis.scrollTo(main, { immediate: true });
    else main.scrollIntoView();
  };
  return (
    <nav aria-label="Skip links">
      <a
        href="#main"
        onClick={onClick}
        className="fixed left-4 top-4 z-[300] -translate-y-[200%] rounded-full bg-accent px-5 py-3 font-mono text-xs font-medium uppercase tracking-widest text-accent-ink focus:translate-y-0"
      >
        Skip to content
      </a>
    </nav>
  );
};

// Screen readers get no page load on a route change, so say the new page title out loud.
export const RouteAnnouncer = () => {
  const { pathname } = useLocation();
  const [text, setText] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setText(document.title), 400);
    return () => clearTimeout(t);
  }, [pathname]);
  return <p role="status" aria-live="polite" className="sr-only">{text}</p>;
};
