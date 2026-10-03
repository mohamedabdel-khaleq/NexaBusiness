import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  History,
  Package,
  Plus,
  RefreshCw,
  Search,
  X,
} from "lucide-react";

import API from "../services/api";
import { useAuth } from "../context/AuthContext";

function formatCurrency(value) {
  const amount = Number(value || 0);

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(date) {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(date) {
  if (!date) return "-";

  return new Date(date).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getStockStatus(stock) {
  const quantity = Number(stock || 0);

  if (quantity === 0) {
    return {
      label: "Out of Stock",
      className: "bg-red-50 text-red-700 border-red-200",
    };
  }

  if (quantity <= 5) {
    return {
      label: "Low Stock",
      className: "bg-amber-50 text-amber-700 border-amber-200",
    };
  }

  return {
    label: "In Stock",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };
}

function StockBadge({ stock }) {
  const status = getStockStatus(stock);

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${status.className}`}
    >
      {status.label}
    </span>
  );
}

function getTransactionStyle(type) {
  switch (type) {
    case "PURCHASE":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";

    case "RETURN":
      return "bg-blue-50 text-blue-700 border-blue-200";

    case "SALE":
      return "bg-red-50 text-red-700 border-red-200";

    case "DAMAGE":
      return "bg-orange-50 text-orange-700 border-orange-200";

    case "ADJUSTMENT":
      return "bg-violet-50 text-violet-700 border-violet-200";

    default:
      return "bg-slate-50 text-slate-600 border-slate-200";
  }
}

function TransactionBadge({ type }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${getTransactionStyle(
        type
      )}`}
    >
      {type || "UNKNOWN"}
    </span>
  );
}

function InventoryLoading() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="animate-pulse">
        <div className="h-14 border-b border-slate-200 bg-slate-50" />

        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="grid grid-cols-6 gap-4 border-b border-slate-100 p-5"
          >
            <div className="h-4 rounded bg-slate-200" />
            <div className="h-4 rounded bg-slate-200" />
            <div className="h-4 rounded bg-slate-200" />
            <div className="h-4 rounded bg-slate-200" />
            <div className="h-4 rounded bg-slate-200" />
            <div className="h-4 rounded bg-slate-200" />
          </div>
        ))}
      </div>
    </div>
  );
}

