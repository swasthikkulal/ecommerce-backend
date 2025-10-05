const express = require("express");
const adressModel = require("../models/Address");
const orderModel = require("../models/Order")
const createAddress = async (req, res) => {
    try {
        console.log(req.body)
        let { fullName, phone, address1, address2, city, state, pinCode } = req.body;
        const checkOrder = await orderModel.findOne({ userId: req.user.userId }).populate("products.productId");
        console.log(checkOrder, "123456")
        if (!checkOrder) {
            return res.status(400).json({ success: false, message: "No order found for this user" });
        }
        const newAddress = await adressModel.create({
            user: req.user.userId,
            fullName,
            phone,
            address1,
            address2,
            city,
            state,
            pinCode,
            order: checkOrder
        });
        if (!newAddress) {
            return res.json({ success: false, message: "Address not created" })
        }
        await newAddress.save();
        return res.status(201).json({ success: true, message: "Address created successfully", data: newAddress });
    } catch (error) {
        return res.status(500).json({ message: "Error creating address", error });
    }
};

const checkAddress = async (req, res) => {
    try {
        const address = await adressModel.find();
        if (!address) {
            return res.status(404).json({ success: false, message: "Address not found" });
        }
        return res.status(200).json({ success: true, data: address });
    } catch (error) {
        return res.status(500).json({ message: "Error fetching address", error });
    }
}

module.exports = {
    createAddress, checkAddress
};