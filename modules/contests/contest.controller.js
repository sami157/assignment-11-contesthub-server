const { ObjectId } = require("mongodb");
const { contestsCollection, registrationsCollection, submissionsCollection, usersCollection } = require("../../config/connectMongoDB.js");

const createContest = async (req, res) => {
    try {
        const {
            creatorEmail,
            name,
            image,
            description,
            price,
            prizeMoney,
            taskInstruction,
            contestType,
            deadline,
        } = req.body;

        if (
            !creatorEmail ||
            !name ||
            !image ||
            !description ||
            price === undefined ||
            prizeMoney === undefined ||
            !taskInstruction ||
            !contestType ||
            !deadline
        ) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Contest document
        const newContest = {
            creatorEmail,
            name,
            image,
            description,
            price: Number(price),
            prizeMoney: Number(prizeMoney),
            taskInstruction,
            contestType,
            deadline: new Date(deadline),
            status: "pending",
            participantCount: 0,
            createdAt: new Date(),
        };

        const result = await contestsCollection.insertOne(newContest);

        res.status(201).json({
            message: "Contest created successfully",
            contestId: result.insertedId,
        });

    } catch (error) {
        res.status(500).json({ message: "Server error, please try again later" });
    }
};

const getContestsByCreator = async (req, res) => {
    try {
        const email = req.user.email; // token email, not from request directly

        const contests = await contestsCollection
            .find({ creatorEmail: email })
            .sort({ createdAt: -1 })
            .toArray();

        res.status(200).json(contests);

    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

const deleteContest = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: "Contest ID is required" });
        }

        const result = await contestsCollection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "Contest not found" });
        }

        res.status(200).json({ message: "Contest deleted successfully" });

    } catch (error) {
        console.error("Error deleting contest:", error);
        res.status(500).json({ message: "Server error" });
    }
};

const updateContest = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedData = req.body;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid contest ID" });
        }

        // Update the contest
        const result = await contestsCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { ...updatedData, updatedAt: new Date() } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "Contest not found" });
        }

        res.status(200).json({ message: "Contest updated successfully" });
    } catch (error) {
        console.error("Error updating contest:", error);
        res.status(500).json({ message: "Server error, please try again later" });
    }
};

const getContests = async (req, res) => {
    try {
        const contests = await contestsCollection.find({}).toArray();
        res.status(200).json(contests);
    } catch (error) {
        console.error("Error fetching contests:", error);
        res.status(500).json({ message: "Server error, please try again later" });
    }
};


const getApprovedContests = async (req, res) => {
    try {
        const { page, limit, type, all } = req.query;

        const filter = {
            status: 'confirmed'
        };
        if (type && type !== "all") {
            filter.contestType = type;
        }


        if (all === "true") {
            const contests = await contestsCollection
                .find(filter)
                .sort({ createdAt: -1 })
                .toArray();

            return res.status(200).json({
                contests,
                totalContests: contests.length,
                totalPages: 1,
                currentPage: 1,
            });
        }

        const pageNumber = parseInt(page) || 1;
        const pageLimit = parseInt(limit) || 6;
        const skip = (pageNumber - 1) * pageLimit;

        const totalContests = await contestsCollection.countDocuments(filter);

        const contests = await contestsCollection
            .find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(pageLimit)
            .toArray();

        res.status(200).json({
            contests,
            totalContests,
            totalPages: Math.ceil(totalContests / pageLimit),
            currentPage: pageNumber,
        });
    } catch (error) {
        console.error("Error fetching contests:", error);
        res.status(500).json({
            message: "Failed to fetch contests",
        });
    }
};

const getPopularContests = async (req, res) => {
    try {
        const contests = await contestsCollection
            .find({ status: "confirmed" })
            .sort({ participantCount: -1 })
            .limit(6)
            .toArray();

        res.status(200).json(contests);
    } catch (error) {
        console.error("Error fetching popular contests:", error);
        res.status(500).json({ message: "Server error" });
    }
};


