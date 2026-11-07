import { useRef } from "react";
import { gsap } from "../lib/gsap";
import { useTheme } from "../context/Theme";

// Flips dark <-> light inside whichever theme (Default / Cyberpunk) is active.
const ThemeToggle = () => {
  const { mode, toggleMode } = useTheme();
  const btn = useRef(null);
  const icon = useRef(null);
  const next = mode === "dark" ? "light" : "dark";

  const toggle = () => {
    gsap.fromTo(icon.current, { rotate: -120, scale: 0.4 }, { rotate: 0, scale: 1, duration: 0.7, ease: "back.out(2)" });
    toggleMode(btn.current);
  };

  return (
    <button
      ref={btn}
      onClick={toggle}
      aria-label={`Switch to ${next} mode`}
      title={mode === "light" ? "Not that mode. The other one." : undefined}
      className="relative grid h-10 w-10 place-items-center rounded-full border hairline text-fg transition-colors hover:bg-fg/10"
    >
      <span ref={icon} className="grid place-items-center">
        {next === "light" ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>
        )}
      </span>
    </button>
  );
};

export default ThemeToggle;
