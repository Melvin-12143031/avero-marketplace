const ProductSort = ({ sortBy, onSortChange }) => {
  return (
    <div className="flex items-center gap-3">
      <label
        htmlFor="product-sort"
        className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6B6258]"
      >
        Sort by
      </label>

      <select
        id="product-sort"
        value={sortBy}
        onChange={(event) => onSortChange(event.target.value)}
        className="rounded-sm border border-[#E4DCCE] bg-white px-4 py-3 text-sm text-[#1C1C1C] outline-none transition focus:border-[#B3261E] focus:ring-2 focus:ring-[#B3261E]/10"
      >
        <option value="featured">Featured</option>
        <option value="price-asc">Price: Low to High</option>
        <option value="price-desc">Price: High to Low</option>
      </select>
    </div>
  );
};

export default ProductSort;
