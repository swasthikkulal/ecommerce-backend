const productModel = require("../models/Product")

const addProduct = async (req, res) => {
    try {
        console.log(req.body)
        let { name, price, image, description, stock } = req.body;
        const checkProduct = await productModel.findOne({ name })
        if (checkProduct) {
            return res.json({ success: false, message: "product already exists" })
        }
        const addProduct = await productModel.create({
            name, price, image, description, stock
        })
        if (!addProduct) {
            return res.status(400).json({ success: false, message: "product is not added" })
        }
        const productSave = await addProduct.save()
        return res.json({ success: true, data: productSave })
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getProducts = async (req, res) => {
    try {
        const findAllProduct = await productModel.find();
        if (!findAllProduct) {
            return res.json({ success: false, message: "no product found" })
        }
        return res.json({ success: true, data: findAllProduct })
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
const getProductById = async (req, res) => {
    try {

        const findProductById = await productModel.findById({ _id: req.params.id })
        if (!findProductById) {
            return res.json({ success: false, message: "no product found" })
        }
        return res.json({ success: true, data: findProductById })
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const updateProduct = async (req, res) => {
    try {
        console.log(req.body)
        let { name, price, image, description, stock } = req.body;
        const updateProduct = await productModel.findByIdAndUpdate(req.params.id, {
            name,
            price,
            image, description, stock
        }, { new: true })
        if (!updateProduct) {
            return res.json({ success: false, message: "an error occured" })
        }
        const saveUpdatedProduct = updateProduct.save()
        return res.json({ success: true, data: updateProduct, message: "product updated" })
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const deleteProduct = async (req, res) => {
    try {
        const deleteProductById = await productModel.findByIdAndDelete({ _id: req.params.id })
        if (!deleteProductById) {
            return res.json({ success: false, message: "no product found" })
        }
        return res.json({ success: true, message: "product deleted successfully" })
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
module.exports = { addProduct, getProducts, getProductById, updateProduct, deleteProduct }