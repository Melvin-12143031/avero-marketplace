import { apiRequest } from "./api";

export const createPayment = async (orderId, paymentMethod) => {
  const response = await apiRequest("/payments", {
    method: "POST",
    body: JSON.stringify({
      orderId,
      paymentMethod,
    }),
  });
  return response.data.payment;
};
