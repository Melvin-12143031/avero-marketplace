import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  getAdminOrders,
  getOrderStatistics,
  updateOrderStatus,
} from "../../services/orderService";

import Pagination from "../../components/ui/Pagination";
import SearchInput from "../../components/ui/SearchInput";
import Button from "../../components/ui/Button";

import {
  ShoppingBag,
  Clock,
  Truck,
  PhilippinePeso,
  Eye,
  RefreshCw,
  X,
  MapPin,
  CalendarDays,
  Package,
} from "lucide-react";

const formatCurrency = (amount) =>
  Number(amount ?? 0).toLocaleString("en-PH", {
    style: "currency",
    currency: "PHP",
  });

const formatStatus = (status = "") => status.replaceAll("_", " ");

const getOrderStatusStyle = (status) => {
  const styles = {
    pending: "bg-amber-50 text-amber-700 ring-amber-600/20",
    processing: "bg-blue-50 text-blue-700 ring-blue-600/20",
    shipped: "bg-violet-50 text-violet-700 ring-violet-600/20",
    delivered: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    cancelled: "bg-rose-50 text-rose-700 ring-rose-600/20",
  };

  return styles[status] || "bg-slate-100 text-slate-700 ring-slate-600/20";
};

const getPaymentStatusStyle = (status) => {
  const styles = {
    paid: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    refunded: "bg-violet-50 text-violet-700 ring-violet-600/20",
    pending: "bg-amber-50 text-amber-700 ring-amber-600/20",
    failed: "bg-rose-50 text-rose-700 ring-rose-600/20",
    cancelled: "bg-slate-100 text-slate-600 ring-slate-600/20",
  };

  return styles[status] || "bg-slate-100 text-slate-700 ring-slate-600/20";
};

