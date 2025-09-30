const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/authMiddleWare")


// const login = require("../controller/userController")
const { register, login, getProfile } = require("../controller/userController")
router.post("/register", register);
router.post("/login", login);
router.get("/profile", authMiddleware, getProfile);

module.exports = router;