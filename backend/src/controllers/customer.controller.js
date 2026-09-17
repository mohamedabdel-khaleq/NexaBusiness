const prisma = require("../config/prisma");

//CREATE CUSTOMER

const createCustomer = async (req, res) => {
  const { name, email, phone, address } = req.body;

  try {
    if (!name) {
      return res.status(400).json({
        message: "Customer name is required",
      });
    }

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

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

//GET ALL CUSTOMERS
//GET ALL CUSTOMERS

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

//GET CUSTOMER BY ID

const getCustomerById = async (req, res) => {
  const { id } = req.params;

  try {
    const customer = await prisma.customer.findUnique({
      where: {
        id: parseInt(id),
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

module.exports = {
  createCustomer,
  getAllCustomers,
  getCustomerById,
};