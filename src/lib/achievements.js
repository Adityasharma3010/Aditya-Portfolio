import { SECRETS } from "./secrets";
import { showToast } from "./toasts";

// Which secrets this visitor has found. Lives in localStorage, so it survives reloads and is private to the browser.
const KEY = "secrets-found";
const valid = new Set(SECRETS.map((s) => s.id));
const listeners = new Set();

const read = () => {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(v) ? v.filter((id) => valid.has(id)) : [];
  } catch {
    return [];
  }
};
let found = read();
const commit = (next) => {
  found = next;
  try { localStorage.setItem(KEY, JSON.stringify(found)); } catch { /* private mode */ }
  listeners.forEach((l) => l());
};

export const getFound = () => found; // same array until something changes (works with useSyncExternalStore)
export const subscribe = (l) => { listeners.add(l); return () => listeners.delete(l); };
export const resetFound = () => commit([]);
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => { if (e.key === KEY) { found = read(); listeners.forEach((l) => l()); } });
}

const toast = (title, sub) => {
  const pill = document.createElement("div");
  pill.style.cssText = "display:flex;gap:.7rem;align-items:center;padding:.7rem 1.3rem;border-radius:999px;border:1px solid rgb(var(--accent2));background:rgb(var(--surface) / .94);color:rgb(var(--fg));font-family:var(--font-mono);font-size:11px;letter-spacing:.2em;text-transform:uppercase;text-align:center;max-width:min(92vw,560px);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);";
  pill.innerHTML = `<span style="color:rgb(var(--accent2))">&#9733;</span><span>${title}</span><span style="opacity:.6">/ ${sub}</span>`;
  showToast(pill, 3300);
};

// returns true the first time a secret is found
export const unlock = (id) => {
  if (!valid.has(id) || found.includes(id)) return false;
  commit([...found, id]);
  const s = SECRETS.find((x) => x.id === id);
  if (found.length === SECRETS.length) toast("Every secret found", `${found.length} / ${SECRETS.length}`);
  else toast("Secret unlocked", `${s.name} · ${found.length} / ${SECRETS.length}`);
  return true;
};
