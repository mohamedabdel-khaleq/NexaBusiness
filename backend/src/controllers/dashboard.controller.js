const {
  getDashboardStats,
} = require("../services/dashboard.service");

const getDashboard = async (req, res) => {
  try {
    const stats = await getDashboardStats();

    return res.status(200).json(stats);
  } catch (error) {
    console.error("Dashboard error:", error);

    return res.status(500).json({
      message: "Failed to get dashboard statistics",
    });
  }
};

module.exports = {
  getDashboard,
};