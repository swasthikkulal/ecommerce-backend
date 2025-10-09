const express = require("express");
const router = express.Router();
const { authMiddleware, adminMiddleware } = require("../middleware/authMiddleWare");
const { checkOrder, getOrder, getuserOrder } = require("../controller/mainOrderController");

router.post("/order", authMiddleware, checkOrder);
router.get("/getorder", adminMiddleware, getOrder);
router.get("/getuserorder", authMiddleware, getuserOrder);

module.exports = router;