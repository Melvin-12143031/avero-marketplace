
const ProductSort = ({ sortBy, onSortChange }) => {
  return (
    <div className="flex items-center gap-3">
      <label
        htmlFor="product-sort"
        className="text-sm font-medium text-slate-600"
      >
        Sort by
      </label>

      <select
        id="product-sort"
        value={sortBy}
        onChange={(event) => onSortChange(event.target.value)}
        className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
      >
        <option value="featured">Featured</option>
        <option value="name-asc">Name: A to Z</option>
        <option value="price-asc">Price: Low to High</option>
        <option value="price-desc">Price: High to Low</option>
      </select>
    </div>
  )
}

export default ProductSort
