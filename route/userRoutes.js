const express = require("express");
const router = express.Router();
const { authMiddleware, adminMiddleware } = require("../middleware/authMiddleWare")


// const login = require("../controller/userController")
const { register, login, getProfile, getAllProfile } = require("../controller/userController")
router.post("/register", register);
router.post("/login", login);
router.get("/users", adminMiddleware, getAllProfile);
router.get("/profile", authMiddleware, getProfile);

module.exports = router;