// Tiny synthesized UI blips (no audio files). Cyberpunk theme only, can be muted, remembered between visits.
// Browsers only allow audio after a click or key press, so nothing plays before that.
import { useSyncExternalStore } from "react";

const KEY = "sound";
const read = () => {
  try { return localStorage.getItem(KEY) !== "off"; } catch { return true; }
};

let enabled = read();
let unlocked = false;
let ctx = null;
let lastHover = 0;
const subs = new Set();

export const isSoundOn = () => enabled;
export const setSound = (on) => {
  enabled = on;
  try { localStorage.setItem(KEY, on ? "on" : "off"); } catch { /* private mode */ }
  subs.forEach((f) => f());
  if (on) blip.on();
};
export const toggleSound = () => setSound(!enabled);

export const useSound = () =>
  useSyncExternalStore(
    (f) => (subs.add(f), () => subs.delete(f)),
    () => enabled
  );

if (typeof window !== "undefined") {
  const unlock = () => {
    unlocked = true;
    window.removeEventListener("pointerdown", unlock);
    window.removeEventListener("keydown", unlock);
  };
  window.addEventListener("pointerdown", unlock);
  window.addEventListener("keydown", unlock);
}

const canPlay = () => enabled && unlocked && document.documentElement.getAttribute("data-skin") === "cyber";

const tone = (freq, dur = 0.06, { type = "square", vol = 0.035, slideTo, at = 0 } = {}) => {
  if (!canPlay()) return;
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume();
    const t0 = ctx.currentTime + at;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t0);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g).connect(ctx.destination);
    o.start(t0);
    o.stop(t0 + dur + 0.02);
  } catch { /* audio not available */ }
};

export const blip = {
  hover: () => {
    const now = performance.now();
    if (now - lastHover < 70) return;
    lastHover = now;
    tone(1900, 0.025, { vol: 0.018 });
  },
  click: () => { tone(880, 0.05); tone(1320, 0.07, { at: 0.05 }); },
  open: () => tone(300, 0.18, { type: "sawtooth", slideTo: 1400, vol: 0.03 }),
  close: () => tone(1200, 0.14, { type: "sawtooth", slideTo: 260, vol: 0.03 }),
  key: () => tone(1500 + Math.random() * 400, 0.02, { vol: 0.015 }),
  error: () => { tone(200, 0.12, { type: "sawtooth" }); tone(150, 0.16, { type: "sawtooth", at: 0.1 }); },
  success: () => { tone(660, 0.06); tone(990, 0.06, { at: 0.07 }); tone(1480, 0.1, { at: 0.14 }); },
  on: () => { tone(500, 0.06); tone(900, 0.08, { at: 0.06 }); },
  glitch: () => tone(120, 0.35, { type: "sawtooth", slideTo: 900, vol: 0.04 }),
};
