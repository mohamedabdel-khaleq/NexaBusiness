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
    });

    if (!sale) {
      return res.status(404).json({
        message: "Sale not found",
      });
    }

    const paymentAmount = Number(amount);

    if (paymentAmount <= 0) {
      return res.status(400).json({
        message: "Payment amount must be greater than 0",
      });
    }

    if (paymentAmount > Number(sale.totalAmount)) {
      return res.status(400).json({
        message: "Payment amount cannot exceed sale total",
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

    const payment = await prisma.payment.create({
      data: {
        saleId: parseInt(saleId),
        amount: paymentAmount,
        method,
        status: "PAID",
      },
    });

    return res.status(201).json({
      message: "Payment created successfully",
      payment,
    });
  } catch (error) {
    console.error("Create payment error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

//GET ALL PAYMENTS

const getAllPayments = async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
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
    });

    return res.status(200).json({
      message: "Payments retrieved successfully",
      payments,
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