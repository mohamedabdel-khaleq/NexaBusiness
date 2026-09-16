const prisma = require("../config/prisma");

//CREATE SALE 

const createSale = async (req, res) => {
  const { customerId, items } = req.body;

  try {
    if (!customerId || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "CustomerId and items are required",
      });
    }

    const customer = await prisma.customer.findUnique({
      where: {
        id: parseInt(customerId),
      },
    });

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    const saleItems = [];
    let totalAmount = 0;

    for (const item of items) {
      const productId = parseInt(item.productId);
      const quantity = parseInt(item.quantity);

      if (!productId || !Number.isInteger(quantity) || quantity <= 0) {
        return res.status(400).json({
          message: "Invalid productId or quantity",
        });
      }

      const product = await prisma.product.findUnique({
        where: {
          id: productId,
        },
      });

      if (!product) {
        return res.status(404).json({
          message: `Product ${productId} not found`,
        });
      }

      if (!product.isActive) {
        return res.status(400).json({
          message: `Product ${product.name} is inactive`,
        });
      }

      if (product.stock < quantity) {
        return res.status(400).json({
          message: "Insufficient stock",
          product: product.name,
          currentStock: product.stock,
          requestedQuantity: quantity,
        });
      }

      const unitPrice = Number(product.price);
      const subtotal = unitPrice * quantity;

      totalAmount += subtotal;

      saleItems.push({
        productId,
        quantity,
        unitPrice,
        subtotal,
      });
    }

    const sale = await prisma.$transaction(async (tx) => {
      const newSale = await tx.sale.create({
        data: {
          customerId: parseInt(customerId),
          userId: req.user.id,
          totalAmount,
          status: "COMPLETED",
        },
      });

      for (const item of saleItems) {
        await tx.saleItem.create({
          data: {
            saleId: newSale.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.subtotal,
          },
        });

        await tx.product.update({
          where: {
            id: item.productId,
          },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });

        await tx.inventoryTransaction.create({
          data: {
            productId: item.productId,
            type: "SALE",
            quantity: item.quantity,
            note: `Sale #${newSale.id}`,
          },
        });
      }

      return tx.sale.findUnique({
        where: {
          id: newSale.id,
        },
        include: {
          customer: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          items: {
            include: {
              product: true,
            },
          },
          payments: true,
        },
      });
    });

    return res.status(201).json({
      message: "Sale created successfully",
      sale,
    });
  } catch (error) {
    console.error("Create sale error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

//GET ALL SALES

const getAllSales = async (req, res) => {
  try {
    const sales = await prisma.sale.findMany({
      include: {
        customer: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
        payments: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      message: "Sales retrieved successfully",
      sales,
    });
  } catch (error) {
    console.error("Get sales error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

//GET SALE BY ID

const getSaleById = async (req, res) => {
  const { id } = req.params;

  try {
    const sale = await prisma.sale.findUnique({
      where: {
        id: parseInt(id),
      },
      include: {
        customer: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
        payments: true,
      },
    });

    if (!sale) {
      return res.status(404).json({
        message: "Sale not found",
      });
    }

    return res.status(200).json({
      message: "Sale retrieved successfully",
      sale,
    });
  } catch (error) {
    console.error("Get sale error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

module.exports = {
  createSale,
  getAllSales,
  getSaleById,
};