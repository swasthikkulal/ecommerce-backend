const express = require("express")
const router = express.Router()
const { adminMiddleware } = require("../middleware/authMiddleWare")
const { adminCheck } = require("../controller/adminController")
router.get("/check", adminMiddleware, adminCheck)

module.exports = router;