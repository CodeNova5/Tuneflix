const nextConnect = require('next-connect');
const formidable = require('formidable');
const mongoose = require('mongoose');
const Comment = require('../models/Comment');

mongoose.connect(process.env.MONGO_URI).then(() => console.log('MongoDB connected')).catch(err => console.error(err));

const handler = nextConnect();

// Use formidable to parse form data
handler.use((req, res, next) => {
    const form = new formidable.IncomingForm();
    form.parse(req, (err, fields, files) => {
        if (err) {
            return res.status(500).json({ error: 'File parsing error', details: err });
        }
        req.body = fields;
        req.files = files;
        next();
    });
});

// Handle POST request
handler.post(async (req, res) => {
    try {
        const { pageUrl, content, user, userId, userImage, fcmtoken } = req.body;
        const imagePath = req.files?.image?.[0] ? `/uploads/${req.files.image[0].newFilename}` : null;
        const videoPath = req.files?.video?.[0] ? `/uploads/${req.files.video[0].newFilename}` : null;

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
                    relevanceScore: -1,
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

export const config = {
    api: {
        bodyParser: false, // Disables Next.js default body parser to handle multipart form data
    },
};

module.exports = handler;
