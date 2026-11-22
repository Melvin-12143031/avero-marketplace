import { apiRequest } from "./api";

export const getCart = async () => {
  const response = await apiRequest("/cart");
  return response.data.cartItems;
};

export const addToCart = async (productId, quantity) => {
  const response = await apiRequest("/cart", {
    method: "POST",
    body: JSON.stringify({
      productId,
      quantity,
    }),
  });

  return response.data.cartItems;
};

export const updateCartItem = async (productId, quantity) => {
  const response = await apiRequest(`/cart/${productId}`, {
    method: "PATCH",
    body: JSON.stringify({
      quantity,
    }),
  });

  return response.data.cartItems;
};

export const removeCartItem = async (productId) => {
  const response = await apiRequest(`/cart/${productId}`, {
    method: "DELETE",
  });

  return response.data.cartItems;
};

export const clearCart = async () => {
  const response = await apiRequest("/cart", {
    method: "DELETE",
  });

  return response.data.cartItems;
};
