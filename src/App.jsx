import { Suspense, lazy, useEffect, useState } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { ScrollTrigger } from "./lib/gsap";
import { ThemeProvider, useTheme } from "./context/Theme";
import { MotionProvider, useMotion } from "./context/Motion";
import SmoothScroll from "./components/SmoothScroll";
import { TransitionProvider } from "./components/PageTransition";
import Loader from "./components/Loader";
import Cursor from "./components/Cursor";
import DefaultFX from "./components/DefaultFX";
import Eggs from "./components/Eggs";
import Navbar from "./components/Navbar";
import PaletteGate from "./components/PaletteGate";
import SecretsGate from "./components/SecretsGate";
import Konami from "./components/Konami";
import Home from "./pages/Home";

// everything except the home page and the default skin is loaded on demand
const Resume = lazy(() => import("./pages/Resume"));
const Uses = lazy(() => import("./pages/Uses"));
const ProjectsArchive = lazy(() => import("./pages/ProjectsArchive"));
const ProjectPage = lazy(() => import("./pages/ProjectPage"));
const Notes = lazy(() => import("./pages/Notes"));
const NotePage = lazy(() => import("./pages/NotePage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const CyberCursor = lazy(() => import("./components/CyberCursor"));
const CyberFX = lazy(() => import("./components/CyberFX"));
const CyberHud = lazy(() => import("./components/CyberHud"));

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

  // once the page is up, fetch the pages people most likely open next while the browser is idle
  useEffect(() => {
    if (!ready) return;
    const idle = window.requestIdleCallback || ((f) => setTimeout(f, 1500));
    const cancel = window.cancelIdleCallback || clearTimeout;
    const id = idle(() => {
      import("./pages/ProjectPage");
      import("./pages/ProjectsArchive");
    });
    return () => cancel(id);
  }, [ready]);

  const done = () => {
    sessionStorage.setItem("intro", "1");
    setReady(true);
  };

  return (
    <>
      {!ready && <Loader onDone={done} />}
      {/* remounted whenever the motion setting changes so every animation re-reads it */}
      <div key={epoch} style={{ display: "contents" }}>
        {cyber ? <Suspense fallback={null}><CyberCursor /></Suspense> : <Cursor />}
        <Navbar ready={ready} />
        <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<Home ready={ready} />} />
          <Route path="/projects" element={<ProjectsArchive />} />
          <Route path="/projects/:slug" element={<ProjectPage />} />
          <Route path="/resume" element={<Resume />} />
          <Route path="/uses" element={<Uses />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/notes/:slug" element={<NotePage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
        {!cyber && <DefaultFX ready={ready} />}
        {cyber && (
          <Suspense fallback={null}>
            <CyberFX ready={ready} />
            <CyberHud ready={ready} />
          </Suspense>
        )}
        <PaletteGate />
        <SecretsGate />
        <Konami />
        <Eggs />
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
