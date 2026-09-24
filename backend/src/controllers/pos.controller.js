const prisma = require("../config/prisma");

const {
  createNotificationsForUsers,
} = require("../services/notification.service");

// POS CHECKOUT
const checkout = async (req, res) => {
  const { customerId, items, payment } = req.body;

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

    if (!payment || payment.amount === undefined || !payment.method) {
      return res.status(400).json({
        message: "Payment information is required",
      });
    }

    const paymentAmount = Number(payment.amount);

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

    if (!allowedMethods.includes(payment.method)) {
      return res.status(400).json({
        message: "Invalid payment method",
      });
    }

    // CHECK CUSTOMER
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

    // CREATE SALE TRANSACTION
    const result = await prisma.$transaction(async (tx) => {
      const saleItems = [];
      let totalAmount = 0;
      //Check products and calculate total
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

      //Payment must equal sale total
      if (paymentAmount !== totalAmount) {
        throw new Error(
          `INVALID_PAYMENT_AMOUNT:${totalAmount}:${paymentAmount}`
        );
      }

      //Create Sale
      const sale = await tx.sale.create({
        data: {
          customerId: parsedCustomerId,
          userId: req.user.id,
          totalAmount,
          status: "COMPLETED",
        },
      });

      //Create Sale Items
      for (const item of saleItems) {
        await tx.saleItem.create({
          data: {
            saleId: sale.id,
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
            note: `POS Sale #${sale.id}`,
          },
        });
      }

      // Create Payment
      const createdPayment = await tx.payment.create({
        data: {
          saleId: sale.id,
          amount: paymentAmount,
          method: payment.method,
          status: "PAID",
        },
      });

      //Return complete receipt data
      return {
        sale: await tx.sale.findUnique({
          where: {
            id: sale.id,
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
        }),

        payment: createdPayment,
      };
    });

    // AUTOMATIC NOTIFICATION → ADMINS
    try {
      const admins = await prisma.user.findMany({
        where: {
          role: {
            name: "ADMIN",
          },
        },
        select: {
          id: true,
        },
      });

      const adminIds = admins.map((admin) => admin.id);

      await createNotificationsForUsers({
        userIds: adminIds,
        title: "New Sale",
        message: `Sale #${result.sale.id} was created successfully. Total: ${result.sale.totalAmount}`,
        type: "SALE",
      });

      console.log(
        `Sale notification sent to ${adminIds.length} admin(s)`
      );
    } catch (notificationError) {
      // Notification failure should NOT fail the completed sale
      console.error(
        "Sale notification error:",
        notificationError
      );
    }

    // SUCCESS RESPONSE
    return res.status(201).json({
      message: "Checkout completed successfully",
      checkout: result,
    });
  } catch (error) {
    console.error("POS checkout error:", error);

    // ERROR HANDLING
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

    if (error.message.startsWith("INVALID_PAYMENT_AMOUNT:")) {
      const [, totalAmount, paymentAmount] =
        error.message.split(":");

      return res.status(400).json({
        message: "Payment amount must equal sale total",
        saleTotal: Number(totalAmount),
        paymentAmount: Number(paymentAmount),
      });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

module.exports = {
  checkout,
};