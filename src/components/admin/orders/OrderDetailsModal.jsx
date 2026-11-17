import { useEffect, useState } from "react";
import {
  RefreshCw,
  CalendarDays,
  PhilippinePeso,
  Package,
  MapPin,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner";

import {
  getOrderPaymentHistory,
  refundPayment,
} from "@/services/paymentService";

import {
  getAdminOrderById,
  updateOrderStatus,
  formatPrice,
} from "@/services/orderService";

const getOrderStatusStyle = (status) => {
  const styles = {
    pending: "bg-amber-50 text-amber-700 ring-amber-600/20",
    processing: "bg-blue-50 text-blue-700 ring-blue-600/20",
    shipped: "bg-violet-50 text-violet-700 ring-violet-600/20",
    delivered: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    cancelled: "bg-rose-50 text-rose-700 ring-rose-600/20",
  };

  return styles[status] || "bg-slate-100 text-slate-600 ring-slate-600/20";
};

const formatStatus = (status = "") => status.replaceAll("_", " ");

const getPaymentStatusStyle = (status) => {
  const styles = {
    paid: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    refunded: "bg-violet-50 text-violet-700 ring-violet-600/20",
    pending: "bg-amber-50 text-amber-700 ring-amber-600/20",
    failed: "bg-rose-50 text-rose-700 ring-rose-600/20",
    cancelled: "bg-slate-100 text-slate-600 ring-slate-600/20",
  };

  return styles[status] || "bg-slate-100 text-slate-600 ring-slate-600/20";
};

const ORDER_STATUS_TRANSITIONS = {
  pending: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "products", label: "Products" },
  { id: "payments", label: "Payments" },
  { id: "shipping", label: "Shipping" },
];

