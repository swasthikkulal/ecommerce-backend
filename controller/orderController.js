const Razorpay = require('razorpay');
const orderModel = require("../models/Order")


// this is cart
const createOrder = async (req, res) => {
    try {
        const { products, total } = req.body;

        const order = await orderModel.create({
            userId: req.user.userId,
            products,
            total,
        });
        if (!order) {
            return res.json({ success: false, message: "no order found" })
        }
        return res.status(201).json({ success: true, data: order });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// this is cart
const getOrder = async (req, res) => {
    try {
        const orders = await orderModel.find({ userId: req.user.userId }).populate("products.productId")
        if (!orders) {
            return res.json({ success: false, message: "no order found" })
        }
        return res.status(201).json({ success: true, data: orders });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

const getAllOrders = async (req, res) => {
    try {
        const orders = await orderModel.find().populate("userId", "name email").populate("products.productId");
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        console.log(req.body)
        const { id } = req.params; // order id
        const { status } = req.body; // new status: pending/completed/cancelled

        // Check valid status
        const validStatus = ["pending", "completed", "cancelled"];
        if (!validStatus.includes(status)) {
            return res.status(400).json({ message: "Invalid status value" });
        }

        // Find order and update
        const order = await orderModel.findById(id);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        order.status = status;
        await order.save();

        res.status(200).json({
            message: "Order status updated successfully",
            order
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



const deleteOrder = async (req, res) => {
    try {
        console.log(req.params.id)
        const deleteOrder = await orderModel.findByIdAndDelete({ _id: req.params.id })
        if ((!deleteOrder)) {
            return res.json({ success: false, message: "deletion failed" })
        }
        console.log("order deleted")
        return res.json({ success: true, message: "order deleted" })

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}




// order checkout



module.exports = { createOrder, getOrder, getAllOrders, updateOrderStatus, deleteOrder }