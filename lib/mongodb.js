const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

if (!global._mongoClientPromise) {
    global._mongoClientPromise = mongoose.connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }).then(() => console.log('MongoDB connected'))
      .catch(err => console.error(err));
}

module.exports = global._mongoClientPromise;
