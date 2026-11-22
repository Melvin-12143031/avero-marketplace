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
  Crown,
  Repeat2,
  ShoppingBag,
  UserRound,
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

const orderStatusColors = [
  "#C58A2B",
  "#55758A",
  "#8B7296",
  "#4F8065",
  "#B85C52",
];

const paymentStatusStyles = {
  pending: "bg-amber-100 text-amber-800",
  paid: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  refunded: "bg-purple-100 text-purple-800",
  cancelled: "bg-stone-100 text-stone-700",
};

const orderStatusStyles = {
  pending: "bg-amber-100 text-amber-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const getStatusClass = (styles, status) =>
  styles[status] || "bg-stone-100 text-stone-700";

const formatOrderDate = (date) =>
  new Date(date).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const chartGridProps = {
  stroke: "#E4DCCE",
  strokeDasharray: "3 3",
  vertical: false,
};

const chartTooltipStyle = {
  contentStyle: {
    backgroundColor: "#FFFFFF",
    border: "1px solid #E4DCCE",
    borderRadius: "10px",
    padding: "10px 14px",
  },
  labelStyle: {
    color: "#1C1C1C",
    fontWeight: 600,
  },
};

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
        <p className="text-muted-foreground">Loading dashboard statistics...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-8">
        <p className="text-sm text-red-600">{error}</p>
      </main>
    );
  }

  const monthlyRevenue = (statistics.orders.monthly_revenue || []).map(
    (item) => ({
      month: new Date(`${item.month}-01T00:00:00`).toLocaleDateString("en-PH", {
        month: "short",
        year: "numeric",
      }),
      revenue: Number(item.revenue),
      orderCount: Number(item.order_count),
    }),
  );

  const orderStatusData = [
    { name: "Pending", value: Number(statistics.orders.pending_orders) },
    { name: "Processing", value: Number(statistics.orders.processing_orders) },
    { name: "Shipped", value: Number(statistics.orders.shipped_orders) },
    { name: "Delivered", value: Number(statistics.orders.delivered_orders) },
    { name: "Cancelled", value: Number(statistics.orders.cancelled_orders) },
  ];

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">
        Admin Dashboard
      </h1>

      <p className="mt-2 text-muted-foreground">
        Welcome to your marketplace administration panel.
      </p>

      {/* Main Statistics */}
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

      {/* Customer Segmentation */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold text-foreground">
          Customer Segmentation
        </h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <DashboardStatCard
            title="High-Value Customers"
            value={statistics.customers.segments.highValue}
            description="₱10,000+ in successful purchases"
            icon={Crown}
          />

          <DashboardStatCard
            title="Repeat Buyers"
            value={statistics.customers.segments.repeatBuyer}
            description="2 or more successful orders"
            icon={Repeat2}
          />

          <DashboardStatCard
            title="One-Time Buyers"
            value={statistics.customers.segments.oneTimeBuyer}
            description="Exactly 1 successful order"
            icon={ShoppingBag}
          />

          <DashboardStatCard
            title="No Purchases"
            value={statistics.customers.segments.noPurchases}
            description="No successful orders yet"
            icon={UserRound}
          />
        </div>
      </div>

      {/* Inventory Overview */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold text-foreground">
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

      {/* Order Status Overview */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold text-foreground">
          Order Status Overview
        </h2>

        <div className="mt-4 rounded-xl border border-border/80 bg-white p-6 shadow-sm">
          <div className="grid items-center gap-8 md:grid-cols-2">
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

                  <Tooltip
                    {...chartTooltipStyle}
                    formatter={(value, name) => [value, name]}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold tracking-tight text-foreground tabular-nums">
                  {statistics.orders.total_orders}
                </span>

                <span className="text-sm text-muted-foreground">
                  Total Orders
                </span>
              </div>
            </div>

            <div className="space-y-5">
              {orderStatusData.map((item, index) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="size-3 rounded-full"
                      style={{
                        backgroundColor: orderStatusColors[index],
                      }}
                    />

                    <span className="text-sm font-medium text-foreground">
                      {item.name}
                    </span>
                  </div>

                  <span className="font-semibold text-foreground tabular-nums">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Revenue */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold text-foreground">
          Monthly Revenue
        </h2>

        <div className="mt-4 rounded-xl border border-border/80 bg-white p-6 shadow-sm">
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
                    <stop offset="5%" stopColor="#B3261E" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#B3261E" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid {...chartGridProps} />

                <XAxis
                  dataKey="month"
                  tick={{ fill: "#6B6258", fontSize: 12 }}
                  axisLine={{ stroke: "#E4DCCE" }}
                  tickLine={false}
                />

                <YAxis
                  tickFormatter={(value) =>
                    `PHP ${value.toLocaleString("en-PH")}`
                  }
                  tick={{ fill: "#6B6258", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip
                  {...chartTooltipStyle}
                  formatter={(value) => [formatPrice(value), "Revenue"]}
                />

                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="#B3261E"
                  strokeWidth={2.5}
                  fill="url(#revenueGradient)"
                  activeDot={{ r: 6, fill: "#B3261E" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Monthly Orders */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold text-foreground">
          Monthly Orders
        </h2>

        <div className="mt-4 rounded-xl border border-border/80 bg-white p-6 shadow-sm">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyRevenue}>
                <CartesianGrid {...chartGridProps} />

                <XAxis
                  dataKey="month"
                  tick={{ fill: "#6B6258", fontSize: 12 }}
                  axisLine={{ stroke: "#E4DCCE" }}
                  tickLine={false}
                />

                <YAxis
                  allowDecimals={false}
                  tick={{ fill: "#6B6258", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip
                  {...chartTooltipStyle}
                  formatter={(value) => [value, "Orders"]}
                />

                <Line
                  type="monotone"
                  dataKey="orderCount"
                  name="Orders"
                  stroke="#6B6258"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#6B6258" }}
                  activeDot={{ r: 6, fill: "#B3261E" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold text-foreground">Recent Orders</h2>

        <div className="mt-4 overflow-hidden rounded-xl border border-border/80 bg-white shadow-sm">
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
            <>
              {/* Desktop Table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[850px] text-sm">
                  <thead className="border-b border-border bg-secondary/50">
                    <tr className="text-left text-muted-foreground">
                      <th className="px-6 py-4 font-medium">Order Number</th>
                      <th className="px-6 py-4 font-medium">Customer</th>
                      <th className="px-6 py-4 font-medium">Date</th>
                      <th className="px-6 py-4 font-medium">Total</th>
                      <th className="px-6 py-4 font-medium">Payment</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-border">
                    {recentOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="transition-colors hover:bg-secondary/30"
                      >
                        <td className="whitespace-nowrap px-6 py-4 font-medium text-foreground">
                          {order.order_number}
                        </td>

                        <td className="px-6 py-4">
                          <div className="font-medium text-foreground">
                            {order.shipping_address?.customer?.fullName ||
                              "Unknown Customer"}
                          </div>

                          <div className="text-xs text-muted-foreground">
                            {order.shipping_address?.customer?.email || ""}
                          </div>
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-muted-foreground">
                          {formatOrderDate(order.created_at)}
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 font-medium text-foreground">
                          {formatPrice(order.total)}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium capitalize ${getStatusClass(
                              paymentStatusStyles,
                              order.payment_status,
                            )}`}
                          >
                            {order.payment_status}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium capitalize ${getStatusClass(
                              orderStatusStyles,
                              order.status,
                            )}`}
                          >
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="divide-y divide-border md:hidden">
                {recentOrders.map((order) => (
                  <div key={order.id} className="space-y-4 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">
                          Order Number
                        </p>

                        <p className="mt-1 break-all text-sm font-semibold text-foreground">
                          {order.order_number}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium capitalize ${getStatusClass(
                          orderStatusStyles,
                          order.status,
                        )}`}
                      >
                        {order.status}
                      </span>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">Customer</p>

                      <p className="mt-1 text-sm font-medium text-foreground">
                        {order.shipping_address?.customer?.fullName ||
                          "Unknown Customer"}
                      </p>

                      <p className="break-all text-xs text-muted-foreground">
                        {order.shipping_address?.customer?.email || ""}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Date</p>

                        <p className="mt-1 text-sm text-foreground">
                          {formatOrderDate(order.created_at)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground">Total</p>

                        <p className="mt-1 text-sm font-semibold text-foreground">
                          {formatPrice(order.total)}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="mb-2 text-xs text-muted-foreground">
                        Payment Status
                      </p>

                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium capitalize ${getStatusClass(
                          paymentStatusStyles,
                          order.payment_status,
                        )}`}
                      >
                        {order.payment_status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
};

export default AdminDashboardPage;
