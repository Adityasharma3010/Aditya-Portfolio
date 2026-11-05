import { useEffect } from "react";
import { useTheme } from "../context/Theme";
import { overdrive } from "../lib/overdrive";

const CODE = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];

// ↑ ↑ ↓ ↓ ← → ← → B A
// In the default theme it unlocks Cyberpunk. In Cyberpunk it triggers overdrive.
const Konami = () => {
  const { cyber, switchSkin } = useTheme();

  useEffect(() => {
    let i = 0;
    const onKey = (e) => {
      if (e.target.matches?.("input, textarea")) return;
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
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
