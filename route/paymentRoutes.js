const express = require("express");
const { createOrder, getDetails } = require("../controller/paymentController");
const { authMiddleware } = require("../middleware/authMiddleWare");
const router = express.Router();

router.post("/create-order", authMiddleware, createOrder);
router.get("/getdetails/:id", authMiddleware, getDetails)

module.exports = router;
