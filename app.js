import express from "express";
//const express = require('express') ->Gives error Because we set "type": "module"
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { errorMiddleware } from "./middlewares/error.js";
import { connectDB } from "./utils/features.js";

import chatRoute from "./routes/chat.js";
import userRoute from "./routes/user.js";
import adminRoute from "./routes/admin.js";



dotenv.config({
    path: "./.env",
})
const mongoURI = process.env.MONGO_URI
const PORT = process.env.PORT || 3000

const envMode = process.env.NODE_ENV.trim() || "PRODUCTION";

const adminSecretKey = process.env.ADMIN_SECRET_KEY || "adsasdsdfsdfsdfd";

connectDB(mongoURI);



const app = express();

//Middlewares
app.use(express.json()) //for json data
//app.use(express.urlencoded()) //for form data only text
app.use(cookieParser());


app.use("/user", userRoute)
app.use("/chat", chatRoute)
app.use("/admin", adminRoute)


app.get("/", (req, res) => {
    res.send("Hello World!")
})

app.use(errorMiddleware)

app.listen(PORT, () => {
    console.log(`server is running on port ${PORT} in ${envMode} Mode`);
})

export {adminSecretKey,envMode}