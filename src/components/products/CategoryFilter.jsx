const CategoryFilter = ({ categories, selectedCategory, onSelectCategory }) => {
  return (
    <div
      role="group"
      aria-label="Filter products by category"
      className="flex flex-wrap gap-2"
    >
      {categories.map((category) => {
        const isSelected = category === selectedCategory;

        return (
          <button
            key={category}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onSelectCategory(category)}
            className={`rounded-sm border px-4 py-2.5 text-sm font-medium transition-colors ${
              isSelected
                ? "border-[#1C1C1C] bg-[#1C1C1C] text-white"
                : "border-[#E4DCCE] bg-white text-[#6B6258] hover:border-[#B3261E] hover:text-[#B3261E]"
            }`}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
};

export default CategoryFilter;
