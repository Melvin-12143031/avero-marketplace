import { useState, useEffect } from "react";
import { getOrders, formatPrice } from "../services/orderService";
import { Link } from "react-router-dom";
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
        setError("Unable to load your orders. Please try again");
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

    const matchesSearch = order.id
      .toLowerCase()
      .includes(searchTerm.trim().toLowerCase());

    const cutoffDate = getDateCutoff();
    const orderDate = new Date(order.created_at);

    const matchesDate = !cutoffDate || orderDate >= cutoffDate;

    return matchesStatus && matchesSearch && matchesDate;
  });

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-slate-600">Loading your orders...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center px-5">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">
            Unable to Load Orders
          </h1>

          <p className="mt-3 text-slate-600">{error}</p>

          <button
            onClick={() => window.location.reload()}
            className="mt-6 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-slate-900">My Orders</h1>

      <p className="mt-2 text-slate-600">
        You have {orders.length} {orders.length === 1 ? "order" : "orders"}.
      </p>

      <div className="mt-6">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by order reference..."
          clearable
        />
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <select
          value={activeFilter}
          onChange={(event) => setActiveFilter(event.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          aria-label="Filter by order status"
        >
          <option value="all">All Orders</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <select
          value={dateFilter}
          onChange={(event) => setDateFilter(event.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          aria-label="Filter by date range"
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="7days">Last 7 Days</option>
          <option value="30days">Last 30 Days</option>
        </select>
      </div>

      {orders.length === 0 && (
        <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <h2 className="text-lg font-semibold text-slate-900">
            No orders yet
          </h2>

          <p className="mt-2 text-sm text-slate-600">
            You haven't placed any orders yet. Start shopping to see your orders
            here.
          </p>

          <Link
            to="/"
            className="mt-5 inline-block rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Start Shopping
          </Link>
        </div>
      )}

      {orders.length > 0 && filteredOrders.length === 0 && (
        <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <h2 className="text-lg font-semibold text-slate-900">
            No matching orders
          </h2>

          <p className="mt-2 text-sm text-slate-600">
            There are no orders with this status.
          </p>
        </div>
      )}

      {filteredOrders.length > 0 && (
        <div className="mt-8 space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <p className="text-sm text-slate-500">Order Reference</p>

                  <h2 className="mt-1 font-semibold text-slate-900">
                    {order.id}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">Total Amount</p>
                  <p className="mt-1 text-lg font-bold text-slate-900">
                    {formatPrice(order.total)}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {order.items.length}{" "}
                    {order.items.length === 1 ? "item" : "items"}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                <div className="flex gap-3 text-sm">
                  <OrderStatusBadge status={order.status} />

                  <OrderStatusBadge status={order.payment_status} />
                </div>

                <Link
                  to={`/order-confirmation/${order.id}`}
                  className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  View Details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

export default OrderHistoryPage;
