import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Comment from '../../models/Comment.js';
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
        const form = formidable({ multiples: true });

        try {
            const [fields, files] = await form.parse(req);

            console.log('Parsed fields:', fields); // Debugging: Check if `pageUrl` and other fields exist

            const { pageUrl, content, user, userId, userImage, fcmtoken, imagePath, videoPath } = fields;

            if (!pageUrl) {
                return res.status(400).json({ error: 'pageUrl is required' });
            }

            // Proceed with saving comment
            const newComment = new Comment({
                pageUrl: pageUrl[0], // Since Formidable returns arrays
                content: content[0],
                user: user[0],
                userId: userId[0],
                userImage: userImage[0],
                fcmtoken: fcmtoken ? fcmtoken[0] : null,
                image: imagePath ? imagePath[0] : null,
                video: videoPath ? videoPath[0] : null,
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
