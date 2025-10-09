const express = require("express");
const router = express.Router();
const { authMiddleware, adminMiddleware } = require("../middleware/authMiddleWare")

// TODO: Import controllers
const { createOrder, getOrder, getAllOrders, updateOrderStatus, deleteOrder, checkOut, deleteAllOrder } = require("../controller/orderController")

// TODO: Add routes
router.post("/", authMiddleware, createOrder);//this is cart
router.get("/getorder", authMiddleware, getOrder); //this is cart
router.get("/getallorder", adminMiddleware, getAllOrders); //this is cart
router.delete("/clearcart", authMiddleware, deleteAllOrder); //this is cart

router.delete("/delete/:id", authMiddleware, deleteOrder);  //this is cart

router.put("/:id", adminMiddleware, updateOrderStatus); // this is cart






module.exports = router;