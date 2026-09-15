const prisma = require("../config/prisma");


// CREATE CATEGORY 

const createCategory = async (req, res) => {
  const { name, description } = req.body;

  try {
    // Validate required fields
    if (!name) {
      return res.status(400).json({
        message: "Category name is required",
      });
    }

    // Check if category already exists
    const existingCategory = await prisma.category.findUnique({
      where: {
        name,
      },
    });

    if (existingCategory) {
      return res.status(409).json({
        message: "Category already exists",
      });
    }

    // Create category
    const category = await prisma.category.create({
      data: {
        name,
        description,
      },
    });

    return res.status(201).json({
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    console.error("Create category error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};


//GET ALL CATEGORIES

const getAllCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      message: "Categories retrieved successfully",
      categories,
    });
  } catch (error) {
    console.error("Get all categories error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};


//GET CATEGORY BY ID

const getCategoryById = async (req, res) => {
  const { id } = req.params;

  try {
    const category = await prisma.category.findUnique({
      where: {
        id: parseInt(id),
      },
    });

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    return res.status(200).json({
      message: "Category retrieved successfully",
      category,
    });
  } catch (error) {
    console.error("Get category by ID error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};


//UPDATE CATEGORY 

const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  try {
    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: {
        id: parseInt(id),
      },
    });

    if (!existingCategory) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    // Validate name
    if (!name) {
      return res.status(400).json({
        message: "Category name is required",
      });
    }

    // Check if another category has the same name
    const duplicateCategory = await prisma.category.findFirst({
      where: {
        name,
        NOT: {
          id: parseInt(id),
        },
      },
    });

    if (duplicateCategory) {
      return res.status(409).json({
        message: "Category name already exists",
      });
    }

    // Update category
    const category = await prisma.category.update({
      where: {
        id: parseInt(id),
      },
      data: {
        name,
        description,
      },
    });

    return res.status(200).json({
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    console.error("Update category error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};


// DELETE CATEGORY

const deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: {
        id: parseInt(id),
      },
    });

    if (!existingCategory) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    // Delete category
    await prisma.category.delete({
      where: {
        id: parseInt(id),
      },
    });

    return res.status(200).json({
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Delete category error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};


// EXPORTS

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};