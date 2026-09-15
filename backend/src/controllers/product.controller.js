const prisma = require("../config/prisma");


//CREATE PRODUCT

const createProduct = async (req, res) => {
  const {
    name,
    sku,
    description,
    price,
    costPrice,
    stock,
    categoryId,
  } = req.body;

  try {
    if (!name || !sku || price === undefined || costPrice === undefined || !categoryId) {
      return res.status(400).json({
        message: "Name, SKU, price, costPrice and categoryId are required",
      });
    }

    const existingProduct = await prisma.product.findUnique({
      where: { sku },
    });

    if (existingProduct) {
      return res.status(409).json({
        message: "SKU already exists",
      });
    }

    const category = await prisma.category.findUnique({
      where: {
        id: parseInt(categoryId),
      },
    });

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    const product = await prisma.product.create({
      data: {
        name,
        sku,
        description,
        price,
        costPrice,
        stock: stock || 0,
        categoryId: parseInt(categoryId),
      },
    });

    return res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Create product error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};


//GET ALL PRODUCTS 

const getAllProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      message: "Products retrieved successfully",
      products,
    });
  } catch (error) {
    console.error("Get all products error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};


//GET PRODUCT BY ID 

const getProductById = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await prisma.product.findUnique({
      where: {
        id: parseInt(id),
      },
      include: {
        category: true,
      },
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    return res.status(200).json({
      message: "Product retrieved successfully",
      product,
    });
  } catch (error) {
    console.error("Get product by ID error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};


//UPDATE PRODUCT

const updateProduct = async (req, res) => {
  const { id } = req.params;

  const {
    name,
    sku,
    description,
    price,
    costPrice,
    stock,
    categoryId,
    isActive,
  } = req.body;

  try {
    const existingProduct = await prisma.product.findUnique({
      where: {
        id: parseInt(id),
      },
    });

    if (!existingProduct) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    if (!name || !sku || price === undefined || costPrice === undefined || !categoryId) {
      return res.status(400).json({
        message: "Name, SKU, price, costPrice and categoryId are required",
      });
    }

    const duplicateProduct = await prisma.product.findFirst({
      where: {
        sku,
        NOT: {
          id: parseInt(id),
        },
      },
    });

    if (duplicateProduct) {
      return res.status(409).json({
        message: "SKU already exists",
      });
    }

    const category = await prisma.category.findUnique({
      where: {
        id: parseInt(categoryId),
      },
    });

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    const product = await prisma.product.update({
      where: {
        id: parseInt(id),
      },
      data: {
        name,
        sku,
        description,
        price,
        costPrice,
        stock: stock || 0,
        categoryId: parseInt(categoryId),
        isActive: isActive ?? true,
      },
    });

    return res.status(200).json({
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Update product error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};


//DELETE PRODUCT 

const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const existingProduct = await prisma.product.findUnique({
      where: {
        id: parseInt(id),
      },
    });

    if (!existingProduct) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    await prisma.product.delete({
      where: {
        id: parseInt(id),
      },
    });

    return res.status(200).json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete product error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};


module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};