import express from "express";
//const express = require('express') ->Gives error Because we set "type": "module"
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { errorMiddleware } from "./middlewares/error.js";
import { connectDB } from "./utils/features.js";
import { Server } from "socket.io";
import { createServer } from 'http'
import { v4 as uuid } from "uuid";
import cors from "cors";
import {v2 as cloudinary} from "cloudinary";


import chatRoute from "./routes/chat.js";
import userRoute from "./routes/user.js";
import adminRoute from "./routes/admin.js";
import { NEW_MESSAGE, NEW_MESSAGE_ALERT, START_TYPING, STOP_TYPING } from "./constants/events.js";
import { getSockets } from "./lib/helper.js";
import { Message } from "./models/message.js";
import { corsOptions } from "./constants/config.js";
import { socketAuthenticator } from "./middlewares/auth.js";



dotenv.config({
    path: "./.env",
})
const mongoURI = process.env.MONGO_URI
const PORT = process.env.PORT || 3000

const envMode = process.env.NODE_ENV.trim() || "PRODUCTION";

const adminSecretKey = process.env.ADMIN_SECRET_KEY || "adsasdsdfsdfsdfd";

const userSocketIDs = new Map();

connectDB(mongoURI);

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });



const app = express();
const server = createServer(app)
const io = new Server(server, {
    cors:corsOptions,
})

app.set("io",io)

//Middlewares
app.use(express.json()) //for json data
//app.use(express.urlencoded()) //for form data only text
app.use(cookieParser());
app.use(cors(corsOptions));


app.use("/api/v1/user", userRoute)
app.use("/api/v1/chat", chatRoute)
app.use("/api/v1/admin", adminRoute)


app.get("/", (req, res) => {
    res.send("Hello World!")
})

io.use((socket, next) => {
    cookieParser()(
      socket.request,
      socket.request.res,
      async (err) => await socketAuthenticator(err, socket, next)
    );
  });

io.on("connection", (socket) => {
    const user = socket.user;
    // console.log(user);
    userSocketIDs.set(user._id.toString(), socket.id)




    // console.log('a user connected', socket.id);

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


    socket.on(START_TYPING, ({ members, chatId }) => {
        const membersSockets = getSockets(members);
        socket.to(membersSockets).emit(START_TYPING, { chatId });
      });
    
      socket.on(STOP_TYPING, ({ members, chatId }) => {
        const membersSockets = getSockets(members);
        socket.to(membersSockets).emit(STOP_TYPING, { chatId });
      });

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