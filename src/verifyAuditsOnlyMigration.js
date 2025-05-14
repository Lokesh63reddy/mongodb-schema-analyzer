/**
 * Script to verify audits table migration from MongoDB to PostgreSQL
 * This script only verifies the audits table
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

// Main function to verify audits migration
async function verifyAuditsOnlyMigration() {
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
    
    // Get audits collection
    const auditsCollection = db.collection('audits');
    
    // Count audits in MongoDB
    const mongoCount = await auditsCollection.countDocuments();
    console.log(`Found ${mongoCount} audits in MongoDB`);
    
    // Count audits in PostgreSQL
    const pgResult = await pgClient.query('SELECT COUNT(*) FROM audits');
    const pgCount = parseInt(pgResult.rows[0].count);
    console.log(`Found ${pgCount} audits in PostgreSQL`);
    
    // Compare counts
    if (mongoCount === pgCount) {
      console.log('✅ Audit counts match!');
    } else {
      console.log(`❌ Audit counts don't match: MongoDB (${mongoCount}) vs PostgreSQL (${pgCount})`);
    }
    
    // Sample a few audits to verify data integrity
    console.log('\nVerifying sample audits:');
    const sampleAudits = await auditsCollection.find().limit(5).toArray();
    
    for (const mongoAudit of sampleAudits) {
      const mongoId = mongoAudit._id.toString();
      const pgResult = await pgClient.query('SELECT * FROM audits WHERE id = $1', [mongoId]);
      
      if (pgResult.rows.length === 0) {
        console.log(`❌ Audit ${mongoId} not found in PostgreSQL`);
        continue;
      }
      
      const pgAudit = pgResult.rows[0];
      
      // Compare key fields
      console.log(`\nComparing audit ${mongoId}:`);
      
      // Equipment ID
      const mongoEquipmentId = mongoAudit.equipment ? mongoAudit.equipment.toString() : null;
      if (mongoEquipmentId === pgAudit.equipment_id) {
        console.log(`✅ Equipment ID matches: ${pgAudit.equipment_id}`);
      } else {
        console.log(`❌ Equipment ID mismatch: MongoDB (${mongoEquipmentId}) vs PostgreSQL (${pgAudit.equipment_id})`);
        console.log('   Note: This could be due to the equipment not existing in PostgreSQL.');
      }
      
      // User ID
      const mongoUserId = mongoAudit.user ? mongoAudit.user.toString() : null;
      if (mongoUserId === pgAudit.user_id) {
        console.log(`✅ User ID matches: ${pgAudit.user_id}`);
      } else {
        console.log(`❌ User ID mismatch: MongoDB (${mongoUserId}) vs PostgreSQL (${pgAudit.user_id})`);
        console.log('   Note: This could be due to the user not existing in PostgreSQL.');
      }
      
      // Data
      if (pgAudit.data) {
        try {
          const pgData = JSON.parse(pgAudit.data);
          
          // Check action
          if (mongoAudit.action === pgData.action) {
            console.log(`✅ Action matches: ${pgData.action}`);
          } else {
            console.log(`❌ Action mismatch: MongoDB (${mongoAudit.action}) vs PostgreSQL (${pgData.action})`);
          }
          
          // Check description
          if (mongoAudit.description === pgData.description) {
            console.log(`✅ Description matches: ${pgData.description}`);
          } else {
            console.log(`❌ Description mismatch: MongoDB (${mongoAudit.description}) vs PostgreSQL (${pgData.description})`);
          }
          
          // Check resource
          if (mongoAudit.resource === pgData.resource) {
            console.log(`✅ Resource matches: ${pgData.resource}`);
          } else {
            console.log(`❌ Resource mismatch: MongoDB (${mongoAudit.resource}) vs PostgreSQL (${pgData.resource})`);
          }
          
          // Check resourceID
          if (mongoAudit.resourceID === pgData.resourceID) {
            console.log(`✅ Resource ID matches: ${pgData.resourceID}`);
          } else {
            console.log(`❌ Resource ID mismatch: MongoDB (${mongoAudit.resourceID}) vs PostgreSQL (${pgData.resourceID})`);
          }
          
          // Check level
          if (mongoAudit.level === pgData.level) {
            console.log(`✅ Level matches: ${pgData.level}`);
          } else {
            console.log(`❌ Level mismatch: MongoDB (${mongoAudit.level}) vs PostgreSQL (${pgData.level})`);
          }
          
        } catch (error) {
          console.log(`❌ Error parsing data JSON: ${error.message}`);
        }
      } else {
        console.log(`❌ Data is null in PostgreSQL`);
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
verifyAuditsOnlyMigration()
  .then(() => console.log('Audits verification script completed'))
  .catch(err => console.error('Audits verification script failed:', err));
