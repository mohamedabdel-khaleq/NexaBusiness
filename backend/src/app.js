const express = require("express");
const cors = require("cors");

const healthRoutes = require("./routes/health.routes");
const authRoutes = require("./routes/auth.routes");
const categoryRoutes = require("./routes/category.routes");
const productRoutes = require("./routes/product.routes");
const inventoryRoutes = require("./routes/inventory.routes");
const customerRoutes = require("./routes/customer.routes");
const saleRoutes = require("./routes/sale.routes");
const paymentRoutes = require("./routes/payment.routes");
const departmentRoutes = require("./routes/department.routes");
const employeeRoutes = require("./routes/employee.routes");
const notificationRoutes = require("./routes/notification.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const reportRoutes = require("./routes/report.routes");
const posRoutes = require("./routes/pos.routes");
const deliveryDriverRoutes = require("./routes/delivery-driver.routes");
const deliveryOrderRoutes = require("./routes/delivery-order.routes");
const deliveryLocationRoutes = require("./routes/delivery-location.routes");
const deliveryTrackingRoutes = require("./routes/delivery-tracking.routes");
const supportTicketRoutes = require("./routes/support-ticket.routes");
const userRoutes = require("./routes/user.routes");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/sales", saleRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/pos", posRoutes);
app.use("/api/delivery-drivers", deliveryDriverRoutes);
app.use("/api/delivery-orders", deliveryOrderRoutes);
app.use("/api/delivery-drivers", deliveryLocationRoutes);
app.use("/api/delivery-orders", deliveryTrackingRoutes);
app.use("/api/support-tickets", supportTicketRoutes);
app.use("/api/users", userRoutes);


module.exports = app;