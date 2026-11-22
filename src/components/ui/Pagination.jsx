import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "./Button";

const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  itemLabel = "records",
}) => {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  if (totalPages <= 1) return null;

  return (
    <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
      <p className="text-sm text-[#8A8176]">
        Showing {startItem} to {endItem} of {totalItems} {itemLabel}
      </p>

      <div className="flex items-center gap-3">
        <Button
          variant="secondary"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          tooltip="Previous page"
          aria-label="Previous page"
          className="p-2!"
        >
          <ChevronLeft size={18} />
        </Button>

        <span className="text-sm text-[#6B6258]" aria-live="polite">
          Page {currentPage} of {totalPages}
        </span>

        <Button
          variant="secondary"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          tooltip="Next page"
          aria-label="Next page"
          className="p-2!"
        >
          <ChevronRight size={18} />
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
