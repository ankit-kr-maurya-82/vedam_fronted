import { registerAppServiceWorker } from "./pwa";

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

export const registerPushServiceWorker = async () =>
  isPushSupported() ? registerAppServiceWorker() : null;

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

const subscribeWithPublicKey = (registration, publicKey) =>
  registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey),
  });

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
  await registration.update().catch(() => {});
  const existingSubscription = await registration.pushManager.getSubscription();

  if (existingSubscription) {
    return existingSubscription;
  }

  try {
    return await subscribeWithPublicKey(registration, publicKey);
  } catch (error) {
    const staleSubscription = await registration.pushManager
      .getSubscription()
      .catch(() => null);

    if (staleSubscription) {
      await staleSubscription.unsubscribe().catch(() => {});
    }

    const freshRegistration = await navigator.serviceWorker.ready;

    try {
      return await subscribeWithPublicKey(freshRegistration, publicKey);
    } catch (retryError) {
      const message =
        retryError?.message ||
        error?.message ||
        "Push service registration failed.";

      throw new Error(message);
    }
  }
};

export const unsubscribeFromPushNotifications = async () => {
  const subscription = await getExistingPushSubscription();

  if (!subscription) {
    return null;
  }

  await subscription.unsubscribe();
  return subscription;
};
