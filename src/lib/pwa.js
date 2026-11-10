// PWA: registers the service worker (production only) and keeps the browser's install prompt for the palette.
let deferred = null;

export const initPwa = () => {
  // capture this early: browsers fire it once, shortly after load
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferred = e;
  });
  window.addEventListener("appinstalled", () => (deferred = null));

  if (!import.meta.env.PROD || !("serviceWorker" in navigator)) return;
  window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(() => {}));
};

export const isInstalled = () => window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
export const canInstall = () => deferred !== null;

// true when the person accepted the install dialog
export const installApp = async () => {
  if (!deferred) return false;
  deferred.prompt();
  const { outcome } = await deferred.userChoice;
  deferred = null;
  return outcome === "accepted";
};
