/**
 * Script to verify groups table migration from MongoDB to PostgreSQL
 * This script only verifies the groups table, not group_permissions
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

// Main function to verify groups migration
async function verifyGroupsOnlyMigration() {
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
    
    // Get groups collection
    const groupsCollection = db.collection('groups');
    
    // Count groups in MongoDB
    const mongoCount = await groupsCollection.countDocuments();
    console.log(`Found ${mongoCount} groups in MongoDB`);
    
    // Count groups in PostgreSQL
    const pgResult = await pgClient.query('SELECT COUNT(*) FROM groups');
    const pgCount = parseInt(pgResult.rows[0].count);
    console.log(`Found ${pgCount} groups in PostgreSQL`);
    
    // Compare counts
    if (mongoCount === pgCount) {
      console.log('✅ Group counts match!');
    } else {
      console.log(`❌ Group counts don't match: MongoDB (${mongoCount}) vs PostgreSQL (${pgCount})`);
    }
    
    // Sample a few groups to verify data integrity
    console.log('\nVerifying sample groups:');
    const sampleGroups = await groupsCollection.find().limit(5).toArray();
    
    for (const mongoGroup of sampleGroups) {
      const mongoId = mongoGroup._id.toString();
      const pgResult = await pgClient.query('SELECT * FROM groups WHERE id = $1', [mongoId]);
      
      if (pgResult.rows.length === 0) {
        console.log(`❌ Group ${mongoId} not found in PostgreSQL`);
        continue;
      }
      
      const pgGroup = pgResult.rows[0];
      
      // Compare key fields
      console.log(`\nComparing group ${mongoId}:`);
      
      // Name
      if (mongoGroup.name === pgGroup.name) {
        console.log(`✅ Name matches: ${pgGroup.name}`);
      } else {
        console.log(`❌ Name mismatch: MongoDB (${mongoGroup.name}) vs PostgreSQL (${pgGroup.name})`);
      }
      
      // Archived
      const mongoArchived = mongoGroup.archived || false;
      if (mongoArchived === pgGroup.archived) {
        console.log(`✅ Archived matches: ${pgGroup.archived}`);
      } else {
        console.log(`❌ Archived mismatch: MongoDB (${mongoArchived}) vs PostgreSQL (${pgGroup.archived})`);
      }
      
      // Order
      const mongoOrder = mongoGroup.order !== undefined ? mongoGroup.order : null;
      if (mongoOrder === pgGroup.order_num) {
        console.log(`✅ Order matches: ${pgGroup.order_num}`);
      } else {
        console.log(`❌ Order mismatch: MongoDB (${mongoOrder}) vs PostgreSQL (${pgGroup.order_num})`);
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
verifyGroupsOnlyMigration()
  .then(() => console.log('Groups verification script completed'))
  .catch(err => console.error('Groups verification script failed:', err));
