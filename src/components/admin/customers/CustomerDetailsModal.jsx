import { useEffect, useState } from "react";
import {
  RefreshCw,
  UserRound,
  Mail,
  CalendarDays,
  ShoppingBag,
  Wallet,
  UserX,
  UserCheck,
  History,
} from "lucide-react";

import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  getAdminCustomerById,
  getAdminCustomerOrders,
  getAdminCustomerActivity,
  deactivateCustomer,
  reactivateCustomer,
} from "@/services/customerService";

import Pagination from "@/components/ui/Pagination";

const formatCurrency = (amount) =>
  Number(amount ?? 0).toLocaleString("en-PH", {
    style: "currency",
    currency: "PHP",
  });

const formatDate = (date) =>
  date ? new Date(date).toLocaleDateString("en-PH") : "—";

const formatDateTime = (date) =>
  date
    ? new Date(date).toLocaleString("en-PH", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "—";

const formatStatus = (status = "") => status.replaceAll("_", " ");

const getOrderStatusStyle = (status) => {
  const styles = {
    pending: "bg-amber-100 text-amber-700",
    processing: "bg-blue-100 text-blue-700",
    shipped: "bg-violet-100 text-violet-700",
    delivered: "bg-emerald-100 text-emerald-700",
    cancelled: "bg-rose-100 text-rose-700",
  };

  return styles[status] || "bg-slate-100 text-slate-700";
};

const getPaymentStatusStyle = (status) => {
  const styles = {
    paid: "bg-emerald-100 text-emerald-700",
    refunded: "bg-violet-100 text-violet-700",
    pending: "bg-amber-100 text-amber-700",
    failed: "bg-rose-100 text-rose-700",
    cancelled: "bg-slate-100 text-slate-700",
  };

  return styles[status] || "bg-slate-100 text-slate-700";
};

const CustomerDetailsModal = ({ customerId, open, onOpenChange }) => {
  const [customer, setCustomer] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState("overview");

  const [orders, setOrders] = useState([]);
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersPagination, setOrdersPagination] = useState({
    totalOrders: 0,
    totalPages: 0,
  });

  const [isOrdersLoading, setIsOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");

  const [activities, setActivities] = useState([]);
  const [activityPage, setActivityPage] = useState(1);
  const [activityPagination, setActivityPagination] = useState({
    totalActivities: 0,
    totalPages: 0,
  });

  const [isActivityLoading, setIsActivityLoading] = useState(false);
  const [activityError, setActivityError] = useState("");

  const [isAccountActionLoading, setIsAccountActionLoading] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

  const ordersPageSize = 10;
  const activityPageSize = 10;

  const handleAccountStatusChange = async () => {
    if (!customer || isAccountActionLoading) return;

    const isCurrentlyActive = customer.is_active;

    try {
      setIsAccountActionLoading(true);

      const response = isCurrentlyActive
        ? await deactivateCustomer(customerId)
        : await reactivateCustomer(customerId);

      setCustomer((previousCustomer) => ({
        ...previousCustomer,
        ...response.data.customer,
      }));

      setIsConfirmationOpen(false);

      toast.success(
        isCurrentlyActive
          ? "Customer account deactivated successfully."
          : "Customer account reactivated successfully.",
      );
    } catch (error) {
      toast.error(error.message || "Failed to update customer account status.");
    } finally {
      setIsAccountActionLoading(false);
    }
  };

  // Load customer details when the modal opens
  useEffect(() => {
    if (!open || !customerId) return;

    let isMounted = true;

    const loadCustomer = async () => {
      try {
        setIsLoading(true);
        setError("");

        const response = await getAdminCustomerById(customerId);

        if (isMounted) {
          setCustomer(response.data.customer);
        }
      } catch (error) {
        if (isMounted) {
          setError(error.message || "Failed to load customer details.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadCustomer();

    return () => {
      isMounted = false;
    };
  }, [open, customerId]);

  // Load customer orders when the Orders tab is active
  useEffect(() => {
    if (!open || !customerId || activeTab !== "orders") return;

    let isMounted = true;

    const loadOrders = async () => {
      try {
        setIsOrdersLoading(true);
        setOrdersError("");

        const response = await getAdminCustomerOrders(customerId, {
          page: ordersPage,
          limit: ordersPageSize,
        });

        if (isMounted) {
          setOrders(response.data.orders);

          setOrdersPagination({
            totalOrders: response.pagination.totalOrders,
            totalPages: response.pagination.totalPages,
          });
        }
      } catch (error) {
        if (isMounted) {
          setOrdersError(error.message || "Failed to load customer orders.");
        }
      } finally {
        if (isMounted) {
          setIsOrdersLoading(false);
        }
      }
    };

    loadOrders();

    return () => {
      isMounted = false;
    };
  }, [open, customerId, activeTab, ordersPage]);

  // Load customer activity when the Activity tab is active
  useEffect(() => {
    if (!open || !customerId || activeTab !== "activity") return;

    let isMounted = true;

    const loadActivity = async () => {
      try {
        setIsActivityLoading(true);
        setActivityError("");

        const response = await getAdminCustomerActivity(customerId, {
          page: activityPage,
          limit: activityPageSize,
        });

        if (isMounted) {
          setActivities(response.data.activities);

          setActivityPagination({
            totalActivities: response.pagination.totalActivities,
            totalPages: response.pagination.totalPages,
          });
        }
      } catch (error) {
        if (isMounted) {
          setActivityError(
            error.message || "Failed to load customer activity.",
          );
        }
      } finally {
        if (isMounted) {
          setIsActivityLoading(false);
        }
      }
    };

    loadActivity();

    return () => {
      isMounted = false;
    };
  }, [open, customerId, activeTab, activityPage]);

  const handleOpenChange = (nextOpen) => {
    if (!nextOpen) {
      setActiveTab("overview");

      setOrdersPage(1);
      setOrders([]);
      setOrdersPagination({
        totalOrders: 0,
        totalPages: 0,
      });
      setOrdersError("");

      setActivityPage(1);
      setActivities([]);
      setActivityPagination({
        totalActivities: 0,
        totalPages: 0,
      });
      setActivityError("");

      setIsConfirmationOpen(false);
    }

    onOpenChange(nextOpen);
  };

  const handleConfirmationOpenChange = (nextOpen) => {
    if (isAccountActionLoading) return;

    setIsConfirmationOpen(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex h-[650px] max-h-[90vh] w-[calc(100%-2rem)] max-w-4xl flex-col overflow-hidden">
        <DialogHeader className="shrink-0">
          <DialogTitle>Customer Details</DialogTitle>
          <DialogDescription>
            View customer information, order history, and account activity.
          </DialogDescription>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col">
          {isLoading ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 text-slate-500">
              <RefreshCw size={28} className="animate-spin text-slate-400" />
              <p>Loading customer details...</p>
            </div>
          ) : error ? (
            <div className="flex flex-1 items-center justify-center py-12 text-center text-sm text-red-600">
              {error}
            </div>
          ) : customer ? (
            <div className="flex min-h-0 flex-1 flex-col gap-5">
              {/* Customer Header - Fixed */}
              <div className="flex shrink-0 flex-col gap-2 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    {customer.full_name}
                  </h3>
                  <p className="text-sm text-slate-500">{customer.email}</p>
                </div>

                <div className="text-sm text-slate-500">
                  Customer since {formatDate(customer.created_at)}
                </div>
              </div>

              {/* Customer Tabs */}
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="flex min-h-0 flex-1 flex-col"
              >
                <TabsList className="grid w-full shrink-0 grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="orders">Orders</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                </TabsList>

                <div className="min-h-0 flex-1 overflow-y-auto">
                  {/* Overview Tab */}
                  <TabsContent value="overview" className="mt-0 pt-5">
                    <div className="space-y-6">
                      {/* Customer Information */}
                      <div>
                        <h3 className="mb-4 text-sm font-semibold text-slate-900">
                          Customer Information
                        </h3>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="flex items-start gap-3 rounded-lg border border-slate-200 p-4">
                            <UserRound
                              size={18}
                              className="mt-0.5 text-slate-400"
                            />

                            <div>
                              <p className="text-xs text-slate-500">
                                Full Name
                              </p>

                              <p className="mt-1 font-medium text-slate-900">
                                {customer.full_name}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3 rounded-lg border border-slate-200 p-4">
                            <Mail size={18} className="mt-0.5 text-slate-400" />

                            <div>
                              <p className="text-xs text-slate-500">
                                Email Address
                              </p>

                              <p className="mt-1 break-all font-medium text-slate-900">
                                {customer.email}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3 rounded-lg border border-slate-200 p-4 sm:col-span-2">
                            <CalendarDays
                              size={18}
                              className="mt-0.5 text-slate-400"
                            />

                            <div>
                              <p className="text-xs text-slate-500">
                                Registration Date
                              </p>

                              <p className="mt-1 font-medium text-slate-900">
                                {formatDate(customer.created_at)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Customer Statistics */}
                      <div>
                        <h3 className="mb-4 text-sm font-semibold text-slate-900">
                          Customer Statistics
                        </h3>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="rounded-lg border border-slate-200 p-5">
                            <div className="flex items-center justify-between">
                              <p className="text-sm text-slate-500">
                                Total Orders
                              </p>

                              <ShoppingBag
                                size={20}
                                className="text-slate-400"
                              />
                            </div>

                            <p className="mt-3 text-2xl font-bold text-slate-900">
                              {customer.total_orders ?? 0}
                            </p>
                          </div>

                          <div className="rounded-lg border border-slate-200 p-5">
                            <div className="flex items-center justify-between">
                              <p className="text-sm text-slate-500">
                                Total Spent
                              </p>

                              <Wallet size={20} className="text-slate-400" />
                            </div>

                            <p className="mt-3 text-2xl font-bold text-slate-900">
                              {formatCurrency(customer.total_spent)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Account Management */}
                      <div>
                        <h3 className="mb-4 text-sm font-semibold text-slate-900">
                          Account Management
                        </h3>

                        <div className="rounded-lg border border-slate-200 p-5">
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-slate-900">
                                  Account Status
                                </span>

                                <span
                                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                    customer.is_active
                                      ? "bg-emerald-100 text-emerald-700"
                                      : "bg-rose-100 text-rose-700"
                                  }`}
                                >
                                  {customer.is_active
                                    ? "Active"
                                    : "Deactivated"}
                                </span>
                              </div>

                              <p className="mt-2 text-sm text-slate-500">
                                {customer.is_active
                                  ? "This customer can log in and access their account."
                                  : "This customer cannot log in or access protected account features."}
                              </p>

                              {!customer.is_active &&
                                customer.deactivated_at && (
                                  <p className="mt-2 text-xs text-slate-400">
                                    Deactivated on{" "}
                                    {formatDate(customer.deactivated_at)}
                                  </p>
                                )}
                            </div>

                            <button
                              type="button"
                              onClick={() => setIsConfirmationOpen(true)}
                              disabled={isAccountActionLoading}
                              className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
                                customer.is_active
                                  ? "bg-rose-600 hover:bg-rose-700"
                                  : "bg-emerald-600 hover:bg-emerald-700"
                              }`}
                            >
                              {customer.is_active ? (
                                <UserX size={16} />
                              ) : (
                                <UserCheck size={16} />
                              )}

                              {customer.is_active
                                ? "Deactivate Account"
                                : "Reactivate Account"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Orders Tab */}
                  <TabsContent value="orders" className="mt-0 pt-5">
                    <div className="space-y-5">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">
                          Order History
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          {ordersPagination.totalOrders}{" "}
                          {ordersPagination.totalOrders === 1
                            ? "order"
                            : "orders"}{" "}
                          found.
                        </p>
                      </div>

                      {/* Orders Table */}
                      <div className="overflow-x-auto rounded-lg border border-slate-200">
                        <table className="w-full min-w-[850px] text-left text-sm">
                          <thead className="bg-slate-50 text-slate-600">
                            <tr>
                              <th className="px-4 py-3 font-medium">
                                Order Number
                              </th>
                              <th className="px-4 py-3 font-medium">Date</th>
                              <th className="px-4 py-3 font-medium">Items</th>
                              <th className="px-4 py-3 font-medium">Total</th>
                              <th className="px-4 py-3 font-medium">
                                Order Status
                              </th>
                              <th className="px-4 py-3 font-medium">Payment</th>
                            </tr>
                          </thead>

                          <tbody className="divide-y divide-slate-200">
                            {isOrdersLoading ? (
                              <tr>
                                <td
                                  colSpan={6}
                                  className="px-4 py-12 text-center text-slate-500"
                                >
                                  <div className="flex flex-col items-center gap-3">
                                    <RefreshCw
                                      size={24}
                                      className="animate-spin text-slate-400"
                                    />
                                    <p>Loading order history...</p>
                                  </div>
                                </td>
                              </tr>
                            ) : ordersError ? (
                              <tr>
                                <td
                                  colSpan={6}
                                  className="px-4 py-12 text-center text-red-600"
                                >
                                  {ordersError}
                                </td>
                              </tr>
                            ) : orders.length === 0 ? (
                              <tr>
                                <td
                                  colSpan={6}
                                  className="px-4 py-12 text-center text-slate-500"
                                >
                                  This customer has no orders yet.
                                </td>
                              </tr>
                            ) : (
                              orders.map((order) => (
                                <tr
                                  key={order.id}
                                  className="transition hover:bg-slate-50/70"
                                >
                                  <td className="px-4 py-3 font-medium text-slate-900">
                                    <span className="break-all">
                                      {order.order_number}
                                    </span>
                                  </td>

                                  <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                                    {formatDate(order.created_at)}
                                  </td>

                                  <td className="px-4 py-3 text-slate-600">
                                    {order.item_count}
                                  </td>

                                  <td className="px-4 py-3 whitespace-nowrap font-medium text-slate-900">
                                    {formatCurrency(order.total)}
                                  </td>

                                  <td className="px-4 py-3">
                                    <span
                                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${getOrderStatusStyle(order.status)}`}
                                    >
                                      {formatStatus(order.status)}
                                    </span>
                                  </td>

                                  <td className="px-4 py-3">
                                    <span
                                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${getPaymentStatusStyle(order.payment_status)}`}
                                    >
                                      {formatStatus(order.payment_status)}
                                    </span>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Orders Pagination */}
                      {!isOrdersLoading &&
                        !ordersError &&
                        orders.length > 0 && (
                          <Pagination
                            currentPage={ordersPage}
                            totalPages={ordersPagination.totalPages}
                            totalItems={ordersPagination.totalOrders}
                            pageSize={ordersPageSize}
                            onPageChange={setOrdersPage}
                          />
                        )}
                    </div>
                  </TabsContent>

                  {/* Activity Tab */}
                  <TabsContent value="activity" className="mt-0 pt-5">
                    <div className="space-y-5">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">
                          Account Activity
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          {activityPagination.totalActivities}{" "}
                          {activityPagination.totalActivities === 1
                            ? "activity"
                            : "activities"}{" "}
                          recorded.
                        </p>
                      </div>

                      {isActivityLoading ? (
                        <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-500">
                          <RefreshCw
                            size={26}
                            className="animate-spin text-slate-400"
                          />
                          <p>Loading account activity...</p>
                        </div>
                      ) : activityError ? (
                        <div className="py-12 text-center text-sm text-red-600">
                          {activityError}
                        </div>
                      ) : activities.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 px-4 py-16 text-center">
                          <History size={32} className="mb-3 text-slate-400" />
                          <p className="font-medium text-slate-700">
                            No account activity yet
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            Account changes will appear here.
                          </p>
                        </div>
                      ) : (
                        <>
                          <div className="space-y-3">
                            {activities.map((activity) => {
                              const isDeactivation =
                                activity.action === "deactivated";

                              return (
                                <div
                                  key={activity.id}
                                  className="flex gap-4 rounded-lg border border-slate-200 p-4"
                                >
                                  <div
                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                                      isDeactivation
                                        ? "bg-rose-100 text-rose-600"
                                        : "bg-emerald-100 text-emerald-600"
                                    }`}
                                  >
                                    {isDeactivation ? (
                                      <UserX size={18} />
                                    ) : (
                                      <UserCheck size={18} />
                                    )}
                                  </div>

                                  <div className="min-w-0 flex-1">
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                      <span
                                        className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-medium ${
                                          isDeactivation
                                            ? "bg-rose-100 text-rose-700"
                                            : "bg-emerald-100 text-emerald-700"
                                        }`}
                                      >
                                        {isDeactivation
                                          ? "Account Deactivated"
                                          : "Account Reactivated"}
                                      </span>

                                      <span className="text-xs text-slate-500">
                                        {formatDateTime(activity.created_at)}
                                      </span>
                                    </div>

                                    <p className="mt-3 text-sm text-slate-700">
                                      Performed by{" "}
                                      <span className="font-medium text-slate-900">
                                        {activity.admin_name}
                                      </span>
                                    </p>

                                    <p className="mt-1 break-all text-xs text-slate-500">
                                      {activity.admin_email}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Activity Pagination */}
                          <Pagination
                            currentPage={activityPage}
                            totalPages={activityPagination.totalPages}
                            totalItems={activityPagination.totalActivities}
                            pageSize={activityPageSize}
                            onPageChange={setActivityPage}
                          />
                        </>
                      )}
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          ) : null}
        </div>

        {/* Account Status Confirmation */}
        <AlertDialog
          open={isConfirmationOpen}
          onOpenChange={handleConfirmationOpenChange}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {customer?.is_active
                  ? "Deactivate Customer Account?"
                  : "Reactivate Customer Account?"}
              </AlertDialogTitle>

              <AlertDialogDescription>
                {customer?.is_active
                  ? `Are you sure you want to deactivate ${customer?.full_name}'s account? They will no longer be able to log in or access protected account features.`
                  : `Are you sure you want to reactivate ${customer?.full_name}'s account? They will be able to log in and access their account again.`}
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel disabled={isAccountActionLoading}>
                Cancel
              </AlertDialogCancel>

              <AlertDialogAction
                type="button"
                onClick={handleAccountStatusChange}
                disabled={isAccountActionLoading}
                className={
                  customer?.is_active
                    ? "bg-rose-600 text-white hover:bg-rose-700"
                    : "bg-emerald-600 text-white hover:bg-emerald-700"
                }
              >
                {isAccountActionLoading ? (
                  <>
                    <RefreshCw size={16} className="mr-2 animate-spin" />
                    Processing...
                  </>
                ) : customer?.is_active ? (
                  "Deactivate Account"
                ) : (
                  "Reactivate Account"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerDetailsModal;
