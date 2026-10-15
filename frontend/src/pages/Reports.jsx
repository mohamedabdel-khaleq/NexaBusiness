
import { useCallback, useEffect, useState } from "react";
import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  FileDown,
  FileSpreadsheet,
  Printer,
  RefreshCw,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import API from "../services/api";

const initialFilters = {
  from: "",
  to: "",
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

const formatNumber = (value) =>
  new Intl.NumberFormat("en-US").format(Number(value) || 0);

const formatDate = (value) => {
  if (!value) return "Not specified";

  const date = new Date(`${value}T00:00:00`);

  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
};

const getPeriodLabel = (filters) => {
  if (filters.from && filters.to) {
    return `${formatDate(filters.from)} - ${formatDate(filters.to)}`;
  }

  if (filters.from) return `From ${formatDate(filters.from)}`;
  if (filters.to) return `Until ${formatDate(filters.to)}`;

  return "All available dates";
};

const downloadFile = (content, type, filename) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export default function Reports() {
  const [filters, setFilters] = useState(initialFilters);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReport = useCallback(async (activeFilters = filters) => {
    setLoading(true);
    setError("");

    try {
      const params = {};

      if (activeFilters.from) params.from = activeFilters.from;
      if (activeFilters.to) params.to = activeFilters.to;

      const response = await API.get("/reports/sales", { params });
      const data = response.data;

      setReport({
        salesCount: Number(data.salesCount) || 0,
        totalRevenue: Number(data.totalRevenue) || 0,
        totalPaidAmount: Number(data.totalPaidAmount) || 0,
        totalOutstandingAmount:
          Number(data.totalOutstandingAmount) || 0,
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load the sales report. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchReport(initialFilters);
  }, [fetchReport]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;

    setFilters((previous) => ({
      ...previous,
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
      setError("The start date cannot be later than the end date.");
      return;
    }

    fetchReport(filters);
  };

  const handleResetFilters = () => {
    setFilters(initialFilters);
    fetchReport(initialFilters);
  };

  const isReady = Boolean(report) && !loading && !error;

  const collectionRate =
    report && report.totalRevenue > 0
      ? Math.min(
          100,
          (report.totalPaidAmount / report.totalRevenue) * 100
        )
      : 0;

  const summaryRows = report
    ? [
        ["Total Sales", formatNumber(report.salesCount)],
        ["Total Revenue", formatCurrency(report.totalRevenue)],
        ["Amount Collected", formatCurrency(report.totalPaidAmount)],
        [
          "Outstanding Amount",
          formatCurrency(report.totalOutstandingAmount),
        ],
        ["Collection Rate", `${collectionRate.toFixed(1)}%`],
      ]
    : [];

  const exportPDF = () => {
    if (!isReady) return;

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      doc.setFont("helvetica", "bold");
      doc.setFontSize(21);
      doc.text("NexaBusiness", 14, 20);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(15);
      doc.text("Sales & Financial Report", 14, 30);

      doc.setFontSize(10);
      doc.text(`Reporting period: ${getPeriodLabel(filters)}`, 14, 39);
      doc.text(
        `Generated: ${new Date().toLocaleString("en-US")}`,
        14,
        45
      );

      autoTable(doc, {
        startY: 54,
        head: [["Metric", "Value"]],
        body: summaryRows,
        theme: "striped",
        headStyles: {
          fillColor: [37, 99, 235],
          textColor: 255,
        },
        styles: {
          font: "helvetica",
          fontSize: 10,
          cellPadding: 5,
        },
        columnStyles: {
          0: { cellWidth: 100 },
          1: { halign: "right" },
        },
        margin: { left: 14, right: 14 },
      });

      const finalY = doc.lastAutoTable?.finalY || 100;

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(
        "Generated by NexaBusiness",
        14,
        Math.min(finalY + 15, 275)
      );

      const safeDate = new Date().toISOString().slice(0, 10);
      doc.save(`nexabusiness-report-${safeDate}.pdf`);
    } catch (err) {
      console.error("PDF export failed:", err);
      window.alert("Could not generate the PDF. Please try again.");
    }
  };

  const exportCSV = () => {
    if (!isReady) return;

    const escapeCSV = (value) =>
      `"${String(value).replace(/"/g, '""')}"`;

    const rows = [
      ["NexaBusiness Sales & Financial Report"],
      ["Reporting Period", getPeriodLabel(filters)],
      ["Generated", new Date().toLocaleString("en-US")],
      [],
      ["Metric", "Value"],
      ...summaryRows,
    ];

    const csv = "\uFEFF" +
      rows
        .map((row) => row.map(escapeCSV).join(","))
        .join("\r\n");

    const safeDate = new Date().toISOString().slice(0, 10);

    downloadFile(
      csv,
      "text/csv;charset=utf-8;",
      `nexabusiness-report-${safeDate}.csv`
    );
  };

  const printReport = () => {
    if (!isReady) return;

    const printWindow = window.open("", "_blank", "width=900,height=700");

    if (!printWindow) {
      window.alert(
        "The print window was blocked. Allow pop-ups and try again."
      );
      return;
    }

    const rowsHTML = summaryRows
      .map(
        ([label, value]) => `
          <tr>
            <td>${label}</td>
            <td>${value}</td>
          </tr>
        `
      )
      .join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>NexaBusiness Financial Report</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              color: #111827;
              max-width: 800px;
              margin: 40px auto;
              padding: 24px;
            }
            h1 { margin-bottom: 6px; }
            .muted { color: #6b7280; margin-bottom: 24px; }
            table { width: 100%; border-collapse: collapse; margin-top: 24px; }
            th, td { padding: 14px; border: 1px solid #e5e7eb; text-align: left; }
            th { background: #eff6ff; }
            td:last-child { text-align: right; font-weight: bold; }
            footer { margin-top: 32px; color: #6b7280; font-size: 12px; }
            @media print {
              body { margin: 0; padding: 12px; }
            }
          </style>
        </head>
        <body>
          <h1>NexaBusiness</h1>
          <h2>Sales & Financial Report</h2>
          <p class="muted">
            Reporting period: ${getPeriodLabel(filters)}<br />
            Generated: ${new Date().toLocaleString("en-US")}
          </p>
          <table>
            <thead><tr><th>Metric</th><th>Value</th></tr></thead>
            <tbody>${rowsHTML}</tbody>
          </table>
          <footer>Generated by NexaBusiness</footer>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  const kpis = report
    ? [
        {
          label: "Total Sales",
          value: formatNumber(report.salesCount),
          icon: BarChart3,
          iconStyle: "bg-blue-50 text-blue-600",
          description: "Sales in the selected period",
        },
        {
          label: "Total Revenue",
          value: formatCurrency(report.totalRevenue),
          icon: CircleDollarSign,
          iconStyle: "bg-violet-50 text-violet-600",
          description: "Total sales value",
        },
        {
          label: "Amount Collected",
          value: formatCurrency(report.totalPaidAmount),
          icon: CheckCircle2,
          iconStyle: "bg-emerald-50 text-emerald-600",
          description: "Payments received",
        },
        {
          label: "Outstanding",
          value: formatCurrency(report.totalOutstandingAmount),
          icon: Clock3,
          iconStyle: "bg-amber-50 text-amber-600",
          description: "Remaining amount",
        },
      ]
    : [];

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-600">
            <BarChart3 size={17} />
            Analytics
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Reports
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Monitor sales performance and financial results.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => fetchReport(filters)}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>

          <button
            type="button"
            onClick={exportPDF}
            disabled={!isReady}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FileDown size={16} />
            Export PDF
          </button>

          <button
            type="button"
            onClick={exportCSV}
            disabled={!isReady}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FileSpreadsheet size={16} />
            Export CSV
          </button>

          <button
            type="button"
            onClick={printReport}
            disabled={!isReady}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Printer size={16} />
            Print
          </button>
        </div>
      </div>

      <form
        onSubmit={handleApplyFilters}
        className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
      >
        <div className="mb-4 flex items-center gap-2">
          <CalendarDays size={19} className="text-blue-600" />
          <h2 className="font-semibold text-gray-900">Report Period</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_auto_auto] xl:items-end">
          <div>
            <label
              htmlFor="from"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              From
            </label>
            <input
              id="from"
              name="from"
              type="date"
              value={filters.from}
              onChange={handleFilterChange}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label
              htmlFor="to"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              To
            </label>
            <input
              id="to"
              name="to"
              type="date"
              value={filters.to}
              onChange={handleFilterChange}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-50"
          >
            Apply Filters
          </button>

          <button
            type="button"
            onClick={handleResetFilters}
            disabled={loading}
            className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
          >
            Reset
          </button>
        </div>
      </form>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <AlertCircle size={19} className="mt-0.5 shrink-0" />
          <div className="flex-1">{error}</div>
          <button
            type="button"
            onClick={() => fetchReport(filters)}
            className="shrink-0 font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}

      {loading && !report ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-36 animate-pulse rounded-2xl border border-gray-200 bg-gray-100"
            />
          ))}
        </div>
      ) : report ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {kpis.map((kpi) => {
              const Icon = kpi.icon;

              return (
                <div
                  key={kpi.label}
                  className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        {kpi.label}
                      </p>
                      <p className="mt-3 break-words text-2xl font-bold text-gray-900">
                        {kpi.value}
                      </p>
                    </div>

                    <div className={`rounded-xl p-3 ${kpi.iconStyle}`}>
                      <Icon size={21} />
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-gray-500">
                    {kpi.description}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm xl:col-span-2 sm:p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Financial Summary
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Collected revenue compared with outstanding payments.
                  </p>
                </div>
                <TrendingUp size={22} className="text-blue-600" />
              </div>

              <div className="mt-7 space-y-6">
                <div>
                  <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium text-gray-600">
                      Amount Collected
                    </span>
                    <span className="font-bold text-gray-900">
                      {formatCurrency(report.totalPaidAmount)}
                    </span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all"
                      style={{
                        width: `${collectionRate}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium text-gray-600">
                      Outstanding Amount
                    </span>
                    <span className="font-bold text-gray-900">
                      {formatCurrency(report.totalOutstandingAmount)}
                    </span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-amber-500 transition-all"
                      style={{
                        width: `${
                          report.totalRevenue > 0
                            ? Math.min(
                                100,
                                (report.totalOutstandingAmount /
                                  report.totalRevenue) *
                                  100
                              )
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-emerald-50 p-4">
                  <p className="text-sm text-emerald-700">
                    Collection Rate
                  </p>
                  <p className="mt-1 text-2xl font-bold text-emerald-800">
                    {collectionRate.toFixed(1)}%
                  </p>
                </div>

                <div className="rounded-xl bg-blue-50 p-4">
                  <p className="text-sm text-blue-700">Reporting Period</p>
                  <p className="mt-2 break-words text-sm font-semibold text-blue-900">
                    {getPeriodLabel(filters)}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-lg font-bold text-gray-900">
                Report Overview
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Key figures for the selected period.
              </p>

              <div className="mt-5 divide-y divide-gray-100">
                {summaryRows.map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-start justify-between gap-3 py-4"
                  >
                    <span className="text-sm text-gray-500">{label}</span>
                    <span className="text-right text-sm font-semibold text-gray-900">
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={exportPDF}
                disabled={!isReady}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 px-4 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 disabled:opacity-50"
              >
                <FileDown size={17} />
                Download Financial Report
              </button>
            </section>
          </div>
        </>
      ) : (
        !loading && (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-500">
              <BarChart3 size={27} />
            </div>
            <h2 className="mt-4 text-lg font-bold text-gray-900">
              No report available
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
              We couldn't display the report. Check the connection and try again.
            </p>
            <button
              type="button"
              onClick={() => fetchReport(filters)}
              className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        )
      )}
    </div>
  );
}
