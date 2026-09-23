const prisma = require("../config/prisma");

// GET DELIVERY ORDER TRACKING
const getDeliveryTracking = async (req, res) => {
  const deliveryOrderId = parseInt(req.params.id);

  try {
    if (!Number.isInteger(deliveryOrderId) || deliveryOrderId <= 0) {
      return res.status(400).json({
        message: "Delivery order ID must be a positive integer",
      });
    }

    const deliveryOrder = await prisma.deliveryOrder.findUnique({
      where: {
        id: deliveryOrderId,
      },
      include: {
        driver: {
          select: {
            id: true,
            name: true,
            phone: true,
            vehicleType: true,
            vehicleNumber: true,
            latitude: true,
            longitude: true,
            locationUpdatedAt: true,
          },
        },
        sale: {
          select: {
            id: true,
            status: true,
            customer: {
              select: {
                id: true,
                name: true,
                address: true,
              },
            },
          },
        },
      },
    });

    if (!deliveryOrder) {
      return res.status(404).json({
        message: "Delivery order not found",
      });
    }

    return res.status(200).json({
      message: "Delivery tracking retrieved successfully",
      tracking: {
        deliveryOrderId: deliveryOrder.id,
        status: deliveryOrder.status,
        address: deliveryOrder.address,
        deliveryFee: deliveryOrder.deliveryFee,
        estimatedDeliveryTime:
          deliveryOrder.estimatedDeliveryTime,

        driver: deliveryOrder.driver,

        customer: deliveryOrder.sale.customer,
      },
    });
  } catch (error) {
    console.error("Get delivery tracking error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

module.exports = {
  getDeliveryTracking,
};