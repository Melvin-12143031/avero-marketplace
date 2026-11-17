import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Pencil, Power, RefreshCw } from "lucide-react";

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

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock_quantity: "",
    category_id: "",
    image_url: "",
    is_active: true,
  });

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
    const maxFileSize = 5 * 1024 * 1024; // 5 MB

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

      setFormData({
        name: "",
        description: "",
        price: "",
        stock_quantity: "",
        category_id: "",
        image_url: "",
        is_active: true,
      });

      toast.success("Product created successfully.");

      setImagePreview("");
      setIsCreateModalOpen(false);
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      toast.error(error.message || "Failed to create product.");
    }
  };

  const handleCloseCreateModal = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      stock_quantity: "",
      category_id: "",
      image_url: "",
      is_active: true,
    });

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

      setFormData({
        name: "",
        description: "",
        price: "",
        stock_quantity: "",
        category_id: "",
        image_url: "",
        is_active: true,
      });

      setImagePreview("");
      setSelectedProduct(null);
      setIsEditModalOpen(false);
    } catch (error) {
      toast.error(error.message || "Failed to update product.");
    }
  };

  const handleToggleProductStatus = async (product) => {
    const nextStatus = !product.is_active;
    const action = nextStatus ? "reactivate" : "deactivate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} "${product.name}"?`,
    );

    if (!confirmed) return;

    try {
      await updateProductStatus(product.id, nextStatus);

      toast.success(
        `Product ${nextStatus ? "activated" : "deactivated"} successfully.`,
      );

      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      toast.error(error.message || "Failed to update product status.");
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Product Management
        </h1>

        <p className="mt-2 text-slate-600">
          Manage your marketplace products, pricing, and availability.
        </p>
      </div>

      {/* Products Table */}
      <div className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white">
        {/* Table Header */}
        <div className="flex flex-col gap-4 border-b border-slate-200 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Marketplace Products
            </h2>

            <p className="mt-1 text-sm text-slate-500">
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
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="all">All Products</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="shrink-0 whitespace-nowrap"
            >
              Add Product
            </Button>
          </div>
        </div>

        {/* Products Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Price</th>
                <th className="px-6 py-4 font-medium">Stock</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {isLoading && products.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-16 text-center text-slate-500"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <RefreshCw
                        className="animate-spin text-slate-400"
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
                    className="px-6 py-12 text-center text-slate-500"
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
                    className="transition hover:bg-slate-50/70"
                  >
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {product.name}
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {product.category_name ||
                        product.category ||
                        "Uncategorized"}
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      PHP{" "}
                      {Number(product.price).toLocaleString("en-PH", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {product.stock_quantity}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          product.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {product.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <Button
                        variant="secondary"
                        onClick={() => handleOpenEditProduct(product)}
                        tooltip="Edit product"
                        className="border-0 bg-transparent px-2 py-2 text-slate-600 shadow-none hover:bg-slate-100 hover:text-indigo-600 cursor-pointer"
                      >
                        <Pencil size={16} />
                      </Button>

                      <Button
                        variant="secondary"
                        onClick={() => handleToggleProductStatus(product)}
                        tooltip={
                          product.is_active
                            ? "Deactivate product"
                            : "Reactivate product"
                        }
                        className={`border-0 bg-transparent px-2 py-2 shadow-none cursor-pointer ${
                          product.is_active
                            ? "text-orange-600! hover:bg-orange-50!"
                            : "text-green-600! hover:bg-green-50!"
                        }`}
                      >
                        <Power size={16} />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="border-t border-slate-200 px-6 py-4">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-6">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Add New Product
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Create a new product for your marketplace.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseCreateModal}
                className="rounded-lg px-3 py-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="p-6">
              <div className="mb-6">
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
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
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div className="mb-6">
                <label
                  htmlFor="description"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Description
                </label>

                <textarea
                  id="description"
                  name="description"
                  rows="4"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe your product"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div className="mb-6">
                <label
                  htmlFor="price"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
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
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div className="mb-6">
                <label
                  htmlFor="stock_quantity"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
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
                    setFormData({ ...formData, stock_quantity: e.target.value })
                  }
                  placeholder="Enter available stock"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label
                  htmlFor="product_image"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Product Image
                </label>

                <input
                  id="product_image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                  className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:font-medium file:text-indigo-700 hover:file:bg-indigo-100 disabled:opacity-50"
                />

                <p className="mt-1 text-xs text-slate-500">
                  JPG, PNG, or WebP. Maximum file size: 5 MB.
                </p>

                {isUploading && (
                  <p className="mt-2 text-sm text-indigo-600">
                    Uploading image...
                  </p>
                )}

                <div className="mt-3">
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Product preview"
                      className="mt-2 h-32 w-32 rounded-lg border border-slate-200 object-cover"
                    />
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="category_id"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Category
                </label>

                <select
                  id="category_id"
                  name="category_id"
                  value={formData.category_id}
                  onChange={(e) =>
                    setFormData({ ...formData, category_id: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
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

              <div className="mt-8 flex justify-end gap-3 border-t border-slate-200 pt-6">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCloseCreateModal}
                >
                  Cancel
                </Button>

                <Button type="submit" disabled={isUploading}>
                  {isUploading ? "Uploading Image..." : "Save Product"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {isEditModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-6">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Edit Product
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Update product details.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="rounded-lg px-3 py-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateProduct} className="p-6">
              <div className="mb-6">
                <label
                  htmlFor="edit_name"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Product Name
                </label>

                <input
                  type="text"
                  id="edit_name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div className="mb-6">
                <label
                  htmlFor="edit_description"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Description
                </label>

                <textarea
                  id="edit_description"
                  rows="4"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div className="mb-6">
                <label
                  htmlFor="edit_price"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
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
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div className="mb-6">
                <label
                  htmlFor="edit_stock"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Stock Quantity
                </label>

                <input
                  type="number"
                  id="edit_stock"
                  min="0"
                  step="1"
                  value={formData.stock_quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, stock_quantity: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div className="mb-6">
                <label
                  htmlFor="edit_category"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Category
                </label>

                <select
                  id="edit_category"
                  value={formData.category_id}
                  onChange={(e) =>
                    setFormData({ ...formData, category_id: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
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

              <div className="mb-6">
                <label
                  htmlFor="edit_product_image"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Product Image
                </label>

                <input
                  id="edit_product_image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                  className="block w-full text-sm text-slate-600"
                />

                {isUploading && (
                  <p className="mt-2 text-sm text-indigo-600">
                    Uploading image...
                  </p>
                )}

                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Product preview"
                    className="mt-3 h-32 w-32 rounded-lg border border-slate-200 object-cover"
                  />
                )}
              </div>

              <div className="mb-6">
                <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) =>
                      setFormData({ ...formData, is_active: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  Active Product
                </label>
              </div>

              <div className="mt-8 flex justify-end gap-3 border-t border-slate-200 pt-6">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </Button>

                <Button type="submit" disabled={isUploading}>
                  {isUploading ? "Uploading Image..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default ProductsPage;
