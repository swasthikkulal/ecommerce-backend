const express = require("express");
const router = express.Router();

// const login = require("../controller/userController")
const { register, login } = require("../controller/userController")
router.post("/register", register);
router.post("/login", login);
// router.get("/profile", getProfile);

module.exports = router;