import { gsap, prefersReducedMotion } from "./gsap";
import { blip } from "./sound";

const GLYPHS = "01アイウエオカキクケコサシスセソ<>/{}[]#$%".split("");
let running = false;

// Konami / `override` easter egg: the whole screen goes haywire for a few seconds, then recovers.
export const overdrive = (message = "OVERRIDE ACCEPTED") => {
  if (running) return;
  running = true;
  blip.glitch();
  const reduce = prefersReducedMotion();

  const layer = document.createElement("div");
  layer.style.cssText =
    "position:fixed;inset:0;z-index:105;pointer-events:none;overflow:hidden;font-family:var(--font-mono);";
  document.body.appendChild(layer);

  const title = document.createElement("div");
  title.textContent = message;
  title.style.cssText =
    "position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);white-space:nowrap;font-family:var(--font-display);font-weight:700;font-size:clamp(2rem,9vw,8rem);letter-spacing:-.01em;color:rgb(var(--accent));text-shadow:4px 0 rgb(var(--accent2)),-4px 0 rgb(var(--accent3));mix-blend-mode:normal;";
  layer.appendChild(title);

  if (reduce) {
    gsap.fromTo(
      title,
      { opacity: 0 },
      {
        opacity: 1,
        duration: 0.2,
        yoyo: true,
        repeat: 1,
        repeatDelay: 1.2,
        onComplete: done,
      },
    );
    return;
  }

  // colour-shifting tint over everything (backdrop filter, so layout and pinned sections are untouched)
  const tint = document.createElement("div");
  tint.style.cssText =
    "position:absolute;inset:0;backdrop-filter:hue-rotate(0deg) saturate(1.4);-webkit-backdrop-filter:hue-rotate(0deg) saturate(1.4);";
  layer.appendChild(tint);

  // falling glyph columns
  const cols = Math.ceil(window.innerWidth / 26);
  const columns = [];
  for (let i = 0; i < cols; i++) {
    const c = document.createElement("div");
    c.textContent = Array.from(
      { length: 40 },
      () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
    ).join("\n");
    c.style.cssText = `position:absolute;left:${i * 26}px;top:0;white-space:pre;font-size:16px;line-height:1.1;color:rgb(var(--accent2));text-shadow:0 0 8px rgb(var(--accent2));opacity:0;`;
    layer.appendChild(c);
    columns.push(c);
  }

  const tl = gsap.timeline({ onComplete: done });
  tl.to(
    columns,
    { opacity: 0.85, duration: 0.3, stagger: { each: 0.01, from: "random" } },
    0,
  )
    .fromTo(
      columns,
      { y: "-100%" },
      {
        y: "100vh",
        duration: () => gsap.utils.random(1.4, 2.8),
        ease: "none",
        stagger: { each: 0.015, from: "random" },
        repeat: 1,
      },
      0,
    )
    .to(
      tint,
      {
        backdropFilter: "hue-rotate(360deg) saturate(2)",
        webkitBackdropFilter: "hue-rotate(360deg) saturate(2)",
        duration: 3.2,
        ease: "none",
      },
      0,
    )
    .fromTo(
      title,
      { scale: 0.6, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.35, ease: "back.out(3)" },
      0.1,
    )
    .to(
      title,
      {
        x: () => gsap.utils.random(-30, 30),
        skewX: () => gsap.utils.random(-12, 12),
        duration: 0.05,
        repeat: 40,
        yoyo: true,
        ease: "none",
        repeatRefresh: true,
      },
      0.5,
    )
    .to([columns, title, tint], { opacity: 0, duration: 0.6 }, 3.4);

  function done() {
    layer.remove();
    running = false;
  }
};
