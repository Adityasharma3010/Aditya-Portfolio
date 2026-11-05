// A theme ("skin") has its own dark and light mode. The sun/moon button flips the mode.
export const skins = [
  {
    id: "default",
    label: "Default",
    note: "Clean editorial",
    swatch: { dark: ["#0b0b0d", "#c8ff3d", "#f3f0e9"], light: ["#f4f1eb", "#5b2cff", "#111114"] },
  },
  {
    id: "cyber",
    label: "Cyberpunk",
    note: "Neon // night city",
    swatch: { dark: ["#05060d", "#fcee0a", "#00f0ff", "#ff2a6d"], light: ["#eef0e8", "#e80068", "#008abe", "#c49600"] },
  },
];
export const SKIN_IDS = skins.map((s) => s.id);
export const MODES = ["dark", "light"];
