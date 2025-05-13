require('dotenv').config();

module.exports = {
  mongodbUri: process.env.MONGODB_URI,
  databaseName: process.env.DATABASE_NAME
};
