import { TLink } from "../components/PageTransition";

const NotFound = () => (
  <main className="grid min-h-screen place-items-center px-5 text-center">
    <div>
      <p className="font-display text-[28vw] font-extrabold leading-none text-outline">404</p>
      <p className="mt-4 text-muted">That page doesn&apos;t exist.</p>
      <TLink to="/" className="mt-8 inline-block rounded-full bg-accent px-8 py-4 font-mono text-xs uppercase tracking-widest text-accent-ink">Back home</TLink>
    </div>
  </main>
);

export default NotFound;
