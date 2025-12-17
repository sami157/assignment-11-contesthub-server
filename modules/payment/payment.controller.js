const stripe = require("../payment/stripe");

const createCheckoutSession = async (req, res) => {
    try {
        const { contestId, name, price } = req.body;

        if (!contestId || !price || !name) {
            return res.status(400).json({ message: "Missing data" });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: name,
                        },
                        unit_amount: Math.round(price * 100),
                    },
                    quantity: 1,
                },
            ],
            success_url: `${process.env.CLIENT_URL}/payment-success?contestId=${contestId}`,
            cancel_url: `${process.env.CLIENT_URL}/payment-cancel`,
        });

        res.status(200).json({ url: session.url });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createCheckoutSession };