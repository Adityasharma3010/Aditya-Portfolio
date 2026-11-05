import { createContext, useCallback, useContext, useEffect, useState } from "react";

const MotionContext = createContext(null);
const root = () => document.documentElement;
const read = () => (root().getAttribute("data-motion") === "reduced" ? "reduced" : "full");

// Reduced-motion switch. Starts from the OS setting, the visitor can override it and it is remembered.
// `epoch` bumps on every change: the app remounts its animated tree so every effect re-reads the setting.
export const MotionProvider = ({ children }) => {
  const [motion, setMotionState] = useState(read);
  const [epoch, setEpoch] = useState(0);

  const setMotion = useCallback((next) => {
    root().setAttribute("data-motion", next);
    try { localStorage.setItem("motion", next); } catch { /* private mode */ }
    setMotionState(next);
    setEpoch((e) => e + 1);
  }, []);

  const toggleMotion = useCallback(() => setMotion(read() === "reduced" ? "full" : "reduced"), [setMotion]);

  // follow the OS until a choice has been saved
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (e) => {
      if (localStorage.getItem("motion")) return;
      const next = e.matches ? "reduced" : "full";
      root().setAttribute("data-motion", next);
      setMotionState(next);
      setEpoch((n) => n + 1);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <MotionContext.Provider value={{ motion, reduced: motion === "reduced", epoch, setMotion, toggleMotion }}>
      {children}
    </MotionContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useMotion = () => useContext(MotionContext);
