import { createContext } from "react";

const PWAContext = createContext({
  isPwaSupported: false,
  isInstalled: false,
  isInstallAvailable: false,
  isOfflineReady: false,
  isUpdateAvailable: false,
  isOnline: true,
  promptInstall: async () => false,
  applyUpdate: () => {},
  checkForUpdates: async () => {},
});

export default PWAContext;
