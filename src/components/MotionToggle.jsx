import { useMotion } from "../context/Motion";

// Reduce-motion switch: stops smooth scroll, parallax, pinning, looping effects and transitions.
const MotionToggle = () => {
  const { reduced, toggleMotion } = useMotion();
  return (
    <button
      onClick={toggleMotion}
      aria-pressed={reduced}
      aria-label={reduced ? "Motion is reduced. Turn full motion on" : "Reduce motion"}
      data-cursor={reduced ? "Motion off" : "Motion on"}
      className="relative grid h-10 w-10 place-items-center rounded-full border hairline text-fg transition-colors hover:bg-fg/10"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
        {reduced ? (
          <path d="M3 12h18" />
        ) : (
          <path d="M2 12c2.5-6 5-6 7.5 0s5 6 7.5 0 3-3 5-3" />
        )}
      </svg>
      {reduced && <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-accent" />}
    </button>
  );
};

export default MotionToggle;
