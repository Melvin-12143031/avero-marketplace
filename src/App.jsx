import { useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { Toaster, toast } from "sonner";

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

import InventoryPage from "./pages/admin/InventoryPage";
import ProductsPage from "./pages/admin/ProductsPage";
import OrdersPage from "./pages/admin/OrdersPage";
import CustomersPage from "./pages/admin/CustomersPage";
import StorefrontLayout from "./components/layout/StorefrontLayout";
import ShopPage from "./pages/ShopPage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import AboutPage from "./pages/AboutPage";
import HelpPage from "./pages/HelpPage";
import ContactPage from "./pages/ContactPage";
import ContactInquiriesPage from "@/pages/admin/ContactInquiries";

import { useAuth } from "./app/AuthContext";

import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "./services/cartService";

const App = () => {
  const navigate = useNavigate();
  const { user, isLoading: isAuthLoading } = useAuth();

  const [cartItems, setCartItems] = useState([]);
  const [isCartLoading, setIsCartLoading] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const visibleCartItems = user ? cartItems : [];

  const cartCount = visibleCartItems.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  // Load the authenticated customer's cart

  useEffect(() => {
    if (isAuthLoading || !user) return;

    let isCancelled = false;

    const loadCart = async () => {
      setIsCartLoading(true);

      try {
        const items = await getCart();

        if (!isCancelled) {
          setCartItems(items);
        }
      } catch (error) {
        if (!isCancelled) {
          console.error("Failed to load cart:", error);
          toast.error(error.message || "Failed to load your cart.");
        }
      } finally {
        if (!isCancelled) {
          setIsCartLoading(false);
        }
      }
    };

    loadCart();

    return () => {
      isCancelled = true;
    };
  }, [user, isAuthLoading]);

  // Add product to cart
  const handleAddToCart = async (product) => {
    if (!user) {
      toast.error("Please log in to add products to your cart.");
      navigate("/login");
      return;
    }

    try {
      const updatedCart = await addToCart(product.id, 1);

      setCartItems(updatedCart);
      toast.success("Product added to cart.");
    } catch (error) {
      toast.error(error.message || "Failed to add product to cart.");
    }
  };

  // Update cart item quantity
  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (!Number.isInteger(newQuantity) || newQuantity < 0) {
      return;
    }

    try {
      const updatedCart =
        newQuantity === 0
          ? await removeCartItem(productId)
          : await updateCartItem(productId, newQuantity);

      setCartItems(updatedCart);
    } catch (error) {
      toast.error(error.message || "Failed to update cart.");
    }
  };

  // Remove product from cart
  const handleRemoveFromCart = async (productId) => {
    try {
      const updatedCart = await removeCartItem(productId);

      setCartItems(updatedCart);
      toast.success("Product removed from cart.");
    } catch (error) {
      toast.error(error.message || "Failed to remove product.");
    }
  };

  // Clear the authenticated customer's cart
  const handleClearCart = async () => {
    try {
      const updatedCart = await clearCart();

      setCartItems(updatedCart);
    } catch (error) {
      toast.error(error.message || "Failed to clear your cart.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Toaster position="top-right" richColors />

      <Routes>
        {/* Customer storefront */}
        <Route
          element={
            <StorefrontLayout
              cartCount={cartCount}
              onCartClick={() => setIsCartOpen(true)}
            />
          }
        >
          <Route
            path="/"
            element={<HomePage onAddToCart={handleAddToCart} />}
          />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route
            path="/shop"
            element={<ShopPage onAddToCart={handleAddToCart} />}
          />

          <Route
            path="/products/:id"
            element={<ProductDetailsPage onAddToCart={handleAddToCart} />}
          />

          <Route path="/login" element={<LoginPage />} />

          <Route path="/register" element={<RegisterPage />} />

          <Route
            path="/order-confirmation/:orderId"
            element={<OrderConfirmationPage />}
          />

          {/* Protected customer routes */}
          <Route element={<ProtectedRoute />}>
            <Route
              path="/checkout"
              element={
                <CheckoutPage
                  cartItems={cartItems}
                  onClearCart={handleClearCart}
                />
              }
            />

            <Route path="/orders" element={<OrderHistoryPage />} />
          </Route>
        </Route>

        {/* Admin application — separate from storefront layout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/admin/inventory" element={<InventoryPage />} />
              <Route path="/admin/products" element={<ProductsPage />} />
              <Route path="/admin/orders" element={<OrdersPage />} />
              <Route path="/admin/customers" element={<CustomersPage />} />
              <Route path="/admin/contact" element={<ContactInquiriesPage />} />
            </Route>
          </Route>
        </Route>
      </Routes>

      {isCartOpen && (
        <Cart
          cartItems={cartItems}
          isLoading={isCartLoading}
          onClose={() => setIsCartOpen(false)}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveFromCart={handleRemoveFromCart}
        />
      )}
    </div>
  );
};

export default App;
