const PUSH_SW_PATH = "/push-sw.js";

let registrationPromise = null;

const urlBase64ToUint8Array = (base64String) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let index = 0; index < rawData.length; index += 1) {
    outputArray[index] = rawData.charCodeAt(index);
  }

  return outputArray;
};

export const isPushSupported = () =>
  typeof window !== "undefined" &&
  "serviceWorker" in navigator &&
  "PushManager" in window &&
  "Notification" in window;

export const registerPushServiceWorker = async () => {
  if (!isPushSupported()) {
    return null;
  }

  if (!registrationPromise) {
    registrationPromise = navigator.serviceWorker
      .register(PUSH_SW_PATH, { scope: "/" })
      .catch((error) => {
        registrationPromise = null;
        throw error;
      });
  }

  return registrationPromise;
};

export const getPushPermissionState = () => {
  if (!isPushSupported()) {
    return "unsupported";
  }

  return window.Notification.permission;
};

export const getExistingPushSubscription = async () => {
  if (!isPushSupported()) {
    return null;
  }

  await registerPushServiceWorker();
  const registration = await navigator.serviceWorker.ready;
  return registration.pushManager.getSubscription();
};

export const subscribeToPushNotifications = async (publicKey) => {
  if (!isPushSupported()) {
    throw new Error("This browser does not support push notifications.");
  }

  await registerPushServiceWorker();

  let permission = window.Notification.permission;
  if (permission !== "granted") {
    permission = await window.Notification.requestPermission();
  }

  if (permission !== "granted") {
    throw new Error("Notification permission was not granted.");
  }

  const registration = await navigator.serviceWorker.ready;
  const existingSubscription = await registration.pushManager.getSubscription();

  if (existingSubscription) {
    return existingSubscription;
  }

  return registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey),
  });
};

export const unsubscribeFromPushNotifications = async () => {
  const subscription = await getExistingPushSubscription();

  if (!subscription) {
    return null;
  }

  await subscription.unsubscribe();
  return subscription;
};
