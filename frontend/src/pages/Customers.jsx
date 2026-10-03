import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Edit,
  Eye,
  Mail,
  MapPin,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  User,
  Users,
  X,
} from "lucide-react";

import API from "../services/api";
import { useAuth } from "../context/AuthContext";

function formatDate(date) {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function CustomerLoading() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="animate-pulse">
        <div className="h-14 border-b border-slate-200 bg-slate-50" />

        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="grid grid-cols-5 gap-4 border-b border-slate-100 p-5"
          >
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

function CustomerModal({
  customer,
  mode,
  token,
  onClose,
  onSuccess,
}) {
  const isView = mode === "view";
  const isEdit = mode === "edit";

  const [form, setForm] = useState({
    name: customer?.name || "",
    email: customer?.email || "",
    phone: customer?.phone || "",
    address: customer?.address || "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!form.name.trim()) {
      setError("Customer name is required.");
      return;
    }

    if (!form.email.trim()) {
      setError("Customer email is required.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
      };

      if (isEdit) {
        await API.put(
          `/customers/${customer.id}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        await API.post("/customers", payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }

      onSuccess();
    } catch (err) {
      console.error("Customer save error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to save customer. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
          <div>
            <p className="text-sm font-medium text-blue-600">
              Customers
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900">
              {isView
                ? "Customer Details"
                : isEdit
                ? "Edit Customer"
                : "Add Customer"}
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

        {isView ? (
          <div className="space-y-5 p-6">
            <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                <User size={26} />
              </div>

              <div className="min-w-0">
                <h3 className="truncate text-lg font-bold text-slate-900">
                  {customer?.name || "-"}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Customer #{customer?.id}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3 rounded-xl border border-slate-200 p-4">
                <Mail
                  size={18}
                  className="mt-0.5 shrink-0 text-slate-400"
                />

                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-500">
                    Email
                  </p>

                  <p className="mt-1 break-all font-medium text-slate-900">
                    {customer?.email || "-"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-slate-200 p-4">
                <Phone
                  size={18}
                  className="mt-0.5 shrink-0 text-slate-400"
                />

                <div>
                  <p className="text-xs font-medium text-slate-500">
                    Phone
                  </p>

                  <p className="mt-1 font-medium text-slate-900">
                    {customer?.phone || "-"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-slate-200 p-4">
                <MapPin
                  size={18}
                  className="mt-0.5 shrink-0 text-slate-400"
                />

                <div>
                  <p className="text-xs font-medium text-slate-500">
                    Address
                  </p>

                  <p className="mt-1 font-medium text-slate-900">
                    {customer?.address || "-"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-medium text-slate-500">
                    Customer ID
                  </p>

                  <p className="mt-1 font-bold text-slate-900">
                    #{customer?.id}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-medium text-slate-500">
                    Created
                  </p>

                  <p className="mt-1 font-bold text-slate-900">
                    {formatDate(customer?.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 p-6">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Name
              </label>

              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter customer name"
                disabled={submitting}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Email
              </label>

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="customer@example.com"
                disabled={submitting}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Phone
              </label>

              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
                disabled={submitting}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Address
              </label>

              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Enter customer address"
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
                  <RefreshCw
                    size={16}
                    className="animate-spin"
                  />
                )}

                {submitting
                  ? "Saving..."
                  : isEdit
                  ? "Save Changes"
                  : "Add Customer"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function DeleteCustomerModal({
  customer,
  token,
  onClose,
  onSuccess,
}) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    try {
      setDeleting(true);
      setError("");

      await API.delete(`/customers/${customer.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      onSuccess();
    } catch (err) {
      console.error("Delete customer error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to delete customer."
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <Trash2 size={22} />
          </div>

          <h2 className="mt-5 text-xl font-bold text-slate-900">
            Delete Customer?
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-slate-700">
              {customer?.name}
            </span>
            ? This action cannot be undone.
          </p>

          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700">
              {error}
            </div>
          )}

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              onClick={onClose}
              disabled={deleting}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {deleting && (
                <RefreshCw
                  size={16}
                  className="animate-spin"
                />
              )}

              {deleting ? "Deleting..." : "Delete Customer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Customers() {
  const { token } = useAuth();

  const [customers, setCustomers] = useState([]);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalCustomers: 0,
    totalPages: 1,
  });

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [modal, setModal] = useState({
    open: false,
    mode: "add",
    customer: null,
  });

  const [deleteCustomer, setDeleteCustomer] = useState(null);

  const fetchCustomers = async (
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

      const response = await API.get("/customers", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          page,
          limit: 10,
          ...(search.trim()
            ? {
                search: search.trim(),
              }
            : {}),
        },
      });

      const data = response.data;

      setCustomers(data.customers || []);

      setPagination(
        data.pagination || {
          page,
          limit: 10,
          totalCustomers: data.customers?.length || 0,
          totalPages: 1,
        }
      );
    } catch (err) {
      console.error("Customers fetch error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load customers. Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [token, search]);

  const openAddModal = () => {
    setModal({
      open: true,
      mode: "add",
      customer: null,
    });
  };

  const openViewModal = (customer) => {
    setModal({
      open: true,
      mode: "view",
      customer,
    });
  };

  const openEditModal = (customer) => {
    setModal({
      open: true,
      mode: "edit",
      customer,
    });
  };

  const closeModal = () => {
    setModal({
      open: false,
      mode: "add",
      customer: null,
    });
  };

  const handleCustomerSuccess = async () => {
    closeModal();

    await fetchCustomers(pagination.page, true);
  };

  const handleDeleteSuccess = async () => {
    setDeleteCustomer(null);

    const currentPage = pagination.page || 1;

    const shouldGoBack =
      customers.length === 1 && currentPage > 1;

    await fetchCustomers(
      shouldGoBack ? currentPage - 1 : currentPage,
      true
    );
  };

  const clearSearch = () => {
    setSearch("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-medium text-blue-600">
            Customer Management
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Customers
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage customer information and relationships.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            onClick={() =>
              fetchCustomers(pagination.page, true)
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
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus size={18} />
            Add Customer
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              Total Customers
            </p>

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Users size={18} />
            </div>
          </div>

          <p className="mt-3 text-2xl font-bold text-slate-900">
            {pagination.totalCustomers || 0}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Customers in the system
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              Current Page
            </p>

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <User size={18} />
            </div>
          </div>

          <p className="mt-3 text-2xl font-bold text-slate-900">
            {customers.length}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Customers displayed
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              Current Page
            </p>

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <Search size={18} />
            </div>
          </div>

          <p className="mt-3 text-2xl font-bold text-slate-900">
            {pagination.page || 1}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            of {pagination.totalPages || 1} pages
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email or phone..."
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-12 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />

          {search && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition hover:bg-slate-200 hover:text-slate-700"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>

          <button
            onClick={() =>
              fetchCustomers(pagination.page, true)
            }
            className="font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Customers Table */}
      {loading ? (
        <CustomerLoading />
      ) : customers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
            <Users size={25} className="text-slate-400" />
          </div>

          <h3 className="mt-4 text-lg font-bold text-slate-900">
            No customers found
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            {search
              ? "No customers match your search."
              : "There are no customers in the system yet."}
          </p>

          {search ? (
            <button
              onClick={clearSearch}
              className="mt-5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Clear Search
            </button>
          ) : (
            <button
              onClick={openAddModal}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <Plus size={17} />
              Add Customer
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-slate-500" />

              <h2 className="font-semibold text-slate-900">
                Customer List
              </h2>
            </div>

            <span className="text-sm text-slate-500">
              {customers.length} shown
            </span>
          </div>

          {/* Desktop */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    Customer
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    Email
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    Phone
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    Created
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {customers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="border-b border-slate-100 transition hover:bg-slate-50/70 last:border-b-0"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                          <User size={18} />
                        </div>

                        <div>
                          <p className="font-semibold text-slate-900">
                            {customer.name}
                          </p>

                          <p className="mt-0.5 text-xs text-slate-500">
                            Customer #{customer.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Mail
                          size={15}
                          className="text-slate-400"
                        />

                        <span className="text-sm text-slate-700">
                          {customer.email}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Phone
                          size={15}
                          className="text-slate-400"
                        />

                        <span className="text-sm text-slate-700">
                          {customer.phone || "-"}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="text-sm font-medium text-slate-700">
                        {formatDate(customer.createdAt)}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() =>
                            openViewModal(customer)
                          }
                          title="View customer"
                          className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          onClick={() =>
                            openEditModal(customer)
                          }
                          title="Edit customer"
                          className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700"
                        >
                          <Edit size={16} />
                        </button>

                        <button
                          onClick={() =>
                            setDeleteCustomer(customer)
                          }
                          title="Delete customer"
                          className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
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

          {/* Mobile */}
          <div className="divide-y divide-slate-100 md:hidden">
            {customers.map((customer) => (
              <div key={customer.id} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <User size={19} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-slate-900">
                          {customer.name}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Customer #{customer.id}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Mail
                          size={15}
                          className="shrink-0 text-slate-400"
                        />

                        <span className="break-all">
                          {customer.email}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Phone
                          size={15}
                          className="shrink-0 text-slate-400"
                        />

                        <span>
                          {customer.phone || "-"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <MapPin
                          size={15}
                          className="shrink-0 text-slate-400"
                        />

                        <span className="truncate">
                          {customer.address || "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  <button
                    onClick={() =>
                      openViewModal(customer)
                    }
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    <Eye size={14} />
                    View
                  </button>

                  <button
                    onClick={() =>
                      openEditModal(customer)
                    }
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    <Edit size={14} />
                    Edit
                  </button>

                  <button
                    onClick={() =>
                      setDeleteCustomer(customer)
                    }
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-100 py-2.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
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
                {pagination.totalCustomers || 0}
              </span>{" "}
              customers
            </p>

            <div className="flex items-center gap-2">
              <button
                disabled={(pagination.page || 1) <= 1}
                onClick={() =>
                  fetchCustomers(pagination.page - 1)
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
                  fetchCustomers(pagination.page + 1)
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

      {/* Add / Edit / View Modal */}
      {modal.open && (
        <CustomerModal
          customer={modal.customer}
          mode={modal.mode}
          token={token}
          onClose={closeModal}
          onSuccess={handleCustomerSuccess}
        />
      )}

      {/* Delete Modal */}
      {deleteCustomer && (
        <DeleteCustomerModal
          customer={deleteCustomer}
          token={token}
          onClose={() => setDeleteCustomer(null)}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </div>
  );
}

export default Customers;