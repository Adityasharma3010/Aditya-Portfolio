import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { Flip } from "gsap/Flip";
import { useGSAP } from "@gsap/react";

// register once, import gsap from here everywhere else
gsap.registerPlugin(ScrollTrigger, SplitText, Flip, useGSAP);

export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const isDesktop = "(min-width: 1024px)";

export { gsap, ScrollTrigger, SplitText, Flip, useGSAP };
