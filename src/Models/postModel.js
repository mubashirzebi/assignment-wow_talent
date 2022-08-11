const mongoose = require('mongoose');
let ObjectId = mongoose.Schema.Types.ObjectId;

const postSchema = new mongoose.Schema({

    text: {
        type: String,
        required: true,
        trim: true
    },

    userId: {
        type: ObjectId,
        ref: "User"
    },
    imagesOrVideos: [{ type: String }],

    status: {
        type: String,
        enum: ["private", "public"]
    },
    
    like:[{
        userId:{
            type:ObjectId,
            ref:'User'
        }
    }],

    like_count:{
        type : Number
    },
    isDeleted:{
        type:Boolean,
        default: false
    }
     

}, { timestamps: true })
module.exports = mongoose.model("Post", postSchema) 