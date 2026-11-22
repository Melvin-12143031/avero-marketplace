import { CheckCircle, Package, Truck, Home } from "lucide-react";

const OrderProgress = ({ status }) => {
  const steps = [
    { label: "Order Placed", icon: CheckCircle },
    { label: "Processing", icon: Package },
    { label: "Shipped", icon: Truck },
    { label: "Delivered", icon: Home },
  ];

  const normalizedStatus = status?.toLowerCase();

  const statusOrder = {
    pending: 0,
    processing: 1,
    shipped: 2,
    delivered: 3,
  };

  const currentStep = statusOrder[normalizedStatus] ?? -1;
  const isCancelled = normalizedStatus === "cancelled";

  return (
    <div className="mt-8 rounded-2xl border border-[#E4DCCE] bg-white p-5 text-left sm:p-6">
      <h2 className="font-serif text-lg font-semibold text-[#1C1C1C]">
        Order Progress
      </h2>

      {isCancelled && (
        <p className="mt-4 rounded-lg bg-[#F5E5E2] p-3 text-sm font-medium text-[#A33B32]">
          This order has been cancelled.
        </p>
      )}

      {!isCancelled && currentStep === -1 && (
        <p className="mt-4 rounded-lg bg-[#F5EBD8] p-3 text-sm text-[#946B2D]">
          Order progress is currently unavailable.
        </p>
      )}

      <div className="mt-6 space-y-6">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = !isCancelled && index <= currentStep;
          const isCurrent = !isCancelled && index === currentStep;

          return (
            <div key={step.label} className="flex items-center gap-4">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors ${
                  isCurrent
                    ? "bg-[#B3261E] text-white"
                    : isCompleted
                      ? "bg-[#EDE6D8] text-[#6B6258]"
                      : "bg-[#F5F2ED] text-[#A69D92]"
                }`}
              >
                <Icon size={20} />
              </div>

              <div>
                <p
                  className={`font-medium ${
                    isCompleted ? "text-[#1C1C1C]" : "text-[#A69D92]"
                  }`}
                >
                  {step.label}
                </p>

                {isCurrent && !isCancelled && (
                  <p className="mt-1 text-xs font-semibold text-[#B3261E]">
                    Current Status
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderProgress;
