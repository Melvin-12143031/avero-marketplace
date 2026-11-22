import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  ShoppingBag,
  CreditCard,
  Wallet,
  Banknote,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

import { createOrder, formatPrice } from "../services/orderService";
import { createPayment } from "../services/paymentService";

import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

const paymentMethods = [
  {
    value: "cash_on_delivery",
    label: "Cash on Delivery",
    description: "Pay when your order arrives",
    icon: Banknote,
  },
  {
    value: "gcash",
    label: "GCash",
    description: "Pay using your GCash account",
    icon: Wallet,
  },
  {
    value: "card",
    label: "Credit / Debit Card",
    description: "Pay using your bank card",
    icon: CreditCard,
  },
];

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

  const totalQuantity = cartItems.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  if (cartItems.length === 0) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#FAF8F4] px-5 py-16">
        <div className="max-w-md text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#EDE6D8] text-[#B3261E]">
            <ShoppingBag size={28} />
          </div>

          <h1 className="mt-6 font-serif text-3xl font-semibold tracking-tight text-[#1C1C1C]">
            Your cart is empty
          </h1>

          <p className="mt-3 text-sm leading-6 text-[#6B6258]">
            Your shopping bag is waiting. Explore our collection and find
            something you'll love.
          </p>

          <Link
            to="/shop"
            className="mt-7 inline-flex items-center justify-center rounded-md bg-[#B3261E] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#922019]"
          >
            Explore the Collection
          </Link>
        </div>
      </div>
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
    } else if (!/^(\+63|09)\d{9}$/.test(shippingInfo.phone.trim())) {
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

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting) return;

    if (!validateShippingInfo()) return;

    setIsSubmitting(true);

    try {
      const order =
        createdOrder || (await createOrder(shippingInfo, cartItems));

      if (!createdOrder) {
        setCreatedOrder(order);
      }

      await createPayment(order.id, paymentMethod);

      toast.success("Order placed successfully!");

      onClearCart();
      navigate(`/order-confirmation/${order.id}`);
    } catch (error) {
      console.error("Order creation failed:", error);

      toast.error(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F4]">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-9">
          <Link
            to="/shop"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#6B6258] transition hover:text-[#B3261E]"
          >
            <ArrowLeft size={16} />
            Continue Shopping
          </Link>

          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B3261E]">
            AVÉRO / Your Order
          </p>

          <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-[#1C1C1C] sm:text-4xl">
            Checkout
          </h1>

          <p className="mt-2 text-sm text-[#6B6258]">
            A few details and your order will be on its way.
          </p>
        </div>

        {/* Checkout Layout */}
        <div className="grid grid-cols-1 items-start gap-7 lg:grid-cols-3">
          {/* Shipping and Payment */}
          <section className="rounded-xl border border-[#E4DCCE] bg-white p-5 sm:p-7 lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-9">
              {/* Shipping Information */}
              <div>
                <div className="mb-6 flex items-center gap-3 border-b border-[#E4DCCE] pb-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EDE6D8] text-[#B3261E]">
                    <MapPin size={19} />
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold text-[#1C1C1C]">
                      Shipping Information
                    </h2>

                    <p className="mt-0.5 text-sm text-[#8A8176]">
                      Where should we deliver your order?
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
                  <Input
                    label="Full Name"
                    name="fullName"
                    value={shippingInfo.fullName}
                    onChange={handleShippingChange}
                    error={errors.fullName}
                    placeholder="Juan Dela Cruz"
                    autoComplete="name"
                  />

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

                  <Input
                    label="Phone Number"
                    name="phone"
                    type="tel"
                    value={shippingInfo.phone}
                    onChange={handleShippingChange}
                    error={errors.phone}
                    placeholder="09XXXXXXXXX"
                    autoComplete="tel"
                  />

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

                  <Input
                    label="City / Municipality"
                    name="city"
                    value={shippingInfo.city}
                    onChange={handleShippingChange}
                    error={errors.city}
                    placeholder="Enter city or municipality"
                    autoComplete="address-level2"
                  />

                  <Input
                    label="Province"
                    name="province"
                    value={shippingInfo.province}
                    onChange={handleShippingChange}
                    error={errors.province}
                    placeholder="Enter province"
                    autoComplete="address-level1"
                  />

                  <Input
                    label="Postal Code"
                    name="postalCode"
                    value={shippingInfo.postalCode}
                    onChange={handleShippingChange}
                    error={errors.postalCode}
                    placeholder="4-digit postal code"
                    autoComplete="postal-code"
                    inputMode="numeric"
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <div className="mb-6 flex items-center gap-3 border-b border-[#E4DCCE] pb-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EDE6D8] text-[#B3261E]">
                    <CreditCard size={19} />
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold text-[#1C1C1C]">
                      Payment Method
                    </h2>

                    <p className="mt-0.5 text-sm text-[#8A8176]">
                      Choose how you'd like to pay.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {paymentMethods.map((method) => {
                    const Icon = method.icon;
                    const isSelected = paymentMethod === method.value;

                    return (
                      <label
                        key={method.value}
                        className={`flex cursor-pointer items-center gap-4 rounded-lg border p-4 transition ${
                          isSelected
                            ? "border-[#B3261E] bg-[#FAF8F4]"
                            : "border-[#E4DCCE] bg-white hover:border-[#C9B9A7]"
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.value}
                          checked={isSelected}
                          onChange={(event) =>
                            setPaymentMethod(event.target.value)
                          }
                          className="h-4 w-4 accent-[#B3261E]"
                        />

                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                            isSelected
                              ? "bg-[#EDE6D8] text-[#B3261E]"
                              : "bg-[#F5F2EC] text-[#6B6258]"
                          }`}
                        >
                          <Icon size={19} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-[#1C1C1C]">
                            {method.label}
                          </p>

                          <p className="mt-0.5 text-xs text-[#8A8176]">
                            {method.description}
                          </p>
                        </div>

                        {isSelected && (
                          <span className="text-xs font-semibold text-[#B3261E]">
                            Selected
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>

                <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-[#8A8176]">
                  <ShieldCheck size={15} className="mt-0.5 shrink-0" />
                  Payment options are currently simulated for this marketplace
                  demo. No external payment gateway is connected.
                </p>
              </div>

              {/* Submit */}
              <div className="flex flex-col-reverse gap-4 border-t border-[#E4DCCE] pt-6 sm:flex-row sm:items-center sm:justify-between">
                <Link
                  to="/shop"
                  className="inline-flex items-center justify-center gap-2 text-sm font-medium text-[#6B6258] transition hover:text-[#B3261E]"
                >
                  <ArrowLeft size={15} />
                  Back to Shopping
                </Link>

                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Placing Order..." : "Place Order"}
                </Button>
              </div>
            </form>
          </section>

          {/* Order Summary */}
          <aside className="rounded-xl border border-[#E4DCCE] bg-white p-5 sm:p-6 lg:sticky lg:top-24">
            <div className="mb-6 flex items-center gap-3 border-b border-[#E4DCCE] pb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EDE6D8] text-[#B3261E]">
                <ShoppingBag size={19} />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-[#1C1C1C]">
                  Order Summary
                </h2>

                <p className="mt-0.5 text-sm text-[#8A8176]">
                  {totalQuantity} {totalQuantity === 1 ? "item" : "items"} in
                  your bag
                </p>
              </div>
            </div>

            <div className="max-h-80 space-y-4 overflow-y-auto pr-1">
              {cartItems.map((item) => (
                <div
                  key={item.product_id}
                  className="flex items-start justify-between gap-4"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#1C1C1C]">
                      {item.name}
                    </p>

                    <p className="mt-1 text-xs text-[#8A8176]">
                      Qty: {item.quantity}
                    </p>
                  </div>

                  <span className="shrink-0 text-sm font-semibold text-[#1C1C1C]">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-3 border-t border-[#E4DCCE] pt-5">
              <div className="flex justify-between text-sm">
                <span className="text-[#6B6258]">Subtotal</span>

                <span className="font-medium text-[#1C1C1C]">
                  {formatPrice(subtotal)}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-[#6B6258]">Shipping</span>

                <span className="font-medium text-[#8A8176]">
                  Calculated later
                </span>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-[#E4DCCE] pt-5">
              <span className="font-semibold text-[#1C1C1C]">
                Estimated Total
              </span>

              <span className="text-xl font-bold text-[#B3261E]">
                {formatPrice(subtotal)}
              </span>
            </div>

            <p className="mt-4 text-xs leading-5 text-[#8A8176]">
              Shipping fees and the final order total will be confirmed
              separately.
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
