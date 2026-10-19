
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CreditCard,
  Plus,
  Search,
  RefreshCw,
  X,
  CalendarDays,
  Receipt,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Wallet,
} from "lucide-react";
import API from "../services/api";

const PAYMENT_METHODS = [
  { value: "CASH", label: "Cash" },
  { value: "CARD", label: "Card" },
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
  { value: "WALLET", label: "Wallet" },
];

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value || 0));

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message ||
  error.response?.data?.error ||
  fallback;

const inputClasses =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500";

const buttonSecondaryClasses =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800";

function Field({ label, children }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </span>
      {children}
    </label>
  );
}

function StatCard({ title, value, icon: Icon, description }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {title}
          </p>

          <p className="mt-3 break-words text-2xl font-bold text-slate-900 dark:text-white">
            {value}
          </p>

          {description && (
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              {description}
            </p>
          )}
        </div>

        <div className="shrink-0 rounded-xl bg-blue-50 p-3 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [salesLoading, setSalesLoading] = useState(false);
  const [salesError, setSalesError] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [search, setSearch] = useState("");
  const [saleIdFilter, setSaleIdFilter] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const [form, setForm] = useState({
    saleId: "",
    amount: "",
    method: "CASH",
  });

  // Fetch payments and support multiple API response formats.
  const fetchPayments = useCallback(
    async (showLoader = true) => {
      try {
        if (showLoader) setLoading(true);

        setError("");

        const params = { page, limit };

        if (search.trim()) params.search = search.trim();
        if (saleIdFilter) params.saleId = saleIdFilter;
        if (from) params.from = from;
        if (to) params.to = to;

        const response = await API.get("/payments", { params });
        const data = response.data;

        const paymentList = Array.isArray(data)
          ? data
          : Array.isArray(data?.payments)
            ? data.payments
            : Array.isArray(data?.data)
              ? data.data
              : Array.isArray(data?.data?.payments)
                ? data.data.payments
                : [];

        const paginationData =
          data?.pagination ||
          data?.meta?.pagination ||
          data?.data?.pagination ||
          {};

        setPayments(paymentList);

        const reportedTotal = Number(paginationData.total);
        const reportedPage = Number(paginationData.page);
        const reportedLimit = Number(paginationData.limit);
        const reportedPages = Number(paginationData.totalPages);

        // Use the reported total when valid.
        // If the API incorrectly reports zero while returning records,
        // fall back to the number of records available on this page.
        const fallbackTotal =
          (page - 1) * limit + paymentList.length;

        const total =
          Number.isFinite(reportedTotal) && reportedTotal > 0
            ? reportedTotal
            : fallbackTotal;

        const effectiveLimit =
          Number.isFinite(reportedLimit) && reportedLimit > 0
            ? reportedLimit
            : limit;

        const totalPages = Math.max(
          1,
          Number.isFinite(reportedPages) && reportedPages > 0
            ? reportedPages
            : Math.ceil(total / effectiveLimit)
        );

        setPagination({
          page:
            Number.isFinite(reportedPage) && reportedPage > 0
              ? reportedPage
              : page,
          limit: effectiveLimit,
          total,
          totalPages,
        });
      } catch (err) {
        console.error("Fetch payments error:", err);
        setError(getErrorMessage(err, "Unable to load payments."));
      } finally {
        setLoading(false);
      }
    },
    [page, limit, search, saleIdFilter, from, to]
  );

  const fetchSales = useCallback(async () => {
    try {
      setSalesLoading(true);
      setSalesError("");

      const response = await API.get("/sales", {
        params: { page: 1, limit: 100 },
      });

      const data = response.data;

      const salesList = Array.isArray(data)
        ? data
        : Array.isArray(data?.sales)
          ? data.sales
          : Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data?.data?.sales)
              ? data.data.sales
              : [];

      setSales(salesList);
    } catch (err) {
      console.error("Fetch sales error:", err);

      setSalesError(
        getErrorMessage(err, "Unable to load sales. Please try again.")
      );
    } finally {
      setSalesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  useEffect(() => {
    if (modalOpen) fetchSales();
  }, [modalOpen, fetchSales]);

  const getPaidAmount = useCallback((sale) => {
    return (sale?.payments || []).reduce((total, payment) => {
      if (String(payment.status || "").toUpperCase() !== "PAID") {
        return total;
      }

      return total + Number(payment.amount || 0);
    }, 0);
  }, []);

  const getRemainingAmount = useCallback(
    (sale) => {
      const total = Number(sale?.totalAmount || 0);
      return Math.max(0, total - getPaidAmount(sale));
    },
    [getPaidAmount]
  );

  const selectedSale = useMemo(
    () => sales.find((sale) => Number(sale.id) === Number(form.saleId)),
    [sales, form.saleId]
  );

  const saleTotal = Number(selectedSale?.totalAmount || 0);
  const totalPaid = getPaidAmount(selectedSale);
  const remainingAmount = getRemainingAmount(selectedSale);
  const enteredAmount = Number(form.amount || 0);

  const exceedsRemaining =
    Boolean(selectedSale) && enteredAmount > remainingAmount + 0.001;

  const completedPayments = useMemo(
    () =>
      payments.filter(
        (payment) =>
          String(payment.status || "").toUpperCase() === "PAID"
      ),
    [payments]
  );

  const pageTotal = useMemo(
    () =>
      completedPayments.reduce(
        (total, payment) => total + Number(payment.amount || 0),
        0
      ),
    [completedPayments]
  );

  const resetForm = () => {
    setForm({ saleId: "", amount: "", method: "CASH" });
    setError("");
    setSalesError("");
  };

  const openModal = () => {
    setError("");
    setSuccess("");
    resetForm();
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;

    setModalOpen(false);
    resetForm();
  };

  const handleSaleChange = (event) => {
    const nextSaleId = event.target.value;

    const nextSale = sales.find(
      (sale) => Number(sale.id) === Number(nextSaleId)
    );

    const remaining = getRemainingAmount(nextSale);

    setForm((previous) => ({
      ...previous,
      saleId: nextSaleId,
      amount: remaining > 0 ? remaining.toFixed(2) : "",
    }));

    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const parsedSaleId = Number(form.saleId);
    const parsedAmount = Number(form.amount);

    if (!Number.isInteger(parsedSaleId) || parsedSaleId <= 0) {
      setError("Please select a valid sale.");
      return;
    }

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError("Please enter a valid payment amount.");
      return;
    }

    const selected = sales.find(
      (sale) => Number(sale.id) === parsedSaleId
    );

    if (!selected) {
      setError("Please select a valid sale.");
      return;
    }

    const remaining = getRemainingAmount(selected);

    if (remaining <= 0) {
      setError("This sale is already fully paid.");
      return;
    }

    if (parsedAmount > remaining + 0.001) {
      setError(
        `Payment exceeds the remaining balance of ${formatCurrency(
          remaining
        )}.`
      );
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
      setSuccess("Payment recorded successfully.");
      resetForm();

      // Refresh the first page after recording a payment.
      setPage(1);

      // Fetch immediately using the first-page parameters.
      const response = await API.get("/payments", {
        params: {
          page: 1,
          limit,
          ...(search.trim() ? { search: search.trim() } : {}),
          ...(saleIdFilter ? { saleId: saleIdFilter } : {}),
          ...(from ? { from } : {}),
          ...(to ? { to } : {}),
        },
      });

      const data = response.data;

      const paymentList = Array.isArray(data)
        ? data
        : Array.isArray(data?.payments)
          ? data.payments
          : Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data?.data?.payments)
              ? data.data.payments
              : [];

      const paginationData =
        data?.pagination ||
        data?.meta?.pagination ||
        data?.data?.pagination ||
        {};

      const reportedTotal = Number(paginationData.total);
      const total =
        Number.isFinite(reportedTotal) && reportedTotal > 0
          ? reportedTotal
          : paymentList.length;

      const reportedPages = Number(paginationData.totalPages);

      setPayments(paymentList);
      setPagination({
        page: 1,
        limit,
        total,
        totalPages: Math.max(
          1,
          Number.isFinite(reportedPages) && reportedPages > 0
            ? reportedPages
            : Math.ceil(total / limit)
        ),
      });
    } catch (err) {
      console.error("Create or refresh payment error:", err);
      setError(
        getErrorMessage(
          err,
          "Payment may have been saved, but refreshing the list failed."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  const handleClearFilters = () => {
    setSearch("");
    setSaleIdFilter("");
    setFrom("");
    setTo("");
    setPage(1);
  };

  const totalPages = Math.max(1, Number(pagination.totalPages || 1));

  return (
    <div className="min-h-screen space-y-6 bg-white p-4 text-slate-900 transition-colors sm:p-6 lg:p-8 dark:bg-slate-950 dark:text-white">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-blue-50 p-3 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
            <CreditCard size={25} />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Payments
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Manage customer payments and outstanding balances.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => fetchPayments()}
            disabled={loading}
            className={buttonSecondaryClasses}
          >
            <RefreshCw
              size={17}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>

          <button
            type="button"
            onClick={openModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            <Plus size={18} />
            Add Payment
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && !modalOpen && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
          <AlertCircle size={19} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && !modalOpen && (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
          <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          title="Payments Loaded"
          value={payments.length}
          icon={Receipt}
          description="Payments on the current page"
        />

        <StatCard
          title="Paid Amount"
          value={formatCurrency(pageTotal)}
          icon={Wallet}
          description="Successful payments on the current page"
        />

        <StatCard
          title="Total Records"
          value={pagination.total}
          icon={CreditCard}
          description="Records matching the current filters"
        />
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-colors sm:p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-center gap-2">
          <Search size={18} className="text-slate-500 dark:text-slate-400" />
          <h2 className="font-semibold text-slate-900 dark:text-white">
            Search and Filters
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <div className="relative sm:col-span-2 xl:col-span-2">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
            />
            <input
              type="text"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search payments..."
              className={`${inputClasses} pl-10`}
            />
          </div>

          <input
            type="number"
            min="1"
            value={saleIdFilter}
            onChange={(event) => {
              setSaleIdFilter(event.target.value);
              setPage(1);
            }}
            placeholder="Sale ID"
            className={inputClasses}
          />

          <div className="relative">
            <CalendarDays
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
            />
            <input
              type="date"
              value={from}
              onChange={(event) => {
                setFrom(event.target.value);
                setPage(1);
              }}
              aria-label="From date"
              className={`${inputClasses} pl-9 pr-3`}
            />
          </div>

          <input
            type="date"
            value={to}
            onChange={(event) => {
              setTo(event.target.value);
              setPage(1);
            }}
            aria-label="To date"
            className={inputClasses}
          />
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={handleClearFilters}
            className="rounded-lg px-3 py-2 text-sm text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            Clear filters
          </button>
        </div>
      </div>

      {/* Payments Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col justify-between gap-2 border-b border-slate-200 p-5 sm:flex-row sm:items-center dark:border-slate-800">
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-white">
              Payment Transactions
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              View and track recorded payments.
            </p>
          </div>

          <span className="text-sm text-slate-500 dark:text-slate-400">
            {pagination.total} record(s)
          </span>
        </div>

        {loading ? (
          <div className="flex min-h-56 items-center justify-center gap-3 text-slate-500 dark:text-slate-400">
            <RefreshCw size={20} className="animate-spin" />
            Loading payments...
          </div>
        ) : error && payments.length === 0 ? (
          <div className="flex min-h-56 flex-col items-center justify-center gap-3 p-6 text-center">
            <AlertCircle size={28} className="text-red-500 dark:text-red-400" />
            <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
            <button
              type="button"
              onClick={() => fetchPayments()}
              className="rounded-lg bg-slate-100 px-4 py-2 text-sm text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Try again
            </button>
          </div>
        ) : payments.length === 0 ? (
          <div className="flex min-h-56 flex-col items-center justify-center p-6 text-center">
            <div className="rounded-2xl bg-slate-100 p-4 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              <Receipt size={28} />
            </div>
            <h3 className="mt-4 font-semibold text-slate-900 dark:text-white">
              No payments found
            </h3>
            <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
              No transactions match your filters. Try changing your search
              or record a new payment.
            </p>
            <button
              type="button"
              onClick={openModal}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500"
            >
              <Plus size={17} />
              Add Payment
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 dark:bg-slate-950/70 dark:text-slate-400">
                  <tr>
                    <th className="px-5 py-4 font-medium">Payment ID</th>
                    <th className="px-5 py-4 font-medium">Sale</th>
                    <th className="px-5 py-4 font-medium">Customer</th>
                    <th className="px-5 py-4 font-medium">Method</th>
                    <th className="px-5 py-4 font-medium">Amount</th>
                    <th className="px-5 py-4 font-medium">Status</th>
                    <th className="px-5 py-4 font-medium">Date</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {payments.map((payment) => {
                    const status = String(
                      payment.status || "UNKNOWN"
                    ).toUpperCase();

                    const method =
                      PAYMENT_METHODS.find(
                        (item) => item.value === payment.method
                      )?.label || payment.method || "—";

                    const customerName =
                      payment.sale?.customer?.name ||
                      payment.customer?.name ||
                      "Walk-in Customer";

                    return (
                      <tr
                        key={payment.id}
                        className="transition hover:bg-slate-50 dark:hover:bg-slate-800/40"
                      >
                        <td className="px-5 py-4 font-semibold text-slate-900 dark:text-white">
                          PAY-{String(payment.id).padStart(4, "0")}
                        </td>

                        <td className="px-5 py-4">
                          <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
                            #{payment.saleId ?? payment.sale?.id ?? "—"}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-slate-700 dark:text-slate-300">
                          {customerName}
                        </td>

                        <td className="px-5 py-4 text-slate-700 dark:text-slate-300">
                          {method}
                        </td>

                        <td className="px-5 py-4 font-semibold tabular-nums text-slate-900 dark:text-white">
                          {formatCurrency(payment.amount)}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                              status === "PAID"
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                                : status === "PENDING"
                                  ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                                  : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                            }`}
                          >
                            {status === "PAID" && <CheckCircle2 size={13} />}
                            {status}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-slate-500 dark:text-slate-400">
                          {formatDate(payment.createdAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col justify-between gap-4 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center dark:border-slate-800">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Page{" "}
                <span className="font-semibold text-slate-900 dark:text-white">
                  {page}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-900 dark:text-white">
                  {totalPages}
                </span>
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1 || loading}
                  onClick={() =>
                    setPage((current) => Math.max(1, current - 1))
                  }
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>

                <button
                  type="button"
                  disabled={page >= totalPages || loading}
                  onClick={() =>
                    setPage((current) =>
                      Math.min(totalPages, current + 1)
                    )
                  }
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Add Payment Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm dark:bg-black/70"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) {
              closeModal();
            }
          }}
        >
          <div className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-5 sm:px-6 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-50 p-3 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                  <CreditCard size={22} />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Add Payment
                  </h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Select a sale and record its payment.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                aria-label="Close modal"
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">
              {error && (
                <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {salesError && (
                <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                  <span>{salesError}</span>
                  <button
                    type="button"
                    onClick={fetchSales}
                    className="ml-auto underline"
                  >
                    Retry
                  </button>
                </div>
              )}

              <Field label="Select Sale *">
                <select
                  name="saleId"
                  required
                  value={form.saleId}
                  disabled={saving || salesLoading}
                  onChange={handleSaleChange}
                  className={inputClasses}
                >
                  <option value="">
                    {salesLoading ? "Loading sales..." : "Choose a sale"}
                  </option>

                  {sales.map((sale) => {
                    const remaining = getRemainingAmount(sale);
                    const customer =
                      sale.customer?.name || "Walk-in Customer";

                    return (
                      <option
                        key={sale.id}
                        value={sale.id}
                        disabled={remaining <= 0}
                      >
                        {`Sale #${sale.id} — ${customer} — Remaining: ${formatCurrency(
                          remaining
                        )}`}
                      </option>
                    );
                  })}
                </select>

                {!salesLoading && !salesError && sales.length === 0 && (
                  <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                    No sales were found. Create a sale first.
                  </p>
                )}
              </Field>

              {selectedSale && (
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Sale Total
                    </p>
                    <p className="mt-2 font-bold text-slate-900 dark:text-white">
                      {formatCurrency(saleTotal)}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Already Paid
                    </p>
                    <p className="mt-2 font-bold text-emerald-700 dark:text-emerald-400">
                      {formatCurrency(totalPaid)}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Remaining
                    </p>
                    <p className="mt-2 font-bold text-amber-700 dark:text-amber-400">
                      {formatCurrency(remainingAmount)}
                    </p>
                  </div>
                </div>
              )}

              <Field label="Payment Amount *">
                <input
                  type="number"
                  name="amount"
                  min="0.01"
                  max={selectedSale ? remainingAmount : undefined}
                  step="0.01"
                  required
                  value={form.amount}
                  disabled={saving || !selectedSale}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      amount: event.target.value,
                    }))
                  }
                  placeholder="Enter payment amount"
                  className={inputClasses}
                />

                {exceedsRemaining && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    The payment cannot exceed the remaining balance of{" "}
                    {formatCurrency(remainingAmount)}.
                  </p>
                )}

                {selectedSale && remainingAmount > 0 && (
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() =>
                      setForm((previous) => ({
                        ...previous,
                        amount: remainingAmount.toFixed(2),
                      }))
                    }
                    className="mt-2 text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Fill remaining balance ({formatCurrency(remainingAmount)})
                  </button>
                )}
              </Field>

              <Field label="Payment Method *">
                <select
                  name="method"
                  required
                  value={form.method}
                  disabled={saving}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      method: event.target.value,
                    }))
                  }
                  className={inputClasses}
                >
                  {PAYMENT_METHODS.map((method) => (
                    <option key={method.value} value={method.value}>
                      {method.label}
                    </option>
                  ))}
                </select>
              </Field>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end dark:border-slate-800">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className={buttonSecondaryClasses}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    saving ||
                    salesLoading ||
                    !selectedSale ||
                    enteredAmount <= 0 ||
                    exceedsRemaining ||
                    remainingAmount <= 0
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <RefreshCw size={17} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Plus size={17} />
                      Record Payment
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
