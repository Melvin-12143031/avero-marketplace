import { useState } from "react";

import ProductList from "../components/products/ProductList";
import SearchInput from "../components/ui/SearchInput";
import CategoryFilter from "../components/products/CategoryFilter";
import ProductSort from "../components/products/ProductSort";
import useProductCatalog from "../features/catalog/useProductCatalog";
import ProductDetails from "../components/products/ProductDetails";

const HomePage = ({ onAddToCart }) => {
  const {
    products,
    categories,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy,
  } = useProductCatalog();

  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleViewDetails = (product) => {
    setSelectedProduct(product);
  };

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <section>
        <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
          Welcome to MarketPlace
        </p>

        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900">
          Find your next favorite thing.
        </h1>

        <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
          Discover products you'll love, all in one place.
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

      <ProductList
        products={products}
        onViewDetails={handleViewDetails}
        onAddToCart={onAddToCart}
      />

      <ProductDetails
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </main>
  );
};

export default HomePage;
