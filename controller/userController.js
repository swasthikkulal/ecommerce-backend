const bcrypt = require("bcrypt")
const userModel = require("../models/User");

const jwt = require("jsonwebtoken")


const register = async (req, res) => {
    try {
        console.log(req.body)
        const { name, email, password } = req.body;

        // Check if user already exists
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        // Create user
        const user = await userModel.create({
            name,
            email,
            password: hashedPassword
        });
        const saveData = await user.save()
        return res.json({ success: true, data: saveData })
    } catch (error) {
        return res.json({ success: false, message: error.message })
    }
}

const login = async (req, res) => {
    try {
        console.log(req.body)
        let { email, password } = req.body;

        const user = await userModel.findOne({ email })
        if (!user) {
            return res.status(400).json({ success: false, message: "invalid credentials" })
        }

        const comparePassword = await bcrypt.compare(password, user.password)
        if (!comparePassword) {
            return res.status(400).json({ success: false, message: "invalid credentials" })
        }
        const token = jwt.sign({ userId: user._id, email: user.email, role: user.role }, process.env.SECRET_KEY, { expiresIn: "7d" })
        return res.json({
            success: true,
            message: "Login successful",
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
}



const getProfile = async (req, res) => {
    try {

        const findUser = await userModel.findById({ _id: req.user.userId })
        if (!findUser) {
            return res.status(400).json({ success: false, message: "invaid user" })
        }
        return res.status(200).json({ success: true, data: findUser })
    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
}

const getAllProfile = async (req, res) => {
    try {
        const users = await userModel.find({});
        return res.status(200).json({ success: true, data: users });
    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
}
module.exports = { register, login, getProfile, getAllProfile }