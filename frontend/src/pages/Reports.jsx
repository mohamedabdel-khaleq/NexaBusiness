import { useCallback, useEffect, useState } from "react";
import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  FileText,
  RefreshCw,
  TrendingUp,
  X,
  AlertCircle,
} from "lucide-react";

import API from "../services/api";

const initialFilters = {
  from: "",
  to: "",
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
};

const formatNumber = (value) => {
  return new Intl.NumberFormat("en-US").format(
    Number(value) || 0
  );
};

const reportCards = [
  {
    key: "salesCount",
    title: "Total Sales",
    description: "Total sales transactions",
    icon: FileText,
    iconStyle: "bg-blue-50 text-blue-600",
    valueType: "number",
  },
  {
    key: "totalRevenue",
    title: "Total Revenue",
    description: "Total sales value",
    icon: TrendingUp,
    iconStyle: "bg-emerald-50 text-emerald-600",
    valueType: "currency",
  },
  {
    key: "totalPaidAmount",
    title: "Paid Amount",
    description: "Payments received",
    icon: CheckCircle2,
    iconStyle: "bg-violet-50 text-violet-600",
    valueType: "currency",
  },
  {
    key: "totalOutstandingAmount",
    title: "Outstanding",
    description: "Remaining amount",
    icon: Clock3,
    iconStyle: "bg-amber-50 text-amber-600",
    valueType: "currency",
  },
];

