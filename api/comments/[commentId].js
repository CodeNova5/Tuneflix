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
        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found.' });
        }
        return res.status(200).json(comment);
    } catch (error) {
        console.error('Error fetching comment:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
} 
  if (req.method === 'PUT') {
    const { userId, content } = req.body;

    try {
      const comment = await Comment.findById(commentId);

      if (!comment) {
        return res.status(404).json({ message: 'Comment not found.' });
      }

      if (comment.userId !== userId) {
        return res.status(403).json({ message: 'You are not authorized to edit this comment.' });
      }

      comment.content = content;
      await comment.save();

      return res.status(200).json({ message: 'Comment updated successfully.', comment });
    } catch (error) {
      console.error('Error editing comment:', error);
      return res.status(500).json({ message: 'Internal server error.' });
    }
  } 
  
  if (req.method === 'DELETE') {
    const { userId } = req.body;

    try {
      const comment = await Comment.findById(commentId);

      if (!comment) {
        return res.status(404).json({ message: 'Comment not found.' });
      }

      if (comment.userId !== userId) {
        return res.status(403).json({ message: 'You are not authorized to delete this comment.' });
      }

      await comment.deleteOne();

      return res.status(200).json({ message: 'Comment deleted successfully.' });
    } catch (error) {
      console.error('Error deleting comment:', error);
      return res.status(500).json({ message: 'Internal server error.' });
    }
  } 

  else {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
}
