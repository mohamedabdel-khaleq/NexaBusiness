import API from "./api";
function formatDate(date) {
  return date.toISOString().split("T")[0];
}
function getPeriodDates(period) {
  const to = new Date();
  const from = new Date(to);

  switch (period) {
    case "7D":
      from.setDate(from.getDate() - 7);
      break;

    case "30D":
      from.setDate(from.getDate() - 30);
      break;

    case "3M":
      from.setMonth(from.getMonth() - 3);
      break;

    case "6M":
      from.setMonth(from.getMonth() - 6);
      break;

    case "1Y":
      from.setFullYear(from.getFullYear() - 1);
      break;

    default:
      from.setDate(from.getDate() - 30);
  }

  return {
    from: formatDate(from),
    to: formatDate(to),
  };
}

export async function getDashboardData(token) {
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const [dashboardResult, salesReportResult, salesResult] =
    await Promise.allSettled([
      API.get("/dashboard", {
        headers,
      }),

      API.get("/reports/sales", {
        headers,
      }),

      API.get("/sales", {
        headers,
        params: {
          page: 1,
          limit: 5,
        },
      }),
    ]);

  return {
    dashboard:
      dashboardResult.status === "fulfilled"
        ? dashboardResult.value.data
        : null,

    salesReport:
      salesReportResult.status === "fulfilled"
        ? salesReportResult.value.data
        : null,

    sales:
      salesResult.status === "fulfilled"
        ? salesResult.value.data
        : {
            sales: [],
            pagination: {
              page: 1,
              limit: 5,
              totalSales: 0,
              totalPages: 0,
            },
          },
  };
}

/*
|--------------------------------------------------------------------------
| Sales By Period
|--------------------------------------------------------------------------
*/

export async function getSalesByPeriod(token, period = "30D") {
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const { from, to } = getPeriodDates(period);

  const [salesResult, reportResult] = await Promise.allSettled([
    API.get("/sales", {
      headers,
      params: {
        page: 1,
        limit: 100,
        from,
        to,
      },
    }),

    API.get("/reports/sales", {
      headers,
      params: {
        from,
        to,
      },
    }),
  ]);

  return {
    sales:
      salesResult.status === "fulfilled"
        ? salesResult.value.data
        : {
            sales: [],
          },

    report:
      reportResult.status === "fulfilled"
        ? reportResult.value.data
        : null,

    period,
    from,
    to,
  };
}