function TransactionDetailsModal({ transaction, onClose }) {
  if (!transaction) return null;

  const product = transaction.product;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Inventory Transaction
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900">
              Transaction #{transaction.id}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium text-slate-500">
                Transaction Type
              </p>

              <div className="mt-2">
                <TransactionBadge type={transaction.type} />
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium text-slate-500">
                Quantity
              </p>

              <p className="mt-2 text-xl font-bold text-slate-900">
                {transaction.quantity}
              </p>
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-bold text-slate-900">
              Product Information
            </h3>

            <div className="rounded-xl border border-slate-200 p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-slate-500">Product</p>

                  <p className="mt-1 font-semibold text-slate-900">
                    {product?.name || `Product #${transaction.productId}`}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">SKU</p>

                  <p className="mt-1 font-medium text-slate-900">
                    {product?.sku || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">Barcode</p>

                  <p className="mt-1 font-medium text-slate-900">
                    {product?.barcode || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Current Stock
                  </p>

                  <div className="mt-1 flex items-center gap-2">
                    <span className="font-bold text-slate-900">
                      {product?.stock ?? 0}
                    </span>

                    <StockBadge stock={product?.stock} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-bold text-slate-900">
              Transaction Information
            </h3>

            <div className="rounded-xl border border-slate-200 p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-slate-500">Transaction ID</p>

                  <p className="mt-1 font-medium text-slate-900">
                    #{transaction.id}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Product ID
                  </p>

                  <p className="mt-1 font-medium text-slate-900">
                    #{transaction.productId}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">Date</p>

                  <p className="mt-1 font-medium text-slate-900">
                    {formatDateTime(transaction.createdAt)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">Note</p>

                  <p className="mt-1 font-medium text-slate-900">
                    {transaction.note || "No note"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddTransactionModal({
  products,
  onClose,
  onSuccess,
  token,
}) {
  const [productId, setProductId] = useState("");
  const [type, setType] = useState("PURCHASE");
  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!productId) {
      setError("Please select a product.");
      return;
    }

    if (!quantity || Number(quantity) <= 0) {
      setError("Quantity must be greater than zero.");
      return;
    }

    try {
      setSubmitting(true);

      await API.post(
        "/inventory",
        {
          productId: Number(productId),
          type,
          quantity: Number(quantity),
          note: note.trim() || undefined,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      onSuccess();
    } catch (err) {
      console.error("Create inventory transaction error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to create inventory transaction."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <p className="text-sm font-medium text-blue-600">
              Inventory
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900">
              Add Transaction
            </h2>
          </div>

          <button
            onClick={onClose}
            disabled={submitting}
            className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Product
            </label>

            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              disabled={submitting}
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
            >
              <option value="">Select product</option>

              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} — Stock: {product.stock}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Transaction Type
            </label>

            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              disabled={submitting}
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
            >
              <option value="PURCHASE">Purchase</option>
              <option value="RETURN">Return</option>
              <option value="SALE">Sale</option>
              <option value="DAMAGE">Damage</option>
              <option value="ADJUSTMENT">Adjustment</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Quantity
            </label>

            <input
              type="number"
              min="1"
              step="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Enter quantity"
              disabled={submitting}
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Note
            </label>

            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional note..."
              rows={3}
              disabled={submitting}
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
            />
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting && (
                <RefreshCw size={16} className="animate-spin" />
              )}

              {submitting ? "Saving..." : "Add Transaction"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Inventory() {
  const { token } = useAuth();

  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalProducts: 0,
    totalPages: 1,
  });

  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState("ALL");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [selectedTransaction, setSelectedTransaction] =
    useState(null);

  const [showAddModal, setShowAddModal] = useState(false);

  const fetchInventory = async (
    page = 1,
    showRefresh = false
  ) => {
    if (!token) return;

    try {
      setError("");

      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [productsResponse, transactionsResponse] =
        await Promise.all([
          API.get("/products", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            params: {
              page,
              limit: 10,
              ...(search.trim()
                ? { search: search.trim() }
                : {}),
            },
          }),

          API.get("/inventory", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

      const productData = productsResponse.data;
      const transactionData = transactionsResponse.data;

      setProducts(productData.products || []);

      setPagination(
        productData.pagination || {
          page,
          limit: 10,
          totalProducts: productData.products?.length || 0,
          totalPages: 1,
        }
      );

      setTransactions(transactionData.transactions || []);
    } catch (err) {
      console.error("Inventory fetch error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load inventory. Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInventory(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [token, search]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const stock = Number(product.stock || 0);

      if (stockFilter === "IN_STOCK") {
        return stock > 5;
      }

      if (stockFilter === "LOW_STOCK") {
        return stock > 0 && stock <= 5;
      }

      if (stockFilter === "OUT_OF_STOCK") {
        return stock === 0;
      }

      return true;
    });
  }, [products, stockFilter]);

  const totalStock = useMemo(() => {
    return products.reduce(
      (sum, product) => sum + Number(product.stock || 0),
      0
    );
  }, [products]);

  const lowStockProducts = useMemo(() => {
    return products.filter(
      (product) =>
        Number(product.stock || 0) > 0 &&
        Number(product.stock || 0) <= 5
    ).length;
  }, [products]);

  const outOfStockProducts = useMemo(() => {
    return products.filter(
      (product) => Number(product.stock || 0) === 0
    ).length;
  }, [products]);

  const clearFilters = () => {
    setSearch("");
    setStockFilter("ALL");
  };

  const hasFilters = search.trim() || stockFilter !== "ALL";

  const handleTransactionSuccess = async () => {
    setShowAddModal(false);
    await fetchInventory(pagination.page, true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-medium text-blue-600">
            Inventory Management
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Inventory
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Monitor stock levels and manage inventory transactions.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            onClick={() =>
              fetchInventory(pagination.page, true)
            }
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={17}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus size={18} />
            Add Transaction
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              Products
            </p>

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Package size={18} />
            </div>
          </div>

          <p className="mt-3 text-2xl font-bold text-slate-900">
            {pagination.totalProducts || 0}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              Total Stock
            </p>

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <ArrowUp size={18} />
            </div>
          </div>

          <p className="mt-3 text-2xl font-bold text-slate-900">
            {totalStock}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              Low Stock
            </p>

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <AlertTriangle size={18} />
            </div>
          </div>

          <p className="mt-3 text-2xl font-bold text-slate-900">
            {lowStockProducts}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              Out of Stock
            </p>

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <ArrowDown size={18} />
            </div>
          </div>

          <p className="mt-3 text-2xl font-bold text-slate-900">
            {outOfStockProducts}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex items-center gap-2">
          <Filter size={18} className="text-slate-500" />

          <h2 className="font-semibold text-slate-900">
            Filters
          </h2>
        </div>

        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_auto]">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search product, SKU or barcode..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
          >
            <option value="ALL">All Stock</option>
            <option value="IN_STOCK">In Stock</option>
            <option value="LOW_STOCK">Low Stock</option>
            <option value="OUT_OF_STOCK">Out of Stock</option>
          </select>

          <button
            onClick={clearFilters}
            disabled={!hasFilters}
            className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>

          <button
            onClick={() =>
              fetchInventory(pagination.page, true)
            }
            className="font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Products */}
      {loading ? (
        <InventoryLoading />
      ) : filteredProducts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
            <Package size={25} className="text-slate-400" />
          </div>

          <h3 className="mt-4 text-lg font-bold text-slate-900">
            No products found
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            There are no products matching your current search or
            stock filter.
          </p>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="mt-5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">
            <div className="flex items-center gap-2">
              <Package size={18} className="text-slate-500" />

              <h2 className="font-semibold text-slate-900">
                Stock Overview
              </h2>
            </div>

            <span className="text-sm text-slate-500">
              {filteredProducts.length} shown
            </span>
          </div>

          {/* Desktop */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    Product
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    SKU
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    Category
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    Price
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    Stock
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-slate-100 transition hover:bg-slate-50/70 last:border-b-0"
                  >
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {product.name}
                        </p>

                        <p className="mt-0.5 text-xs text-slate-500">
                          {product.barcode || "No barcode"}
                        </p>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="font-medium text-slate-700">
                        {product.sku}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span className="text-sm text-slate-600">
                        {product.category?.name || "-"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span className="font-bold text-slate-900">
                        {formatCurrency(product.price)}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span className="text-lg font-bold text-slate-900">
                        {product.stock}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <StockBadge stock={product.stock} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile */}
          <div className="divide-y divide-slate-100 md:hidden">
            {filteredProducts.map((product) => (
              <div key={product.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-slate-900">
                      {product.name}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      SKU: {product.sku}
                    </p>
                  </div>

                  <StockBadge stock={product.stock} />
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-xs text-slate-400">
                      Stock
                    </p>

                    <p className="mt-1 font-bold text-slate-900">
                      {product.stock}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Price
                    </p>

                    <p className="mt-1 font-bold text-slate-900">
                      {formatCurrency(product.price)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Category
                    </p>

                    <p className="mt-1 truncate font-medium text-slate-700">
                      {product.category?.name || "-"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <p className="text-sm text-slate-500">
              Page{" "}
              <span className="font-semibold text-slate-700">
                {pagination.page || 1}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-700">
                {pagination.totalPages || 1}
              </span>
              {" • "}
              <span className="font-semibold text-slate-700">
                {pagination.totalProducts || 0}
              </span>{" "}
              products
            </p>

            <div className="flex items-center gap-2">
              <button
                disabled={(pagination.page || 1) <= 1}
                onClick={() =>
                  fetchInventory(pagination.page - 1)
                }
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={16} />
                Previous
              </button>

              <button
                disabled={
                  (pagination.page || 1) >=
                  (pagination.totalPages || 1)
                }
                onClick={() =>
                  fetchInventory(pagination.page + 1)
                }
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transactions */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-5 py-4">
          <History size={18} className="text-slate-500" />

          <h2 className="font-semibold text-slate-900">
            Recent Inventory Transactions
          </h2>
        </div>

        {transactions.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-slate-500">
            No inventory transactions found.
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Transaction
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Product
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Type
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Quantity
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Date
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {transactions.slice(0, 10).map((transaction) => (
                    <tr
                      key={transaction.id}
                      className="border-b border-slate-100 transition hover:bg-slate-50/70 last:border-b-0"
                    >
                      <td className="px-5 py-4">
                        <span className="font-bold text-slate-900">
                          #{transaction.id}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {transaction.product?.name ||
                              `Product #${transaction.productId}`}
                          </p>

                          <p className="mt-0.5 text-xs text-slate-500">
                            {transaction.product?.sku || "-"}
                          </p>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <TransactionBadge
                          type={transaction.type}
                        />
                      </td>

                      <td className="px-5 py-4">
                        <span className="font-bold text-slate-900">
                          {transaction.quantity}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-sm font-medium text-slate-700">
                          {formatDate(transaction.createdAt)}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() =>
                            setSelectedTransaction(transaction)
                          }
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                        >
                          <Eye size={15} />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-slate-100 md:hidden">
              {transactions.slice(0, 10).map((transaction) => (
                <div key={transaction.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-slate-900">
                        Transaction #{transaction.id}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {transaction.product?.name ||
                          `Product #${transaction.productId}`}
                      </p>
                    </div>

                    <TransactionBadge type={transaction.type} />
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-400">
                        Quantity
                      </p>

                      <p className="mt-1 font-bold text-slate-900">
                        {transaction.quantity}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-400">
                        Date
                      </p>

                      <p className="mt-1 font-medium text-slate-700">
                        {formatDate(transaction.createdAt)}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      setSelectedTransaction(transaction)
                    }
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    <Eye size={16} />
                    View Transaction
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Add Transaction Modal */}
      {showAddModal && (
        <AddTransactionModal
          products={products}
          token={token}
          onClose={() => setShowAddModal(false)}
          onSuccess={handleTransactionSuccess}
        />
      )}

      {/* Transaction Details */}
      {selectedTransaction && (
        <TransactionDetailsModal
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      )}
    </div>
  );
}

export default Inventory;
