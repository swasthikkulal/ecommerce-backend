const express = require("express");
const app = express();
const port = 3000;
const userModel = require("./models/User")
const bcrypt = require("bcrypt")
const userRouter = require("./route/userRoutes")
const productRouter = require("./route/productRoute")
const orderRouter = require("./route/orderRoute")
const addressRouter = require("./route/adressRoute")
const cors = require("cors")
// Middleware
app.use(cors())
app.use(express.json());
require('dotenv').config();

// Database connection
require("./config/database");


app.use("/api/user", userRouter)
app.use("/api/admin", userRouter)
app.use("/api/product", productRouter)
app.use("/api/orders", orderRouter);
app.use("/api/address", addressRouter);
app.use("/api/payment", require("./route/paymentRoutes"));
app.use("/api/checkout", require("./route/mainorder"))
app.use("/api/admin", require("./route/adminRoute"))
app.use("/api/feedback", require("./route/feedback"))




app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});