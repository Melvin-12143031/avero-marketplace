import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

import { createOrder } from "../services/orderService";
import { createPayment } from "../services/paymentService";

import { formatPrice } from "../services/orderService";

import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

const CheckoutPage = ({ cartItems, onClearCart }) => {
  const [shippingInfo, setShippingInfo] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    province: "",
    postalCode: "",
  });

  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash_on_delivery");

  const [createdOrder, setCreatedOrder] = useState(null);

  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  if (cartItems.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
        <div className="max-w-md text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
            <ShoppingBag size={30} />
          </div>

          <h1 className="mt-5 text-2xl font-bold text-slate-900">
            Your cart is empty
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Add some products to your cart before proceeding to checkout.
          </p>

          <Link
            to="/"
            className="mt-6 inline-flex items-center justify-center rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
          >
            Browse Products
          </Link>
        </div>
      </main>
    );
  }

  const handleShippingChange = (event) => {
    const { name, value } = event.target;

    setShippingInfo((currentInfo) => ({
      ...currentInfo,
      [name]: value,
    }));

    if (value.trim()) {
      setErrors((currentErrors) => ({
        ...currentErrors,
        [name]: "",
      }));
    }
  };

  const validateShippingInfo = () => {
    const newErrors = {};

    if (!shippingInfo.fullName.trim()) {
      newErrors.fullName = "Full name is required.";
    }

    if (!shippingInfo.email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingInfo.email.trim())) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!shippingInfo.phone.trim()) {
      newErrors.phone = "Phone number is required.";
    } else if (!/^(\+639|09)\d{9}$/.test(shippingInfo.phone.trim())) {
      newErrors.phone = "Please enter a valid Philippine mobile number.";
    }

    if (!shippingInfo.address.trim()) {
      newErrors.address = "Street address is required.";
    }

    if (!shippingInfo.city.trim()) {
      newErrors.city = "City or municipality is required.";
    }

    if (!shippingInfo.province.trim()) {
      newErrors.province = "Province is required.";
    }

    if (!shippingInfo.postalCode.trim()) {
      newErrors.postalCode = "Postal code is required.";
    } else if (!/^\d{4}$/.test(shippingInfo.postalCode.trim())) {
      newErrors.postalCode = "Please enter a valid 4-digit postal code.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-indigo-600"
          >
            <ArrowLeft size={16} />
            Continue Shopping
          </Link>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Checkout
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Complete your shipping details and review your order.
          </p>
        </div>

        {/* Checkout Layout */}
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
          {/* Shipping Information */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:col-span-2">
            <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <MapPin size={20} />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Shipping Information
                </h2>

                <p className="mt-0.5 text-sm text-slate-500">
                  Where should we deliver your order?
                </p>
              </div>
            </div>

            <form
              onSubmit={async (event) => {
                event.preventDefault();

                if (isSubmitting) return;

                const isValid = validateShippingInfo();

                if (!isValid) return;

                setIsSubmitting(true);

                try {
                  const order =
                    createdOrder ||
                    (await createOrder(shippingInfo, cartItems));

                  if (!createdOrder) {
                    setCreatedOrder(order);
                  }

                  await createPayment(order.id, paymentMethod);
                  toast.success("Order placed successful!");

                  onClearCart();
                  navigate(`/order-confirmation/${order.id}`);
                } catch (error) {
                  console.error("Order creation failed:", error);
                  toast.error(
                    error.message || "Something went wrong. Please try again.",
                  );
                } finally {
                  setIsSubmitting(false);
                }
              }}
              className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2"
            >
              {/* Full Name */}
              <Input
                label="Full Name"
                name="fullName"
                value={shippingInfo.fullName}
                onChange={handleShippingChange}
                error={errors.fullName}
                placeholder="Juan Dela Cruz"
                autoComplete="name"
              />

              {/* Email */}
              <Input
                label="Email Address"
                name="email"
                type="email"
                value={shippingInfo.email}
                onChange={handleShippingChange}
                error={errors.email}
                placeholder="juan@example.com"
                autoComplete="email"
              />

              {/* Phone */}
              <Input
                label="Phone Number"
                name="phone"
                type="tel"
                value={shippingInfo.phone}
                onChange={handleShippingChange}
                error={errors.phone}
                placeholder="09XX XXX XXXX"
                autoComplete="tel"
              />

              {/* Street Address */}
              <div className="sm:col-span-2">
                <Input
                  label="Street Address"
                  name="address"
                  value={shippingInfo.address}
                  onChange={handleShippingChange}
                  error={errors.address}
                  placeholder="House number, street, barangay"
                  autoComplete="street-address"
                />
              </div>

              {/* City */}
              <Input
                label="City / Municipality"
                name="city"
                value={shippingInfo.city}
                onChange={handleShippingChange}
                error={errors.city}
                placeholder="Enter city or municipality"
                autoComplete="address-level2"
              />

              {/* Province */}
              <Input
                label="Province"
                name="province"
                value={shippingInfo.province}
                onChange={handleShippingChange}
                error={errors.province}
                placeholder="Enter province"
                autoComplete="address-level1"
              />

              {/* Postal Code */}
              <Input
                label="Postal Code"
                name="postalCode"
                value={shippingInfo.postalCode}
                onChange={handleShippingChange}
                error={errors.postalCode}
                placeholder="Postal code"
                autoComplete="postal-code"
                inputMode="numeric"
              />

              {/* Payment Method */}
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Payment Method
                </label>

                <div className="space-y-3">
                  {[
                    { value: "cash_on_delivery", label: "Cash on Delivery" },
                    { value: "gcash", label: "GCash" },
                    { value: "card", label: "Credit / Debit Card" },
                  ].map((method) => (
                    <label
                      key={method.value}
                      className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-4 transition hover:border-indigo-300"
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.value}
                        checked={paymentMethod === method.value}
                        onChange={(event) =>
                          setPaymentMethod(event.target.value)
                        }
                        className="h-4 w-4 accent-indigo-600"
                      />

                      <span className="text-sm font-medium text-slate-700">
                        {method.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end border-t border-slate-100 pt-5 sm:col-span-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Placing Order..." : "Continue"}
                </Button>
              </div>
            </form>
          </section>

          {/* Order Summary */}
          <aside className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <ShoppingBag size={20} />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Order Summary
                </h2>

                <p className="mt-0.5 text-sm text-slate-500">
                  {cartItems.length} product types
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {item.name}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Qty: {item.quantity}
                    </p>
                  </div>

                  <span className="shrink-0 text-sm font-semibold text-slate-900">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-3 border-t border-slate-100 pt-5">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Subtotal</span>

                <span className="font-medium text-slate-900">
                  {formatPrice(subtotal)}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Shipping</span>

                <span className="font-medium text-slate-600">
                  Calculated later
                </span>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-5">
              <span className="font-semibold text-slate-900">Subtotal</span>

              <span className="text-xl font-bold text-indigo-600">
                {formatPrice(subtotal)}
              </span>
            </div>

            <p className="mt-4 text-xs leading-5 text-slate-500">
              Shipping fees and final order total will be confirmed before
              payment.
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
};

export default CheckoutPage;
