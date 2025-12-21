const { ObjectId } = require("mongodb");
const { submissionsCollection } = require("../../config/connectMongoDB");

const getSubmissionsByCreator = async (req, res) => {
    try {
        const creatorEmail = req.params.email;

        if (!creatorEmail) {
            return res.status(400).json({ message: "Creator email is required" });
        }

        const submissions = await submissionsCollection.aggregate([
            {
                $addFields: {
                    contestObjectId: { $toObjectId: "$contestId" }
                }
            },

            {
                $lookup: {
                    from: "contests",
                    localField: "contestObjectId",
                    foreignField: "_id",
                    as: "contest"
                }
            },

            { $unwind: "$contest" },

            {
                $match: {
                    "contest.creatorEmail": creatorEmail
                }
            },

            {
                $project: {
                    _id: 1,
                    submission: 1,
                    status: 1,
                    submittedAt: 1,
                    userEmail: 1,
                    contestId: 1,
                    contestName: "$contest.name",
                    contestImage: "$contest.image",
                    contestDeadline: "$contest.deadline",
                    contestType: "$contest.contestType",
                }
            },

            { $sort: { submittedAt: -1 } }
        ]).toArray();

        res.status(200).json(submissions);

    } catch (error) {
        console.error("Error fetching submissions:", error);
        res.status(500).json({ message: "Failed to fetch submissions" });
    }
};

module.exports = { getSubmissionsByCreator };
