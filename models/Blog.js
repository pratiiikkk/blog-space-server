import mongoose, { Schema } from "mongoose";

const blogSchema = mongoose.Schema({

    blog_id: {
        type: String,
        required: true,
        unique: true,
    },
    title: {
        type: String,
        required: true,
    },
    banner: {
        type: String,
        // required: true,
    },
    des: {
        type: String,
        maxlength: 200,
        // required: true
    },
    content: {
        type: [],
        // required: true
    },
    tags: {
        type: [String],
        // required: true
    },
    author: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    activity: {
        total_likes: {
            type: Number,
            default: 0
        },
        total_comments: {
            type: Number,
            default: 0
        },
        total_reads: {
            type: Number,
            default: 0
        },
      
    },
    comments: {
        type: [Schema.Types.ObjectId],
        ref: 'Cooment'
    },
    draft: {
        type: Boolean,
        default: false
    }

}, 
{ 
    timestamps: {
        createdAt: 'publishedAt'
    } 

})

const Blog = mongoose.model('Blog', blogSchema);
export default  Blog;