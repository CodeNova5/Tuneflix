import mongoose from 'mongoose';

const db = process.env.MONGO_URI;
mongoose.connect(db).then(() => console.log('MongoDB connected')).catch(err => console.error(err));

// Define the Comment schema directly
// Reply schema
const replySchema = new mongoose.Schema({
    content: { type: String },
    replyTo: { type: String, required: true },
    user: { type: String, required: true },
    userId: { type: String, required: true },
    userImage: { type: String },
    createdAt: { type: Date, default: Date.now },
    replies: [], // Replies to replies
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

// Correcting the schema reference here
const Comment = mongoose.models.Comment || mongoose.model('Comment', commentSchema);

export default async function handler(req, res) {
    const { commentId, replyId } = req.query;
    const { userId } = req.body;
  if (req.method === 'POST') {
    try {
            const comment = await Comment.findById(commentId);
            if (!comment) return res.status(404).json({ error: 'Comment not found' });
    
            // Find the reply
            const reply = findReply(comment.replies, replyId);
            if (!reply) return res.status(404).json({ error: 'Reply not found' });
    
            // Like or unlike logic
            if (reply.likes.includes(userId)) {
                reply.likes = reply.likes.filter((id) => id !== userId); // Unlike
            } else {
                reply.likes.push(userId); // Like
            }
    
            await comment.save();
            res.json(reply);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
  } 

  else {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Recursive function to find a reply by ID  
  function findReply(replies, replyId) {  
    if (!Array.isArray(replies)) return null; // Ensure replies is an array  

    for (const reply of replies) {  
      if (reply && reply._id && reply._id.toString() === replyId) {  
        return reply;  
      }  
      // Recursively search nested replies  
      const nestedReply = reply?.replies ? findReply(reply.replies, replyId) : null;  
      if (nestedReply) return nestedReply;  
    }  
    return null;  
  }  
}