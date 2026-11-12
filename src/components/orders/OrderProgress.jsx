import {
    CheckCircle,
    Package,
    Truck,
    Home,
} from 'lucide-react'

const OrderProgress = ({ status }) => {
    const steps = [
        { label: 'Order Placed', icon: CheckCircle },
        { label: 'Processing', icon: Package },
        { label: 'Shipped', icon: Truck },
        { label: 'Delivered', icon: Home },
    ]



    const normalizedStatus = status?.toLowerCase()

    const statusOrder = {
        pending: 0,
        processing: 1,
        shipped: 2,
        delivered: 3,
    }

    const currentStep = statusOrder[normalizedStatus] ?? -1
    const isCancelled = normalizedStatus === 'cancelled'

    return (
        <div className="mt-8 rounded-xl border border-slate-200 p-5 text-left">
            <h2 className="text-lg font-semibold text-slate-900">
                Order Progress
            </h2>

            {isCancelled && (
                <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700">
                    This order has been cancelled.
                </p>
            )}

            <div className="mt-6 space-y-6">
                {steps.map((step, index) => {
                    const Icon = step.icon
                    const isCompleted = !isCancelled && index <= currentStep
                    const isCurrent = !isCancelled && index === currentStep

                    return (
                        <div key={step.label} className="flex items-center gap-4">
                            <div
                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${isCompleted
                                    ? 'bg-indigo-100 text-indigo-600'
                                    : 'bg-slate-100 text-slate-400'
                                    }`}
                            >
                                <Icon size={20} />
                            </div>

                            <div>
                                <p
                                    className={`font-medium ${isCompleted
                                        ? 'text-slate-900'
                                        : 'text-slate-400'
                                        }`}
                                >
                                    {step.label}
                                </p>

                                {isCurrent && !isCancelled && (
                                    <p className="mt-1 text-xs text-indigo-600">
                                        Current Status
                                    </p>
                                )}

                                {!isCancelled && currentStep === -1 && (
                                    <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
                                        Order progress is currently unavailable.
                                    </p>
                                )}

                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default OrderProgress