import { useRef } from "react";
import { flushSync } from "react-dom";
import { gsap, prefersReducedMotion } from "../lib/gsap";
import { useTheme } from "../context/Theme";

// Circular reveal that shows the real page changing: the browser snapshots the old theme,
// we flip the theme, then a circle grows from the button and uncovers the NEW live page.
// (View Transitions API. Browsers without it get a quick colour fade instead.)
const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const btn = useRef(null);
  const icon = useRef(null);
  const busy = useRef(false);

  const toggle = async () => {
    if (busy.current) return;
    busy.current = true;
    const next = theme === "dark" ? "light" : "dark";
    const root = document.documentElement;

    gsap.fromTo(icon.current, { rotate: -120, scale: 0.4 }, { rotate: 0, scale: 1, duration: 0.7, ease: "back.out(2)" });

    if (!document.startViewTransition || prefersReducedMotion()) {
      root.classList.add("theme-fade");
      setTheme(next);
      setTimeout(() => { root.classList.remove("theme-fade"); busy.current = false; }, 600);
      return;
    }

    const r = btn.current.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    const maxR = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

    const t = document.startViewTransition(() => flushSync(() => setTheme(next)));
    try {
      await t.ready;
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${maxR}px at ${x}px ${y}px)`] },
        { duration: 900, easing: "cubic-bezier(0.65, 0, 0.35, 1)", pseudoElement: "::view-transition-new(root)" }
      );
      await t.finished;
    } catch {
      /* transition skipped, theme is already applied */
    }
    busy.current = false;
  };

  return (
    <button
      ref={btn}
      onClick={toggle}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      className="relative grid h-10 w-10 place-items-center rounded-full border hairline text-fg transition-colors hover:bg-fg/10"
    >
      <span ref={icon} className="grid place-items-center">
        {theme === "dark" ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>
        )}
      </span>
    </button>
  );
};

export default ThemeToggle;
