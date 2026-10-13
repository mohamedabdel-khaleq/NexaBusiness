
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Plus,
  X,
  CreditCard,
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Eye,
  Banknote,
  Wallet,
  Landmark,
  CalendarDays,
  CircleDollarSign,
  CheckCircle2,
  Clock3,
  AlertCircle,
  SlidersHorizontal,
  Receipt,
  UserRound,
  ShoppingCart,
  ArrowUpRight,
  RotateCcw,
} from "lucide-react";

import API from "../services/api";
import { useAuth } from "../context/AuthContext";

const PAGE_SIZE = 10;

const PAYMENT_METHODS = [
  { value: "CASH", label: "Cash", icon: Banknote },
  { value: "CARD", label: "Card", icon: CreditCard },
  { value: "BANK_TRANSFER", label: "Bank Transfer", icon: Landmark },
  { value: "WALLET", label: "Wallet", icon: Wallet },
];

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value) || 0);

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatMethod = (method) => {
  const found = PAYMENT_METHODS.find(
    (item) => item.value === method
  );

  return (
    found?.label ||
    String(method || "Unknown").replaceAll("_", " ")
  );
};

const getStatusStyle = (status) => {
  switch (String(status || "").toUpperCase()) {
    case "PAID":
      return {
        label: "Paid",
        classes:
          "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
        Icon: CheckCircle2,
      };

    case "PENDING":
      return {
        label: "Pending",
        classes:
          "border-amber-500/20 bg-amber-500/10 text-amber-400",
        Icon: Clock3,
      };

    case "PARTIALLY_PAID":
      return {
        label: "Partially paid",
        classes:
          "border-amber-500/20 bg-amber-500/10 text-amber-400",
        Icon: Clock3,
      };

    case "REFUNDED":
      return {
        label: "Refunded",
        classes:
          "border-violet-500/20 bg-violet-500/10 text-violet-400",
        Icon: RotateCcw,
      };

    case "FAILED":
      return {
        label: "Failed",
        classes:
          "border-red-500/20 bg-red-500/10 text-red-400",
        Icon: AlertCircle,
      };

    default:
      return {
        label: status || "Unknown",
        classes:
          "border-slate-700 bg-slate-800 text-slate-300",
        Icon: Clock3,
      };
  }
};

function MethodIcon({ method, size = 18 }) {
  const item = PAYMENT_METHODS.find(
    (option) => option.value === method
  );

  const Icon = item?.icon || CreditCard;

  return <Icon size={size} />;
}

function StatCard({ title, value, description, icon: Icon, color }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-400">
            {title}
          </p>

          <p className="mt-3 break-words text-2xl font-bold text-white">
            {value}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            {description}
          </p>
        </div>

        <div className={`rounded-xl p-3 ${color}`}>
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-300">
        {label}
      </label>
      {children}
    </div>
  );
}

