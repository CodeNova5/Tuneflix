const mongoose = require('mongoose');
require("dotenv").config();
const MONGO_URI = process.env.MONGO_URI;

if (!global._mongoClientPromise) {
    global._mongoClientPromise = mongoose.connect(MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }).then(() => console.log('MongoDB connected'))
      .catch(err => console.error(err));
}

module.exports = global._mongoClientPromise;
