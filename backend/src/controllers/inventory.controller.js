const prisma = require("../config/prisma");

//CREATE INVENTORY TRANSACTION

const createInventoryTransaction = async (req, res) => {
  const { productId, type, quantity, note } = req.body;

  try {
    //Validate required fields
    if (!productId || !type || quantity === undefined) {
      return res.status(400).json({
        message: "ProductId, type and quantity are required",
      });
    }

    //Validate quantity
    if (quantity <= 0) {
      return res.status(400).json({
        message: "Quantity must be greater than 0",
      });
    }

    //Validate transaction type
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

    //Find product
    const product = await prisma.product.findUnique({
      where: {
        id: parseInt(productId),
      },
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    //Calculate stock change
    let stockChange = 0;

    if (type === "PURCHASE" || type === "RETURN") {
      stockChange = quantity;
    }

    if (type === "SALE" || type === "DAMAGE") {
      stockChange = -quantity;
    }

    if (type === "ADJUSTMENT") {
      stockChange = quantity;
    }

    //Prevent negative stock
    const newStock = product.stock + stockChange;

    if (newStock < 0) {
      return res.status(400).json({
        message: "Insufficient stock",
        currentStock: product.stock,
        requestedQuantity: quantity,
      });
    }

    //Create transaction and update stock together
    const result = await prisma.$transaction(async (tx) => {
      const transaction = await tx.inventoryTransaction.create({
        data: {
          productId: parseInt(productId),
          type,
          quantity: parseInt(quantity),
          note,
        },
      });

      const updatedProduct = await tx.product.update({
        where: {
          id: parseInt(productId),
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

    //Send response
    return res.status(201).json({
      message: "Inventory transaction created successfully",
      transaction: result.transaction,
      product: result.product,
    });
  } catch (error) {
    console.error("Create inventory transaction error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

//GET ALL INVENTORY TRANSACTIONS

const getAllInventoryTransactions = async (req, res) => {
  try {
    const transactions = await prisma.inventoryTransaction.findMany({
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
    console.error("Get inventory transactions error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

//GET INVENTORY TRANSACTION BY ID

const getInventoryTransactionById = async (req, res) => {
  const { id } = req.params;

  try {
    const transaction = await prisma.inventoryTransaction.findUnique({
      where: {
        id: parseInt(id),
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
    console.error("Get inventory transaction error:", error);

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