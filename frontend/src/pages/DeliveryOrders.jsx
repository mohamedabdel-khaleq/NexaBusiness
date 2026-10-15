
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Eye,
  MapPin,
  Package,
  Plus,
  RefreshCw,
  Search,
  Truck,
  UserRound,
  X,
  AlertCircle,
} from "lucide-react";

import API from "../services/api";

const STATUS_OPTIONS = [
  "PENDING",
  "ASSIGNED",
  "PICKED_UP",
  "IN_TRANSIT",
  "DELIVERED",
  "CANCELLED",
];

const NEXT_STATUSES = {
  PENDING: ["ASSIGNED", "CANCELLED"],
  ASSIGNED: ["PICKED_UP", "CANCELLED"],
  PICKED_UP: ["IN_TRANSIT", "CANCELLED"],
  IN_TRANSIT: ["DELIVERED", "CANCELLED"],
  DELIVERED: [],
  CANCELLED: [],
};

const STATUS_STYLES = {
  PENDING: "bg-amber-50 text-amber-700 ring-amber-200",
  ASSIGNED: "bg-blue-50 text-blue-700 ring-blue-200",
  PICKED_UP: "bg-violet-50 text-violet-700 ring-violet-200",
  IN_TRANSIT: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  DELIVERED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  CANCELLED: "bg-rose-50 text-rose-700 ring-rose-200",
};

const EMPTY_FORM = {
  saleId: "",
  driverId: "",
  address: "",
  latitude: "",
  longitude: "",
  deliveryFee: "0",
  estimatedDeliveryTime: "",
  notes: "",
};

function getErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.message ||
    "Something went wrong. Please try again."
  );
}

function formatMoney(value) {
  const amount = Number(value ?? 0);

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
}

function formatDate(value) {
  if (!value) return "Not specified";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not specified";

  return date.toLocaleString();
}

function getOrderNumber(order) {
  return `DLV-${String(order?.id ?? "").padStart(4, "0")}`;
}

function getSaleCustomer(order) {
  return order?.sale?.customer?.name || "Unknown customer";
}

