import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Pencil, Power, RefreshCw } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  getAdminProducts,
  uploadProductImage,
  createProduct,
  updateProduct,
  updateProductStatus,
} from "../../services/productService";
import Button from "../../components/ui/Button";
import { getCategories } from "../../services/categoryService";
import Pagination from "../../components/ui/Pagination";
import SearchInput from "../../components/ui/SearchInput";

const initialFormData = {
  name: "",
  description: "",
  price: "",
  stock_quantity: "",
  category_id: "",
  image_url: "",
  is_active: true,
};

const inputClassName =
  "w-full rounded-lg border border-[#E4DCCE] bg-white px-3 py-2.5 text-sm text-[#1C1C1C] outline-none transition placeholder:text-[#A49A8D] focus:border-[#B3261E] focus:ring-2 focus:ring-[#B3261E]/10";

const labelClassName = "mb-1.5 block text-sm font-medium text-[#514940]";

const ProductsPage = () => {
  const [products, setProducts] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [pagination, setPagination] = useState({
    totalProducts: 0,
    totalPages: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [categories, setCategories] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState("");

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [refreshKey, setRefreshKey] = useState(0);

  const [formData, setFormData] = useState(initialFormData);

  const [productToToggle, setProductToToggle] = useState(null);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        toast.error(error.message || "Failed to load categories.");
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true);

        const data = await getAdminProducts(
          currentPage,
          pageSize,
          debouncedSearch,
          statusFilter,
        );

        setProducts(data.products);
        setPagination({
          totalProducts: data.pagination.totalProducts,
          totalPages: data.pagination.totalPages,
        });
      } catch (error) {
        setProducts([]);
        setPagination({
          totalProducts: 0,
          totalPages: 0,
        });
        toast.error(error.message || "Failed to load products.");
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, [currentPage, pageSize, debouncedSearch, statusFilter, refreshKey]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxFileSize = 5 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, PNG, and WebP images are allowed.");
      e.target.value = "";
      return;
    }

    if (file.size > maxFileSize) {
      toast.error("Image size must not exceed 5 MB.");
      e.target.value = "";
      return;
    }

    setIsUploading(true);

    try {
      const uploadedImage = await uploadProductImage(file);

      setFormData((prev) => ({
        ...prev,
        image_url: uploadedImage.url,
      }));

      setImagePreview(uploadedImage.url);
      toast.success("Image uploaded successfully.");
    } catch (error) {
      toast.error(error.message || "Image upload failed.");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();

    if (isUploading) {
      toast.error("Please wait for the image upload to finish.");
      return;
    }

    try {
      const newProduct = await createProduct(formData);

      setProducts((prev) => [newProduct, ...prev]);

      setFormData(initialFormData);

      toast.success("Product created successfully.");

      setImagePreview("");
      setIsCreateModalOpen(false);
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      toast.error(error.message || "Failed to create product.");
    }
  };

  const handleCloseCreateModal = () => {
    setFormData(initialFormData);
    setImagePreview("");
    setIsCreateModalOpen(false);
  };

  const handleOpenEditProduct = (product) => {
    setSelectedProduct(product);

    setFormData({
      name: product.name || "",
      description: product.description || "",
      price: product.price ?? "",
      stock_quantity: product.stock_quantity ?? "",
      category_id: product.category_id || "",
      image_url: product.image_url || "",
      is_active: product.is_active,
    });

    setImagePreview(product.image_url || "");
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedProduct(null);
    setFormData(initialFormData);
    setImagePreview("");
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();

    if (!selectedProduct) return;

    if (isUploading) {
      toast.error("Please wait for the image upload to finish.");
      return;
    }

    try {
      const updatedProduct = await updateProduct(selectedProduct.id, formData);

      setProducts((prev) =>
        prev.map((product) =>
          product.id === updatedProduct.id ? updatedProduct : product,
        ),
      );

      toast.success("Product updated successfully.");

      handleCloseEditModal();
    } catch (error) {
      toast.error(error.message || "Failed to update product.");
    }
  };

  const handleToggleProductStatus = (product) => {
    setProductToToggle(product);
    setIsStatusDialogOpen(true);
  };

  const handleStatusDialogOpenChange = (open) => {
    if (isStatusUpdating) return;

    setIsStatusDialogOpen(open);

    if (!open) {
      setProductToToggle(null);
    }
  };

  const handleConfirmProductStatusChange = async () => {
    if (!productToToggle || isStatusUpdating) return;

    const nextStatus = !productToToggle.is_active;

    try {
      setIsStatusUpdating(true);

      await updateProductStatus(productToToggle.id, nextStatus);

      toast.success(
        `Product ${nextStatus ? "activated" : "deactivated"} successfully.`,
      );

      setIsStatusDialogOpen(false);
      setProductToToggle(null);
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      toast.error(error.message || "Failed to update product status.");
    } finally {
      setIsStatusUpdating(false);
    }
  };

  const formatPrice = (price) =>
    Number(price).toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const renderProductActions = (product) => (
    <div className="flex items-center gap-1">
      <Button
        variant="secondary"
        onClick={() => handleOpenEditProduct(product)}
        tooltip="Edit product"
        aria-label={`Edit ${product.name}`}
        className="cursor-pointer rounded-lg border-0 bg-transparent px-2 py-2 text-[#6B6258] shadow-none transition hover:bg-[#EDE6D8] hover:text-[#1C1C1C]"
      >
        <Pencil size={16} />
      </Button>

      <Button
        variant="secondary"
        onClick={() => handleToggleProductStatus(product)}
        tooltip={
          product.is_active ? "Deactivate product" : "Reactivate product"
        }
        aria-label={
          product.is_active
            ? `Deactivate ${product.name}`
            : `Reactivate ${product.name}`
        }
        className={`cursor-pointer rounded-lg border-0 bg-transparent px-2 py-2 shadow-none transition ${
          product.is_active
            ? "text-[#B3261E] hover:bg-[#B3261E]/10 hover:text-[#8F1E19]"
            : "text-[#55745B] hover:bg-[#55745B]/10 hover:text-[#3E6045]"
        }`}
      >
        <Power size={16} />
      </Button>
    </div>
  );

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-[#1C1C1C]">
          Product Management
        </h1>

        <p className="mt-2 text-sm text-[#6B6258] sm:text-base">
          Manage your marketplace products, pricing, and availability.
        </p>
      </div>

      {/* Products Container */}
      <div className="mt-8 overflow-hidden rounded-xl border border-[#E4DCCE] bg-white shadow-sm">
        {/* Table Header */}
        <div className="flex flex-col gap-4 border-b border-[#E4DCCE] bg-[#FAF8F4] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <h2 className="text-lg font-semibold text-[#1C1C1C]">
              Marketplace Products
            </h2>

            <p className="mt-1 text-sm text-[#8A8176]">
              {pagination.totalProducts}{" "}
              {pagination.totalProducts === 1 ? "product" : "products"} found.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search products by name..."
            />

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full cursor-pointer rounded-lg border border-[#E4DCCE] bg-white px-4 py-2.5 text-sm text-[#514940] outline-none transition focus:border-[#B3261E] focus:ring-2 focus:ring-[#B3261E]/10 sm:w-auto"
            >
              <option value="all">All Products</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="shrink-0 whitespace-nowrap rounded-md bg-[#B3261E] px-4 py-2.5 font-medium text-white shadow-none transition hover:bg-[#941F19] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B3261E]"
            >
              Add Product
            </Button>
          </div>
        </div>

        {/* Desktop Product Table */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F5F1E9] text-[#6B6258]">
              <tr>
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Price</th>
                <th className="px-6 py-4 font-medium">Stock</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#EEE8DD]">
              {isLoading && products.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-16 text-center text-[#8A8176]"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <RefreshCw
                        className="animate-spin text-[#B3261E]"
                        size={28}
                      />
                      <p>Loading products...</p>
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-[#8A8176]"
                  >
                    {debouncedSearch
                      ? "No products match your search."
                      : "No products found."}
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr
                    key={product.id}
                    className="transition-colors hover:bg-[#FAF8F4]"
                  >
                    <td className="px-6 py-4 font-medium text-[#1C1C1C]">
                      {product.name}
                    </td>

                    <td className="px-6 py-4 text-[#6B6258]">
                      {product.category_name ||
                        product.category ||
                        "Uncategorized"}
                    </td>

                    <td className="px-6 py-4 text-[#514940]">
                      PHP {formatPrice(product.price)}
                    </td>

                    <td className="px-6 py-4 text-[#514940]">
                      {product.stock_quantity}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                          product.is_active
                            ? "bg-[#E8EFE7] text-[#45634A]"
                            : "bg-[#F0EDE8] text-[#756D63]"
                        }`}
                      >
                        {product.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      {renderProductActions(product)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Product Cards */}
        <div className="divide-y divide-[#EEE8DD] md:hidden">
          {isLoading && products.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-6 py-16 text-center text-[#8A8176]">
              <RefreshCw className="animate-spin text-[#B3261E]" size={28} />
              <p>Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="px-6 py-12 text-center text-[#8A8176]">
              {debouncedSearch
                ? "No products match your search."
                : "No products found."}
            </div>
          ) : (
            products.map((product) => (
              <div key={product.id} className="space-y-4 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="break-words font-semibold text-[#1C1C1C]">
                      {product.name}
                    </h3>

                    <p className="mt-1 text-sm text-[#8A8176]">
                      {product.category_name ||
                        product.category ||
                        "Uncategorized"}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                      product.is_active
                        ? "bg-[#E8EFE7] text-[#45634A]"
                        : "bg-[#F0EDE8] text-[#756D63]"
                    }`}
                  >
                    {product.is_active ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 rounded-lg border border-[#EEE8DD] bg-[#FAF8F4] p-3">
                  <div>
                    <p className="text-xs text-[#8A8176]">Price</p>
                    <p className="mt-1 text-sm font-semibold text-[#1C1C1C]">
                      PHP {formatPrice(product.price)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-[#8A8176]">Stock</p>
                    <p className="mt-1 text-sm font-semibold text-[#1C1C1C]">
                      {product.stock_quantity}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end border-t border-[#EEE8DD] pt-2">
                  {renderProductActions(product)}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        <div className="border-t border-[#E4DCCE] bg-[#FAF8F4] px-5 py-4 sm:px-6">
          <Pagination
            currentPage={currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalProducts}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* Create Product Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#1C1C1C]/55 p-3 backdrop-blur-[2px] sm:p-4">
          <div className="flex max-h-[90dvh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-[#E4DCCE] bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex shrink-0 items-center justify-between gap-4 border-b border-[#E4DCCE] bg-[#FAF8F4] px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-lg font-semibold text-[#1C1C1C] sm:text-xl">
                  Add New Product
                </h2>

                <p className="mt-1 text-xs text-[#8A8176] sm:text-sm">
                  Create a new product for your marketplace.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseCreateModal}
                aria-label="Close create product modal"
                className="shrink-0 rounded-lg px-3 py-2 text-[#8A8176] transition hover:bg-[#EDE6D8] hover:text-[#1C1C1C] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B3261E]"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form
              onSubmit={handleCreateProduct}
              className="flex min-h-0 flex-1 flex-col overflow-hidden"
            >
              {/* Scrollable Form Body */}
              <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5 sm:p-6">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label htmlFor="name" className={labelClassName}>
                      Product Name
                    </label>

                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Enter product name"
                      className={inputClassName}
                    />
                  </div>

                  <div>
                    <label htmlFor="price" className={labelClassName}>
                      Price (PHP)
                    </label>

                    <input
                      type="number"
                      id="price"
                      name="price"
                      min="0.01"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      placeholder="0.00"
                      className={inputClassName}
                    />
                  </div>

                  <div>
                    <label htmlFor="stock_quantity" className={labelClassName}>
                      Stock Quantity
                    </label>

                    <input
                      type="number"
                      id="stock_quantity"
                      name="stock_quantity"
                      min="0"
                      step="1"
                      value={formData.stock_quantity}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          stock_quantity: e.target.value,
                        })
                      }
                      placeholder="Enter available stock"
                      className={inputClassName}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="description" className={labelClassName}>
                      Description
                    </label>

                    <textarea
                      id="description"
                      name="description"
                      rows="3"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Describe your product"
                      className={`${inputClassName} resize-y`}
                    />
                  </div>

                  <div>
                    <label htmlFor="product_image" className={labelClassName}>
                      Product Image
                    </label>

                    <input
                      id="product_image"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                      className="block w-full text-xs text-[#6B6258] file:mr-2 file:rounded-md file:border-0 file:bg-[#EDE6D8] file:px-3 file:py-2 file:font-medium file:text-[#514940] transition hover:file:bg-[#E4DCCE] disabled:opacity-50"
                    />

                    <p className="mt-1 text-xs text-[#8A8176]">
                      JPG, PNG, or WebP. Maximum 5 MB.
                    </p>

                    {isUploading && (
                      <p className="mt-2 text-xs font-medium text-[#B3261E]">
                        Uploading image...
                      </p>
                    )}

                    {imagePreview && (
                      <img
                        src={imagePreview}
                        alt="Product preview"
                        className="mt-3 h-20 w-20 rounded-lg border border-[#E4DCCE] object-cover"
                      />
                    )}
                  </div>

                  <div>
                    <label htmlFor="category_id" className={labelClassName}>
                      Category
                    </label>

                    <select
                      id="category_id"
                      name="category_id"
                      value={formData.category_id}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          category_id: e.target.value,
                        })
                      }
                      className={`${inputClassName} cursor-pointer`}
                    >
                      <option value="" disabled>
                        Select a category
                      </option>

                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Fixed Modal Footer */}
              <div className="flex shrink-0 justify-end gap-3 border-t border-[#E4DCCE] bg-[#FAF8F4] px-5 py-4 sm:px-6">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCloseCreateModal}
                  className="rounded-md border border-[#E4DCCE] bg-white px-4 text-[#514940] shadow-none hover:bg-[#F5F1E9]"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={isUploading}
                  className="rounded-md bg-[#B3261E] px-4 text-white shadow-none hover:bg-[#941F19] disabled:opacity-50"
                >
                  {isUploading ? "Uploading Image..." : "Save Product"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {isEditModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#1C1C1C]/55 p-3 backdrop-blur-[2px] sm:p-4">
          <div className="flex max-h-[90dvh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-[#E4DCCE] bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex shrink-0 items-center justify-between gap-4 border-b border-[#E4DCCE] bg-[#FAF8F4] px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-lg font-semibold text-[#1C1C1C] sm:text-xl">
                  Edit Product
                </h2>

                <p className="mt-1 text-xs text-[#8A8176] sm:text-sm">
                  Update product details.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseEditModal}
                aria-label="Close edit product modal"
                className="shrink-0 rounded-lg px-3 py-2 text-[#8A8176] transition hover:bg-[#EDE6D8] hover:text-[#1C1C1C] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B3261E]"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form
              onSubmit={handleUpdateProduct}
              className="flex min-h-0 flex-1 flex-col overflow-hidden"
            >
              {/* Scrollable Form Body */}
              <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5 sm:p-6">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label htmlFor="edit_name" className={labelClassName}>
                      Product Name
                    </label>

                    <input
                      type="text"
                      id="edit_name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className={inputClassName}
                    />
                  </div>

                  <div>
                    <label htmlFor="edit_price" className={labelClassName}>
                      Price (PHP)
                    </label>

                    <input
                      type="number"
                      id="edit_price"
                      min="0.01"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      className={inputClassName}
                    />
                  </div>

                  <div>
                    <label htmlFor="edit_stock" className={labelClassName}>
                      Stock Quantity
                    </label>

                    <input
                      type="number"
                      id="edit_stock"
                      min="0"
                      step="1"
                      value={formData.stock_quantity}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          stock_quantity: e.target.value,
                        })
                      }
                      className={inputClassName}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="edit_description"
                      className={labelClassName}
                    >
                      Description
                    </label>

                    <textarea
                      id="edit_description"
                      rows="3"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      className={`${inputClassName} resize-y`}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="edit_product_image"
                      className={labelClassName}
                    >
                      Product Image
                    </label>

                    <input
                      id="edit_product_image"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                      className="block w-full text-xs text-[#6B6258] file:mr-2 file:rounded-md file:border-0 file:bg-[#EDE6D8] file:px-3 file:py-2 file:font-medium file:text-[#514940] transition hover:file:bg-[#E4DCCE] disabled:opacity-50"
                    />

                    <p className="mt-1 text-xs text-[#8A8176]">
                      JPG, PNG, or WebP. Maximum 5 MB.
                    </p>

                    {isUploading && (
                      <p className="mt-2 text-xs font-medium text-[#B3261E]">
                        Uploading image...
                      </p>
                    )}

                    {imagePreview && (
                      <img
                        src={imagePreview}
                        alt="Product preview"
                        className="mt-3 h-20 w-20 rounded-lg border border-[#E4DCCE] object-cover"
                      />
                    )}
                  </div>

                  <div>
                    <label htmlFor="edit_category" className={labelClassName}>
                      Category
                    </label>

                    <select
                      id="edit_category"
                      value={formData.category_id}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          category_id: e.target.value,
                        })
                      }
                      className={`${inputClassName} cursor-pointer`}
                    >
                      <option value="" disabled>
                        Select a category
                      </option>

                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="border-t border-[#EEE8DD] pt-4">
                  <label className="flex items-center gap-3 text-sm font-medium text-[#514940]">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          is_active: e.target.checked,
                        })
                      }
                      className="h-4 w-4 rounded border-[#CFC5B7] accent-[#B3261E] focus:ring-[#B3261E]"
                    />
                    Active Product
                  </label>
                </div>
              </div>

              {/* Fixed Modal Footer */}
              <div className="flex shrink-0 justify-end gap-3 border-t border-[#E4DCCE] bg-[#FAF8F4] px-5 py-4 sm:px-6">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCloseEditModal}
                  className="rounded-md border border-[#E4DCCE] bg-white px-4 text-[#514940] shadow-none hover:bg-[#F5F1E9]"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={isUploading}
                  className="rounded-md bg-[#B3261E] px-4 text-white shadow-none hover:bg-[#941F19] disabled:opacity-50"
                >
                  {isUploading ? "Uploading Image..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Status Confirmation */}
      <AlertDialog
        open={isStatusDialogOpen}
        onOpenChange={handleStatusDialogOpenChange}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#1C1C1C]">
              {productToToggle?.is_active
                ? "Deactivate Product?"
                : "Reactivate Product?"}
            </AlertDialogTitle>

            <AlertDialogDescription className="text-[#6B6258]">
              Are you sure you want to{" "}
              {productToToggle?.is_active ? "deactivate" : "reactivate"}{" "}
              <span className="font-semibold text-[#1C1C1C]">
                {productToToggle?.name}
              </span>
              ?
              {productToToggle?.is_active
                ? " This product will no longer be available in your storefront."
                : " This product will become available in your storefront again."}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isStatusUpdating}
              className="border-[#E4DCCE] text-[#514940] hover:bg-[#F5F1E9]"
            >
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              type="button"
              onClick={handleConfirmProductStatusChange}
              disabled={isStatusUpdating}
              className={
                productToToggle?.is_active
                  ? "bg-[#B3261E] text-white hover:bg-[#941F19]"
                  : "bg-[#55745B] text-white hover:bg-[#3E6045]"
              }
            >
              {isStatusUpdating && (
                <RefreshCw size={16} className="mr-2 animate-spin" />
              )}

              {isStatusUpdating
                ? "Processing..."
                : productToToggle?.is_active
                  ? "Deactivate Product"
                  : "Reactivate Product"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
};

export default ProductsPage;
