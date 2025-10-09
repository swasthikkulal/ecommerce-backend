// routes/product.js
const express = require("express");
const router = express.Router();
const { adminMiddleware } = require("../middleware/authMiddleWare");
const { upload } = require("../config/cloudinary"); // ✅ Correct import

const { getProducts, addProduct, getProductById, updateProduct, deleteProduct } = require("../controller/productController");

router.post("/add", adminMiddleware, upload.single('image'), addProduct);
router.get("/", getProducts);
router.get("/:id", getProductById);
router.put("/update/:id", adminMiddleware, upload.single("image"), updateProduct);
router.delete("/delete/:id", adminMiddleware, deleteProduct);

module.exports = router;