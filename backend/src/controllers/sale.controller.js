const prisma = require("../config/prisma");

// CREATE SALE

const createSale = async (req, res) => {
  const { customerId, items } = req.body;

  try {
    const parsedCustomerId = parseInt(customerId);

    if (
      !Number.isInteger(parsedCustomerId) ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        message: "CustomerId and items are required",
      });
    }

    const customer = await prisma.customer.findUnique({
      where: {
        id: parsedCustomerId,
      },
    });

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    const sale = await prisma.$transaction(async (tx) => {
      const saleItems = [];
      let totalAmount = 0;

      for (const item of items) {
        const productId = parseInt(item.productId);
        const quantity = parseInt(item.quantity);

        if (
          !Number.isInteger(productId) ||
          productId <= 0 ||
          !Number.isInteger(quantity) ||
          quantity <= 0
        ) {
          throw new Error("INVALID_PRODUCT_OR_QUANTITY");
        }

        const product = await tx.product.findUnique({
          where: {
            id: productId,
          },
        });

        if (!product) {
          throw new Error(`PRODUCT_NOT_FOUND:${productId}`);
        }

        if (!product.isActive) {
          throw new Error(`PRODUCT_INACTIVE:${product.name}`);
        }

        if (product.stock < quantity) {
          throw new Error(
            `INSUFFICIENT_STOCK:${product.name}:${product.stock}:${quantity}`
          );
        }

        // السعر الحقيقي من قاعدة البيانات
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

      const newSale = await tx.sale.create({
        data: {
          customerId: parsedCustomerId,
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

    if (error.message === "INVALID_PRODUCT_OR_QUANTITY") {
      return res.status(400).json({
        message: "Invalid productId or quantity",
      });
    }

    if (error.message.startsWith("PRODUCT_NOT_FOUND:")) {
      const productId = error.message.split(":")[1];

      return res.status(404).json({
        message: `Product ${productId} not found`,
      });
    }

    if (error.message.startsWith("PRODUCT_INACTIVE:")) {
      const productName = error.message.split(":")[1];

      return res.status(400).json({
        message: `Product ${productName} is inactive`,
      });
    }

    if (error.message.startsWith("INSUFFICIENT_STOCK:")) {
      const [, productName, currentStock, requestedQuantity] =
        error.message.split(":");

      return res.status(400).json({
        message: "Insufficient stock",
        product: productName,
        currentStock: Number(currentStock),
        requestedQuantity: Number(requestedQuantity),
      });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

//GET ALL SALES

const getAllSales = async (req, res) => {
  try {
    const {
      search,
      customerId,
      from,
      to,
      page = 1,
      limit = 10,
    } = req.query;

    const currentPage = Math.max(parseInt(page) || 1, 1);

    const itemsPerPage = Math.min(
      Math.max(parseInt(limit) || 10, 1),
      100
    );

    const skip = (currentPage - 1) * itemsPerPage;

    const where = {};

    // SEARCH BY CUSTOMER

    if (search) {
      where.customer = {
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
      };
    }

    // FILTER BY CUSTOMER

    if (customerId) {
      where.customerId = parseInt(customerId);
    }

    // FILTER BY DATE

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

    const [sales, totalSales] = await Promise.all([
      prisma.sale.findMany({
        where,
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
        skip,
        take: itemsPerPage,
      }),

      prisma.sale.count({
        where,
      }),
    ]);

    const totalPages = Math.ceil(
      totalSales / itemsPerPage
    );

    return res.status(200).json({
      message: "Sales retrieved successfully",
      sales,
      pagination: {
        page: currentPage,
        limit: itemsPerPage,
        totalSales,
        totalPages,
      },
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