const updateContestStatus = async (req, res) => {
    try {
        const { id } = req.params;        // contest _id
        const { status } = req.body;      // new status

        if (!status) {
            return res.status(400).json({ message: "Status is required" });
        }

        const result = await contestsCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { status } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "Contest not found" });
        }

        res.json({ message: "Status updated successfully" });
    } catch (error) {
        console.error("Error updating contest status:", error);
        res.status(500).json({ message: "Server error" });
    }
};

const getContestById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid contest ID" });
        }

        const contest = await contestsCollection.findOne({
            _id: new ObjectId(id),
        });

        if (!contest) {
            return res.status(404).json({ message: "Contest not found" });
        }

        res.status(200).json(contest);
    } catch (error) {
        console.error("Error fetching contest by id:", error);
        res.status(500).json({ message: "Server error, please try again later" });
    }
};


const submitContestTask = async (req, res) => {
    try {
        const contestId = req.params.id;
        const userEmail = req.user.email;
        const { submission } = req.body;

        if (!submission) {
            return res.status(400).json({ message: "Submission is required" });
        }

        const contest = await contestsCollection.findOne({
            _id: new ObjectId(contestId),
        });

        if (!contest) {
            return res.status(404).json({ message: "Contest not found" });
        }

        if (new Date(contest.deadline) < new Date()) {
            return res.status(400).json({ message: "Contest has ended" });
        }

        const registration = await registrationsCollection.findOne({
            contestId,
            userEmail,
        });

        if (!registration) {
            return res
                .status(403)
                .json({ message: "You are not registered for this contest" });
        }

        const alreadySubmitted = await submissionsCollection.findOne({
            contestId,
            userEmail,
        });

        if (alreadySubmitted) {
            return res
                .status(400)
                .json({ message: "Task already submitted" });
        }

        const submissionDoc = {
            contestId,
            userEmail,
            submission,
            submittedAt: new Date(),
            status: "submitted",
        };

        await submissionsCollection.insertOne(submissionDoc);

        res.status(201).json({
            message: "Task submitted successfully",
        });
    } catch (error) {
        console.error("Submit task error:", error);
        res.status(500).json({
            message: "Failed to submit task",
        });
    }
};


const declareWinner = async (req, res) => {
    try {
        const { contestId } = req.params;
        const { submissionId } = req.body;
        const creatorEmail = req.user.email;

        const contest = await contestsCollection.findOne({
            _id: new ObjectId(contestId),
            creatorEmail
        });

        if (!contest) {
            return res.status(403).json({
                message: "Unauthorized or contest not found"
            });
        }

        const now = new Date();
        const deadline = new Date(contest.deadline);

        if (now < deadline) {
            return res.status(400).json({
                message: "Cannot declare winner before contest deadline"
            });
        }

        if (contest.winner) {
            return res.status(400).json({
                message: "Winner already declared"
            });
        }

        const submission = await submissionsCollection.findOne({
            _id: new ObjectId(submissionId),
            contestId
        });


        if (!submission) {
            return res.status(404).json({
                message: "Submission not found"
            });
        }

        await contestsCollection.updateOne(
            { _id: new ObjectId(contestId) },
            {
                $set: {
                    winner: {
                        submissionId: submission._id,
                        userEmail: submission.userEmail,
                        userName: submission.userName,
                        declaredAt: new Date()
                    },
                    status: "completed"
                }
            }
        );

        await submissionsCollection.updateOne(
            { _id: submission._id },
            {
                $set: {
                    status: "winner"
                }
            }
        );

        res.status(200).json({
            message: "Winner declared successfully"
        });

    } catch (error) {
        console.error("Declare winner error:", error);
        res.status(500).json({
            message: "Failed to declare winner"
        });
    }
};


