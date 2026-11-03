const OrderStatusBadge = ({ status }) => {
    const statusStyles = {
        pending: 'bg-amber-100 text-amber-700',
        processing: 'bg-blue-100 text-blue-700',
        shipped: 'bg-indigo-100 text-indigo-700',
        delivered: 'bg-green-100 text-green-700',
        cancelled: 'bg-red-100 text-red-700',
        paid: 'bg-green-100 text-green-700',
        unpaid: 'bg-amber-100 text-amber-700',
        failed: 'bg-red-100 text-red-700',
    }

    const styles = statusStyles[status?.toLowerCase()] ||
        'bg-slate-100 text-slate-700'

    return (
        <span
            className={`rounded-full px-3 py-1 text-sm font-medium capitalize ${styles}`}
        >
            {status?.trim() || 'Unknown'}
        </span>
    )
}

export default OrderStatusBadge