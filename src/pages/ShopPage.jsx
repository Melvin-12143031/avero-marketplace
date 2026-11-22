import { useLocation } from "react-router-dom";
import { useRef } from "react";

import ProductList from "../components/products/ProductList";
import SearchInput from "../components/ui/SearchInput";
import CategoryFilter from "../components/products/CategoryFilter";
import ProductSort from "../components/products/ProductSort";
import Pagination from "@/components/ui/Pagination";

import useProductCatalog from "../features/catalog/useProductCatalog";

const ShopPage = ({ onAddToCart }) => {
  const location = useLocation();
  const initialCategory = location.state?.category || "All";

  return (
    <ShopContent
      key={initialCategory}
      initialCategory={initialCategory}
      onAddToCart={onAddToCart}
    />
  );
};

const ShopContent = ({ initialCategory, onAddToCart }) => {
  const productSectionRef = useRef(null);

  const {
    products,
    categories,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy,
    isLoading,
    error,
    totalItems,
    totalPages,
    currentPage,
    pageSize,
    setCurrentPage,
  } = useProductCatalog(initialCategory);

  const handlePageChange = (page) => {
    setCurrentPage(page);

    window.scrollTo({
      top: productSectionRef.current
        ? productSectionRef.current.getBoundingClientRect().top +
          window.scrollY -
          24
        : 0,
      behavior: "smooth",
    });
  };

  const hasActiveFilters =
    searchTerm.trim() !== "" || selectedCategory !== "All";

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All");
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <section>
        <p className="text-sm font-semibold uppercase tracking-wider text-[#B3261E]">
          The AVÉRO Collection
        </p>

        <h1 className="mt-3 text-4xl font-bold tracking-tight text-[#1C1C1C]">
          Discover something you'll love.
        </h1>

        <p className="mt-4 max-w-2xl text-lg leading-8 text-[#6B6258]">
          Explore thoughtfully selected products for everyday living.
        </p>
      </section>

      <section className="mt-10 space-y-5">
        <SearchInput value={searchTerm} onChange={setSearchTerm} />

        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        <ProductSort sortBy={sortBy} onSortChange={setSortBy} />
      </section>

      <div ref={productSectionRef} className="scroll-mt-6">
        <ProductList
          products={products}
          onAddToCart={onAddToCart}
          isLoading={isLoading}
          error={error}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={handleClearFilters}
        />
      </div>

      {!isLoading && !error && totalItems > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          itemLabel="products"
        />
      )}
    </div>
  );
};

export default ShopPage;
