import axios from "./axios.js";

export const getRazorpayKey = async () => {
  try {
    const response = await axios.get("/payments/razorpay-key");
    return response.data?.data?.key;
  } catch (error) {
    console.error("Failed to fetch Razorpay key:", error);
    throw error;
  }
};

export const createPaymentOrder = async (userId) => {
  try {
    const response = await axios.post("/payments/create-order", { userId });
    return response.data?.data;
  } catch (error) {
    console.error("Failed to create payment order:", error);
    throw error;
  }
};

export const verifyPayment = async (paymentData) => {
  try {
    const response = await axios.post("/payments/verify-payment", paymentData);
    return response.data?.data;
  } catch (error) {
    console.error("Payment verification failed:", error);
    throw error;
  }
};
