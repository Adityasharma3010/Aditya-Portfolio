import { useEffect, useMemo, useRef, useState } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "../lib/gsap";
import { profile, projects } from "../data";
import SectionHead from "./SectionHead";

const WEEKS = 26;
const CACHE = "gh-activity-v2";

// repo name (as GitHub returns it) -> project name shown on the site
const projectName = (repo) =>
  projects.find((p) =>
    p.source.toLowerCase().endsWith(`/${repo.toLowerCase()}`),
  )?.name || repo;

const ago = (iso) => {
  const s = (Date.now() - new Date(iso)) / 1000;
  if (s < 3600) return `${Math.max(1, Math.round(s / 60))}m ago`;
  if (s < 86400) return `${Math.round(s / 3600)}h ago`;
  if (s < 86400 * 30) return `${Math.round(s / 86400)}d ago`;
  return `${Math.round(s / 86400 / 30)}mo ago`;
};

// Live from /api/github: a 26 week activity strip and the latest commits.
const GithubActivity = () => {
  const root = useRef(null);
  const [data, setData] = useState(null);
  const [state, setState] = useState("loading"); // loading | ok | error

  useEffect(() => {
    let cancelled = false;
    try {
      const hit = JSON.parse(sessionStorage.getItem(CACHE) || "null");
      if (hit && Date.now() - hit.at < 10 * 60 * 1000) {
        setData(hit.data);
        setState("ok");
        return;
      }
    } catch {
      /* ignore */
    }
    fetch("/api/github")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d) => {
        if (cancelled) return;
        setData(d);
        setState("ok");
        try {
          sessionStorage.setItem(
            CACHE,
            JSON.stringify({ at: Date.now(), data: d }),
          );
        } catch {
          /* ignore */
        }
      })
      .catch(() => !cancelled && setState("error"));
    return () => {
      cancelled = true;
    };
  }, []);

  // grid of the last 26 weeks, Sunday first, oldest column on the left
  const grid = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(today);
    start.setDate(start.getDate() - ((WEEKS - 1) * 7 + today.getDay()));
    const cells = [];
    for (let w = 0; w < WEEKS; w++)
      for (let d = 0; d < 7; d++) {
        const dt = new Date(start);
        dt.setDate(start.getDate() + w * 7 + d);
        if (dt > today) {
          cells.push(null);
          continue;
        }
        const key = dt.toLocaleDateString("en-CA");
        cells.push({ key, count: data?.days?.[key] || 0, w, d });
      }
    const max = Math.max(1, ...cells.filter(Boolean).map((c) => c.count));
    return { cells, max };
  }, [data]);

  const level = (n) =>
    n === 0 ? 0 : Math.min(4, Math.ceil((n / grid.max) * 4));
  const alpha = [0, 0.28, 0.5, 0.75, 1];

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from(".sh-title, .sh-meta", {
        yPercent: 40,
        opacity: 0,
        duration: 1.1,
        ease: "power4.out",
        stagger: 0.1,
        scrollTrigger: { trigger: root.current, start: "top 75%" },
      });
      if (state !== "ok" || prefersReducedMotion()) return;
      // cells ripple in diagonally from the top-left, commits slide in after
      gsap.from(".gh-cell", {
        scale: 0,
        opacity: 0,
        duration: 0.5,
        ease: "back.out(2)",
        stagger: { each: 0.004, grid: [WEEKS, 7], from: "start", axis: "x" },
        scrollTrigger: { trigger: ".gh-grid", start: "top 85%" },
      });
      gsap.from(".gh-commit", {
        x: -30,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.07,
        scrollTrigger: { trigger: ".gh-commits", start: "top 85%" },
      });
      gsap.from(".gh-stat", {
        y: 30,
        opacity: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: { trigger: ".gh-stats", start: "top 90%" },
      });
    },
    { scope: root, dependencies: [state] },
  );

  const total = data?.total ?? 0;
  const activeDays = grid.cells.filter((c) => c && c.count > 0).length;

  return (
    <section id="activity" ref={root} className="px-5 py-28 sm:px-10 sm:py-44">
      <div className="mx-auto max-w-[1500px]">
        <SectionHead
          index="04"
          label="Activity"
          title={
            <>
              Shipping<span className="text-accent">.</span>
            </>
          }
        />

        {state === "error" && (
          <p className="font-mono text-sm text-muted">
            Live activity is unavailable right now.{" "}
            <a
              href={profile.github}
              target="_blank"
              rel="noreferrer"
              className="text-accent underline-offset-4 hover:underline"
            >
              See my GitHub ↗
            </a>
          </p>
        )}

        {state !== "error" && (
          <div className="grid gap-14 lg:grid-cols-[1.35fr_1fr]">
            <div>
              <div className="grid grid-cols-3 gap-6 mb-8 gh-stats">
                {[
                  ["Contributions", state === "ok" ? total : "–"],
                  ["Active days", state === "ok" ? activeDays : "–"],
                  ["Weeks shown", WEEKS],
                ].map(([k, v]) => (
                  <div key={k} className="pt-3 border-t gh-stat hairline">
                    <p className="text-4xl font-extrabold tracking-tight font-display sm:text-5xl">
                      {v}
                    </p>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted">
                      {k}
                    </p>
                  </div>
                ))}
              </div>

              <div className="pb-2 overflow-x-auto">
                <div
                  className="gh-grid grid min-w-[560px] auto-cols-fr grid-flow-col grid-rows-7 gap-[3px]"
                  role="img"
                  aria-label={`${total} contributions in the last ${WEEKS} weeks`}
                >
                  {grid.cells.map((c, i) =>
                    c ? (
                      <span
                        key={i}
                        title={`${c.count} contribution${c.count === 1 ? "" : "s"} on ${c.key}`}
                        className={`gh-cell aspect-square w-full ${state === "loading" ? "animate-pulse" : ""}`}
                        style={{
                          background: level(c.count)
                            ? `rgb(var(--accent) / ${alpha[level(c.count)]})`
                            : "rgb(var(--fg) / 0.08)",
                        }}
                      />
                    ) : (
                      <span key={i} />
                    ),
                  )}
                </div>
              </div>
              <p className="mt-4 font-mono text-[10px] uppercase tracking-widest text-muted">
                Last {WEEKS} weeks ·{" "}
                {data?.source === "graphql"
                  ? "GitHub contribution calendar"
                  : "commits on my repos"}
              </p>
            </div>

            <div className="gh-commits">
              <p className="mb-4 font-mono text-[11px] uppercase tracking-widest text-muted">
                Latest commits
              </p>
              <ul className="divide-y divide-line/10 border-y hairline">
                {(data?.recent || Array.from({ length: 5 }))
                  .slice(0, 6)
                  .map((c, i) =>
                    c ? (
                      <li key={c.url + i} className="gh-commit">
                        <a
                          href={c.url}
                          target="_blank"
                          rel="noreferrer"
                          data-cursor="Open"
                          className="group flex items-baseline justify-between gap-4 py-3.5"
                        >
                          <span className="min-w-0">
                            <span className="block font-mono text-[11px] uppercase tracking-widest text-accent">
                              {projectName(c.repo)}
                            </span>
                            <span className="block text-sm truncate transition-transform duration-300 group-hover:translate-x-1">
                              {c.message}
                            </span>
                          </span>
                          <span className="shrink-0 font-mono text-[11px] text-muted">
                            {ago(c.date)}
                          </span>
                        </a>
                      </li>
                    ) : (
                      <li key={i} className="py-3.5">
                        <span className="block h-8 animate-pulse bg-fg/[0.06]" />
                      </li>
                    ),
                  )}
              </ul>
              <a
                href={profile.github}
                target="_blank"
                rel="noreferrer"
                data-cursor="GitHub"
                className="inline-block mt-5 font-mono text-xs tracking-widest uppercase text-accent underline-offset-8 hover:underline"
              >
                All repositories ↗
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default GithubActivity;
