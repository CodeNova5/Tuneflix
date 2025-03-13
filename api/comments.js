import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Comment from '../models/Comment.js';
import formidable from 'formidable';
dotenv.config();

// MongoDB Connection
const db = process.env.MONGO_URI;
mongoose.connect(db).then(() => console.log('MongoDB connected')).catch(err => console.error(err));

export const config = {
    api: {
        bodyParser: false, // Disable bodyParser to handle FormData manually
    },
};

// API route handler
const handler = async (req, res) => {
    if (req.method === 'POST') {
        const form = new formidable.IncomingForm();

        form.parse(req, (err, fields, files) => {
            if (err) {
                console.error('Form parsing error:', err);
                return res.status(500).json({ error: 'Error parsing form data' });
            }

            console.log('Parsed fields:', fields); // Debugging: Check if `pageUrl` exists

            const { pageUrl, content, user, userId, userImage } = fields;

            if (!pageUrl) {
                return res.status(400).json({ error: 'pageUrl is required' });
            }

            // Proceed with saving comment
            res.status(200).json({ message: 'Comment posted successfully' });
        });

        try {
            const { pageUrl, content, user, userId, userImage, fcmtoken } = req.body;

            const newComment = new Comment({
                pageUrl,
                content,
                user,
                userId,
                userImage,
                fcmtoken,
                likes: [],
                replies: [],
                createdAt: new Date(),
            });

            await newComment.save();
            return res.status(201).json(newComment);
        } catch (error) {
            console.error('Upload Error:', error);
            return res.status(500).json({ message: 'Error saving comment', error });
        }
    } else if (req.method === 'GET') {
        try {
            const { pageUrl, page = 0, limit = 5, userId } = req.query;
            const skip = parseInt(page) * parseInt(limit);

            const comments = await Comment.aggregate([
                { $match: { pageUrl } },
                {
                    $addFields: {
                        relevanceScore: {
                            $add: [
                                { $size: "$replies" },
                                { $size: "$likes" }
                            ]
                        },
                        isUserComment: { $eq: ["$userId", userId] }
                    }
                },
                {
                    $sort: {
                        isUserComment: -1,
                        createdAt: -1,
                        relevanceScore: -1
                    }
                },
                { $skip: skip },
                { $limit: parseInt(limit) }
            ]);

            return res.status(200).json(comments);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    } else {
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }
};

export default handler;