const OrderDetailsModal = ({ orderId, open, onOpenChange, onRefresh }) => {
  // Store fetched data with its order ID to prevent stale data from appearing.
  const [orderResult, setOrderResult] = useState(null);
  const [paymentResult, setPaymentResult] = useState(null);

  const [refreshKey, setRefreshKey] = useState(0);

  const [activeTabState, setActiveTabState] = useState({
    orderId: null,
    tab: "overview",
  });

  const [isUpdating, setIsUpdating] = useState(false);
  const [pendingStatus, setPendingStatus] = useState("");

  const [isRefunding, setIsRefunding] = useState(false);
  const [pendingRefund, setPendingRefund] = useState(false);

  // Only expose order data belonging to the currently opened order.
  const selectedOrder =
    open && orderResult?.orderId === orderId ? orderResult.order : null;

  const isLoading =
    open &&
    Boolean(orderId) &&
    (!orderResult || orderResult.orderId !== orderId) &&
    true;

  const orderError =
    orderResult !== null &&
    orderResult?.orderId === orderId &&
    orderResult.status === "error";

  // Only expose payment history belonging to the current order and refresh.
  const currentPaymentResult =
    paymentResult?.orderId === selectedOrder?.id &&
    paymentResult?.refreshKey === refreshKey
      ? paymentResult
      : null;

  const paymentHistory = currentPaymentResult?.payments ?? [];
  const isLoadingPaymentHistory =
    Boolean(selectedOrder) && !currentPaymentResult;

  const paymentHistoryError =
    currentPaymentResult?.status === "error" ? currentPaymentResult.error : "";

  // A new order automatically starts on the Overview tab.
  const activeTab =
    activeTabState.orderId === orderId ? activeTabState.tab : "overview";

  useEffect(() => {
    if (!open || !orderId) return;

    let isActive = true;

    const fetchOrder = async () => {
      try {
        const order = await getAdminOrderById(orderId);

        if (isActive) {
          setOrderResult({
            orderId,
            status: "success",
            order,
          });
        }
      } catch (error) {
        console.error("Failed to load order details:", error);

        if (isActive) {
          setOrderResult({
            orderId,
            status: "error",
            error,
          });
        }
      }
    };

    fetchOrder();

    return () => {
      isActive = false;
    };
  }, [open, orderId]);

  useEffect(() => {
    if (!open || !selectedOrder?.id) return;

    let isActive = true;

    const fetchPaymentHistory = async () => {
      try {
        const payments = await getOrderPaymentHistory(selectedOrder.id);

        if (isActive) {
          setPaymentResult({
            orderId: selectedOrder.id,
            refreshKey,
            status: "success",
            payments,
          });
        }
      } catch (error) {
        console.error("Failed to load payment history:", error);

        if (isActive) {
          setPaymentResult({
            orderId: selectedOrder.id,
            refreshKey,
            status: "error",
            payments: [],
            error: error.message || "Failed to load payment history.",
          });
        }
      }
    };

    fetchPaymentHistory();

    return () => {
      isActive = false;
    };
  }, [open, selectedOrder?.id, refreshKey]);

  const refundablePayment = paymentHistory.find(
    (payment) => payment.status === "paid",
  );

  const handleOpenChange = (nextOpen) => {
    if (!nextOpen) {
      setActiveTabState({
        orderId,
        tab: "overview",
      });

      setPendingStatus("");
      setPendingRefund(false);
    }

    onOpenChange(nextOpen);
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      setIsUpdating(true);

      const updatedOrder = await updateOrderStatus(selectedOrder.id, newStatus);

      setOrderResult((current) => {
        if (current?.orderId !== orderId || !current.order) {
          return current;
        }

        return {
          ...current,
          order: {
            ...current.order,
            status: updatedOrder.status,
            paymentStatus:
              updatedOrder.paymentStatus ??
              updatedOrder.payment_status ??
              current.order.paymentStatus,
          },
        };
      });

      setPendingStatus("");
      setRefreshKey((current) => current + 1);
      onRefresh?.();

      toast.success("Order status updated successfully.");
    } catch (error) {
      console.error("Failed to update order status:", error);
      toast.error(error.message || "Failed to update order status.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRefund = async () => {
    if (!refundablePayment || isRefunding) return;

    try {
      setIsRefunding(true);

      await refundPayment(refundablePayment.id);

      setOrderResult((current) => {
        if (current?.orderId !== orderId || !current.order) {
          return current;
        }

        return {
          ...current,
          order: {
            ...current.order,
            status: "cancelled",
            paymentStatus: "refunded",
            payment_status: "refunded",
            payment: current.order.payment
              ? {
                  ...current.order.payment,
                  status: "refunded",
                }
              : null,
          },
        };
      });

      setPendingRefund(false);
      setRefreshKey((current) => current + 1);
      onRefresh?.();

      toast.success("Payment refunded successfully.");
    } catch (error) {
      toast.error(error.message || "Failed to refund payment.");
    } finally {
      setIsRefunding(false);
    }
  };

  const renderStatusUpdate = () => {
    const availableTransitions =
      ORDER_STATUS_TRANSITIONS[selectedOrder.status] ?? [];

    if (availableTransitions.length === 0) return null;

    return (
      <div className="mt-4">
        <label
          htmlFor="order-status-update"
          className="mb-1 block text-xs font-medium text-slate-500"
        >
          Update Status
        </label>

        <select
          id="order-status-update"
          value=""
          disabled={isUpdating}
          onChange={(event) => {
            const newStatus = event.target.value;

            if (newStatus) {
              setPendingStatus(newStatus);
            }
          }}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="" disabled>
            {isUpdating ? "Updating..." : "Choose new status"}
          </option>

          {availableTransitions.map((status) => {
            const requiresPayment = [
              "processing",
              "shipped",
              "delivered",
            ].includes(status);

            const isDisabled =
              requiresPayment && selectedOrder.paymentStatus !== "paid";

            return (
              <option key={status} value={status} disabled={isDisabled}>
                {formatStatus(status)}
                {isDisabled ? " (Payment required)" : ""}
              </option>
            );
          })}
        </select>

        {selectedOrder.paymentStatus !== "paid" && (
          <p className="mt-2 text-xs text-amber-600">
            This order must be fully paid before fulfillment can proceed.
          </p>
        )}
      </div>
    );
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      <section>
        <div className="mb-3 flex items-center gap-2">
          <CalendarDays size={18} className="text-slate-400" />
          <h3 className="font-semibold text-slate-900">Order Information</h3>
        </div>

        <div className="grid grid-cols-1 gap-5 rounded-xl border border-slate-200 bg-slate-50 p-5 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Order Date
            </p>
            <p className="mt-1 text-sm font-medium text-slate-900">
              {new Date(selectedOrder.createdAt).toLocaleString("en-PH")}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Order Status
            </p>

            <span
              className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ring-1 ring-inset ${getOrderStatusStyle(selectedOrder.status)}`}
            >
              {formatStatus(selectedOrder.status)}
            </span>

            {renderStatusUpdate()}
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Payment Status
            </p>

            <span
              className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ring-1 ring-inset ${getPaymentStatusStyle(selectedOrder.paymentStatus)}`}
            >
              {formatStatus(selectedOrder.paymentStatus)}
            </span>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Customer
            </p>
            <p className="mt-1 text-sm font-medium text-slate-900">
              {selectedOrder.customer?.fullName || "N/A"}
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center gap-2">
          <PhilippinePeso size={18} className="text-slate-400" />
          <h3 className="font-semibold text-slate-900">Order Totals</h3>
        </div>

        <div className="space-y-4 rounded-xl border border-slate-200 p-5 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-slate-500">Subtotal</span>
            <span className="font-medium text-slate-900">
              {formatPrice(selectedOrder.subtotal)}
            </span>
          </div>

          <div className="flex justify-between gap-4">
            <span className="text-slate-500">Shipping Fee</span>
            <span className="font-medium text-slate-900">
              {formatPrice(selectedOrder.shippingFee)}
            </span>
          </div>

          <div className="flex justify-between gap-4 border-t border-slate-200 pt-4">
            <span className="font-semibold text-slate-900">Total</span>
            <span className="text-lg font-bold text-slate-900">
              {formatPrice(selectedOrder.total)}
            </span>
          </div>
        </div>
      </section>
    </div>
  );

  const renderProductsTab = () => (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <Package size={18} className="text-slate-400" />
        <h3 className="font-semibold text-slate-900">
          Ordered Products ({selectedOrder.items?.length ?? 0})
        </h3>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full min-w-[500px] text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3 text-center">Qty</th>
              <th className="px-4 py-3 text-right">Price</th>
              <th className="px-4 py-3 text-right">Subtotal</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {selectedOrder.items?.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3 font-medium text-slate-900">
                  {item.name}
                </td>

                <td className="px-4 py-3 text-center text-slate-600">
                  {item.quantity}
                </td>

                <td className="whitespace-nowrap px-4 py-3 text-right text-slate-600">
                  {formatPrice(item.price)}
                </td>

                <td className="whitespace-nowrap px-4 py-3 text-right font-medium text-slate-900">
                  {formatPrice(item.subtotal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );

  const renderPaymentsTab = () => (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <PhilippinePeso size={18} className="text-slate-400" />
        <h3 className="font-semibold text-slate-900">Payment History</h3>
      </div>

      <div className="rounded-xl border border-slate-200 p-5">
        {isLoadingPaymentHistory ? (
          <div className="flex items-center gap-2 py-4 text-sm text-slate-500">
            <RefreshCw size={16} className="animate-spin" />
            Loading payment history...
          </div>
        ) : paymentHistoryError ? (
          <p className="text-sm text-red-600">{paymentHistoryError}</p>
        ) : paymentHistory.length === 0 ? (
          <p className="text-sm text-slate-500">
            No payment attempts recorded for this order.
          </p>
        ) : (
          <div className="space-y-4">
            {paymentHistory.map((payment, index) => (
              <div
                key={payment.id}
                className="rounded-lg border border-slate-200 p-4"
              >
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold text-slate-900">
                    Attempt #{paymentHistory.length - index}
                  </span>

                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ring-1 ring-inset ${getPaymentStatusStyle(payment.status)}`}
                  >
                    {formatStatus(payment.status)}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">Method</span>
                    <span className="font-medium capitalize text-slate-900">
                      {formatStatus(payment.payment_method)}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">Reference</span>
                    <span className="break-all text-right font-medium text-slate-900">
                      {payment.payment_reference || "N/A"}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">Amount</span>
                    <span className="font-medium text-slate-900">
                      {formatPrice(payment.amount)}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">Created</span>
                    <span className="text-right font-medium text-slate-900">
                      {new Date(payment.created_at).toLocaleString("en-PH")}
                    </span>
                  </div>

                  {payment.paid_at && (
                    <div className="flex justify-between gap-4">
                      <span className="text-slate-500">Paid Date</span>
                      <span className="text-right font-medium text-slate-900">
                        {new Date(payment.paid_at).toLocaleString("en-PH")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedOrder.paymentStatus === "paid" &&
          ["pending", "processing"].includes(selectedOrder.status) &&
          refundablePayment && (
            <div className="mt-4 flex justify-end border-t border-slate-200 pt-4">
              <Button
                variant="destructive"
                disabled={isRefunding}
                onClick={() => setPendingRefund(true)}
              >
                {isRefunding ? "Processing Refund..." : "Refund Payment"}
              </Button>
            </div>
          )}
      </div>
    </section>
  );

  const renderShippingTab = () => (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <MapPin size={18} className="text-slate-400" />
        <h3 className="font-semibold text-slate-900">Shipping Address</h3>
      </div>

      <div className="rounded-xl border border-slate-200 p-5">
        <p className="font-semibold text-slate-900">
          {selectedOrder.customer?.fullName || "N/A"}
        </p>

        <p className="mt-2 text-sm text-slate-600">
          {selectedOrder.customer?.phone || "N/A"}
        </p>

        <p className="mt-1 text-sm text-slate-600">
          {selectedOrder.customer?.email || "N/A"}
        </p>

        <p className="mt-3 text-sm text-slate-600">
          {selectedOrder.shippingAddress?.address || "N/A"}
        </p>

        <p className="mt-1 text-sm text-slate-600">
          {[
            selectedOrder.shippingAddress?.city,
            selectedOrder.shippingAddress?.province,
            selectedOrder.shippingAddress?.postalCode,
          ]
            .filter(Boolean)
            .join(", ")}
        </p>
      </div>
    </section>
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex h-[650px] max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden p-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">
              Loading order details...
            </span>
          </div>
        ) : orderError || !selectedOrder ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            Order details could not be loaded.
          </div>
        ) : (
          <>
            <div className="sticky top-0 z-10 border-b border-slate-200 bg-white px-6 pb-4 pt-6">
              <div className="pr-8">
                <h2 className="text-lg font-semibold text-slate-900">
                  Order Details
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {selectedOrder.orderNumber ||
                    selectedOrder.order_number ||
                    "Order"}
                </p>
              </div>

              <div
                role="tablist"
                aria-label="Order details sections"
                className="mt-5 flex gap-2 overflow-x-auto"
              >
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    onClick={() =>
                      setActiveTabState({
                        orderId,
                        tab: tab.id,
                      })
                    }
                    className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? "bg-orange-50 text-orange-700"
                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-6">
              {activeTab === "overview" && renderOverviewTab()}
              {activeTab === "products" && renderProductsTab()}
              {activeTab === "payments" && renderPaymentsTab()}
              {activeTab === "shipping" && renderShippingTab()}
            </div>

            {/* Order Status Confirmation */}
            {pendingStatus && (
              <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
                <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Confirm Order Status Change
                  </h3>

                  <p className="mt-3 text-sm text-slate-600">
                    Are you sure you want to change this order's status from{" "}
                    <strong>{formatStatus(selectedOrder.status)}</strong> to{" "}
                    <strong>{formatStatus(pendingStatus)}</strong>?
                  </p>

                  {pendingStatus === "cancelled" && (
                    <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                      Warning: Cancelling this order will restore its reserved
                      stock. This action should only be performed when
                      cancellation is intended.
                    </p>
                  )}

                  <div className="mt-6 flex justify-end gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isUpdating}
                      onClick={() => setPendingStatus("")}
                    >
                      Go Back
                    </Button>

                    <Button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => handleStatusUpdate(pendingStatus)}
                      className="bg-orange-600 text-white hover:bg-orange-700"
                    >
                      {isUpdating ? "Processing..." : "Confirm Change"}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Refund Confirmation */}
            {pendingRefund && (
              <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
                <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Confirm Payment Refund
                  </h3>

                  <p className="mt-3 text-sm text-slate-600">
                    Are you sure you want to refund this payment?
                  </p>

                  <div className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
                    This action will refund the payment, cancel the order, and
                    restore the reserved inventory.
                  </div>

                  <div className="mt-6 flex justify-end gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isRefunding}
                      onClick={() => setPendingRefund(false)}
                    >
                      Go Back
                    </Button>

                    <Button
                      type="button"
                      disabled={isRefunding}
                      onClick={handleRefund}
                      className="bg-rose-600 text-white hover:bg-rose-700"
                    >
                      {isRefunding ? "Processing..." : "Confirm Refund"}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailsModal;
