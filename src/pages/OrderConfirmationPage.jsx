import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
  CheckCircle,
  Package,
  ShoppingBag,
  FileText,
  MapPin,
  CreditCard,
  CalendarDays,
} from "lucide-react";

import { getOrderById, formatPrice } from "../services/orderService";
import OrderProgress from "../components/orders/OrderProgress";
import OrderStatusBadge from "../components/orders/OrderStatusBadge";
import Button from "../components/ui/Button";
import { generateInvoice } from "../services/invoiceService";

const getPaymentMethodLabel = (method) => {
  const methods = {
    cash_on_delivery: "Cash on Delivery",
    gcash: "GCash",
    card: "Credit / Debit Card",
  };

  return methods[method] || "Not specified";
};

const OrderConfirmationPage = () => {
  const { orderId } = useParams();

  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const orderData = await getOrderById(orderId);
        setOrder(orderData);
      } catch (error) {
        console.error("Failed to fetch order:", error);
        setError("We couldn't find the order you're looking for.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#FAF8F4] px-4">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#E4DCCE] border-t-[#B3261E]" />
          <p className="mt-4 text-sm text-[#6B6258]">
            Loading order details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#FAF8F4] px-5">
        <div className="w-full max-w-md rounded-2xl border border-[#E4DCCE] bg-white p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F5E5E2] text-[#A33B32]">
            <Package size={26} />
          </div>

          <h1 className="mt-5 font-serif text-2xl font-semibold text-[#1C1C1C]">
            Order Not Found
          </h1>

          <p className="mt-3 text-sm leading-6 text-[#6B6258]">
            {error || "We couldn't find the order you're looking for."}
          </p>

          <Link
            to="/shop"
            className="mt-6 inline-flex items-center justify-center rounded-md bg-[#B3261E] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#8F1E19]"
          >
            Back to Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F4] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="mx-auto max-w-4xl">
        {/* Confirmation header */}
        <section className="rounded-2xl border border-[#E4DCCE] bg-white px-5 py-10 text-center shadow-sm sm:px-10 sm:py-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#E5EDE5] text-[#496B50]">
            <CheckCircle size={34} />
          </div>

          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-[#B3261E]">
            Order Confirmation
          </p>

          <h1 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-[#1C1C1C] sm:text-4xl">
            Thank you for your order!
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#6B6258]">
            Your order has been successfully placed. We'll keep you updated as
            it makes its way to you.
          </p>

          <div className="mx-auto mt-8 max-w-lg rounded-xl bg-[#F5F2ED] p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#8A8176]">
              Order Reference
            </p>

            <p className="mt-2 break-all text-sm font-semibold text-[#1C1C1C] sm:text-base">
              {order.orderNumber}
            </p>

            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-[#6B6258]">
              <CalendarDays size={16} />
              <span>
                {new Date(order.createdAt).toLocaleString("en-PH", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </span>
            </div>
          </div>
        </section>

        {/* Order details */}
        <section className="mt-6 rounded-2xl border border-[#E4DCCE] bg-white p-5 shadow-sm sm:p-7">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EDE6D8] text-[#6B6258]">
              <ShoppingBag size={20} />
            </div>

            <div>
              <h2 className="font-serif text-xl font-semibold text-[#1C1C1C]">
                Order Summary
              </h2>
              <p className="mt-1 text-xs text-[#8A8176]">
                {order.items.length}{" "}
                {order.items.length === 1 ? "item" : "items"} in this order
              </p>
            </div>
          </div>

          <div className="mt-6 divide-y divide-[#F0EBE3] border-y border-[#F0EBE3]">
            {order.items.map((item) => (
              <div
                key={item.productId}
                className="flex items-center justify-between gap-4 py-5"
              >
                <div className="min-w-0">
                  <p className="break-words text-sm font-semibold text-[#1C1C1C]">
                    {item.name}
                  </p>

                  <p className="mt-1 text-xs text-[#8A8176]">
                    {item.quantity} × {formatPrice(item.price)}
                  </p>
                </div>

                <p className="shrink-0 text-sm font-semibold tabular-nums text-[#1C1C1C]">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          <div className="ml-auto mt-6 max-w-sm space-y-3">
            <div className="flex justify-between gap-4 text-sm">
              <span className="text-[#6B6258]">Subtotal</span>
              <span className="font-medium tabular-nums text-[#1C1C1C]">
                {formatPrice(order.subtotal)}
              </span>
            </div>

            <div className="flex justify-between gap-4 text-sm">
              <span className="text-[#6B6258]">Shipping Fee</span>
              <span className="font-medium tabular-nums text-[#1C1C1C]">
                {formatPrice(order.shippingFee)}
              </span>
            </div>

            <div className="flex justify-between gap-4 border-t border-[#E4DCCE] pt-4">
              <span className="font-semibold text-[#1C1C1C]">Total Amount</span>

              <span className="text-xl font-bold tabular-nums text-[#B3261E]">
                {formatPrice(order.total)}
              </span>
            </div>
          </div>
        </section>

        {/* Order progress */}
        <OrderProgress status={order.status} />

        {/* Shipping information */}
        <section className="mt-6 rounded-2xl border border-[#E4DCCE] bg-white p-5 shadow-sm sm:p-7">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EDE6D8] text-[#6B6258]">
              <MapPin size={20} />
            </div>

            <div>
              <h2 className="font-serif text-xl font-semibold text-[#1C1C1C]">
                Shipping Information
              </h2>
              <p className="mt-1 text-xs text-[#8A8176]">
                Delivery details for this order
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-2 text-sm">
            <p className="font-semibold text-[#1C1C1C]">
              {order.customer.fullName}
            </p>

            <p className="text-[#6B6258]">{order.customer.email}</p>
            <p className="text-[#6B6258]">{order.customer.phone}</p>

            <div className="border-t border-[#F0EBE3] pt-4 leading-6 text-[#6B6258]">
              {order.shippingAddress.address}
              <br />
              {order.shippingAddress.city}, {order.shippingAddress.province}
              <br />
              {order.shippingAddress.postalCode}
            </div>
          </div>
        </section>

        {/* Order and payment information */}
        <section className="mt-6 grid gap-5 sm:grid-cols-2">
          <div className="rounded-2xl border border-[#E4DCCE] bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <Package size={20} className="text-[#B3261E]" />
              <h2 className="font-serif text-lg font-semibold text-[#1C1C1C]">
                Order Status
              </h2>
            </div>

            <div className="mt-5">
              <OrderStatusBadge status={order.status} />
            </div>
          </div>

          <div className="rounded-2xl border border-[#E4DCCE] bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <CreditCard size={20} className="text-[#B3261E]" />
              <h2 className="font-serif text-lg font-semibold text-[#1C1C1C]">
                Payment Information
              </h2>
            </div>

            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#8A8176]">
                Payment Status
              </p>

              <div className="mt-2">
                <OrderStatusBadge status={order.paymentStatus} />
              </div>

              <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-[#8A8176]">
                Payment Method
              </p>

              <p className="mt-2 text-sm font-semibold text-[#1C1C1C]">
                {order.payment
                  ? getPaymentMethodLabel(order.payment.paymentMethod)
                  : "Not available"}
              </p>
            </div>
          </div>
        </section>

        {/* Actions */}
        <section className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row">
          <Link
            to="/shop"
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-[#B3261E] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#8F1E19]"
          >
            Continue Shopping
          </Link>

          <Button
            type="button"
            variant="secondary"
            onClick={() => generateInvoice(order)}
            className="min-h-11 gap-2 px-6 py-3"
          >
            <FileText size={18} />
            View Invoice PDF
          </Button>
        </section>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
