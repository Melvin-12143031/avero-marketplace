
const CategoryFilter = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div
      className="flex flex-wrap gap-2"
      aria-label="Filter products by category"
    >
      {categories.map((category) => {
        const isSelected = category === selectedCategory

        return (
          <button
            key={category}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onSelectCategory(category)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              isSelected
                ? 'bg-indigo-600 text-white'
                : 'border border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:text-indigo-600'
            }`}
          >
            {category}
          </button>
        )
      })}
    </div>
  )
}

export default CategoryFilter
