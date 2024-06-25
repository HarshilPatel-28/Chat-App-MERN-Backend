import express from "express";
//const express = require('express') ->Gives error Because we set "type": "module"
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { errorMiddleware } from "./middlewares/error.js";
import { connectDB } from "./utils/features.js";

import chatRoute from "./routes/chat.js";
import userRoute from "./routes/user.js";



dotenv.config({
    path: "./.env",
})
const mongoURI = process.env.MONGO_URI
const PORT = process.env.PORT || 3000

connectDB(mongoURI);



const app = express();

//Middlewares
app.use(express.json()) //for json data
//app.use(express.urlencoded()) //for form data only text
app.use(cookieParser());


app.use("/user", userRoute)
app.use("/chat", chatRoute)


app.get("/", (req, res) => {
    res.send("Hello World!")
})

app.use(errorMiddleware)

app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
})