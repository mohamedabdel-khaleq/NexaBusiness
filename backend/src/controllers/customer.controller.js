const prisma = require("../config/prisma");

// CREATE CUSTOMER

const createCustomer = async (req, res) => {
  const { name, email, phone, address } = req.body;

  try {
    const customer = await prisma.customer.create({
      data: {
        name,
        email,
        phone,
        address,
      },
    });

    return res.status(201).json({
      message: "Customer created successfully",
      customer,
    });
  } catch (error) {
    console.error("Create customer error:", error);

    if (error.code === "P2002") {
      return res.status(409).json({
        message: "Email already exists",
      });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// GET ALL CUSTOMERS

const getAllCustomers = async (req, res) => {
  try {
    const {
      search,
      page = 1,
      limit = 10,
    } = req.query;

    const currentPage = Math.max(parseInt(page) || 1, 1);

    const itemsPerPage = Math.min(
      Math.max(parseInt(limit) || 10, 1),
      100
    );

    const skip = (currentPage - 1) * itemsPerPage;

    const where = {};

    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          email: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          phone: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    const [customers, totalCustomers] = await Promise.all([
      prisma.customer.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: itemsPerPage,
      }),

      prisma.customer.count({
        where,
      }),
    ]);

    const totalPages = Math.ceil(
      totalCustomers / itemsPerPage
    );

    return res.status(200).json({
      message: "Customers retrieved successfully",
      customers,
      pagination: {
        page: currentPage,
        limit: itemsPerPage,
        totalCustomers,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Get customers error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// GET CUSTOMER BY ID

const getCustomerById = async (req, res) => {
  const { id } = req.params;

  try {
    const customerId = parseInt(id);

    if (!Number.isInteger(customerId) || customerId <= 0) {
      return res.status(400).json({
        message: "Customer ID must be a positive integer",
      });
    }

    const customer = await prisma.customer.findUnique({
      where: {
        id: customerId,
      },
    });

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    return res.status(200).json({
      message: "Customer retrieved successfully",
      customer,
    });
  } catch (error) {
    console.error("Get customer error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// UPDATE CUSTOMER

const updateCustomer = async (req, res) => {
  const { id } = req.params;

  try {
    const customerId = parseInt(id);

    if (!Number.isInteger(customerId) || customerId <= 0) {
      return res.status(400).json({
        message: "Customer ID must be a positive integer",
      });
    }

    const existingCustomer = await prisma.customer.findUnique({
      where: {
        id: customerId,
      },
    });

    if (!existingCustomer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    const {
      name,
      email,
      phone,
      address,
    } = req.body;

    // Check duplicate email
    if (email !== undefined) {
      const duplicateCustomer = await prisma.customer.findFirst({
        where: {
          email,
          NOT: {
            id: customerId,
          },
        },
      });

      if (duplicateCustomer) {
        return res.status(409).json({
          message: "Email already exists",
        });
      }
    }

    // Build only the fields that were sent
    const updateData = {};

    if (name !== undefined) {
      updateData.name = name;
    }

    if (email !== undefined) {
      updateData.email = email;
    }

    if (phone !== undefined) {
      updateData.phone = phone;
    }

    if (address !== undefined) {
      updateData.address = address;
    }

    const customer = await prisma.customer.update({
      where: {
        id: customerId,
      },
      data: updateData,
    });

    return res.status(200).json({
      message: "Customer updated successfully",
      customer,
    });
  } catch (error) {
    console.error("Update customer error:", error);

    if (error.code === "P2002") {
      return res.status(409).json({
        message: "Email already exists",
      });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// DELETE CUSTOMER

const deleteCustomer = async (req, res) => {
  const { id } = req.params;

  try {
    const customerId = parseInt(id);

    if (!Number.isInteger(customerId) || customerId <= 0) {
      return res.status(400).json({
        message: "Customer ID must be a positive integer",
      });
    }

    const existingCustomer = await prisma.customer.findUnique({
      where: {
        id: customerId,
      },
    });

    if (!existingCustomer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    const customer = await prisma.customer.delete({
      where: {
        id: customerId,
      },
    });

    return res.status(200).json({
      message: "Customer deleted successfully",
      customer,
    });
  } catch (error) {
    console.error("Delete customer error:", error);

    // Customer has related sales
    if (error.code === "P2003") {
      return res.status(409).json({
        message: "Cannot delete customer because they have related sales",
      });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

module.exports = {
  createCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
};