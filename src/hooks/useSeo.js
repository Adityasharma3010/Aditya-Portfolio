import { useEffect } from "react";

const setMeta = (attr, key, value) => {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", value);
};

// Keeps the tab title and meta tags right while you navigate inside the app.
// (The built HTML for each route already has them for crawlers, see scripts/vite-seo.mjs.)
export const useSeo = (title, description, path) => {
  useEffect(() => {
    if (title) document.title = title;
    if (description) {
      setMeta("name", "description", description);
      setMeta("property", "og:description", description);
      setMeta("name", "twitter:description", description);
    }
    if (title) {
      setMeta("property", "og:title", title);
      setMeta("name", "twitter:title", title);
    }
    const url = window.location.origin + (path ?? window.location.pathname);
    setMeta("property", "og:url", url);
    let link = document.head.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = url;
  }, [title, description, path]);
};
