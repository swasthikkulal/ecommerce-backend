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
        res.json({ success: true, data: saveData })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

const login = async (req, res) => {
    try {
        console.log(req.body)
        let { email, password } = req.body;

        const user = await userModel.findOne({ email })
        if (!user) {
            res.status(400).json({ success: false, message: "invalid credentials" })
        }

        const comparePassword = await bcrypt.compare(password, user.password)
        if (!comparePassword) {
            res.status(400).json({ success: false, message: "invalid credentials" })
        }
        const token = jwt.sign({ userId: user._id, email: user.email }, process.env.SECRET_KEY, { expiresIn: "7d" })
        res.json({
            message: "Login successful",
            token,
            user: { id: user._id, name: user.name, email: user.email }
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

module.exports = { register, login }