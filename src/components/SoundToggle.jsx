import { toggleSound, useSound } from "../lib/sound";

// Cyberpunk UI blips on/off. Only shown in the cyberpunk theme.
const SoundToggle = () => {
  const on = useSound();
  return (
    <button
      onClick={toggleSound}
      aria-pressed={on}
      aria-label={on ? "Mute UI sounds" : "Turn UI sounds on"}
      data-cursor={on ? "Sound on" : "Sound off"}
      className="relative grid h-10 w-10 place-items-center rounded-full border hairline text-fg transition-colors hover:bg-fg/10"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M11 5 6 9H3v6h3l5 4z" />
        {on ? <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" /> : <path d="m16 9 5 6m0-6-5 6" />}
      </svg>
    </button>
  );
};

export default SoundToggle;
