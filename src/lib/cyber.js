import { gsap } from "./gsap";

// one quick glitch on an element: sliced clip-path, skew and a cyan/magenta split
export const glitchOnce = (el, steps = 6) => {
  const tl = gsap.timeline();
  for (let i = 0; i < steps; i++) {
    const a = gsap.utils.random(0, 70);
    const b = gsap.utils.random(a + 8, 100);
    const r = gsap.utils.random(2, 7);
    tl.set(el, {
      clipPath: `inset(${a}% 0 ${100 - b}% 0)`,
      skewX: gsap.utils.random(-14, 14),
      textShadow: `${r}px 0 rgb(0 240 255), ${-r}px 0 rgb(255 42 109)`,
    }).to({}, { duration: gsap.utils.random(0.03, 0.07) });
  }
  tl.set(el, { skewX: 0, textShadow: "none" }).set(el, { clearProps: "clipPath" });
  return tl;
};

export const SCRAMBLE_CHARS = "01<>/\\|[]{}#$%&*+=-";

// read a theme colour token as an rgba() string GSAP can tween (works in both cyberpunk modes)
export const cv = (name, a = 1) => {
  const v = getComputedStyle(document.documentElement).getPropertyValue(`--${name}`).trim().split(/\s+/);
  return `rgba(${v[0]}, ${v[1]}, ${v[2]}, ${a})`;
};
