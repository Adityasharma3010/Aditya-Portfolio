import { Suspense, lazy } from "react";
import { useBuilder } from "../context/Builder";

// Builder mode for any page: drop <BuilderMount /> as the last child of the page's <main>.
// The engine is only downloaded when Builder mode is on, and starts downloading right away for people who use it.
const wantsBuilder = typeof localStorage !== "undefined" && localStorage.getItem("builder") === "on";
const builderChunk = wantsBuilder ? import("./BuilderFX") : null;
const BuilderFX = lazy(() => builderChunk || import("./BuilderFX"));

// `ready`: false while the page is still covered by something (the home loader), so nothing is built unseen
const BuilderMount = ({ ready = true }) => {
  const { active } = useBuilder();
  if (!active) return null;
  return (
    <Suspense fallback={<div className="fixed inset-0 z-[44] bg-bg" aria-hidden="true" />}>
      <BuilderFX ready={ready} />
    </Suspense>
  );
};

export default BuilderMount;
