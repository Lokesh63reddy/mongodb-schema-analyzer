/**
 * Script to verify equipment_types table migration from MongoDB to PostgreSQL
 * This script only verifies the equipment_types table
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

// Main function to verify equipment_types migration
async function verifyEquipmentTypesOnlyMigration() {
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
    
    // Get equipment_types collection
    const equipmentTypesCollection = db.collection('equipment_types');
    
    // Count equipment_types in MongoDB
    const mongoCount = await equipmentTypesCollection.countDocuments();
    console.log(`Found ${mongoCount} equipment types in MongoDB`);
    
    // Count equipment_types in PostgreSQL
    const pgResult = await pgClient.query('SELECT COUNT(*) FROM equipment_types');
    const pgCount = parseInt(pgResult.rows[0].count);
    console.log(`Found ${pgCount} equipment types in PostgreSQL`);
    
    // Compare counts
    if (mongoCount === pgCount) {
      console.log('✅ Equipment types counts match!');
    } else {
      console.log(`❌ Equipment types counts don't match: MongoDB (${mongoCount}) vs PostgreSQL (${pgCount})`);
    }
    
    // Sample a few equipment_types to verify data integrity
    console.log('\nVerifying sample equipment types:');
    const sampleEquipmentTypes = await equipmentTypesCollection.find().limit(5).toArray();
    
    for (const mongoEquipmentType of sampleEquipmentTypes) {
      const mongoId = mongoEquipmentType._id.toString();
      const pgResult = await pgClient.query('SELECT * FROM equipment_types WHERE id = $1', [mongoId]);
      
      if (pgResult.rows.length === 0) {
        console.log(`❌ Equipment type ${mongoId} not found in PostgreSQL`);
        continue;
      }
      
      const pgEquipmentType = pgResult.rows[0];
      
      // Compare key fields
      console.log(`\nComparing equipment type ${mongoId}:`);
      
      // Name
      const mongoName = mongoEquipmentType.name || '';
      if (mongoName === pgEquipmentType.name) {
        console.log(`✅ Name matches: ${pgEquipmentType.name}`);
      } else {
        console.log(`❌ Name mismatch: MongoDB (${mongoName}) vs PostgreSQL (${pgEquipmentType.name})`);
      }
      
      // Description
      const mongoDescription = mongoEquipmentType.description || null;
      if (mongoDescription === pgEquipmentType.description) {
        console.log(`✅ Description matches: ${pgEquipmentType.description}`);
      } else {
        console.log(`❌ Description mismatch: MongoDB (${mongoDescription}) vs PostgreSQL (${pgEquipmentType.description})`);
      }
      
      // Archived
      const mongoArchived = mongoEquipmentType.archived || false;
      if (mongoArchived === pgEquipmentType.archived) {
        console.log(`✅ Archived matches: ${pgEquipmentType.archived}`);
      } else {
        console.log(`❌ Archived mismatch: MongoDB (${mongoArchived}) vs PostgreSQL (${pgEquipmentType.archived})`);
      }
    }
    
    // Check if any equipment references these types
    console.log('\nChecking equipment references:');
    for (const mongoEquipmentType of sampleEquipmentTypes) {
      const mongoId = mongoEquipmentType._id.toString();
      
      // Count equipment with this type in PostgreSQL
      const pgEquipmentResult = await pgClient.query(
        'SELECT COUNT(*) FROM equipment WHERE type_id = $1', 
        [mongoId]
      );
      const pgEquipmentCount = parseInt(pgEquipmentResult.rows[0].count);
      
      // Count equipment with this type in MongoDB
      const mongoEquipmentCount = await db.collection('equipment').countDocuments({ type: mongoEquipmentType._id });
      
      console.log(`Equipment type ${mongoId} (${mongoEquipmentType.name || 'unnamed'}):`);
      console.log(`MongoDB: ${mongoEquipmentCount} equipment, PostgreSQL: ${pgEquipmentCount} equipment`);
      
      if (mongoEquipmentCount === pgEquipmentCount) {
        console.log(`✅ Equipment reference counts match!`);
      } else {
        console.log(`❌ Equipment reference counts don't match`);
        console.log('   Note: This could be due to equipment not being migrated yet.');
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
verifyEquipmentTypesOnlyMigration()
  .then(() => console.log('Equipment types verification script completed'))
  .catch(err => console.error('Equipment types verification script failed:', err));
