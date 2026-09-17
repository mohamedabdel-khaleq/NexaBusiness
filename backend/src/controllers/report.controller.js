const {
  getSalesReport,
} = require("../services/report.service");

const getSalesReportController = async (req, res) => {
  try {
    const { from, to } = req.query;

    const report = await getSalesReport(from, to);

    return res.status(200).json(report);
  } catch (error) {
    console.error("Sales report error:", error);

    return res.status(500).json({
      message: "Failed to get sales report",
    });
  }
};

module.exports = {
  getSalesReportController,
};