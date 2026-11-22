import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getOrders, formatPrice } from "../services/orderService";
import OrderStatusBadge from "../components/orders/OrderStatusBadge";
import SearchInput from "../components/ui/SearchInput";

const OrderHistoryPage = () => {
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all");

  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const savedOrders = await getOrders();
        setOrders(savedOrders);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
        setError("Unable to load your orders. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const sortedOrders = [...orders].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at),
  );

  const getDateCutoff = () => {
    const today = new Date();

    if (dateFilter === "today") {
      return new Date(today.getFullYear(), today.getMonth(), today.getDate());
    }

    if (dateFilter === "7days") {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 7);
      return cutoff;
    }

    if (dateFilter === "30days") {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 30);
      return cutoff;
    }

    return null;
  };

  const filteredOrders = sortedOrders.filter((order) => {
    const matchesStatus =
      activeFilter === "all" || order.status?.toLowerCase() === activeFilter;

    const matchesSearch = String(order.id)
      .toLowerCase()
      .includes(searchTerm.trim().toLowerCase());

    const cutoffDate = getDateCutoff();
    const orderDate = new Date(order.created_at);

    const matchesDate = !cutoffDate || orderDate >= cutoffDate;

    return matchesStatus && matchesSearch && matchesDate;
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#FAF8F4] px-4">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#E4DCCE] border-t-[#B3261E]" />
          <p className="mt-4 text-sm text-[#6B6258]">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#FAF8F4] px-5">
        <div className="w-full max-w-md rounded-2xl border border-[#E4DCCE] bg-white p-8 text-center">
          <h1 className="font-serif text-2xl font-semibold text-[#1C1C1C]">
            Unable to Load Orders
          </h1>

          <p className="mt-3 text-sm leading-6 text-[#6B6258]">{error}</p>

          <button
            onClick={() => window.location.reload()}
            className="mt-6 rounded-md bg-[#B3261E] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#8F1E19]"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F4]">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Page heading */}
        <div className="border-b border-[#E4DCCE] pb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B3261E]">
            Your Account
          </p>

          <div className="mt-3 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h1 className="font-serif text-3xl font-semibold tracking-tight text-[#1C1C1C] sm:text-4xl">
                Your Orders
              </h1>

              <p className="mt-2 text-sm text-[#6B6258]">
                Keep track of your purchases and order updates.
              </p>
            </div>

            <p className="text-sm text-[#6B6258]">
              <span className="font-semibold text-[#1C1C1C]">
                {orders.length}
              </span>{" "}
              {orders.length === 1 ? "order" : "orders"} placed
            </p>
          </div>
        </div>

        {/* Search and filters */}
        {orders.length > 0 && (
          <section className="mt-8 rounded-2xl border border-[#E4DCCE] bg-white p-5 sm:p-6">
            <div className="grid gap-4 md:grid-cols-[1fr_auto_auto] md:items-end">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#6B6258]">
                  Search Orders
                </label>

                <SearchInput
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder="Search by order reference..."
                  clearable
                />
              </div>

              <div>
                <label
                  htmlFor="order-status-filter"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#6B6258]"
                >
                  Order Status
                </label>

                <select
                  id="order-status-filter"
                  value={activeFilter}
                  onChange={(event) => setActiveFilter(event.target.value)}
                  className="w-full min-w-[160px] rounded-lg border border-[#E4DCCE] bg-white px-4 py-2.5 text-sm text-[#1C1C1C] outline-none transition hover:border-[#C9B9A7] focus:border-[#B3261E] focus:ring-2 focus:ring-[#D78B7F]/20"
                >
                  <option value="all">All Orders</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="order-date-filter"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#6B6258]"
                >
                  Date Range
                </label>

                <select
                  id="order-date-filter"
                  value={dateFilter}
                  onChange={(event) => setDateFilter(event.target.value)}
                  className="w-full min-w-[150px] rounded-lg border border-[#E4DCCE] bg-white px-4 py-2.5 text-sm text-[#1C1C1C] outline-none transition hover:border-[#C9B9A7] focus:border-[#B3261E] focus:ring-2 focus:ring-[#D78B7F]/20"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="7days">Last 7 Days</option>
                  <option value="30days">Last 30 Days</option>
                </select>
              </div>
            </div>
          </section>
        )}

        {/* No orders */}
        {orders.length === 0 && (
          <section className="mt-10 rounded-2xl border border-dashed border-[#D8CCBC] bg-white px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#EDE6D8] text-[#8A8176]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-7 w-7"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 7h12l1 13H5L6 7Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 9V6a3 3 0 0 1 6 0v3"
                />
              </svg>
            </div>

            <h2 className="mt-5 font-serif text-2xl font-semibold text-[#1C1C1C]">
              No orders just yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#6B6258]">
              Your next favorite find might be waiting for you. Explore our
              collection and your purchases will appear here.
            </p>

            <Link
              to="/shop"
              className="mt-7 inline-flex items-center justify-center rounded-md bg-[#B3261E] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#8F1E19]"
            >
              Explore the Collection
            </Link>
          </section>
        )}

        {/* No matching orders */}
        {orders.length > 0 && filteredOrders.length === 0 && (
          <section className="mt-8 rounded-2xl border border-dashed border-[#D8CCBC] bg-white px-6 py-14 text-center">
            <h2 className="font-serif text-xl font-semibold text-[#1C1C1C]">
              No matching orders
            </h2>

            <p className="mt-2 text-sm text-[#6B6258]">
              Try adjusting your search or filters to find what you're looking
              for.
            </p>

            <button
              onClick={() => {
                setSearchTerm("");
                setActiveFilter("all");
                setDateFilter("all");
              }}
              className="mt-5 text-sm font-semibold text-[#B3261E] transition-colors hover:text-[#8F1E19]"
            >
              Clear all filters
            </button>
          </section>
        )}

        {/* Order list */}
        {filteredOrders.length > 0 && (
          <section className="mt-8 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl font-semibold text-[#1C1C1C]">
                Order History
              </h2>

              <p className="text-xs text-[#8A8176]">
                Showing {filteredOrders.length}{" "}
                {filteredOrders.length === 1 ? "order" : "orders"}
              </p>
            </div>

            {filteredOrders.map((order) => (
              <article
                key={order.id}
                className="rounded-2xl border border-[#E4DCCE] bg-white p-5 transition-shadow hover:shadow-sm sm:p-6"
              >
                <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#8A8176]">
                      Order Reference
                    </p>

                    <h3
                      title={order.id}
                      className="mt-2 break-all text-sm font-semibold text-[#1C1C1C] sm:text-base"
                    >
                      {order.id}
                    </h3>

                    <p className="mt-2 text-sm text-[#6B6258]">
                      Placed on{" "}
                      {new Date(order.created_at).toLocaleDateString(
                        undefined,
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        },
                      )}
                    </p>
                  </div>

                  <div className="sm:min-w-[150px] sm:text-right">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#8A8176]">
                      Order Total
                    </p>

                    <p className="mt-2 text-xl font-semibold tabular-nums text-[#1C1C1C]">
                      {formatPrice(order.total)}
                    </p>

                    <p className="mt-1 text-sm text-[#6B6258]">
                      {order.items.length}{" "}
                      {order.items.length === 1 ? "item" : "items"}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-col justify-between gap-4 border-t border-[#F0EBE3] pt-4 sm:flex-row sm:items-center">
                  <div className="flex flex-wrap items-center gap-2">
                    <OrderStatusBadge status={order.status} />
                    <OrderStatusBadge status={order.payment_status} />
                  </div>

                  <Link
                    to={`/order-confirmation/${order.id}`}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#B3261E] transition-colors hover:text-[#8F1E19]"
                  >
                    View Details
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </div>
  );
};

export default OrderHistoryPage;
