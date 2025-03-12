import { createRouter } from 'next-connect';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Comment from '../models/Comment.js';
import formidable from 'formidable';
import fs from 'fs/promises';

dotenv.config();

// MongoDB Connection
const db = process.env.MONGO_URI;
mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Ensure bodyParser is disabled for file uploads
export const config = {
    api: {
        bodyParser: false,
    },
};

// Helper function to parse form data
const parseForm = (req) => {
    const form = new formidable.IncomingForm({
        multiples: true,
        uploadDir: './public/uploads',
        keepExtensions: true
    });

    return new Promise((resolve, reject) => {
        form.parse(req, async (err, fields, files) => {
            if (err) return reject(err);

            const moveFile = async (file) => {
                if (file && file.filepath) {
                    const newPath = `./public/uploads/${file.originalFilename || file.newFilename}`;
                    await fs.rename(file.filepath, newPath);
                    return `/uploads/${file.originalFilename || file.newFilename}`;
                }
                return null;
            };

            const imagePath = await moveFile(files.image);
            const videoPath = await moveFile(files.video);

            resolve({ fields, files, imagePath, videoPath });
        });
    });
};

// API route handler
const handler = async (req, res) => {
    if (req.method === 'POST') {
        try {
            const { fields, imagePath, videoPath } = await parseForm(req);
            const { pageUrl, content, user, userId, userImage, fcmtoken } = fields;
            
            const newComment = new Comment({
                pageUrl: Array.isArray(pageUrl) ? pageUrl[0] : pageUrl,
                content: Array.isArray(content) ? content[0] : content,
                user: Array.isArray(user) ? user[0] : user,
                userId: Array.isArray(userId) ? userId[0] : userId,
                userImage: Array.isArray(userImage) ? userImage[0] : userImage,
                fcmtoken: Array.isArray(fcmtoken) ? fcmtoken[0] : fcmtoken,
                image: imagePath,
                video: videoPath,
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
                        relevanceScore: { $add: [{ $size: "$replies" }, { $size: "$likes" }] },
                        isUserComment: { $eq: ["$userId", userId] }
                    }
                },
                { $sort: { isUserComment: -1, relevanceScore: -1, createdAt: -1 } },
                { $skip: skip },
                { $limit: parseInt(limit) }
            ]);

            return res.status(200).json(comments);
        } catch (error) {
            console.error('Fetch Error:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    } else {
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }
};

export default handler;
