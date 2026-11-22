import { useEffect, useState } from "react";
import { getAdminContactInquiries } from "@/services/contactService";
import SearchInput from "@/components/ui/SearchInput";
import { Eye, Mail, RefreshCw } from "lucide-react";

import InquiryDetailsModal from "@/components/admin/contact/InquiryDetailsModal";

import Pagination from "@/components/ui/Pagination";

const ContactInquiriesPage = () => {
  const [inquiries, setInquiries] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [status, setStatus] = useState("all");
  const [inquiryType, setInquiryType] = useState("all");
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Debounce inquiry search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setCurrentPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // Load contact inquiries
  useEffect(() => {
    const loadInquiries = async () => {
      try {
        setIsLoading(true);
        setError("");

        const response = await getAdminContactInquiries({
          page: currentPage,
          limit: pageSize,
          search: debouncedSearch,
          status: status === "all" ? "" : status,
          inquiry_type: inquiryType === "all" ? "" : inquiryType,
        });

        setInquiries(response.inquiries);

        setPagination({
          total: response.pagination.total,
          totalPages: response.pagination.totalPages,
        });
      } catch (error) {
        setError(error.message || "Failed to load contact inquiries.");
      } finally {
        setIsLoading(false);
      }
    };

    loadInquiries();
  }, [currentPage, pageSize, debouncedSearch, status, inquiryType, refreshKey]);

  const handleStatusChange = (event) => {
    setStatus(event.target.value);
    setCurrentPage(1);
  };

  const handleInquiryTypeChange = (event) => {
    setInquiryType(event.target.value);
    setCurrentPage(1);
  };

  const renderLoadingState = () => (
    <div className="flex flex-col items-center gap-3 px-5 py-14 text-[#8A8176]">
      <RefreshCw className="animate-spin text-[#B3261E]" size={28} />
      <p>Loading inquiries...</p>
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

  const renderEmptyState = () => (
    <div className="flex flex-col items-center px-5 py-14 text-center">
      <Mail size={32} className="mb-3 text-[#C9C0B3]" />

      <p className="font-medium text-[#514940]">No inquiries found</p>

      <p className="mt-1 text-sm text-[#A1988D]">
        {debouncedSearch
          ? "No inquiries match your search and selected filters."
          : "There are currently no inquiries matching your selected filters."}
      </p>
    </div>
  );

  return (
    <main className="min-w-0 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[#1C1C1C]">
          Contact Inquiries
        </h1>

        <p className="mt-1 text-sm text-[#8A8176]">
          Manage customer questions and support requests.
        </p>
      </div>

      {/* Inquiries Section */}
      <div className="overflow-hidden rounded-xl border border-[#E4DCCE] bg-white shadow-sm">
        {/* Section Header */}
        <div className="space-y-5 border-b border-[#EAE4DA] p-5">
          <div>
            <h2 className="text-lg font-semibold text-[#1C1C1C]">
              Customer Inquiries
            </h2>

            <p className="mt-1 text-sm text-[#8A8176]">
              {pagination.total}{" "}
              {pagination.total === 1 ? "inquiry" : "inquiries"} found.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(220px,1fr)_auto_auto]">
            <div className="min-w-0">
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Search by name, email, or subject..."
              />
            </div>

            <select
              value={status}
              onChange={handleStatusChange}
              aria-label="Filter inquiries by status"
              className="h-10 w-full rounded-lg border border-[#E4DCCE] bg-white px-3 text-sm text-[#514940] outline-none transition focus:border-[#B3261E] focus:ring-2 focus:ring-[#B3261E]/10"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>

            <select
              value={inquiryType}
              onChange={handleInquiryTypeChange}
              aria-label="Filter inquiries by type"
              className="h-10 w-full rounded-lg border border-[#E4DCCE] bg-white px-3 text-sm text-[#514940] outline-none transition focus:border-[#B3261E] focus:ring-2 focus:ring-[#B3261E]/10"
            >
              <option value="all">All Inquiry Types</option>
              <option value="Product Inquiry">Product Inquiry</option>
              <option value="Order Support">Order Support</option>
              <option value="General Inquiry">General Inquiry</option>
            </select>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden overflow-x-auto md:block">
          {isLoading && inquiries.length === 0 ? (
            renderLoadingState()
          ) : error ? (
            renderErrorState()
          ) : inquiries.length === 0 ? (
            renderEmptyState()
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F8F6F1] text-xs font-semibold uppercase tracking-wide text-[#8A8176]">
                <tr>
                  <th className="px-5 py-4">Customer</th>
                  <th className="px-5 py-4">Inquiry</th>
                  <th className="px-5 py-4">Submitted</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#F0ECE5]">
                {inquiries.map((inquiry) => (
                  <tr
                    key={inquiry.id}
                    className="transition-colors hover:bg-[#FCFAF6]"
                  >
                    <td className="px-5 py-4">
                      <p className="font-medium text-[#1C1C1C]">
                        {inquiry.full_name}
                      </p>

                      <p className="mt-1 text-sm text-[#8A8176]">
                        {inquiry.email}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-medium text-[#1C1C1C]">
                        {inquiry.subject}
                      </p>

                      <p className="mt-1 text-sm text-[#8A8176]">
                        {inquiry.inquiry_type}
                      </p>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-[#6B6258]">
                      {new Date(inquiry.created_at).toLocaleDateString(
                        "en-PH",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        },
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-full bg-[#F2EEE7] px-2.5 py-1 text-xs font-medium text-[#514940]">
                        {inquiry.status.replace("_", " ")}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedInquiry(inquiry)}
                        title="View inquiry details"
                        aria-label={`View inquiry from ${inquiry.full_name}`}
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

        {/* Mobile Inquiry Cards */}
        <div className="divide-y divide-[#F0ECE5] md:hidden">
          {isLoading && inquiries.length === 0
            ? renderLoadingState()
            : error
              ? renderErrorState()
              : inquiries.length === 0
                ? renderEmptyState()
                : inquiries.map((inquiry) => (
                    <div key={inquiry.id} className="space-y-4 p-4">
                      {/* Customer Identity */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="break-words font-semibold text-[#1C1C1C]">
                            {inquiry.full_name}
                          </p>

                          <p className="mt-1 break-all text-sm text-[#8A8176]">
                            {inquiry.email}
                          </p>
                        </div>

                        <span className="shrink-0 rounded-full bg-[#F2EEE7] px-2.5 py-1 text-xs font-medium capitalize text-[#514940]">
                          {inquiry.status.replace("_", " ")}
                        </span>
                      </div>

                      {/* Inquiry Information */}
                      <div>
                        <p className="font-medium text-[#1C1C1C]">
                          {inquiry.subject}
                        </p>

                        <p className="mt-1 text-sm text-[#8A8176]">
                          {inquiry.inquiry_type}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-[#A1988D]">Submitted</p>

                        <p className="mt-1 text-sm text-[#514940]">
                          {new Date(inquiry.created_at).toLocaleDateString(
                            "en-PH",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            },
                          )}
                        </p>
                      </div>

                      {/* View Details */}
                      <div className="flex justify-end border-t border-[#F0ECE5] pt-3">
                        <button
                          type="button"
                          onClick={() => setSelectedInquiry(inquiry)}
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
            totalItems={pagination.total}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      <InquiryDetailsModal
        inquiryId={selectedInquiry?.id}
        open={Boolean(selectedInquiry)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedInquiry(null);
          }
        }}
        onStatusUpdated={() => {
          setRefreshKey((key) => key + 1);
        }}
      />
    </main>
  );
};

export default ContactInquiriesPage;
