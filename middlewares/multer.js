import multer from "multer";

//For  text/file data

 const multerUpload = multer({
    limits:{
        fileSize:1024 * 1024 * 5,//5mb
    }
});

const singleAvatar = multerUpload.single("avatar");

const attachmentMulter = multerUpload.array("files",5);

export {singleAvatar,attachmentMulter}