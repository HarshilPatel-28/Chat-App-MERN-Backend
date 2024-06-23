import express from "express";
//const express = require('express') ->Gives error Because we set "type": "module"
import userRoute from "./routes/user.js";
import { connectDB } from "./utils/features.js";
import dotenv from "dotenv";

dotenv.config({
    path:"./.env",
})
const mongoURI =process.env.MONGO_URI 
const PORT =process.env.PORT || 3000

connectDB(mongoURI);

const app = express();

//Middlewares
app.use(express.json()) //for json data
//app.use(express.urlencoded()) //for form data only text


app.use("/user",userRoute)

app.get("/",(req,res)=>{
    res.send("Hello World!")
})

app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
})