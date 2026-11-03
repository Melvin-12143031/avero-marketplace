export const API_BASE_URL = "http://localhost:5000/api";

const apiRequest = async (endpoint, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json();
};

export const getProducts = async () => {
  const response = await apiRequest("/products");

  return response.data.products;
};

export const getCategories = async () => {
  const response = await apiRequest("/categories");

  return response.data.categories;
};

export { apiRequest };
