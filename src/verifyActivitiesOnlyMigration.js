/**
 * Script to verify activities table migration from MongoDB to PostgreSQL
 * This script only verifies the activities table
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

// Main function to verify activities migration
async function verifyActivitiesOnlyMigration() {
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
    
    // Get activities collection
    const activitiesCollection = db.collection('activities');
    
    // Count activities in MongoDB
    const mongoCount = await activitiesCollection.countDocuments();
    console.log(`Found ${mongoCount} activities in MongoDB`);
    
    // Count activities in PostgreSQL
    const pgResult = await pgClient.query('SELECT COUNT(*) FROM activities');
    const pgCount = parseInt(pgResult.rows[0].count);
    console.log(`Found ${pgCount} activities in PostgreSQL`);
    
    // Compare counts
    if (mongoCount === pgCount) {
      console.log('✅ Activity counts match!');
    } else {
      console.log(`❌ Activity counts don't match: MongoDB (${mongoCount}) vs PostgreSQL (${pgCount})`);
    }
    
    // Sample a few activities to verify data integrity
    console.log('\nVerifying sample activities:');
    const sampleActivities = await activitiesCollection.find().limit(5).toArray();
    
    for (const mongoActivity of sampleActivities) {
      const mongoId = mongoActivity._id.toString();
      const pgResult = await pgClient.query('SELECT * FROM activities WHERE id = $1', [mongoId]);
      
      if (pgResult.rows.length === 0) {
        console.log(`❌ Activity ${mongoId} not found in PostgreSQL`);
        continue;
      }
      
      const pgActivity = pgResult.rows[0];
      
      // Compare key fields
      console.log(`\nComparing activity ${mongoId}:`);
      
      // User ID
      const mongoUserId = mongoActivity.by ? mongoActivity.by.toString() : null;
      if (mongoUserId === pgActivity.user_id) {
        console.log(`✅ User ID matches: ${pgActivity.user_id}`);
      } else {
        console.log(`❌ User ID mismatch: MongoDB (${mongoUserId}) vs PostgreSQL (${pgActivity.user_id})`);
        console.log('   Note: This could be due to the user not existing in PostgreSQL.');
      }
      
      // Type
      const mongoType = mongoActivity.activity || null;
      if (mongoType === pgActivity.type) {
        console.log(`✅ Type matches: ${pgActivity.type}`);
      } else {
        console.log(`❌ Type mismatch: MongoDB (${mongoType}) vs PostgreSQL (${pgActivity.type})`);
      }
      
      // Description
      const mongoDescription = mongoActivity.resource ? 
        (mongoActivity.resourceId ? `${mongoActivity.resource} ${mongoActivity.resourceId}` : mongoActivity.resource) : 
        null;
      
      if (mongoDescription === pgActivity.description) {
        console.log(`✅ Description matches: ${pgActivity.description}`);
      } else {
        console.log(`❌ Description mismatch: MongoDB (${mongoDescription}) vs PostgreSQL (${pgActivity.description})`);
      }
      
      // Metadata
      if (pgActivity.metadata) {
        try {
          const pgMetadata = JSON.parse(pgActivity.metadata);
          
          // Check resource
          if (mongoActivity.resource === pgMetadata.resource) {
            console.log(`✅ Resource in metadata matches: ${pgMetadata.resource}`);
          } else {
            console.log(`❌ Resource in metadata mismatch: MongoDB (${mongoActivity.resource}) vs PostgreSQL (${pgMetadata.resource})`);
          }
          
          // Check resourceId
          if (mongoActivity.resourceId === pgMetadata.resourceId) {
            console.log(`✅ ResourceId in metadata matches: ${pgMetadata.resourceId}`);
          } else {
            console.log(`❌ ResourceId in metadata mismatch: MongoDB (${mongoActivity.resourceId}) vs PostgreSQL (${pgMetadata.resourceId})`);
          }
          
          // Check ts array length
          const mongoTsLength = mongoActivity.ts ? mongoActivity.ts.length : 0;
          const pgTsLength = pgMetadata.ts ? pgMetadata.ts.length : 0;
          
          if (mongoTsLength === pgTsLength) {
            console.log(`✅ TS array length matches: ${pgTsLength}`);
          } else {
            console.log(`❌ TS array length mismatch: MongoDB (${mongoTsLength}) vs PostgreSQL (${pgTsLength})`);
          }
          
        } catch (error) {
          console.log(`❌ Error parsing metadata JSON: ${error.message}`);
        }
      } else {
        console.log(`❌ Metadata is null in PostgreSQL`);
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
verifyActivitiesOnlyMigration()
  .then(() => console.log('Activities verification script completed'))
  .catch(err => console.error('Activities verification script failed:', err));
