import dbConnect from '../../lib/mongodb';
import Comment from '../../models/Comment';

export default async function handler(req, res) {
  await dbConnect(); // Ensure the database connection is established

  res.setHeader('Access-Control-Allow-Origin', '*'); // Allow all origins (change to specific domains if needed)
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end(); // Preflight request response
  }

  const { commentId } = req.query; // Extract commentId from the URL

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
  } else {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
}
