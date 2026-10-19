
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Edit3,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  Truck,
  UserRound,
  Users,
  X,
  Trash2,
  Phone,
  Bike,
} from "lucide-react";

import API from "../services/api";

const EMPTY_FORM = {
  name: "",
  phone: "",
  vehicleType: "",
  vehicleNumber: "",
  isActive: true,
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:disabled:bg-slate-800";

function getErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "Something went wrong. Please try again."
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </span>
      {children}
    </label>
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

function ActiveBadge({ isActive }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${
        isActive
          ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
          : "bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isActive ? "bg-emerald-500" : "bg-slate-400"
        }`}
      />
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}

function DeliveryDrivers() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [workingId, setWorkingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const loadDrivers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await API.get("/delivery-drivers");
      const data = response.data?.drivers;

      setDrivers(Array.isArray(data) ? data : []);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDrivers();
  }, [loadDrivers]);

  const stats = useMemo(
    () => ({
      total: drivers.length,
      active: drivers.filter((driver) => driver.isActive).length,
      inactive: drivers.filter((driver) => !driver.isActive).length,
      assigned: drivers.filter(
        (driver) =>
          Array.isArray(driver.deliveryOrders) &&
          driver.deliveryOrders.some(
            (order) =>
              !["DELIVERED", "CANCELLED"].includes(order.status)
          )
      ).length,
    }),
    [drivers]
  );

  const filteredDrivers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return drivers.filter((driver) => {
      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && driver.isActive) ||
        (statusFilter === "INACTIVE" && !driver.isActive);

      const searchableText = [
        driver.name,
        driver.phone,
        driver.vehicleType,
        driver.vehicleNumber,
        driver.id,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesStatus && (!query || searchableText.includes(query));
    });
  }, [drivers, search, statusFilter]);

  function updateForm(field, value) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  function openCreateModal() {
    setError("");
    setSuccess("");
    setEditingDriver(null);
    setForm({ ...EMPTY_FORM });
    setModalOpen(true);
  }

  function openEditModal(driver) {
    setError("");
    setSuccess("");
    setEditingDriver(driver);
    setForm({
      name: driver.name || "",
      phone: driver.phone || "",
      vehicleType: driver.vehicleType || "",
      vehicleNumber: driver.vehicleNumber || "",
      isActive: Boolean(driver.isActive),
    });
    setModalOpen(true);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const name = form.name.trim();
    const phone = form.phone.trim();

    if (name.length < 2) {
      setError("Driver name must contain at least 2 characters.");
      return;
    }

    if (phone.length < 7) {
      setError("Please enter a valid phone number.");
      return;
    }

    const payload = {
      name,
      phone,
      vehicleType: form.vehicleType.trim(),
      vehicleNumber: form.vehicleNumber.trim(),
      isActive: Boolean(form.isActive),
    };

    setSaving(true);

    try {
      if (editingDriver) {
        await API.put(`/delivery-drivers/${editingDriver.id}`, payload);
        setSuccess("Driver updated successfully.");
      } else {
        await API.post("/delivery-drivers", payload);
        setSuccess("Driver created successfully.");
      }

      setModalOpen(false);
      setEditingDriver(null);
      setForm({ ...EMPTY_FORM });
      await loadDrivers();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(driver) {
    const nextActive = !driver.isActive;

    const confirmed = window.confirm(
      `${nextActive ? "Activate" : "Deactivate"} ${driver.name}?`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");
    setWorkingId(driver.id);

    try {
      await API.put(`/delivery-drivers/${driver.id}`, {
        name: driver.name,
        phone: driver.phone,
        vehicleType: driver.vehicleType || "",
        vehicleNumber: driver.vehicleNumber || "",
        isActive: nextActive,
      });

      setSuccess(
        `${driver.name} has been ${nextActive ? "activated" : "deactivated"}.`
      );

      await loadDrivers();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setWorkingId(null);
    }
  }

  async function handleDelete(driver) {
    const hasDeliveries =
      Array.isArray(driver.deliveryOrders) &&
      driver.deliveryOrders.length > 0;

    if (hasDeliveries) {
      setError(
        "This driver has delivery orders and cannot be deleted. Deactivate the driver instead."
      );
      return;
    }

    const confirmed = window.confirm(
      `Delete driver "${driver.name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");
    setWorkingId(driver.id);

    try {
      await API.delete(`/delivery-drivers/${driver.id}`);
      setSuccess("Driver deleted successfully.");
      await loadDrivers();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setWorkingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <Truck size={16} />
            <span>Operations</span>
            <span>/</span>
            <span>Delivery</span>
            <span>/</span>
            <span>Drivers</span>
          </div>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Delivery Drivers
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage your drivers, vehicle details, and availability.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={loadDrivers}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus size={17} />
            Add driver
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300"
        >
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <div className="flex-1">{error}</div>
          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Dismiss error"
          >
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
          <button
            type="button"
            onClick={() => setSuccess("")}
            aria-label="Dismiss success"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total drivers"
          value={stats.total}
          description="All registered drivers"
          icon={Users}
        />
        <StatCard
          title="Active drivers"
          value={stats.active}
          description="Available for assignment"
          icon={CheckCircle2}
        />
        <StatCard
          title="Inactive drivers"
          value={stats.inactive}
          description="Currently unavailable"
          icon={Clock3}
        />
        <StatCard
          title="With active deliveries"
          value={stats.assigned}
          description="Drivers with ongoing orders"
          icon={Truck}
        />
      </div>

      {/* Drivers table */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-4 dark:border-slate-800 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-bold text-slate-900 dark:text-white">
              All drivers
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {filteredDrivers.length} result
              {filteredDrivers.length === 1 ? "" : "s"}
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
                placeholder="Search drivers..."
                className={`${inputClass} pl-9`}
                aria-label="Search drivers"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className={`${inputClass} sm:w-44`}
              aria-label="Filter drivers by status"
            >
              <option value="ALL">All drivers</option>
              <option value="ACTIVE">Active only</option>
              <option value="INACTIVE">Inactive only</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-slate-500">
            <RefreshCw size={24} className="animate-spin text-blue-600" />
            <p className="text-sm">Loading drivers...</p>
          </div>
        ) : filteredDrivers.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-5 text-center">
            <div className="rounded-2xl bg-slate-100 p-4 text-slate-500 dark:bg-slate-800">
              <Truck size={28} />
            </div>
            <h3 className="mt-4 font-semibold text-slate-900 dark:text-white">
              No drivers found
            </h3>
            <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
              {drivers.length === 0
                ? "Add your first delivery driver to start assigning orders."
                : "Try changing your search or filter."}
            </p>
            {drivers.length === 0 && (
              <button
                type="button"
                onClick={openCreateModal}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <Plus size={16} />
                Add first driver
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 dark:bg-slate-950/60 dark:text-slate-400">
                <tr>
                  <th className="px-5 py-4 font-semibold">Driver</th>
                  <th className="px-5 py-4 font-semibold">Contact</th>
                  <th className="px-5 py-4 font-semibold">Vehicle</th>
                  <th className="px-5 py-4 font-semibold">Deliveries</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 text-right font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredDrivers.map((driver) => (
                  <tr
                    key={driver.id}
                    className="transition hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                          <UserRound size={19} />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {driver.name}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            Driver #{driver.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                        <Phone size={15} className="text-slate-400" />
                        {driver.phone || "No phone"}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                        <Bike size={17} className="text-slate-400" />
                        <div>
                          <p>{driver.vehicleType || "Not specified"}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {driver.vehicleNumber || "No plate number"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                        <Truck size={14} />
                        {Array.isArray(driver.deliveryOrders)
                          ? driver.deliveryOrders.length
                          : 0}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <ActiveBadge isActive={driver.isActive} />
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(driver)}
                          disabled={workingId === driver.id}
                          title="Edit driver"
                          aria-label={`Edit ${driver.name}`}
                          className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-blue-500/10"
                        >
                          <Edit3 size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleActive(driver)}
                          disabled={workingId === driver.id}
                          title={driver.isActive ? "Deactivate" : "Activate"}
                          className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                          {workingId === driver.id
                            ? "Please wait..."
                            : driver.isActive
                              ? "Deactivate"
                              : "Activate"}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(driver)}
                          disabled={workingId === driver.id}
                          title="Delete driver"
                          aria-label={`Delete ${driver.name}`}
                          className="rounded-lg border border-rose-200 p-2 text-rose-600 transition hover:bg-rose-50 disabled:opacity-50 dark:border-rose-900/60 dark:hover:bg-rose-950/30"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Create/Edit modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) {
              setModalOpen(false);
            }
          }}
        >
          <div className="my-8 w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800 sm:px-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {editingDriver ? "Edit driver" : "Add delivery driver"}
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Enter the driver's contact and vehicle details.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setModalOpen(false)}
                disabled={saving}
                aria-label="Close dialog"
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50 dark:hover:bg-slate-800"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Full name *">
                  <input
                    required
                    minLength={2}
                    maxLength={100}
                    value={form.name}
                    onChange={(event) =>
                      updateForm("name", event.target.value)
                    }
                    placeholder="Enter driver's name"
                    className={inputClass}
                    disabled={saving}
                  />
                </Field>

                <Field label="Phone number *">
                  <input
                    required
                    minLength={7}
                    maxLength={30}
                    type="tel"
                    value={form.phone}
                    onChange={(event) =>
                      updateForm("phone", event.target.value)
                    }
                    placeholder="Enter phone number"
                    className={inputClass}
                    disabled={saving}
                  />
                </Field>

                <Field label="Vehicle type">
                  <input
                    maxLength={100}
                    value={form.vehicleType}
                    onChange={(event) =>
                      updateForm("vehicleType", event.target.value)
                    }
                    placeholder="e.g. Motorcycle, Car, Van"
                    className={inputClass}
                    disabled={saving}
                  />
                </Field>

                <Field label="Vehicle number">
                  <input
                    maxLength={50}
                    value={form.vehicleNumber}
                    onChange={(event) =>
                      updateForm("vehicleNumber", event.target.value)
                    }
                    placeholder="Enter plate number"
                    className={inputClass}
                    disabled={saving}
                  />
                </Field>

                <div className="sm:col-span-2">
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(event) =>
                        updateForm("isActive", event.target.checked)
                      }
                      disabled={saving}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>
                      <span className="block text-sm font-semibold text-slate-900 dark:text-white">
                        Active driver
                      </span>
                      <span className="mt-1 block text-xs text-slate-500">
                        Active drivers can be selected when creating a delivery.
                      </span>
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-4 dark:border-slate-800 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving && (
                    <RefreshCw size={16} className="animate-spin" />
                  )}
                  {saving
                    ? "Saving..."
                    : editingDriver
                      ? "Save changes"
                      : "Create driver"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DeliveryDrivers;
