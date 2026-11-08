import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "../lib/gsap";
import { profile } from "../data";
import { projects } from "../data";
import { notes } from "../data/notes";
import { SECRETS } from "../lib/secrets";
import { skins } from "../data/themes";
import { useTheme } from "../context/Theme";
import { useMotion } from "../context/Motion";
import { usePageNav } from "./PageTransition";
import { useLenis } from "./SmoothScroll";
import { useJump } from "../hooks/useJump";
import { blip, isSoundOn, toggleSound } from "../lib/sound";

const GROUPS = ["Secrets", "Navigate", "Projects", "Theme", "Settings", "Links", "Notes"];

// Ctrl/Cmd + K. Jump anywhere, switch theme, change settings. Arrow keys + Enter, Esc to close.
const CommandPalette = () => {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const root = useRef(null);
  const panel = useRef(null);
  const overlay = useRef(null);
  const list = useRef(null);
  const hl = useRef(null);
  const input = useRef(null);
  const lastFocus = useRef(null);

  const { go } = usePageNav();
  const jump = useJump();
  const lenis = useLenis();
  const { cyber, skin, mode, switchSkin, toggleMode } = useTheme();
  const { reduced, toggleMotion } = useMotion();

  const openPalette = useCallback(() => {
    if (open) return;
    lastFocus.current = document.activeElement;
    setQuery("");
    setIndex(0);
    setMounted(true);
    setOpen(true);
    lenis?.stop();
    blip.open();
  }, [open, lenis]);

  const closePalette = useCallback(() => {
    if (!open) return;
    setOpen(false);
    blip.close();
    const done = () => {
      setMounted(false);
      lenis?.start();
      lastFocus.current?.focus?.();
    };
    if (prefersReducedMotion() || !panel.current) return done();
    gsap.timeline({ onComplete: done })
      .to(panel.current, { y: -16, opacity: 0, scale: 0.98, duration: 0.2, ease: "power2.in" })
      .to(overlay.current, { opacity: 0, duration: 0.2 }, "<");
  }, [open, lenis]);

  // global shortcut + open from anywhere with a custom event
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        open ? closePalette() : openPalette();
      }
    };
    const onOpen = () => openPalette();
    window.addEventListener("keydown", onKey);
    window.addEventListener("open-palette", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("open-palette", onOpen);
    };
  }, [open, openPalette, closePalette]);

  const commands = useMemo(() => {
    const c = [];
    const add = (group, label, hint, keywords, run) => c.push({ group, label, hint, keywords: `${label} ${keywords}`.toLowerCase(), run });
    add("Navigate", "Home", "top of the page", "start landing hero", () => (location.pathname === "/" ? jump("top") : go("/")));
    add("Navigate", "About", "who I am", "bio hello", () => jump("about"));
    add("Navigate", "Work", "selected projects", "portfolio projects cards", () => jump("work"));
    add("Navigate", "Experience", "career timeline", "jobs history", () => jump("experience"));
    add("Navigate", "GitHub activity", "recent commits", "activity contributions", () => jump("activity"));
    add("Navigate", "Contact", "send a message", "email hire form", () => jump("contact"));
    add("Navigate", "All projects", "archive, newest first", "archive list", () => go("/projects"));
    add("Navigate", "Resume", "print or save as PDF", "cv", () => go("/resume"));
    add("Navigate", "Uses", "my stack and tools", "tools stack setup", () => go("/uses"));
    add("Navigate", "Notes", "short write-ups", "blog writing articles posts", () => go("/notes"));
    add("Navigate", "Secrets", "hidden things you have found", "easter eggs achievements cheats hidden progress", () => window.dispatchEvent(new Event("open-secrets")));
    projects.forEach((p) => add("Projects", p.name, `${p.category} · ${p.status}`, `${p.slug} ${p.tags.join(" ")}`, () => go(`/projects/${p.slug}`)));
    notes.forEach((n) => add("Notes", n.title, n.tags.join(" · "), `${n.slug} ${n.tags.join(" ")}`, () => go(`/notes/${n.slug}`)));
    // skin switching is only offered once you are inside Cyberpunk (the way in is a cheat code)
    if (cyber) skins.forEach((s) => add("Theme", `Theme: ${s.label}`, skin === s.id ? "current" : s.note, "skin switch style", () => switchSkin(s.id)));
    add("Theme", `Mode: switch to ${mode === "dark" ? "light" : "dark"}`, `${skin} theme`, "dark light toggle", () => toggleMode());
    add("Settings", `Motion: ${reduced ? "Reduced" : "Full"}`, reduced ? "turn full motion on" : "turn reduced motion on", "reduce motion animation accessibility", () => toggleMotion());
    if (cyber) add("Settings", `Sound blips: ${isSoundOn() ? "On" : "Off"}`, "toggle UI sounds", "mute audio sound", () => toggleSound());
    add("Links", "Copy email address", profile.email, "mail contact copy", () => navigator.clipboard?.writeText(profile.email));
    add("Links", "GitHub profile", "opens in a new tab", "code repos", () => window.open(profile.github, "_blank", "noreferrer"));
    return c;
  }, [go, jump, skin, mode, cyber, reduced, switchSkin, toggleMode, toggleMotion]);

  const filtered = useMemo(() => {
    const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
    const hits = commands.filter((cmd) => tokens.every((t) => cmd.keywords.includes(t)));
    // typing a secret's code exactly offers to run it. That is how the codes work on a phone, which has no keyboard
    const q = query.trim().toLowerCase();
    if (q && SECRETS.some((s) => s.word === q || s.also === q)) {
      hits.unshift({ group: "Secrets", label: `Run “${q}”`, hint: "a secret", keywords: q, run: () => window.dispatchEvent(new CustomEvent("run-cheat", { detail: q })) });
    }
    return hits.sort((a, b) => GROUPS.indexOf(a.group) - GROUPS.indexOf(b.group));
  }, [commands, query]);

  const run = (cmd) => {
    closePalette();
    setTimeout(() => cmd.run(), prefersReducedMotion() ? 0 : 220);
  };

  const onKeyDown = (e) => {
    if (e.key === "Escape") { e.preventDefault(); closePalette(); }
    else if (e.key === "ArrowDown") { e.preventDefault(); setIndex((i) => (filtered.length ? (i + 1) % filtered.length : 0)); blip.hover(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setIndex((i) => (filtered.length ? (i - 1 + filtered.length) % filtered.length : 0)); blip.hover(); }
    else if (e.key === "Enter") { e.preventDefault(); if (filtered[index]) { blip.click(); run(filtered[index]); } }
    else if (e.key === "Tab") e.preventDefault(); // keep focus in the box
    else blip.key();
  };

  // open animation
  useEffect(() => {
    if (!mounted || !open) return;
    input.current?.focus();
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(overlay.current, { opacity: 0 }, { opacity: 1, duration: 0.25 });
      gsap.fromTo(panel.current, { y: -24, opacity: 0, scale: 0.97, clipPath: "inset(0 0 40% 0)" }, { y: 0, opacity: 1, scale: 1, clipPath: "inset(0 0 0% 0)", duration: 0.45, ease: "power4.out", clearProps: "clipPath" });
      gsap.from(".cp-item", { x: -16, opacity: 0, duration: 0.35, stagger: 0.02, ease: "power3.out", delay: 0.1 });
    }, root);
    return () => ctx.revert();
  }, [mounted, open]);

  // sliding highlight follows the active row
  useEffect(() => {
    if (!mounted || !list.current || !hl.current) return;
    const el = list.current.querySelector(`[data-idx="${index}"]`);
    if (!el) { gsap.set(hl.current, { opacity: 0 }); return; }
    gsap.to(hl.current, { y: el.offsetTop, height: el.offsetHeight, opacity: 1, duration: prefersReducedMotion() ? 0 : 0.25, ease: "power3.out" });
    el.scrollIntoView({ block: "nearest" });
  }, [index, filtered, mounted]);

  if (!mounted) return null;

  let lastGroup = "";
  return (
    <div ref={root} className="no-print fixed inset-0 z-[89] flex items-start justify-center px-4 pt-[14vh]" role="dialog" aria-modal="true" aria-label="Command palette">
      <div ref={overlay} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closePalette} />
      <div ref={panel} className="relative w-full max-w-xl overflow-hidden rounded-2xl border hairline bg-bg shadow-2xl">
        <div className="flex items-center gap-3 border-b hairline px-5">
          <span className="font-mono text-sm text-accent">{cyber ? ">_" : "⌘"}</span>
          <input
            ref={input}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setIndex(0); }}
            onKeyDown={onKeyDown}
            placeholder={cyber ? "type a command..." : "Search pages, projects, settings..."}
            aria-label="Search commands"
            role="combobox"
            aria-expanded="true"
            aria-controls="cp-list"
            className="w-full bg-transparent py-5 font-display text-lg outline-none placeholder:text-muted"
          />
          <kbd className="rounded border hairline px-1.5 py-0.5 font-mono text-[10px] text-muted">ESC</kbd>
        </div>

        <ul id="cp-list" ref={list} role="listbox" data-lenis-prevent className="relative max-h-[50vh] overflow-y-auto p-2">
          <span ref={hl} className="pointer-events-none absolute inset-x-2 top-0 rounded-xl bg-fg/[0.08] opacity-0" style={{ boxShadow: "inset 2px 0 0 rgb(var(--accent))" }} />
          {filtered.length === 0 && <li className="px-4 py-8 text-center font-mono text-xs uppercase tracking-widest text-muted">No match</li>}
          {filtered.map((cmd, i) => {
            const header = cmd.group !== lastGroup ? (lastGroup = cmd.group) : null;
            return (
              <li key={cmd.group + cmd.label} role="presentation">
                {header && <p className="px-4 pb-1 pt-3 font-mono text-[10px] uppercase tracking-[0.25em] text-muted first:pt-1">{header}</p>}
                <button
                  data-idx={i}
                  role="option"
                  aria-selected={i === index}
                  onMouseMove={() => i !== index && (setIndex(i), blip.hover())}
                  onClick={() => { blip.click(); run(cmd); }}
                  className="cp-item relative flex w-full items-center justify-between gap-4 rounded-xl px-4 py-3 text-left"
                >
                  <span className="font-display text-base font-semibold">{cmd.label}</span>
                  <span className="flex items-center gap-2 truncate font-mono text-[11px] uppercase tracking-wider text-muted">
                    {cmd.hint}
                    {i === index && <span className="text-accent">↵</span>}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center justify-between border-t hairline px-5 py-3 font-mono text-[10px] uppercase tracking-widest text-muted">
          <span>↑ ↓ move · ↵ run</span>
          <span>{filtered.length} result{filtered.length === 1 ? "" : "s"}</span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
