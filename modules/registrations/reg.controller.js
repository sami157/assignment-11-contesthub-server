
const { registrationsCollection } = require("../../config/connectMongoDB");

const checkRegistration = async (req, res) => {
    const contestId = req.params.contestId;
    const userEmail = req.user.email;

    const registration = await registrationsCollection.findOne({
        contestId,
        userEmail,
    });

    res.json({ registered: !!registration });
};

module.exports = { checkRegistration };
