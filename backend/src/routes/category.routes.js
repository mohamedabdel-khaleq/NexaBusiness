const express = require("express");

const {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require("../controllers/category.controller");

const authMiddleware = require("../middleware/auth.middleware");
const router = express.Router();


//CREATE CATEGORY
router.post("/", authMiddleware, createCategory);
//GET ALL CATEGORIES 
router.get("/", authMiddleware, getAllCategories);
//GET CATEGORY BY ID 
router.get("/:id", authMiddleware, getCategoryById);
//UPDATE CATEGORY
router.put("/:id", authMiddleware, updateCategory);
//DELETE CATEGORY
router.delete("/:id", authMiddleware, deleteCategory);


module.exports = router;