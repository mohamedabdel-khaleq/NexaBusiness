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