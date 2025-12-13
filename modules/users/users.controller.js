const { ObjectId } = require("mongodb");
const { db, usersCollection } = require("../../config/connectMongoDB.js")

const createUser = async (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: "Name and email are required" });
  }

  try {
    // Check if the user already exists
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    // Create new user with default role 'user'
    const newUser = {
      name,
      email,
      role: "user",
      createdAt: new Date(),
    };

    const result = await usersCollection.insertOne(newUser);

    res.status(201).json({ message: "User created", userId: result.insertedId });
  } catch (error) {
    res.status(500).json({ message: "Server error, please try again later" });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await usersCollection.find({}).toArray();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error, please try again later" });
  }
};

const getUserRole = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await usersCollection.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ role: user.role });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


const changeRole = async (req, res) => {
  try {
    const { email } = req.params;          // email of the user to modify
    const { role } = req.body;             // new role (user, creator, admin)

    if (!email || !role) {
      return res.status(400).json({ message: "Email and role are required" });
    }

    // Update the role
    const result = await usersCollection.updateOne(
      { email },
      { $set: { role } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Role updated successfully" });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createUser,
  getUsers, 
  changeRole,
  getUserRole
};

