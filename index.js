const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const userRoutes = require('./modules/users/users.routes');
const contestRoutes = require('./modules/contests/contests.routes');
const paymentRoutes = require('./modules/payment/payment.routes');
const registrationRoutes = require('./modules/registrations/reg.routes')
const { connectMongoDB } = require('./config/connectMongoDB');

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;
connectMongoDB()

app.use(cors()); 
app.use(express.json());

app.use('/users', userRoutes);
app.use('/contests', contestRoutes);
app.use("/payments", paymentRoutes);
app.use("/registrations", registrationRoutes);


app.get('/', (req, res) => {
  res.send('Welcome to ContestHub API!');
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
