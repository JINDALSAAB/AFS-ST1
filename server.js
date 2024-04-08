const express = require('express')
const mongoose = require('mongoose')
const multer = require('multer')
//this imports Multer, a middleware for handling 
//multipart/form-data, primarily used for uploading files.
const fs = require('fs')
//This imports the Node.js file system module, 
//which provides functions for interacting with the file system.
const User = require('./model/User')
const nodemailer = require('nodemailer');
//This imports Nodemailer, a module for sending emails with Node.js.
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service:"gmail",
    auth:{
        user:"mittalrohit701@gmail.com",
        pass:process.env.PASS,
    }
})

mongoose.connect("mongodb://localhost:27017/RegisterOtp").then(()=>{
    console.log("Connection to db succesfull");
}).catch(err=>{
    console.log(err);
})


// The multer.diskStorage() function is used to configure the storage engine where uploaded files will be stored on the disk.
// It takes an object with configuration options. In this case, the destination option specifies the directory where uploaded files will be stored. __dirname + "/uploads" 
//specifies the absolute path to the "uploads" directory relative to the current file's directory (__dirname is a Node.js global variable that represents the directory name of the current module).
// The filename option specifies how the uploaded files should be named. In this example, the original name of the uploaded file is used as the filename.

const storage = multer.diskStorage({
    destination:__dirname+"/uploads",
    filename:function(req,file,cb){
        cb(null,file.originalname);
        // The filename option specifies how the uploaded files should 
        //be named. In this example, the original name of the uploaded file is used as the filename.
    }
});
const upload = multer({
    storage
    // The upload constant is created by calling multer() with the provided configuration.
// This upload constant is now a middleware function that can be used to handle file uploads in your Express routes.

});

const app = express();
app.set('view engine','hbs');
app.set('views','views')

app.use(express.urlencoded());
app.listen(3000,()=>{
    console.log("http://localhost:3000");
})


app.get('/',(req,res)=>{
    res.send("Welcome to my Website :)");
})

app.get('/register',(req,res)=>{
    res.render("register");
})
var email;
var Otp;
app.post('/register',upload.single('img'),async (req,res)=>{
    // It utilizes the upload.single('img') middleware from Multer to handle file uploads. 
    //The file uploaded via the 'img' field of the form is stored in req.file, and other form fields are stored in req.body.

    const file = req.file;
    const data = req.body;
    const newUser = new User(data);

    const newName= newUser._id+"."+file.mimetype.split("/")[1];
    const newPath = file.destination+"/"+newName;
    //It renames the uploaded file using the _id of the newly created user and the file's mimetype.
// It then moves the uploaded file from its temporary location to the specified destination directory.
    fs.renameSync(file.path,newPath);
    
    try{
        await newUser.save();
        email=newUser.email
        Otp=random();
        mail1()
        res.render("otp");
    }catch{
        res.send("Error");
    }
})

app.post('/verify',async (req,res)=>{
    const otp = req.body;
    const user = await User.findOne().where('email').equals(email);
    if(otp.otp==Otp)
    {

        user.verified=true;
        await user.save();
        res.send("Success");
    }
    else   
        res.send("Failed");
})

app.get("/display",async(req,res)=>{
    const data = req.query.search;
    // It retrieves the value of the 'search' query parameter from the request URL using req.query.search.
// The value of the 'search' parameter is stored in the data variable.
    const user = await User.findOne().where('email').equals(data);
    // const user = await User.find();
    // console.log(data);

res.render("display",{user});
//The view is passed the found user document as data, which is stored in the user variable.

})



function random() {
    var randomNumber = Math.floor(Math.random() * 9000) + 1000;
    console.log(randomNumber);
    return randomNumber;
}



function mail1(){
    const mail = {
        from:"mittalrohit701@gmail.com",
        to:email,
        subject:'OTP Verification',
        text:`Your Otp is ${Otp}`,
    }
    transporter.sendMail(mail);
}
