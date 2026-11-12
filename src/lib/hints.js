import { unlock } from "./achievements";

// Quiet hints for people who go looking. Nothing here says "cheat code" out loud.
export const consoleHint = () => {
  if (typeof window === "undefined" || typeof console === "undefined") return;
  // easter egg: run hireMe() in the console
  window.hireMe = () => {
    unlock("console");
    console.log("%cGood eye. The contact form is at https://adityasharma.site/#contact, or just say hi.", "color:#c8ff3d;background:#0b0b0d;padding:3px 8px;border-radius:4px");
    return "see you at #contact";
  };
  console.log(
    "%cpsst.%c the neon side is locked. 30 lives. 1986.",
    "color:#c8ff3d;background:#0b0b0d;padding:3px 8px;border-radius:4px;font-weight:700",
    "color:inherit"
  );
  console.log("%c...and since you read the console: try hireMe()", "opacity:.7");
  console.log("%cwhat breaks gets written down. plural. one slash from home.", "opacity:.45");
};
