const swaggerUi = require("swagger-ui-express");

const swaggerDocument = {
  openapi: "3.0.0",

  info: {
    title: "NexaBusiness API",
    version: "1.0.0",
    description: "NexaBusiness Business Management Platform API",
  },

  servers: [
    {
      url: "http://localhost:5000",
      description: "Local Server",
    },
    {
      url: "https://nexabusiness-production.up.railway.app",
      description: "Production Server",
    },
  ],

  tags: [
    { name: "Health" },
    { name: "Authentication" },
    { name: "Categories" },
    { name: "Products" },
    { name: "Inventory" },
    { name: "Customers" },
    { name: "Sales" },
    { name: "Payments" },
    { name: "Departments" },
    { name: "Employees" },
    { name: "Notifications" },
    { name: "Dashboard" },
    { name: "Reports" },
    { name: "POS" },
    { name: "Delivery Drivers" },
    { name: "Delivery Orders" },
    { name: "Support Tickets" },
    { name: "Users" },
  ],

  paths: {},
};

module.exports = {
  swaggerUi,
  swaggerDocument,
};