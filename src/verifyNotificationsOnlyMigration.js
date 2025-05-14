/**
 * Script to verify notifications table migration from MongoDB to PostgreSQL
 * This script only verifies the notifications table
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

// Main function to verify notifications migration
async function verifyNotificationsOnlyMigration() {
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
    
    // Get notifications collection
    const notificationsCollection = db.collection('notifications');
    
    // Count notifications in MongoDB
    const mongoCount = await notificationsCollection.countDocuments();
    console.log(`Found ${mongoCount} notifications in MongoDB`);
    
    // Count notifications in PostgreSQL
    const pgResult = await pgClient.query('SELECT COUNT(*) FROM notifications');
    const pgCount = parseInt(pgResult.rows[0].count);
    console.log(`Found ${pgCount} notifications in PostgreSQL`);
    
    // Compare counts
    if (mongoCount === pgCount) {
      console.log('✅ Notification counts match!');
    } else {
      console.log(`❌ Notification counts don't match: MongoDB (${mongoCount}) vs PostgreSQL (${pgCount})`);
    }
    
    // Sample a few notifications to verify data integrity
    console.log('\nVerifying sample notifications:');
    const sampleNotifications = await notificationsCollection.find().limit(5).toArray();
    
    for (const mongoNotification of sampleNotifications) {
      const mongoId = mongoNotification._id.toString();
      const pgResult = await pgClient.query('SELECT * FROM notifications WHERE id = $1', [mongoId]);
      
      if (pgResult.rows.length === 0) {
        console.log(`❌ Notification ${mongoId} not found in PostgreSQL`);
        continue;
      }
      
      const pgNotification = pgResult.rows[0];
      
      // Compare key fields
      console.log(`\nComparing notification ${mongoId}:`);
      
      // User ID
      const mongoUserId = mongoNotification.user ? mongoNotification.user.toString() : null;
      if (mongoUserId === pgNotification.user_id) {
        console.log(`✅ User ID matches: ${pgNotification.user_id}`);
      } else {
        console.log(`❌ User ID mismatch: MongoDB (${mongoUserId}) vs PostgreSQL (${pgNotification.user_id})`);
        console.log('   Note: This could be due to the user not existing in PostgreSQL.');
      }
      
      // Read status
      const mongoRead = mongoNotification.read || false;
      if (mongoRead === pgNotification.read) {
        console.log(`✅ Read status matches: ${pgNotification.read}`);
      } else {
        console.log(`❌ Read status mismatch: MongoDB (${mongoRead}) vs PostgreSQL (${pgNotification.read})`);
      }
      
      // Metadata
      if (pgNotification.metadata) {
        try {
          const pgMetadata = JSON.parse(pgNotification.metadata);
          
          // Check activity reference
          const mongoActivity = mongoNotification.activity ? mongoNotification.activity.toString() : null;
          if (mongoActivity === pgMetadata.activity) {
            console.log(`✅ Activity reference in metadata matches: ${pgMetadata.activity}`);
          } else {
            console.log(`❌ Activity reference in metadata mismatch: MongoDB (${mongoActivity}) vs PostgreSQL (${pgMetadata.activity})`);
          }
          
          // Check archived status
          if (mongoNotification.archived === pgMetadata.archived) {
            console.log(`✅ Archived status in metadata matches: ${pgMetadata.archived}`);
          } else {
            console.log(`❌ Archived status in metadata mismatch: MongoDB (${mongoNotification.archived}) vs PostgreSQL (${pgMetadata.archived})`);
          }
          
        } catch (error) {
          console.log(`❌ Error parsing metadata JSON: ${error.message}`);
        }
      } else {
        console.log(`❌ Metadata is null in PostgreSQL`);
      }
    }
    
    // Check user references
    console.log('\nChecking user references:');
    const userNotifications = await pgClient.query(`
      SELECT user_id, COUNT(*) 
      FROM notifications 
      WHERE user_id IS NOT NULL 
      GROUP BY user_id 
      LIMIT 5
    `);
    
    for (const row of userNotifications.rows) {
      const userId = row.user_id;
      const count = parseInt(row.count);
      
      // Check if user exists in PostgreSQL
      const userExists = await checkRecordExists(pgClient, 'users', userId);
      if (userExists) {
        console.log(`✅ User ${userId} exists in PostgreSQL with ${count} notifications`);
      } else {
        console.log(`❌ User ${userId} does not exist in PostgreSQL but has ${count} notifications`);
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

// Helper function to check if a record exists in a table
async function checkRecordExists(pgClient, tableName, id) {
  const query = `
    SELECT EXISTS (
      SELECT FROM ${tableName} 
      WHERE id = $1
    )
  `;
  
  const result = await pgClient.query(query, [id]);
  return result.rows[0].exists;
}

// Run the verification
verifyNotificationsOnlyMigration()
  .then(() => console.log('Notifications verification script completed'))
  .catch(err => console.error('Notifications verification script failed:', err));
