import { useEffect, useState } from "react";
import { getDashboardStatistics } from "../../services/dashboardService";

import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  AlertTriangle,
  PackageX,
  Boxes,
} from "lucide-react";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

import { formatPrice, getAdminOrders } from "../../services/orderService";
import DashboardStatCard from "@/components/ui/admin/DashboardStatCard";

const AdminDashboardPage = () => {
  const [statistics, setStatistics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [recentOrders, setRecentOrders] = useState([]);
  const [isRecentOrdersLoading, setIsRecentOrdersLoading] = useState(true);
  const [recentOrdersError, setRecentOrdersError] = useState("");

  useEffect(() => {
    const fetchDashboardStatistics = async () => {
      try {
        setIsLoading(true);
        setError("");

        const data = await getDashboardStatistics();

        setStatistics(data);
      } catch (error) {
        setError(error.message || "Failed to load dashboard statistics.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardStatistics();
  }, []);

  useEffect(() => {
    const fetchRecentOrders = async () => {
      try {
        setIsRecentOrdersLoading(true);
        setRecentOrdersError("");

        const { orders } = await getAdminOrders(1, 5);

        setRecentOrders(orders);
      } catch (error) {
        setRecentOrdersError(error.message || "Failed to load recent orders.");
      } finally {
        setIsRecentOrdersLoading(false);
      }
    };
    fetchRecentOrders();
  }, []);

  if (isLoading) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-8">
        <p>Loading dashboard statistics...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-8">
        <p className="text-red-600">{error}</p>
      </main>
    );
  }

  const monthlyRevenue = statistics.orders.monthly_revenue.map((item) => ({
    month: new Date(`${item.month}-01T00:00:00`).toLocaleDateString("en-PH", {
      month: "short",
      year: "numeric",
    }),
    revenue: Number(item.revenue),
    orderCount: Number(item.order_count),
  }));

  const orderStatusData = [
    { name: "Pending", value: Number(statistics.orders.pending_orders) },
    { name: "Processing", value: Number(statistics.orders.processing_orders) },
    { name: "Shipped", value: Number(statistics.orders.shipped_orders) },
    { name: "Delivered", value: Number(statistics.orders.delivered_orders) },
    { name: "Cancelled", value: Number(statistics.orders.cancelled_orders) },
  ];

  const orderStatusColors = [
    "#f59e0b",
    "#3b82f6",
    "#8b5cf6",
    "#22c55e",
    "#ef4444",
  ];

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>

      <p className="mt-2 text-slate-600">
        Welcome to your marketplace administration panel.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardStatCard
          title="Total Revenue"
          value={formatPrice(statistics.orders.total_revenue)}
          description="Revenue from paid orders"
          icon={DollarSign}
        />

        <DashboardStatCard
          title="Total Orders"
          value={statistics.orders.total_orders}
          description={`${statistics.orders.pending_orders} pending orders`}
          icon={ShoppingCart}
        />

        <DashboardStatCard
          title="Total Products"
          value={statistics.products.totalProducts}
          description={`${statistics.products.totalUnits} units in inventory`}
          icon={Package}
        />

        <DashboardStatCard
          title="Total Customers"
          value={statistics.customers.totalCustomers}
          description="Registered customer accounts"
          icon={Users}
        />
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-semibold text-slate-900">
          Inventory Overview
        </h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <DashboardStatCard
            title="Total Inventory Units"
            value={statistics.products.totalUnits}
            description="Units currently in stock"
            icon={Boxes}
          />

          <DashboardStatCard
            title="Low Stock Products"
            value={statistics.products.lowStockProducts}
            description="Products with 5 or fewer units"
            icon={AlertTriangle}
          />

          <DashboardStatCard
            title="Out of Stock Products"
            value={statistics.products.outOfStockProducts}
            description="Products with zero stock"
            icon={PackageX}
          />
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-semibold text-slate-900">
          Order Status Overview
        </h2>

        <div className="mt-4 rounded-xl border bg-white p-6">
          <div className="grid items-center gap-8 md:grid-cols-2">
            {/* Donut Chart */}
            <div className="relative h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={orderStatusData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={75}
                    outerRadius={110}
                    paddingAngle={3}
                    stroke="none"
                  >
                    {orderStatusData.map((entry, index) => (
                      <Cell key={entry.name} fill={orderStatusColors[index]} />
                    ))}
                  </Pie>

                  <Tooltip formatter={(value, name) => [value, name]} />
                </PieChart>
              </ResponsiveContainer>

              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-slate-900">
                  {statistics.orders.total_orders}
                </span>
                <span className="text-sm text-muted-foreground">
                  Total Orders
                </span>
              </div>
            </div>

            {/* Custom Legend */}
            <div className="space-y-5">
              {orderStatusData.map((item, index) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{
                        backgroundColor: orderStatusColors[index],
                      }}
                    />

                    <span className="text-sm font-medium text-slate-700">
                      {item.name}
                    </span>
                  </div>

                  <span className="font-semibold text-slate-900">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-semibold text-slate-900">
          Monthly Revenue
        </h2>

        <div className="mt-4 rounded-xl border bg-white p-6">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyRevenue}>
                <defs>
                  <linearGradient
                    id="revenueGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" vertical={false} />

                <XAxis dataKey="month" />

                <YAxis
                  tickFormatter={(value) =>
                    `PHP ${value.toLocaleString("en-PH")}`
                  }
                />

                <Tooltip
                  formatter={(value) => [formatPrice(value), "Revenue"]}
                />

                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="#6366f1"
                  strokeWidth={3}
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-semibold text-slate-900">Monthly Orders</h2>

        <div className="mt-4 rounded-xl border bg-white p-6">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />

                <XAxis dataKey="month" />

                <YAxis allowDecimals={false} />

                <Tooltip formatter={(value) => [value, "Orders"]} />

                <Line
                  type="monotone"
                  dataKey="orderCount"
                  name="Orders"
                  stroke="#0ea5e9"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-semibold text-slate-900">Recent Orders</h2>

        <div className="mt-4 overflow-x-auto rounded-xl border bg-white">
          {isRecentOrdersLoading ? (
            <p className="p-6 text-sm text-muted-foreground">
              Loading recent orders...
            </p>
          ) : recentOrdersError ? (
            <p className="p-6 text-sm text-red-600">{recentOrdersError}</p>
          ) : recentOrders.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">
              No orders found.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b bg-slate-50">
                <tr className="text-left text-slate-600">
                  <th className="px-6 py-4 font-medium">Order Number</th>
                  <th className="px-6 py-4 font-medium">Customer</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Total</th>
                  <th className="px-6 py-4 font-medium">Payment</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50">
                    <td className="whitespace-nowrap px-6 py-4 font-medium">
                      {order.order_number}
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">
                        {order.shipping_address?.customer?.fullName ||
                          "Unknown Customer"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {order.shipping_address?.customer?.email || ""}
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-6 py-4">
                      {new Date(order.created_at).toLocaleDateString("en-PH", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4">
                      {formatPrice(order.total)}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
                          {
                            unpaid: "bg-amber-100 text-amber-700",
                            paid: "bg-green-100 text-green-700",
                            failed: "bg-red-100 text-red-700",
                            refunded: "bg-violet-100 text-violet-700",
                            cancelled: "bg-slate-100 text-slate-700",
                          }[order.payment_status] ||
                          "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {order.payment_status}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
                          {
                            pending: "bg-amber-100 text-amber-700",
                            processing: "bg-blue-100 text-blue-700",
                            shipped: "bg-violet-100 text-violet-700",
                            delivered: "bg-green-100 text-green-700",
                            cancelled: "bg-red-100 text-red-700",
                          }[order.status] || "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  );
};

export default AdminDashboardPage;
