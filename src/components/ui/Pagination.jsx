import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "./Button";

const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}) => {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
      <p className="text-sm text-gray-500">
        Showing {startItem} to {endItem} of {totalItems} records
      </p>

      <div className="flex items-center gap-3">
        <Button
          variant="secondary"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          tooltip="Previous page"
          className="p-2!"
        >
          <ChevronLeft size={18} />
        </Button>

        <span className="text-sm text-gray-600">
          Page {currentPage} of {totalPages}
        </span>

        <Button
          variant="secondary"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          tooltip="Next page"
          className="p-2!"
        >
          <ChevronRight size={18} />
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
