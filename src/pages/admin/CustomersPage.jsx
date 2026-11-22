import { useEffect, useState } from "react";
import { Download, Eye, RefreshCw, Users } from "lucide-react";
import { toast } from "sonner";
import CustomerDetailsModal from "@/components/admin/customers/CustomerDetailsModal";

import Pagination from "../../components/ui/Pagination";
import SearchInput from "../../components/ui/SearchInput";
import {
  exportAdminCustomers,
  getAdminCustomers,
} from "../../services/customerService";

import { exportCustomersToCSV } from "@/utils/csvUtils";

const formatCurrency = (amount) =>
  Number(amount ?? 0).toLocaleString("en-PH", {
    style: "currency",
    currency: "PHP",
  });

const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

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

  const getEmptyMessage = () => {
    if (debouncedSearch) {
      return "No customers match your search and selected filter.";
    }

    if (status === "deactivated") {
      return "No deactivated customers found.";
    }

    if (status === "active") {
      return "No active customers found.";
    }

    return "No customers found.";
  };

  const renderEmptyState = () => (
    <div className="flex flex-col items-center px-5 py-14 text-center">
      <Users size={32} className="mb-3 text-[#C9C0B3]" />

      <p className="font-medium text-[#514940]">No customers found</p>

      <p className="mt-1 text-sm text-[#A1988D]">{getEmptyMessage()}</p>
    </div>
  );

  const renderLoadingState = () => (
    <div className="flex flex-col items-center gap-3 px-5 py-14 text-[#8A8176]">
      <RefreshCw className="animate-spin text-[#B3261E]" size={28} />
      <p>Loading customers...</p>
    </div>
  );

  const renderErrorState = () => (
    <div className="flex flex-col items-center gap-3 px-5 py-14 text-center">
      <p className="text-sm text-rose-600">{error}</p>
      <button
        type="button"
        onClick={() => setCurrentPage((page) => page)}
        className="text-sm font-medium text-[#B3261E] hover:underline"
      >
        Please try again by changing the page or filter.
      </button>
    </div>
  );

  return (
    <main className="min-w-0 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[#1C1C1C]">
          Customer Management
        </h1>

        <p className="mt-1 text-sm text-[#8A8176]">
          Manage your registered customers and view their activity.
        </p>
      </div>

      {/* Customers Section */}
      <div className="overflow-hidden rounded-xl border border-[#E4DCCE] bg-white shadow-sm">
        {/* Section Header */}
        <div className="space-y-5 border-b border-[#EAE4DA] p-5">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-semibold text-[#1C1C1C]">
                Marketplace Customers
              </h2>

              <p className="mt-1 text-sm text-[#8A8176]">
                {pagination.totalCustomers}{" "}
                {pagination.totalCustomers === 1 ? "customer" : "customers"}{" "}
                found.
              </p>
            </div>

            <button
              type="button"
              onClick={handleExportCustomers}
              disabled={isExporting || pagination.totalCustomers === 0}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#1C1C1C] px-4 text-sm font-medium text-white transition hover:bg-[#38332E] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isExporting ? (
                <RefreshCw size={16} className="animate-spin" />
              ) : (
                <Download size={16} />
              )}

              {isExporting ? "Exporting..." : "Export CSV"}
            </button>
          </div>

          {/* Search and Filters */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(220px,1fr)_auto_auto]">
            <div className="min-w-0">
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Search customers by name or email..."
              />
            </div>

            <select
              value={sort}
              onChange={handleSortChange}
              aria-label="Sort customers"
              className="h-10 w-full rounded-lg border border-[#E4DCCE] bg-white px-3 text-sm text-[#514940] outline-none transition focus:border-[#B3261E] focus:ring-2 focus:ring-[#B3261E]/10"
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
              className="h-10 w-full rounded-lg border border-[#E4DCCE] bg-white px-3 text-sm text-[#514940] outline-none transition focus:border-[#B3261E] focus:ring-2 focus:ring-[#B3261E]/10"
            >
              <option value="all">All Customers</option>
              <option value="active">Active</option>
              <option value="deactivated">Deactivated</option>
            </select>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden overflow-x-auto md:block">
          {isLoading && customers.length === 0 ? (
            renderLoadingState()
          ) : error ? (
            renderErrorState()
          ) : customers.length === 0 ? (
            renderEmptyState()
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F8F6F1] text-xs font-semibold uppercase tracking-wide text-[#8A8176]">
                <tr>
                  <th className="px-5 py-4">Customer</th>
                  <th className="px-5 py-4">Registered</th>
                  <th className="px-5 py-4">Orders</th>
                  <th className="px-5 py-4">Total Spent</th>
                  <th className="px-5 py-4">Account</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#F0ECE5]">
                {customers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="transition-colors hover:bg-[#FCFAF6]"
                  >
                    <td className="px-5 py-4">
                      <p className="font-medium text-[#1C1C1C]">
                        {customer.full_name}
                      </p>

                      <p className="mt-1 text-sm text-[#8A8176]">
                        {customer.email}
                      </p>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-[#6B6258]">
                      {formatDate(customer.created_at)}
                    </td>

                    <td className="px-5 py-4 text-[#6B6258]">
                      {customer.total_orders}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 font-medium text-[#1C1C1C]">
                      {formatCurrency(customer.total_spent)}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          customer.is_active
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {customer.is_active ? "Active" : "Deactivated"}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedCustomer(customer)}
                        title="View customer details"
                        aria-label={`View details for ${customer.full_name}`}
                        className="rounded-lg p-2 text-[#6B6258] transition hover:bg-[#F2EEE7] hover:text-[#B3261E]"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Mobile Customer Cards */}
        <div className="divide-y divide-[#F0ECE5] md:hidden">
          {isLoading && customers.length === 0
            ? renderLoadingState()
            : error
              ? renderErrorState()
              : customers.length === 0
                ? renderEmptyState()
                : customers.map((customer) => (
                    <div key={customer.id} className="space-y-4 p-4">
                      {/* Customer Identity */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="break-words font-semibold text-[#1C1C1C]">
                            {customer.full_name}
                          </p>

                          <p className="mt-1 break-all text-sm text-[#8A8176]">
                            {customer.email}
                          </p>
                        </div>

                        <span
                          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                            customer.is_active
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-rose-50 text-rose-700"
                          }`}
                        >
                          {customer.is_active ? "Active" : "Deactivated"}
                        </span>
                      </div>

                      {/* Customer Information */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-[#A1988D]">Registered</p>

                          <p className="mt-1 text-sm text-[#514940]">
                            {formatDate(customer.created_at)}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-[#A1988D]">Total Orders</p>

                          <p className="mt-1 text-sm text-[#514940]">
                            {customer.total_orders}
                          </p>
                        </div>

                        <div className="col-span-2">
                          <p className="text-xs text-[#A1988D]">Total Spent</p>

                          <p className="mt-1 text-base font-semibold text-[#1C1C1C]">
                            {formatCurrency(customer.total_spent)}
                          </p>
                        </div>
                      </div>

                      {/* View Details */}
                      <div className="flex justify-end border-t border-[#F0ECE5] pt-3">
                        <button
                          type="button"
                          onClick={() => setSelectedCustomer(customer)}
                          className="inline-flex items-center gap-2 rounded-lg border border-[#E4DCCE] bg-white px-3 py-2 text-sm font-medium text-[#514940] transition hover:bg-[#F8F5EF] hover:text-[#B3261E]"
                        >
                          <Eye size={16} />
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
        </div>

        {/* Pagination */}
        <div className="border-t border-[#EAE4DA] px-4 py-3">
          <Pagination
            currentPage={currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalCustomers}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* Customer Details Modal */}
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
