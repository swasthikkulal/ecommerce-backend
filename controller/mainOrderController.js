const mainOrder = require("../models/mainOrder");

const checkOrder = async (req, res) => {
    try {
        console.log("User object from auth:", req.user);

        // Check if user is properly authenticated - FIXED: use req.user.userId
        if (!req.user || !req.user.userId) {
            return res.status(401).json({
                success: false,
                message: "User not properly authenticated"
            });
        }

        const {
            address,
            cartItems,
            total,
            subtotal,
            shipping,
            tax
        } = req.body;

        console.log("Received checkout data from user:", req.user.userId);

        // Validate required fields
        if (!address || !cartItems || cartItems.length === 0 || !total) {
            return res.status(400).json({
                success: false,
                message: "Missing required checkout data"
            });
        }

        // MANUALLY GENERATE ORDER NUMBER to ensure it's set
        const orderCount = await mainOrder.countDocuments();
        const orderNumber = `ORD${Date.now()}${orderCount + 1}`;
        console.log("Manually generated orderNumber:", orderNumber);

        // Create new order with MANUALLY generated orderNumber
        const newOrder = new mainOrder({
            user: req.user.userId, // This matches your auth middleware
            orderNumber: orderNumber, // MANUALLY SET HERE
            products: cartItems.map(item => ({
                productId: item.productId,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                image: item.image
            })),
            shippingAddress: address,
            orderSummary: {
                subtotal: subtotal,
                shipping: shipping,
                tax: tax,
                total: total
            },
            status: 'pending_payment'
        });

        console.log("About to save order with orderNumber:", newOrder.orderNumber);
        const savedOrder = await newOrder.save();
        console.log("Order saved successfully! Order Number:", savedOrder.orderNumber);

        res.status(201).json({
            success: true,
            message: "Order created successfully",
            data: savedOrder,
            orderId: savedOrder._id,
            orderNumber: savedOrder.orderNumber
        });

    } catch (error) {
        console.error("Checkout error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error during checkout",
            error: error.message
        });
    }
};

const getOrder = async (req, res) => {
    try {
        const orders = await mainOrder.find().populate('user', 'name email').sort({ createdAt: -1 });
        res.json({ success: true, data: orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


module.exports = { checkOrder, getOrder };