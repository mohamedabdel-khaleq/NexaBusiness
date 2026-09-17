require("dotenv").config();

const prisma = require("../config/prisma");

const assignPermissions = async () => {
  try {
    const permissions = await prisma.permission.findMany();

    const adminRole = await prisma.role.findUnique({
      where: {
        name: "ADMIN",
      },
    });

    const userRole = await prisma.role.findUnique({
      where: {
        name: "USER",
      },
    });

    if (!adminRole || !userRole) {
      throw new Error("ADMIN or USER role not found");
    }

    // ADMIN gets all permissions
    await prisma.role.update({
      where: {
        id: adminRole.id,
      },
      data: {
        permissions: {
          connect: permissions.map((permission) => ({
            id: permission.id,
          })),
        },
      },
    });

    // USER gets read permissions
    const userPermissionNames = [
      "products.read",
      "sales.read",
      "inventory.read",
      "customers.read",
      "employees.read",
      "payments.read",
    ];

    const userPermissions = permissions.filter((permission) =>
      userPermissionNames.includes(permission.name)
    );

    await prisma.role.update({
      where: {
        id: userRole.id,
      },
      data: {
        permissions: {
          connect: userPermissions.map((permission) => ({
            id: permission.id,
          })),
        },
      },
    });

    console.log("Permissions assigned successfully");
  } catch (error) {
    console.error("Error assigning permissions:", error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
};

assignPermissions();