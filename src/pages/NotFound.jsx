import { TLink } from "../components/PageTransition";
import { useEffect } from "react";
import { useSeo } from "../hooks/useSeo";
import { unlock } from "../lib/achievements";

const NotFound = () => {
  useSeo("Page not found — Aditya Sharma", "This page does not exist.");
  useEffect(() => { unlock("lost"); }, []);
  return (
  <main id="main" className="grid min-h-screen place-items-center px-5 text-center">
    <div>
      <p className="font-display text-[28vw] font-extrabold leading-none text-outline">404</p>
      <p className="mt-4 text-muted">That page doesn&apos;t exist.</p>
      <p className="mt-2 font-mono text-[11px] uppercase tracking-widest text-muted/60">some doors open from the keyboard</p>
      <p className="mt-2 font-mono text-[11px] uppercase tracking-widest text-muted/40">what broke here is probably written down somewhere</p>
      <TLink to="/" className="mt-8 inline-block rounded-full bg-accent px-8 py-4 font-mono text-xs uppercase tracking-widest text-accent-ink">Back home</TLink>
    </div>
  </main>
  );
};

export default NotFound;