function Payments() {
  const { user } = useAuth();
  const isAdmin = Number(user?.roleId) === 1;

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [saleId, setSaleId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_SIZE,
    totalPayments: 0,
    totalPages: 1,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [listError, setListError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    saleId: "",
    amount: "",
    method: "CASH",
  });

  const fetchPayments = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setListError("");

      const params = {
        page,
        limit: PAGE_SIZE,
      };

      if (search.trim()) params.search = search.trim();
      if (saleId.trim()) params.saleId = saleId.trim();
      if (from) params.from = from;
      if (to) params.to = to;

      const response = await API.get("/payments", { params });

      setPayments(response.data.payments || []);

      setPagination(
        response.data.pagination || {
          page: 1,
          limit: PAGE_SIZE,
          totalPayments: 0,
          totalPages: 1,
        }
      );
    } catch (err) {
      console.error("Fetch payments error:", err);

      setListError(
        err.response?.data?.message ||
          "Unable to load payments. Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, search, saleId, from, to]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  useEffect(() => {
    if (!success) return undefined;

    const timer = setTimeout(() => setSuccess(""), 4000);

    return () => clearTimeout(timer);
  }, [success]);

  const summary = useMemo(() => {
    const totalOnPage = payments.reduce(
      (sum, payment) => sum + Number(payment.amount || 0),
      0
    );

    const paidOnPage = payments
      .filter(
        (payment) =>
          String(payment.status).toUpperCase() === "PAID"
      )
      .reduce(
        (sum, payment) => sum + Number(payment.amount || 0),
        0
      );

    const cardCount = payments.filter(
      (payment) => payment.method === "CARD"
    ).length;

    return {
      totalOnPage,
      paidOnPage,
      cardCount,
    };
  }, [payments]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const openModal = () => {
    setForm({
      saleId: "",
      amount: "",
      method: "CASH",
    });

    setError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;

    setModalOpen(false);
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const parsedSaleId = Number(form.saleId);
    const parsedAmount = Number(form.amount);

    if (
      !Number.isInteger(parsedSaleId) ||
      parsedSaleId <= 0
    ) {
      setError("Enter a valid Sale ID.");
      return;
    }

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError("Amount must be greater than zero.");
      return;
    }

    if (!PAYMENT_METHODS.some((item) => item.value === form.method)) {
      setError("Choose a valid payment method.");
      return;
    }

    try {
      setSaving(true);

      await API.post("/payments", {
        saleId: parsedSaleId,
        amount: parsedAmount,
        method: form.method,
      });

      setModalOpen(false);
      setForm({
        saleId: "",
        amount: "",
        method: "CASH",
      });
      setSuccess("Payment recorded successfully.");

      if (page !== 1) {
        setPage(1);
      } else {
        await fetchPayments(true);
      }
    } catch (err) {
      console.error("Create payment error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to record payment. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const openDetails = async (payment) => {
    setDetailsOpen(true);
    setDetailsLoading(true);
    setSelectedPayment(payment);

    try {
      const response = await API.get(`/payments/${payment.id}`);

      setSelectedPayment(response.data.payment || payment);
    } catch (err) {
      console.error("Fetch payment details error:", err);
      // Keep the list data visible if the details request fails.
    } finally {
      setDetailsLoading(false);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setSaleId("");
    setFrom("");
    setTo("");
    setPage(1);
  };

  const hasFilters = Boolean(
    search.trim() || saleId.trim() || from || to
  );

  const totalPages = Math.max(pagination.totalPages || 1, 1);
  const currentMethod = PAYMENT_METHODS.find(
    (item) => item.value === form.method
  );

  return (
    <div className="space-y-6 pb-8">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-blue-400">
            <CreditCard size={16} />
            <span>Finance / Payments</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Payments
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Monitor transactions, payment methods, and customer collections.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => fetchPayments(true)}
            disabled={loading || refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>

          {isAdmin && (
            <button
              type="button"
              onClick={openModal}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
            >
              <Plus size={18} />
              Add Payment
            </button>
          )}
        </div>
      </div>

      {/* SUCCESS */}
      {success && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
          <CheckCircle2 size={18} />
          <span>{success}</span>
          <button
            type="button"
            onClick={() => setSuccess("")}
            className="ml-auto rounded-lg p-1 hover:bg-emerald-500/10"
            aria-label="Dismiss message"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* SUMMARY */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Transactions"
          value={pagination.totalPayments.toLocaleString("en-US")}
          description="Transactions matching current filters"
          icon={Receipt}
          color="bg-blue-500/10 text-blue-400"
        />

        <StatCard
          title="Amount on This Page"
          value={formatCurrency(summary.totalOnPage)}
          description={`${payments.length} transactions on this page`}
          icon={CircleDollarSign}
          color="bg-violet-500/10 text-violet-400"
        />

        <StatCard
          title="Paid on This Page"
          value={formatCurrency(summary.paidOnPage)}
          description="Payments marked as paid"
          icon={CheckCircle2}
          color="bg-emerald-500/10 text-emerald-400"
        />

        <StatCard
          title="Card Transactions"
          value={summary.cardCount.toLocaleString("en-US")}
          description="Card-method payments on this page"
          icon={CreditCard}
          color="bg-amber-500/10 text-amber-400"
        />
      </div>

      {/* PAYMENT METHODS */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <div className="mb-4">
          <h2 className="font-semibold text-white">Supported Payment Methods</h2>
          <p className="mt-1 text-sm text-slate-500">
            Payment methods available in the current system.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {PAYMENT_METHODS.map((method) => {
            const Icon = method.icon;
            const count = payments.filter(
              (payment) => payment.method === method.value
            ).length;

            return (
              <div
                key={method.value}
                className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-4"
              >
                <div className="rounded-lg bg-slate-800 p-3 text-blue-400">
                  <Icon size={21} />
                </div>

                <div className="min-w-0">
                  <p className="font-medium text-white">{method.label}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {count} on this page
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* FILTERS */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={18} className="text-blue-400" />
            <h2 className="font-semibold text-white">Find Payments</h2>
          </div>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-sm font-medium text-blue-400 transition hover:text-blue-300"
            >
              Clear filters
            </button>
          )}
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <div className="relative xl:col-span-2">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search customer name, email, phone..."
              className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
            />
          </div>

          <input
            type="number"
            min="1"
            value={saleId}
            onChange={(event) => {
              setSaleId(event.target.value);
              setPage(1);
            }}
            placeholder="Sale ID"
            aria-label="Filter by sale ID"
            className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
          />

          <div className="relative">
            <CalendarDays
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              type="date"
              value={from}
              max={to || undefined}
              onChange={(event) => {
                setFrom(event.target.value);
                setPage(1);
              }}
              aria-label="Start date"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-9 pr-3 text-sm text-slate-300 outline-none focus:border-blue-500"
            />
          </div>

          <div className="relative">
            <CalendarDays
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              type="date"
              value={to}
              min={from || undefined}
              onChange={(event) => {
                setTo(event.target.value);
                setPage(1);
              }}
              aria-label="End date"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-9 pr-3 text-sm text-slate-300 outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </section>

      {/* ERROR */}
      {listError && (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <div className="flex-1">
            <p>{listError}</p>
            <button
              type="button"
              onClick={() => fetchPayments(true)}
              className="mt-2 font-semibold underline underline-offset-2"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* TABLE */}
      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
        <div className="flex flex-col gap-2 border-b border-slate-800 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-white">All Transactions</h2>
            <p className="mt-1 text-sm text-slate-500">
              {pagination.totalPayments} matching payment
              {pagination.totalPayments === 1 ? "" : "s"}
            </p>
          </div>

          <span className="inline-flex w-fit items-center gap-2 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Live API data
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left">
            <thead className="border-b border-slate-800 bg-slate-950/60">
              <tr>
                {[
                  "Payment",
                  "Sale / Customer",
                  "Amount",
                  "Payment Method",
                  "Status",
                  "Date",
                  "Action",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center">
                    <RefreshCw
                      size={24}
                      className="mx-auto mb-3 animate-spin text-blue-400"
                    />
                    <p className="text-sm text-slate-400">
                      Loading payments...
                    </p>
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center">
                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800 text-slate-500">
                      <CreditCard size={26} />
                    </div>
                    <p className="font-medium text-white">No payments found</p>
                    <p className="mt-1 text-sm text-slate-500">
                      Try changing your filters or record a new payment.
                    </p>
                    {hasFilters && (
                      <button
                        type="button"
                        onClick={clearFilters}
                        className="mt-4 text-sm font-semibold text-blue-400 hover:text-blue-300"
                      >
                        Clear filters
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                payments.map((payment) => {
                  const status = getStatusStyle(payment.status);
                  const StatusIcon = status.Icon;

                  return (
                    <tr
                      key={payment.id}
                      className="transition hover:bg-slate-800/30"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
                            <Receipt size={18} />
                          </div>
                          <div>
                            <p className="font-semibold text-white">
                              PAY-{String(payment.id).padStart(4, "0")}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              ID: {payment.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-200">
                          Sale #{payment.saleId}
                        </p>
                        <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                          <UserRound size={13} />
                          <span>
                            {payment.sale?.customer?.name ||
                              "Walk-in Customer"}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-bold text-white">
                          {formatCurrency(payment.amount)}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="rounded-lg border border-slate-700 bg-slate-950 p-2 text-slate-300">
                            <MethodIcon method={payment.method} size={17} />
                          </div>
                          <span className="text-sm text-slate-300">
                            {formatMethod(payment.method)}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-xs font-semibold ${status.classes}`}
                        >
                          <StatusIcon size={13} />
                          {status.label}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-400">
                        {formatDate(payment.createdAt)}
                      </td>

                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => openDetails(payment)}
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm font-medium text-slate-300 transition hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-400"
                        >
                          <Eye size={15} />
                          Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="flex flex-col gap-3 border-t border-slate-800 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Page{" "}
            <span className="font-semibold text-slate-300">{page}</span>
            {" "}of{" "}
            <span className="font-semibold text-slate-300">{totalPages}</span>
            <span className="mx-2 text-slate-700">|</span>
            {pagination.totalPayments} total transactions
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((current) => Math.max(current - 1, 1))}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={16} />
              Previous
            </button>

            <button
              type="button"
              disabled={page >= totalPages || loading}
              onClick={() =>
                setPage((current) => Math.min(current + 1, totalPages))
              }
              className="inline-flex items-center gap-1 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* ADD PAYMENT MODAL */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/80 px-4 py-8 backdrop-blur-sm"
          onClick={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <div className="my-auto w-full max-w-xl overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400">
                  <Plus size={21} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">
                    Record Payment
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Record a payment against an existing sale.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                aria-label="Close payment form"
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              {error && (
                <div className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  <AlertCircle size={17} className="mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Field label="Sale ID *">
                <input
                  type="number"
                  name="saleId"
                  min="1"
                  step="1"
                  required
                  value={form.saleId}
                  onChange={handleChange}
                  placeholder="Enter the existing sale ID"
                  disabled={saving}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
                />
              </Field>

              <Field label="Payment Amount (USD) *">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500">
                    $
                  </span>
                  <input
                    type="number"
                    name="amount"
                    min="0.01"
                    step="0.01"
                    required
                    value={form.amount}
                    onChange={handleChange}
                    placeholder="0.00"
                    disabled={saving}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-9 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
                  />
                </div>
              </Field>

              <Field label="Payment Method *">
                <div className="grid grid-cols-2 gap-3">
                  {PAYMENT_METHODS.map((method) => {
                    const Icon = method.icon;
                    const active = form.method === method.value;

                    return (
                      <button
                        key={method.value}
                        type="button"
                        disabled={saving}
                        onClick={() =>
                          setForm((previous) => ({
                            ...previous,
                            method: method.value,
                          }))
                        }
                        className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                          active
                            ? "border-blue-500 bg-blue-500/10 text-blue-300"
                            : "border-slate-700 bg-slate-950 text-slate-400 hover:border-slate-600"
                        }`}
                      >
                        <Icon size={20} />
                        <span className="text-sm font-medium">
                          {method.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </Field>

              {/* PAYMENT PREVIEW */}
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Payment Preview
                  </span>
                  <span className="text-xs text-slate-500">
                    {currentMethod?.label}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-slate-800 p-2.5 text-blue-400">
                      <MethodIcon method={form.method} size={22} />
                    </div>
                    <div>
                      <p className="font-medium text-white">
                        {currentMethod?.label}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Sale #{form.saleId || "—"}
                      </p>
                    </div>
                  </div>

                  <p className="text-xl font-bold text-white">
                    {formatCurrency(form.amount)}
                  </p>
                </div>
              </div>

              <p className="text-xs leading-5 text-slate-500">
                This records a payment in NexaBusiness. Selecting Card does
                not charge a bank card; real card processing requires a
                payment gateway.
              </p>

              <div className="flex justify-end gap-3 border-t border-slate-800 pt-5">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      Record Payment
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PAYMENT DETAILS MODAL */}
      {detailsOpen && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center overflow-y-auto bg-slate-950/80 px-4 py-8 backdrop-blur-sm"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setDetailsOpen(false);
            }
          }}
        >
          <div className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">
              <div>
                <div className="mb-2 flex items-center gap-2 text-sm text-blue-400">
                  <Receipt size={16} />
                  Transaction details
                </div>
                <h2 className="text-xl font-bold text-white">
                  Payment #
                  {selectedPayment?.id ?? "—"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Full details from the payment record.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setDetailsOpen(false)}
                aria-label="Close payment details"
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5 p-6">
              {detailsLoading && (
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <RefreshCw size={16} className="animate-spin" />
                  Loading latest payment details...
                </div>
              )}

              {selectedPayment && (
                <>
                  <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5">
                    <p className="text-sm text-slate-400">Payment amount</p>
                    <p className="mt-2 text-3xl font-bold text-white">
                      {formatCurrency(selectedPayment.amount)}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      {(() => {
                        const status = getStatusStyle(
                          selectedPayment.status
                        );
                        const StatusIcon = status.Icon;

                        return (
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${status.classes}`}
                          >
                            <StatusIcon size={14} />
                            {status.label}
                          </span>
                        );
                      })()}

                      <span className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs font-medium text-slate-300">
                        <MethodIcon
                          method={selectedPayment.method}
                          size={14}
                        />
                        {formatMethod(selectedPayment.method)}
                      </span>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Receipt size={16} />
                        <span className="text-xs">Payment ID</span>
                      </div>
                      <p className="mt-2 font-semibold text-white">
                        PAY-{String(selectedPayment.id).padStart(4, "0")}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                      <div className="flex items-center gap-2 text-slate-500">
                        <ShoppingCart size={16} />
                        <span className="text-xs">Sale ID</span>
                      </div>
                      <p className="mt-2 font-semibold text-white">
                        #{selectedPayment.saleId}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                      <div className="flex items-center gap-2 text-slate-500">
                        <UserRound size={16} />
                        <span className="text-xs">Customer</span>
                      </div>
                      <p className="mt-2 font-semibold text-white">
                        {selectedPayment.sale?.customer?.name ||
                          "Walk-in Customer"}
                      </p>
                      {selectedPayment.sale?.customer?.email && (
                        <p className="mt-1 break-all text-xs text-slate-500">
                          {selectedPayment.sale.customer.email}
                        </p>
                      )}
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                      <div className="flex items-center gap-2 text-slate-500">
                        <CalendarDays size={16} />
                        <span className="text-xs">Created at</span>
                      </div>
                      <p className="mt-2 text-sm font-semibold text-white">
                        {formatDate(selectedPayment.createdAt)}
                      </p>
                    </div>

                    {selectedPayment.sale?.totalAmount != null && (
                      <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 sm:col-span-2">
                        <p className="text-xs text-slate-500">
                          Total sale amount
                        </p>
                        <p className="mt-2 font-semibold text-white">
                          {formatCurrency(
                            selectedPayment.sale.totalAmount
                          )}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                    <div className="flex items-start gap-2.5">
                      <AlertCircle
                        size={17}
                        className="mt-0.5 shrink-0 text-amber-400"
                      />
                      <p className="text-xs leading-5 text-slate-400">
                        The method and status shown here come from the saved
                        payment record. They do not independently confirm
                        settlement by a bank or card provider.
                      </p>
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-end border-t border-slate-800 pt-5">
                <button
                  type="button"
                  onClick={() => setDetailsOpen(false)}
                  className="rounded-xl border border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Payments;
