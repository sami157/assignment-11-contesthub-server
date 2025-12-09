const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { MongoClient, ServerApiVersion } = require('mongodb');

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;


app.use(cors()); 
app.use(express.json());



const uri = `${process.env.MONGODB_URI}`


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    console.log('connected to MongoDB')
  } catch(error){
    console.log(error)
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Welcome to ContestHub API!');
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
