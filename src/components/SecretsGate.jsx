import { Suspense, lazy, useEffect, useState } from "react";

const SecretsPanel = lazy(() => import("./SecretsPanel"));

// opens the panel once its code has arrived (the first request came before it was there)
const Replay = () => {
  useEffect(() => {
    window.dispatchEvent(new Event("open-secrets"));
  }, []);
  return null;
};

// The panel is only loaded the first time somebody asks for it (the "Secrets" entry in the command palette).
const SecretsGate = () => {
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (on) return;
    const h = () => setOn(true);
    window.addEventListener("open-secrets", h);
    return () => window.removeEventListener("open-secrets", h);
  }, [on]);
  if (!on) return null;
  return (
    <Suspense fallback={null}>
      <SecretsPanel />
      <Replay />
    </Suspense>
  );
};

export default SecretsGate;
