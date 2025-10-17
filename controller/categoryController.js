const Category = require("../models/Category");
const Product = require("../models/Product");
const { cloudinary } = require("../config/cloudinary");

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res) => {
    try {
        const categories = await Category.find({ isActive: true })
            .sort({ displayOrder: 1, name: 1 })
            .populate('parentCategory', 'name');

        res.json({
            success: true,
            data: categories,
            count: categories.length
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching categories',
            error: error.message
        });
    }
};

// @desc    Get single category by slug
// @route   GET /api/categories/:slug
// @access  Public
const getCategoryBySlug = async (req, res) => {
    try {
        const category = await Category.findOne({
            slug: req.params.slug,
            isActive: true
        }).populate('parentCategory', 'name');

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        res.json({
            success: true,
            data: category
        });
    } catch (error) {
        console.error('Error fetching category:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching category',
            error: error.message
        });
    }
};

// @desc    Create new category with image upload
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = async (req, res) => {
    try {
        const { name, description, displayOrder, parentCategory, isActive } = req.body;

        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Category image is required"
            });
        }

        // Handle empty parentCategory - convert empty string to null
        const categoryData = {
            name,
            description,
            displayOrder: parseInt(displayOrder) || 0,
            parentCategory: parentCategory || null,
            isActive: isActive === 'true' || isActive === true,
            image: req.file.path, // Cloudinary URL
            imagePublicId: req.file.filename // Cloudinary public_id for deletion
        };

        const category = new Category(categoryData);
        await category.save();

        res.status(201).json({
            success: true,
            message: 'Category created successfully',
            data: category
        });
    } catch (error) {
        console.error('Error creating category:', error);

        // Delete uploaded image if category creation fails
        if (req.file) {
            await cloudinary.uploader.destroy(req.file.filename);
        }

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Category name or slug already exists'
            });
        }

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: messages
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error while creating category',
            error: error.message
        });
    }
};

// @desc    Update category with optional image upload
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = async (req, res) => {
    try {
        const { name, description, displayOrder, parentCategory, isActive } = req.body;

        // Find existing category
        const existingCategory = await Category.findById(req.params.id);
        if (!existingCategory) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        const updateData = {
            name,
            description,
            displayOrder: parseInt(displayOrder) || 0,
            parentCategory: parentCategory || null,
            isActive: isActive === 'true' || isActive === true,
        };

        // If new image is uploaded
        if (req.file) {
            // Delete old image from Cloudinary
            if (existingCategory.imagePublicId) {
                await cloudinary.uploader.destroy(existingCategory.imagePublicId);
            }

            updateData.image = req.file.path;
            updateData.imagePublicId = req.file.filename;
        }

        const category = await Category.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            message: 'Category updated successfully',
            data: category
        });
    } catch (error) {
        console.error('Error updating category:', error);

        // Delete uploaded image if update fails
        if (req.file) {
            await cloudinary.uploader.destroy(req.file.filename);
        }

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Category name or slug already exists'
            });
        }

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: messages
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error while updating category',
            error: error.message
        });
    }
};

// @desc    Delete category (soft delete) with image cleanup
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        // Delete image from Cloudinary
        if (category.imagePublicId) {
            await cloudinary.uploader.destroy(category.imagePublicId);
        }

        // Delete category from database
        await Category.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Category deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting category',
            error: error.message
        });
    }
};

// @desc    Get categories with product count
// @route   GET /api/categories/with-count/products
// @access  Public
const getCategoriesWithProductCount = async (req, res) => {
    try {
        const categories = await Category.aggregate([
            { $match: { isActive: true } },
            {
                $lookup: {
                    from: 'products',
                    let: { categoryId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ['$category', '$$categoryId'] },
                                isActive: true
                            }
                        }
                    ],
                    as: 'products'
                }
            },
            {
                $project: {
                    name: 1,
                    description: 1,
                    image: 1,
                    slug: 1,
                    parentCategory: 1,
                    displayOrder: 1,
                    productCount: { $size: '$products' }
                }
            },
            { $sort: { displayOrder: 1, name: 1 } }
        ]);

        res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error('Error fetching categories with product count:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching categories with product count',
            error: error.message
        });
    }
};

// @desc    Get products by category slug
// @route   GET /api/categories/:slug/products
// @access  Public
const getProductsByCategory = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1) * limit;

        // First, find the category by slug
        const category = await Category.findOne({
            slug: req.params.slug,
            isActive: true
        });

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        // Then find products in this category
        const products = await Product.find({
            category: category._id,
            isActive: true
        })
            .populate('category', 'name slug')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await Product.countDocuments({
            category: category._id,
            isActive: true
        });

        res.json({
            success: true,
            data: products,
            pagination: {
                current: page,
                pages: Math.ceil(total / limit),
                total,
                limit
            },
            category: {
                _id: category._id,
                name: category.name,
                description: category.description,
                slug: category.slug
            }
        });
    } catch (error) {
        console.error('Error fetching products by category:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching products by category',
            error: error.message
        });
    }
};

module.exports = {
    getCategories,
    getCategoryBySlug,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoriesWithProductCount,
    getProductsByCategory
};