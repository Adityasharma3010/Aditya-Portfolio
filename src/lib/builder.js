// Builder mode settings. The engine (components/BuilderFX.jsx) finds the blocks of a page by itself,
// so pages need no plan. This file holds the cast, the editor's Elements list and a few hints.

// The four cursors. `color` is a theme token, so they follow the skin and light/dark mode.
export const CURSORS = [
  { name: "Aditya", color: "--accent" },
  { name: "Design", color: "--accent2" },
  { name: "Code", color: "--accent3" },
  { name: "Copy", color: "--fg" },
];

// Who likes building what (first name = preferred). Others help out when their own kind of block is not ready.
export const PREFER = {
  heading: ["Aditya"],
  box: ["Aditya", "Design"],
  text: ["Copy"],
  list: ["Copy"],
  media: ["Design"],
  chip: ["Design", "Code"],
  control: ["Code"],
  group: ["Code", "Design"],
};

// Treated as ONE block, however many parts it has (the engine never builds inside these).
export const GROUPS = ["[data-egg-badge]", ".gh-grid", ".stack-rows", "#stack > :first-child"];

// Never touched by Builder mode.
export const SKIP = ["[data-bm-skip]", "[data-lenis-prevent]", "dialog", "[role='dialog']"];

// The Elements panel: [id, label, icon]. HTML blocks, React pieces and GSAP building blocks.
export const ELEMENTS = [
  { group: "HTML", items: [["heading", "Heading", "H1"], ["text", "Text", "Aa"], ["button", "Button", "▭"], ["image", "Image", "▣"], ["container", "Container", "▢"], ["list", "List", "≡"]] },
  { group: "React", items: [["component", "Component", "&lt;/&gt;"], ["state", "useState", "{ }"], ["props", "Props", "⟨⟩"]] },
  { group: "GSAP", items: [["tween", "Tween", "→"], ["timeline", "Timeline", "≋"], ["scroll", "ScrollTrigger", "↕"], ["split", "SplitText", "Ab"]] },
];

// Which panel element a block kind is built from, and which behaviour gets added on top (by id from ELEMENTS)
export const KIND_ITEM = { heading: "heading", text: "text", list: "list", control: "button", media: "image", box: "container", chip: "component", group: "component" };
export const BEHAVE = { heading: "split", media: "scroll", box: "timeline", control: "tween", group: "timeline", chip: "state" };

// Colour swatches in the Styles panel (theme tokens, so they follow the skin and light/dark mode)
export const SWATCHES = ["accent", "accent2", "accent3", "fg", "muted", "surface", "bg"];
