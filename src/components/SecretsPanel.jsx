import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { gsap, prefersReducedMotion } from "../lib/gsap";
import { SECRETS, ARROW_GLYPH } from "../lib/secrets";
import { getFound, subscribe, resetFound } from "../lib/achievements";

// "Secrets": how many of the hidden things this visitor has found. Opened from the command palette.
// Until a secret is found only its riddle shows; the name and the codes appear once it is found.
const SecretsPanel = () => {
  const [open, setOpen] = useState(false);
  const found = useSyncExternalStore(subscribe, getFound);
  const box = useRef(null);

  useEffect(() => {
    const o = () => setOpen(true);
    window.addEventListener("open-secrets", o);
    return () => window.removeEventListener("open-secrets", o);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      setOpen(false);
    };
    window.addEventListener("keydown", onKey, true);
    box.current?.focus();
    if (!prefersReducedMotion()) gsap.fromTo(box.current, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: "power3.out" });
    return () => window.removeEventListener("keydown", onKey, true);
  }, [open]);

  if (!open) return null;
  const total = SECRETS.length;
  const pct = Math.round((found.length / total) * 100);

  return (
    <div role="dialog" aria-modal="true" aria-label="Secrets" className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-8">
      <div className="absolute inset-0 bg-bg/80 backdrop-blur-md" onClick={() => setOpen(false)} aria-hidden="true" />
      <div ref={box} tabIndex={-1} data-lenis-prevent className="relative max-h-full w-full max-w-3xl overflow-y-auto rounded-3xl border hairline bg-surface p-6 outline-none sm:p-9">
        <p className="font-mono text-xs uppercase tracking-widest text-muted">Secrets</p>
        <h2 className="mt-2 font-display text-5xl font-extrabold tracking-tight">
          {found.length} / {total}<span className="text-accent">.</span>
        </h2>
        <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-fg/10" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={found.length}>
          <div className="h-full rounded-full bg-accent transition-[width] duration-700" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-5 text-muted">Hidden things live on this site. Find one and it shows up here with the code to do it again.</p>

        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {SECRETS.map((s) =>
            found.includes(s.id) ? (
              <li key={s.id} className="rounded-2xl border border-accent/60 bg-accent/10 p-4">
                <p className="font-display text-lg font-bold">{s.name}</p>
                {s.word ? (
                  <>
                    <p className="mt-2 font-mono text-xs text-muted">
                      type <span className="text-fg">{s.word}</span>{s.also ? <> or <span className="text-fg">{s.also}</span></> : null}
                    </p>
                    <p className="mt-1 font-mono text-sm tracking-[0.25em] text-fg">{[...s.arrows].map((c) => ARROW_GLYPH[c]).join(" ")}</p>
                  </>
                ) : (
                  <p className="mt-2 text-sm text-muted">{s.how}</p>
                )}
                {s.note && <p className="mt-1 font-mono text-[11px] text-muted">{s.note}</p>}
              </li>
            ) : (
              <li key={s.id} className="rounded-2xl border hairline p-4 opacity-80">
                <p className="font-mono text-xs uppercase tracking-widest text-muted">???</p>
                <p className="mt-2 text-sm text-muted">{s.hint}</p>
              </li>
            )
          )}
        </ul>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <button type="button" onClick={() => { if (window.confirm("Forget every secret you have found?")) resetFound(); }} className="font-mono text-xs uppercase tracking-widest text-muted hover:text-fg">
            Reset progress
          </button>
          <button type="button" onClick={() => setOpen(false)} className="rounded-full border hairline px-6 py-3 font-mono text-xs uppercase tracking-widest hover:bg-fg/10">
            Close · Esc
          </button>
        </div>
      </div>
    </div>
  );
};

export default SecretsPanel;
