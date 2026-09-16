const prisma = require("../config/prisma");

//CREATE DEPARTMENT

const createDepartment = async (req, res) => {
  const { name, description } = req.body;

  try {
    if (!name) {
      return res.status(400).json({
        message: "Department name is required",
      });
    }

    const existingDepartment = await prisma.department.findUnique({
      where: { name },
    });

    if (existingDepartment) {
      return res.status(409).json({
        message: "Department already exists",
      });
    }

    const department = await prisma.department.create({
      data: {
        name,
        description,
      },
    });

    return res.status(201).json({
      message: "Department created successfully",
      department,
    });
  } catch (error) {
    console.error("Create department error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

//GET ALL DEPARTMENTS

const getAllDepartments = async (req, res) => {
  try {
    const departments = await prisma.department.findMany({
      include: {
        employees: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      message: "Departments retrieved successfully",
      departments,
    });
  } catch (error) {
    console.error("Get departments error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

//GET DEPARTMENT BY ID

const getDepartmentById = async (req, res) => {
  const { id } = req.params;

  try {
    const department = await prisma.department.findUnique({
      where: {
        id: parseInt(id),
      },
      include: {
        employees: true,
      },
    });

    if (!department) {
      return res.status(404).json({
        message: "Department not found",
      });
    }

    return res.status(200).json({
      message: "Department retrieved successfully",
      department,
    });
  } catch (error) {
    console.error("Get department error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

//UPDATE DEPARTMENT

const updateDepartment = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  try {
    const existingDepartment = await prisma.department.findUnique({
      where: {
        id: parseInt(id),
      },
    });

    if (!existingDepartment) {
      return res.status(404).json({
        message: "Department not found",
      });
    }

    if (!name) {
      return res.status(400).json({
        message: "Department name is required",
      });
    }

    const duplicateDepartment = await prisma.department.findFirst({
      where: {
        name,
        NOT: {
          id: parseInt(id),
        },
      },
    });

    if (duplicateDepartment) {
      return res.status(409).json({
        message: "Department name already exists",
      });
    }

    const department = await prisma.department.update({
      where: {
        id: parseInt(id),
      },
      data: {
        name,
        description,
      },
    });

    return res.status(200).json({
      message: "Department updated successfully",
      department,
    });
  } catch (error) {
    console.error("Update department error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

//DELETE DEPARTMENT

const deleteDepartment = async (req, res) => {
  const { id } = req.params;

  try {
    const existingDepartment = await prisma.department.findUnique({
      where: {
        id: parseInt(id),
      },
    });

    if (!existingDepartment) {
      return res.status(404).json({
        message: "Department not found",
      });
    }

    const employeesCount = await prisma.employee.count({
      where: {
        departmentId: parseInt(id),
      },
    });

    if (employeesCount > 0) {
      return res.status(400).json({
        message: "Cannot delete department with employees",
      });
    }

    await prisma.department.delete({
      where: {
        id: parseInt(id),
      },
    });

    return res.status(200).json({
      message: "Department deleted successfully",
    });
  } catch (error) {
    console.error("Delete department error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

module.exports = {
  createDepartment,
  getAllDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
};