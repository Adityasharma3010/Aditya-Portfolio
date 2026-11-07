// Notes: short write-ups. Add a note by adding an object to the top of the list (newest first).
// Keep the order  slug, title, date, summary  (the SEO plugin reads those four with a regex) and use ’ “ ” instead of straight quotes in them.
//
// body blocks:  { type: "p", text }  { type: "h", text }  { type: "code", lang, text }  { type: "list", items: [] }
// In text, `backticks` make inline code.
export const notes = [
  {
    slug: "blur-on-a-moving-layer",
    title: "Cutting blocking time by moving a blur one element down",
    date: "2026-11-06",
    summary: "Animated elements with a CSS blur were re-blurred on every frame. Putting the blur on a static child fixed it with zero visual change.",
    tags: ["Performance", "CSS", "GSAP"],
    body: [
      { type: "p", text: "The big soft glows in my hero are plain circles with `blur-[90px]`. They also move: GSAP floats them around and drives them with the scroll. They looked great, and they were the most expensive thing on the page." },
      { type: "h", text: "Finding it" },
      { type: "p", text: "A mobile Lighthouse run said the problem was main-thread time, not bytes. So I profiled the load with the CPU throttled, then switched pieces off one at a time. With every `filter` and `backdrop-filter` off, blocking time fell by roughly two thirds. Narrowing it down, the two hero orbs alone were about half of the total." },
      { type: "h", text: "Why it was slow" },
      { type: "p", text: "The blur and the animation lived on the same element. That element is its own compositor layer (`will-change: transform`), and a filter on a composited layer is applied again every frame while the layer moves. Move the blur one element down, onto a child that never changes, and the child is rasterised once. The animated parent then just moves a finished texture." },
      { type: "code", lang: "jsx", text: `<div className="hero-orb ... will-change-transform">   {/* GSAP moves this */}\n  <div className="orb-glow absolute inset-0 rounded-full bg-accent/25 blur-[90px]" />  {/* blurred once */}\n</div>` },
      { type: "h", text: "Checking I didn’t change the look" },
      { type: "p", text: "I took screenshots of the old and the new build in both skins and both themes, with motion reduced so everything holds still, and diffed them. The biggest difference in any channel was 1 out of 255." },
      { type: "h", text: "What it bought" },
      { type: "p", text: "On the throttled mobile profile, total blocking time dropped from about 4.5 s to about 1.9 s from this change alone. The headless browser renders in software, so treat the numbers as relative, not absolute. A desktop Lighthouse run barely moved, which fits: the cost only shows up when the CPU is slow." },
    ],
  },
  {
    slug: "usegsap-revert-on-update",
    title: "useGSAP doesn’t revert when its dependencies change",
    date: "2026-11-05",
    summary: "My heading got stuck half faded because an effect re-ran and stacked a second tween on top of the first. The fix is one option and one split.",
    tags: ["GSAP", "React", "Debugging"],
    body: [
      { type: "p", text: "In the GitHub activity section, the heading was fine on the error path and stuck at about 7% opacity once data arrived. Other sections used the same reveal and worked." },
      { type: "h", text: "What was happening" },
      { type: "p", text: "That section’s animation effect depends on the loading state. When the state changed from loading to ready, the effect ran again. `useGSAP` only reverts its animations when the component unmounts, unless you pass `revertOnUpdate: true`, so the first run’s tween stayed alive and the second run created another one on the same heading." },
      { type: "p", text: "A `from()` tween reads the element’s current values as its end values. The second tween read the first one’s start state (opacity 0) and tweened from 0 to 0. Asking GSAP what was attached made it obvious:" },
      { type: "code", lang: "js", text: `gsap.getTweensOf(document.querySelector("#activity .sh-title"))\n// two ScrollTrigger tweens on one heading` },
      { type: "h", text: "The fix" },
      { type: "list", items: [
        "The heading reveal moves into its own `useGSAP` call with no dependencies, so it runs exactly once.",
        "The pieces that really depend on the data keep their dependency and get `revertOnUpdate: true`, so each run starts from a clean slate.",
      ] },
      { type: "code", lang: "js", text: `// once\nuseGSAP(() => { gsap.from(".sh-title", { /* ... */ }) }, { scope: root });\n\n// re-runs with the data, reverting the previous run first\nuseGSAP(() => { /* cells, commits, stats */ }, { scope: root, dependencies: [state], revertOnUpdate: true });` },
      { type: "p", text: "Rule of thumb: if a `useGSAP` call has dependencies and creates `from()` tweens, decide on purpose whether the old run should be reverted." },
    ],
  },
  {
    slug: "reduced-motion-gsap",
    title: "My reduced-motion toggle made half the page disappear",
    date: "2026-11-04",
    summary: "A 0.01ms CSS transition quietly broke every GSAP from() tween. Here is how I found it and the one-line fix.",
    tags: ["GSAP", "Accessibility", "Debugging"],
    body: [
      { type: "p", text: "I added a reduced-motion switch to this site. It stopped the animations, which is what it should do, but whole sections stayed invisible and the header sometimes slid away and never came back." },
      { type: "h", text: "The quickest way to find it" },
      { type: "p", text: "I deleted the reduced-motion CSS rules at runtime, in the browser. With them gone, everything revealed normally. So it wasn’t missing guards in my animations; it was the CSS." },
      { type: "h", text: "The culprit" },
      { type: "p", text: "The usual snippet sets `transition-duration: 0.01ms !important` on every element. That isn’t zero. Every time GSAP writes an inline style, the browser starts a tiny transition, and when GSAP later reads the element to set up a `from()` tween, it reads the value that is still in flight. The tween goes from 0 to 0 and the element stays invisible." },
      { type: "code", lang: "css", text: `[data-motion="reduced"] * {\n  animation-duration: 0.01ms !important;\n  transition-duration: 0s !important; /* exactly 0, not 0.01ms */\n  transition-delay: 0s !important;\n}` },
      { type: "h", text: "The rest of the fix" },
      { type: "list", items: [
        "Reveal animations now skip themselves in reduced mode, so the page just shows its final state.",
        "Number counters jump to their final value instead of staying on 0.",
        "The header ignores hide-on-scroll and the slide-in, so it is always there.",
      ] },
      { type: "p", text: "The lesson is broader than motion settings: anything that changes values asynchronously can poison what an animation library reads from the DOM." },
    ],
  },
];

export const noteDate = (iso) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
export const readTime = (n) => {
  const words = n.body.reduce((a, b) => a + (b.text ? b.text.split(/\s+/).length : (b.items || []).join(" ").split(/\s+/).length), 0);
  return Math.max(1, Math.round(words / 190));
};
