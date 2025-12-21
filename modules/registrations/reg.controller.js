
const { registrationsCollection, contestsCollection } = require("../../config/connectMongoDB");

const checkRegistration = async (req, res) => {
    const contestId = req.params.contestId;
    const userEmail = req.user.email;

    const registration = await registrationsCollection.findOne({
        contestId,
        userEmail,
    });

    res.json({ registered: !!registration });
};

const getMyParticipatedContests = async (req, res) => {
    try {
        const userEmail = req.user.email;

        const participated = await registrationsCollection.aggregate([
            { $match: { userEmail: userEmail } },

            {
                $addFields: {
                    contestObjId: { $toObjectId: "$contestId" }
                }
            },

            {
                $lookup: {
                    from: "contests",
                    localField: "contestObjId",
                    foreignField: "_id",
                    as: "contest"
                }
            },

            { $unwind: "$contest" },

            {
                $project: {
                    _id: '$contestObjId',
                    paymentStatus: 1,
                    contestName: "$contest.name",
                    contestImage: "$contest.image",
                    contestType: "$contest.contestType",
                    deadline: "$contest.deadline",
                    participantCount: "$contest.participantCount",
                    price: "$contest.price",
                    prizeMoney: "$contest.prizeMoney"
                }
            },

            { $sort: { deadline: 1 } }
        ]).toArray();

        res.status(200).json(participated);

    } catch (err) {
        console.error("Error fetching participated contests:", err);
        res.status(500).json({ message: "Server error" });
    }
};




module.exports = { 
    checkRegistration,
    getMyParticipatedContests
 };
