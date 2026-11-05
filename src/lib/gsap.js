import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { Flip } from "gsap/Flip";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { useGSAP } from "@gsap/react";

// register once, import gsap from here everywhere else
gsap.registerPlugin(ScrollTrigger, SplitText, Flip, ScrambleTextPlugin, DrawSVGPlugin, MotionPathPlugin, useGSAP);

// true when the visitor asked for less motion: the in-site toggle wins, otherwise the OS setting
export const prefersReducedMotion = () => {
  if (typeof document === "undefined") return false;
  const m = document.documentElement.getAttribute("data-motion");
  if (m) return m === "reduced";
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

export const isDesktop = "(min-width: 1024px)";

export { gsap, ScrollTrigger, SplitText, Flip, useGSAP };
