const dbConnect = require('../../lib/mongodb');
const Comment = require('../../models/Comment');

module.exports = async function (req, res) {
    await dbConnect;

    if (req.method === 'GET') {
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
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
};
