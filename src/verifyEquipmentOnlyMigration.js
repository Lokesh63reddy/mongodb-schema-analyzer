/**
 * Script to verify equipment table migration from MongoDB to PostgreSQL
 * This script only verifies the equipment table
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

// Main function to verify equipment migration
async function verifyEquipmentOnlyMigration() {
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
    
    // Get equipment collection
    const equipmentCollection = db.collection('equipment');
    
    // Count equipment in MongoDB
    const mongoCount = await equipmentCollection.countDocuments();
    console.log(`Found ${mongoCount} equipment items in MongoDB`);
    
    // Count equipment in PostgreSQL
    const pgResult = await pgClient.query('SELECT COUNT(*) FROM equipment');
    const pgCount = parseInt(pgResult.rows[0].count);
    console.log(`Found ${pgCount} equipment items in PostgreSQL`);
    
    // Compare counts
    if (mongoCount === pgCount) {
      console.log('✅ Equipment counts match!');
    } else {
      console.log(`❌ Equipment counts don't match: MongoDB (${mongoCount}) vs PostgreSQL (${pgCount})`);
    }
    
    // Sample a few equipment items to verify data integrity
    console.log('\nVerifying sample equipment items:');
    const sampleEquipment = await equipmentCollection.find().limit(5).toArray();
    
    for (const mongoEquipment of sampleEquipment) {
      const mongoId = mongoEquipment._id.toString();
      const pgResult = await pgClient.query('SELECT * FROM equipment WHERE id = $1', [mongoId]);
      
      if (pgResult.rows.length === 0) {
        console.log(`❌ Equipment ${mongoId} not found in PostgreSQL`);
        continue;
      }
      
      const pgEquipment = pgResult.rows[0];
      
      // Compare key fields
      console.log(`\nComparing equipment ${mongoId}:`);
      
      // Type ID
      const mongoTypeId = mongoEquipment.type ? mongoEquipment.type.toString() : null;
      if (mongoTypeId === pgEquipment.type_id) {
        console.log(`✅ Type ID matches: ${pgEquipment.type_id}`);
      } else {
        console.log(`❌ Type ID mismatch: MongoDB (${mongoTypeId}) vs PostgreSQL (${pgEquipment.type_id})`);
        console.log('   Note: This could be due to the type not existing in PostgreSQL.');
      }
      
      // Location ID
      const mongoLocationId = mongoEquipment.location ? mongoEquipment.location.toString() : null;
      if (mongoLocationId === pgEquipment.location_id) {
        console.log(`✅ Location ID matches: ${pgEquipment.location_id}`);
      } else {
        console.log(`❌ Location ID mismatch: MongoDB (${mongoLocationId}) vs PostgreSQL (${pgEquipment.location_id})`);
        console.log('   Note: This could be due to the location not existing in PostgreSQL.');
      }
      
      // Completion
      const mongoCompletion = mongoEquipment.completion !== undefined ? mongoEquipment.completion : null;
      // PostgreSQL might return a string or a number, so convert to string for comparison
      const pgCompletionStr = pgEquipment.completion !== null ? pgEquipment.completion.toString() : null;
      const mongoCompletionStr = mongoCompletion !== null ? mongoCompletion.toString() : null;
      
      if (mongoCompletionStr === pgCompletionStr) {
        console.log(`✅ Completion matches: ${pgEquipment.completion}`);
      } else {
        console.log(`❌ Completion mismatch: MongoDB (${mongoCompletion}) vs PostgreSQL (${pgEquipment.completion})`);
      }
      
      // Archived
      const mongoArchived = mongoEquipment.archived || false;
      if (mongoArchived === pgEquipment.archived) {
        console.log(`✅ Archived matches: ${pgEquipment.archived}`);
      } else {
        console.log(`❌ Archived mismatch: MongoDB (${mongoArchived}) vs PostgreSQL (${pgEquipment.archived})`);
      }
      
      // Design
      if (mongoEquipment.design && mongoEquipment.design.length > 0) {
        const mongoDesign = JSON.stringify(mongoEquipment.design);
        // For design, we need to compare the parsed JSON values since PostgreSQL might format it differently
        const pgDesign = pgEquipment.design ? pgEquipment.design : null;
        
        if (pgDesign === null) {
          console.log(`❌ Design mismatch: MongoDB has design but PostgreSQL has null`);
        } else {
          try {
            const mongoObj = JSON.parse(mongoDesign);
            const pgObj = JSON.parse(pgDesign);
            
            if (JSON.stringify(mongoObj) === JSON.stringify(pgObj)) {
              console.log(`✅ Design matches`);
            } else {
              console.log(`❌ Design mismatch: MongoDB and PostgreSQL have different design data`);
            }
          } catch (error) {
            console.log(`❌ Error comparing design: ${error.message}`);
          }
        }
      } else if (pgEquipment.design === null) {
        console.log(`✅ Design matches: both are null or empty`);
      } else {
        console.log(`❌ Design mismatch: MongoDB is null/empty but PostgreSQL has design data`);
      }
      
      // Info
      if (mongoEquipment.info && mongoEquipment.info.length > 0) {
        const mongoInfo = JSON.stringify(mongoEquipment.info);
        // For info, we need to compare the parsed JSON values since PostgreSQL might format it differently
        const pgInfo = pgEquipment.info ? pgEquipment.info : null;
        
        if (pgInfo === null) {
          console.log(`❌ Info mismatch: MongoDB has info but PostgreSQL has null`);
        } else {
          try {
            const mongoObj = JSON.parse(mongoInfo);
            const pgObj = JSON.parse(pgInfo);
            
            if (JSON.stringify(mongoObj) === JSON.stringify(pgObj)) {
              console.log(`✅ Info matches`);
            } else {
              console.log(`❌ Info mismatch: MongoDB and PostgreSQL have different info data`);
            }
          } catch (error) {
            console.log(`❌ Error comparing info: ${error.message}`);
          }
        }
      } else if (pgEquipment.info === null) {
        console.log(`✅ Info matches: both are null or empty`);
      } else {
        console.log(`❌ Info mismatch: MongoDB is null/empty but PostgreSQL has info data`);
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
verifyEquipmentOnlyMigration()
  .then(() => console.log('Equipment verification script completed'))
  .catch(err => console.error('Equipment verification script failed:', err));
