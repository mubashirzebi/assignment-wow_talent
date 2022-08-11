
const mongoose = require('mongoose');

let ObjectId = mongoose.Schema.Types.ObjectId;

const userSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
        trim: true
    },
    user_name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    gender: {
        type: String,
        required: true,
        enum: ["male", "female", "other"]
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },

    mobile: {
        type: Number,
        required: true,
        trim: true,
        unique: true
    },
    profile: {
        type: String,
        enum: ["public", "private"]
    },
    password: {
        type: String,
        required: true,
        trim: true
    },

    following: [{
        userId: {
            type: ObjectId,
            ref: 'User',
           
        }

    }],

    following_count: {
        type: Number,
    },
    followers: [{
        userId: {
            type: ObjectId,
            ref: 'User',
            
        }
    }],
    followers_count: {
        type: Number
    },
    post_Liked: [{
        postId: {
            type: ObjectId,
            ref: 'Post',
           
        }
    }],

    post_created: [{
        postId: {
            type: ObjectId,
            ref: "Post"
        }
    }],

    post_count: {
        type: Number
    }


}, { timestamps: true });

module.exports = mongoose.model('User', userSchema)