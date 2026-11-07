import { gsap, prefersReducedMotion } from "./gsap";

// One shared stack for every small pill (cheat toasts and "secret unlocked" toasts), so several can be on screen
// at once without covering each other. Newest sits on top, the oldest at the bottom.
let stack = null;
const getStack = () => {
  if (!stack || !stack.isConnected) {
    stack = document.createElement("div");
    stack.style.cssText = "position:fixed;left:0;right:0;bottom:1.75rem;z-index:107;display:flex;flex-direction:column-reverse;align-items:center;gap:.6rem;pointer-events:none;";
    document.body.appendChild(stack);
  }
  return stack;
};

export const showToast = (pill, ms) => {
  pill.setAttribute("role", "status");
  getStack().appendChild(pill);
  const remove = () => pill.remove();
  if (prefersReducedMotion()) {
    setTimeout(remove, ms);
    return;
  }
  gsap.fromTo(pill, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: "power3.out" });
  // plain timeout, not a gsap delay: bullet time slows the global gsap clock
  setTimeout(() => gsap.to(pill, { y: 20, opacity: 0, duration: 0.35, onComplete: remove }), ms);
};

// a plain message pill (same look as the "secret unlocked" one)
export const notice = (text, ms = 3600) => {
  const pill = document.createElement("div");
  pill.style.cssText = "padding:.7rem 1.3rem;border-radius:999px;border:1px solid rgb(var(--accent2));background:rgb(var(--surface) / .94);color:rgb(var(--fg));font-family:var(--font-mono);font-size:11px;letter-spacing:.18em;text-transform:uppercase;text-align:center;max-width:min(92vw,560px);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);";
  pill.textContent = text;
  showToast(pill, ms);
};
