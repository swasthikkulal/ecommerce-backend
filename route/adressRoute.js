const express = require("express");
const router = express.Router();
const { createAddress, checkAddress } = require("../controller/addressController")
const { adminMiddleware, authMiddleware } = require("../middleware/authMiddleWare")


router.post("/", authMiddleware, createAddress)
router.get("/get", adminMiddleware, checkAddress)


module.exports = router;