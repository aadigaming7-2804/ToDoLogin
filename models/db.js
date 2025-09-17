require('dotenv').config();
const mongoose = require('mongoose');

const atlasConnectionString = process.env.MONGO_URI;

mongoose.connect(atlasConnectionString)
  .then(() => console.log('MongoDB Atlas connected'))
  .catch(err => console.log('MongoDB Atlas connection error:', err));

module.exports = mongoose;
