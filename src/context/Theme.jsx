import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { prefersReducedMotion } from "../lib/gsap";
import { SKIN_IDS } from "../data/themes";

const ThemeContext = createContext(null);

const META = {
  "default-dark": "#0b0b0d",
  "default-light": "#f4f1eb",
  "cyber-dark": "#05060d",
  "cyber-light": "#eef0e8",
};

const root = () => document.documentElement;
const readSkin = () => (root().getAttribute("data-skin") === "cyber" ? "cyber" : "default");
const readMode = () => (root().getAttribute("data-theme") === "light" ? "light" : "dark");

export const ThemeProvider = ({ children }) => {
  const [state, setState] = useState({ skin: readSkin(), mode: readMode() });
  const current = useRef(state);
  const busy = useRef(false);

  const apply = useCallback((next, persist = true) => {
    root().setAttribute("data-skin", next.skin);
    root().setAttribute("data-theme", next.mode);
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", META[`${next.skin}-${next.mode}`]);
    if (persist) {
      try {
        localStorage.setItem("skin", next.skin);
        localStorage.setItem("mode", next.mode);
      } catch { /* private mode */ }
    }
    current.current = next;
    setState(next);
  }, []);

  /*
    Change skin and/or mode with a reveal that shows the real new page underneath:
    - going to / staying in cyberpunk, new skin : glitchy slices snapping in
    - cyberpunk light <-> dark                  : scanline wipe from the top
    - default skin                              : circle growing from the clicked button
    Browsers without View Transitions get a plain colour fade.
  */
  const change = useCallback(
    async (patch, origin) => {
      const next = { ...current.current, ...patch };
      const prev = current.current;
      if (next.skin === prev.skin && next.mode === prev.mode) return;
      if (busy.current || !SKIN_IDS.includes(next.skin)) return;
      busy.current = true;

      if (!document.startViewTransition || prefersReducedMotion()) {
        root().classList.add("theme-fade");
        apply(next);
        setTimeout(() => { root().classList.remove("theme-fade"); busy.current = false; }, 600);
        return;
      }

      const r = origin?.getBoundingClientRect();
      const x = r ? r.left + r.width / 2 : innerWidth / 2;
      const y = r ? r.top + r.height / 2 : innerHeight / 2;
      const maxR = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

      const t = document.startViewTransition(() => flushSync(() => apply(next)));
      try {
        await t.ready;
        const pseudo = "::view-transition-new(root)";
        if (next.skin === "cyber" && next.skin !== prev.skin) {
          root().animate(
            {
              clipPath: ["inset(0 0 100% 0)", "inset(0 0 78% 0)", "inset(40% 0 40% 0)", "inset(12% 0 60% 0)", "inset(55% 0 12% 0)", "inset(0 0 30% 0)", "inset(0 0 0 0)"],
              filter: ["hue-rotate(80deg) saturate(3)", "none", "hue-rotate(-60deg) saturate(2.5)", "none", "hue-rotate(120deg)", "none", "none"],
              transform: ["translateX(0)", "translateX(-14px)", "translateX(10px)", "translateX(-6px)", "translateX(8px)", "translateX(-3px)", "translateX(0)"],
            },
            { duration: 750, easing: "steps(7, end)", pseudoElement: pseudo }
          );
        } else if (next.skin === "cyber") {
          // same skin, other mode: a scanline wipes down the screen, new mode revealed behind it
          root().animate(
            { clipPath: ["inset(0 0 100% 0)", "inset(0 0 0% 0)"], filter: ["brightness(1.6) saturate(1.6)", "none"] },
            { duration: 800, easing: "steps(32, end)", pseudoElement: pseudo }
          );
        } else {
          root().animate(
            { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${maxR}px at ${x}px ${y}px)`] },
            { duration: 900, easing: "cubic-bezier(0.65, 0, 0.35, 1)", pseudoElement: pseudo }
          );
        }
        await t.finished;
      } catch {
        /* transition skipped, theme is already applied */
      }
      busy.current = false;
    },
    [apply]
  );

  const switchSkin = useCallback((skin, origin) => change({ skin }, origin), [change]);
  const toggleMode = useCallback(
    (origin) => change({ mode: current.current.mode === "dark" ? "light" : "dark" }, origin),
    [change]
  );

  // follow the OS for dark/light until the user picks a mode by hand
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const onChange = (e) => {
      if (!localStorage.getItem("mode")) apply({ ...current.current, mode: e.matches ? "light" : "dark" }, false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [apply]);

  return (
    <ThemeContext.Provider value={{ skin: state.skin, mode: state.mode, cyber: state.skin === "cyber", switchSkin, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => useContext(ThemeContext);
