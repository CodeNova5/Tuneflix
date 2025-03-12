import { createRouter } from 'next-connect';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Comment from '../models/Comment.js';
import { IncomingForm } from 'formidable';
import fs from 'fs/promises';


dotenv.config();

// MongoDB Connection
const db = process.env.MONGO_URI;
mongoose.connect(db).then(() => console.log('MongoDB connected')).catch(err => console.error(err));

// Ensure bodyParser is disabled for file uploads
export const config = {
    api: {
        bodyParser: false,
    },
};

// Helper function to parse form data
const parseForm = async (req) => {
    const form = new IncomingForm({ multiples: true, uploadDir: "./public/uploads", keepExtensions: true });

    return new Promise((resolve, reject) => {
        form.parse(req, async (err, fields, files) => {
            if (err) return reject(err);

            // Move uploaded files to the correct location (if needed)
            if (files.image) {
                const oldPath = files.image.filepath;
                const newPath = `./public/uploads/${files.image.originalFilename}`;
                await fs.rename(oldPath, newPath);
                files.image.path = newPath;
            }
            if (files.video) {
                const oldPath = files.video.filepath;
                const newPath = `./public/uploads/${files.video.originalFilename}`;
                await fs.rename(oldPath, newPath);
                files.video.path = newPath;
            }

            resolve({ fields, files });
        });
    });
};

// API route handler
const handler = async (req, res) => {
    if (req.method === 'POST') {
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
