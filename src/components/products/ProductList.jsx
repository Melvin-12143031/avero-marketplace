import { AlertCircle, RefreshCw, SearchX, ShoppingBag } from "lucide-react";

import ProductCard from "./ProductCard";

const ProductList = ({
  products,
  onAddToCart,
  isLoading,
  error,
  hasActiveFilters,
  onClearFilters,
}) => {
  return (
    <section className="mt-14">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[#E4DCCE] pb-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B3261E]">
            The Collection
          </p>

          <h2 className="mt-2 font-serif text-3xl font-medium text-[#1C1C1C]">
            Explore Our Products
          </h2>
        </div>

        {!isLoading && !error && (
          <p
            className="text-sm text-[#8A8176]"
            aria-live="polite"
            aria-atomic="true"
          >
            {products.length} {products.length === 1 ? "product" : "products"}{" "}
            found
          </p>
        )}
      </div>

      {isLoading ? (
        <div
          className="mt-8 flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-[#E4DCCE] bg-white px-6 text-center"
          role="status"
          aria-live="polite"
        >
          <div className="flex size-14 items-center justify-center rounded-full bg-[#EDE6D8]">
            <RefreshCw size={24} className="animate-spin text-[#B3261E]" />
          </div>

          <h3 className="mt-5 font-serif text-xl font-medium text-[#1C1C1C]">
            Gathering the collection
          </h3>

          <p className="mt-2 text-sm text-[#8A8176]">
            Please wait while we prepare our products for you.
          </p>
        </div>
      ) : error ? (
        <div
          className="mt-8 flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-[#E4DCCE] bg-white px-6 text-center"
          role="alert"
        >
          <div className="flex size-14 items-center justify-center rounded-full bg-[#F8E9E6]">
            <AlertCircle size={25} className="text-[#B3261E]" />
          </div>

          <h3 className="mt-5 font-serif text-xl font-medium text-[#1C1C1C]">
            Something went wrong
          </h3>

          <p className="mt-2 max-w-md text-sm leading-7 text-[#6B6258]">
            {error}
          </p>
        </div>
      ) : products.length === 0 ? (
        <div className="mt-8 flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-dashed border-[#D8CABB] bg-[#FAF8F4] px-6 py-12 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-[#EDE6D8]">
            {hasActiveFilters ? (
              <SearchX size={28} className="text-[#B3261E]" />
            ) : (
              <ShoppingBag size={28} className="text-[#B3261E]" />
            )}
          </div>

          <h3 className="mt-5 font-serif text-2xl font-medium text-[#1C1C1C]">
            {hasActiveFilters
              ? "Nothing here just yet"
              : "Our collection is taking shape"}
          </h3>

          <p className="mt-3 max-w-md text-sm leading-7 text-[#6B6258]">
            {hasActiveFilters
              ? "We couldn't find products matching your selection. Try adjusting your search or exploring another category."
              : "There are no products available at the moment. Please check back soon for something special."}
          </p>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              className="mt-6 rounded-md bg-[#1C1C1C] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#38332E] focus:outline-none focus:ring-2 focus:ring-[#B3261E] focus:ring-offset-2"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              description={product.description}
              price={product.price}
              image={product.image_url}
              category={product.category}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default ProductList;
