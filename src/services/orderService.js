import { apiRequest } from "./api";

export const createOrder = async (shippingInfo, cartItems) => {
  const orderData = {
    customer: {
      fullName: shippingInfo.fullName.trim(),
      email: shippingInfo.email.trim(),
      Phone: shippingInfo.phone.trim(),
    },

    shippingAddress: {
      address: shippingInfo.address.trim(),
      city: shippingInfo.city.trim(),
      province: shippingInfo.province.trim(),
      postalCode: shippingInfo.postalCode.trim(),
    },

    items: cartItems.map((item) => ({
      productId: item.id,
      quantity: item.quantity,
    })),
  };

  const response = await apiRequest("/orders", {
    method: "POST",
    body: JSON.stringify(orderData),
  });
  return response.data.order;
};

export const getOrders = async () => {
  const response = await apiRequest("/orders");

  return response.data.orders;
};

export const getOrderById = async (orderId) => {
  const response = await apiRequest(`/orders/${orderId}`);

  const order = response.data.order;

  return {
    ...order,
    orderNumber: order.order_number,
    createdAt: order.created_at,
    shippingFee: order.shipping_fee,
    paymentStatus: order.payment_status,
    customer: order.shipping_address.customer,
    shippingAddress: order.shipping_address.shippingAddress,
    items: order.items.map((item) => ({
      ...item,
      productId: item.product_id,
      name: item.product_name,
      price: item.unit_price,
    })),
  };
};

export const formatPrice = (amount) => {
  return `PHP ${Number(amount).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};
