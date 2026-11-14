import { createContext, useCallback, useContext, useState } from "react";
import { useMotion } from "./Motion";
import { notice } from "../lib/toasts";

const BuilderContext = createContext(null);
const KEY = "builder";

// Builder mode: a little editor (Elements + Styles panels) builds the page as you scroll (see src/components/BuilderFX.jsx). Off by default, remembered once chosen.
// It is decoration only, so it is never active in reduced-motion mode or on small screens.
export const BuilderProvider = ({ children }) => {
  const { reduced } = useMotion();
  const [builder, setBuilder] = useState(() => {
    try { return localStorage.getItem(KEY) === "on"; } catch { return false; }
  });

  const toggleBuilder = useCallback(() => {
    if (reduced) return notice("Builder mode needs full motion. Turn motion on first.");
    const next = !builder;
    try { localStorage.setItem(KEY, next ? "on" : "off"); } catch { /* private mode */ }
    setBuilder(next);
    notice(
      !next ? "Builder mode off."
        : window.matchMedia("(min-width: 768px)").matches ? "Builder mode on. Scroll and watch the editor build the page."
        : "Builder mode is saved, but it needs a wider screen (768px and up) to play."
    );
  }, [builder, reduced]);

  return <BuilderContext.Provider value={{ builder, active: builder && !reduced, toggleBuilder }}>{children}</BuilderContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useBuilder = () => useContext(BuilderContext);
