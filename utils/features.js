import mongoose from "mongoose"
import jwt from "jsonwebtoken";

const cookieOptions = {
    maxAge: 24*60*60*1000,
    sameSite:"none",
    httpOnly:true,
    secure:true,
}

const connectDB = (uri) =>{
    mongoose
        .connect(uri,{dbName:"Chattu"})
        .then((data)=> console.log(`Connected to DBB: ${data.connection.host}`))
        .catch((err)=>{
            throw err;
        })
}

const sendToken = (res,user,code,message)=>{
    const token = jwt.sign({_id:user._id},process.env.JWT_SECRET)

    return res.status(code).cookie("chattu-token",token,cookieOptions)
    .json({ 
        success:true,
        message,
        
     });

};

const emitEvent = (req,event,users,data)=>{
    console.log(event);
}

const deleteFilesFromCloudinary = ()=>{}
export { connectDB, sendToken,cookieOptions,emitEvent,deleteFilesFromCloudinary}