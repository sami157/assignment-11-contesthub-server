const { ObjectId } = require("mongodb");
const { submissionsCollection } = require("../../config/connectMongoDB");


const getSubmissionsByCreator = async (req, res) => {
    try {
        const creatorEmail = req.params.email;

        const submissions = await submissionsCollection.aggregate([
            {
                // 🔹 convert contestId string → ObjectId
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
                $lookup: {
                    from: "users",
                    localField: "userEmail",
                    foreignField: "email",
                    as: "user"
                }
            },
            { $unwind: "$user" },

            {
                $project: {
                    contestId: 1,
                    contestName: "$contest.name",
                    userEmail: 1,
                    userName: "$user.name",
                    submission: 1,
                    submittedAt: 1,
                    status: 1
                }
            }
        ]).toArray();

        res.status(200).json(submissions);
    } catch (error) {
        console.error("Submission fetch error:", error);
        res.status(500).json({ message: "Failed to fetch submissions" });
    }
};


module.exports = { getSubmissionsByCreator };
