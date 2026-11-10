import { useEffect } from "react";
import { ScrollTrigger } from "../lib/gsap";
import Hero from "../components/Hero";
import About from "../components/About";
import Projects from "../components/Projects";
import Stack from "../components/Stack";
import Experience from "../components/Experience";
import Contact from "../components/Contact";
import GithubActivity from "../components/GithubActivity";
import Testimonials from "../components/Testimonials";
import { useSeo } from "../hooks/useSeo";

const Home = ({ ready }) => {
  useSeo("Aditya Sharma — Full Stack Developer", "Full stack developer building fast, animated web experiences with React, GSAP, Node and WordPress. Projects, experience and contact.", "/");

  // layout shifts from fonts/images can move trigger positions, so recalc once things settle
  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => ScrollTrigger.refresh(), 600);
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    return () => clearTimeout(t);
  }, [ready]);

  return (
    <main id="main">
      <Hero ready={ready} />
      <About />
      <Projects />
      <Experience />
      <GithubActivity />
      <Testimonials />
      <Stack />
      <Contact />
    </main>
  );
};

export default Home;
