import { apiRequest } from "./api";

export const getAdminProducts = async (
  page = 1,
  limit = 10,
  search = "",
  status = "all",
) => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    search,
    status,
  });

  const response = await apiRequest(`/products/admin/all?${params.toString()}`);

  return response.data;
};

export const createProduct = async (productData) => {
  const response = await apiRequest("/products", {
    method: "POST",
    body: JSON.stringify(productData),
  });
  return response.data.product;
};

export const updateProduct = async (productId, productData) => {
  const response = await apiRequest(`/products/${productId}`, {
    method: "PUT",
    body: JSON.stringify(productData),
  });
  return response.data.product;
};

export const deactivateProduct = async (productId) => {
  const response = await apiRequest(`/products/${productId}`, {
    method: "DELETE",
  });
  return response;
};

export const updateProductStatus = async (productId, isActive) => {
  const response = await apiRequest(`/products/${productId}/status`, {
    method: "PATCH",
    body: JSON.stringify({
      is_active: isActive,
    }),
  });
  return response.data.product;
};

export const uploadProductImage = async (imagefile) => {
  const formData = new FormData();
  formData.append("image", imagefile);
  const response = await apiRequest("/products/upload-image", {
    method: "POST",
    body: formData,
  });
  return response.data.image;
};
