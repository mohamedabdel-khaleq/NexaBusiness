const prisma = require("../config/prisma");

// CREATE DELIVERY DRIVER
const createDeliveryDriver = async (req, res) => {
  const {
    name,
    phone,
    vehicleType,
    vehicleNumber,
    isActive,
  } = req.body;

  try {
    const driver = await prisma.deliveryDriver.create({
      data: {
        name,
        phone,
        vehicleType,
        vehicleNumber,
        isActive,
      },
    });

    return res.status(201).json({
      message: "Delivery driver created successfully",
      driver,
    });
  } catch (error) {
    console.error("Create delivery driver error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// GET ALL DELIVERY DRIVERS
const getAllDeliveryDrivers = async (req, res) => {
  try {
    const drivers = await prisma.deliveryDriver.findMany({
      include: {
        deliveryOrders: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      message: "Delivery drivers retrieved successfully",
      drivers,
    });
  } catch (error) {
    console.error("Get delivery drivers error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// GET DELIVERY DRIVER BY ID
const getDeliveryDriverById = async (req, res) => {
  const driverId = parseInt(req.params.id);

  try {
    if (!Number.isInteger(driverId) || driverId <= 0) {
      return res.status(400).json({
        message: "Driver ID must be a positive integer",
      });
    }

    const driver = await prisma.deliveryDriver.findUnique({
      where: {
        id: driverId,
      },
      include: {
        deliveryOrders: true,
      },
    });

    if (!driver) {
      return res.status(404).json({
        message: "Delivery driver not found",
      });
    }

    return res.status(200).json({
      message: "Delivery driver retrieved successfully",
      driver,
    });
  } catch (error) {
    console.error("Get delivery driver error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// UPDATE DELIVERY DRIVER
const updateDeliveryDriver = async (req, res) => {
  const driverId = parseInt(req.params.id);

  try {
    if (!Number.isInteger(driverId) || driverId <= 0) {
      return res.status(400).json({
        message: "Driver ID must be a positive integer",
      });
    }

    const existingDriver = await prisma.deliveryDriver.findUnique({
      where: {
        id: driverId,
      },
    });

    if (!existingDriver) {
      return res.status(404).json({
        message: "Delivery driver not found",
      });
    }

    const driver = await prisma.deliveryDriver.update({
      where: {
        id: driverId,
      },
      data: req.body,
    });

    return res.status(200).json({
      message: "Delivery driver updated successfully",
      driver,
    });
  } catch (error) {
    console.error("Update delivery driver error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// DELETE DELIVERY DRIVER
const deleteDeliveryDriver = async (req, res) => {
  const driverId = parseInt(req.params.id);

  try {
    if (!Number.isInteger(driverId) || driverId <= 0) {
      return res.status(400).json({
        message: "Driver ID must be a positive integer",
      });
    }

    const existingDriver = await prisma.deliveryDriver.findUnique({
      where: {
        id: driverId,
      },
      include: {
        deliveryOrders: true,
      },
    });

    if (!existingDriver) {
      return res.status(404).json({
        message: "Delivery driver not found",
      });
    }

    if (existingDriver.deliveryOrders.length > 0) {
      return res.status(409).json({
        message:
          "Cannot delete driver with existing delivery orders",
      });
    }

    await prisma.deliveryDriver.delete({
      where: {
        id: driverId,
      },
    });

    return res.status(200).json({
      message: "Delivery driver deleted successfully",
    });
  } catch (error) {
    console.error("Delete delivery driver error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

module.exports = {
  createDeliveryDriver,
  getAllDeliveryDrivers,
  getDeliveryDriverById,
  updateDeliveryDriver,
  deleteDeliveryDriver,
};