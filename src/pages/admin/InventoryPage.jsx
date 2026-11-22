import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  getAdminProducts,
  adjustStock,
  getInventoryMovements,
} from "../../services/inventoryService";

import Pagination from "../../components/ui/Pagination";
import SearchInput from "../../components/ui/SearchInput";
import Button from "../../components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Package,
  Boxes,
  AlertTriangle,
  CircleOff,
  PackagePlus,
  History,
  ArrowDownCircle,
  ArrowUpCircle,
  RefreshCw,
} from "lucide-react";

const InventoryPage = () => {
  // Inventory pagination
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

  // Stock adjustment dialog state
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [movementType, setMovementType] = useState("stock_in");
  const [reason, setReason] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [adjustmentError, setAdjustmentError] = useState("");

  // Inventory history dialog state
  const [historyProduct, setHistoryProduct] = useState(null);
  const [movements, setMovements] = useState([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");

  const [historyPagination, setHistoryPagination] = useState({
    page: 1,
    limit: 10,
    totalMovements: 0,
    totalPages: 0,
  });

  // Fetch inventory products and statistics
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

  // Open stock adjustment dialog
  const handleOpenAdjustment = (product) => {
    setSelectedProduct(product);
    setQuantity("");
    setMovementType("stock_in");
    setReason("");
    setAdjustmentError("");
  };

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

      // Reset and close the adjustment dialog
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

  // Fetch inventory movement history
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

  // Prevent closing the adjustment dialog while saving
  const handleCloseAdjustment = () => {
    if (isSaving) return;
    setSelectedProduct(null);
  };

  // Inventory loading error
  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <p className="font-medium text-red-800">Unable to load inventory</p>
          <p className="mt-1 text-sm text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-[#1C1C1C]">
          Inventory Management
        </h1>

        <p className="mt-2 text-sm text-[#6B6258]">
          Monitor product stock and inventory levels.
        </p>
      </div>

      {/* Inventory Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-[#E4DCCE] bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-[#6B6258]">Total Products</p>

            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#EDE6D8] text-[#1C1C1C]">
              <Package className="size-5" strokeWidth={1.8} />
            </div>
          </div>

          <p className="mt-3 text-2xl font-bold tracking-tight text-[#1C1C1C] tabular-nums">
            {inventoryStats.totalProducts}
          </p>

          <p className="mt-1 text-xs text-[#8A8176]">
            Products being monitored
          </p>
        </div>

        <div className="rounded-xl border border-[#E4DCCE] bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-[#6B6258]">
              Total Units in Stock
            </p>

            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#EDE6D8] text-[#1C1C1C]">
              <Boxes className="size-5" strokeWidth={1.8} />
            </div>
          </div>

          <p className="mt-3 text-2xl font-bold tracking-tight text-[#1C1C1C] tabular-nums">
            {inventoryStats.totalUnits}
          </p>

          <p className="mt-1 text-xs text-[#8A8176]">
            Combined available units
          </p>
        </div>

        <div className="rounded-xl border border-[#E4DCCE] bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-[#6B6258]">
              Low Stock Products
            </p>

            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
              <AlertTriangle className="size-5" strokeWidth={1.8} />
            </div>
          </div>

          <p className="mt-3 text-2xl font-bold tracking-tight text-amber-700 tabular-nums">
            {inventoryStats.lowStockProducts}
          </p>

          <p className="mt-1 text-xs text-[#8A8176]">
            Products needing attention
          </p>
        </div>

        <div className="rounded-xl border border-[#E4DCCE] bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-[#6B6258]">Out of Stock</p>

            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-700">
              <CircleOff className="size-5" strokeWidth={1.8} />
            </div>
          </div>

          <p className="mt-3 text-2xl font-bold tracking-tight text-red-700 tabular-nums">
            {inventoryStats.outOfStockProducts}
          </p>

          <p className="mt-1 text-xs text-[#8A8176]">
            Products with zero stock
          </p>
        </div>
      </div>

      {/* Inventory Products */}
      <div className="mt-8 overflow-hidden rounded-xl border border-[#E4DCCE] bg-white shadow-sm">
        {/* Inventory Header */}
        <div className="flex flex-col gap-4 border-b border-[#E4DCCE] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <h2 className="text-base font-semibold text-[#1C1C1C]">
              Product Inventory
            </h2>

            <p className="mt-1 text-sm text-[#6B6258]">
              View and manage stock levels across all products.
            </p>
          </div>

          <div className="w-full sm:max-w-sm">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search inventory by product name..."
            />
          </div>
        </div>

        {/* Desktop Inventory Table */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-[#FAF8F4] text-[#6B6258]">
              <tr>
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Price</th>
                <th className="px-6 py-4 font-medium">Stock</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 text-right font-medium">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#E4DCCE]">
              {isLoading && products.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-16 text-center text-[#6B6258]"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <RefreshCw className="size-7 animate-spin text-[#8A8176]" />
                      <p>Loading inventory...</p>
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-[#6B6258]"
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
                      ? "bg-red-50 text-red-700 ring-red-200"
                      : stock <= 5
                        ? "bg-amber-50 text-amber-700 ring-amber-200"
                        : "bg-green-50 text-green-700 ring-green-200";

                  return (
                    <tr
                      key={product.id}
                      className="transition-colors hover:bg-[#FAF8F4]/70"
                    >
                      <td className="px-6 py-4 font-medium text-[#1C1C1C]">
                        {product.name}
                      </td>

                      <td className="px-6 py-4 text-[#6B6258]">
                        {product.category || "Uncategorized"}
                      </td>

                      <td className="px-6 py-4 text-[#6B6258] tabular-nums">
                        {Number(product.price).toLocaleString("en-PH", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>

                      <td className="px-6 py-4 font-medium text-[#1C1C1C] tabular-nums">
                        {stock}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${statusStyle}`}
                        >
                          {stockStatus}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenAdjustment(product)}
                            title="Adjust Stock"
                            aria-label={`Adjust stock for ${product.name}`}
                            className="text-[#B3261E] hover:bg-[#B3261E]/10 hover:text-[#B3261E]"
                          >
                            <PackagePlus />
                          </Button>

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewHistory(product)}
                            title="View Inventory History"
                            aria-label={`View inventory history for ${product.name}`}
                            className="text-[#6B6258] hover:bg-[#EDE6D8] hover:text-[#1C1C1C]"
                          >
                            <History />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Inventory Cards */}
        <div className="divide-y divide-[#E4DCCE] md:hidden">
          {isLoading && products.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-6 py-12 text-[#6B6258]">
              <RefreshCw className="size-7 animate-spin text-[#8A8176]" />
              <p className="text-sm">Loading inventory...</p>
            </div>
          ) : products.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-[#6B6258]">
              {debouncedSearch
                ? "No products match your search."
                : "No products found."}
            </p>
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
                  ? "bg-red-50 text-red-700 ring-red-200"
                  : stock <= 5
                    ? "bg-amber-50 text-amber-700 ring-amber-200"
                    : "bg-green-50 text-green-700 ring-green-200";

              return (
                <div key={product.id} className="space-y-4 p-4">
                  {/* Product Name and Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="break-words text-sm font-semibold text-[#1C1C1C]">
                        {product.name}
                      </h3>

                      <p className="mt-1 text-xs text-[#8A8176]">
                        {product.category || "Uncategorized"}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${statusStyle}`}
                    >
                      {stockStatus}
                    </span>
                  </div>

                  {/* Product Information */}
                  <div className="grid grid-cols-2 gap-3 rounded-lg bg-[#FAF8F4] p-3">
                    <div>
                      <p className="text-xs text-[#8A8176]">Price</p>

                      <p className="mt-1 text-sm font-medium text-[#1C1C1C] tabular-nums">
                        {Number(product.price).toLocaleString("en-PH", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-[#8A8176]">Available Stock</p>

                      <p className="mt-1 text-sm font-semibold text-[#1C1C1C] tabular-nums">
                        {stock} units
                      </p>
                    </div>
                  </div>

                  {/* Mobile Actions */}
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenAdjustment(product)}
                      className="border-[#E4DCCE] text-[#B3261E] hover:bg-[#FAF8F4]"
                    >
                      <PackagePlus />
                      Adjust Stock
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewHistory(product)}
                      className="text-[#6B6258] hover:bg-[#EDE6D8] hover:text-[#1C1C1C]"
                    >
                      <History />
                      History
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Shared Inventory Pagination */}
        <div className="border-t border-[#E4DCCE] px-5 py-4 sm:px-6">
          <Pagination
            currentPage={currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalProducts}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* Stock Adjustment Dialog */}
      <Dialog
        open={Boolean(selectedProduct)}
        onOpenChange={(open) => {
          if (!open) handleCloseAdjustment();
        }}
      >
        <DialogContent
          className="max-h-[90vh] max-w-lg overflow-y-auto p-5 sm:p-6"
          showCloseButton={!isSaving}
        >
          {selectedProduct && (
            <>
              <DialogHeader>
                <DialogTitle className="text-lg font-semibold text-[#1C1C1C]">
                  Adjust Stock
                </DialogTitle>

                <DialogDescription>
                  Record a stock addition or removal for this product.
                </DialogDescription>
              </DialogHeader>

              <div className="rounded-lg border border-[#E4DCCE] bg-[#FAF8F4] p-4">
                <p className="text-sm text-[#6B6258]">Product</p>

                <p className="mt-1 font-semibold text-[#1C1C1C]">
                  {selectedProduct.name}
                </p>

                <div className="mt-3 flex items-center justify-between border-t border-[#E4DCCE] pt-3">
                  <span className="text-sm text-[#6B6258]">Current Stock</span>

                  <span className="font-semibold text-[#1C1C1C] tabular-nums">
                    {selectedProduct.stock_quantity}
                  </span>
                </div>
              </div>

              <form onSubmit={handleAdjustStock} className="space-y-4">
                <div>
                  <label
                    htmlFor="movementType"
                    className="mb-2 block text-sm font-medium text-[#1C1C1C]"
                  >
                    Movement Type
                  </label>

                  <select
                    id="movementType"
                    value={movementType}
                    onChange={(event) => setMovementType(event.target.value)}
                    className="h-10 w-full rounded-lg border border-[#E4DCCE] bg-white px-3 text-sm text-[#1C1C1C] outline-none transition focus:border-[#B3261E] focus:ring-2 focus:ring-[#B3261E]/15"
                  >
                    <option value="stock_in">Stock In (Add)</option>
                    <option value="stock_out">Stock Out (Remove)</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="adjustmentQuantity"
                    className="mb-2 block text-sm font-medium text-[#1C1C1C]"
                  >
                    Quantity
                  </label>

                  <input
                    id="adjustmentQuantity"
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={quantity}
                    onChange={(event) => setQuantity(event.target.value)}
                    placeholder="Enter quantity"
                    className="h-10 w-full rounded-lg border border-[#E4DCCE] bg-white px-3 text-sm text-[#1C1C1C] outline-none transition placeholder:text-[#8A8176] focus:border-[#B3261E] focus:ring-2 focus:ring-[#B3261E]/15"
                  />
                </div>

                <div>
                  <label
                    htmlFor="adjustmentReason"
                    className="mb-2 block text-sm font-medium text-[#1C1C1C]"
                  >
                    Reason
                  </label>

                  <textarea
                    id="adjustmentReason"
                    required
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    placeholder="Why is the stock being adjusted?"
                    rows={3}
                    className="w-full resize-y rounded-lg border border-[#E4DCCE] bg-white px-3 py-2 text-sm text-[#1C1C1C] outline-none transition placeholder:text-[#8A8176] focus:border-[#B3261E] focus:ring-2 focus:ring-[#B3261E]/15"
                  />
                </div>

                {adjustmentError && (
                  <p
                    role="alert"
                    className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                  >
                    {adjustmentError}
                  </p>
                )}

                <DialogFooter className="-mx-5 -mb-5 mt-2 px-5 sm:-mx-6 sm:-mb-6 sm:px-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseAdjustment}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="bg-[#B3261E] text-white hover:bg-[#922018]"
                  >
                    {isSaving ? (
                      <>
                        <RefreshCw className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Adjustment"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Inventory History Dialog */}
      <Dialog
        open={Boolean(historyProduct)}
        onOpenChange={(open) => {
          if (!open) setHistoryProduct(null);
        }}
      >
        <DialogContent
          className="flex max-h-[90vh] max-w-5xl flex-col gap-4 overflow-hidden p-5 sm:p-6"
          showCloseButton
        >
          {historyProduct && (
            <>
              <DialogHeader className="shrink-0 pr-8">
                <DialogTitle className="text-lg font-semibold text-[#1C1C1C]">
                  Inventory History
                </DialogTitle>

                <DialogDescription>
                  Stock movement records for {historyProduct.name}.
                </DialogDescription>
              </DialogHeader>

              <div className="min-h-0 flex-1 overflow-y-auto">
                {isHistoryLoading ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-16 text-[#6B6258]">
                    <RefreshCw className="size-7 animate-spin text-[#8A8176]" />
                    <p className="text-sm">Loading inventory history...</p>
                  </div>
                ) : historyError ? (
                  <div
                    role="alert"
                    className="rounded-lg border border-red-200 bg-red-50 p-4 text-center text-sm text-red-700"
                  >
                    {historyError}
                  </div>
                ) : movements.length === 0 ? (
                  <div className="py-16 text-center text-sm text-[#6B6258]">
                    No inventory movements found.
                  </div>
                ) : (
                  <>
                    {/* Desktop History Table */}
                    <div className="hidden overflow-x-auto rounded-lg border border-[#E4DCCE] md:block">
                      <table className="w-full min-w-[750px] text-left text-sm">
                        <thead className="sticky top-0 bg-[#FAF8F4] text-[#6B6258]">
                          <tr>
                            <th className="px-4 py-3 font-medium">Date</th>
                            <th className="px-4 py-3 font-medium">Type</th>
                            <th className="px-4 py-3 font-medium">Change</th>
                            <th className="px-4 py-3 font-medium">Previous</th>
                            <th className="px-4 py-3 font-medium">New Stock</th>
                            <th className="px-4 py-3 font-medium">Reason</th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-[#E4DCCE]">
                          {movements.map((movement) => (
                            <tr
                              key={movement.id}
                              className="transition-colors hover:bg-[#FAF8F4]/70"
                            >
                              <td className="whitespace-nowrap px-4 py-3 text-[#6B6258]">
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
                                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                                    movement.movement_type === "stock_in"
                                      ? "bg-green-50 text-green-700 ring-1 ring-green-200"
                                      : "bg-red-50 text-red-700 ring-1 ring-red-200"
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
                                className={`px-4 py-3 font-semibold tabular-nums ${
                                  Number(movement.quantity_change) > 0
                                    ? "text-green-700"
                                    : "text-red-700"
                                }`}
                              >
                                {Number(movement.quantity_change) > 0
                                  ? "+"
                                  : ""}
                                {movement.quantity_change}
                              </td>

                              <td className="px-4 py-3 text-[#6B6258] tabular-nums">
                                {movement.previous_stock}
                              </td>

                              <td className="px-4 py-3 font-medium text-[#1C1C1C] tabular-nums">
                                {movement.new_stock}
                              </td>

                              <td className="max-w-xs px-4 py-3 text-[#6B6258]">
                                {movement.reason || "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile History Cards */}
                    <div className="divide-y divide-[#E4DCCE] rounded-lg border border-[#E4DCCE] md:hidden">
                      {movements.map((movement) => (
                        <div key={movement.id} className="space-y-3 p-4">
                          {/* Movement Type and Date */}
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                                movement.movement_type === "stock_in"
                                  ? "bg-green-50 text-green-700 ring-1 ring-green-200"
                                  : "bg-red-50 text-red-700 ring-1 ring-red-200"
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

                            <span className="text-right text-xs text-[#8A8176]">
                              {new Date(movement.created_at).toLocaleString(
                                "en-PH",
                                {
                                  dateStyle: "medium",
                                  timeStyle: "short",
                                },
                              )}
                            </span>
                          </div>

                          {/* Stock Information */}
                          <div className="grid grid-cols-3 gap-2 rounded-lg bg-[#FAF8F4] p-3">
                            <div>
                              <p className="text-xs text-[#8A8176]">Change</p>
                              <p
                                className={`mt-1 text-sm font-semibold tabular-nums ${
                                  Number(movement.quantity_change) > 0
                                    ? "text-green-700"
                                    : "text-red-700"
                                }`}
                              >
                                {Number(movement.quantity_change) > 0
                                  ? "+"
                                  : ""}
                                {movement.quantity_change}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs text-[#8A8176]">Previous</p>
                              <p className="mt-1 text-sm font-medium text-[#1C1C1C] tabular-nums">
                                {movement.previous_stock}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs text-[#8A8176]">
                                New Stock
                              </p>
                              <p className="mt-1 text-sm font-semibold text-[#1C1C1C] tabular-nums">
                                {movement.new_stock}
                              </p>
                            </div>
                          </div>

                          {/* Reason */}
                          <div>
                            <p className="text-xs font-medium text-[#8A8176]">
                              Reason
                            </p>
                            <p className="mt-1 break-words text-sm text-[#6B6258]">
                              {movement.reason || "—"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {!isHistoryLoading &&
                !historyError &&
                historyPagination.totalPages > 1 && (
                  <div className="shrink-0 border-t border-[#E4DCCE] pt-4">
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
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryPage;
