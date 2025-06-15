import mongoose from 'mongoose';

// Nested reply schema (Level 2)
const nestedReplySchema2 = new mongoose.Schema({
    content: { type: String },
    replyTo: { type: String, required: true },
    user: { type: String, required: true },
    userId: { type: String, required: true },
    userImage: { type: String },
    createdAt: { type: Date, default: Date.now },
    replies: [], // Recursive nesting for replies
    likes: [{ type: String }],
    media: { type: String },
});

// Nested reply schema (Level 1)
const nestedReplySchema1 = new mongoose.Schema({
    content: { type: String },
    replyTo: { type: String, required: true },
    user: { type: String, required: true },
    userId: { type: String, required: true },
    userImage: { type: String },
    createdAt: { type: Date, default: Date.now },
    replies: [nestedReplySchema2], // Nested replies
    likes: [{ type: String }],
    media: { type: String },
});

// Reply schema
const replySchema = new mongoose.Schema({
    content: { type: String },
    replyTo: { type: String, required: true },
    user: { type: String, required: true },
    userId: { type: String, required: true },
    userImage: { type: String },
    createdAt: { type: Date, default: Date.now },
    replies: [nestedReplySchema1], // Replies to replies
    likes: [{ type: String }],
    media: { type: String },
});

// Main comment schema
const commentSchema = new mongoose.Schema({
    pageUrl: { type: String, required: true, index: true },
    content: { type: String },
    user: { type: String, required: true },
    userId: { type: String, required: true },
    userImage: { type: String },
    fcmtoken: { type: String },
    createdAt: { type: Date, default: Date.now },
    replies: [replySchema], // Replies to the main comment
    likes: [{ type: String }],
    image: { type: String }, // Path to uploaded image
    video: { type: String },
});

// Export as ES module
const Comment = mongoose.model('Comment', commentSchema);
export default Comment;
