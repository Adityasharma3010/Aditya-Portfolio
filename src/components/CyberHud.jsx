import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from "../lib/gsap";
import { SCRAMBLE_CHARS } from "../lib/cyber";

const SECTORS = [
  { id: "about", text: "// SECTOR 01 // IDENTITY" },
  { id: "work", text: "// SECTOR 02 // ARCHIVE" },
  { id: "experience", text: "// SECTOR 03 // HISTORY" },
  { id: "contact", text: "// SECTOR 04 // UPLINK" },
];
const STATUS = ["SYS.ONLINE", "UPLINK STABLE", "ICE: BREACHED", "SCANNING...", "NO TRACE"];

const scramble = (el, text, duration = 0.8) =>
  el && gsap.to(el, { duration, overwrite: true, scrambleText: { text, chars: SCRAMBLE_CHARS, speed: 0.7 } });

// Fixed heads-up display: corner brackets, live mouse coordinates, rotating system status,
// a sector read-out that decrypts as you scroll between sections, and a tick-mark scroll meter.
const CyberHud = ({ ready }) => {
  const root = useRef(null);
  const coords = useRef(null);
  const pct = useRef(null);
  const status = useRef(null);
  const sector = useRef(null);
  const { pathname } = useLocation();

  useGSAP(
    (_, contextSafe) => {
      if (!ready) return;
      const reduce = prefersReducedMotion();
      if (!reduce) {
        gsap.from(".hud-corner", { scale: 0.4, opacity: 0, duration: 0.8, stagger: 0.1, ease: "back.out(2)", delay: 0.3 });
        gsap.from(".hud-text", { opacity: 0, x: -20, duration: 0.8, stagger: 0.15, delay: 0.6 });
        gsap.from(".hud-meter", { scaleY: 0, transformOrigin: "center", duration: 1, ease: "power3.out", delay: 0.5 });
        gsap.to(".hud-dot", { opacity: 0.2, duration: 0.6, repeat: -1, yoyo: true, ease: "steps(1)" });

        // rotating system status line
        let n = 0;
        const cycle = contextSafe(() => {
          n = (n + 1) % STATUS.length;
          scramble(status.current, STATUS[n]);
          gsap.delayedCall(4, cycle);
        });
        gsap.delayedCall(4, cycle);
      }

      const thumbY = gsap.quickTo(".hud-thumb", "top", { duration: 0.3, ease: "power3" });
      ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: (self) => {
          thumbY(self.progress * 100 + "%");
          if (pct.current) pct.current.textContent = String(Math.round(self.progress * 100)).padStart(3, "0") + "%";
        },
      });
    },
    { scope: root, dependencies: [ready] }
  );

  // sector label follows the section that is on screen (home), or names the page (other routes)
  useGSAP(
    () => {
      if (!ready || !sector.current) return;
      const set = (t) => (prefersReducedMotion() ? (sector.current.textContent = t) : scramble(sector.current, t));
      const found = SECTORS.filter((s) => document.getElementById(s.id));
      if (!found.length) {
        set(pathname.startsWith("/projects") ? "// ARCHIVE // FILE" : "// 404 // SIGNAL LOST");
        return;
      }
      set("// SECTOR 00 // ENTRY");
      ScrollTrigger.create({ trigger: document.body, start: "top top", end: () => document.getElementById(found[0].id).offsetTop - innerHeight * 0.4, onToggle: (s) => s.isActive && set("// SECTOR 00 // ENTRY"), invalidateOnRefresh: true });
      found.forEach((s) => {
        ScrollTrigger.create({
          trigger: `#${s.id}`,
          start: "top 45%",
          end: "bottom 45%",
          onToggle: (self) => self.isActive && set(s.text),
        });
      });
    },
    { dependencies: [ready, pathname], revertOnUpdate: true }
  );

  useEffect(() => {
    let x = 0, y = 0;
    const move = (e) => { x = Math.round(e.clientX); y = Math.round(e.clientY); };
    const tick = () => {
      if (coords.current) coords.current.textContent = `X:${String(x).padStart(4, "0")} Y:${String(y).padStart(4, "0")}`;
    };
    window.addEventListener("pointermove", move);
    gsap.ticker.add(tick);
    return () => { window.removeEventListener("pointermove", move); gsap.ticker.remove(tick); };
  }, []);

  const corner = "hud-corner absolute h-6 w-6 border-accent2/70";
  return (
    <div ref={root} className="pointer-events-none fixed inset-0 z-[55] hidden font-mono text-[10px] uppercase tracking-[0.2em] text-accent2/80 sm:block" aria-hidden="true">
      <span className={`${corner} left-3 top-3 border-l-2 border-t-2`} />
      <span className={`${corner} right-3 top-3 border-r-2 border-t-2`} />
      <span className={`${corner} bottom-3 left-3 border-b-2 border-l-2`} />
      <span className={`${corner} bottom-3 right-3 border-b-2 border-r-2`} />

      <div className="hud-text absolute bottom-6 left-9 flex items-center gap-3">
        <i className="hud-dot h-1.5 w-1.5 bg-accent3" />
        <span ref={status} className="inline-block min-w-[13ch]">SYS.ONLINE</span>
        <span ref={coords} className="text-accent/80">X:0000 Y:0000</span>
      </div>
      <div className="hud-text absolute bottom-6 left-1/2 -translate-x-1/2 text-accent">
        <span ref={sector}>{"// SECTOR 00 // ENTRY"}</span>
      </div>
      <div className="hud-text absolute bottom-6 right-9 text-right">NEURAL//LINK v2.077</div>

      <div className="absolute right-4 top-1/2 flex -translate-y-1/2 flex-col items-center gap-2">
        <div className="hud-meter relative h-[38vh] w-3" style={{ backgroundImage: "repeating-linear-gradient(to bottom, rgb(var(--accent2) / 0.55) 0 1px, transparent 1px 9px)" }}>
          <span className="absolute inset-y-0 left-1/2 w-px bg-accent2/30" />
          <span className="hud-thumb absolute left-1/2 top-0 h-5 w-3 -translate-x-1/2 -translate-y-1/2 bg-accent" style={{ boxShadow: "0 0 12px rgb(var(--accent))", clipPath: "polygon(0 0, 100% 20%, 100% 80%, 0 100%)" }} />
        </div>
        <span ref={pct} className="text-accent">000%</span>
      </div>
    </div>
  );
};

export default CyberHud;