const getMyWinningContests = async (req, res) => {
    try {
        const userEmail = req.user.email;

        const contests = await contestsCollection
            .find({
                "winner.userEmail": userEmail
            })
            .project({
                name: 1,
                image: 1,
                prizeMoney: 1,
                deadline: 1
            })
            .toArray();

        res.status(200).json(contests);

    } catch (error) {
        console.error("Get winning contests error:", error);
        res.status(500).json({ message: "Failed to load winning contests" });
    }
};

const searchContests = async (req, res) => {
    try {
        const { type } = req.query;

        const filter = {};

        if (type && type.trim() !== "") {
            filter.contestType = {
                $regex: type.trim(),
                $options: "i",
            };
        }

        const contests = await contestsCollection
            .find(filter)
            .sort({ deadline: 1 })
            .limit(20)
            .toArray();

        res.status(200).json(contests);
    } catch (error) {
        console.error("Error searching contests:", error);
        res.status(500).json({
            message: "Failed to fetch contests",
        });
    }
};

const getWinners = async (req, res) => {
    try {
        const contestsWithWinners = await contestsCollection
            .find({ "winner.userEmail": { $exists: true } })
            .sort({ "winner.declaredAt": -1 })
            .limit(6)
            .toArray();

        const winnerEmails = contestsWithWinners.map(
            contest => contest.winner.userEmail
        );

        const users = await usersCollection
            .find({ email: { $in: winnerEmails } })
            .toArray();

        const userMap = {};
        users.forEach(user => {
            userMap[user.email] = user;
        });

        const winners = contestsWithWinners.map(contest => {
            const user = userMap[contest.winner.userEmail];

            return {
                contestName: contest.name,
                prizeMoney: contest.prizeMoney,
                winnerEmail: contest.winner.userEmail,
                winnerName: user?.name || "Anonymous Winner",
                winnerImage: user?.photoURL || "/default-avatar.png",
                declaredAt: contest.winner.declaredAt,
            };
        });

        res.status(200).json(winners);
    } catch (error) {
        console.error("Error fetching winners:", error);
        res.status(500).json({
            message: "Failed to load winners",
        });
    }
};

const getPlatformStats = async (req, res) => {
    try {
        const contestsWithWinners = await contestsCollection
            .find({ "winner.userEmail": { $exists: true } })
            .toArray();

        const totalWinners = contestsWithWinners.length;

        const totalPrizeMoney = contestsWithWinners.reduce(
            (sum, contest) => sum + (contest.prizeMoney || 0),
            0
        );

        res.status(200).json({
            totalWinners,
            totalPrizeMoney,
        });
    } catch (error) {
        console.error("Error fetching platform stats:", error);
        res.status(500).json({
            message: "Failed to fetch platform stats",
        });
    }
};

const getLeaderboard = async (req, res) => {
    try {
        const contestsWithWinners = await contestsCollection
            .find({ "winner.userEmail": { $exists: true } })
            .toArray();

            console.log(contestsWithWinners);

        const winCountMap = {};

        contestsWithWinners.forEach(contest => {
            const email = contest.winner.userEmail;
            if (email) {
                winCountMap[email] = (winCountMap[email] || 0) + 1;
            }
        });

        const emails = Object.keys(winCountMap);

        const users = await usersCollection
            .find({ email: { $in: emails } })
            .toArray();

        const leaderboard = users.map(user => ({
            userName: user.name || "",
            userEmail: user.email,
            userImage: user.photoURL || "",
            wins: winCountMap[user.email],
        }));

        leaderboard.sort((a, b) => b.wins - a.wins);

        res.status(200).json(leaderboard);
    } catch (error) {
        console.error("Error fetching leaderboard:", error);
        res.status(500).json({
            message: "Failed to fetch leaderboard",
        });
    }
};

module.exports = {
    createContest,
    getContestsByCreator,
    deleteContest,
    updateContest,
    getContests,
    updateContestStatus,
    getApprovedContests,
    getPopularContests,
    getContestById,
    submitContestTask,
    declareWinner,
    getMyWinningContests,
    searchContests,
    getWinners,
    getPlatformStats,
    getLeaderboard
};