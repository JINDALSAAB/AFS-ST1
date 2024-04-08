const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    username:{
        type:String
    },
    mobile:{
        type:Number
    },
    email:{
        type:String
    },
    password:{
        type:String
    },
    verified:{
        type:Boolean,
        default:false
    }
})

const User = mongoose.model("User",userSchema);
module.exports = User;