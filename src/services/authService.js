import { apiRequest } from "./api";

// Register a new customer account
export const register = async (userData) => {
  const response = await apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify(userData),
  });

  return response.data.user;
};

// Login and receive the authenticated user
// The browser automatically stores the HTTP-only cookie
export const login = async (credentials) => {
  const response = await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });

  return response.data.user;
};

// Restore the authenticated user's session
export const getCurrentUser = async () => {
  const response = await apiRequest("/auth/me");

  return response.user;
};

// Logout and clear the authentication cookie
export const logout = async () => {
  await apiRequest("/auth/logout", {
    method: "POST",
  });
};
