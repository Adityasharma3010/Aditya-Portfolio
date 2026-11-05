const SectionHead = ({ index, label, title }) => (
  <div className="mb-12 flex items-end justify-between gap-6 sm:mb-20">
    <h2 data-glitch className="sh-title font-display text-[clamp(2.6rem,9vw,8rem)] font-extrabold leading-[0.9] tracking-[-0.04em]">
      {title}
    </h2>
    <p className="sh-meta shrink-0 pb-2 text-right font-mono text-xs uppercase tracking-[0.25em] text-muted">
      <span className="text-accent">{index}</span> / <span data-scramble-in>{label}</span>
    </p>
  </div>
);
export default SectionHead;
