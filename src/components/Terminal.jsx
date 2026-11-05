import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "../lib/gsap";
import { SCRAMBLE_CHARS } from "../lib/cyber";
import { profile, about, projects, stack } from "../data";
import { useTheme } from "../context/Theme";
import { useMotion } from "../context/Motion";
import { usePageNav } from "./PageTransition";
import { useJump } from "../hooks/useJump";
import { overdrive } from "../lib/overdrive";
import { blip, isSoundOn, setSound } from "../lib/sound";

const PROMPT = "visitor@aditya:~$";
const SECTIONS = ["about", "work", "experience", "activity", "contact"];
const COMMANDS = ["help", "whoami", "about", "projects", "open", "skills", "contact", "github", "resume", "uses", "goto", "theme", "mode", "motion", "sound", "history", "clear", "override", "date", "exit"];

const HELP = [
  "help                 this list",
  "whoami / about       who I am",
  "projects             all projects, newest first",
  "open <name|number>   open a project page",
  "skills               my stack",
  "goto <section>       about | work | experience | activity | contact",
  "contact / github     ways to reach me",
  "resume / uses        open those pages",
  "theme <default|cyberpunk>   switch theme",
  "mode <dark|light>           switch mode",
  "motion <reduced|full>       motion setting",
  "sound <on|off>              UI blips",
  "history / clear / date",
  "override             ???",
];

