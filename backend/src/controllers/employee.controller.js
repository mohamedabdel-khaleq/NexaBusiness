const prisma = require("../config/prisma");

//CREATE EMPLOYEE

const createEmployee = async (req, res) => {
  const {
    name,
    email,
    phone,
    salary,
    hireDate,
    departmentId,
  } = req.body;

  try {
    if (!name || !email || !hireDate || !departmentId) {
      return res.status(400).json({
        message: "Name, email, hireDate and departmentId are required",
      });
    }

    const existingEmployee = await prisma.employee.findUnique({
      where: { email },
    });

    if (existingEmployee) {
      return res.status(409).json({
        message: "Employee email already exists",
      });
    }

    const department = await prisma.department.findUnique({
      where: {
        id: parseInt(departmentId),
      },
    });

    if (!department) {
      return res.status(404).json({
        message: "Department not found",
      });
    }

    const employee = await prisma.employee.create({
      data: {
        name,
        email,
        phone,
        salary,
        hireDate: new Date(hireDate),
        departmentId: parseInt(departmentId),
      },
      include: {
        department: true,
      },
    });

    return res.status(201).json({
      message: "Employee created successfully",
      employee,
    });
  } catch (error) {
    console.error("Create employee error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

//GET ALL EMPLOYEES

const getAllEmployees = async (req, res) => {
  try {
    const {
      search,
      departmentId,
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

    if (departmentId) {
      where.departmentId = parseInt(departmentId);
    }

    const [employees, totalEmployees] = await Promise.all([
      prisma.employee.findMany({
        where,
        include: {
          department: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: itemsPerPage,
      }),

      prisma.employee.count({
        where,
      }),
    ]);

    const totalPages = Math.ceil(
      totalEmployees / itemsPerPage
    );

    return res.status(200).json({
      message: "Employees retrieved successfully",
      employees,
      pagination: {
        page: currentPage,
        limit: itemsPerPage,
        totalEmployees,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Get employees error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

//GET EMPLOYEE BY ID

const getEmployeeById = async (req, res) => {
  const { id } = req.params;

  try {
    const employee = await prisma.employee.findUnique({
      where: {
        id: parseInt(id),
      },
      include: {
        department: true,
      },
    });

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    return res.status(200).json({
      message: "Employee retrieved successfully",
      employee,
    });
  } catch (error) {
    console.error("Get employee error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

//UPDATE EMPLOYEE

const updateEmployee = async (req, res) => {
  const { id } = req.params;

  const {
    name,
    email,
    phone,
    salary,
    hireDate,
    departmentId,
    isActive,
  } = req.body;

  try {
    const existingEmployee = await prisma.employee.findUnique({
      where: {
        id: parseInt(id),
      },
    });

    if (!existingEmployee) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    if (!name || !email || !hireDate || !departmentId) {
      return res.status(400).json({
        message: "Name, email, hireDate and departmentId are required",
      });
    }

    const duplicateEmployee = await prisma.employee.findFirst({
      where: {
        email,
        NOT: {
          id: parseInt(id),
        },
      },
    });

    if (duplicateEmployee) {
      return res.status(409).json({
        message: "Employee email already exists",
      });
    }

    const department = await prisma.department.findUnique({
      where: {
        id: parseInt(departmentId),
      },
    });

    if (!department) {
      return res.status(404).json({
        message: "Department not found",
      });
    }

    const employee = await prisma.employee.update({
      where: {
        id: parseInt(id),
      },
      data: {
        name,
        email,
        phone,
        salary,
        hireDate: new Date(hireDate),
        departmentId: parseInt(departmentId),
        isActive: isActive ?? true,
      },
      include: {
        department: true,
      },
    });

    return res.status(200).json({
      message: "Employee updated successfully",
      employee,
    });
  } catch (error) {
    console.error("Update employee error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

//DELETE EMPLOYEE

const deleteEmployee = async (req, res) => {
  const { id } = req.params;

  try {
    const existingEmployee = await prisma.employee.findUnique({
      where: {
        id: parseInt(id),
      },
    });

    if (!existingEmployee) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    await prisma.employee.delete({
      where: {
        id: parseInt(id),
      },
    });

    return res.status(200).json({
      message: "Employee deleted successfully",
    });
  } catch (error) {
    console.error("Delete employee error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

module.exports = {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
};