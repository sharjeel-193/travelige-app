const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema.Types
const userSchema = new mongoose.Schema({
    fullName:{
        type: String,
        required: true
    },
    userName:{
        type:String,
        required: true,
        unique: true,
    },
    email:{
        type:String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    followers: [{
        type: ObjectId,
        ref: "User"
    }],
    followings: [{
        type: ObjectId,
        ref: "User"
    }]
})

mongoose.model("User",userSchema);