const productModel = require("../models/Product")
const fs = require('fs');
const path = require('path');

const addProduct = async (req, res) => {
    try {
        console.log('Request received for adding product');
        console.log('Request body:', req.body);
        console.log('Uploaded file:', req.file);

        const { name, price, description, stock } = req.body;

        // Validate required fields
        if (!name || !price || !description || !stock) {
            // Delete uploaded file if validation fails
            if (req.file) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Product image is required'
            });
        }

        // Check if product already exists
        const checkProduct = await productModel.findOne({ name });
        if (checkProduct) {
            // Delete uploaded file if product exists
            if (req.file) {
                fs.unlinkSync(req.file.path);
            }
            return res.json({ success: false, message: "Product already exists" });
        }

        // Create product with image path
        const product = await productModel.create({
            name,
            price: parseFloat(price),
            description,
            stock: parseInt(stock),
            image: `/uploads/${req.file.filename}`
        });

        console.log('Product created successfully:', product);

        res.status(201).json({
            success: true,
            message: 'Product added successfully',
            data: product
        });

    } catch (error) {
        console.error('Error in addProduct:', error);

        // Delete uploaded file if error occurs
        if (req.file) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (unlinkError) {
                console.error('Error deleting file:', unlinkError);
            }
        }

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getProducts = async (req, res) => {
    try {
        const findAllProduct = await productModel.find().sort({ createdAt: -1 });
        if (!findAllProduct) {
            return res.json({ success: false, message: "No products found" });
        }
        return res.json({
            success: true,
            data: findAllProduct,
            message: "Products retrieved successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getProductById = async (req, res) => {
    try {
        const findProductById = await productModel.findById(req.params.id);
        if (!findProductById) {
            return res.json({
                success: false,
                message: "Product not found"
            });
        }
        return res.json({
            success: true,
            data: findProductById,
            message: "Product retrieved successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const updateProduct = async (req, res) => {
    try {
        const { name, price, description, stock } = req.body;

        // Prepare update data
        const updateData = {
            name,
            price: parseFloat(price),
            description,
            stock: parseInt(stock)
        };

        // If new image is uploaded, update the image path
        if (req.file) {
            updateData.image = `/uploads/${req.file.filename}`;

            // Delete old image file if it exists
            const oldProduct = await productModel.findById(req.params.id);
            if (oldProduct && oldProduct.image) {
                const oldImagePath = path.join(__dirname, '..', oldProduct.image);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
        }

        const updatedProduct = await productModel.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!updatedProduct) {
            // Delete the uploaded file if product not found
            if (req.file) {
                fs.unlinkSync(req.file.path);
            }
            return res.json({
                success: false,
                message: "Product not found"
            });
        }

        return res.json({
            success: true,
            data: updatedProduct,
            message: "Product updated successfully"
        });

    } catch (error) {
        // Delete uploaded file if error occurs
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const productToDelete = await productModel.findById(req.params.id);

        if (!productToDelete) {
            return res.json({
                success: false,
                message: "Product not found"
            });
        }

        // Delete the associated image file
        if (productToDelete.image) {
            const imagePath = path.join(__dirname, '..', productToDelete.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        // Delete the product from database
        await productModel.findByIdAndDelete(req.params.id);

        return res.json({
            success: true,
            message: "Product deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    addProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct
};