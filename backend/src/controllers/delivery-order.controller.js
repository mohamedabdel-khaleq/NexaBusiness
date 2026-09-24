const prisma = require("../config/prisma");
const {
  notifyAdmins,
} = require("../services/notification.service");

// CREATE DELIVERY ORDER
const createDeliveryOrder = async (req, res) => {
  const {
    saleId,
    driverId,
    address,
    latitude,
    longitude,
    deliveryFee,
    status,
    estimatedDeliveryTime,
    notes,
  } = req.body;

  try {
    const parsedSaleId = parseInt(saleId);

    const parsedDriverId =
      driverId !== undefined ? parseInt(driverId) : undefined;

    // CHECK SALE
    const sale = await prisma.sale.findUnique({
      where: {
        id: parsedSaleId,
      },
    });

    if (!sale) {
      return res.status(404).json({
        message: "Sale not found",
      });
    }

    // CHECK EXISTING DELIVERY ORDER
    const existingDeliveryOrder =
      await prisma.deliveryOrder.findUnique({
        where: {
          saleId: parsedSaleId,
        },
      });

    if (existingDeliveryOrder) {
      return res.status(409).json({
        message: "Delivery order already exists for this sale",
      });
    }
    // CHECK DRIVER
    if (parsedDriverId !== undefined) {
      const driver = await prisma.deliveryDriver.findUnique({
        where: {
          id: parsedDriverId,
        },
      });

      if (!driver) {
        return res.status(404).json({
          message: "Delivery driver not found",
        });
      }

      if (!driver.isActive) {
        return res.status(400).json({
          message: "Delivery driver is inactive",
        });
      }
    }

    // CREATE DELIVERY ORDER
    const deliveryOrder = await prisma.deliveryOrder.create({
      data: {
        saleId: parsedSaleId,
        driverId: parsedDriverId,
        address,
        latitude,
        longitude,
        deliveryFee,
        status,
        estimatedDeliveryTime,
        notes,
      },
      include: {
        sale: {
          include: {
            customer: true,
            items: {
              include: {
                product: true,
              },
            },
          },
        },
        driver: true,
      },
    });


    // AUTOMATIC DELIVERY NOTIFICATION
    try {
      await notifyAdmins({
        title: "New Delivery Order",
        message: `Delivery order #${deliveryOrder.id} was created for Sale #${deliveryOrder.saleId}. Status: ${deliveryOrder.status}.`,
        type: "DELIVERY",
      });

      console.log(
        `Delivery creation notification sent for order #${deliveryOrder.id}`
      );
    } catch (notificationError) {
      // Notification failure should not fail delivery creation
      console.error(
        "Delivery notification error:",
        notificationError
      );
    }

    // SUCCESS RESPONSE
    return res.status(201).json({
      message: "Delivery order created successfully",
      deliveryOrder,
    });
  } catch (error) {
    console.error(
      "Create delivery order error:",
      error
    );

    if (error.code === "P2002") {
      return res.status(409).json({
        message: "Delivery order already exists for this sale",
      });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// GET ALL DELIVERY ORDERS
const getAllDeliveryOrders = async (req, res) => {
  try {
    const deliveryOrders =
      await prisma.deliveryOrder.findMany({
        include: {
          sale: {
            include: {
              customer: true,
            },
          },
          driver: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    return res.status(200).json({
      message: "Delivery orders retrieved successfully",
      deliveryOrders,
    });
  } catch (error) {
    console.error(
      "Get delivery orders error:",
      error
    );

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// GET DELIVERY ORDER BY ID
const getDeliveryOrderById = async (req, res) => {
  const deliveryOrderId = parseInt(req.params.id);

  try {
    if (
      !Number.isInteger(deliveryOrderId) ||
      deliveryOrderId <= 0
    ) {
      return res.status(400).json({
        message:
          "Delivery order ID must be a positive integer",
      });
    }

    const deliveryOrder =
      await prisma.deliveryOrder.findUnique({
        where: {
          id: deliveryOrderId,
        },
        include: {
          sale: {
            include: {
              customer: true,
              items: {
                include: {
                  product: true,
                },
              },
            },
          },
          driver: true,
        },
      });

    if (!deliveryOrder) {
      return res.status(404).json({
        message: "Delivery order not found",
      });
    }

    return res.status(200).json({
      message: "Delivery order retrieved successfully",
      deliveryOrder,
    });
  } catch (error) {
    console.error(
      "Get delivery order error:",
      error
    );

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// UPDATE DELIVERY ORDER
const updateDeliveryOrder = async (req, res) => {
  const deliveryOrderId = parseInt(req.params.id);

  try {
    if (
      !Number.isInteger(deliveryOrderId) ||
      deliveryOrderId <= 0
    ) {
      return res.status(400).json({
        message:
          "Delivery order ID must be a positive integer",
      });
    }

    // FIND EXISTING DELIVERY ORDER
    const existingDeliveryOrder =
      await prisma.deliveryOrder.findUnique({
        where: {
          id: deliveryOrderId,
        },
      });

    if (!existingDeliveryOrder) {
      return res.status(404).json({
        message: "Delivery order not found",
      });
    }

    // PREVENT CHANGES AFTER DELIVERY
    if (
      existingDeliveryOrder.status === "DELIVERED" &&
      req.body.status !== "DELIVERED"
    ) {
      return res.status(400).json({
        message: "Delivered orders cannot change status",
      });
    }

    // DELIVERY STATUS STATE MACHINE
    const allowedTransitions = {
      PENDING: ["ASSIGNED", "CANCELLED"],
      ASSIGNED: ["PICKED_UP", "CANCELLED"],
      PICKED_UP: ["IN_TRANSIT", "CANCELLED"],
      IN_TRANSIT: ["DELIVERED", "CANCELLED"],
      DELIVERED: [],
      CANCELLED: [],
    };

    // CHECK STATUS TRANSITION
    if (
      req.body.status !== undefined &&
      req.body.status !== existingDeliveryOrder.status
    ) {
      const currentStatus = existingDeliveryOrder.status;
      const newStatus = req.body.status;

      if (
        !allowedTransitions[currentStatus]?.includes(
          newStatus
        )
      ) {
        return res.status(400).json({
          message: `Invalid delivery status transition from ${currentStatus} to ${newStatus}`,
        });
      }
    }

    // CHECK DRIVER
    if (req.body.driverId !== undefined) {
      const driverId =
        req.body.driverId === null
          ? null
          : parseInt(req.body.driverId);

      if (driverId !== null) {
        const driver =
          await prisma.deliveryDriver.findUnique({
            where: {
              id: driverId,
            },
          });

        if (!driver) {
          return res.status(404).json({
            message: "Delivery driver not found",
          });
        }

        if (!driver.isActive) {
          return res.status(400).json({
            message: "Delivery driver is inactive",
          });
        }
      }
    }

    // PREPARE UPDATE DATA
    const updateData = {
      ...req.body,
    };

    // Record pickup time
    if (
      req.body.status === "PICKED_UP" &&
      existingDeliveryOrder.pickedUpAt === null
    ) {
      updateData.pickedUpAt = new Date();
    }

    // Record delivery time
    if (
      req.body.status === "DELIVERED" &&
      existingDeliveryOrder.deliveredAt === null
    ) {
      updateData.deliveredAt = new Date();
    }

    // UPDATE DELIVERY ORDER
    const deliveryOrder =
      await prisma.deliveryOrder.update({
        where: {
          id: deliveryOrderId,
        },
        data: updateData,
        include: {
          sale: {
            include: {
              customer: true,
            },
          },
          driver: true,
        },
      });

    // AUTOMATIC STATUS NOTIFICATION
    const statusChanged =
      req.body.status !== undefined &&
      req.body.status !== existingDeliveryOrder.status;

    if (statusChanged) {
      try {
        await notifyAdmins({
          title: "Delivery Status Updated",
          message: `Delivery order #${deliveryOrder.id} status changed from ${existingDeliveryOrder.status} to ${deliveryOrder.status}.`,
          type: "DELIVERY",
        });

        console.log(
          `Delivery status notification sent for order #${deliveryOrder.id}`
        );
      } catch (notificationError) {
        // Notification failure should not fail delivery update
        console.error(
          "Delivery status notification error:",
          notificationError
        );
      }
    }

    // SUCCESS RESPONSE
    return res.status(200).json({
      message: "Delivery order updated successfully",
      deliveryOrder,
    });
  } catch (error) {
    console.error(
      "Update delivery order error:",
      error
    );

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// DELETE DELIVERY ORDER
const deleteDeliveryOrder = async (req, res) => {
  const deliveryOrderId = parseInt(req.params.id);

  try {
    if (
      !Number.isInteger(deliveryOrderId) ||
      deliveryOrderId <= 0
    ) {
      return res.status(400).json({
        message:
          "Delivery order ID must be a positive integer",
      });
    }

    const existingDeliveryOrder =
      await prisma.deliveryOrder.findUnique({
        where: {
          id: deliveryOrderId,
        },
      });

    if (!existingDeliveryOrder) {
      return res.status(404).json({
        message: "Delivery order not found",
      });
    }

    await prisma.deliveryOrder.delete({
      where: {
        id: deliveryOrderId,
      },
    });

    return res.status(200).json({
      message: "Delivery order deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete delivery order error:",
      error
    );

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

module.exports = {
  createDeliveryOrder,
  getAllDeliveryOrders,
  getDeliveryOrderById,
  updateDeliveryOrder,
  deleteDeliveryOrder,
};