import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "../lib/gsap";

// Synthwave floor: a perspective grid rushing toward you, optional striped neon sun on the horizon.
const CyberGrid = ({ className = "", sun = false }) => {
  const root = useRef(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.to(".cg-lines", { backgroundPositionY: "80px", duration: 1.4, ease: "none", repeat: -1 });
      gsap.to(".cg-glow", { opacity: 0.55, duration: 1.8, ease: "sine.inOut", yoyo: true, repeat: -1 });
      if (sun) {
        gsap.to(".cg-sun", { y: -10, duration: 3, ease: "sine.inOut", yoyo: true, repeat: -1 });
        gsap.to(".cg-sun-bars", { backgroundPositionY: "-24px", duration: 2.4, ease: "none", repeat: -1 });
      }
    },
    { scope: root, dependencies: [sun] }
  );

  const line = "rgb(var(--accent2) / 0.6)";
  return (
    <div ref={root} className={`pointer-events-none overflow-hidden ${className}`} aria-hidden="true">
      {sun && (
        <div className="cg-sun absolute left-1/2 top-[2%] h-[min(46vw,420px)] w-[min(46vw,420px)] -translate-x-1/2 rounded-full" style={{ background: "linear-gradient(to bottom, rgb(var(--accent)), rgb(var(--accent3)))", boxShadow: "0 0 90px rgb(var(--accent3) / 0.55)" }}>
          <div
            className="cg-sun-bars absolute inset-0 rounded-full"
            style={{
              background: "repeating-linear-gradient(to bottom, transparent 0 14px, rgb(var(--bg)) 14px 22px)",
              WebkitMaskImage: "linear-gradient(to bottom, transparent 45%, #000 70%)",
              maskImage: "linear-gradient(to bottom, transparent 45%, #000 70%)",
            }}
          />
        </div>
      )}
      <div className="cg-glow absolute inset-x-0 top-[38%] h-24 opacity-30 blur-2xl" style={{ background: "rgb(var(--accent3))" }} />
      <div className="absolute inset-x-0 bottom-0 top-[40%]" style={{ perspective: "380px" }}>
        <div
          className="cg-lines absolute inset-x-[-60%] top-0 h-[220%] origin-top"
          style={{
            transform: "rotateX(74deg)",
            backgroundImage: `linear-gradient(${line} 1px, transparent 1px), linear-gradient(90deg, ${line} 1px, transparent 1px)`,
            backgroundSize: "80px 80px",
            WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, #000 45%)",
            maskImage: "linear-gradient(to bottom, transparent 0%, #000 45%)",
          }}
        />
      </div>
    </div>
  );
};

export default CyberGrid;
