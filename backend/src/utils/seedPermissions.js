/*
const prisma = require("../config/prisma");

const permissions = [
  {
    name: "users.read",
    description: "View users",
  },
  {
    name: "users.manage",
    description: "Manage users",
  },
];

async function seedPermissions() {
  try {
    for (const permission of permissions) {
      await prisma.permission.upsert({
        where: {
          name: permission.name,
        },
        update: {},
        create: permission,
      });
    }

    console.log("User permissions created successfully");
  } catch (error) {
    console.error("Seed permissions error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedPermissions();
*/


const prisma = require("../config/prisma");

const permissions = [
  // Users
  {
    name: "users.read",
    description: "View users",
  },
  {
    name: "users.manage",
    description: "Manage users",
  },

  // Products
  {
    name: "products.read",
    description: "View products",
  },
  {
    name: "products.create",
    description: "Create products",
  },
  {
    name: "products.update",
    description: "Update products",
  },
  {
    name: "products.delete",
    description: "Delete products",
  },

  // Sales
  {
    name: "sales.read",
    description: "View sales",
  },
  {
    name: "sales.create",
    description: "Create sales",
  },

  // Inventory
  {
    name: "inventory.read",
    description: "View inventory",
  },
  {
    name: "inventory.create",
    description: "Create inventory transactions",
  },
  {
    name: "inventory.update",
    description: "Update inventory",
  },

  // Customers
  {
    name: "customers.read",
    description: "View customers",
  },
  {
    name: "customers.create",
    description: "Create customers",
  },
  {
    name: "customers.update",
    description: "Update customers",
  },
  {
    name: "customers.delete",
    description: "Delete customers",
  },

  // Employees
  {
    name: "employees.read",
    description: "View employees",
  },
  {
    name: "employees.create",
    description: "Create employees",
  },
  {
    name: "employees.update",
    description: "Update employees",
  },
  {
    name: "employees.delete",
    description: "Delete employees",
  },

  // Payments
  {
    name: "payments.read",
    description: "View payments",
  },
  {
    name: "payments.create",
    description: "Create payments",
  },
];

async function seedPermissions() {
  try {
    for (const permission of permissions) {
      await prisma.permission.upsert({
        where: {
          name: permission.name,
        },
        update: {
          description: permission.description,
        },
        create: permission,
      });
    }

    console.log("Permissions created successfully");
  } catch (error) {
    console.error("Seed permissions error:", error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

seedPermissions();