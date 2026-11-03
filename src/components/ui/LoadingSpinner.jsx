
const LoadingSpinner = ({ label = 'Loading...' }) => {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center justify-center gap-3 py-12 text-slate-600"
    >
      <span
        aria-hidden="true"
        className="size-5 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600"
      />

      <span className="text-sm font-medium">{label}</span>
    </div>
  )
}

export default LoadingSpinner
