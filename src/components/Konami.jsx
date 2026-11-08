import { useEffect, useState } from "react";
import { useTheme } from "../context/Theme";
import { overdrive } from "../lib/overdrive";
import { useJump } from "../hooks/useJump";
import { unlock } from "../lib/achievements";
import { SECRETS } from "../lib/secrets";

// GTA style cheats: type the word, or press the arrow combo (U D L R). The effects live in lib/cheats.js,
// which is loaded when the browser is idle so it never competes with the first paint.
// Cyberpunk / override:  ↑ ↑ ↓ ↓ ← → ← →  or type "cyberpunk" / "override".
// In the default skin it unlocks Cyberpunk. In Cyberpunk it triggers overdrive.
const ARROW_KEYS = { ArrowUp: "U", ArrowDown: "D", ArrowLeft: "L", ArrowRight: "R" };
const CYBER_ARROWS = SECRETS.find((s) => s.id === "cyberpunk").arrows;

const Konami = () => {
  const { cyber, switchSkin } = useTheme();
  const jump = useJump();
  const [mod, setMod] = useState(null);

  useEffect(() => {
    let dead = false;
    const idle = window.requestIdleCallback || ((f) => setTimeout(f, 1500));
    const cancel = window.cancelIdleCallback || clearTimeout;
    const id = idle(() => { import("../lib/cheats").then((m) => { if (!dead) setMod(m); }); }, { timeout: 4000 });
    return () => { dead = true; cancel(id); };
  }, []);

  // lets cheats like hireme use the router / smooth scroller
  useEffect(() => {
    if (!mod) return;
    mod.hooks.jump = jump;
    return () => { mod.hooks.jump = null; };
  }, [mod, jump]);

  useEffect(() => {
    if (!mod) return;
    const { CHEATS, CHEAT_ARROWS } = mod;
    const cyberCheat = () => {
      if (cyber) {
        overdrive();
        unlock("overdrive");
      } else {
        switchSkin("cyber");
        unlock("cyberpunk");
      }
    };
    // a cheat that is busy (another effect is running) returns false and does not count as found
    const run = (name) => () => { if (CHEATS[name]() !== false) unlock(name); };
    const words = { cyberpunk: cyberCheat, override: cyberCheat };
    Object.keys(CHEATS).forEach((name) => { words[name] = run(name); });
    const combos = { [CYBER_ARROWS]: cyberCheat };
    Object.entries(CHEAT_ARROWS).forEach(([name, combo]) => { combos[combo] = run(name); });

    const wordList = Object.keys(words);
    const comboList = Object.keys(combos);
    const maxWord = Math.max(...wordList.map((w) => w.length));
    const maxCombo = Math.max(...comboList.map((c) => c.length));

    let typed = "";
    let arrows = "";
    const pushArrow = (a) => {
      typed = "";
      arrows = (arrows + a).slice(-maxCombo);
      const hit = comboList.find((c) => arrows.endsWith(c));
      if (hit) {
        arrows = "";
        combos[hit]();
      }
    };
    const onKey = (e) => {
      if (e.repeat) return;
      if (e.target.matches?.("input, textarea, select, [contenteditable]")) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      // arrow combos
      const arrow = ARROW_KEYS[e.key];
      if (arrow) {
        pushArrow(arrow);
        return;
      }

      // typed words
      if (e.key.length === 1) {
        arrows = "";
        typed = (typed + e.key.toLowerCase()).slice(-maxWord);
        const hit = wordList.find((w) => typed.endsWith(w));
        if (hit) {
          typed = "";
          words[hit]();
        }
      }
    };

    // touch: the same arrow combos as quick swipes (finger up / down / left / right). Taps, slow drags and anything
    // that starts inside a dialog or game do not count, and a pause of a couple of seconds starts the combo over.
    let sx = 0;
    let sy = 0;
    let st = 0;
    let lastSwipe = 0;
    const onTouchStart = (e) => {
      if (e.touches.length !== 1 || e.target.closest?.('[role="dialog"], input, textarea')) { st = 0; return; }
      sx = e.touches[0].clientX;
      sy = e.touches[0].clientY;
      st = performance.now();
    };
    const onTouchEnd = (e) => {
      if (!st || e.changedTouches.length !== 1) return;
      const dx = e.changedTouches[0].clientX - sx;
      const dy = e.changedTouches[0].clientY - sy;
      const ax = Math.abs(dx);
      const ay = Math.abs(dy);
      const now = performance.now();
      const quick = now - st < 600;
      st = 0;
      if (!quick || Math.max(ax, ay) < 60) return;
      if (now - lastSwipe > 2500) arrows = "";
      lastSwipe = now;
      pushArrow(ax > ay ? (dx > 0 ? "R" : "L") : dy > 0 ? "D" : "U");
    };

    // the command palette runs a code you typed into it (the way in on a phone, which has no keyboard shortcuts)
    const onRun = (e) => words[e.detail]?.();

    window.addEventListener("keydown", onKey);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("run-cheat", onRun);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("run-cheat", onRun);
    };
  }, [mod, cyber, switchSkin]);

  return null;
};

export default Konami;
