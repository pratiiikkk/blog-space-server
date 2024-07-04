import mongoose, { Schema } from "mongoose";

const commentSchema = mongoose.Schema({
    
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',  // Reference to your User model
        required: true
    },
    blog: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Blog',  // Reference to your Blog model
        required: true
    },
    content: {
        type: String,
        required: true
    },
},
{
    timestamps: {
        createdAt: 'commentedAt'
    }
})

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;