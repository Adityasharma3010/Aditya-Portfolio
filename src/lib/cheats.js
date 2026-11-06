import { gsap, prefersReducedMotion } from "./gsap";
import { blip } from "./sound";
import { cv } from "./cyber";
import { stack } from "../data";

// GTA style cheat codes. Each one can be typed as a word (anywhere outside an input) or entered with the arrow keys
// (U D L R). The matching happens in Konami.jsx, which also owns the cyberpunk / override cheat.
//
//   word       arrows (8)           what it does
//   iddqd      U D U D L L R R      god mode: glowing shield edge
//   idkfa      L R L R D D U U      all keys: the whole tech stack rains down
//   hadouken   D R D R L U L U      fireball across the screen
//   party      R R U U L L D D      confetti cannons
//   disco      L D R U L D R U      colour-shifting tint + sweeping spotlights
//   snake      R D L U R D L U      playable snake game (esc to quit)
//   hesoyam    U U R R D D L L      money rain
//   bullettime D D L L U U R R      the whole page goes slow motion
//   crt        U L D R U L D R      scanlines, vignette, rolling bar
//   warp       U D L R U D L R      hyperspace star streaks
//   flashlight R L R L U U D D      lights out, your cursor is the torch
//   fireworks  U L U L D R D R      fireworks
//   storm      D L D L U R U R      rain + lightning
//   snow       D D R R U U L L      snowfall
//   glitch     U R U R D L D L      the screen tears
//   pong       L L R R U D U D      playable pong (esc to quit)
//   sudo       D U D U L R L R      you are not in the sudoers file
//   hireme     R U U L D D R L      "let's work together" and jumps to the contact section
//   cyberpunk / override   U U D D L R L R   switch to Cyberpunk, and overdrive once you are in it
//
// All arrow combos have the same length, so none can be the tail end of another.
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
  // plain timeout, not a gsap delay: bullet time slows the global gsap clock
  setTimeout(() => gsap.to(pill, { y: 20, opacity: 0, duration: 0.35, onComplete: () => wrap.remove() }), ms);
};

// shared wrapper: one effect at a time, skipped (toast only) when motion is reduced
const effect = (title, sub, play, ms = 2800) => () => {
  if (busy) return false;
  busy = true;
  const finish = () => { busy = false; };
  toast(title, sub, ms);
  if (prefersReducedMotion()) {
    setTimeout(finish, ms);
    return true;
  }
  play(finish);
  return true;
};

// set by Konami.jsx so cheats can use the router / smooth scroller (hireme jumps to the contact section)
export const hooks = { jump: null };

// last pointer position, for the flashlight
const pointer = { x: typeof window === "undefined" ? 0 : window.innerWidth / 2, y: typeof window === "undefined" ? 0 : window.innerHeight / 2 };
if (typeof window !== "undefined") {
  window.addEventListener("pointermove", (e) => { pointer.x = e.clientX; pointer.y = e.clientY; }, { passive: true });
}

