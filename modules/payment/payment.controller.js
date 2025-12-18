const { registrationsCollection } = require("../../config/connectMongoDB");
const stripe = require("../payment/stripe");

const createCheckoutSession = async (req, res) => {
    try {
        const { contestId, name, price } = req.body;

        if (!contestId || !price || !name) {
            return res.status(400).json({ message: "Missing data" });
        }

        const userEmail = req.user.email;

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name,
                        },
                        unit_amount: Math.round(price * 100),
                    },
                    quantity: 1,
                },
            ],
            metadata: {
                contestId,
                userEmail,
            },
            success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}`,
        });
        res.status(200).json({ url: session.url });
    } catch (error) {
        console.error("Stripe session error:", error);
        res.status(500).json({ message: error.message });
    }
};


const handlePaymentSuccess = async (req, res) => {
    try {
        const session_id = req.query.id;

        if (!session_id) {
            return res.status(400).json({ message: "Session ID missing" });
        }

        const session = await stripe.checkout.sessions.retrieve(session_id);

        if (session.payment_status !== "paid") {
            return res.status(400).json({ message: "Payment not completed" });
        }

        const contestId = session.metadata.contestId;
        const userEmail = session.metadata.userEmail;

        // prevent duplicate registration
        const alreadyRegistered = await registrationsCollection.findOne({
            contestId,
            userEmail,
        });

        if (alreadyRegistered) {
            return res.status(200).json({ message: "Already registered" });
        }

        await registrationsCollection.insertOne({
            contestId,
            userEmail,
            paidAt: new Date(),
        });

        await contestsCollection.updateOne(
            { _id: new ObjectId(contestId) },
            { $inc: { participantCount: 1 } }
        );

        res.status(200).json({ message: "Payment successful & registered" });

    } catch (error) {
        console.error("Payment success error:", error);
        res.status(500).json({ message: "Payment verification failed" });
    }
};

module.exports = { createCheckoutSession, handlePaymentSuccess };