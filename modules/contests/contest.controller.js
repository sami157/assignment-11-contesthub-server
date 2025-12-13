const { ObjectId } = require("mongodb");
const { contestsCollection } = require("../../config/connectMongoDB.js");

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
            createdAt: new Date(),
        };

        const result = await contestsCollection.insertOne(newContest);

        res.status(201).json({
            message: "Contest created successfully",
            contestId: result.insertedId,
        });

    } catch (error) {
        console.error("Error creating contest:", error);
        res.status(500).json({ message: "Server error, please try again later" });
    }
};

const getContestsByCreator = async (req, res) => {
    try {
        const email = req.user.email; // token email, not from request directly
        console.log(email);

        const contests = await contestsCollection
            .find({ creatorEmail: email })
            .sort({ createdAt: -1 })
            .toArray();

        res.status(200).json(contests);

    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};


module.exports = {
    createContest,
    getContestsByCreator
};