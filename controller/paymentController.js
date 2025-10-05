const Razorpay = require("razorpay");
const Payment = require("../models/payment"); // ✅ Import payment model
const mainOrderModel = require("../models/mainOrder")
const userModel = require("../models/User")
require("dotenv").config();

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create order
// const createOrder = async (req, res) => {
//     try {
//         const { products } = req.body;
//         const amount = products.reduce((total, p) => total + p.price * p.quantity, 0) * 100;

//         const options = {
//             amount,
//             currency: "INR",
//             receipt: `receipt_${Date.now()}`,
//         };

//         const order = await razorpay.orders.create(options);

//         // ✅ Save order info into DB
//         const newPayment = new Payment({
//             razorpayOrderId: order.id,
//             receipt: order.receipt,
//             amount: order.amount,
//             currency: order.currency,
//             products: products,
//             status: order.status, // 'created'
//         });

//         await newPayment.save();

//         res.json(order);
//     } catch (err) {
//         res.status(500).json({ message: err.message });
//     }
// };

const createOrder = async (req, res) => {
    try {
        const { products } = req.body;
        const findUser = await mainOrderModel.find({ user: req.user.userId }).populate("products.productId")
        console.log(findUser)
        const amount = products.reduce((total, p) => total + p.price * p.quantity, 0) * 100;

        const options = {
            amount,
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);


        // ✅ Save order info into DB
        const newPayment = new Payment({
            user: findUser,
            razorpayOrderId: order.id,
            receipt: order.receipt,
            amount: order.amount,
            currency: order.currency,
            products: products,
            status: order.status, // 'created'
        });

        const savedPayment = await newPayment.save();

        // ✅ Return both Razorpay order and DB _id
        res.json({
            razorpayOrder: order,
            paymentId: savedPayment._id, // send the MongoDB _id
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// const createOrder = async (req, res) => {
//     try {
//         const { products } = req.body;
//         const findUser = await userModel.findById(req.user.userId)
//         console.log("User found:", findUser)

//         if (!findUser) {
//             return res.status(404).json({
//                 success: false,
//                 message: "User not found"
//             });
//         }

//         const amount = products.reduce((total, p) => total + p.price * p.quantity, 0) * 100;

//         const options = {
//             amount,
//             currency: "INR",
//             receipt: `receipt_${Date.now()}`,
//         };

//         const order = await razorpay.orders.create(options);

//         // ✅ Save order info into DB with user ID
//         const newPayment = new Payment({
//             userId: req.user.userId, // Add user ID here
//             razorpayOrderId: order.id,
//             receipt: order.receipt,
//             amount: order.amount,
//             currency: order.currency,
//             products: products,
//             status: order.status, // 'created'
//             userDetails: { // Optional: Store user details for reference
//                 name: findUser.name,
//                 email: findUser.email
//             }
//         });

//         const savedPayment = await newPayment.save();

//         console.log("Payment saved with ID:", savedPayment._id);

//         // ✅ Return both Razorpay order and DB _id
//         res.json({
//             success: true,
//             message: "Order created successfully",
//             razorpayOrder: order,
//             paymentId: savedPayment._id, // send the MongoDB _id
//             userId: req.user.userId // Optional: return user ID in response
//         });
//     } catch (err) {
//         console.error("Error creating order:", err);
//         res.status(500).json({
//             success: false,
//             message: err.message
//         });
//     }
// };

const getDetails = async (req, res) => {
    try {
        const payments = await Payment.findById(req.params.id);
        if (!payments) {
            return res.status(404).json({ success: false, message: "No payment found" });
        }
        res.json({ success: true, data: payments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { createOrder, getDetails };
