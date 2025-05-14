/**
 * Script to verify users migration from MongoDB to PostgreSQL
 */

const { MongoClient } = require('mongodb');
const { Client } = require('pg');
require('dotenv').config();

// Configuration
const mongoUri = process.env.MONGODB_URI;
const dbName = process.env.DATABASE_NAME;

// PostgreSQL configuration
const pgConfig = {
  host: process.env.PG_HOST || 'localhost',
  port: process.env.PG_PORT || 5432,
  database: process.env.PG_DATABASE,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD
};

// Main function to verify users migration
async function verifyUsersMigration() {
  const mongoClient = new MongoClient(mongoUri);
  const pgClient = new Client(pgConfig);
  
  try {
    // Connect to MongoDB
    await mongoClient.connect();
    console.log('Connected to MongoDB');
    
    // Connect to PostgreSQL
    await pgClient.connect();
    console.log('Connected to PostgreSQL');
    
    // Get MongoDB database
    const db = mongoClient.db(dbName);
    
    // Get users collection
    const usersCollection = db.collection('users');
    
    // Count users in MongoDB
    const mongoCount = await usersCollection.countDocuments();
    console.log(`Found ${mongoCount} users in MongoDB`);
    
    // Count users in PostgreSQL
    const pgResult = await pgClient.query('SELECT COUNT(*) FROM users');
    const pgCount = parseInt(pgResult.rows[0].count);
    console.log(`Found ${pgCount} users in PostgreSQL`);
    
    // Compare counts
    if (mongoCount === pgCount) {
      console.log('✅ User counts match!');
    } else {
      console.log(`❌ User counts don't match: MongoDB (${mongoCount}) vs PostgreSQL (${pgCount})`);
    }
    
    // Sample a few users to verify data integrity
    console.log('\nVerifying sample users:');
    const sampleUsers = await usersCollection.find().limit(5).toArray();
    
    for (const mongoUser of sampleUsers) {
      const mongoId = mongoUser._id.toString();
      const pgResult = await pgClient.query('SELECT * FROM users WHERE id = $1', [mongoId]);
      
      if (pgResult.rows.length === 0) {
        console.log(`❌ User ${mongoId} not found in PostgreSQL`);
        continue;
      }
      
      const pgUser = pgResult.rows[0];
      
      // Compare key fields
      console.log(`\nComparing user ${mongoId}:`);
      
      // Email
      if (mongoUser.email === pgUser.email) {
        console.log(`✅ Email matches: ${pgUser.email}`);
      } else {
        console.log(`❌ Email mismatch: MongoDB (${mongoUser.email}) vs PostgreSQL (${pgUser.email})`);
      }
      
      // Name
      if (mongoUser.name === pgUser.name) {
        console.log(`✅ Name matches: ${pgUser.name}`);
      } else {
        console.log(`❌ Name mismatch: MongoDB (${mongoUser.name}) vs PostgreSQL (${pgUser.name})`);
      }
      
      // Group ID
      const mongoGroupId = mongoUser.group ? mongoUser.group.toString() : null;
      if (mongoGroupId === pgUser.group_id) {
        console.log(`✅ Group ID matches: ${pgUser.group_id}`);
      } else {
        console.log(`❌ Group ID mismatch: MongoDB (${mongoGroupId}) vs PostgreSQL (${pgUser.group_id})`);
      }
    }
    
    console.log('\nVerification complete!');
    
  } catch (error) {
    console.error('Verification failed:', error);
  } finally {
    // Close connections
    await mongoClient.close();
    await pgClient.end();
  }
}

// Run the verification
verifyUsersMigration()
  .then(() => console.log('Users verification script completed'))
  .catch(err => console.error('Users verification script failed:', err));
