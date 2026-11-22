const OrderStatusBadge = ({ status }) => {
  const statusStyles = {
    pending: "bg-[#F5EBD8] text-[#946B2D]",
    processing: "bg-[#EDE6D8] text-[#6B6258]",
    shipped: "bg-[#E9E5DF] text-[#62594F]",
    delivered: "bg-[#E5EDE5] text-[#496B50]",
    cancelled: "bg-[#F5E5E2] text-[#A33B32]",
    paid: "bg-[#E5EDE5] text-[#496B50]",
    unpaid: "bg-[#F5EBD8] text-[#946B2D]",
    failed: "bg-[#F5E5E2] text-[#A33B32]",
    refunded: "bg-[#EEE8F2] text-[#71577D]",
  };

  const normalizedStatus = status?.trim().toLowerCase();

  const styles =
    statusStyles[normalizedStatus] || "bg-[#F0EDE8] text-[#6B6258]";

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold capitalize ${styles}`}
    >
      {normalizedStatus || "Unknown"}
    </span>
  );
};

export default OrderStatusBadge;
