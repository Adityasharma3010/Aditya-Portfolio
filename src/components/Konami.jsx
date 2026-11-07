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
    const onKey = (e) => {
      if (e.repeat) return;
      if (e.target.matches?.("input, textarea, select, [contenteditable]")) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      // arrow combos
      const arrow = ARROW_KEYS[e.key];
      if (arrow) {
        typed = "";
        arrows = (arrows + arrow).slice(-maxCombo);
        const hit = comboList.find((c) => arrows.endsWith(c));
        if (hit) {
          arrows = "";
          combos[hit]();
        }
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
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mod, cyber, switchSkin]);

  return null;
};

export default Konami;
