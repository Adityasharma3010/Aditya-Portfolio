import { Suspense, lazy, useEffect, useState } from "react";

const CommandPalette = lazy(() => import("./CommandPalette"));

// opens the palette once it has loaded, for the case where the visitor asked for it before the chunk arrived
const Replay = () => {
  useEffect(() => {
    window.dispatchEvent(new Event("open-palette"));
  }, []);
  return null;
};

// The palette is not needed for first paint: load it when the browser is idle, or right away the first time
// someone presses Ctrl/Cmd+K or clicks Search (that first request is replayed once the code has arrived).
const PaletteGate = () => {
  const [on, setOn] = useState(false);
  const [replay, setReplay] = useState(false);

  useEffect(() => {
    if (on) return;
    const idle = window.requestIdleCallback || ((f) => setTimeout(f, 2000));
    const cancel = window.cancelIdleCallback || clearTimeout;
    const id = idle(() => setOn(true), { timeout: 5000 });
    const early = (e) => {
      if (e.type === "keydown") {
        if (!((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k")) return;
        e.preventDefault();
      }
      setReplay(true);
      setOn(true);
    };
    window.addEventListener("open-palette", early);
    window.addEventListener("keydown", early);
    return () => {
      cancel(id);
      window.removeEventListener("open-palette", early);
      window.removeEventListener("keydown", early);
    };
  }, [on]);

  if (!on) return null;
  return (
    <Suspense fallback={null}>
      <CommandPalette />
      {replay && <Replay />}
    </Suspense>
  );
};

export default PaletteGate;
