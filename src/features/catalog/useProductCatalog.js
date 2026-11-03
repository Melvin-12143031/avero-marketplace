import { useEffect, useState } from "react";
import { getProducts, getCategories } from "../../services/api";

const useProductCatalog = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(["All"]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("featured");

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (error) {
        console.error("Error loading products:", error.message);
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

    return matchesSearch && matchesCategory;
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

  return {
    products: sortedProducts,
    categories,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy,
  };
};

export default useProductCatalog;
