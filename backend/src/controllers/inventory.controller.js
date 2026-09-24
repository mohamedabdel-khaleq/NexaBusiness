const prisma = require("../config/prisma");

const {
  notifyLowStock,
} = require("../services/notification.service");

// CREATE INVENTORY TRANSACTION
const createInventoryTransaction = async (req, res) => {
  const { productId, type, quantity, note } = req.body;

  try {
    // VALIDATE REQUIRED FIELDS
    if (!productId || !type || quantity === undefined) {
      return res.status(400).json({
        message: "ProductId, type and quantity are required",
      });
    }

    // VALIDATE TRANSACTION TYPE
    const allowedTypes = [
      "PURCHASE",
      "SALE",
      "RETURN",
      "DAMAGE",
      "ADJUSTMENT",
    ];

    if (!allowedTypes.includes(type)) {
      return res.status(400).json({
        message: "Invalid inventory transaction type",
      });
    }

    // VALIDATE QUANTITY
    const transactionQuantity = Number(quantity);

    if (
      !Number.isFinite(transactionQuantity) ||
      !Number.isInteger(transactionQuantity)
    ) {
      return res.status(400).json({
        message: "Quantity must be an integer",
      });
    }

    // Normal transactions must have positive quantity
    if (type !== "ADJUSTMENT" && transactionQuantity <= 0) {
      return res.status(400).json({
        message: "Quantity must be a positive integer",
      });
    }

    // Adjustment cannot be zero
    if (type === "ADJUSTMENT" && transactionQuantity === 0) {
      return res.status(400).json({
        message: "Adjustment quantity cannot be zero",
      });
    }

    // VALIDATE PRODUCT ID
    const parsedProductId = parseInt(productId);

    if (!Number.isInteger(parsedProductId) || parsedProductId <= 0) {
      return res.status(400).json({
        message: "ProductId must be a positive integer",
      });
    }

    // FIND PRODUCT
    const product = await prisma.product.findUnique({
      where: {
        id: parsedProductId,
      },
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    // CALCULATE STOCK CHANGE
    let stockChange = 0;

    if (type === "PURCHASE" || type === "RETURN") {
      stockChange = transactionQuantity;
    }

    if (type === "SALE" || type === "DAMAGE") {
      stockChange = -transactionQuantity;
    }

    if (type === "ADJUSTMENT") {
      stockChange = transactionQuantity;
    }

    // CALCULATE NEW STOCK
    const newStock = product.stock + stockChange;

    // Prevent negative stock
    if (newStock < 0) {
      return res.status(400).json({
        message: "Insufficient stock",
        currentStock: product.stock,
        requestedQuantity: transactionQuantity,
      });
    }

    // CREATE TRANSACTION + UPDATE STOCK
    const result = await prisma.$transaction(async (tx) => {
      const transaction = await tx.inventoryTransaction.create({
        data: {
          productId: parsedProductId,
          type,
          quantity: transactionQuantity,
          note,
        },
      });

      const updatedProduct = await tx.product.update({
        where: {
          id: parsedProductId,
        },
        data: {
          stock: newStock,
        },
      });

      return {
        transaction,
        product: updatedProduct,
      };
    });

    // LOW STOCK NOTIFICATION
    try {
      await notifyLowStock(result.product);

      console.log(
        `Low stock check completed for product #${result.product.id}`
      );
    } catch (notificationError) {
      // Notification failure should not fail the inventory transaction
      console.error(
        "Low stock notification error:",
        notificationError
      );
    }

    // SUCCESS RESPONSE
    return res.status(201).json({
      message: "Inventory transaction created successfully",
      transaction: result.transaction,
      product: result.product,
    });
  } catch (error) {
    console.error(
      "Create inventory transaction error:",
      error
    );

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// GET ALL INVENTORY TRANSACTIONS
const getAllInventoryTransactions = async (req, res) => {
  try {
    const transactions =
      await prisma.inventoryTransaction.findMany({
        include: {
          product: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    return res.status(200).json({
      message: "Inventory transactions retrieved successfully",
      transactions,
    });
  } catch (error) {
    console.error(
      "Get inventory transactions error:",
      error
    );

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// GET INVENTORY TRANSACTION BY ID
const getInventoryTransactionById = async (req, res) => {
  const { id } = req.params;

  try {
    const parsedId = parseInt(id);

    if (!Number.isInteger(parsedId) || parsedId <= 0) {
      return res.status(400).json({
        message: "Inventory transaction ID must be a positive integer",
      });
    }

    const transaction =
      await prisma.inventoryTransaction.findUnique({
        where: {
          id: parsedId,
        },
        include: {
          product: true,
        },
      });

    if (!transaction) {
      return res.status(404).json({
        message: "Inventory transaction not found",
      });
    }

    return res.status(200).json({
      message: "Inventory transaction retrieved successfully",
      transaction,
    });
  } catch (error) {
    console.error(
      "Get inventory transaction error:",
      error
    );

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

module.exports = {
  createInventoryTransaction,
  getAllInventoryTransactions,
  getInventoryTransactionById,
};