import { gsap, prefersReducedMotion } from "./gsap";
import { blip } from "./sound";
import { cv } from "./cyber";
import { stack } from "../data";

// Typed cheat codes (type the word anywhere outside an input). The classic Konami arrows live in Konami.jsx.
//   iddqd     god mode: glowing shield edge
//   idkfa     all keys: the whole tech stack rains down
//   hadouken  fireball across the screen
//   party     confetti cannons
//   disco     colour-shifting tint + sweeping spotlights
//   snake     playable snake game (esc to quit)
//
// Every effect lives in its own fixed overlay that is removed afterwards, so it never touches the page's own
// animations. With reduced motion the effects are skipped and only the small toast is shown (snake still plays).

const rgb = (name, a) => `rgb(var(${name})${a === undefined ? "" : ` / ${a}`})`;
const rand = gsap.utils.random;
let busy = false;

const layer = (z = 105) => {
  const el = document.createElement("div");
  el.setAttribute("aria-hidden", "true");
  el.style.cssText = `position:fixed;inset:0;z-index:${z};pointer-events:none;overflow:hidden;font-family:var(--font-mono);`;
  document.body.appendChild(el);
  return el;
};

const bigText = (parent, text, extra = "") => {
  const t = document.createElement("div");
  t.textContent = text;
  t.style.cssText = `position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);white-space:nowrap;font-family:var(--font-display);font-weight:800;font-size:clamp(2rem,9vw,8rem);letter-spacing:-.01em;color:${rgb("--accent")};text-shadow:4px 0 ${rgb("--accent2")},-4px 0 ${rgb("--accent3")};${extra}`;
  parent.appendChild(t);
  return t;
};

// small pill at the bottom of the screen
const toast = (title, sub, ms = 2800) => {
  const wrap = document.createElement("div");
  wrap.setAttribute("role", "status");
  wrap.style.cssText = "position:fixed;left:0;right:0;bottom:1.75rem;z-index:106;display:flex;justify-content:center;pointer-events:none;";
  const pill = document.createElement("div");
  pill.style.cssText = `padding:.7rem 1.3rem;border-radius:999px;border:1px solid ${rgb("--accent")};background:${rgb("--surface", 0.92)};color:${rgb("--fg")};font-family:var(--font-mono);font-size:11px;letter-spacing:.22em;text-transform:uppercase;white-space:nowrap;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);`;
  pill.innerHTML = `<span style="color:${rgb("--accent")}">${title}</span><span style="opacity:.6"> / ${sub}</span>`;
  wrap.appendChild(pill);
  document.body.appendChild(wrap);
  if (prefersReducedMotion()) {
    setTimeout(() => wrap.remove(), ms);
    return;
  }
  gsap.fromTo(pill, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: "power3.out" });
  gsap.to(pill, { y: 20, opacity: 0, duration: 0.35, delay: ms / 1000, onComplete: () => wrap.remove() });
};

// shared wrapper: one effect at a time, skipped (toast only) when motion is reduced
const effect = (title, sub, play, ms = 2800) => () => {
  if (busy) return;
  busy = true;
  const finish = () => { busy = false; };
  toast(title, sub, ms);
  if (prefersReducedMotion()) {
    setTimeout(finish, ms);
    return;
  }
  play(finish);
};

