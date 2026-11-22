import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  getAdminOrders,
  getOrderStatistics,
} from "../../services/orderService";

import Pagination from "../../components/ui/Pagination";
import SearchInput from "../../components/ui/SearchInput";
import Button from "../../components/ui/Button";
import OrderDetailsModal from "@/components/admin/orders/OrderDetailsModal";

import {
  ShoppingBag,
  Clock,
  Truck,
  PhilippinePeso,
  Eye,
  RefreshCw,
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

  return styles[status] || "bg-[#F2EEE7] text-[#6B6258] ring-[#E4DCCE]";
};

const getPaymentStatusStyle = (status) => {
  const styles = {
    paid: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    refunded: "bg-violet-50 text-violet-700 ring-violet-600/20",
    pending: "bg-amber-50 text-amber-700 ring-amber-600/20",
    failed: "bg-rose-50 text-rose-700 ring-rose-600/20",
    cancelled: "bg-[#F2EEE7] text-[#6B6258] ring-[#E4DCCE]",
  };

  return styles[status] || "bg-[#F2EEE7] text-[#6B6258] ring-[#E4DCCE]";
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
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Refresh state
  const [refreshKey, setRefreshKey] = useState(0);

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
      iconStyle: "bg-[#F2EEE7] text-[#514940]",
    },
    {
      title: "Pending Orders",
      value: statistics?.pending_orders ?? 0,
      icon: Clock,
      iconStyle: "bg-amber-50 text-amber-700",
    },
    {
      title: "Shipped Orders",
      value: statistics?.shipped_orders ?? 0,
      icon: Truck,
      iconStyle: "bg-blue-50 text-blue-700",
    },
    {
      title: "Total Revenue",
      value: formatCurrency(statistics?.total_revenue),
      icon: PhilippinePeso,
      iconStyle: "bg-[#F9EAE7] text-[#B3261E]",
    },
  ];

  if (error && orders.length === 0) {
    return (
      <div className="flex min-h-80 flex-col items-center justify-center gap-4 rounded-xl border border-[#E4DCCE] bg-white p-8">
        <p className="text-center text-sm text-rose-600">{error}</p>

        <button
          onClick={() => setRefreshKey((prev) => prev + 1)}
          className="inline-flex items-center gap-2 rounded-lg bg-[#1C1C1C] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#38332E]"
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
          <h1 className="text-2xl font-semibold tracking-tight text-[#1C1C1C]">
            Orders Management
          </h1>

          <p className="mt-1 text-sm text-[#8A8176]">
            Manage customer orders, payments, and fulfillment.
          </p>
        </div>

        <button
          onClick={() => setRefreshKey((prev) => prev + 1)}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#E4DCCE] bg-white px-4 py-2.5 text-sm font-medium text-[#514940] shadow-sm transition hover:bg-[#F8F5EF]"
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
              className="rounded-xl border border-[#E4DCCE] bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-[#8A8176]">
                  {card.title}
                </p>

                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.iconStyle}`}
                >
                  <Icon size={19} />
                </div>
              </div>

              <p className="mt-4 text-2xl font-semibold tracking-tight text-[#1C1C1C]">
                {card.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Orders Section */}
      <div className="overflow-hidden rounded-xl border border-[#E4DCCE] bg-white shadow-sm">
        {/* Section Header */}
        <div className="flex flex-col justify-between gap-4 border-b border-[#EAE4DA] p-5 xl:flex-row xl:items-center">
          <div>
            <h2 className="text-lg font-semibold text-[#1C1C1C]">All Orders</h2>

            <p className="mt-1 text-sm text-[#8A8176]">
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
                className="text-sm font-medium text-[#6B6258]"
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
                className="rounded-lg border border-[#E4DCCE] bg-white px-3 py-2.5 text-sm text-[#514940] outline-none transition focus:border-[#B3261E] focus:ring-2 focus:ring-[#B3261E]/10"
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

        {/* Orders Table - Desktop */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-[#F8F6F1] text-xs font-semibold uppercase tracking-wide text-[#8A8176]">
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

            <tbody className="divide-y divide-[#F0ECE5]">
              {isLoading && orders.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-16 text-center text-[#8A8176]"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <RefreshCw
                        className="animate-spin text-[#B3261E]"
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
                      <ShoppingBag size={32} className="mb-3 text-[#C9C0B3]" />
                      <p className="font-medium text-[#514940]">
                        No orders found
                      </p>
                      <p className="mt-1 text-sm text-[#A1988D]">
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
                    className="transition-colors hover:bg-[#FCFAF6]"
                  >
                    <td className="px-5 py-4">
                      <p className="font-semibold text-[#1C1C1C]">
                        {order.order_number}
                      </p>
                      <p className="mt-1 text-xs text-[#A1988D]">
                        ID: {order.id.slice(0, 8)}
                      </p>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-[#6B6258]">
                      {new Date(order.created_at).toLocaleDateString("en-PH", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>

                    <td className="px-5 py-4 text-[#6B6258]">
                      {order.items?.length ?? 0}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 font-semibold text-[#1C1C1C]">
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
                        onClick={() => {
                          setSelectedOrder(order);
                          setIsDetailsOpen(true);
                        }}
                        tooltip="View Details"
                        className="cursor-pointer border-0 bg-transparent px-2 py-2 text-[#6B6258] shadow-none hover:bg-[#F2EEE7] hover:text-[#B3261E]"
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

        {/* Orders - Mobile Cards */}
        <div className="divide-y divide-[#F0ECE5] md:hidden">
          {isLoading && orders.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-5 py-16 text-[#8A8176]">
              <RefreshCw className="animate-spin text-[#B3261E]" size={28} />
              <p>Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center px-5 py-16 text-center">
              <ShoppingBag size={32} className="mb-3 text-[#C9C0B3]" />
              <p className="font-medium text-[#514940]">No orders found</p>
              <p className="mt-1 text-sm text-[#A1988D]">
                {debouncedSearch
                  ? "Try another order number, customer name or email."
                  : selectedStatus
                    ? "Try changing your selected status filter."
                    : "There are no orders to display."}
              </p>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="space-y-4 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="break-all font-semibold text-[#1C1C1C]">
                      {order.order_number}
                    </p>
                    <p className="mt-1 text-xs text-[#A1988D]">
                      ID: {order.id.slice(0, 8)}
                    </p>
                  </div>

                  <span className="shrink-0 text-sm font-semibold text-[#1C1C1C]">
                    {formatCurrency(order.total)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-[#A1988D]">Order Date</p>
                    <p className="mt-1 text-sm text-[#514940]">
                      {new Date(order.created_at).toLocaleDateString("en-PH", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-[#A1988D]">Items</p>
                    <p className="mt-1 text-sm text-[#514940]">
                      {order.items?.length ?? 0}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ring-1 ring-inset ${getPaymentStatusStyle(order.payment_status)}`}
                  >
                    Payment: {formatStatus(order.payment_status)}
                  </span>

                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ring-1 ring-inset ${getOrderStatusStyle(order.status)}`}
                  >
                    {formatStatus(order.status)}
                  </span>
                </div>

                <div className="flex justify-end border-t border-[#F0ECE5] pt-3">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setSelectedOrder(order);
                      setIsDetailsOpen(true);
                    }}
                    tooltip="View Details"
                    className="cursor-pointer border border-[#E4DCCE] bg-white px-3 py-2 text-[#514940] shadow-none hover:bg-[#F8F5EF] hover:text-[#B3261E]"
                  >
                    <Eye size={16} />
                    <span className="ml-2">View Details</span>
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        <div className="border-t border-[#EAE4DA] px-4 py-3">
          <Pagination
            currentPage={currentPage}
            totalPages={pagination.totalPages}
            onPageChange={setCurrentPage}
            pageSize={pageSize}
            totalItems={pagination.total}
          />
        </div>
      </div>

      {/* Extracted Order Details Modal */}
      <OrderDetailsModal
        orderId={selectedOrder?.id}
        open={isDetailsOpen}
        onOpenChange={(open) => {
          setIsDetailsOpen(open);

          if (!open) {
            setSelectedOrder(null);
          }
        }}
        onRefresh={() => setRefreshKey((current) => current + 1)}
      />
    </div>
  );
};

export default OrdersPage;
