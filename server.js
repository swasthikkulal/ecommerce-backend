const express = require("express");
const app = express();
const port = 3000;
const userModel = require("./models/User")
const bcrypt = require("bcrypt")
const userRouter = require("./route/userRoutes")
const productRouter = require("./route/productRoute")
// Middleware
app.use(express.json());
require('dotenv').config();

// Database connection
require("./config/database");


app.use("/api/user", userRouter)
app.use("/api/product", productRouter)




app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});