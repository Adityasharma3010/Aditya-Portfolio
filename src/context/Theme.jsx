import { createContext, useCallback, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

const read = () =>
  document.documentElement.getAttribute("data-theme") === "light"
    ? "light"
    : "dark";

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(read);

  const setTheme = useCallback((next) => {
    document.documentElement.setAttribute("data-theme", next);
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", next === "light" ? "#f4f1eb" : "#0b0b0d");
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* private mode, ignore */
    }
    setThemeState(next);
  }, []);

  // follow the OS only until the user picks one by hand
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const onChange = (e) => {
      if (!localStorage.getItem("theme")) {
        document.documentElement.setAttribute(
          "data-theme",
          e.matches ? "light" : "dark"
        );
        setThemeState(e.matches ? "light" : "dark");
      }
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => useContext(ThemeContext);
