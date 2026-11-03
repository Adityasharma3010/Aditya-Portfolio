import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "../lib/gsap";

// Scroll parallax. speed > 0 drifts slower than the page, < 0 faster. 0.2 is subtle, 0.6 is bold.
const Parallax = ({ speed = 0.2, className = "", children, as = "div", ...rest }) => {
  const Tag = as;
  const el = useRef(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.fromTo(
        el.current,
        { yPercent: -speed * 50 },
        {
          yPercent: speed * 50,
          ease: "none",
          scrollTrigger: { trigger: el.current, start: "top bottom", end: "bottom top", scrub: true },
        }
      );
    },
    { scope: el }
  );

  return (
    <Tag ref={el} className={className} {...rest}>
      {children}
    </Tag>
  );
};

export default Parallax;
