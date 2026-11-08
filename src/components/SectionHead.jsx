const SectionHead = ({ index, label, title }) => (
  <div className="mb-12 flex flex-wrap items-end justify-between gap-x-6 gap-y-3 sm:mb-20">
    <h2 data-glitch className="sh-title font-display text-[clamp(2.6rem,9vw,8rem)] font-extrabold leading-[0.9] tracking-[-0.04em]">
      {title}
    </h2>
    <p className="sh-meta pb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted sm:shrink-0 sm:text-right sm:text-xs sm:tracking-[0.25em]">
      <span className="text-accent">{index}</span> / <span data-scramble-in>{label}</span>
    </p>
  </div>
);
export default SectionHead;
