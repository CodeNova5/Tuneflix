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
  const { commentId } = req.query;


if (req.method === 'GET') {
    try {
      const comment = await Comment.findById(commentId).select('replies');

      if (!comment) {
        return res.status(404).json({ message: 'Comment not found.' });
      }

      return res.status(200).json(comment.replies);
    } catch (error) {
      console.error('Error fetching replies:', error);
      return res.status(500).json({ message: 'Internal server error.' });
    }
  } 

  if (req.method === 'PUT') {
    const { commentId, replyId } = req.params;  
    const { userId, content } = req.body; // Get userId and content from request body  
  
    try {  
        // Find the parent comment  
        const comment = await Comment.findById(commentId);  
  
        if (!comment) {  
            return res.status(404).json({ message: 'Comment not found.' });  
        }  
  
        // Find the reply   
        const reply = findReply(comment.replies, replyId);  
        if (!reply) {  
            return res.status(404).json({ message: 'Reply not found.' });  
        }  
  
        // Check if the user is the owner of the reply  
        if (reply.userId !== userId) {  
            return res.status(403).json({ message: 'You are not authorized to edit this reply.' });  
        }  
  
        // Update the reply content  
        reply.content = content;  
        await comment.save();  
  
        res.json({ message: 'Reply updated successfully.', reply });  
    } catch (error) {  
        console.error('Error editing reply:', error);  
        res.status(500).json({ message: 'Internal server error.' });  
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