function Reports() {
  const [report, setReport] = useState({
    salesCount: 0,
    totalRevenue: 0,
    totalPaidAmount: 0,
    totalOutstandingAmount: 0,
  });

  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReport = useCallback(async (selectedFilters) => {
    setLoading(true);
    setError("");

    try {
      const params = {};

      if (selectedFilters.from) {
        params.from = selectedFilters.from;
      }

      if (selectedFilters.to) {
        params.to = selectedFilters.to;
      }

      const response = await API.get("/reports/sales", {
        params,
      });

      const data = response.data;

      setReport({
        salesCount: Number(data.salesCount) || 0,
        totalRevenue: Number(data.totalRevenue) || 0,
        totalPaidAmount: Number(data.totalPaidAmount) || 0,
        totalOutstandingAmount:
          Number(data.totalOutstandingAmount) || 0,
      });
    } catch (err) {
      console.error("Failed to fetch sales report:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load the sales report. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReport(initialFilters);
  }, [fetchReport]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;

    setFilters((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleApplyFilters = (event) => {
    event.preventDefault();

    if (
      filters.from &&
      filters.to &&
      filters.from > filters.to
    ) {
      setError("The start date cannot be after the end date.");
      return;
    }

    setAppliedFilters({ ...filters });
    fetchReport(filters);
  };

  const handleClearFilters = () => {
    setFilters(initialFilters);
    setAppliedFilters(initialFilters);
    fetchReport(initialFilters);
  };

  const handleRefresh = () => {
    fetchReport(appliedFilters);
  };

  const hasActiveFilters =
    Boolean(appliedFilters.from) ||
    Boolean(appliedFilters.to);

  return (
    <div className="min-h-full space-y-6 pb-8">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-600">
            <BarChart3 size={17} />
            Analytics & Insights
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Reports
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Track your sales performance, revenue, and outstanding
            payments in one place.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* Date Filters */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <CalendarDays size={20} />
          </div>

          <div>
            <h2 className="font-semibold text-slate-900">
              Filter Reports
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Select a date range to analyze your sales.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleApplyFilters}
          className="grid grid-cols-1 items-end gap-4 md:grid-cols-2 xl:grid-cols-[1fr_1fr_auto_auto]"
        >
          <div>
            <label
              htmlFor="report-from"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              From Date
            </label>

            <input
              id="report-from"
              type="date"
              name="from"
              value={filters.from}
              onChange={handleFilterChange}
              max={filters.to || undefined}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          <div>
            <label
              htmlFor="report-to"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              To Date
            </label>

            <input
              id="report-to"
              type="date"
              name="to"
              value={filters.to}
              onChange={handleFilterChange}
              min={filters.from || undefined}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <BarChart3 size={17} />
            Apply Filters
          </button>

          <button
            type="button"
            onClick={handleClearFilters}
            disabled={loading && !hasActiveFilters}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <X size={17} />
            Clear
          </button>
        </form>

        {hasActiveFilters && (
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="font-medium">Applied range:</span>

            <span className="rounded-lg bg-slate-100 px-2.5 py-1.5">
              {appliedFilters.from || "Beginning"}
            </span>

            <span>to</span>

            <span className="rounded-lg bg-slate-100 px-2.5 py-1.5">
              {appliedFilters.to || "Today"}
            </span>
          </div>
        )}
      </section>

      {/* Error Message */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <AlertCircle size={20} className="mt-0.5 shrink-0" />

          <div className="flex-1">
            <p className="font-semibold">Unable to load report</p>
            <p className="mt-1">{error}</p>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            className="shrink-0 font-semibold underline underline-offset-2"
          >
            Retry
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {reportCards.map((card) => {
          const Icon = card.icon;
          const value = report[card.key];

          return (
            <div
              key={card.key}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.iconStyle}`}
                >
                  <Icon size={21} />
                </div>

                <span className="rounded-full bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-500">
                  Report
                </span>
              </div>

              <p className="mt-5 text-sm font-medium text-slate-500">
                {card.title}
              </p>

              <div className="mt-2 min-h-9">
                {loading ? (
                  <div className="h-8 w-32 animate-pulse rounded-lg bg-slate-100" />
                ) : (
                  <p className="break-words text-2xl font-bold tracking-tight text-slate-900">
                    {card.valueType === "currency"
                      ? formatCurrency(value)
                      : formatNumber(value)}
                  </p>
                )}
              </div>

              <p className="mt-2 text-xs text-slate-400">
                {card.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Report Summary */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="font-semibold text-slate-900">
              Financial Summary
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Overview of revenue collection and outstanding balances.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <CircleDollarSign size={17} />
            Financial overview
          </div>
        </div>

        <div className="space-y-5 p-5 sm:p-6">
          <div>
            <div className="mb-2 flex items-center justify-between gap-3 text-sm">
              <span className="font-medium text-slate-600">
                Collected
              </span>

              <span className="font-semibold text-emerald-600">
                {loading
                  ? "Loading..."
                  : formatCurrency(report.totalPaidAmount)}
              </span>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{
                  width: `${
                    report.totalRevenue > 0
                      ? Math.min(
                          (report.totalPaidAmount /
                            report.totalRevenue) *
                            100,
                          100
                        )
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-3 text-sm">
              <span className="font-medium text-slate-600">
                Outstanding
              </span>

              <span className="font-semibold text-amber-600">
                {loading
                  ? "Loading..."
                  : formatCurrency(
                      report.totalOutstandingAmount
                    )}
              </span>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-amber-400 transition-all duration-500"
                style={{
                  width: `${
                    report.totalRevenue > 0
                      ? Math.min(
                          (report.totalOutstandingAmount /
                            report.totalRevenue) *
                            100,
                          100
                        )
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1 rounded-xl bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm text-slate-600">
              Collection rate
            </span>

            <span className="text-lg font-bold text-slate-900">
              {loading
                ? "Loading..."
                : `${
                    report.totalRevenue > 0
                      ? (
                          (report.totalPaidAmount /
                            report.totalRevenue) *
                          100
                        ).toFixed(1)
                      : "0.0"
                  }%`}
            </span>
          </div>
        </div>
      </section>

      {/* Empty State */}
      {!loading &&
        !error &&
        report.salesCount === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
              <BarChart3 size={24} />
            </div>

            <h3 className="mt-4 font-semibold text-slate-900">
              No sales data found
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              There are no sales transactions for the selected
              period. Try another date range or clear your filters.
            </p>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="mt-4 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
    </div>
  );
}

export default Reports;