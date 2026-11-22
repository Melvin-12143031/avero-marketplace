import { Search, X } from "lucide-react";

const SearchInput = ({
  value,
  onChange,
  placeholder = "Search products...",
  clearable = true,
}) => {
  return (
    <div className="relative w-full max-w-md">
      <Search
        size={18}
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8A8176]"
      />

      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className={`w-full rounded-sm border border-[#E4DCCE] bg-white py-3 pl-11 text-sm text-[#1C1C1C] outline-none transition placeholder:text-[#A49A8D] focus:border-[#B3261E] focus:ring-2 focus:ring-[#B3261E]/10 ${
          clearable ? "pr-11" : "pr-4"
        }`}
      />

      {clearable && value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8A8176] transition hover:text-[#B3261E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D78B7F] focus-visible:ring-offset-2 rounded-sm"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
};

export default SearchInput;
