const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const userRouter = require('./routes/userRouter');

const app = express();

// middleware
app.use(express.json());
app.use(cors());

// start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// set up mongoose
mongoose.connect(
  process.env.MONGODB_CONN_STRING,
  {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (err) => {
    if (err) throw err;
    console.log('MongoDB Connected!!!');
  }
);

// set up routes
app.use('/users', userRouter);
