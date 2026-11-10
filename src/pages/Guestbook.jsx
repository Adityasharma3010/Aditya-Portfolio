import { useEffect, useRef, useState } from "react";
import { gsap, SplitText, useGSAP, prefersReducedMotion } from "../lib/gsap";
import { noteDate } from "../data/notes";
import { useSeo } from "../hooks/useSeo";
import { TLink } from "../components/PageTransition";
import Magnetic from "../components/Magnetic";

const field = "w-full rounded-2xl border hairline bg-surface px-5 py-4 text-lg text-fg transition-colors placeholder:text-muted focus:border-accent";

// Messages are stored unapproved by /api/guestbook and only show here once approved in Supabase (see supabase/guestbook.sql).
const Guestbook = () => {
  const root = useRef(null);
  const opened = useRef(Date.now());
  const [load, setLoad] = useState({ state: "loading", entries: [], configured: true });
  const [form, setForm] = useState({ name: "", message: "" });
  const [trap, setTrap] = useState(""); // honeypot, real visitors never see or fill this
  const [status, setStatus] = useState({ type: "idle", text: "" });
  useSeo("Guestbook — Aditya Sharma", "Leave a short message for Aditya Sharma. Messages appear after approval.");

  useEffect(() => {
    const ctl = new AbortController();
    fetch("/api/guestbook", { signal: ctl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d) => setLoad({ state: "ready", entries: d.entries || [], configured: d.configured !== false }))
      .catch((e) => e.name !== "AbortError" && setLoad({ state: "error", entries: [], configured: true }));
    return () => ctl.abort();
  }, []);

  useGSAP(
    () => {
      const title = new SplitText(".gb-title", { type: "chars,lines", mask: "lines" });
      if (!prefersReducedMotion()) {
        gsap.from(title.chars, { yPercent: 120, duration: 1.1, ease: "power4.out", stagger: 0.03, delay: 0.9 });
        gsap.from(".gb-fade", { y: 30, opacity: 0, duration: 0.9, ease: "power3.out", stagger: 0.1, delay: 1.3 });
      }
      return () => title.revert();
    },
    { scope: root }
  );

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "loading", text: "" });
    try {
      const r = await fetch("/api/guestbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, website: trap, t: opened.current }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || "Something went wrong. Please try again.");
      setForm({ name: "", message: "" });
      opened.current = Date.now();
      setStatus({ type: "ok", text: "Thanks! Your message will appear here once I have approved it." });
    } catch (err) {
      setStatus({ type: "err", text: err.message });
    }
  };

  return (
    <main id="main" ref={root} className="min-h-screen px-5 pb-24 pt-36 sm:px-10">
      <div className="mx-auto max-w-[1500px]">
        <TLink to="/" className="font-mono text-xs uppercase tracking-widest text-muted hover:text-fg">← Home</TLink>
        <h1 className="gb-title mt-8 font-display text-[clamp(3rem,11vw,10rem)] font-extrabold leading-[0.9] tracking-[-0.04em]">Guestbook<span className="text-accent">.</span></h1>
        <p className="gb-fade mt-6 max-w-xl text-lg text-muted">Say hi, leave a note, tell me what you liked. I read every message and approve them before they show up here.</p>

        <div className="mt-20 grid gap-16 lg:grid-cols-[1fr_1.4fr]">
          {load.configured && (
            <form onSubmit={onSubmit} className="gb-fade space-y-4 self-start">
              <input className={field} name="name" value={form.name} onChange={onChange} placeholder="Your name" aria-label="Your name" maxLength={60} required autoComplete="name" />
              <input type="text" name="hp_field" value={trap} onChange={(e) => setTrap(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />
              <textarea className={`${field} resize-none`} rows={4} name="message" value={form.message} onChange={onChange} placeholder="A short message (no links, please)" aria-label="Your message" minLength={3} maxLength={280} required />
              <p className="text-right font-mono text-[11px] uppercase tracking-widest text-muted">{form.message.length} / 280</p>
              <div className="flex flex-wrap items-center gap-4">
                <Magnetic>
                  <button type="submit" disabled={status.type === "loading"} data-cursor="Send" className="rounded-full bg-accent px-9 py-5 font-mono text-xs font-medium uppercase tracking-widest text-accent-ink disabled:opacity-60">
                    {status.type === "loading" ? "Sending..." : "Sign the guestbook →"}
                  </button>
                </Magnetic>
                <p role="status" className={`text-sm ${status.type === "err" ? "text-red-500" : "text-muted"}`}>{status.text}</p>
              </div>
            </form>
          )}

          <section aria-label="Messages" className="gb-fade min-w-0">
            <h2 className="font-mono text-xs uppercase tracking-widest text-muted">Messages{load.state === "ready" ? ` (${load.entries.length})` : ""}</h2>
            {load.state === "loading" && <p className="mt-6 text-muted">Loading…</p>}
            {load.state === "error" && <p className="mt-6 text-muted">Could not load the messages right now. Please try again in a moment.</p>}
            {load.state === "ready" && !load.configured && <p className="mt-6 text-muted">The guestbook is not switched on yet. Check back soon.</p>}
            {load.state === "ready" && load.configured && load.entries.length === 0 && <p className="mt-6 text-muted">No messages yet. Be the first.</p>}
            <ul className="mt-6 border-t hairline">
              {load.entries.map((m) => (
                <li key={m.id} className="border-b hairline py-6">
                  <p className="break-words text-lg leading-relaxed">{m.message}</p>
                  <p className="mt-3 font-mono text-[11px] uppercase tracking-widest text-muted">
                    <span className="text-accent">{m.name}</span> · {noteDate(m.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </main>
  );
};

export default Guestbook;
