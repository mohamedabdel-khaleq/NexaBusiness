const express = require("express");

const {
  getSalesReportController,
} = require("../controllers/report.controller");

const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

router.get(
  "/sales",
  authMiddleware,
  getSalesReportController
);

module.exports = router;