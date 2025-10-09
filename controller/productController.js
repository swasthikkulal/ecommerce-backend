// controller/productController.js
const Product = require("../models/Product");
const { cloudinary } = require("../config/cloudinary");

// Add Product
const addProduct = async (req, res) => {
    try {
        const { name, description, price, stock, category, isActive } = req.body;

        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Product image is required"
            });
        }

        // Create product with Cloudinary image URL
        const product = new Product({
            name,
            description,
            price: parseFloat(price),
            stock: parseInt(stock),
            category,
            isActive: isActive === 'true' || isActive === true,
            image: req.file.path, // Cloudinary URL
            imagePublicId: req.file.filename // Cloudinary public_id for deletion
        });

        await product.save();
        await product.populate('category', 'name');

        res.status(201).json({
            success: true,
            message: "Product created successfully",
            data: product
        });
    } catch (error) {
        console.error("Error adding product:", error);

        // Delete uploaded image if product creation fails
        if (req.file) {
            await cloudinary.uploader.destroy(req.file.filename);
        }

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: "Validation error",
                errors: messages
            });
        }

        res.status(500).json({
            success: false,
            message: "Error adding product",
            error: error.message
        });
    }
};

// Update Product
// const updateProduct = async (req, res) => {
//     try {
//         const { name, description, price, stock, category, isActive } = req.body;
//         const productId = req.params.id;

//         // Find existing product
//         const existingProduct = await Product.findById(productId);
//         if (!existingProduct) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Product not found"
//             });
//         }

//         const updateData = {
//             name,
//             description,
//             price: parseFloat(price),
//             stock: parseInt(stock),
//             category,
//             isActive: isActive === 'true' || isActive === true,
//         };

//         // If new image is uploaded
//         if (req.file) {
//             // Delete old image from Cloudinary
//             if (existingProduct.imagePublicId) {
//                 await cloudinary.uploader.destroy(existingProduct.imagePublicId);
//             }

//             updateData.image = req.file.path;
//             updateData.imagePublicId = req.file.filename;
//         }

//         const updatedProduct = await Product.findByIdAndUpdate(
//             productId,
//             updateData,
//             { new: true, runValidators: true }
//         ).populate('category', 'name');

//         res.json({
//             success: true,
//             message: "Product updated successfully",
//             data: updatedProduct
//         });
//     } catch (error) {
//         console.error("Error updating product:", error);

//         // Delete uploaded image if update fails
//         if (req.file) {
//             await cloudinary.uploader.destroy(req.file.filename);
//         }

//         res.status(500).json({
//             success: false,
//             message: "Error updating product",
//             error: error.message
//         });
//     }
// };
const updateProduct = async (req, res) => {
    try {
        const { name, description, price, stock, category, isActive } = req.body;
        const productId = req.params.id;

        console.log("Update request received:", {
            productId,
            body: req.body,
            hasFile: !!req.file
        });

        // Find existing product
        const existingProduct = await Product.findById(productId);
        if (!existingProduct) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        const updateData = {
            name: name || existingProduct.name,
            description: description || existingProduct.description,
            price: price ? parseFloat(price) : existingProduct.price,
            stock: stock ? parseInt(stock) : existingProduct.stock,
            category: category || existingProduct.category,
            isActive: isActive !== undefined ? (isActive === 'true' || isActive === true) : existingProduct.isActive,
        };

        // If new image is uploaded
        if (req.file) {
            console.log("New image uploaded:", req.file);

            // Delete old image from Cloudinary
            if (existingProduct.imagePublicId) {
                try {
                    await cloudinary.uploader.destroy(existingProduct.imagePublicId);
                    console.log("Old image deleted from Cloudinary");
                } catch (cloudinaryError) {
                    console.error("Error deleting old image from Cloudinary:", cloudinaryError);
                    // Continue with update even if old image deletion fails
                }
            }

            updateData.image = req.file.path;
            updateData.imagePublicId = req.file.filename;
        } else {
            console.log("No new image uploaded, keeping existing image");
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            updateData,
            { new: true, runValidators: true }
        ).populate('category', 'name');

        console.log("Product updated successfully:", updatedProduct);

        res.json({
            success: true,
            message: "Product updated successfully",
            data: updatedProduct
        });
    } catch (error) {
        console.error("Error updating product:", error);

        // Delete uploaded image if update fails
        if (req.file) {
            try {
                await cloudinary.uploader.destroy(req.file.filename);
                console.log("Uploaded image deleted due to error");
            } catch (deleteError) {
                console.error("Error deleting uploaded image:", deleteError);
            }
        }

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: "Validation error",
                errors: messages
            });
        }

        res.status(500).json({
            success: false,
            message: "Error updating product",
            error: error.message
        });
    }
};

// Delete Product
const deleteProduct = async (req, res) => {
    try {
        const productId = req.params.id;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // Delete image from Cloudinary
        if (product.imagePublicId) {
            await cloudinary.uploader.destroy(product.imagePublicId);
        }

        // Delete product from database
        await Product.findByIdAndDelete(productId);

        res.json({
            success: true,
            message: "Product deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({
            success: false,
            message: "Error deleting product",
            error: error.message
        });
    }
};

// Get all products (keep existing)
const getProducts = async (req, res) => {
    try {
        const products = await Product.find({ isActive: true })
            .populate('category', 'name')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: products
        });
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching products",
            error: error.message
        });
    }
};

// Get product by ID (keep existing)
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('category', 'name');

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching product",
            error: error.message
        });
    }
};

module.exports = {
    addProduct,
    updateProduct,
    deleteProduct,
    getProducts,
    getProductById
};