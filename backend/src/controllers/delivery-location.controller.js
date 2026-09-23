const prisma = require("../config/prisma");

// UPDATE DRIVER LOCATION
const updateDriverLocation = async (req, res) => {
  const driverId = parseInt(req.params.driverId);

  const { latitude, longitude } = req.body;

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

    const updatedDriver = await prisma.deliveryDriver.update({
      where: {
        id: driverId,
      },
      data: {
        latitude,
        longitude,
        locationUpdatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        latitude: true,
        longitude: true,
        locationUpdatedAt: true,
      },
    });

    return res.status(200).json({
      message: "Driver location updated successfully",
      driver: updatedDriver,
    });
  } catch (error) {
    console.error("Update driver location error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

module.exports = {
  updateDriverLocation,
};