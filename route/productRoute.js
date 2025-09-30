const express = require("express");
const router = express.Router();
const { adminMiddleware } = require("../middleware/authMiddleWare");
// TODO: Import controllers

const { getProducts, addProduct, getProductById, updateProduct, deleteProduct } = require("../controller/productController");

// TODO: Add routes
router.post("/add", adminMiddleware, addProduct);
router.get("/", getProducts);

// later make it GET it can be used for cart
router.get("/:id", getProductById);
router.put("/update/:id", adminMiddleware, updateProduct)
router.delete("/delete/:id", adminMiddleware, deleteProduct)

module.exports = router;
