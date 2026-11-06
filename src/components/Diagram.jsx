import { useId, useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "../lib/gsap";

const W = 176;
const H = 76;
const COLOR = { client: "--accent", api: "--accent2", data: "--accent3", service: "--fg" };

const anchor = (n, side) => ({
  x: n.x + (side === "r" ? W / 2 : side === "l" ? -W / 2 : 0),
  y: n.y + (side === "b" ? H / 2 : side === "t" ? -H / 2 : 0),
});

// curved connector between two boxes, leaving from the sides that face each other
const route = (a, b) => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  let s, e, d;
  if (Math.abs(dx) >= Math.abs(dy) * 1.6) {
    s = anchor(a, dx > 0 ? "r" : "l");
    e = anchor(b, dx > 0 ? "l" : "r");
    const mx = (s.x + e.x) / 2;
    d = `M${s.x},${s.y} C${mx},${s.y} ${mx},${e.y} ${e.x},${e.y}`;
  } else {
    s = anchor(a, dy > 0 ? "b" : "t");
    e = anchor(b, dy > 0 ? "t" : "b");
    const my = (s.y + e.y) / 2;
    d = `M${s.x},${s.y} C${s.x},${my} ${e.x},${my} ${e.x},${e.y}`;
  }
  return { d, mid: { x: (s.x + e.x) / 2, y: (s.y + e.y) / 2 } };
};

// Architecture diagram: boxes pop in and connectors draw themselves as you scroll through it (GSAP DrawSVG, scrubbed),
// then small data packets keep travelling along every connector (MotionPath).
const Diagram = ({ nodes, edges, h = 420 }) => {
  const root = useRef(null);
  const uid = useId().replace(/:/g, "");
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const routed = edges.map(([from, to, label, opts], i) => ({ ...route(byId[from], byId[to]), label, dashed: opts?.dashed, key: `${from}-${to}-${i}` }));

  useGSAP(
    () => {
      const reduce = prefersReducedMotion();
      const paths = gsap.utils.toArray(".dg-edge");
      const packets = gsap.utils.toArray(".dg-packet");
      if (reduce) {
        gsap.set(packets, { opacity: 0 });
        return;
      }
      gsap.set(packets, { opacity: 0 });

      // packets travel along every connector, but only once the diagram is fully drawn
      const flows = packets.map((p, i) => gsap.to(p, { motionPath: { path: paths[i], align: paths[i], alignOrigin: [0.5, 0.5] }, duration: gsap.utils.random(2.2, 3.4), ease: "none", repeat: -1, repeatDelay: gsap.utils.random(0.2, 1), delay: i * 0.35, paused: true }));
      let flowing = false;

      // scroll-driven: boxes and connectors are drawn as you scroll through the diagram
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: "clamp(top 85%)",
          end: "clamp(bottom 55%)",
          scrub: 0.6,
          onUpdate: (self) => {
            const done = self.progress > 0.97;
            if (done === flowing) return;
            flowing = done;
            flows.forEach((f) => (done ? f.play() : f.pause()));
            gsap.to(packets, { opacity: done ? 1 : 0, duration: 0.3, overwrite: "auto" });
          },
        },
      });
      tl.from(".dg-node", { scale: 0.7, opacity: 0, duration: 0.6, ease: "back.out(1.7)", stagger: 0.1 })
        .from(paths, { drawSVG: "0%", duration: 0.9, ease: "power2.inOut", stagger: 0.12 }, "-=0.3")
        .from(".dg-label", { opacity: 0, y: 6, duration: 0.5, stagger: 0.08 }, "-=0.6");
    },
    { scope: root }
  );

  return (
    <div ref={root} className="overflow-x-auto">
      <svg viewBox={`0 0 1000 ${h}`} className="mx-auto h-auto min-w-[760px] w-full" role="img" aria-label="Architecture diagram">
        <defs>
          <marker id={`arrow-${uid}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" style={{ fill: "rgb(var(--muted))" }} />
          </marker>
        </defs>

        {routed.map((r) => (
          <g key={r.key}>
            <path className="dg-edge" d={r.d} fill="none" strokeWidth="1.6" strokeOpacity={r.dashed ? 0.5 : 1} markerEnd={`url(#arrow-${uid})`} style={{ stroke: "rgb(var(--muted))" }} />
            {r.label && (
              <g className="dg-label">
                <rect x={r.mid.x - r.label.length * 3.6 - 8} y={r.mid.y - 11} width={r.label.length * 7.2 + 16} height="22" style={{ fill: "rgb(var(--bg))" }} />
                <text x={r.mid.x} y={r.mid.y + 4} textAnchor="middle" fontSize="11" style={{ fill: "rgb(var(--muted))", fontFamily: "var(--font-mono)" }}>{r.label}</text>
              </g>
            )}
            <circle className="dg-packet" r="4.5" style={{ fill: "rgb(var(--accent))", filter: "drop-shadow(0 0 4px rgb(var(--accent)))" }} />
          </g>
        ))}

        {nodes.map((n) => {
          const c = COLOR[n.type] || COLOR.service;
          return (
            <g key={n.id} className="dg-node" style={{ transformBox: "fill-box", transformOrigin: "center" }}>
              <rect x={n.x - W / 2} y={n.y - H / 2} width={W} height={H} style={{ fill: "rgb(var(--surface))", stroke: `rgb(var(${c}) / 0.7)`, strokeWidth: 1.5, rx: "var(--node-r, 14px)" }} />
              <rect x={n.x - W / 2} y={n.y - H / 2} width="4" height={H} style={{ fill: `rgb(var(${c}))` }} />
              <text x={n.x} y={n.y - 4} textAnchor="middle" fontSize="15" fontWeight="700" style={{ fill: "rgb(var(--fg))", fontFamily: "var(--font-display)" }}>{n.label}</text>
              <text x={n.x} y={n.y + 16} textAnchor="middle" fontSize="10.5" style={{ fill: "rgb(var(--muted))", fontFamily: "var(--font-mono)" }}>{n.sub}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default Diagram;
