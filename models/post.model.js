const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema.Types
const postSchema = new mongoose.Schema({
    heading:{
        type: String,
        required: true,
    },
    place:{
        type: String,
        required: true
    },
    body:{
        type: String,
        required: true
    },
    pic:{
        type: String,
        required: true
    },
    postedBy:{
        type: ObjectId,
        ref: "User"
    },
    agreed:[{type: ObjectId, ref:"User"}],
    disagreed:[{type: ObjectId, ref:"User"}],
    neutral:[{type: ObjectId, ref:"User"}],
    postedOn:{
        type: Date,
    },
    comments: [{
        text: String,
        postedBy: {type: ObjectId, ref:"User"}
    }]
})

mongoose.model("Post", postSchema);