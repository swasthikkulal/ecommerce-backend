const express = require('express');
const router = express.Router();
const {
    getCategories,
    getCategoryBySlug,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoriesWithProductCount,
    getProductsByCategory
} = require('../controller/categoryController');

// If you don't have admin middleware yet, you can use simple auth or create it
const auth = require('../middleware/authMiddleWare');
// For now, using a simple admin check - you can replace with your admin middleware
const adminAuth = (req, res, next) => {
    // Simple check - replace with your actual admin authentication
    const token = req.header('auth-token');
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }
    try {
        // Add your admin verification logic here
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

// Public routes
router.get('/', getCategories);
router.get('/with-count/products', getCategoriesWithProductCount);
router.get('/:slug', getCategoryBySlug);
router.get('/:slug/products', getProductsByCategory);

// Admin routes - protect these with your admin middleware
router.post('/', adminAuth, createCategory);
router.put('/:id', adminAuth, updateCategory);
router.delete('/:id', adminAuth, deleteCategory);

module.exports = router;