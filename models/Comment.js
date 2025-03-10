const mongoose = require('mongoose');

// Nested reply schema
const nestedReplySchema2 = new mongoose.Schema({
    content: { type: String },
    replyTo: { type: String, required: true },
    user: { type: String, required: true },
    userId: { type: String, required: true },
    userImage: { type: String },
    createdAt: { type: Date, default: Date.now },
    replies: [this], // Recursive nesting for replies
    likes: [{ type: String }],
    media: { type: String },

});


// Nested reply schema
const nestedReplySchema1 = new mongoose.Schema({
    content: { type: String },
    replyTo: { type: String, required: true },
    user: { type: String, required: true },
    userId: { type: String, required: true },
    userImage: { type: String },
    createdAt: { type: Date, default: Date.now },
    replies: [nestedReplySchema2], // Recursive nesting for replies
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
    replies: [nestedReplySchema1], // Nested replies
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
    replies: [replySchema],// Replies to the main comment
    likes: [{ type: String }],
    image: { type: String },   // Path to uploaded image
    video: { type: String },
});

module.exports = mongoose.model('Comment', commentSchema);