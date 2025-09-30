const jwt = require("jsonwebtoken");
require("dotenv").config()

const authMiddleware = (req, res, next) => {
    try {
        let token = req.headers["auth-token"]?.replace(/^"|"$/g, "");

        if (!token) {
            return res.status(401).json({ success: false, message: "No token provided authorization failed" })
        }

        const decode = jwt.verify(token, process.env.SECRET_KEY)


        req.user = {
            userId: decode.userId, // Extract just the userId
            email: decode.email,
            role: decode.role
        };

        console.log("Decoded user:", req.user);
        next();
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
};

const adminMiddleware = (req, res, next) => {
    try {
        let token = req.headers["auth-token"]?.replace(/^"|"$/g, "");

        if (!token) {
            return res.status(401).json({ success: false, message: "No token provided authorization failed" })
        }

        const decode = jwt.verify(token, process.env.SECRET_KEY)


        req.user = {
            userId: decode.userId, // Extract just the userId
            email: decode.email,
            role: decode.role
        };
        console.log(req.user.role)
        if (decode.role == "admin") {
            next();
        } else {
            return res.status(403).json({ message: "Access denied. Admins only." });
        }

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }

};

module.exports = { authMiddleware, adminMiddleware };