// full screen canvas driven by the gsap ticker; draw(g, w, h, t) gets t = 0..1 over `ms`
const canvasFx = (ms, draw, finish) => {
  const l = layer();
  const c = document.createElement("canvas");
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const w = window.innerWidth;
  const h = window.innerHeight;
  c.width = w * dpr;
  c.height = h * dpr;
  c.style.cssText = "position:absolute;inset:0;width:100%;height:100%;";
  l.appendChild(c);
  const g = c.getContext("2d");
  g.scale(dpr, dpr);
  const t0 = performance.now();
  const tick = () => {
    const t = (performance.now() - t0) / ms;
    if (t >= 1) {
      gsap.ticker.remove(tick);
      l.remove();
      finish();
      return;
    }
    g.clearRect(0, 0, w, h);
    draw(g, w, h, t);
  };
  gsap.ticker.add(tick);
  return l;
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
let pongOn = false;
const snake = () => {
  if (snakeOn || pongOn || busy) return;
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


// ---- hesoyam: money rain ----
const hesoyam = effect("Cheat activated", "hesoyam", (finish) => {
  blip.success();
  const l = layer();
  const h = window.innerHeight;
  const coins = Array.from({ length: 70 }, () => {
    const c = document.createElement("div");
    c.textContent = "$";
    c.style.cssText = `position:absolute;top:0;left:${rand(1, 96)}%;width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:14px;color:${rgb("--accent-ink")};background:radial-gradient(circle at 30% 30%, ${rgb("--fg", 0.9)}, ${rgb("--accent3")} 45%);border:2px solid ${rgb("--accent3")};`;
    l.appendChild(c);
    return c;
  });
  const amount = bigText(l, "$0", "top:42%;");
  const o = { v: 0 };
  gsap.timeline({ onComplete: () => { l.remove(); finish(); } })
    .fromTo(coins, { y: -60, rotateY: 0 }, { y: h + 60, rotateY: () => rand(360, 1080), duration: () => rand(1.6, 3), ease: "power1.in", stagger: { each: 0.03, from: "random" } }, 0)
    .fromTo(amount, { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(3)" }, 0.1)
    .to(o, { v: 250000, duration: 1.4, ease: "power2.out", onUpdate: () => { amount.textContent = `$${Math.round(o.v).toLocaleString("en-US")}`; } }, 0.1)
    .to(amount, { opacity: 0, y: -40, duration: 0.5 }, 2.6);
}, 3600);

// ---- bullettime: the whole page goes slow motion ----
const bullettime = effect("Bullet time", "bullettime", (finish) => {
  blip.open();
  const l = layer();
  const bar = (pos) => {
    const b = document.createElement("div");
    b.style.cssText = `position:absolute;left:0;right:0;${pos}:0;height:11vh;background:#000;`;
    l.appendChild(b);
    return b;
  };
  const vig = document.createElement("div");
  vig.style.cssText = `position:absolute;inset:0;background:radial-gradient(ellipse at center, transparent 45%, ${rgb("--accent2", 0.4)} 100%);`;
  l.appendChild(vig);
  const bars = [bar("top"), bar("bottom")];
  // WAAPI instead of gsap for the overlay, because gsap is the thing being slowed down
  bars[0].animate([{ transform: "translateY(-100%)" }, { transform: "none" }], { duration: 500, easing: "ease-out", fill: "forwards" });
  bars[1].animate([{ transform: "translateY(100%)" }, { transform: "none" }], { duration: 500, easing: "ease-out", fill: "forwards" });
  vig.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500, fill: "forwards" });
  const clock = gsap.globalTimeline;
  clock.timeScale(0.2);
  setTimeout(() => {
    [...bars, vig].forEach((el) => el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 600, fill: "forwards" }));
    const t0 = performance.now();
    const ramp = () => {
      const k = Math.min(1, (performance.now() - t0) / 700);
      clock.timeScale(0.2 + 0.8 * k);
      if (k < 1) requestAnimationFrame(ramp);
      else { l.remove(); finish(); }
    };
    ramp();
  }, 4500);
}, 4800);

// ---- crt: scanlines, vignette and a rolling bar ----
const crt = effect("CRT mode", "crt", (finish) => {
  blip.on();
  const l = layer();
  const mk = (css) => { const d = document.createElement("div"); d.style.cssText = `position:absolute;inset:0;${css}`; l.appendChild(d); return d; };
  const tint = mk("backdrop-filter:contrast(1.12) saturate(1.3);-webkit-backdrop-filter:contrast(1.12) saturate(1.3);");
  const lines = mk("background:repeating-linear-gradient(0deg, rgb(0 0 0 / .2) 0 1px, transparent 1px 3px);");
  const vig = mk("background:radial-gradient(ellipse at center, transparent 55%, rgb(0 0 0 / .55) 100%);");
  const roll = mk(`bottom:auto;height:18vh;background:linear-gradient(transparent, ${rgb("--fg", 0.08)}, transparent);`);
  gsap.timeline({ onComplete: () => { l.remove(); finish(); } })
    .fromTo([tint, lines, vig], { opacity: 0 }, { opacity: 1, duration: 0.4 }, 0)
    .fromTo(roll, { y: "-20vh" }, { y: () => window.innerHeight * 1.2, duration: 1.8, ease: "none", repeat: 3 }, 0)
    .to(lines, { opacity: 0.8, duration: 0.06, repeat: 80, yoyo: true, ease: "none" }, 0.4)
    .to([tint, lines, vig, roll], { opacity: 0, duration: 0.6 }, 6.4);
}, 7000);

