import { createRouter } from 'next-connect';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Comment from '../models/Comment.js';
import formidable from 'formidable';
import fs from 'fs';

dotenv.config();

// MongoDB Connection
const db = process.env.MONGO_URI;
mongoose.connect(db).then(() => console.log('MongoDB connected')).catch(err => console.error(err));

const handler = createRouter();

export const config = {
    api: {
        bodyParser: false, // Important to disable Next.js body parser
    },
};

// Helper function to parse form data
const parseForm = (req) => {
    return new Promise((resolve, reject) => {
        const form = new formidable.IncomingForm({ multiples: true, uploadDir: "./public/uploads", keepExtensions: true });

        form.parse(req, (err, fields, files) => {
            if (err) reject(err);
            resolve({ fields, files });
        });
    });
};

// Handle POST request to create a new comment
handler.post(async (req, res) => {
    try {
        const { fields, files } = await parseForm(req);
        const { pageUrl, content, user, userId, userImage, fcmtoken } = fields;

        const imagePath = files.image ? `/uploads/${files.image.newFilename}` : null;
        const videoPath = files.video ? `/uploads/${files.video.newFilename}` : null;

        const newComment = new Comment({
            pageUrl,
            content,
            user,
            userId,
            userImage,
            fcmtoken,
            image: imagePath,
            video: videoPath,
            likes: [],
            replies: [],
            createdAt: new Date(),
        });

        await newComment.save();
        res.status(201).json(newComment);
    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ message: 'Error saving comment', error });
    }
});

// Handle GET request to fetch comments
handler.get(async (req, res) => {
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

        res.status(200).json(comments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Ensure only GET or POST methods are allowed
handler.all((req, res) => {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
});

export default handler;
