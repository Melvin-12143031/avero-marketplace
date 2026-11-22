import { useEffect, useState } from "react";
import { getProducts, getCategories } from "../../services/api";

const useProductCatalog = (initialCategory = "All") => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(["All"]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState("featured");

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 9;

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleSortChange = (value) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      setError("");

      try {
        const data = await getProducts();
        setProducts(data);
      } catch (error) {
        console.error("Error loading products:", error.message);
        setError("Unable to load products. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(["All", ...data.map((category) => category.name)]);
      } catch (error) {
        console.error("Error loading categories:", error.message);
      }
    };

    loadCategories();
  }, []);

  const filteredProducts = products.filter((product) => {
    const searchValue = searchTerm.trim().toLowerCase();

    const matchesSearch =
      product.name?.toLowerCase().includes(searchValue) ||
      product.description?.toLowerCase().includes(searchValue) ||
      product.category?.toLowerCase().includes(searchValue);

    const matchesCategory =
      selectedCategory === "All" || product.category === selectedCategory;

    const isInStock = Number(product.stock_quantity) > 0;

    return matchesSearch && matchesCategory && isInStock;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "name-asc":
        return a.name.localeCompare(b.name);

      case "price-asc":
        return a.price - b.price;

      case "price-desc":
        return b.price - a.price;

      case "featured":
      default:
        return 0;
    }
  });

  const totalItems = sortedProducts.length;
  const totalPages = Math.ceil(totalItems / pageSize);

  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  return {
    allProducts: products,
    setSearchTerm: handleSearchChange,
    setSelectedCategory: handleCategoryChange,
    setSortBy: handleSortChange,
    products: paginatedProducts,
    totalItems,
    totalPages,
    currentPage,
    pageSize,
    setCurrentPage,
    categories,
    searchTerm,
    selectedCategory,
    sortBy,
    isLoading,
    error,
  };
};
export default useProductCatalog;
