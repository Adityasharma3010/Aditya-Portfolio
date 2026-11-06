import { useEffect } from "react";
import { useTheme } from "../context/Theme";
import { overdrive } from "../lib/overdrive";
import { CHEATS, CHEAT_MAX_LEN } from "../lib/cheats";

const CODE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

// ↑ ↑ ↓ ↓ ← → ← → B A
// In the default theme it unlocks Cyberpunk. In Cyberpunk it triggers overdrive.
// Typed words (iddqd, idkfa, hadouken, party, disco, snake) trigger the cheats in lib/cheats.js, in both skins.
const Konami = () => {
  const { cyber, switchSkin } = useTheme();

  useEffect(() => {
    let i = 0;
    let typed = "";
    const onKey = (e) => {
      if (e.target.matches?.("input, textarea, select, [contenteditable]"))
        return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;

      // typed cheat words
      if (e.key.length === 1) {
        typed = (typed + k).slice(-CHEAT_MAX_LEN);
        const word = Object.keys(CHEATS).find((w) => typed.endsWith(w));
        if (word) {
          typed = "";
          CHEATS[word]();
        }
      }

      i = k === CODE[i] ? i + 1 : k === CODE[0] ? 1 : 0;
      if (i === CODE.length) {
        i = 0;
        if (cyber) overdrive();
        else switchSkin("cyber");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cyber, switchSkin]);

  return null;
};

export default Konami;
