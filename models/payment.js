const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
    razorpayOrderId: { type: String, required: true }, // Razorpay order ID
    receipt: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    products: [
        {
            name: String,
            price: Number,
            quantity: Number,
        },
    ],
    status: { type: String, default: "created" }, // created | paid | failed
}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);
