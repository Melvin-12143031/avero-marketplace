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

export const refundPayment = async (paymentId) => {
  const response = await apiRequest(`/payments/${paymentId}/refund`, {
    method: "POST",
  });

  return response.data.payment;
};

export const getOrderPaymentHistory = async (orderId) => {
  const response = await apiRequest(`/payments/orders/${orderId}/history`);

  return response.data.payments;
};
