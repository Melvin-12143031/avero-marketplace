import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { CheckCircle, Package, ShoppingBag, FileText } from "lucide-react";

import { getOrderById, formatPrice } from "../services/orderService";
import OrderProgress from "../components/orders/OrderProgress";
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
        setError(`We couldn't find the order you're looking for.`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-600">Loading order details...</p>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-slate-900">Order Not Found</h1>

          <p className="mt-3 text-slate-600">
            We couldn't find the order you're looking for.
          </p>

          <Link
            to="/"
            className="mt-6 inline-flex items-center justify-center rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
          >
            Back to Shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-16">
      <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12 print:hidden">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-600">
          <CheckCircle size={36} />
        </div>

        <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-900">
          Thank you for your order!
        </h1>

        <p className="mt-3 text-slate-600">
          Your order has been successfully placed. We'll keep you updated on its
          progress.
        </p>

        <div className="mt-6 rounded-lg bg-slate-50 p-4">
          <p className="text-sm text-slate-500">Order Reference</p>
          <p className="mt-1 break-all font-semibold text-slate-900">
            {order.orderNumber}
          </p>
        </div>

        <div className="mt-4 text-sm text-slate-500">
          Order Date:{" "}
          <span className="font-medium text-slate-700">
            {new Date(order.createdAt).toLocaleString("en-PH", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </span>
        </div>

        <div className="mt-8 text-left">
          <h2 className="text-lg font-semibold text-slate-900">
            Order Details
          </h2>

          <div className="mt-4 divide-y divide-slate-100 border-y border-slate-100">
            {order.items.map((item) => (
              <div
                key={item.productId}
                className="flex items-center justify-between gap-4 py-4"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {item.name}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {item.quantity} × {formatPrice(item.price)}
                  </p>
                </div>

                <p className="shrink-0 text-sm font-semibold text-slate-900">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-5 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Subtotal</span>
              <span className="font-medium text-slate-900">
                {formatPrice(order.subtotal)}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Shipping Fee</span>
              <span className="font-medium text-slate-900">
                {formatPrice(order.shippingFee)}
              </span>
            </div>

            <div className="flex justify-between border-t border-slate-100 pt-4">
              <span className="font-semibold text-slate-900">Total</span>
              <span className="text-xl font-bold text-indigo-600">
                {formatPrice(order.total)}
              </span>
            </div>
          </div>
        </div>

        <OrderProgress status={order.status} />

        <div className="mt-8 rounded-xl border border-slate-200 p-5 text-left">
          <div className="flex items-center gap-2">
            <Package size={20} className="text-indigo-600" />

            <h2 className="text-lg font-semibold text-slate-900">
              Shipping Information
            </h2>
          </div>

          <div className="mt-4 space-y-2 text-sm">
            <p className="font-medium text-slate-900">
              {order.customer.fullName}
            </p>

            <p className="text-slate-600">{order.customer.email}</p>

            <p className="text-slate-600">{order.customer.phone}</p>

            <p className="pt-2 text-slate-600">
              {order.shippingAddress.address}
              <br />
              {order.shippingAddress.city}, {order.shippingAddress.province}
              <br />
              {order.shippingAddress.postalCode}
            </p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-5">
            <Package className="mx-auto text-indigo-600" size={24} />
            <p className="mt-2 text-sm font-medium text-slate-500">
              Order Status
            </p>
            <p className="mt-1 font-semibold capitalize text-slate-900">
              {order.status}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-5">
            <ShoppingBag className="mx-auto text-indigo-600" size={24} />
            <p className="mt-2 text-sm font-medium text-slate-500">
              Payment Status
            </p>
            <p className="mt-1 font-semibold capitalize text-slate-900">
              {order.paymentStatus}
            </p>
            <p className="mt-3 text-sm font-medium text-slate-500">
              Payment Method
            </p>

            <p className="mt-1 font-semibold text-slate-900">
              {order.payment
                ? getPaymentMethodLabel(order.payment.paymentMethod)
                : "Not available"}
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/"
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
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
        </div>
      </div>
    </main>
  );
};

export default OrderConfirmationPage;
