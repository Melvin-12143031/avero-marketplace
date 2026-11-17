import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  getAdminProducts,
  adjustStock,
  getInventoryMovements,
} from "../../services/inventoryService";

import Pagination from "../../components/ui/Pagination";
import SearchInput from "../../components/ui/SearchInput";

import {
  PackagePlus,
  History,
  ArrowDownCircle,
  ArrowUpCircle,
  RefreshCw,
} from "lucide-react";

const InventoryPage = () => {
  // Pagination state for inventory list
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [pagination, setPagination] = useState({
    totalProducts: 0,
    totalPages: 0,
  });

  // Main inventory data
  const [products, setProducts] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [inventoryStats, setInventoryStats] = useState({
    totalProducts: 0,
    totalUnits: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0,
  });

  // Stock adjustment modal state
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [movementType, setMovementType] = useState("stock_in");
  const [reason, setReason] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [adjustmentError, setAdjustmentError] = useState("");

  // Inventory history modal state
  const [historyProduct, setHistoryProduct] = useState(null);
  const [movements, setMovements] = useState([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");

  // Pagination state for inventory history
  const [historyPagination, setHistoryPagination] = useState({
    page: 1,
    limit: 10,
    totalMovements: 0,
    totalPages: 0,
  });

  // Fetch all inventory products and low-stock products
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setIsLoading(true);
        setError("");

        const productData = await getAdminProducts(
          currentPage,
          pageSize,
          debouncedSearch,
        );

        setProducts(productData.products);
        setInventoryStats(productData.statistics);

        setPagination({
          totalProducts: productData.pagination.totalProducts,
          totalPages: productData.pagination.totalPages,
        });
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInventory();
  }, [currentPage, pageSize, debouncedSearch]);

  // Debounce inventory search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setCurrentPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // Submit a stock adjustment
  const handleAdjustStock = async (event) => {
    event.preventDefault();

    try {
      setIsSaving(true);
      setAdjustmentError("");

      const adjustmentQuantity = Number(quantity);

      await adjustStock(selectedProduct.id, {
        quantity: adjustmentQuantity,
        movementType,
        reason,
      });

      toast.success(
        movementType === "stock_in"
          ? "Stock added successfully!"
          : "Stock removed successfully!",
      );

      const productData = await getAdminProducts(
        currentPage,
        pageSize,
        debouncedSearch,
      );

      setProducts(productData.products);
      setInventoryStats(productData.statistics);

      setPagination({
        totalProducts: productData.pagination.totalProducts,
        totalPages: productData.pagination.totalPages,
      });

      // Reset and close the adjustment modal
      setSelectedProduct(null);
      setQuantity("");
      setMovementType("stock_in");
      setReason("");
    } catch (error) {
      setAdjustmentError(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Fetch inventory movement history for a selected product
  const handleViewHistory = async (product, page = 1) => {
    setHistoryProduct(product);
    setMovements([]);
    setHistoryError("");
    setIsHistoryLoading(true);

    try {
      const response = await getInventoryMovements(product.id, page, 10);

      setMovements(response.movements || []);

      setHistoryPagination(
        response.pagination || {
          page: 1,
          limit: 10,
          totalMovements: 0,
          totalPages: 0,
        },
      );
    } catch (error) {
      setHistoryError(error.message);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  // Handle inventory loading errors
  if (error) {
    return <p className="p-8 text-red-600">{error}</p>;
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Inventory Management
        </h1>

        <p className="mt-2 text-slate-600">
          Monitor product stock and inventory levels.
        </p>
      </div>

      {/* Inventory Summary Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-500">Total Products</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {inventoryStats.totalProducts}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-500">Total Units in Stock</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {inventoryStats.totalUnits}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-500">Low Stock Products</p>
          <p className="mt-2 text-3xl font-bold text-amber-600">
            {inventoryStats.lowStockProducts}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-500">Out of Stock</p>
          <p className="mt-2 text-3xl font-bold text-red-600">
            {inventoryStats.outOfStockProducts}
          </p>
        </div>
      </div>

      {/* Inventory Products Table */}
      <div className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Product Inventory
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              View stock levels across all products.
            </p>
          </div>

          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search inventory by product name..."
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Price</th>
                <th className="px-6 py-4 font-medium">Stock</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 text-right font-medium">Actions</th>
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
                      <p>Loading inventory...</p>
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-slate-500"
                  >
                    {debouncedSearch
                      ? "No products match your search."
                      : "No products found."}
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const stock = Number(product.stock_quantity || 0);

                  const stockStatus =
                    stock === 0
                      ? "Out of Stock"
                      : stock <= 5
                        ? "Low Stock"
                        : "In Stock";

                  const statusStyle =
                    stock === 0
                      ? "bg-red-100 text-red-700"
                      : stock <= 5
                        ? "bg-amber-100 text-amber-700"
                        : "bg-green-100 text-green-700";

                  return (
                    <tr key={product.id}>
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {product.name}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {product.category || "Uncategorized"}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {Number(product.price).toLocaleString()}
                      </td>

                      <td className="px-6 py-4 text-slate-600">{stock}</td>

                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyle}`}
                        >
                          {stockStatus}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedProduct(product);
                              setAdjustmentError("");
                            }}
                            title="Adjust Stock"
                            aria-label={`Adjust stock for ${product.name}`}
                            className="cursor-pointer rounded-lg p-2 text-indigo-600 transition-colors hover:bg-indigo-50 hover:text-indigo-700"
                          >
                            <PackagePlus size={18} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleViewHistory(product)}
                            title="View Inventory History"
                            aria-label={`View inventory history for ${product.name}`}
                            className="cursor-pointer rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                          >
                            <History size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

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

      {/* Stock Adjustment Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">
                Adjust Stock
              </h2>

              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="text-slate-500 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <p className="mb-5 text-sm text-slate-600">
              Product:{" "}
              <span className="font-semibold text-slate-900">
                {selectedProduct.name}
              </span>
            </p>

            <p className="mb-5 text-sm text-slate-600">
              Current Stock:{" "}
              <span className="font-semibold text-slate-900">
                {selectedProduct.stock_quantity}
              </span>
            </p>

            <form onSubmit={handleAdjustStock} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Movement Type
                </label>

                <select
                  value={movementType}
                  onChange={(event) => setMovementType(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                >
                  <option value="stock_in">Stock In (Add)</option>
                  <option value="stock_out">Stock Out (Remove)</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Quantity
                </label>

                <input
                  type="number"
                  min="1"
                  step="1"
                  required
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value)}
                  placeholder="Enter quantity"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Reason
                </label>

                <textarea
                  required
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder="Why is the stock being adjusted?"
                  rows="3"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>

              {adjustmentError && (
                <p className="text-sm text-red-600">{adjustmentError}</p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  disabled={isSaving}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Save Adjustment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inventory History Modal */}
      {historyProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-6xl rounded-2xl bg-white p-8 shadow-2xl">
            {/* Modal Header */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Inventory History
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {historyProduct.name}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setHistoryProduct(null)}
                title="Close History"
                aria-label="Close inventory history"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              >
                ✕
              </button>
            </div>

            {/* History Loading, Error, Empty, and Table States */}
            {isHistoryLoading ? (
              <p className="py-8 text-center text-slate-500">
                Loading inventory history...
              </p>
            ) : historyError ? (
              <p className="py-8 text-center text-red-600">{historyError}</p>
            ) : movements.length === 0 ? (
              <p className="py-8 text-center text-slate-500">
                No inventory movements found.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="px-4 py-3 font-medium">Date</th>
                      <th className="px-4 py-3 font-medium">Type</th>
                      <th className="px-4 py-3 font-medium">Change</th>
                      <th className="px-4 py-3 font-medium">Previous</th>
                      <th className="px-4 py-3 font-medium">New Stock</th>
                      <th className="px-4 py-3 font-medium">Reason</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-200">
                    {movements.map((movement) => (
                      <tr key={movement.id}>
                        <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                          {new Date(movement.created_at).toLocaleString(
                            "en-PH",
                            {
                              dateStyle: "medium",
                              timeStyle: "short",
                            },
                          )}
                        </td>

                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                              movement.movement_type === "stock_in"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {movement.movement_type === "stock_in" ? (
                              <ArrowDownCircle size={14} />
                            ) : (
                              <ArrowUpCircle size={14} />
                            )}

                            {movement.movement_type === "stock_in"
                              ? "Stock In"
                              : "Stock Out"}
                          </span>
                        </td>

                        <td
                          className={`px-4 py-3 font-semibold ${
                            Number(movement.quantity_change) > 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {Number(movement.quantity_change) > 0 ? "+" : ""}
                          {movement.quantity_change}
                        </td>

                        <td className="px-4 py-3 text-slate-600">
                          {movement.previous_stock}
                        </td>

                        <td className="px-4 py-3 text-slate-600">
                          {movement.new_stock}
                        </td>

                        <td className="px-4 py-3 text-slate-600">
                          {movement.reason || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls: Only shown when multiple pages exist */}
            {!isHistoryLoading &&
              !historyError &&
              historyPagination.totalPages > 1 && (
                <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-5 sm:flex-row">
                  <Pagination
                    currentPage={historyPagination.page}
                    totalPages={historyPagination.totalPages}
                    totalItems={historyPagination.totalMovements}
                    pageSize={historyPagination.limit}
                    onPageChange={(page) =>
                      handleViewHistory(historyProduct, page)
                    }
                  />
                </div>
              )}
          </div>
        </div>
      )}
    </main>
  );
};

export default InventoryPage;
