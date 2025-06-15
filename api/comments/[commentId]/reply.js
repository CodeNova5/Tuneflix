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

  if (req.method === 'POST') {
    const { content, user, userId, replyTo, commentOwnerId, userImage, fcmtoken, replyId } = req.body;
    
    try {
        const parentComment = await Comment.findById(commentId);
        if (!parentComment) {
            return res.status(404).json({ message: 'Comment not found.' });
        }

        const reply = {
            user,
            userId,
            replyTo,
            commentOwnerId,
            content,
            userImage,
            fcmtoken,
            replyId,
            createdAt: new Date(),
        };

        parentComment.replies.push(reply);
        await parentComment.save();

        return res.status(201).json({ message: 'Reply added successfully.', reply });
    } catch (error) {
        console.error('Error submitting reply:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
  } 
  
  

  else {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
}
