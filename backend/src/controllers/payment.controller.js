const prisma = require("../config/prisma");

//CREATE PAYMENT

const createPayment = async (req, res) => {
  const { saleId, amount, method } = req.body;

  try {
    if (!saleId || amount === undefined || !method) {
      return res.status(400).json({
        message: "SaleId, amount and method are required",
      });
    }

    const sale = await prisma.sale.findUnique({
      where: {
        id: parseInt(saleId),
      },
      include: {
        payments: true,
      },
    });

    if (!sale) {
      return res.status(404).json({
        message: "Sale not found",
      });
    }

    const paymentAmount = Number(amount);

    if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
      return res.status(400).json({
        message: "Payment amount must be greater than 0",
      });
    }

    const allowedMethods = [
      "CASH",
      "CARD",
      "BANK_TRANSFER",
      "WALLET",
    ];

    if (!allowedMethods.includes(method)) {
      return res.status(400).json({
        message: "Invalid payment method",
      });
    }

    // Calculate previous payments

    const totalPaid = sale.payments.reduce(
      (total, payment) => total + Number(payment.amount),
      0
    );

    const saleTotal = Number(sale.totalAmount);

    const remainingAmount = saleTotal - totalPaid;

    // Prevent overpayment

    if (paymentAmount > remainingAmount) {
      return res.status(400).json({
        message: "Payment amount exceeds remaining balance",
        saleTotal,
        totalPaid,
        remainingAmount,
        requestedAmount: paymentAmount,
      });
    }

    // Create payment

    const payment = await prisma.payment.create({
      data: {
        saleId: parseInt(saleId),
        amount: paymentAmount,
        method,
        status: "PAID",
      },
    });

    // Calculate new payment status

    const newTotalPaid = totalPaid + paymentAmount;

    let paymentStatus = "UNPAID";

    if (newTotalPaid >= saleTotal) {
      paymentStatus = "PAID";
    } else if (newTotalPaid > 0) {
      paymentStatus = "PARTIALLY_PAID";
    }

    return res.status(201).json({
      message: "Payment created successfully",
      payment,
      summary: {
        saleTotal,
        totalPaid: newTotalPaid,
        remainingAmount: saleTotal - newTotalPaid,
        paymentStatus,
      },
    });
  } catch (error) {
    console.error("Create payment error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// GET ALL PAYMENTS

const getAllPayments = async (req, res) => {
  try {
    const {
      search,
      saleId,
      from,
      to,
      page = 1,
      limit = 10,
    } = req.query;

    const currentPage = Math.max(
      parseInt(page) || 1,
      1
    );

    const itemsPerPage = Math.min(
      Math.max(parseInt(limit) || 10, 1),
      100
    );

    const skip = (currentPage - 1) * itemsPerPage;

    const where = {};

    // Search by customer name, email or phone
    if (search) {
      where.sale = {
        customer: {
          OR: [
            {
              name: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              email: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              phone: {
                contains: search,
                mode: "insensitive",
              },
            },
          ],
        },
      };
    }

    // Filter by sale
    if (saleId) {
      where.saleId = parseInt(saleId);
    }

    // Filter by date
    if (from || to) {
      where.createdAt = {};

      if (from) {
        where.createdAt.gte = new Date(
          `${from}T00:00:00.000Z`
        );
      }

      if (to) {
        where.createdAt.lte = new Date(
          `${to}T23:59:59.999Z`
        );
      }
    }

    const [payments, totalPayments] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          sale: {
            include: {
              customer: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: itemsPerPage,
      }),

      prisma.payment.count({
        where,
      }),
    ]);

    const totalPages = Math.ceil(
      totalPayments / itemsPerPage
    );

    return res.status(200).json({
      message: "Payments retrieved successfully",
      payments,
      pagination: {
        page: currentPage,
        limit: itemsPerPage,
        totalPayments,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Get payments error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

//GET PAYMENT BY ID

const getPaymentById = async (req, res) => {
  const { id } = req.params;

  try {
    const payment = await prisma.payment.findUnique({
      where: {
        id: parseInt(id),
      },
      include: {
        sale: {
          include: {
            customer: true,
          },
        },
      },
    });

    if (!payment) {
      return res.status(404).json({
        message: "Payment not found",
      });
    }

    return res.status(200).json({
      message: "Payment retrieved successfully",
      payment,
    });
  } catch (error) {
    console.error("Get payment error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

module.exports = {
  createPayment,
  getAllPayments,
  getPaymentById,
};