import { gsap } from "./gsap";

// Text scramble that works on the text nodes inside an element, so headings like <>Work<span>.</span></> keep their markup.
// Characters are swapped for ones of the same case and a similar width, so big headings do not jump around while it runs.
const UP = "ABCDEGHKNOPQRSUVXZ";
const LOW = "aeoncsuvxz";
const NUM = "0123456789";
const pick = (c) => {
  if (c >= "A" && c <= "Z") return UP[(Math.random() * UP.length) | 0];
  if (c >= "a" && c <= "z") return LOW[(Math.random() * LOW.length) | 0];
  if (c >= "0" && c <= "9") return NUM[(Math.random() * NUM.length) | 0];
  return c;
};

export const scrambleText = (el, { duration = 0.8, delay = 0, onDone } = {}) => {
  const nodes = [];
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = walker.nextNode())) if (n.nodeValue.trim()) nodes.push({ n, orig: n.nodeValue });
  if (!nodes.length) return null;
  const total = nodes.reduce((a, x) => a + x.orig.length, 0);
  const restore = () => nodes.forEach(({ n: node, orig }) => { node.nodeValue = orig; });
  const o = { p: 0 };
  return gsap.to(o, {
    p: 1,
    duration,
    delay,
    ease: "none",
    onUpdate: () => {
      let done = Math.floor(o.p * total);
      nodes.forEach(({ n: node, orig }) => {
        const keep = Math.max(0, Math.min(orig.length, done));
        done -= orig.length;
        node.nodeValue = orig.slice(0, keep) + [...orig.slice(keep)].map(pick).join("");
      });
    },
    onComplete: () => { restore(); onDone?.(); },
    onInterrupt: () => { restore(); onDone?.(); },
  });
};
