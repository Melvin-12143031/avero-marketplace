import { createContext, useContext, useEffect, useState } from "react";

import {
  login as loginUser,
  register as registerUser,
  getCurrentUser,
  logout as logoutUser,
} from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore the authenticated session when the app starts
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  // Login
  const login = async (credentials) => {
    const currentUser = await loginUser(credentials);

    setUser(currentUser);

    return currentUser;
  };

  // Register
  const register = async (userData) => {
    return await registerUser(userData);
  };

  // Logout
  const logout = async () => {
    try {
      await logoutUser();
    } finally {
      setUser(null);
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: Boolean(user),
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return context;
};
