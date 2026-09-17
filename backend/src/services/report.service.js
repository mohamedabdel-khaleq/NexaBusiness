const prisma = require("../config/prisma");

const getSalesReport = async (from, to) => {
  const where = {};

  if (from || to) {
    where.createdAt = {};

    if (from) {
      where.createdAt.gte = new Date(`${from}T00:00:00.000Z`);
    }

    if (to) {
      where.createdAt.lte = new Date(`${to}T23:59:59.999Z`);
    }
  }

  const [salesCount, revenueResult, paidResult] = await Promise.all([
    prisma.sale.count({
      where,
    }),

    prisma.sale.aggregate({
      where,
      _sum: {
        totalAmount: true,
      },
    }),

    prisma.payment.aggregate({
      where: {
        status: "PAID",
        sale: where,
      },
      _sum: {
        amount: true,
      },
    }),
  ]);

  const totalRevenue = Number(
    revenueResult._sum.totalAmount || 0
  );

  const totalPaidAmount = Number(
    paidResult._sum.amount || 0
  );

  const totalOutstandingAmount = Math.max(
    0,
    totalRevenue - totalPaidAmount
  );

  return {
    salesCount,
    totalRevenue,
    totalPaidAmount,
    totalOutstandingAmount,
  };
};

module.exports = {
  getSalesReport,
};