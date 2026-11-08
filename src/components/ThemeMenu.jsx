import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP } from "../lib/gsap";
import { skins } from "../data/themes";
import { useTheme } from "../context/Theme";

// Dropdown to pick any theme. Opens with a clip-path wipe and staggered rows.
const ThemeMenu = () => {
  const { skin, mode, switchSkin } = useTheme();
  const [open, setOpen] = useState(false);
  const root = useRef(null);
  const btn = useRef(null);
  const panel = useRef(null);
  const tl = useRef(null);

  useGSAP(
    () => {
      tl.current = gsap
        .timeline({ paused: true, defaults: { ease: "power3.out" }, onReverseComplete: () => { panel.current.style.display = "none"; } })
        .fromTo(panel.current, { clipPath: "inset(0 0 100% 0)", y: -10 }, { clipPath: "inset(0 0 0% 0)", y: 0, duration: 0.45 })
        .from(".tm-item", { x: -18, opacity: 0, duration: 0.4, stagger: 0.07 }, "-=0.25");
    },
    { scope: root }
  );

  useEffect(() => {
    if (!tl.current) return;
    if (open) {
      panel.current.style.display = "block";
      tl.current.timeScale(1).play();
    } else {
      tl.current.timeScale(1.6).reverse();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => !root.current.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === "Escape" && (setOpen(false), btn.current.focus());
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const pick = (id) => {
    setOpen(false);
    switchSkin(id, btn.current);
  };

  const active = skins.find((t) => t.id === skin);

  return (
    <div ref={root} className="relative">
      <button
        ref={btn}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Choose theme"
        data-cursor="Theme"
        className="flex h-10 items-center gap-2 rounded-full border hairline px-2.5 font-mono text-[11px] uppercase tracking-widest transition-colors hover:bg-fg/10 min-[360px]:px-3 sm:px-4"
      >
        <span className="flex -space-x-1">
          {active.swatch[mode].slice(0, 3).map((c) => (
            <i key={c} className="h-3 w-3 rounded-full border border-bg" style={{ background: c }} />
          ))}
        </span>
        <span className="hidden sm:inline">{active.label}</span>
        <svg width="10" height="10" viewBox="0 0 10 10" className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`} aria-hidden="true">
          <path d="M1 3l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>

      <div
        ref={panel}
        role="menu"
        aria-label="Themes"
        style={{ display: "none" }}
        className="absolute right-0 top-full z-50 mt-3 w-64 overflow-hidden rounded-2xl border hairline bg-bg/95 p-2 shadow-2xl backdrop-blur-xl"
      >
        {skins.map((t) => (
          <button
            key={t.id}
            role="menuitemradio"
            aria-checked={skin === t.id}
            onClick={() => pick(t.id)}
            className={`tm-item flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-fg/10 ${skin === t.id ? "bg-fg/[0.07]" : ""}`}
          >
            <span className="flex h-9 w-14 shrink-0 overflow-hidden rounded-md border hairline">
              {t.swatch[mode].map((c) => (
                <i key={c} className="h-full flex-1" style={{ background: c }} />
              ))}
            </span>
            <span className="flex-1">
              <span className="block font-display text-sm font-semibold">{t.label}</span>
              <span className="block font-mono text-[10px] uppercase tracking-wider text-muted">{t.note}</span>
            </span>
            {skin === t.id && <span className="text-accent">✓</span>}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ThemeMenu;