// ---- warp: hyperspace star streaks ----
const warp = effect("Warp speed", "warp", (finish) => {
  blip.open();
  const stars = Array.from({ length: 280 }, (_, i) => ({ x: rand(-1, 1) * window.innerWidth, y: rand(-1, 1) * window.innerHeight, z: rand(0.05, 1), c: i % 3 }));
  const colors = [cv("accent"), cv("accent2"), cv("fg")];
  const l = canvasFx(4200, (g, w, h, t) => {
    const sp = 0.003 + 0.06 * Math.sin(Math.PI * t);
    g.lineCap = "round";
    stars.forEach((s) => {
      const pz = s.z;
      s.z -= sp;
      if (s.z <= 0.03) { s.x = rand(-1, 1) * w; s.y = rand(-1, 1) * h; s.z = 1; return; }
      const k = 0.35;
      g.strokeStyle = colors[s.c];
      g.lineWidth = 1 + (1 - s.z) * 2;
      g.globalAlpha = Math.min(1, (1 - s.z) * 1.6);
      g.beginPath();
      g.moveTo(w / 2 + (s.x / pz) * k, h / 2 + (s.y / pz) * k);
      g.lineTo(w / 2 + (s.x / s.z) * k, h / 2 + (s.y / s.z) * k);
      g.stroke();
    });
    g.globalAlpha = 1;
  }, finish);
  const t = bigText(l, "WARP SPEED", "top:22%;font-size:clamp(1.6rem,6vw,5rem);");
  gsap.timeline().fromTo(t, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(3)" }).to(t, { opacity: 0, duration: 0.5 }, 1.4);
}, 4400);

// ---- flashlight: lights out, your cursor is the torch ----
const flashlight = effect("Lights out", "flashlight", (finish) => {
  blip.close();
  const l = layer();
  const dark = document.createElement("div");
  dark.style.cssText = "position:absolute;inset:0;background:radial-gradient(circle var(--r, 0px) at var(--mx) var(--my), rgb(0 0 0 / 0) 0%, rgb(0 0 0 / 0) 40%, rgb(0 0 0 / .96) 100%);";
  l.appendChild(dark);
  const o = { r: 0 };
  const aim = () => { dark.style.setProperty("--mx", `${pointer.x}px`); dark.style.setProperty("--my", `${pointer.y}px`); };
  const setR = () => dark.style.setProperty("--r", `${o.r}px`);
  aim();
  window.addEventListener("pointermove", aim, { passive: true });
  gsap.timeline({ onComplete: () => { window.removeEventListener("pointermove", aim); l.remove(); finish(); } })
    .to(o, { r: 190, duration: 0.8, ease: "power2.out", onUpdate: setR }, 0)
    .to(o, { r: 172, duration: 0.07, repeat: 100, yoyo: true, ease: "none", onUpdate: setR }, 0.8)
    .to(dark, { opacity: 0, duration: 0.6 }, 8.4);
}, 9000);

// ---- fireworks ----
const fireworks = effect("Fireworks", "fireworks", (finish) => {
  blip.success();
  const l = layer();
  const cols = ["--accent", "--accent2", "--accent3"];
  const tl = gsap.timeline({ onComplete: () => { l.remove(); finish(); } });
  for (let b = 0; b < 7; b++) {
    const cx = rand(0.15, 0.85) * window.innerWidth;
    const cy = rand(0.15, 0.5) * window.innerHeight;
    const col = rgb(cols[b % 3]);
    const at = b * 0.55;
    for (let i = 0; i < 30; i++) {
      const p = document.createElement("i");
      p.style.cssText = `position:absolute;left:${cx}px;top:${cy}px;width:4px;height:4px;border-radius:50%;background:${col};box-shadow:0 0 8px ${col};opacity:0;`;
      l.appendChild(p);
      const a = (i / 30) * Math.PI * 2;
      const d = rand(90, 190);
      const ry = Math.sin(a) * d;
      tl.set(p, { opacity: 1, x: 0, y: 0 }, at)
        .to(p, { x: Math.cos(a) * d, duration: 1.1, ease: "power3.out" }, at)
        .to(p, { keyframes: [{ y: ry, duration: 0.6, ease: "power3.out" }, { y: ry + rand(60, 110), opacity: 0, duration: 0.9, ease: "power1.in" }] }, at);
    }
  }
}, 5200);

// ---- storm: rain and two lightning flashes ----
const storm = effect("Storm", "storm", (finish) => {
  blip.glitch();
  const drops = Array.from({ length: 170 }, () => ({ x: rand(-100, window.innerWidth + 100), y: rand(-window.innerHeight, 0), v: rand(900, 1500), len: rand(14, 28) }));
  const col = cv("fg", 0.5);
  let last = performance.now();
  canvasFx(7000, (g, w, h, t) => {
    const now = performance.now();
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    g.fillStyle = `rgba(0,0,0,${0.28 * Math.sin(Math.PI * t)})`;
    g.fillRect(0, 0, w, h);
    g.strokeStyle = col;
    g.lineWidth = 1;
    g.beginPath();
    drops.forEach((d) => {
      d.y += d.v * dt;
      d.x -= d.v * dt * 0.25;
      if (d.y > h + 30) { d.y = -30; d.x = rand(0, w + 120); }
      g.moveTo(d.x, d.y);
      g.lineTo(d.x + d.len * 0.25, d.y - d.len);
    });
    g.stroke();
    if ((t > 0.22 && t < 0.235) || (t > 0.245 && t < 0.255) || (t > 0.6 && t < 0.615)) {
      g.fillStyle = "rgba(255,255,255,.35)";
      g.fillRect(0, 0, w, h);
    }
  }, finish);
}, 7200);

// ---- snow ----
const snow = effect("Let it snow", "snow", (finish) => {
  const l = layer();
  const h = window.innerHeight;
  const flakes = Array.from({ length: 90 }, () => {
    const f = document.createElement("i");
    const sz = rand(3, 7);
    f.style.cssText = `position:absolute;top:0;left:${rand(0, 98)}%;width:${sz}px;height:${sz}px;border-radius:50%;background:${rgb("--accent2", 0.85)};box-shadow:0 0 6px ${rgb("--accent2", 0.6)};`;
    l.appendChild(f);
    return f;
  });
  gsap.timeline({ onComplete: () => { l.remove(); finish(); } })
    .fromTo(flakes, { y: -20 }, { y: h + 20, duration: () => rand(4, 7), ease: "none", stagger: { each: 0.03, from: "random" } }, 0)
    .to(flakes, { x: () => rand(-60, 60), duration: () => rand(2, 3), ease: "sine.inOut", yoyo: true, repeat: 1, stagger: { each: 0.03, from: "random" } }, 0);
}, 3000);

// ---- glitch: the screen tears for a moment ----
const glitch = effect("Glitch", "glitch", (finish) => {
  blip.glitch();
  const l = layer();
  const cols = ["--accent", "--accent2", "--accent3"];
  const bars = Array.from({ length: 12 }, (_, i) => {
    const b = document.createElement("div");
    b.style.cssText = i % 2 ? `position:absolute;left:0;right:0;top:0;background:${rgb("--fg")};mix-blend-mode:difference;` : `position:absolute;left:0;right:0;top:0;background:${rgb(cols[(i / 2) % 3 | 0], 0.45)};mix-blend-mode:screen;`;
    l.appendChild(b);
    return b;
  });
  const tl = gsap.timeline({ onComplete: () => { l.remove(); finish(); } });
  for (let i = 0; i < 14; i++) tl.set(bars, { y: () => rand(0, window.innerHeight), height: () => rand(4, 90), x: () => rand(-40, 40), opacity: () => rand(0.3, 1) }, i * 0.14);
  tl.set(bars, { opacity: 0 }, 14 * 0.14);
}, 2400);

// ---- sudo ----
const sudo = effect("sudo", "you are not in the sudoers file. this incident will be reported", (finish) => { finish(); }, 4200);

// ---- hireme: confetti-free, just straight to the point ----
const hiremeFx = effect("Great choice", "hireme", (finish) => {
  blip.success();
  const l = layer();
  const t = bigText(l, "LET'S WORK TOGETHER", "font-size:clamp(1.6rem,6.5vw,5.5rem);");
  gsap.timeline({ onComplete: () => { l.remove(); finish(); } })
    .fromTo(t, { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(3)" })
    .to(t, { opacity: 0, duration: 0.5 }, 1.3);
}, 2600);
const hireme = () => {
  if (hiremeFx()) setTimeout(() => hooks.jump?.("contact"), prefersReducedMotion() ? 300 : 900);
};

// ---- pong: you (left) against a slightly dim computer, first to 5 ----
const pong = () => {
  if (pongOn || snakeOn || busy) return;
  pongOn = true;
  blip.on();
  const W = Math.max(260, Math.min(640, window.innerWidth - 32));
  const H = Math.round(W * 0.6);
  const PH = Math.round(H * 0.22);
  const PW = 8;
  const M = 12;
  const R = 6;

  const root = document.createElement("div");
  root.setAttribute("role", "dialog");
  root.setAttribute("aria-label", "Pong game");
  root.style.cssText = `position:fixed;inset:0;z-index:106;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;background:${rgb("--bg", 0.88)};backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);font-family:var(--font-mono);color:${rgb("--fg")};touch-action:none;`;
  const head = document.createElement("div");
  head.style.cssText = "font-size:12px;letter-spacing:.25em;text-transform:uppercase;";
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  canvas.style.cssText = `width:${W}px;height:${H}px;border:1px solid ${rgb("--accent", 0.5)};background:${rgb("--surface")};touch-action:none;`;
  const hint = document.createElement("div");
  hint.style.cssText = `font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:${rgb("--muted")};`;
  hint.textContent = "mouse / touch / w s / arrows  ·  first to 5  ·  esc to quit";
  root.append(head, canvas, hint);
  document.body.appendChild(root);
  const g = canvas.getContext("2d");

  let me, cpu, ball, mine, theirs, over, serveAt, raf, last;
  const keys = {};
  const serve = (dir) => {
    const a = rand(-0.5, 0.5);
    ball = { x: W / 2, y: H / 2, vx: Math.cos(a) * 320 * dir, vy: Math.sin(a) * 320 };
    serveAt = performance.now() + 700;
  };
  const reset = () => { me = H / 2; cpu = H / 2; mine = 0; theirs = 0; over = null; serve(Math.random() > 0.5 ? 1 : -1); };
  const clamp = (v) => Math.max(PH / 2, Math.min(H - PH / 2, v));

  const draw = () => {
    g.clearRect(0, 0, W, H);
    g.fillStyle = cv("fg", 0.15);
    for (let y = 6; y < H; y += 18) g.fillRect(W / 2 - 1, y, 2, 9);
    g.fillStyle = cv("accent");
    g.fillRect(M, me - PH / 2, PW, PH);
    g.fillStyle = cv("accent2");
    g.fillRect(W - M - PW, cpu - PH / 2, PW, PH);
    g.fillStyle = cv("accent3");
    g.beginPath();
    g.arc(ball.x, ball.y, R, 0, Math.PI * 2);
    g.fill();
    head.innerHTML = `you <span style="color:${rgb("--accent")}">${mine}</span>  :  <span style="color:${rgb("--accent2")}">${theirs}</span> cpu`;
    if (over) {
      g.fillStyle = cv("bg", 0.7);
      g.fillRect(0, 0, W, H);
      g.fillStyle = cv("fg");
      g.textAlign = "center";
      g.font = `${Math.max(14, W / 18)}px monospace`;
      g.fillText(over === "me" ? "YOU WIN" : "YOU LOSE", W / 2, H / 2 - 4);
      g.font = `${Math.max(9, W / 40)}px monospace`;
      g.fillText("space / tap to retry", W / 2, H / 2 + W / 20);
    }
  };

  const step = (now) => {
    raf = requestAnimationFrame(step);
    const dt = Math.min(0.04, (now - last) / 1000);
    last = now;
    if (!over) {
      if (keys.ArrowUp || keys.w) me = clamp(me - 420 * dt);
      if (keys.ArrowDown || keys.s) me = clamp(me + 420 * dt);
      if (now >= serveAt) {
        ball.x += ball.vx * dt;
        ball.y += ball.vy * dt;
        if (ball.y < R || ball.y > H - R) { ball.vy *= -1; ball.y = Math.max(R, Math.min(H - R, ball.y)); }
        // computer: only chases when the ball comes its way, and is a bit slow
        const target = ball.vx > 0 ? ball.y : H / 2;
        cpu = clamp(cpu + Math.max(-300 * dt, Math.min(300 * dt, target - cpu)));
        const hit = (px, py) => Math.abs(ball.y - py) < PH / 2 + R && Math.abs(ball.x - px) < PW / 2 + R;
        if (ball.vx < 0 && hit(M + PW / 2, me)) {
          ball.vx = Math.min(760, Math.abs(ball.vx) * 1.07);
          ball.vy += ((ball.y - me) / (PH / 2)) * 200;
          ball.x = M + PW + R;
          blip.key();
        } else if (ball.vx > 0 && hit(W - M - PW / 2, cpu)) {
          ball.vx = -Math.min(760, Math.abs(ball.vx) * 1.07);
          ball.vy += ((ball.y - cpu) / (PH / 2)) * 200;
          ball.x = W - M - PW - R;
          blip.key();
        }
        if (ball.x < -R) { theirs++; blip.error(); if (theirs >= 5) over = "cpu"; else serve(1); }
        if (ball.x > W + R) { mine++; blip.click(); if (mine >= 5) over = "me"; else serve(-1); }
      }
    }
    draw();
  };

  const quit = () => {
    cancelAnimationFrame(raf);
    window.removeEventListener("keydown", onKey, true);
    window.removeEventListener("keyup", onKeyUp, true);
    root.remove();
    pongOn = false;
  };
  function onKey(e) {
    e.stopPropagation();
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (k === "Escape" || k === "q") return quit();
    if (k === "ArrowUp" || k === "ArrowDown" || k === "w" || k === "s") { e.preventDefault(); keys[k] = true; return; }
    if ((k === " " || k === "Enter") && over) { e.preventDefault(); reset(); }
  }
  function onKeyUp(e) {
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    keys[k] = false;
  }
  window.addEventListener("keydown", onKey, true);
  window.addEventListener("keyup", onKeyUp, true);
  root.addEventListener("wheel", (e) => { e.preventDefault(); e.stopPropagation(); }, { passive: false });
  root.addEventListener("pointermove", (e) => {
    const r = canvas.getBoundingClientRect();
    me = clamp(((e.clientY - r.top) / r.height) * H);
  });
  root.addEventListener("pointerdown", () => { if (over) reset(); });

  reset();
  last = performance.now();
  raf = requestAnimationFrame(step);
};

export const CHEATS = { iddqd, idkfa, hadouken, party, disco, snake, hesoyam, bullettime, crt, warp, flashlight, fireworks, storm, snow, glitch, pong, sudo, hireme };
export const CHEAT_ARROWS = {
  iddqd: "UDUDLLRR",
  idkfa: "LRLRDDUU",
  hadouken: "DRDRLULU",
  party: "RRUULLDD",
  disco: "LDRULDRU",
  snake: "RDLURDLU",
  hesoyam: "UURRDDLL",
  bullettime: "DDLLUURR",
  crt: "ULDRULDR",
  warp: "UDLRUDLR",
  flashlight: "RLRLUUDD",
  fireworks: "ULULDRDR",
  storm: "DLDLURUR",
  snow: "DDRRUULL",
  glitch: "URURDLDL",
  pong: "LLRRUDUD",
  sudo: "DUDULRLR",
  hireme: "RUULDDRL",
};
