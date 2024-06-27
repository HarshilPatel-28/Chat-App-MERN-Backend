import express from "express";
//const express = require('express') ->Gives error Because we set "type": "module"
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { errorMiddleware } from "./middlewares/error.js";
import { connectDB } from "./utils/features.js";
import { Server } from "socket.io";
import { createServer } from 'http'
import { v4 as uuid } from "uuid";


import chatRoute from "./routes/chat.js";
import userRoute from "./routes/user.js";
import adminRoute from "./routes/admin.js";
import { NEW_MESSAGE, NEW_MESSAGE_ALERT } from "./constants/events.js";
import { getSockets } from "./lib/helper.js";
import { Message } from "./models/message.js";



dotenv.config({
    path: "./.env",
})
const mongoURI = process.env.MONGO_URI
const PORT = process.env.PORT || 3000

const envMode = process.env.NODE_ENV.trim() || "PRODUCTION";

const adminSecretKey = process.env.ADMIN_SECRET_KEY || "adsasdsdfsdfsdfd";

const userSocketIDs = new Map();

connectDB(mongoURI);



const app = express();
const server = createServer(app)
const io = new Server(server, {})

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

io.on("connection", (socket) => {
    const user = {
        _id: "jdbsj",
        name: "Harshil"
    }
    userSocketIDs.set(user._id.toString(), socket.id)




    console.log('a user connected', socket.id);

    socket.on(NEW_MESSAGE, async ({ chatId, members, message }) => {
        const messageForRealTime = {
            content: message,
            _id: uuid(),
            sender: {
                _id: user._id,
                name: user.name,
            },
            chat: chatId,
            createdAt: new Date().toISOString()
        }
        const messageForDB = {
            content: message,
            sender: user._id,
            chat: chatId,

        }

        const memberSocket = getSockets(members);

        io.to(memberSocket).emit(NEW_MESSAGE, {
            chatId,
            message: messageForRealTime,
        })
        io.to(memberSocket).emit(NEW_MESSAGE_ALERT, { chatId })

        try {
        await Message.create(messageForDB)
            
        } catch (error) {
            console.log(error);
        }        
    })

    socket.on('disconnect', () => {
        console.log(("Disconnected"));
        userSocketIDs.delete(user._id.toString())

    })
})

app.use(errorMiddleware)

server.listen(PORT, () => {
    console.log(`server is running on port ${PORT} in ${envMode} Mode`);
})

export { adminSecretKey, envMode, userSocketIDs }