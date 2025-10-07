const express = require("express");
const router = express.Router();
const { adminMiddleware } = require("../middleware/authMiddleWare");
const upload = require('../middleware/upload');
// TODO: Import controllers

const { getProducts, addProduct, getProductById, updateProduct, deleteProduct } = require("../controller/productController");

// TODO: Add routes
router.post("/add", adminMiddleware, upload.single('image'), addProduct);
router.get("/", getProducts);

// later make it GET it can be used for cart
router.get("/:id", getProductById);
router.put("/update/:id", adminMiddleware, upload.single("image"), updateProduct)
router.delete("/delete/:id", adminMiddleware, deleteProduct)

module.exports = router;