const ORDER_STATUS_TRANSITIONS = {
  pending: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

const OrdersPage = () => {
  // Orders pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
  });

  // Orders data
  const [orders, setOrders] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Order details modal
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Status update state
  const [isUpdating, setIsUpdating] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [pendingStatus, setPendingStatus] = useState("");

  const handleStatusUpdate = async (newStatus) => {
    if (!selectedOrder || isUpdating) return;

    const allowedStatuses =
      ORDER_STATUS_TRANSITIONS[selectedOrder.status] ?? [];

    if (!allowedStatuses.includes(newStatus)) {
      toast.error("This status transition is not allowed.");
      return;
    }

    try {
      setIsUpdating(true);

      const updatedOrder = await updateOrderStatus(selectedOrder.id, newStatus);

      setSelectedOrder((current) =>
        current ? { ...current, ...updatedOrder } : current,
      );

      toast.success("Order status updated successfully.");

      setRefreshKey((current) => current + 1);
    } catch (error) {
      toast.error(error.message || "Failed to update order status.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setCurrentPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // Fetch orders and statistics
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        setError("");

        const [orderData, statsData] = await Promise.all([
          getAdminOrders(
            currentPage,
            pageSize,
            selectedStatus,
            debouncedSearch,
          ),
          getOrderStatistics(),
        ]);

        setOrders(orderData.orders);
        setPagination({
          total: orderData.pagination.total,
          totalPages: orderData.pagination.totalPages,
        });

        setStatistics(statsData);
      } catch (error) {
        setError(error.message);
        toast.error("Failed to load orders.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [currentPage, pageSize, selectedStatus, debouncedSearch, refreshKey]);

  const statisticCards = [
    {
      title: "Total Orders",
      value: statistics?.total_orders ?? 0,
      icon: ShoppingBag,
      iconStyle: "bg-slate-100 text-slate-700",
    },
    {
      title: "Pending Orders",
      value: statistics?.pending_orders ?? 0,
      icon: Clock,
      iconStyle: "bg-amber-50 text-amber-600",
    },
    {
      title: "Shipped Orders",
      value: statistics?.shipped_orders ?? 0,
      icon: Truck,
      iconStyle: "bg-blue-50 text-blue-600",
    },
    {
      title: "Total Revenue",
      value: formatCurrency(statistics?.total_revenue),
      icon: PhilippinePeso,
      iconStyle: "bg-emerald-50 text-emerald-600",
    },
  ];

  if (error && orders.length === 0) {
    return (
      <div className="flex min-h-80 flex-col items-center justify-center gap-4 rounded-xl border border-slate-200 bg-white p-8">
        <p className="text-center text-sm text-rose-600">{error}</p>

        <button
          onClick={() => setRefreshKey((prev) => prev + 1)}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700"
        >
          <RefreshCw size={16} />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Orders Management
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage customer orders, payments, and fulfillment.
          </p>
        </div>

        <button
          onClick={() => setRefreshKey((prev) => prev + 1)}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statisticCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">
                  {card.title}
                </p>

                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.iconStyle}`}
                >
                  <Icon size={20} />
                </div>
              </div>

              <p className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
                {card.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Orders Section */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* Section Header */}
        <div className="flex flex-col justify-between gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">All Orders</h2>

            <p className="mt-1 text-sm text-slate-500">
              View and manage customer orders.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search order number, customer name or email..."
            />

            <div className="flex items-center gap-3">
              <label
                htmlFor="orderStatus"
                className="text-sm font-medium text-slate-600"
              >
                Status
              </label>

              <select
                id="orderStatus"
                value={selectedStatus}
                onChange={(event) => {
                  setSelectedStatus(event.target.value);
                  setCurrentPage(1);
                }}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              >
                <option value="">All Orders</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-4">Order</th>
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4">Items</th>
                <th className="px-5 py-4">Total</th>
                <th className="px-5 py-4">Payment</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {isLoading && orders.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-16 text-center text-slate-500"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <RefreshCw
                        className="animate-spin text-slate-400"
                        size={28}
                      />
                      <p>Loading orders...</p>
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center">
                      <ShoppingBag size={32} className="mb-3 text-slate-300" />

                      <p className="font-medium text-slate-700">
                        No orders found
                      </p>

                      <p className="mt-1 text-sm text-slate-400">
                        {debouncedSearch
                          ? "Try another order number, customer name or email."
                          : selectedStatus
                            ? "Try changing your selected status filter."
                            : "There are no orders to display."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr
                    key={order.id}
                    className="transition hover:bg-slate-50/70"
                  >
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900">
                        {order.order_number}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        ID: {order.id.slice(0, 8)}
                      </p>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                      {new Date(order.created_at).toLocaleDateString("en-PH", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {order.items?.length ?? 0}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-900">
                      {formatCurrency(order.total)}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ring-1 ring-inset ${getPaymentStatusStyle(order.payment_status)}`}
                      >
                        {formatStatus(order.payment_status)}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ring-1 ring-inset ${getOrderStatusStyle(order.status)}`}
                      >
                        {formatStatus(order.status)}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <Button
                        variant="secondary"
                        onClick={() => setSelectedOrder(order)}
                        tooltip="View Details"
                        className="border-0 bg-transparent px-2 py-2 text-slate-600 shadow-none hover:bg-slate-100 hover:text-indigo-600 cursor-pointer"
                      >
                        <Eye size={17} />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="border-t border-slate-200 px-4 py-3">
          <Pagination
            currentPage={currentPage}
            totalPages={pagination.totalPages}
            onPageChange={setCurrentPage}
            pageSize={pageSize}
            totalItems={pagination.total}
          />
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-modal-title"
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
              <div>
                <h2
                  id="order-modal-title"
                  className="text-xl font-bold text-slate-900"
                >
                  Order Details
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {selectedOrder.order_number}
                </p>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                title="Close"
                aria-label="Close order details"
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <X size={21} />
              </button>
            </div>

            <div className="space-y-7 p-6">
              {/* Order Summary */}
              <section>
                <div className="mb-3 flex items-center gap-2">
                  <CalendarDays size={18} className="text-slate-400" />

                  <h3 className="font-semibold text-slate-900">
                    Order Summary
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-5 rounded-xl border border-slate-200 bg-slate-50 p-5 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Order Date
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-900">
                      {new Date(selectedOrder.created_at).toLocaleString(
                        "en-PH",
                      )}
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

                    {(ORDER_STATUS_TRANSITIONS[selectedOrder.status] ?? [])
                      .length > 0 && (
                      <div className="mt-3">
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

                          {(
                            ORDER_STATUS_TRANSITIONS[selectedOrder.status] ?? []
                          ).map((status) => {
                            const requiresPayment = [
                              "processing",
                              "shipped",
                              "delivered",
                            ].includes(status);

                            const isDisabled =
                              requiresPayment &&
                              selectedOrder.payment_status !== "paid";

                            return (
                              <option
                                key={status}
                                value={status}
                                disabled={isDisabled}
                              >
                                {formatStatus(status)}
                                {isDisabled ? " (Payment required)" : ""}
                              </option>
                            );
                          })}
                        </select>

                        {selectedOrder.payment_status !== "paid" && (
                          <p className="mt-2 text-xs text-amber-600">
                            This order must be fully paid before fulfillment can
                            proceed.
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Payment Status
                    </p>

                    <span
                      className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ring-1 ring-inset ${getPaymentStatusStyle(selectedOrder.payment_status)}`}
                    >
                      {formatStatus(selectedOrder.payment_status)}
                    </span>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Customer
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-900">
                      {selectedOrder.shipping_address?.customer?.fullName ||
                        selectedOrder.shipping_address?.fullName ||
                        "N/A"}
                    </p>
                  </div>
                </div>
              </section>

              {/* Payment Summary */}
              <section>
                <div className="mb-3 flex items-center gap-2">
                  <PhilippinePeso size={18} className="text-slate-400" />

                  <h3 className="font-semibold text-slate-900">
                    Payment Summary
                  </h3>
                </div>

                <div className="space-y-3 rounded-xl border border-slate-200 p-5 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">Subtotal</span>

                    <span className="font-medium text-slate-900">
                      {formatCurrency(selectedOrder.subtotal)}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">Shipping Fee</span>

                    <span className="font-medium text-slate-900">
                      {formatCurrency(selectedOrder.shipping_fee)}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4 border-t border-slate-200 pt-4">
                    <span className="font-semibold text-slate-900">Total</span>

                    <span className="text-lg font-bold text-slate-900">
                      {formatCurrency(selectedOrder.total)}
                    </span>
                  </div>
                </div>
              </section>

              {/* Ordered Products */}
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
                            {item.product_name}
                          </td>

                          <td className="px-4 py-3 text-center text-slate-600">
                            {item.quantity}
                          </td>

                          <td className="whitespace-nowrap px-4 py-3 text-right text-slate-600">
                            {formatCurrency(item.unit_price)}
                          </td>

                          <td className="whitespace-nowrap px-4 py-3 text-right font-medium text-slate-900">
                            {formatCurrency(item.subtotal)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Shipping Address */}
              <section>
                <div className="mb-3 flex items-center gap-2">
                  <MapPin size={18} className="text-slate-400" />

                  <h3 className="font-semibold text-slate-900">
                    Shipping Address
                  </h3>
                </div>

                <div className="rounded-xl border border-slate-200 p-5">
                  <p className="font-semibold text-slate-900">
                    {selectedOrder.shipping_address?.customer?.fullName ||
                      selectedOrder.shipping_address?.fullName ||
                      "N/A"}
                  </p>

                  <p className="mt-2 text-sm text-slate-600">
                    {selectedOrder.shipping_address?.customer?.phone ||
                      selectedOrder.shipping_address?.phone}
                  </p>

                  <p className="mt-1 text-sm text-slate-600">
                    {selectedOrder.shipping_address?.customer?.email ||
                      selectedOrder.shipping_address?.email}
                  </p>

                  <p className="mt-3 text-sm text-slate-600">
                    {selectedOrder.shipping_address?.shippingAddress?.address ||
                      selectedOrder.shipping_address?.address}
                  </p>

                  <p className="mt-1 text-sm text-slate-600">
                    {[
                      selectedOrder.shipping_address?.shippingAddress?.city ||
                        selectedOrder.shipping_address?.city,
                      selectedOrder.shipping_address?.shippingAddress
                        ?.province || selectedOrder.shipping_address?.province,
                      selectedOrder.shipping_address?.shippingAddress
                        ?.postalCode ||
                        selectedOrder.shipping_address?.postalCode,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </div>
              </section>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-6 py-4">
              <button
                onClick={() => setSelectedOrder(null)}
                className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>

          {/* Confirmation Dialog */}
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
                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => setPendingStatus("")}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >
                    Go Back
                  </button>

                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={async () => {
                      await handleStatusUpdate(pendingStatus);
                      setPendingStatus("");
                    }}
                    className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isUpdating ? "Processing..." : "Confirm Change"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
