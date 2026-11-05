import { createContext, useContext, useEffect, useState } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "../lib/gsap";
import { useMotion } from "../context/Motion";

const LenisContext = createContext(null);
// eslint-disable-next-line react-refresh/only-export-components
export const useLenis = () => useContext(LenisContext);

// Lenis drives the scroll, GSAP's ticker drives Lenis, ScrollTrigger listens to Lenis
const SmoothScroll = ({ children }) => {
  const [lenis, setLenis] = useState(null);
  const { reduced } = useMotion();

  useEffect(() => {
    if (reduced) return; // native scrolling only
    const instance = new Lenis({ lerp: 0.1, smoothWheel: true });
    instance.on("scroll", ScrollTrigger.update);
    const tick = (time) => instance.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    setLenis(instance);

    return () => {
      gsap.ticker.remove(tick);
      instance.destroy();
      setLenis(null);
    };
  }, [reduced]);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
};

export default SmoothScroll;
