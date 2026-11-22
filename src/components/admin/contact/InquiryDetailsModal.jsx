import { useEffect, useState } from "react";
import {
  RefreshCw,
  UserRound,
  MessageSquareText,
  CalendarDays,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { toast } from "sonner";
import {
  getAdminContactInquiryById,
  updateContactInquiryStatus,
} from "@/services/contactService";

const getStatusStyles = (status) => {
  const styles = {
    pending: "bg-[#F8EBD5] text-[#9A6427]",
    in_progress: "bg-[#E5EDF5] text-[#426584]",
    resolved: "bg-[#E5EFE7] text-[#477451]",
    closed: "bg-[#EAE7E2] text-[#716B63]",
  };

  return styles[status] || "bg-[#EAE7E2] text-[#716B63]";
};

const InquiryDetailsModal = ({
  inquiryId,
  open,
  onOpenChange,
  onStatusUpdated,
}) => {
  const [inquiry, setInquiry] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!open || !inquiryId) return;

    let isMounted = true;

    const loadInquiry = async () => {
      try {
        setIsLoading(true);
        setError("");
        setInquiry(null);

        const response = await getAdminContactInquiryById(inquiryId);

        if (isMounted) {
          setInquiry(response);
          setSelectedStatus(response.status);
        }
      } catch (error) {
        if (isMounted) {
          setError(error.message || "Failed to load inquiry details.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadInquiry();

    return () => {
      isMounted = false;
    };
  }, [open, inquiryId]);

  const handleUpdateStatus = async () => {
    if (!inquiry || selectedStatus === inquiry.status) {
      return;
    }

    try {
      setIsSaving(true);

      const updatedInquiry = await updateContactInquiryStatus(
        inquiry.id,
        selectedStatus,
      );

      setInquiry(updatedInquiry);
      setSelectedStatus(updatedInquiry.status);
      onStatusUpdated?.();

      toast.success("Inquiry status updated successfully.");
    } catch (error) {
      toast.error(error.message || "Failed to update inquiry status.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenChange = (nextOpen) => {
    if (!nextOpen) {
      setInquiry(null);
      setError("");
    }

    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex h-[600px] max-h-[90vh] w-[calc(100%-2rem)] max-w-2xl flex-col gap-5 overflow-hidden border-[#E4DCCE] bg-[#FAF8F4] p-6 text-[#1C1C1C]">
        <DialogHeader className="shrink-0 space-y-1 pr-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#A66B4F]">
            AVÉRO · Customer Care
          </p>

          <div className="flex items-center justify-between gap-3">
            <DialogTitle className="text-xl font-semibold tracking-tight text-[#1C1C1C]">
              Inquiry Details
            </DialogTitle>

            {inquiry && (
              <span
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium capitalize ${getStatusStyles(inquiry.status)}`}
              >
                {inquiry.status.replace("_", " ")}
              </span>
            )}
          </div>

          <DialogDescription className="text-sm text-[#8A8176]">
            Review and manage customer inquiries.
          </DialogDescription>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col">
          {isLoading && (
            <div className="flex flex-1 items-center justify-center gap-2 text-sm text-[#8A8176]">
              <RefreshCw className="size-4 animate-spin" />
              Loading inquiry details...
            </div>
          )}

          {!isLoading && error && (
            <div className="flex flex-1 items-center justify-center text-sm text-red-600">
              {error}
            </div>
          )}

          {!isLoading && !error && inquiry && (
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
              {/* Customer Information */}
              <section className="rounded-xl border border-[#E4DCCE] bg-white p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-[#292521]">
                    Customer Information
                  </h3>
                  <UserRound className="size-4 text-[#A66B4F]" />
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                  <div className="min-w-0 space-y-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#91877B]">
                      Full Name
                    </p>
                    <p className="break-words text-sm font-medium text-[#292521]">
                      {inquiry.full_name}
                    </p>
                  </div>

                  <div className="min-w-0 space-y-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#91877B]">
                      Email Address
                    </p>
                    <p className="break-all text-sm font-medium text-[#292521]">
                      {inquiry.email}
                    </p>
                  </div>

                  <div className="min-w-0 space-y-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#91877B]">
                      Phone
                    </p>
                    <p className="text-sm font-medium text-[#292521]">
                      {inquiry.phone || "Not provided"}
                    </p>
                  </div>

                  <div className="min-w-0 space-y-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#91877B]">
                      Inquiry Type
                    </p>
                    <p className="text-sm font-medium text-[#292521]">
                      {inquiry.inquiry_type}
                    </p>
                  </div>
                </div>
              </section>

              {/* Message Details */}
              <section className="rounded-xl border border-[#E4DCCE] bg-white p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-[#292521]">
                    Message Details
                  </h3>
                  <MessageSquareText className="size-4 text-[#A66B4F]" />
                </div>

                <div className="mb-3 space-y-1">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#91877B]">
                    Subject
                  </p>
                  <p className="text-sm font-semibold text-[#292521]">
                    {inquiry.subject}
                  </p>
                </div>

                <div className="space-y-2 border-t border-[#EAE4D9] pt-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#91877B]">
                    Message
                  </p>
                  <div className="rounded-lg bg-[#F7F4ED] p-3 text-sm leading-relaxed text-[#4D473F] whitespace-pre-wrap break-words">
                    {inquiry.message}
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <CalendarDays className="size-3.5 text-[#A66B4F]" />
                  <p className="text-xs text-[#91877B]">
                    Submitted:{" "}
                    {new Date(inquiry.created_at).toLocaleString("en-PH")}
                  </p>
                </div>
              </section>
              {/* Manage Inquiry */}
              <section className="rounded-xl border border-[#E4DCCE] bg-white p-4">
                <div className="mb-3">
                  <h3 className="text-sm font-semibold text-[#292521]">
                    Manage Inquiry
                  </h3>
                  <p className="mt-1 text-xs text-[#91877B]">
                    Update the current inquiry status.
                  </p>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="inquiry-status"
                    className="text-[10px] font-semibold uppercase tracking-wider text-[#91877B]"
                  >
                    Inquiry Status
                  </label>

                  <select
                    id="inquiry-status"
                    value={selectedStatus}
                    onChange={(event) => setSelectedStatus(event.target.value)}
                    className="h-10 w-full rounded-lg border border-[#DED5C7] bg-[#FAF8F4] px-3 text-sm text-[#292521] outline-none transition focus:border-[#A66B4F] focus:ring-2 focus:ring-[#A66B4F]/10"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <button
                  type="button"
                  onClick={handleUpdateStatus}
                  disabled={isSaving || selectedStatus === inquiry.status}
                  className="mt-3 w-full rounded-lg bg-[#1C1C1C] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#35302B] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isSaving ? "Saving Changes..." : "Save Changes"}
                </button>
              </section>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InquiryDetailsModal;
