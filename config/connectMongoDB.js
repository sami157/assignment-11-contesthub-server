const dotenv = require('dotenv');
const { MongoClient, ServerApiVersion } = require('mongodb');

dotenv.config();
const uri = `${process.env.MONGODB_URI}`
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

const connectMongoDB = () => {
    async function run() {
        try {
            await client.connect();
            console.log('connected to MongoDB')
        } finally {
            const db = client.db('zap_shift_db');
            const usersCollection = db.collection('users');
        }
    }
    run().catch(console.dir);
}

module.exports = {
    connectMongoDB,
    db,
    usersCollection
}


