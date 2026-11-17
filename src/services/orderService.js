import { apiRequest } from "./api";

export const createOrder = async (shippingInfo, cartItems) => {
  const orderData = {
    customer: {
      fullName: shippingInfo.fullName.trim(),
      email: shippingInfo.email.trim(),
      phone: shippingInfo.phone.trim(),
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

    payment: order.payment
      ? {
          ...order.payment,
          paymentMethod: order.payment.payment_method,
          paymentReference: order.payment.payment_reference,
          paidAt: order.payment.paid_at,
          paymentCreatedAt: order.payment.created_at,
        }
      : null,
  };
};

export const formatPrice = (amount) => {
  return `PHP ${Number(amount).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const getAdminOrders = async (
  page = 1,
  limit = 10,
  status = "",
  search = "",
) => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (status) {
    params.set("status", status);
  }

  if (search) {
    params.set("search", search);
  }

  const response = await apiRequest(`/orders/admin/all?${params.toString()}`);

  return {
    orders: response.data.orders,
    pagination: response.pagination,
  };
};

export const getAdminOrderById = async (orderId) => {
  const response = await apiRequest(`/orders/admin/${orderId}`);
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
    payment: order.payment
      ? {
          ...order.payment,
          paymentMethod: order.payment.payment_method,
          paymentReference: order.payment.payment_reference,
          paidAt: order.payment.paid_at,
          paymentCreatedAt: order.payment.created_at,
        }
      : null,
  };
};

export const getOrderStatistics = async () => {
  const response = await apiRequest(`/orders/admin/statistics`);
  return response.data.statistics;
};

export const updateOrderStatus = async (orderId, status) => {
  const response = await apiRequest(`/orders/${orderId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  return response.data.order;
};
