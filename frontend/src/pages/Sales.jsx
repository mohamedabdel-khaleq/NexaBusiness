
import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  Package,
  Plus,
  RefreshCw,
  Search,
  ShoppingCart,
  Trash2,
  User,
  X,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import API from "../services/api";
import { useAuth } from "../context/AuthContext";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function formatDate(date) {
  if (!date) return "-";

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "-";

  return parsed.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(date) {
  if (!date) return "-";

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "-";

  return parsed.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getStatusStyle(status) {
  switch (status) {
    case "COMPLETED":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "PENDING":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "CANCELLED":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-slate-50 text-slate-600 border-slate-200";
  }
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusStyle(
        status
      )}`}
    >
      {status || "UNKNOWN"}
    </span>
  );
}

function getList(data, keys) {
  if (Array.isArray(data)) return data;

  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
  }

  if (Array.isArray(data?.data)) return data.data;

  return [];
}

function getApiError(error) {
  const data = error?.response?.data;

  if (Array.isArray(data?.errors) && data.errors.length > 0) {
    return data.errors
      .map((item) => {
        const path = Array.isArray(item.path)
          ? item.path.join(".")
          : "";

        return path
          ? `${path}: ${item.message || "Invalid value"}`
          : item.message || "Invalid value";
      })
      .join(" | ");
  }

  if (typeof data?.message === "string" && data.message.trim()) {
    return data.message;
  }

  if (error?.response?.status) {
    return `Request failed with status ${error.response.status}.`;
  }

  return error?.message || "An unexpected error occurred.";
}

function SalesLoading() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="animate-pulse">
        <div className="h-14 border-b border-slate-200 bg-slate-50" />
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="grid grid-cols-6 gap-4 border-b border-slate-100 p-5"
          >
            {Array.from({ length: 6 }).map((__, i) => (
              <div key={i} className="h-4 rounded bg-slate-200" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function SaleDetailsModal({ sale, onClose }) {
  if (!sale) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Order Details
            </p>
            <h2 className="mt-1 text-xl font-bold text-slate-900">
              Order #{sale.id}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close order details"
            className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6 p-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-slate-500">
                <User size={16} />
                <span className="text-xs font-medium">Customer</span>
              </div>
              <p className="font-semibold text-slate-900">
                {sale.customer?.name || "Walk-in Customer"}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-slate-500">
                <ShoppingCart size={16} />
                <span className="text-xs font-medium">Status</span>
              </div>
              <StatusBadge status={sale.status} />
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-slate-500">
                <CalendarDays size={16} />
                <span className="text-xs font-medium">Date</span>
              </div>
              <p className="font-semibold text-slate-900">
                {formatDate(sale.createdAt)}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-slate-500">
                <Package size={16} />
                <span className="text-xs font-medium">Total</span>
              </div>
              <p className="font-bold text-slate-900">
                {formatCurrency(sale.totalAmount)}
              </p>
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-bold text-slate-900">
              Customer Information
            </h3>
            <div className="rounded-xl border border-slate-200 p-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs text-slate-500">Name</p>
                  <p className="mt-1 font-medium text-slate-900">
                    {sale.customer?.name || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Email</p>
                  <p className="mt-1 break-all font-medium text-slate-900">
                    {sale.customer?.email || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Phone</p>
                  <p className="mt-1 font-medium text-slate-900">
                    {sale.customer?.phone || "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-bold text-slate-900">
              Order Items
            </h3>
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <div className="hidden grid-cols-5 gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-500 sm:grid">
                <span className="col-span-2">Product</span>
                <span>Quantity</span>
                <span>Unit Price</span>
                <span>Subtotal</span>
              </div>

              {sale.items?.length ? (
                sale.items.map((item) => (
                  <div
                    key={item.id}
                    className="grid gap-3 border-b border-slate-100 px-4 py-4 last:border-b-0 sm:grid-cols-5 sm:gap-4"
                  >
                    <div className="sm:col-span-2">
                      <p className="text-xs text-slate-500 sm:hidden">
                        Product
                      </p>
                      <p className="font-medium text-slate-900">
                        {item.product?.name || `Product #${item.productId}`}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 sm:hidden">
                        Quantity
                      </p>
                      <p className="font-medium text-slate-900">
                        {item.quantity}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 sm:hidden">
                        Unit Price
                      </p>
                      <p className="font-medium text-slate-900">
                        {formatCurrency(item.unitPrice)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 sm:hidden">
                        Subtotal
                      </p>
                      <p className="font-semibold text-slate-900">
                        {formatCurrency(item.subtotal)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-sm text-slate-500">
                  No items found.
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-bold text-slate-900">
              Payment Information
            </h3>
            <div className="overflow-hidden rounded-xl border border-slate-200">
              {sale.payments?.length ? (
                sale.payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4 last:border-b-0"
                  >
                    <div>
                      <p className="font-medium text-slate-900">
                        {payment.method || "Payment"}
                      </p>
                      <p className="text-xs text-slate-500">
                        Status: {payment.status || "-"}
                      </p>
                    </div>
                    <p className="font-bold text-slate-900">
                      {formatCurrency(payment.amount)}
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-sm text-slate-500">
                  No payment information found.
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-slate-200 pt-4 text-xs text-slate-500">
            Created: {formatDateTime(sale.createdAt)}
          </div>
        </div>
      </div>
    </div>
  );
}

function CreateSaleModal({ token, onClose, onCreated }) {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [customerId, setCustomerId] = useState("");
  const [items, setItems] = useState([{ productId: "", quantity: "1" }]);
  const [loadingData, setLoadingData] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        setLoadingData(true);
        setError("");

        const config = {
          headers: { Authorization: `Bearer ${token}` },
        };

        const [customersResponse, productsResponse] = await Promise.all([
          API.get("/customers", config),
          API.get("/products", config),
        ]);

        if (!active) return;

        setCustomers(
          getList(customersResponse.data, ["customers", "data"])
        );

        setProducts(
          getList(productsResponse.data, ["products", "data"]).filter(
            (product) =>
              product.isActive !== false && Number(product.stock) > 0
          )
        );
      } catch (err) {
        console.error("Create sale: failed to load data", err.response?.data || err);

        if (active) {
          setError(
            getApiError(err) ||
              "Unable to load customers or products. Check API permissions."
          );
        }
      } finally {
        if (active) setLoadingData(false);
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, [token]);

  const updateItem = (index, field, value) => {
    setItems((current) =>
      current.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
    setError("");
  };

  const addItem = () => {
    setItems((current) => [
      ...current,
      { productId: "", quantity: "1" },
    ]);
    setError("");
  };

  const removeItem = (index) => {
    setItems((current) =>
      current.length <= 1
        ? current
        : current.filter((_, i) => i !== index)
    );
    setError("");
  };

  const estimatedTotal = useMemo(
    () =>
      items.reduce((total, item) => {
        const product = products.find(
          (p) => Number(p.id) === Number(item.productId)
        );

        return (
          total +
          Number(product?.price || 0) * Number(item.quantity || 0)
        );
      }, 0),
    [items, products]
  );

  const submitSale = async (event) => {
    event.preventDefault();

    if (creating) return;

    setError("");

    if (!token) {
      setError("Your session has expired. Please sign in again.");
      return;
    }

    if (!customerId || !Number.isInteger(Number(customerId)) || Number(customerId) <= 0) {
      setError("Please select a valid customer.");
      return;
    }

    const selectedItems = items.map((item) => ({
      productId: Number(item.productId),
      quantity: Number(item.quantity),
    }));

    if (
      selectedItems.some(
        (item) =>
          !Number.isInteger(item.productId) ||
          item.productId <= 0 ||
          !Number.isInteger(item.quantity) ||
          item.quantity <= 0
      )
    ) {
      setError("Select a product and a valid whole-number quantity for every item.");
      return;
    }

    if (
      new Set(selectedItems.map((item) => item.productId)).size !==
      selectedItems.length
    ) {
      setError(
        "A product cannot be added more than once. Change its quantity instead."
      );
      return;
    }

    for (const item of selectedItems) {
      const product = products.find(
        (p) => Number(p.id) === item.productId
      );

      if (!product) {
        setError("One of the selected products is unavailable. Refresh the page and try again.");
        return;
      }

      if (item.quantity > Number(product.stock)) {
        setError(
          `Insufficient stock for ${product.name}. Available: ${product.stock}.`
        );
        return;
      }
    }

    const payload = {
      customerId: Number(customerId),
      items: selectedItems,
    };

    try {
      setCreating(true);

      console.log("Creating sale with payload:", payload);

      const response = await API.post("/sales", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Create sale response:", response.data);

      await onCreated(response.data?.sale);
    } catch (err) {
      console.error("Create sale failed:", {
        status: err.response?.status,
        response: err.response?.data,
        payload,
      });

      setError(getApiError(err));
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Create Sale
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Select a customer and products for this sale.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={creating}
            aria-label="Close create sale dialog"
            className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={submitSale} className="space-y-5 p-6">
          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <span className="break-words">{error}</span>
            </div>
          )}

          {loadingData ? (
            <div className="flex items-center justify-center gap-3 py-10 text-sm text-slate-500">
              <RefreshCw size={18} className="animate-spin" />
              Loading customers and products...
            </div>
          ) : (
            <>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Customer
                </label>
                <select
                  required
                  value={customerId}
                  onChange={(e) => {
                    setCustomerId(e.target.value);
                    setError("");
                  }}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Select a customer</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                      {customer.email ? ` — ${customer.email}` : ""}
                    </option>
                  ))}
                </select>

                {customers.length === 0 && (
                  <p className="mt-2 text-xs text-amber-700">
                    No customers were returned by the API.
                  </p>
                )}
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900">
                    Products
                  </h3>
                  <button
                    type="button"
                    onClick={addItem}
                    disabled={products.length === 0}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 disabled:opacity-40"
                  >
                    <Plus size={16} />
                    Add product
                  </button>
                </div>

                {items.map((item, index) => {
                  const product = products.find(
                    (p) => Number(p.id) === Number(item.productId)
                  );

                  const availableProducts = products.filter(
                    (p) =>
                      Number(p.id) === Number(item.productId) ||
                      !items.some(
                        (other, otherIndex) =>
                          otherIndex !== index &&
                          Number(other.productId) === Number(p.id)
                      )
                  );

                  return (
                    <div
                      key={index}
                      className="mb-3 grid gap-3 rounded-xl border border-slate-200 p-3 sm:grid-cols-[minmax(0,1fr)_100px_auto]"
                    >
                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-500">
                          Product
                        </label>
                        <select
                          required
                          value={item.productId}
                          onChange={(e) =>
                            updateItem(index, "productId", e.target.value)
                          }
                          className="h-10 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm outline-none focus:border-blue-500"
                        >
                          <option value="">Select product</option>
                          {availableProducts.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} — {formatCurrency(p.price)} (Stock: {p.stock})
                            </option>
                          ))}
                        </select>

                        {product && (
                          <p className="mt-1 text-xs text-slate-500">
                            Subtotal:{" "}
                            {formatCurrency(
                              Number(product.price) * Number(item.quantity || 0)
                            )}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-500">
                          Quantity
                        </label>
                        <input
                          required
                          type="number"
                          min="1"
                          step="1"
                          max={product?.stock || undefined}
                          value={item.quantity}
                          onChange={(e) =>
                            updateItem(index, "quantity", e.target.value)
                          }
                          className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500"
                        />
                        {product && (
                          <p className="mt-1 text-xs text-slate-500">
                            Available: {product.stock}
                          </p>
                        )}
                      </div>

                      <div className="flex items-end">
                        <button
                          type="button"
                          title="Remove product"
                          aria-label="Remove product"
                          disabled={items.length === 1}
                          onClick={() => removeItem(index)}
                          className="flex h-10 items-center justify-center rounded-lg border border-slate-200 px-3 text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {products.length === 0 && (
                  <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
                    No active products with available stock were found.
                  </p>
                )}
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Estimated total</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {formatCurrency(estimatedTotal)}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  The backend calculates the final total using database prices.
                </p>
              </div>

              <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                Creating this sale will deduct stock and add a sales record.
              </div>
            </>
          )}

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={creating}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                loadingData ||
                creating ||
                customers.length === 0 ||
                products.length === 0
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creating && (
                <RefreshCw size={16} className="animate-spin" />
              )}
              {creating ? "Creating..." : "Create Sale"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Sales() {
  const { token } = useAuth();

  const [sales, setSales] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalSales: 0,
    totalPages: 1,
  });

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [selectedSale, setSelectedSale] = useState(null);
  const [showCreateSale, setShowCreateSale] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const fetchSales = async (page = 1, showRefresh = false) => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setError("");

      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const params = { page, limit: 10 };

      if (from) params.from = from;
      if (to) params.to = to;

      const response = await API.get("/sales", {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      const data = response.data || {};

      setSales(Array.isArray(data.sales) ? data.sales : []);
      setPagination(
        data.pagination || {
          page,
          limit: 10,
          totalSales: data.sales?.length || 0,
          totalPages: 1,
        }
      );
    } catch (err) {
      console.error("Sales fetch error:", err.response?.data || err);
      setError(getApiError(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSales(1);
  }, [token, from, to]);

  const filteredSales = useMemo(() => {
    const value = search.trim().toLowerCase();

    return sales.filter((sale) => {
      const matchesSearch =
        !value ||
        String(sale.id || "").toLowerCase().includes(value) ||
        String(sale.customer?.name || "").toLowerCase().includes(value) ||
        String(sale.customer?.email || "").toLowerCase().includes(value);

      const matchesStatus = status === "ALL" || sale.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [sales, search, status]);

  const totalAmount = useMemo(
    () =>
      filteredSales.reduce(
        (sum, sale) => sum + Number(sale.totalAmount || 0),
        0
      ),
    [filteredSales]
  );

  const clearFilters = () => {
    setSearch("");
    setStatus("ALL");
    setFrom("");
    setTo("");
  };

  const hasFilters = Boolean(search || status !== "ALL" || from || to);

  const handleSaleCreated = async (newSale) => {
    setShowCreateSale(false);
    setSuccessMessage(
      newSale?.id
        ? `Sale #${newSale.id} created successfully.`
        : "Sale created successfully."
    );

    await fetchSales(1, true);
  };

  return (
    <div className="space-y-6">
      {successMessage && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <span className="flex items-center gap-2">
            <CheckCircle2 size={18} />
            {successMessage}
          </span>
          <button
            type="button"
            onClick={() => setSuccessMessage("")}
            className="rounded-lg p-1 hover:bg-emerald-100"
            aria-label="Dismiss success message"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-medium text-blue-600">
            Sales Management
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Sales & Orders
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Track orders, customers, payments and sales activity.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setSuccessMessage("");
              setShowCreateSale(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus size={17} />
            Create Sale
          </button>

          <button
            type="button"
            onClick={() => fetchSales(pagination.page, true)}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={17}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Orders</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {pagination.totalSales || 0}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Current Page Sales
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {formatCurrency(totalAmount)}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Active Filters</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {hasFilters ? "Yes" : "No"}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex items-center gap-2">
          <Filter size={18} className="text-slate-500" />
          <h2 className="font-semibold text-slate-900">Filters</h2>
        </div>

        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_180px_180px_auto]">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search order, customer or email..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
          >
            <option value="ALL">All Statuses</option>
            <option value="COMPLETED">Completed</option>
            <option value="PENDING">Pending</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <div className="relative">
            <CalendarDays
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="relative">
            <CalendarDays
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <button
            type="button"
            onClick={clearFilters}
            className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Clear
          </button>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <span className="break-words">{error}</span>
          <button
            type="button"
            onClick={() => fetchSales(pagination.page, true)}
            className="shrink-0 font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <SalesLoading />
      ) : filteredSales.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
            <ShoppingCart size={25} className="text-slate-400" />
          </div>
          <h3 className="mt-4 text-lg font-bold text-slate-900">
            No sales found
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            There are no orders matching your current search or filters.
          </p>
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  {["Order", "Customer", "Amount", "Status", "Date"].map(
                    (heading) => (
                      <th
                        key={heading}
                        className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500"
                      >
                        {heading}
                      </th>
                    )
                  )}
                  <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredSales.map((sale) => (
                  <tr
                    key={sale.id}
                    className="border-b border-slate-100 transition hover:bg-slate-50/70 last:border-b-0"
                  >
                    <td className="px-5 py-4">
                      <span className="font-bold text-slate-900">
                        #{sale.id}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900">
                        {sale.customer?.name || "Walk-in Customer"}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {sale.customer?.email || "No email"}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-bold text-slate-900">
                        {formatCurrency(sale.totalAmount)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={sale.status} />
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-700">
                        {formatDate(sale.createdAt)}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {sale.createdAt
                          ? new Date(sale.createdAt).toLocaleTimeString(
                              "en-US",
                              { hour: "2-digit", minute: "2-digit" }
                            )
                          : "-"}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedSale(sale)}
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
            {filteredSales.map((sale) => (
              <div key={sale.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-slate-900">
                      Order #{sale.id}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {sale.customer?.name || "Walk-in Customer"}
                    </p>
                  </div>
                  <StatusBadge status={sale.status} />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-400">Amount</p>
                    <p className="mt-1 font-bold text-slate-900">
                      {formatCurrency(sale.totalAmount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Date</p>
                    <p className="mt-1 font-medium text-slate-700">
                      {formatDate(sale.createdAt)}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedSale(sale)}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <Eye size={16} />
                  View Order
                </button>
              </div>
            ))}
          </div>

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
                {pagination.totalSales || 0}
              </span>{" "}
              orders
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={(pagination.page || 1) <= 1}
                onClick={() => fetchSales(pagination.page - 1)}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={16} />
                Previous
              </button>

              <button
                type="button"
                disabled={
                  (pagination.page || 1) >= (pagination.totalPages || 1)
                }
                onClick={() => fetchSales(pagination.page + 1)}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedSale && (
        <SaleDetailsModal
          sale={selectedSale}
          onClose={() => setSelectedSale(null)}
        />
      )}

      {showCreateSale && (
        <CreateSaleModal
          token={token}
          onClose={() => setShowCreateSale(false)}
          onCreated={handleSaleCreated}
        />
      )}
    </div>
  );
}

export default Sales;
