import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";

import Header from "./components/layout/Header";
import AdminLayout from "./components/layout/AdminLayout";
import Cart from "./components/cart/Cart";
import HomePage from "./pages/HomePage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import OrderHistoryPage from "./pages/OrderHistoryPage";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";

import AdminRoute from "./components/auth/AdminRoute";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";

import useLocalStorage from "./hooks/useLocalStorage";
import { isValidCart, isValidProduct } from "./features/cart/cartUtils";

import InventoryPage from "./pages/admin/InventoryPage";
import ProductsPage from "./pages/admin/ProductsPage";
import OrdersPage from "./pages/admin/OrdersPage";

const App = () => {
  const [cartItems, setCartItems] = useLocalStorage(
    "marketplace-cart",
    [],
    isValidCart,
  );
  const [isCartOpen, setIsCartOpen] = useState(false);

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const handleAddToCart = (product) => {
    if (!isValidProduct(product)) {
      console.error("Invalid product:", product);
      return;
    }

    setCartItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.id === product.id);

      if (existingItem) {
        return currentItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      return [...currentItems, { ...product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (!Number.isInteger(newQuantity) || newQuantity < 0) {
      return;
    }

    setCartItems((currentItems) =>
      currentItems
        .map((item) =>
          item.id === productId ? { ...item, quantity: newQuantity } : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const handleRemoveFromCart = (productId) => {
    setCartItems((currentItems) =>
      currentItems.filter((item) => item.id !== productId),
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Toaster position="top-right" richColors />
      <Header cartCount={cartCount} onCartClick={() => setIsCartOpen(true)} />

      <Routes>
        <Route path="/" element={<HomePage onAddToCart={handleAddToCart} />} />

        <Route path="/login" element={<LoginPage />} />

        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/admin/inventory" element={<InventoryPage />} />
              <Route path="/admin/products" element={<ProductsPage />} />
              <Route path="/admin/orders" element={<OrdersPage />} />
            </Route>
          </Route>
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route
            path="/checkout"
            element={
              <CheckoutPage
                cartItems={cartItems}
                onClearCart={() => setCartItems([])}
              />
            }
          />

          <Route path="/orders" element={<OrderHistoryPage />} />
        </Route>

        <Route
          path="/order-confirmation/:orderId"
          element={<OrderConfirmationPage />}
        />
      </Routes>

      {isCartOpen && (
        <Cart
          cartItems={cartItems}
          onClose={() => setIsCartOpen(false)}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveFromCart={handleRemoveFromCart}
        />
      )}
    </div>
  );
};

export default App;
