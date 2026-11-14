import { useBuilder } from "../context/Builder";
import { useMotion } from "../context/Motion";

// Builder mode switch. Builder mode is a secret (a cheat code switches it on), so this button only exists while it is on:
// press it to switch Builder mode off, and it disappears again.
const BuilderToggle = () => {
  const { builder, toggleBuilder } = useBuilder();
  const { reduced } = useMotion();
  const on = builder && !reduced;
  if (!builder) return null;
  return (
    <button
      onClick={toggleBuilder}
      aria-pressed={on}
      aria-label={reduced ? "Builder mode needs full motion" : on ? "Builder mode is on. Turn it off" : "Turn builder mode on"}
      data-cursor={on ? "Builder on" : "Builder mode"}
      className="relative grid h-10 w-10 place-items-center rounded-full border hairline text-fg transition-colors hover:bg-fg/10"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="4" width="14" height="11" rx="2" strokeDasharray="3 2.5" />
        <path d="M13.5 11.5l7 3-3.2 1.2-1.3 3.3-2.5-7.5z" fill="currentColor" />
      </svg>
      {on && <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-accent" />}
    </button>
  );
};

export default BuilderToggle;
