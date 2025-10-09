const mainOrder = require("../models/mainOrder");
const productModel = require("../models/Product"); // Import product model

const checkOrder = async (req, res) => {
    try {
        console.log("User object from auth:", req.user);

        // Check if user is properly authenticated
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

        // ✅ CHECK STOCK AVAILABILITY BEFORE CREATING ORDER
        for (const item of cartItems) {
            const product = await productModel.findById(item.productId);
            if (!product) {
                return res.status(400).json({
                    success: false,
                    message: `Product ${item.name} not found`
                });
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${item.name}. Available: ${product.stock}, Requested: ${item.quantity}`
                });
            }
        }

        // MANUALLY GENERATE ORDER NUMBER
        const orderCount = await mainOrder.countDocuments();
        const orderNumber = `ORD${Date.now()}${orderCount + 1}`;
        console.log("Manually generated orderNumber:", orderNumber);

        // Create new order with MANUALLY generated orderNumber
        const newOrder = new mainOrder({
            user: req.user.userId,
            orderNumber: orderNumber,
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

        // ✅ UPDATE STOCK QUANTITIES AFTER SUCCESSFUL ORDER CREATION
        await updateProductStock(cartItems);

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

// ✅ FUNCTION TO UPDATE PRODUCT STOCK (MINUS THE QUANTITY)
const updateProductStock = async (cartItems) => {
    try {
        console.log("🔄 Updating product stock for items:", cartItems);

        for (const item of cartItems) {
            // Find the product
            const product = await productModel.findById(item.productId);

            if (product) {
                // Calculate new stock (minus the purchased quantity)
                const newStock = product.stock - item.quantity;

                // Update product stock
                const updatedProduct = await productModel.findByIdAndUpdate(
                    item.productId,
                    { stock: newStock },
                    { new: true }
                );

                console.log(`✅ Updated stock for ${product.name}: ${product.stock} -> ${newStock} (purchased: ${item.quantity})`);
            } else {
                console.log(`❌ Product not found for ID: ${item.productId}`);
            }
        }

        console.log("✅ All product stocks updated successfully");
    } catch (error) {
        console.error("❌ Error updating product stock:", error);
        throw error;
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
const getuserOrder = async (req, res) => {
    try {

        const order = await mainOrder.find({ user: req.user.userId }).populate('user', 'name email').sort({ createdAt: -1 });
        console.log(order)
        if (!order) {
            return res.status(404).json({ success: false, message: "No orders found for this user" });
        }
        res.json({ success: true, data: order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { checkOrder, getOrder, getuserOrder };