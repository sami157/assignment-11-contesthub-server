const { ObjectId } = require("mongodb");
const { db, usersCollection } = require("../../config/connectMongoDB.js")


const createUser = async (req, res) => {
  const { name, email, role } = req.body 
  try {
    res.send('user created')
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Server error, please try again later' });
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
    console.error("Error updating user role:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createUser, 
  changeRole
};

