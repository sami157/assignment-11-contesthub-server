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
        const contests = await contestsCollection
            .find({ status: "confirmed" })
            .toArray();

        res.status(200).json(contests);
    } catch (error) {
        console.error("Error fetching contests:", error);
        res.status(500).json({
            message: "Server error, please try again later",
        });
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

module.exports = {
    createContest,
    getContestsByCreator,
    deleteContest,
    updateContest,
    getContests,
    updateContestStatus,
    getApprovedContests
};