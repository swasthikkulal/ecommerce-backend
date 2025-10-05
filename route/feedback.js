const express = require("express")
const router = express.Router()
const { authMiddleware, adminMiddleware } = require("../middleware/authMiddleWare")
const { setFeedBack } = require("../controller/feedbackController")
router.post("/", authMiddleware, setFeedBack)


module.exports = router