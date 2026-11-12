import { apiRequest } from "./api";

// Retrieve paginated products and inventory statistics for admin
export const getAdminProducts = async (page = 1, limit = 10, search = "") => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    search,
  });

  const response = await apiRequest(`/products/admin/all?${params.toString()}`);

  return response.data;
};

// Retrieve products with low stock
export const getLowStockProducts = async (page = 1, limit = 10) => {
  const response = await apiRequest(
    `/products/admin/all?page=${page}&limit=${limit}`,
  );
  return response.data;
};

// Adjust product stock
export const adjustStock = async (productId, stockData) => {
  const response = await apiRequest(`/inventory/${productId}/stock`, {
    method: "PATCH",
    body: JSON.stringify(stockData),
  });

  return response.data;
};

// Retrieve inventory movement history
export const getInventoryMovements = async (
  productId,
  page = 1,
  limit = 10,
) => {
  const response = await apiRequest(
    `/inventory/${productId}/movements?page=${page}&limit=${limit}`,
  );

  return response.data;
};
