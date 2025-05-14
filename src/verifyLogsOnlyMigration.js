/**
 * Script to verify logs table migration from MongoDB to PostgreSQL
 * This script verifies logs migrated from both logs and audits collections
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

// Main function to verify logs migration
async function verifyLogsOnlyMigration() {
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
    
    // Count logs in MongoDB (from both logs and audits collections)
    const logsCount = await db.collection('logs').countDocuments();
    const auditsCount = await db.collection('audits').countDocuments();
    const totalMongoCount = logsCount + auditsCount;
    console.log(`Found ${logsCount} logs in MongoDB logs collection`);
    console.log(`Found ${auditsCount} logs in MongoDB audits collection`);
    console.log(`Total: ${totalMongoCount} logs in MongoDB`);
    
    // Count logs in PostgreSQL
    const pgResult = await pgClient.query('SELECT COUNT(*) FROM logs');
    const pgCount = parseInt(pgResult.rows[0].count);
    console.log(`Found ${pgCount} logs in PostgreSQL`);
    
    // Compare counts
    if (pgCount > 0) {
      console.log('✅ Logs were successfully migrated to PostgreSQL');
      
      // Check if all logs were migrated
      if (pgCount >= totalMongoCount) {
        console.log('✅ All logs from MongoDB were migrated to PostgreSQL');
      } else {
        console.log(`⚠️ Only ${pgCount} out of ${totalMongoCount} logs were migrated to PostgreSQL`);
        console.log('   This could be due to duplicate IDs or other issues');
      }
    } else {
      console.log('❌ No logs were migrated to PostgreSQL');
    }
    
    // Verify logs from logs collection
    console.log('\nVerifying sample logs from logs collection:');
    await verifySampleLogsFromCollection(db, pgClient, 'logs', 3);
    
    // Verify logs from audits collection
    console.log('\nVerifying sample logs from audits collection:');
    await verifySampleLogsFromCollection(db, pgClient, 'audits', 3);
    
    // Check user references
    console.log('\nChecking user references:');
    const userLogs = await pgClient.query(`
      SELECT user_id, COUNT(*) 
      FROM logs 
      WHERE user_id IS NOT NULL 
      GROUP BY user_id 
      LIMIT 5
    `);
    
    for (const row of userLogs.rows) {
      const userId = row.user_id;
      const count = parseInt(row.count);
      
      // Check if user exists in PostgreSQL
      const userExists = await checkRecordExists(pgClient, 'users', userId);
      if (userExists) {
        console.log(`✅ User ${userId} exists in PostgreSQL with ${count} logs`);
      } else {
        console.log(`❌ User ${userId} does not exist in PostgreSQL but has ${count} logs`);
      }
    }
    
    // Check entity types
    console.log('\nChecking entity types:');
    const entityTypes = await pgClient.query(`
      SELECT entity_type, COUNT(*) 
      FROM logs 
      GROUP BY entity_type 
      ORDER BY COUNT(*) DESC 
      LIMIT 5
    `);
    
    console.log('Top 5 entity types in logs:');
    for (const row of entityTypes.rows) {
      console.log(`- ${row.entity_type}: ${row.count} logs`);
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

// Function to verify sample logs from a collection
async function verifySampleLogsFromCollection(db, pgClient, collectionName, sampleSize) {
  const collection = db.collection(collectionName);
  const sampleDocs = await collection.find().limit(sampleSize).toArray();
  
  for (const doc of sampleDocs) {
    const id = doc._id.toString();
    console.log(`\nChecking ${collectionName} document with ID ${id}:`);
    
    // Check if log exists in PostgreSQL
    const pgResult = await pgClient.query('SELECT * FROM logs WHERE id = $1', [id]);
    
    if (pgResult.rows.length > 0) {
      console.log(`✅ Log ${id} found in PostgreSQL`);
      
      const pgLog = pgResult.rows[0];
      
      // Check user_id
      let mongoUserId = null;
      if (collectionName === 'logs' && doc.technician && doc.technician._id) {
        mongoUserId = doc.technician._id.toString();
      } else if (collectionName === 'audits' && doc.user) {
        mongoUserId = doc.user.toString();
      }
      
      if (mongoUserId === pgLog.user_id) {
        console.log(`✅ User ID matches: ${pgLog.user_id}`);
      } else if (pgLog.user_id === null && mongoUserId !== null) {
        console.log(`⚠️ User ID in PostgreSQL is NULL, but in MongoDB it's ${mongoUserId}`);
        console.log('   This could be because the user does not exist in PostgreSQL');
      } else {
        console.log(`❌ User ID mismatch: MongoDB (${mongoUserId}) vs PostgreSQL (${pgLog.user_id})`);
      }
      
      // Check action
      let mongoAction = null;
      if (collectionName === 'logs') {
        mongoAction = doc.action || 'LOG';
      } else if (collectionName === 'audits') {
        mongoAction = doc.action || 'AUDIT';
      }
      
      if (mongoAction === pgLog.action) {
        console.log(`✅ Action matches: ${pgLog.action}`);
      } else {
        console.log(`❌ Action mismatch: MongoDB (${mongoAction}) vs PostgreSQL (${pgLog.action})`);
      }
      
      // Check entity_type
      let mongoEntityType = null;
      if (collectionName === 'logs') {
        mongoEntityType = 'equipment';
      } else if (collectionName === 'audits') {
        mongoEntityType = doc.resource || 'system';
      }
      
      if (mongoEntityType === pgLog.entity_type) {
        console.log(`✅ Entity type matches: ${pgLog.entity_type}`);
      } else {
        console.log(`❌ Entity type mismatch: MongoDB (${mongoEntityType}) vs PostgreSQL (${pgLog.entity_type})`);
      }
      
      // Check entity_id
      let mongoEntityId = null;
      if (collectionName === 'logs' && doc.equipment) {
        mongoEntityId = doc.equipment.toString();
      } else if (collectionName === 'audits' && doc.resourceID && doc.resourceID !== 'none') {
        mongoEntityId = doc.resourceID;
      }
      
      if (mongoEntityId === pgLog.entity_id) {
        console.log(`✅ Entity ID matches: ${pgLog.entity_id}`);
      } else if (pgLog.entity_id === null && mongoEntityId === null) {
        console.log(`✅ Entity ID matches: both are NULL`);
      } else {
        console.log(`❌ Entity ID mismatch: MongoDB (${mongoEntityId}) vs PostgreSQL (${pgLog.entity_id})`);
      }
      
      // Check details
      if (pgLog.details) {
        console.log(`✅ Details field is present in PostgreSQL`);
        
        try {
          const details = JSON.parse(pgLog.details);
          console.log(`✅ Details field is valid JSON`);
          
          // Print a few keys from the details object
          const keys = Object.keys(details).slice(0, 3);
          console.log(`   Sample keys in details: ${keys.join(', ')}${keys.length < Object.keys(details).length ? '...' : ''}`);
        } catch (error) {
          console.log(`❌ Details field is not valid JSON: ${error.message}`);
        }
      } else {
        console.log(`❌ Details field is missing in PostgreSQL`);
      }
      
    } else {
      console.log(`❌ Log ${id} not found in PostgreSQL`);
    }
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
verifyLogsOnlyMigration()
  .then(() => console.log('Logs verification script completed'))
  .catch(err => console.error('Logs verification script failed:', err));
