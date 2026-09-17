const prisma = require("../config/prisma");

const getDashboardStats = async () => {
  const [
    totalProducts,
    totalCustomers,
    totalEmployees,
    totalSales,
    totalPayments,
    revenueResult,
    paidAmountResult,
    lowStockProducts,
  ] = await Promise.all([
    prisma.product.count(),

    prisma.customer.count(),

    prisma.employee.count(),

    prisma.sale.count(),

    prisma.payment.count(),

    prisma.sale.aggregate({
      _sum: {
        totalAmount: true,
      },
    }),

    prisma.payment.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        status: "PAID",
      },
    }),

    prisma.product.count({
      where: {
        stock: {
          lte: 5,
        },
        isActive: true,
      },
    }),
  ]);

  const totalRevenue = Number(revenueResult._sum.totalAmount || 0);

  const totalPaidAmount = Number(
    paidAmountResult._sum.amount || 0
  );

  const totalOutstandingAmount =
    totalRevenue - totalPaidAmount;

  return {
    totalProducts,
    totalCustomers,
    totalEmployees,
    totalSales,
    totalRevenue,
    totalPayments,
    totalPaidAmount,
    totalOutstandingAmount,
    lowStockProducts,
  };
};

module.exports = {
  getDashboardStats,
};