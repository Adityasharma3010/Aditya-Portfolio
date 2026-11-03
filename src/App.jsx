import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { ScrollTrigger } from "./lib/gsap";
import { ThemeProvider } from "./context/Theme";
import SmoothScroll from "./components/SmoothScroll";
import { TransitionProvider } from "./components/PageTransition";
import Loader from "./components/Loader";
import Cursor from "./components/Cursor";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import ProjectsArchive from "./pages/ProjectsArchive";
import ProjectPage from "./pages/ProjectPage";
import NotFound from "./pages/NotFound";

const Shell = () => {
  // intro only once per browser session
  const [ready, setReady] = useState(() => sessionStorage.getItem("intro") === "1");
  const { pathname } = useLocation();

  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  }, []);

  // route changed: let the new page lay out, then recalc every trigger
  useEffect(() => {
    const t = setTimeout(() => ScrollTrigger.refresh(), 100);
    return () => clearTimeout(t);
  }, [pathname]);

  const done = () => {
    sessionStorage.setItem("intro", "1");
    setReady(true);
  };

  return (
    <>
      {!ready && <Loader onDone={done} />}
      <Cursor />
      <Navbar ready={ready} />
      <Routes>
        <Route path="/" element={<Home ready={ready} />} />
        <Route path="/projects" element={<ProjectsArchive />} />
        <Route path="/projects/:slug" element={<ProjectPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => (
  <ThemeProvider>
    <BrowserRouter>
      <SmoothScroll>
        <TransitionProvider>
          <Shell />
        </TransitionProvider>
      </SmoothScroll>
    </BrowserRouter>
  </ThemeProvider>
);

export default App;
