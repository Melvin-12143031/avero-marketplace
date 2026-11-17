export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const apiRequest = async (endpoint, options = {}) => {
  const { headers, body, ...fetchOptions } = options;

  const isFormData = body instanceof FormData;

  let response;

  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...fetchOptions,
      body,
      credentials: "include",
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...headers,
      },
    });
  } catch {
    throw new Error(
      "Unable to connect to the server. Please check your connection.",
    );
  }

  const contentType = response.headers.get("content-type");
  let data = {};

  if (contentType?.includes("application/json")) {
    try {
      data = await response.json();
    } catch {
      data = {};
    }
  }

  if (!response.ok) {
    throw new Error(data.message || `API request failed: ${response.status}`);
  }

  return data;
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
