import { useEffect, useState } from "react";
import { Download, Eye, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import CustomerDetailsModal from "@/components/admin/customers/CustomerDetailsModal";

import Pagination from "../../components/ui/Pagination";
import SearchInput from "../../components/ui/SearchInput";
import {
  exportAdminCustomers,
  getAdminCustomers,
} from "../../services/customerService";

import { exportCustomersToCSV } from "@/utils/csvUtils";

const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const [pagination, setPagination] = useState({
    totalCustomers: 0,
    totalPages: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("newest");

  const handleSortChange = (event) => {
    setSort(event.target.value);
    setCurrentPage(1);
  };

  const handleExportCustomers = async () => {
    try {
      setIsExporting(true);
      const response = await exportAdminCustomers({
        search: debouncedSearch,
        status,
        sort,
      });

      exportCustomersToCSV(response.data.customers);

      toast.success("Customer records exported successfully.");
    } catch (error) {
      toast.error(error.message || "Failed to export customers.");
    } finally {
      setIsExporting(false);
    }
  };

  // Debounce customer search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setCurrentPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // Load customers
  useEffect(() => {
    const loadCustomers = async () => {
      try {
        setIsLoading(true);
        setError("");

        const response = await getAdminCustomers({
          page: currentPage,
          limit: pageSize,
          search: debouncedSearch,
          status,
          sort,
        });

        setCustomers(response.data.customers);

        setPagination({
          totalCustomers: response.pagination.totalCustomers,
          totalPages: response.pagination.totalPages,
        });
      } catch (error) {
        setError(error.message || "Failed to load customers.");
      } finally {
        setIsLoading(false);
      }
    };

    loadCustomers();
  }, [currentPage, pageSize, debouncedSearch, status, sort]);

  const handleStatusChange = (event) => {
    setStatus(event.target.value);
    setCurrentPage(1);
  };

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Customer Management
        </h1>

        <p className="mt-2 text-slate-600">
          Manage your registered customers and view their activity.
        </p>
      </div>

      {/* Customers Table */}
      <div className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white">
        {/* Table Header */}
        <div className="flex flex-col gap-4 border-b border-slate-200 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Marketplace Customers
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {pagination.totalCustomers}{" "}
              {pagination.totalCustomers === 1 ? "customer" : "customers"}{" "}
              found.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={handleExportCustomers}
              disabled={isExporting || pagination.totalCustomers === 0}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isExporting ? (
                <RefreshCw size={16} className="animate-spin" />
              ) : (
                <Download size={16} />
              )}

              {isExporting ? "Exporting..." : "Export CSV"}
            </button>

            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search customers by name or email..."
            />
            <select
              value={sort}
              onChange={handleSortChange}
              aria-label="Sort customers"
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            >
              <option value="newest">Newest Registered</option>
              <option value="oldest">Oldest Registered</option>
              <option value="name_asc">Name (A–Z)</option>
              <option value="name_desc">Name (Z–A)</option>
              <option value="spent_desc">Highest Spending</option>
              <option value="orders_desc">Most Orders</option>
            </select>
            <select
              value={status}
              onChange={handleStatusChange}
              aria-label="Filter customers by account status"
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            >
              <option value="all">All Customers</option>
              <option value="active">Active</option>
              <option value="deactivated">Deactivated</option>
            </select>
          </div>
        </div>

        {/* Customers Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Registered</th>
                <th className="px-6 py-4 font-medium">Orders</th>
                <th className="px-6 py-4 font-medium">Total Spent</th>
                <th className="px-6 py-4 font-medium">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {isLoading && customers.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-16 text-center text-slate-500"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <RefreshCw
                        className="animate-spin text-slate-400"
                        size={28}
                      />
                      <p>Loading customers...</p>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-red-600"
                  >
                    {error}
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    {debouncedSearch
                      ? "No customers match your search and selected filter."
                      : status === "deactivated"
                        ? "No deactivated customers found."
                        : status === "active"
                          ? "No active customers found."
                          : "No customers found."}
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="transition hover:bg-slate-50/70"
                  >
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">
                        {customer.full_name}
                      </p>
                      <p className="text-slate-500">{customer.email}</p>
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {new Date(customer.created_at).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {customer.total_orders}
                    </td>

                    <td className="px-6 py-4 font-medium text-slate-900">
                      {new Intl.NumberFormat("en-PH", {
                        style: "currency",
                        currency: "PHP",
                      }).format(Number(customer.total_spent))}
                    </td>

                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => setSelectedCustomer(customer)}
                        title="View customer details"
                        aria-label="View customer details"
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="border-t border-slate-200 px-6 py-4">
          <Pagination
            currentPage={currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalCustomers}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      <CustomerDetailsModal
        customerId={selectedCustomer?.id}
        open={Boolean(selectedCustomer)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedCustomer(null);
          }
        }}
      />
    </main>
  );
};

export default CustomersPage;
