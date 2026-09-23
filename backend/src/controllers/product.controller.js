const prisma = require("../config/prisma");

// CREATE PRODUCT

const createProduct = async (req, res) => {
  const {
    name,
    sku,
    barcode,
    description,
    price,
    costPrice,
    stock,
    categoryId,
  } = req.body;

  try {
    if (
      !name ||
      !sku ||
      price === undefined ||
      costPrice === undefined ||
      !categoryId
    ) {
      return res.status(400).json({
        message:
          "Name, SKU, price, costPrice and categoryId are required",
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

    if (barcode) {
      const existingBarcode = await prisma.product.findUnique({
        where: { barcode },
      });

      if (existingBarcode) {
        return res.status(409).json({
          message: "Barcode already exists",
        });
      }
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
        barcode,
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

    if (error.code === "P2002") {
      return res.status(409).json({
        message: "SKU or barcode already exists",
      });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// GET ALL PRODUCTS

const getAllProducts = async (req, res) => {
  try {
    const {
      search,
      categoryId,
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
          sku: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          barcode: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    if (categoryId) {
      where.categoryId = parseInt(categoryId);
    }

    const [products, totalProducts] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: itemsPerPage,
      }),

      prisma.product.count({
        where,
      }),
    ]);

    const totalPages = Math.ceil(
      totalProducts / itemsPerPage
    );

    return res.status(200).json({
      message: "Products retrieved successfully",
      products,
      pagination: {
        page: currentPage,
        limit: itemsPerPage,
        totalProducts,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Get all products error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// GET PRODUCT BY BARCODE

const getProductByBarcode = async (req, res) => {
  const { barcode } = req.params;

  try {
    if (!barcode || !barcode.trim()) {
      return res.status(400).json({
        message: "Barcode is required",
      });
    }

    const product = await prisma.product.findUnique({
      where: {
        barcode: barcode.trim(),
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
    console.error("Get product by barcode error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// GET PRODUCT BY ID

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

// UPDATE PRODUCT

const updateProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const productId = parseInt(id);

    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({
        message: "Product ID must be a positive integer",
      });
    }

    const existingProduct = await prisma.product.findUnique({
      where: {
        id: productId,
      },
    });

    if (!existingProduct) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const {
      name,
      sku,
      barcode,
      description,
      price,
      costPrice,
      stock,
      categoryId,
      isActive,
    } = req.body;

    // Check SKU uniqueness
    if (sku !== undefined) {
      const duplicateProduct = await prisma.product.findFirst({
        where: {
          sku,
          NOT: {
            id: productId,
          },
        },
      });

      if (duplicateProduct) {
        return res.status(409).json({
          message: "SKU already exists",
        });
      }
    }

    // Check Barcode uniqueness
    if (barcode !== undefined) {
      const duplicateBarcode = await prisma.product.findFirst({
        where: {
          barcode,
          NOT: {
            id: productId,
          },
        },
      });

      if (duplicateBarcode) {
        return res.status(409).json({
          message: "Barcode already exists",
        });
      }
    }

    // Check category
    if (categoryId !== undefined) {
      const category = await prisma.category.findUnique({
        where: {
          id: categoryId,
        },
      });

      if (!category) {
        return res.status(404).json({
          message: "Category not found",
        });
      }
    }

    // Compare prices
    const currentPrice = Number(existingProduct.price);
    const currentCostPrice = Number(existingProduct.costPrice);

    const newPrice = price ?? currentPrice;
    const newCostPrice = costPrice ?? currentCostPrice;

    if (newCostPrice > newPrice) {
      return res.status(400).json({
        message:
          "Cost price cannot be greater than selling price",
      });
    }

    // Build update data
    const updateData = {};

    if (name !== undefined) {
      updateData.name = name;
    }

    if (sku !== undefined) {
      updateData.sku = sku;
    }

    if (barcode !== undefined) {
      updateData.barcode = barcode;
    }

    if (description !== undefined) {
      updateData.description = description;
    }

    if (price !== undefined) {
      updateData.price = price;
    }

    if (costPrice !== undefined) {
      updateData.costPrice = costPrice;
    }

    if (stock !== undefined) {
      updateData.stock = stock;
    }

    if (categoryId !== undefined) {
      updateData.categoryId = categoryId;
    }

    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }

    const product = await prisma.product.update({
      where: {
        id: productId,
      },
      data: updateData,
    });

    return res.status(200).json({
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Update product error:", error);

    if (error.code === "P2002") {
      return res.status(409).json({
        message: "SKU or barcode already exists",
      });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// DELETE PRODUCT

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
  getProductByBarcode,
  getProductById,
  updateProduct,
  deleteProduct,
};