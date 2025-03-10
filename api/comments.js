const nextConnect = require('next-connect');
const mongoose = require('mongoose');
const Comment = require('../../models/Comment');

// MongoDB Connection
const db = process.env.MONGO_URI;
mongoose.connect(db).then(() => console.log('MongoDB connected')).catch(err => console.error(err));

const handler = nextConnect();

// Handle file upload and comment submission
handler.use(upload.fields([{ name: 'image' }, { name: 'video' }]));

handler.post(async (req, res) => {
    try {
        const { pageUrl, content, user, userId, userImage, fcmtoken } = req.body;
        const imagePath = req.files?.image?.[0] ? `/uploads/${req.files.image[0].filename}` : null;
        const videoPath = req.files?.video?.[0] ? `/uploads/${req.files.video[0].filename}` : null;

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
                    createdAt: -1
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

export default handler;
