const mongooseLib = require('mongoose');
mongooseLib.connect(process.env.MONGODB_URL);
