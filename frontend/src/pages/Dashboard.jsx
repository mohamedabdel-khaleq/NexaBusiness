
import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Boxes,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  DollarSign,
  Package,
  Plus,
  RefreshCw,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import {
  getDashboardData,
  getSalesByPeriod,
} from "../services/dashboard.service";

{/*HELPERS*/}
function formatCurrency(value) {
  return new Intl.NumberFormat("en-EG", {
    style: "currency",
    currency: "EGP",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function formatCompactCurrency(value) {
  const number = Number(value || 0);

  if (number >= 1000000) {
    return `EGP ${(number / 1000000).toFixed(1)}M`;
  }

  if (number >= 1000) {
    return `EGP ${(number / 1000).toFixed(1)}K`;
  }

  return `EGP ${Math.round(number)}`;
}

function formatDate(date) {
  if (!date) return "-";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function formatChartDate(date) {
  if (!date) return "";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
  }).format(new Date(`${date}T00:00:00`));
}

function formatTime(date) {
  if (!date) return "-";

  return new Intl.DateTimeFormat("en-EG", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

{/*DASHBOARD*/}
export default function Dashboard() {
  const { user, token } = useAuth();
  const [dashboardData, setDashboardData] =
    useState(null);
  const [salesData, setSalesData] =
    useState([]);
  const [selectedPeriod, setSelectedPeriod] =
    useState("30D");
  const [loading, setLoading] =
    useState(true);
  const [salesLoading, setSalesLoading] =
    useState(false);
  const [error, setError] =
    useState("");
  const [refreshing, setRefreshing] =
    useState(false);

  {/*INITIAL DASHBOARD*/}
  useEffect(() => {
    let mounted = true;
    async function loadDashboard() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError("");

        const result =
          await getDashboardData(token);

        if (!mounted) return;

        setDashboardData(
          result?.dashboard || null
        );

        setSalesData(
          Array.isArray(result?.sales?.sales)
            ? result.sales.sales
            : []
        );
      } catch (err) {
        console.error(
          "Dashboard error:",
          err
        );

        if (mounted) {
          setError(
            "Unable to load dashboard data."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, [token]);

  {/* =======================================================
  SALES PERIOD*/}

  useEffect(() => {
    let mounted = true;

    async function loadSales() {
      if (!token) return;

      try {
        setSalesLoading(true);

        const result =
          await getSalesByPeriod(
            token,
            selectedPeriod
          );

        if (!mounted) return;

        setSalesData(
          Array.isArray(result?.sales?.sales)
            ? result.sales.sales
            : []
        );
      } catch (err) {
        console.error(
          "Sales period error:",
          err
        );
      } finally {
        if (mounted) {
          setSalesLoading(false);
        }
      }
    }

    loadSales();

    return () => {
      mounted = false;
    };
  }, [token, selectedPeriod]);

  {/*REFRESH*/}
  async function handleRefresh() {
    if (!token) return;

    try {
      setRefreshing(true);

      const result =
        await getDashboardData(token);

      setDashboardData(
        result?.dashboard || null
      );

      setSalesData(
        Array.isArray(result?.sales?.sales)
          ? result.sales.sales
          : []
      );

      const periodResult =
        await getSalesByPeriod(
          token,
          selectedPeriod
        );

      setSalesData(
        Array.isArray(
          periodResult?.sales?.sales
        )
          ? periodResult.sales.sales
          : []
      );
    } catch (err) {
      console.error(
        "Refresh error:",
        err
      );
    } finally {
      setRefreshing(false);
    }
  }

  {/*VALUES*/}
  const stats = useMemo(() => {
    const data = dashboardData || {};

    return [
      {
        title: "Total Revenue",
        value: formatCurrency(
          data.totalRevenue
        ),
        change: "+12.5%",
        positive: true,
        icon: DollarSign,
        iconBg: "bg-emerald-50",
        iconColor: "text-emerald-600",
      },
      {
        title: "Sales / Orders",
        value: data.totalSales ?? 0,
        change: "+8.2%",
        positive: true,
        icon: ShoppingCart,
        iconBg: "bg-blue-50",
        iconColor: "text-blue-600",
      },
      {
        title: "Products",
        value: data.totalProducts ?? 0,
        change: "+4.6%",
        positive: true,
        icon: Package,
        iconBg: "bg-violet-50",
        iconColor: "text-violet-600",
      },
      {
        title: "Customers",
        value: data.totalCustomers ?? 0,
        change: "+6.8%",
        positive: true,
        icon: Users,
        iconBg: "bg-amber-50",
        iconColor: "text-amber-600",
      },
    ];
  }, [dashboardData]);

  const recentSales = useMemo(() => {
    return [...salesData]
      .sort(
        (a, b) =>
          new Date(b.createdAt) -
          new Date(a.createdAt)
      )
      .slice(0, 5);
  }, [salesData]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <CalendarDays size={16} />

            <span>
              {formatDate(new Date())}
            </span>
          </div>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Good morning,{" "}
            {user?.name ||
              user?.username ||
              "Mohamed"}
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Here’s what’s happening with
            your business today.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            size={17}
            className={
              refreshing
                ? "animate-spin"
                : ""
            }
          />

          {refreshing
            ? "Refreshing..."
            : "Refresh"}
        </button>
      </div>

      {/*ERROR*/}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      {/*KPI CARDS*/}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard
            key={stat.title}
            {...stat}
          />
        ))}
      </div>

      {/*SALES OVERVIEW*/}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                <TrendingUp
                  size={18}
                  className="text-blue-600"
                />
              </div>

              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Sales Overview
                </h2>

                <p className="text-xs text-slate-400">
                  Revenue performance over
                  time
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {[
              ["7D", "7D"],
              ["30D", "30D"],
              ["3M", "3M"],
              ["6M", "6M"],
              ["1Y", "1Y"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() =>
                  setSelectedPeriod(
                    value
                  )
                }
                className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                  selectedPeriod === value
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-5 sm:p-6">
          {salesLoading ? (
            <div className="flex h-[380px] items-center justify-center">
              <div className="text-center">
                <RefreshCw
                  size={25}
                  className="mx-auto animate-spin text-blue-500"
                />

                <p className="mt-3 text-sm font-medium text-slate-500">
                  Loading sales...
                </p>
              </div>
            </div>
          ) : (
            <SalesChart
              sales={salesData}
              period={selectedPeriod}
            />
          )}
        </div>
      </section>

      {/*QUICK ACTIONS*/}
      <section>
        <div className="mb-4">
          <h2 className="text-base font-bold text-slate-900">
            Quick Actions
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            Quickly manage your business
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <QuickAction
            icon={Package}
            title="Add Product"
            description="Create a new product"
          />

          <QuickAction
            icon={Users}
            title="Add Customer"
            description="Create a customer"
          />

          <QuickAction
            icon={Plus}
            title="Create Sale"
            description="Create a new invoice"
          />
        </div>
      </section>

      {/*RECENT TRANSACTIONS*/}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Recent Transactions
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Latest sales activity
            </p>
          </div>

          <button
            type="button"
            className="flex w-fit items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            View all
            <ChevronDown
              size={14}
              className="-rotate-90"
            />
          </button>
        </div>

        {recentSales.length === 0 ? (
          <div className="flex h-48 items-center justify-center">
            <div className="text-center">
              <ShoppingCart
                size={30}
                className="mx-auto text-slate-300"
              />

              <p className="mt-3 text-sm font-semibold text-slate-500">
                No recent transactions
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">
                  <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Order
                  </th>

                  <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Customer
                  </th>

                  <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Status
                  </th>

                  <th className="px-6 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Amount
                  </th>

                  <th className="px-6 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Date
                  </th>
                </tr>
              </thead>

              <tbody>
                {recentSales.map(
                  (sale) => (
                    <tr
                      key={sale.id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60"
                    >
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-slate-800">
                          #
                          {String(
                            sale.id
                          ).padStart(
                            4,
                            "0"
                          )}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {sale.customer
                              ?.name ||
                              "Walk-in Customer"}
                          </p>

                          <p className="mt-0.5 text-xs text-slate-400">
                            {sale.customer
                              ?.email ||
                              "No email"}
                          </p>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <StatusBadge
                          status={
                            sale.status
                          }
                        />
                      </td>

                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-bold text-slate-900">
                          {formatCurrency(
                            sale.totalAmount
                          )}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div>
                          <p className="text-xs font-medium text-slate-600">
                            {formatDate(
                              sale.createdAt
                            )}
                          </p>

                          <p className="mt-0.5 text-[11px] text-slate-400">
                            {formatTime(
                              sale.createdAt
                            )}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

{/*SALES CHART*/}
function SalesChart({
  sales,
  period,
}) {
  const chartData = useMemo(() => {
    const days =
      period === "7D"
        ? 7
        : period === "30D"
        ? 30
        : period === "3M"
        ? 90
        : period === "6M"
        ? 180
        : 365;

    const today = new Date();

    today.setHours(
      0,
      0,
      0,
      0
    );

    const result = [];
    for (
      let i = days - 1;
      i >= 0;
      i--
    ) {
      const date = new Date(
        today
      );

      date.setDate(
        today.getDate() - i
      );

      const key = date
        .toISOString()
        .split("T")[0];

      result.push({
        date: key,
        amount: 0,
      });
    }

    if (Array.isArray(sales)) {
      sales.forEach((sale) => {
        if (!sale?.createdAt) {
          return;
        }

        const saleDate =
          new Date(
            sale.createdAt
          );

        if (
          Number.isNaN(
            saleDate.getTime()
          )
        ) {
          return;
        }

        const key = saleDate
          .toISOString()
          .split("T")[0];

        const amount = Number(
          sale.totalAmount || 0
        );

        const day = result.find(
          (item) =>
            item.date === key
        );

        if (day) {
          day.amount += amount;
        }
      });
    }

    return result;
  }, [sales, period]);

  const displayData = useMemo(() => {
    if (
      period === "7D" ||
      period === "30D"
    ) {
      return chartData;
    }

    if (
      period === "3M" ||
      period === "6M"
    ) {
      return groupByWeeks(
        chartData
      );
    }

    return groupByMonths(
      chartData
    );
  }, [chartData, period]);

  const totalSales =
    chartData.reduce(
      (sum, item) =>
        sum + item.amount,
      0
    );

  const maxValue = Math.max(
    ...displayData.map(
      (item) => item.amount
    ),
    1
  );

  const chartWidth = Math.max(
    950,
    displayData.length * 42
  );

  const chartHeight = 360;

  const paddingLeft = 70;
  const paddingRight = 25;
  const paddingTop = 30;
  const paddingBottom = 65;

  const graphWidth =
    chartWidth -
    paddingLeft -
    paddingRight;

  const graphHeight =
    chartHeight -
    paddingTop -
    paddingBottom;

  const graphBottom =
    paddingTop +
    graphHeight;

  const slotWidth =
    graphWidth /
    displayData.length;

  const barWidth =
    period === "30D"
      ? Math.min(
          18,
          slotWidth * 0.55
        )
      : Math.min(
          32,
          slotWidth * 0.6
        );

  return (
    <div>
      {/*CHART*/}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400">
            Period revenue
          </p>

          <p className="mt-1 text-xl font-bold text-slate-900">
            {formatCurrency(
              totalSales
            )}
          </p>
        </div>

        <div className="hidden items-center gap-2 sm:flex">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />

          <span className="text-xs font-medium text-slate-500">
            Sales revenue
          </span>
        </div>
      </div>

      {/*SCROLLABLE CHART*/}
      <div className="w-full overflow-x-auto rounded-xl bg-slate-50/60">
        <svg
          width="100%"
          height={chartHeight}
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          preserveAspectRatio="none"
          className="min-w-[950px]"
        >
          {/*HORIZONTAL GRID*/}
          {[0, 1, 2, 3, 4].map(
            (line) => {
              const y =
                paddingTop +
                (graphHeight / 4) *
                  line;

              const value =
                maxValue -
                (maxValue / 4) *
                  line;

              return (
                <g key={line}>
                  <line
                    x1={paddingLeft}
                    y1={y}
                    x2={
                      chartWidth -
                      paddingRight
                    }
                    y2={y}
                    stroke="#e2e8f0"
                    strokeWidth="1"
                    strokeDasharray="5 5"
                  />

                  <text
                    x={
                      paddingLeft - 12
                    }
                    y={y + 4}
                    textAnchor="end"
                    fontSize="11"
                    fontWeight="500"
                    fill="#94a3b8"
                  >
                    {formatCompactCurrency(
                      value
                    )}
                  </text>
                </g>
              );
            }
          )}

          {/*VERTICAL GRID*/}
          {displayData.map(
            (item, index) => {
              const x =
                paddingLeft +
                slotWidth * index +
                slotWidth / 2;
              const showVertical =
                period === "30D"
                  ? index % 3 === 0
                  : true;

              if (!showVertical) {
                return null;
              }

              return (
                <line
                  key={`grid-${item.date}`}
                  x1={x}
                  y1={paddingTop}
                  x2={x}
                  y2={graphBottom}
                  stroke="#eef2f7"
                  strokeWidth="1"
                  strokeDasharray="3 5"
                />
              );
            }
          )}

          <line
            x1={paddingLeft}
            y1={graphBottom}
            x2={
              chartWidth -
              paddingRight
            }
            y2={graphBottom}
            stroke="#cbd5e1"
            strokeWidth="1.5"
          />

          {/*BARS*/}
          {displayData.map(
            (item, index) => {
              const barHeight =
                item.amount > 0
                  ? (item.amount /
                      maxValue) *
                    graphHeight
                  : 0;

              const x =
                paddingLeft +
                slotWidth * index +
                slotWidth / 2;

              const y =
                graphBottom -
                barHeight;

              return (
                <g
                  key={`${item.date}-${index}`}
                  className="group"
                >
                  {item.amount > 0 ? (
                    <rect
                      x={
                        x -
                        barWidth / 2
                      }
                      y={y}
                      width={barWidth}
                      height={
                        barHeight
                      }
                      rx="5"
                      fill="#3b82f6"
                      className="cursor-pointer opacity-90 transition-all duration-150 hover:opacity-100"
                    />
                  ) : (
                    /* Empty day */
                    <rect
                      x={
                        x -
                        barWidth / 2
                      }
                      y={
                        graphBottom -
                        2
                      }
                      width={barWidth}
                      height="2"
                      rx="1"
                      fill="#cbd5e1"
                    />
                  )}

                  {/*HOVER TOOLTIP*/}
                  <g className="pointer-events-none opacity-0 transition-opacity group-hover:opacity-100">
                    {/* Tooltip shadow/background */}

                    <rect
                      x={
                        x - 62
                      }
                      y={Math.max(
                        y - 72,
                        8
                      )}
                      width="124"
                      height="58"
                      rx="9"
                      fill="#0f172a"
                    />

                    {/* Amount */}

                    <text
                      x={x}
                      y={Math.max(
                        y - 47,
                        31
                      )}
                      textAnchor="middle"
                      fontSize="12"
                      fontWeight="700"
                      fill="#ffffff"
                    >
                      {formatCurrency(
                        item.amount
                      )}
                    </text>

                    {/* Date */}

                    <text
                      x={x}
                      y={Math.max(
                        y - 28,
                        50
                      )}
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight="500"
                      fill="#cbd5e1"
                    >
                      {formatChartDate(
                        item.date
                      )}
                    </text>
                  </g>

                  {/*DATE LABELS*/}
                  {(
                    period === "7D" ||
                    index % 3 === 0 ||
                    index ===
                      displayData.length -
                        1
                  ) && (
                    <text
                      x={x}
                      y={
                        chartHeight -
                        25
                      }
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight="500"
                      fill="#94a3b8"
                    >
                      {formatChartDate(
                        item.date
                      )}
                    </text>
                  )}
                </g>
              );
            }
          )}
        </svg>
      </div>

      {/*CHART FOOTER*/}
      <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />

          <span className="text-xs font-medium text-slate-500">
            Sales
          </span>

          <span className="text-xs text-slate-300">
            •
          </span>

          <span className="text-xs text-slate-400">
            Empty days = 0
          </span>
        </div>

        <p className="text-xs text-slate-400">
          {chartData.filter(
            (item) =>
              item.amount > 0
          ).length}{" "}
          active sales days
        </p>
      </div>
    </div>
  );
}

{/*WEEK GROUPING*/}
function groupByWeeks(data) {
  const result = [];
  for (
    let i = 0;
    i < data.length;
    i += 7
  ) {
    const week = data.slice(
      i,
      i + 7
    );

    if (!week.length) {
      continue;
    }

    result.push({
      date: week[0].date,
      amount: week.reduce(
        (sum, item) =>
          sum + item.amount,
        0
      ),
    });
  }

  return result;
}

{/*MONTH GROUPING*/}
function groupByMonths(data) {
  const grouped = {};
  data.forEach((item) => {
    const month =
      item.date.slice(0, 7);

    if (!grouped[month]) {
      grouped[month] = 0;
    }

    grouped[month] += item.amount;
  });

  return Object.entries(
    grouped
  ).map(
    ([month, amount]) => ({
      date: `${month}-01`,
      amount,
    })
  );
}

{/*STAT CARD*/}
function StatCard({
  title,
  value,
  change,
  positive,
  icon: Icon,
  iconBg,
  iconColor,
}) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconBg}`}
        >
          <Icon
            size={21}
            className={iconColor}
          />
        </div>

        <div
          className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold ${
            positive
              ? "bg-emerald-50 text-emerald-600"
              : "bg-red-50 text-red-600"
          }`}
        >
          {positive ? (
            <ArrowUpRight size={13} />
          ) : (
            <ArrowDownRight
              size={13}
            />
          )}

          {change}
        </div>
      </div>

      <div className="mt-5">
        <p className="text-xs font-medium text-slate-400">
          {title}
        </p>

        <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
          {value}
        </p>
      </div>

      <div className="mt-4">
        <Sparkline positive={positive} />
      </div>
    </div>
  );
}

{/*SPARKLINE*/}
function Sparkline({
  positive = true,
}) {
  return (
    <svg
      width="100%"
      height="32"
      viewBox="0 0 120 32"
      preserveAspectRatio="none"
    >
      <polyline
        points={
          positive
            ? "0,25 15,23 30,25 45,17 60,20 75,13 90,15 105,7 120,9"
            : "0,8 15,12 30,10 45,18 60,15 75,23 90,20 105,27 120,24"
        }
        fill="none"
        stroke={
          positive
            ? "#10b981"
            : "#ef4444"
        }
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

{/*QUICK ACTION*/}
function QuickAction({
  icon: Icon,
  title,
  description,
}) {
  return (
    <button
      type="button"
      className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
        <Icon size={20} />
      </div>

      <div className="min-w-0">
        <p className="text-sm font-bold text-slate-800">
          {title}
        </p>

        <p className="mt-0.5 text-xs text-slate-400">
          {description}
        </p>
      </div>

      <Plus
        size={17}
        className="ml-auto text-slate-300 transition group-hover:text-blue-500"
      />
    </button>
  );
}

{/*STATUS BADGE*/}
function StatusBadge({
  status,
}) {
  const normalized =
    String(
      status || ""
    ).toUpperCase();

  const config =
    normalized === "COMPLETED"
      ? {
          label: "Completed",
          className:
            "bg-emerald-50 text-emerald-600",
          icon: CheckCircle2,
        }
      : normalized ===
        "PENDING"
      ? {
          label: "Pending",
          className:
            "bg-amber-50 text-amber-600",
          icon: Clock3,
        }
      : {
          label:
            normalized || "Unknown",
          className:
            "bg-slate-100 text-slate-600",
          icon: Clock3,
        };

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${config.className}`}
    >
      <Icon size={12} />

      {config.label}
    </span>
  );
}

{/*SKELETON*/}
function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-24 rounded-2xl bg-slate-200" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map(
          (item) => (
            <div
              key={item}
              className="h-40 rounded-2xl bg-slate-200"
            />
          )
        )}
      </div>

      <div className="h-[500px] rounded-2xl bg-slate-200" />

      <div className="h-32 rounded-2xl bg-slate-200" />

      <div className="h-72 rounded-2xl bg-slate-200" />
    </div>
  );
}