function StatusBadge({ status }) {
  const normalizedStatus = status || "PENDING";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ring-inset ${
        STATUS_STYLES[normalizedStatus] ||
        "bg-slate-100 text-slate-700 ring-slate-200"
      }`}
    >
      {normalizedStatus.replaceAll("_", " ")}
    </span>
  );
}

function StatCard({ title, value, description, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {value}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {description}
          </p>
        </div>

        <div className="rounded-xl bg-blue-50 p-3 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

function Field({ label, children, className = "" }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:disabled:bg-slate-800";

function DeliveryOrders() {
  const [orders, setOrders] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [sales, setSales] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [createOpen, setCreateOpen] = useState(false);
  const [detailsOrder, setDetailsOrder] = useState(null);
  const [tracking, setTracking] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);

  const [form, setForm] = useState(EMPTY_FORM);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const results = await Promise.allSettled([
        API.get("/delivery-orders"),
        API.get("/delivery-drivers"),
        API.get("/sales", { params: { page: 1, limit: 100 } }),
      ]);

      const [ordersResult, driversResult, salesResult] = results;

      if (ordersResult.status === "rejected") {
        throw ordersResult.reason;
      }

      const ordersData = ordersResult.value?.data?.deliveryOrders;
      setOrders(Array.isArray(ordersData) ? ordersData : []);

      if (driversResult.status === "fulfilled") {
        const driverData = driversResult.value?.data?.drivers;
        setDrivers(Array.isArray(driverData) ? driverData : []);
      }

      if (salesResult.status === "fulfilled") {
        const salesData = salesResult.value?.data?.sales;
        const existingDeliverySaleIds = new Set(
          (Array.isArray(ordersData) ? ordersData : []).map(
            (order) => Number(order.saleId)
          )
        );

        setSales(
          (Array.isArray(salesData) ? salesData : []).filter(
            (sale) =>
              sale.status === "COMPLETED" &&
              !existingDeliverySaleIds.has(Number(sale.id))
          )
        );
      } else {
        setSales([]);
      }
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const stats = useMemo(() => {
    return {
      total: orders.length,
      pending: orders.filter((order) => order.status === "PENDING").length,
      inProgress: orders.filter((order) =>
        ["ASSIGNED", "PICKED_UP", "IN_TRANSIT"].includes(order.status)
      ).length,
      delivered: orders.filter((order) => order.status === "DELIVERED").length,
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesStatus =
        statusFilter === "ALL" || order.status === statusFilter;

      const searchableText = [
        order.id,
        order.saleId,
        getOrderNumber(order),
        getSaleCustomer(order),
        order?.sale?.customer?.email,
        order?.sale?.customer?.phone,
        order?.driver?.name,
        order.address,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        matchesStatus &&
        (!normalizedSearch || searchableText.includes(normalizedSearch))
      );
    });
  }, [orders, search, statusFilter]);

  function updateForm(field, value) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  function openCreateModal() {
    setError("");
    setSuccess("");
    setForm(EMPTY_FORM);
    setCreateOpen(true);
  }

  async function handleCreateOrder(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.saleId) {
      setError("Please select a completed sale.");
      return;
    }

    if (form.address.trim().length < 5) {
      setError("Please enter a delivery address with at least 5 characters.");
      return;
    }

    const payload = {
      saleId: Number(form.saleId),
      address: form.address.trim(),
      deliveryFee: Number(form.deliveryFee || 0),
      status: "PENDING",
      notes: form.notes.trim(),
    };

    if (form.driverId) {
      payload.driverId = Number(form.driverId);
    }

    if (form.latitude !== "") {
      payload.latitude = Number(form.latitude);
    }

    if (form.longitude !== "") {
      payload.longitude = Number(form.longitude);
    }

    if (form.estimatedDeliveryTime) {
      payload.estimatedDeliveryTime = new Date(
        form.estimatedDeliveryTime
      ).toISOString();
    }

    if (
      payload.latitude !== undefined &&
      (payload.latitude < -90 || payload.latitude > 90)
    ) {
      setError("Latitude must be between -90 and 90.");
      return;
    }

    if (
      payload.longitude !== undefined &&
      (payload.longitude < -180 || payload.longitude > 180)
    ) {
      setError("Longitude must be between -180 and 180.");
      return;
    }

    if (
      !Number.isFinite(payload.deliveryFee) ||
      payload.deliveryFee < 0
    ) {
      setError("Delivery fee must be zero or greater.");
      return;
    }

    setSaving(true);

    try {
      await API.post("/delivery-orders", payload);
      setCreateOpen(false);
      setSuccess("Delivery order created successfully.");
      await loadData();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(order, nextStatus) {
    if (!nextStatus || nextStatus === order.status) return;

    setError("");
    setSuccess("");

    try {
      await API.put(`/delivery-orders/${order.id}`, {
        status: nextStatus,
      });

      setSuccess(`${getOrderNumber(order)} status updated successfully.`);
      await loadData();

      if (detailsOrder?.id === order.id) {
        const updated = await API.get(`/delivery-orders/${order.id}`);
        setDetailsOrder(updated.data?.deliveryOrder || order);
      }
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  }

  async function openTracking(order) {
    setTracking(null);
    setTrackingLoading(true);
    setError("");

    try {
      const response = await API.get(
        `/delivery-orders/${order.id}/tracking`
      );
      setTracking(response.data?.tracking || null);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setTrackingLoading(false);
    }
  }

  async function openDetails(order) {
    setError("");
    setDetailsOrder(order);

    try {
      const response = await API.get(`/delivery-orders/${order.id}`);
      setDetailsOrder(response.data?.deliveryOrder || order);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  }

  const availableSales = sales;

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <Truck size={16} />
            <span>Operations</span>
            <span>/</span>
            <span>Delivery</span>
          </div>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Delivery Orders
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage deliveries, drivers, and order progress in one place.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus size={17} />
            New delivery
          </button>
        </div>
      </div>

      {/* ALERTS */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300"
        >
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <div className="flex-1">{error}</div>
          <button type="button" onClick={() => setError("")} aria-label="Dismiss error">
            <X size={17} />
          </button>
        </div>
      )}

      {success && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300"
        >
          <CheckCircle2 size={18} className="shrink-0" />
          <span className="flex-1">{success}</span>
          <button type="button" onClick={() => setSuccess("")} aria-label="Dismiss success">
            <X size={17} />
          </button>
        </div>
      )}

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total deliveries"
          value={stats.total}
          description="All delivery orders"
          icon={Package}
        />
        <StatCard
          title="Pending"
          value={stats.pending}
          description="Waiting for assignment"
          icon={Clock3}
        />
        <StatCard
          title="In progress"
          value={stats.inProgress}
          description="Assigned or on the way"
          icon={Activity}
        />
        <StatCard
          title="Delivered"
          value={stats.delivered}
          description="Successfully completed"
          icon={CheckCircle2}
        />
      </div>

      {/* TABLE PANEL */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-4 dark:border-slate-800 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-bold text-slate-900 dark:text-white">
              All deliveries
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {filteredOrders.length} result
              {filteredOrders.length === 1 ? "" : "s"}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative min-w-0 sm:w-64">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search orders, customers..."
                className={`${inputClass} pl-9`}
                aria-label="Search delivery orders"
              />
            </div>

            <div className="relative sm:w-48">
              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className={`${inputClass} appearance-none pr-9`}
                aria-label="Filter by delivery status"
              >
                <option value="ALL">All statuses</option>
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-slate-500">
            <RefreshCw size={24} className="animate-spin text-blue-600" />
            <p className="text-sm">Loading delivery orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-5 text-center">
            <div className="rounded-2xl bg-slate-100 p-4 text-slate-500 dark:bg-slate-800">
              <Truck size={28} />
            </div>
            <h3 className="mt-4 font-semibold text-slate-900 dark:text-white">
              No delivery orders found
            </h3>
            <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
              {orders.length === 0
                ? "Create a delivery order from a completed sale to get started."
                : "Try changing your search or status filter."}
            </p>
            {orders.length === 0 && (
              <button
                type="button"
                onClick={openCreateModal}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <Plus size={16} />
                Create delivery
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 dark:bg-slate-950/60 dark:text-slate-400">
                <tr>
                  <th className="px-5 py-4 font-semibold">Delivery</th>
                  <th className="px-5 py-4 font-semibold">Customer</th>
                  <th className="px-5 py-4 font-semibold">Driver</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 font-semibold">Fee</th>
                  <th className="px-5 py-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="transition hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                  >
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-900 dark:text-white">
                        {getOrderNumber(order)}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Sale #{order.saleId ?? order.sale?.id ?? "—"}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {formatDate(order.createdAt)}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-start gap-2">
                        <UserRound size={16} className="mt-0.5 shrink-0 text-slate-400" />
                        <div>
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                            {getSaleCustomer(order)}
                          </p>
                          <p className="mt-1 max-w-56 truncate text-xs text-slate-500">
                            {order.address || "No address"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      {order.driver ? (
                        <>
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                            {order.driver.name}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {order.driver.phone || "No phone"}
                          </p>
                        </>
                      ) : (
                        <span className="text-xs text-slate-400">
                          Not assigned
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge status={order.status} />
                    </td>

                    <td className="px-5 py-4 text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {formatMoney(order.deliveryFee)}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openDetails(order)}
                          title="View details"
                          aria-label={`View ${getOrderNumber(order)}`}
                          className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-blue-500/10"
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() => openTracking(order)}
                          title="View tracking"
                          aria-label={`Track ${getOrderNumber(order)}`}
                          className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-indigo-500/10"
                        >
                          <MapPin size={16} />
                        </button>

                        {NEXT_STATUSES[order.status]?.length > 0 && (
                          <select
                            aria-label={`Update status for ${getOrderNumber(order)}`}
                            value=""
                            onChange={(event) =>
                              handleStatusChange(order, event.target.value)
                            }
                            className="max-w-36 rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs font-medium text-slate-700 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                          >
                            <option value="">Update status</option>
                            {NEXT_STATUSES[order.status].map((status) => (
                              <option key={status} value={status}>
                                {status.replaceAll("_", " ")}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* CREATE DELIVERY MODAL */}
      {createOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) {
              setCreateOpen(false);
            }
          }}
        >
          <div className="my-8 w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800 sm:px-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Create delivery order
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Select a completed sale and enter delivery details.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                disabled={saving}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                aria-label="Close dialog"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-5 p-5 sm:p-6">
              {availableSales.length === 0 && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300">
                  No eligible sales are available. A sale must be COMPLETED and
                  must not already have a delivery order.
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Completed sale *">
                  <select
                    required
                    value={form.saleId}
                    onChange={(event) => {
                      const selectedSale = availableSales.find(
                        (sale) => String(sale.id) === event.target.value
                      );

                      updateForm("saleId", event.target.value);

                      if (
                        selectedSale?.customer?.address &&
                        !form.address.trim()
                      ) {
                        updateForm(
                          "address",
                          selectedSale.customer.address
                        );
                      }
                    }}
                    disabled={saving || availableSales.length === 0}
                    className={inputClass}
                  >
                    <option value="">Select a sale</option>
                    {availableSales.map((sale) => (
                      <option key={sale.id} value={sale.id}>
                        Sale #{sale.id} —{" "}
                        {sale.customer?.name || "Unknown customer"} —{" "}
                        {formatMoney(sale.totalAmount)}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Delivery driver">
                  <select
                    value={form.driverId}
                    onChange={(event) =>
                      updateForm("driverId", event.target.value)
                    }
                    disabled={saving}
                    className={inputClass}
                  >
                    <option value="">Assign later</option>
                    {drivers
                      .filter((driver) => driver.isActive)
                      .map((driver) => (
                        <option key={driver.id} value={driver.id}>
                          {driver.name} — {driver.phone}
                        </option>
                      ))}
                  </select>
                </Field>

                <Field label="Delivery address *" className="sm:col-span-2">
                  <input
                    required
                    minLength={5}
                    value={form.address}
                    onChange={(event) =>
                      updateForm("address", event.target.value)
                    }
                    placeholder="Enter the complete delivery address"
                    className={inputClass}
                    disabled={saving}
                  />
                </Field>

                <Field label="Delivery fee">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.deliveryFee}
                    onChange={(event) =>
                      updateForm("deliveryFee", event.target.value)
                    }
                    className={inputClass}
                    disabled={saving}
                  />
                </Field>

                <Field label="Estimated delivery">
                  <input
                    type="datetime-local"
                    value={form.estimatedDeliveryTime}
                    onChange={(event) =>
                      updateForm("estimatedDeliveryTime", event.target.value)
                    }
                    className={inputClass}
                    disabled={saving}
                  />
                </Field>

                <Field label="Latitude (optional)">
                  <input
                    type="number"
                    min="-90"
                    max="90"
                    step="any"
                    value={form.latitude}
                    onChange={(event) =>
                      updateForm("latitude", event.target.value)
                    }
                    placeholder="e.g. 31.0409"
                    className={inputClass}
                    disabled={saving}
                  />
                </Field>

                <Field label="Longitude (optional)">
                  <input
                    type="number"
                    min="-180"
                    max="180"
                    step="any"
                    value={form.longitude}
                    onChange={(event) =>
                      updateForm("longitude", event.target.value)
                    }
                    placeholder="e.g. 31.3785"
                    className={inputClass}
                    disabled={saving}
                  />
                </Field>

                <Field label="Notes (optional)" className="sm:col-span-2">
                  <textarea
                    rows={3}
                    value={form.notes}
                    onChange={(event) =>
                      updateForm("notes", event.target.value)
                    }
                    placeholder="Delivery instructions or notes..."
                    className={inputClass}
                    disabled={saving}
                  />
                </Field>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-4 dark:border-slate-800 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setCreateOpen(false)}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving || availableSales.length === 0}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving && <RefreshCw size={16} className="animate-spin" />}
                  {saving ? "Creating..." : "Create delivery"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAILS MODAL */}
      {detailsOrder && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setDetailsOrder(null);
            }
          }}
        >
          <div className="my-8 w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800 sm:px-6">
              <div>
                <p className="text-xs font-medium text-slate-500">
                  Delivery details
                </p>
                <h2 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                  {getOrderNumber(detailsOrder)}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setDetailsOrder(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                aria-label="Close details"
              >
                <X size={19} />
              </button>
            </div>

            <div className="space-y-5 p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <StatusBadge status={detailsOrder.status} />
                <span className="text-sm text-slate-500">
                  Created {formatDate(detailsOrder.createdAt)}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
                  <p className="text-xs text-slate-500">Customer</p>
                  <p className="mt-1 font-semibold text-slate-900 dark:text-white">
                    {getSaleCustomer(detailsOrder)}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {detailsOrder?.sale?.customer?.phone || "No phone"}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
                  <p className="text-xs text-slate-500">Delivery fee</p>
                  <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                    {formatMoney(detailsOrder.deliveryFee)}
                  </p>
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Delivery address
                </p>
                <div className="flex items-start gap-2 rounded-xl border border-slate-200 p-3 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">
                  <MapPin size={17} className="mt-0.5 shrink-0 text-blue-500" />
                  <span>{detailsOrder.address || "No address provided"}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-slate-500">Assigned driver</p>
                  <p className="mt-1 font-medium text-slate-900 dark:text-white">
                    {detailsOrder.driver?.name || "Not assigned"}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {detailsOrder.driver?.phone || ""}
                  </p>
                  {detailsOrder.driver?.vehicleNumber && (
                    <p className="mt-1 text-sm text-slate-500">
                      Vehicle: {detailsOrder.driver.vehicleNumber}
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-xs text-slate-500">Estimated delivery</p>
                  <p className="mt-1 font-medium text-slate-900 dark:text-white">
                    {formatDate(detailsOrder.estimatedDeliveryTime)}
                  </p>
                </div>
              </div>

              {detailsOrder.notes && (
                <div>
                  <p className="mb-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Notes
                  </p>
                  <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600 dark:bg-slate-950 dark:text-slate-300">
                    {detailsOrder.notes}
                  </p>
                </div>
              )}

              {Array.isArray(detailsOrder.sale?.items) &&
                detailsOrder.sale.items.length > 0 && (
                  <div>
                    <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-white">
                      Sale items
                    </h3>
                    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-xs text-slate-500 dark:bg-slate-950">
                          <tr>
                            <th className="px-3 py-2">Product</th>
                            <th className="px-3 py-2">Qty</th>
                            <th className="px-3 py-2">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {detailsOrder.sale.items.map((item) => (
                            <tr key={item.id}>
                              <td className="px-3 py-2 text-slate-800 dark:text-slate-200">
                                {item.product?.name || `Product #${item.productId}`}
                              </td>
                              <td className="px-3 py-2 text-slate-600 dark:text-slate-300">
                                {item.quantity}
                              </td>
                              <td className="px-3 py-2 text-slate-600 dark:text-slate-300">
                                {formatMoney(item.subtotal)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-4 dark:border-slate-800 sm:flex-row sm:justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setDetailsOrder(null);
                    openTracking(detailsOrder);
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <MapPin size={16} />
                  View tracking
                </button>

                <button
                  type="button"
                  onClick={() => setDetailsOrder(null)}
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TRACKING MODAL */}
      {(tracking || trackingLoading) && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !trackingLoading) {
              setTracking(null);
            }
          }}
        >
          <div className="my-8 w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
              <div>
                <h2 className="font-bold text-slate-900 dark:text-white">
                  Delivery tracking
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Latest recorded delivery status and driver location.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTracking(null)}
                disabled={trackingLoading}
                aria-label="Close tracking"
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            {trackingLoading ? (
              <div className="flex min-h-48 items-center justify-center gap-3 text-sm text-slate-500">
                <RefreshCw size={19} className="animate-spin text-blue-600" />
                Loading tracking...
              </div>
            ) : tracking ? (
              <div className="space-y-5 p-5">
                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
                  <div>
                    <p className="text-xs text-slate-500">Order status</p>
                    <div className="mt-2">
                      <StatusBadge status={tracking.status} />
                    </div>
                  </div>
                  <Truck size={26} className="text-blue-600" />
                </div>

                <div>
                  <p className="text-xs text-slate-500">Delivery address</p>
                  <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">
                    {tracking.address || "Not specified"}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    <UserRound size={18} className="text-blue-600" />
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      Driver information
                    </h3>
                  </div>

                  {tracking.driver ? (
                    <div className="mt-3 space-y-2 text-sm">
                      <p className="font-medium text-slate-800 dark:text-slate-200">
                        {tracking.driver.name}
                      </p>
                      <p className="text-slate-500">
                        {tracking.driver.phone || "No phone"}
                      </p>
                      <p className="text-slate-500">
                        Vehicle:{" "}
                        {[
                          tracking.driver.vehicleType,
                          tracking.driver.vehicleNumber,
                        ]
                          .filter(Boolean)
                          .join(" · ") || "Not specified"}
                      </p>

                      <div className="mt-3 rounded-lg bg-slate-50 p-3 dark:bg-slate-950">
                        <p className="text-xs text-slate-500">
                          Last recorded coordinates
                        </p>
                        {tracking.driver.latitude != null &&
                        tracking.driver.longitude != null ? (
                          <>
                            <p className="mt-1 font-mono text-sm text-slate-800 dark:text-slate-200">
                              {tracking.driver.latitude},{" "}
                              {tracking.driver.longitude}
                            </p>
                            <a
                              href={`https://www.google.com/maps?q=${tracking.driver.latitude},${tracking.driver.longitude}`}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-2 inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-700"
                            >
                              <MapPin size={14} />
                              Open location in Maps
                            </a>
                          </>
                        ) : (
                          <p className="mt-1 text-sm text-slate-500">
                            No location has been recorded yet.
                          </p>
                        )}

                        <p className="mt-2 text-xs text-slate-400">
                          Last update:{" "}
                          {formatDate(tracking.driver.locationUpdatedAt)}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-slate-500">
                      No driver is assigned to this delivery.
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
                    <p className="text-xs text-slate-500">Delivery fee</p>
                    <p className="mt-1 font-bold text-slate-900 dark:text-white">
                      {formatMoney(tracking.deliveryFee)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
                    <p className="text-xs text-slate-500">Estimated arrival</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                      {formatDate(tracking.estimatedDeliveryTime)}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setTracking(null)}
                  className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Close tracking
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

export default DeliveryOrders;
