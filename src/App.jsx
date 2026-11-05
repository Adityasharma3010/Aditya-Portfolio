import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { ScrollTrigger } from "./lib/gsap";
import { ThemeProvider, useTheme } from "./context/Theme";
import { MotionProvider, useMotion } from "./context/Motion";
import SmoothScroll from "./components/SmoothScroll";
import { TransitionProvider } from "./components/PageTransition";
import Loader from "./components/Loader";
import Cursor from "./components/Cursor";
import CyberCursor from "./components/CyberCursor";
import CyberFX from "./components/CyberFX";
import CyberHud from "./components/CyberHud";
import Navbar from "./components/Navbar";
import CommandPalette from "./components/CommandPalette";
import Konami from "./components/Konami";
import Home from "./pages/Home";
import Resume from "./pages/Resume";
import Uses from "./pages/Uses";
import ProjectsArchive from "./pages/ProjectsArchive";
import ProjectPage from "./pages/ProjectPage";
import NotFound from "./pages/NotFound";

const Shell = () => {
  // intro only once per browser session
  const [ready, setReady] = useState(() => sessionStorage.getItem("intro") === "1");
  const { pathname } = useLocation();
  const { cyber } = useTheme();
  const { epoch } = useMotion();

  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  }, []);

  // route changed: let the new page lay out, then recalc every trigger
  useEffect(() => {
    const t = setTimeout(() => ScrollTrigger.refresh(), 100);
    return () => clearTimeout(t);
  }, [pathname, epoch]);

  const done = () => {
    sessionStorage.setItem("intro", "1");
    setReady(true);
  };

  return (
    <>
      {!ready && <Loader onDone={done} />}
      {/* remounted whenever the motion setting changes so every animation re-reads it */}
      <div key={epoch} style={{ display: "contents" }}>
        {cyber ? <CyberCursor /> : <Cursor />}
        <Navbar ready={ready} />
        <Routes>
          <Route path="/" element={<Home ready={ready} />} />
          <Route path="/projects" element={<ProjectsArchive />} />
          <Route path="/projects/:slug" element={<ProjectPage />} />
          <Route path="/resume" element={<Resume />} />
          <Route path="/uses" element={<Uses />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        {cyber && (
          <>
            <CyberFX ready={ready} />
            <CyberHud ready={ready} />
          </>
        )}
        <CommandPalette />
        <Konami />
      </div>
    </>
  );
};

const App = () => (
  <MotionProvider>
    <ThemeProvider>
      <BrowserRouter>
        <SmoothScroll>
          <TransitionProvider>
            <Shell />
          </TransitionProvider>
        </SmoothScroll>
      </BrowserRouter>
    </ThemeProvider>
  </MotionProvider>
);

export default App;
