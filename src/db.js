const { MongoClient } = require('mongodb');
const config = require('./config');

let client = null;

async function connectToDatabase() {
  if (client) return client;
  
  try {
    client = new MongoClient(config.mongodbUri);
    await client.connect();
    console.log('Connected to MongoDB');
    return client;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
}

async function getDatabase() {
  const client = await connectToDatabase();
  return client.db(config.databaseName);
}

async function closeConnection() {
  if (client) {
    await client.close();
    client = null;
    console.log('MongoDB connection closed');
  }
}

module.exports = {
  connectToDatabase,
  getDatabase,
  closeConnection
};