// A small fake shell that really drives the site. Cyberpunk theme only, lives in the contact footer.
const Terminal = () => {
  const [lines, setLines] = useState([{ text: 'NEURAL//LINK shell v2.077. Type "help" to see what I can do.', cls: "text-accent2" }]);
  const [value, setValue] = useState("");
  const [past, setPast] = useState([]);
  const [pos, setPos] = useState(-1);
  const logRef = useRef(null);
  const inputRef = useRef(null);
  const printed = useRef(1);

  const { go } = usePageNav();
  const jump = useJump();
  const { switchSkin, toggleMode, mode } = useTheme();
  const { setMotion, reduced } = useMotion();

  // new lines scramble in, log stays scrolled to the bottom
  useEffect(() => {
    const log = logRef.current;
    if (!log) return;
    const kids = [...log.querySelectorAll("[data-line]")];
    kids.slice(printed.current).forEach((el) => {
      if (prefersReducedMotion()) return;
      const text = el.textContent;
      if (text.length > 1) gsap.to(el, { duration: Math.min(0.7, text.length * 0.012), scrambleText: { text, chars: SCRAMBLE_CHARS, speed: 1.4 } });
    });
    printed.current = kids.length;
    log.scrollTop = log.scrollHeight;
  }, [lines]);

  const say = (arr, cls = "") => setLines((l) => [...l, ...[].concat(arr).map((text) => ({ text, cls }))]);

  const findProject = (q) => {
    const n = Number(q);
    if (Number.isInteger(n) && n >= 1 && n <= projects.length) return projects[projects.length - n];
    const s = q.toLowerCase();
    return projects.find((p) => p.slug === s || p.name.toLowerCase() === s) || projects.find((p) => p.slug.includes(s) || p.name.toLowerCase().includes(s));
  };

  const exec = (raw) => {
    const [cmd = "", ...args] = raw.trim().split(/\s+/);
    const arg = args.join(" ");
    switch (cmd.toLowerCase()) {
      case "": return;
      case "help": return say(HELP);
      case "whoami": return say("aditya sharma // full stack developer // react, node, wordpress");
      case "about": return say(about.match(/.{1,70}(\s|$)/g).map((s) => s.trim()));
      case "projects":
        return say(projects.map((p) => `${p.index}  ${p.name.padEnd(20)} ${p.category}`).concat("", 'try: open <name|number>'));
      case "open": case "project": {
        if (!arg) return say("usage: open <name|number>", "text-accent3");
        const p = findProject(arg);
        if (!p) { blip.error(); return say(`no project matching "${arg}". try: projects`, "text-accent3"); }
        say(`opening ${p.name} ...`, "text-accent");
        return setTimeout(() => go(`/projects/${p.slug}`), 350);
      }
      case "skills": return say(stack.map((s) => s.name).join(" · ").match(/.{1,70}(\s|$)/g).map((s) => s.trim()));
      case "contact": return say([`email   ${profile.email}`, "form    scroll up, or use the fields above"]);
      case "github": say(`opening ${profile.github} ...`, "text-accent"); return window.open(profile.github, "_blank", "noreferrer");
      case "resume": say("loading resume ...", "text-accent"); return setTimeout(() => go("/resume"), 350);
      case "uses": say("loading uses ...", "text-accent"); return setTimeout(() => go("/uses"), 350);
      case "goto": case "cd": {
        const id = arg.replace(/^\//, "").toLowerCase();
        if (id === "~" || id === "top" || id === "") { jump("top"); return say("ok"); }
        if (!SECTIONS.includes(id)) { blip.error(); return say(`no such section. try: ${SECTIONS.join(" | ")}`, "text-accent3"); }
        jump(id); return say(`jumping to ${id} ...`, "text-accent");
      }
      case "theme": {
        const t = arg.toLowerCase();
        if (t.startsWith("def")) { say("switching to default theme ...", "text-accent"); return switchSkin("default"); }
        if (t.startsWith("cyb")) return say("already in cyberpunk. you're welcome.");
        return say("usage: theme <default|cyberpunk>", "text-accent3");
      }
      case "mode": {
        const m = arg.toLowerCase();
        if (m === "toggle" || (m && m !== mode && (m === "dark" || m === "light"))) { toggleMode(); return say(`mode -> ${m === "toggle" ? (mode === "dark" ? "light" : "dark") : m}`, "text-accent"); }
        if (m === "dark" || m === "light") return say(`already ${m}`);
        return say("usage: mode <dark|light|toggle>", "text-accent3");
      }
      case "motion": {
        const m = arg.toLowerCase();
        if (m === "reduced" || m === "off") { if (!reduced) setMotion("reduced"); return say("motion reduced. the page will settle ..."); }
        if (m === "full" || m === "on") { if (reduced) setMotion("full"); return say("full motion on."); }
        return say(`motion is ${reduced ? "reduced" : "full"}. usage: motion <reduced|full>`, "text-accent3");
      }
      case "sound": {
        const m = arg.toLowerCase();
        if (m === "on" || m === "off") { setSound(m === "on"); return say(`sound ${m}`); }
        return say(`sound is ${isSoundOn() ? "on" : "off"}. usage: sound <on|off>`, "text-accent3");
      }
      case "history": return say(past.length ? past.map((c, i) => `${String(i + 1).padStart(2)}  ${c}`) : "empty");
      case "clear": printed.current = 0; return setLines([]);
      case "date": return say(new Date().toString());
      case "echo": return say(arg);
      case "ls": return say(SECTIONS.map((s) => s + "/").concat("resume.pdf", "uses.md"));
      case "sudo": blip.error(); return say("nice try, choomba. you are not in the sudoers file. this incident will be reported.", "text-accent3");
      case "rm": blip.error(); return say("access denied. ICE is watching.", "text-accent3");
      case "override": case "matrix": case "konami": say("OVERRIDE ACCEPTED", "text-accent"); return overdrive();
      case "exit": jump("top"); return say("session closed. scrolling to top ...");
      default: blip.error(); return say(`command not found: ${cmd}. try "help"`, "text-accent3");
    }
  };

  const submit = (e) => {
    e.preventDefault();
    const raw = value;
    say(`${PROMPT} ${raw}`, "text-fg");
    if (raw.trim()) setPast((h) => [...h, raw.trim()]);
    setPos(-1);
    setValue("");
    blip.click();
    exec(raw);
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const next = pos === -1 ? past.length - 1 : Math.max(0, pos - 1);
      if (past[next] !== undefined) { setPos(next); setValue(past[next]); }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (pos === -1) return;
      const next = pos + 1;
      if (next >= past.length) { setPos(-1); setValue(""); } else { setPos(next); setValue(past[next]); }
    } else if (e.key === "Tab") {
      e.preventDefault();
      const hit = COMMANDS.find((c) => value && c.startsWith(value.toLowerCase()));
      if (hit) setValue(hit + " ");
    }
  };

  return (
    <div className="ct-fade mt-16 overflow-hidden rounded-2xl border border-accent2/40 bg-black/50 font-mono text-xs backdrop-blur-md sm:text-sm" onClick={() => inputRef.current?.focus()}>
      <div className="flex items-center justify-between border-b border-accent2/30 px-4 py-2 text-[10px] uppercase tracking-[0.25em] text-accent2">
        <span>visitor@aditya:~ // shell</span>
        <span className="flex gap-1.5"><i className="h-2 w-2 bg-accent3" /><i className="h-2 w-2 bg-accent" /><i className="h-2 w-2 bg-accent2" /></span>
      </div>
      <div ref={logRef} className="h-56 space-y-0.5 overflow-y-auto px-4 py-3 leading-relaxed text-fg/90" aria-live="polite">
        {lines.map((l, i) => (
          <p key={i} data-line className={`whitespace-pre-wrap break-words ${l.cls}`}>{l.text || "\u00a0"}</p>
        ))}
      </div>
      <form onSubmit={submit} className="flex items-center gap-2 border-t border-accent2/30 px-4 py-3">
        <label htmlFor="term-input" className="shrink-0 text-accent">{PROMPT}</label>
        <input
          id="term-input"
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          aria-label="Terminal command"
          className="min-w-0 flex-1 !border-0 !bg-transparent !p-0 text-fg outline-none !shadow-none"
          style={{ clipPath: "none", borderRadius: 0 }}
          placeholder='type "help"'
        />
      </form>
    </div>
  );
};

export default Terminal;
