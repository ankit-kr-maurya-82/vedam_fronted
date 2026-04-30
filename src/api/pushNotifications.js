import api from "./axios";

export const fetchPushPublicKey = async () => {
  const response = await api.get("/notifications/push/public-key");
  return response.data?.publicKey || "";
};

export const savePushSubscription = async (subscription) => {
  await api.post("/notifications/push/subscribe", {
    subscription,
  });
};

export const removePushSubscription = async (endpoint) => {
  await api.delete("/notifications/push/subscribe", {
    data: {
      endpoint,
    },
  });
};
