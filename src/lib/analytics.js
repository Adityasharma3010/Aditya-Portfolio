// Privacy-friendly analytics: Vercel Web Analytics (no cookies, no personal data, no consent banner needed).
// Loaded straight from Vercel, so there is no extra package. To switch it on: Vercel dashboard > your project >
// Analytics > Enable. Page views (including route changes) then show up there.
//
// It only runs on the real site: not in `npm run dev`, not on localhost, and not when the browser sends Do Not Track.
export const initAnalytics = () => {
  if (!import.meta.env.PROD) return;
  if (["localhost", "127.0.0.1", "[::1]"].includes(window.location.hostname)) return;
  if (navigator.doNotTrack === "1" || window.doNotTrack === "1") return;
  window.va = window.va || function va() { (window.vaq = window.vaq || []).push(arguments); };
  const s = document.createElement("script");
  s.defer = true;
  s.src = "/_vercel/insights/script.js";
  document.head.appendChild(s);
};
