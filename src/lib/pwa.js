const APP_SW_PATH = "/push-sw.js";

let registrationPromise = null;

export const isPwaSupported = () =>
  typeof window !== "undefined" && "serviceWorker" in navigator;

export const isStandaloneMode = () =>
  typeof window !== "undefined" &&
  (window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true);

export const registerAppServiceWorker = async () => {
  if (!isPwaSupported()) {
    return null;
  }

  if (!registrationPromise) {
    registrationPromise = navigator.serviceWorker
      .register(APP_SW_PATH, { scope: "/" })
      .catch((error) => {
        registrationPromise = null;
        throw error;
      });
  }

  return registrationPromise;
};

export const requestServiceWorkerUpdate = async () => {
  const registration = await registerAppServiceWorker();
  await registration?.update?.();
  return registration;
};

export const activateWaitingServiceWorker = (registration) => {
  registration?.waiting?.postMessage({ type: "SKIP_WAITING" });
};