// ---- iddqd: god mode ----
const iddqd = effect("God mode", "iddqd", (finish) => {
  blip.success();
  const l = layer();
  const glow = document.createElement("div");
  glow.style.cssText = `position:absolute;inset:0;box-shadow:inset 0 0 140px 30px ${rgb("--accent", 0.55)};border:2px solid ${rgb("--accent", 0.6)};`;
  l.appendChild(glow);
  const t = bigText(l, "GOD MODE");
  gsap.timeline({ onComplete: () => { l.remove(); finish(); } })
    .fromTo(glow, { opacity: 0 }, { opacity: 1, duration: 0.3 })
    .fromTo(t, { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(3)" }, 0)
    .to(t, { opacity: 0, y: -40, duration: 0.5, ease: "power2.in" }, 1.1)
    .to(glow, { opacity: 0.35, duration: 0.5, yoyo: true, repeat: 5, ease: "sine.inOut" }, 0.3)
    .to(glow, { opacity: 0, duration: 0.6 }, 3.8);
}, 3600);

// ---- idkfa: all keys (the tech stack falls from the sky) ----
const idkfa = effect("All keys acquired", "idkfa", (finish) => {
  blip.on();
  const l = layer();
  const chips = [...stack, ...stack].map((s, i) => {
    const c = document.createElement("div");
    c.textContent = s.name;
    c.style.cssText = `position:absolute;top:0;left:${rand(2, 86)}%;padding:.5rem .9rem;border:1px solid ${rgb(["--accent", "--accent2", "--accent3"][i % 3])};border-radius:.75rem;background:${rgb("--surface", 0.95)};color:${rgb("--fg")};font-size:12px;letter-spacing:.15em;text-transform:uppercase;white-space:nowrap;`;
    l.appendChild(c);
    return c;
  });
  const t = bigText(l, "ALL KEYS");
  gsap.timeline({ onComplete: () => { l.remove(); finish(); } })
    .fromTo(chips, { y: -80, rotate: () => rand(-25, 25) }, { y: () => window.innerHeight + 80, rotate: () => rand(-60, 60), duration: () => rand(1.4, 2.6), ease: "power2.in", stagger: { each: 0.06, from: "random" } }, 0)
    .fromTo(t, { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(3)" }, 0.1)
    .to(t, { opacity: 0, duration: 0.5 }, 1.8);
}, 4200);

// ---- hadouken ----
const hadouken = effect("Hadouken!", "fireball", (finish) => {
  blip.open();
  const l = layer();
  const ball = document.createElement("div");
  ball.style.cssText = `position:absolute;left:0;top:50%;width:170px;height:170px;margin-top:-85px;border-radius:50%;background:radial-gradient(circle, ${rgb("--accent")} 0%, ${rgb("--accent2")} 38%, ${rgb("--accent2", 0)} 70%);box-shadow:0 0 90px 30px ${rgb("--accent2", 0.55)};`;
  const tail = document.createElement("div");
  tail.style.cssText = `position:absolute;right:50%;top:50%;width:520px;height:60px;margin-top:-30px;border-radius:50%;background:linear-gradient(90deg, ${rgb("--accent2", 0)}, ${rgb("--accent2", 0.75)});`;
  ball.appendChild(tail);
  l.appendChild(ball);
  const t = bigText(l, "HADOUKEN!", "top:22%;");
  gsap.timeline({ onComplete: () => { l.remove(); finish(); } })
    .fromTo(t, { scale: 0.4, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(3)" }, 0)
    .fromTo(ball, { x: -700, scale: 0.4 }, { x: window.innerWidth + 300, scale: 1.2, duration: 1.1, ease: "power2.in" }, 0.25)
    .to(t, { opacity: 0, duration: 0.4 }, 1.2);
}, 2200);

// ---- party: confetti cannons from both bottom corners ----
const party = effect("Party time", "party", (finish) => {
  blip.success();
  const l = layer();
  const colors = ["--accent", "--accent2", "--accent3"];
  const w = window.innerWidth;
  const h = window.innerHeight;
  const pieces = Array.from({ length: 150 }, (_, i) => {
    const p = document.createElement("i");
    const left = i % 2 === 0;
    const round = Math.random() > 0.6;
    p.style.cssText = `position:absolute;bottom:0;${left ? "left" : "right"}:0;width:${round ? 8 : rand(6, 11)}px;height:${round ? 8 : rand(10, 18)}px;border-radius:${round ? "50%" : "2px"};background:${rgb(colors[i % 3])};`;
    l.appendChild(p);
    const dx = (left ? 1 : -1) * rand(w * 0.1, w * 0.75);
    const peak = rand(h * 0.35, h * 0.95);
    const tl = gsap.timeline({ delay: rand(0, 0.25) });
    tl.to(p, { x: dx, duration: 2.6, ease: "power1.out" }, 0)
      .to(p, { y: -peak, duration: 0.8, ease: "power2.out" }, 0)
      .to(p, { y: 60, duration: 1.8, ease: "power1.in" }, 0.8)
      .to(p, { rotateX: rand(360, 1080), rotateZ: rand(-540, 540), duration: 2.6, ease: "none" }, 0)
      .to(p, { opacity: 0, duration: 0.5 }, 2.3);
    return tl;
  });
  gsap.delayedCall(3.2, () => { pieces.forEach((tl) => tl.kill()); l.remove(); finish(); });
}, 3400);

// ---- disco: colour-shifting tint and sweeping spotlights ----
const disco = effect("Disco mode", "disco", (finish) => {
  blip.glitch();
  const l = layer();
  const tint = document.createElement("div");
  tint.style.cssText = "position:absolute;inset:0;backdrop-filter:hue-rotate(0deg) saturate(1.5);-webkit-backdrop-filter:hue-rotate(0deg) saturate(1.5);";
  l.appendChild(tint);
  const beams = ["--accent", "--accent2", "--accent3"].map((c, i) => {
    const b = document.createElement("div");
    b.style.cssText = `position:absolute;left:${15 + i * 35}%;top:100%;width:220vmax;height:220vmax;margin:-110vmax 0 0 -110vmax;background:conic-gradient(from -6deg, ${rgb(c, 0)} 0deg, ${rgb(c, 0.5)} 6deg, ${rgb(c, 0)} 12deg, ${rgb(c, 0)} 360deg);mix-blend-mode:screen;`;
    l.appendChild(b);
    return b;
  });
  const t = bigText(l, "DISCO", "top:20%;");
  gsap.timeline({ onComplete: () => { l.remove(); finish(); } })
    .fromTo(tint, { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0)
    .to(tint, { backdropFilter: "hue-rotate(720deg) saturate(1.8)", webkitBackdropFilter: "hue-rotate(720deg) saturate(1.8)", duration: 5.5, ease: "none" }, 0)
    .fromTo(beams, { rotate: -38 }, { rotate: 38, duration: 0.9, ease: "sine.inOut", yoyo: true, repeat: 3, stagger: 0.18 }, 0)
    .fromTo(t, { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(3)" }, 0.1)
    .to(t, { opacity: 0, duration: 0.5 }, 1.6)
    .to([tint, ...beams], { opacity: 0, duration: 0.6 }, 5.2);
}, 5600);

// ---- snake: small playable game, esc / q to quit ----
let snakeOn = false;
const snake = () => {
  if (snakeOn || busy) return;
  snakeOn = true;
  blip.on();
  const N = 20;
  const cell = Math.max(10, Math.floor(Math.min(440, window.innerWidth - 32, window.innerHeight - 200) / N));
  const px = cell * N;
  const best0 = (() => { try { return Number(localStorage.getItem("snake-best")) || 0; } catch { return 0; } })();
  let best = best0;

  const root = document.createElement("div");
  root.setAttribute("role", "dialog");
  root.setAttribute("aria-label", "Snake game");
  root.style.cssText = `position:fixed;inset:0;z-index:106;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;background:${rgb("--bg", 0.88)};backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);font-family:var(--font-mono);color:${rgb("--fg")};touch-action:none;`;
  const head = document.createElement("div");
  head.style.cssText = "font-size:12px;letter-spacing:.25em;text-transform:uppercase;";
  const canvas = document.createElement("canvas");
  canvas.width = px;
  canvas.height = px;
  canvas.style.cssText = `width:${px}px;height:${px}px;border:1px solid ${rgb("--accent", 0.5)};background:${rgb("--surface")};`;
  const hint = document.createElement("div");
  hint.style.cssText = `font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:${rgb("--muted")};`;
  hint.textContent = "arrows / wasd / swipe  ·  esc to quit";
  root.append(head, canvas, hint);
  document.body.appendChild(root);
  const g = canvas.getContext("2d");

  let snakeBody, dir, next, food, score, dead, timer;
  const place = () => {
    do { food = { x: Math.floor(Math.random() * N), y: Math.floor(Math.random() * N) }; }
    while (snakeBody.some((s) => s.x === food.x && s.y === food.y));
  };
  const reset = () => {
    snakeBody = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
    dir = { x: 1, y: 0 }; next = dir; score = 0; dead = false;
    place();
  };
  const draw = () => {
    g.clearRect(0, 0, px, px);
    g.fillStyle = cv("accent3");
    g.fillRect(food.x * cell + 2, food.y * cell + 2, cell - 4, cell - 4);
    snakeBody.forEach((s, i) => {
      g.fillStyle = i === 0 ? cv("accent2") : cv("accent");
      g.fillRect(s.x * cell + 1, s.y * cell + 1, cell - 2, cell - 2);
    });
    head.innerHTML = `snake  <span style="color:${rgb("--accent")}">${score}</span>  /  best ${best}`;
    if (dead) {
      g.fillStyle = cv("bg", 0.7);
      g.fillRect(0, 0, px, px);
      g.fillStyle = cv("fg");
      g.textAlign = "center";
      g.font = `${Math.max(12, cell)}px monospace`;
      g.fillText("GAME OVER", px / 2, px / 2 - 4);
      g.font = `${Math.max(9, cell * 0.6)}px monospace`;
      g.fillText("space / tap to retry", px / 2, px / 2 + cell);
    }
  };
  const tick = () => {
    if (dead) return;
    dir = next;
    const h = { x: (snakeBody[0].x + dir.x + N) % N, y: (snakeBody[0].y + dir.y + N) % N };
    if (snakeBody.some((s) => s.x === h.x && s.y === h.y)) {
      dead = true;
      blip.error();
      if (score > best) { best = score; try { localStorage.setItem("snake-best", String(best)); } catch { /* private mode */ } }
      draw();
      return;
    }
    snakeBody.unshift(h);
    if (h.x === food.x && h.y === food.y) { score++; blip.click(); place(); } else snakeBody.pop();
    draw();
    timer = setTimeout(tick, Math.max(60, 120 - score * 3));
  };
  const start = () => { clearTimeout(timer); reset(); draw(); timer = setTimeout(tick, 400); };

  const turn = (x, y) => { if (x !== -dir.x || y !== -dir.y) next = { x, y }; };
  const DIRS = { ArrowUp: [0, -1], w: [0, -1], ArrowDown: [0, 1], s: [0, 1], ArrowLeft: [-1, 0], a: [-1, 0], ArrowRight: [1, 0], d: [1, 0] };
  const quit = () => {
    clearTimeout(timer);
    window.removeEventListener("keydown", onKey, true);
    root.remove();
    snakeOn = false;
  };
  function onKey(e) {
    e.stopPropagation(); // keep the page, the smooth scroller and the other cheat listeners out of it
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (k === "Escape" || k === "q") return quit();
    if (DIRS[k]) { e.preventDefault(); turn(...DIRS[k]); return; }
    if ((k === " " || k === "Enter") && dead) { e.preventDefault(); start(); }
  }
  window.addEventListener("keydown", onKey, true);

  // touch: swipe to steer, tap to retry, and the page behind does not scroll
  root.addEventListener("wheel", (e) => { e.preventDefault(); e.stopPropagation(); }, { passive: false });
  let sx = 0, sy = 0;
  root.addEventListener("touchstart", (e) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  root.addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - sx;
    const dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) < 24 && Math.abs(dy) < 24) { if (dead) start(); return; }
    if (Math.abs(dx) > Math.abs(dy)) turn(dx > 0 ? 1 : -1, 0);
    else turn(0, dy > 0 ? 1 : -1);
  }, { passive: true });

  start();
};

export const CHEATS = { iddqd, idkfa, hadouken, party, disco, snake };
export const CHEAT_MAX_LEN = Math.max(...Object.keys(CHEATS).map((w) => w.length));
