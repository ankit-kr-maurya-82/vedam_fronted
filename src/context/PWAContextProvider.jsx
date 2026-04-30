import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PWAContext from "./PWAContext";
import {
  activateWaitingServiceWorker,
  isPwaSupported,
  isStandaloneMode,
  registerAppServiceWorker,
  requestServiceWorkerUpdate,
} from "../lib/pwa";

const PWAContextProvider = ({ children }) => {
  const [isInstalled, setIsInstalled] = useState(isStandaloneMode);
  const [isInstallAvailable, setIsInstallAvailable] = useState(false);
  const [isOfflineReady, setIsOfflineReady] = useState(false);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [isOnline, setIsOnline] = useState(
    typeof navigator === "undefined" ? true : navigator.onLine
  );
  const deferredPromptRef = useRef(null);
  const registrationRef = useRef(null);
  const refreshingRef = useRef(false);

  const bindRegistration = useCallback((registration) => {
    if (!registration) {
      return;
    }

    registrationRef.current = registration;

    if (registration.waiting) {
      setIsUpdateAvailable(true);
    }

    if (registration.active) {
      setIsOfflineReady(true);
    }

    registration.addEventListener("updatefound", () => {
      const installingWorker = registration.installing;

      if (!installingWorker) {
        return;
      }

      installingWorker.addEventListener("statechange", () => {
        if (installingWorker.state !== "installed") {
          return;
        }

        if (navigator.serviceWorker.controller) {
          setIsUpdateAvailable(true);
          return;
        }

        setIsOfflineReady(true);
      });
    });
  }, []);

  const checkForUpdates = useCallback(async () => {
    if (!isPwaSupported()) {
      return null;
    }

    const registration = await requestServiceWorkerUpdate();
    bindRegistration(registration);
    return registration;
  }, [bindRegistration]);

  const applyUpdate = useCallback(() => {
    const registration = registrationRef.current;

    if (!registration?.waiting) {
      return;
    }

    refreshingRef.current = true;
    activateWaitingServiceWorker(registration);
  }, []);

  const promptInstall = useCallback(async () => {
    const deferredPrompt = deferredPromptRef.current;

    if (!deferredPrompt) {
      return false;
    }

    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    deferredPromptRef.current = null;
    setIsInstallAvailable(false);

    if (choice?.outcome === "accepted") {
      setIsInstalled(true);
      return true;
    }

    return false;
  }, []);

  useEffect(() => {
    if (!isPwaSupported()) {
      return undefined;
    }

    const register = async () => {
      try {
        const registration = await registerAppServiceWorker();
        bindRegistration(registration);
      } catch {}
    };

    register();

    const handleControllerChange = () => {
      if (refreshingRef.current) {
        window.location.reload();
      }
    };

    navigator.serviceWorker.addEventListener(
      "controllerchange",
      handleControllerChange
    );

    return () => {
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        handleControllerChange
      );
    };
  }, [bindRegistration]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      deferredPromptRef.current = event;
      setIsInstallAvailable(true);
    };

    const handleAppInstalled = () => {
      deferredPromptRef.current = null;
      setIsInstallAvailable(false);
      setIsInstalled(true);
    };

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const value = useMemo(
    () => ({
      isPwaSupported: isPwaSupported(),
      isInstalled,
      isInstallAvailable,
      isOfflineReady,
      isUpdateAvailable,
      isOnline,
      promptInstall,
      applyUpdate,
      checkForUpdates,
    }),
    [
      applyUpdate,
      checkForUpdates,
      isInstallAvailable,
      isInstalled,
      isOfflineReady,
      isOnline,
      isUpdateAvailable,
      promptInstall,
    ]
  );

  return <PWAContext.Provider value={value}>{children}</PWAContext.Provider>;
};

export default PWAContextProvider;
