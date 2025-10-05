const productModel = require("../models/Product")
const orderModel = require("../models/Order")

const adminCheck = async (req, res) => {
    try {
        const checkAdmin = await orderModel.find();
        if (!checkAdmin) {
            return res.json({ success: false, message: "this is not admin" })
        }
        return res.json({ success: true, message: "welcome admin" })
    } catch (error) {
        return res.json({ success: false, message: error.message })
    }
}
module.exports = { adminCheck }