const admin = require("firebase-admin");

const verifyFirebaseToken = async (req, res, next, usersCollection) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith("Bearer ")) {
            return res.status(401).json({ message: "No token provided" });
        }

        const idToken = authHeader.split(" ")[1];

        // Verify Firebase ID token
        const decoded = await admin.auth().verifyIdToken(idToken);
        const email = decoded.email;

        // Find user in DB
        let user = await usersCollection.findOne({ email });

        // Auto-create if missing
        if (!user) {
            const newUser = {
                email,
                role: "user",
                name: decoded.name || "",
                photo: decoded.picture || "",
            };
            await usersCollection.insertOne(newUser);
            user = newUser;
        }

        req.user = user;
        next();
    } catch (err) {
        console.error("Firebase auth error:", err);
        res.status(403).json({ message: "Unauthorized" });
    }
};

module.exports = verifyFirebaseToken;
