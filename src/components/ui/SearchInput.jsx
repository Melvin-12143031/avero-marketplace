
import { Search, X } from 'lucide-react'

const SearchInput = ({
  value,
  onChange,
  placeholder = 'Search products...',
  clearable = true,
}) => {
  return (
    <div className="relative w-full max-w-md">
      <Search
        size={18}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
      />

      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className={`w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 ${clearable ? 'pr-10' : 'pr-4'
          }`}
      />

      {clearable && value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
        >
          <X size={18} />
        </button>
      )}

    </div>


  )
}

export default SearchInput
