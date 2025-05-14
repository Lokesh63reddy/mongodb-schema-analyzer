/**
 * Script to verify locations table migration from MongoDB to PostgreSQL
 * This script only verifies the locations table
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

// Main function to verify locations migration
async function verifyLocationsOnlyMigration() {
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
    
    // Get locations collection
    const locationsCollection = db.collection('locations');
    
    // Count locations in MongoDB
    const mongoCount = await locationsCollection.countDocuments();
    console.log(`Found ${mongoCount} locations in MongoDB`);
    
    // Count locations in PostgreSQL
    const pgResult = await pgClient.query('SELECT COUNT(*) FROM locations');
    const pgCount = parseInt(pgResult.rows[0].count);
    console.log(`Found ${pgCount} locations in PostgreSQL`);
    
    // Compare counts
    if (mongoCount === pgCount) {
      console.log('✅ Location counts match!');
    } else {
      console.log(`❌ Location counts don't match: MongoDB (${mongoCount}) vs PostgreSQL (${pgCount})`);
    }
    
    // Sample a few locations to verify data integrity
    console.log('\nVerifying sample locations:');
    const sampleLocations = await locationsCollection.find().limit(5).toArray();
    
    for (const mongoLocation of sampleLocations) {
      const mongoId = mongoLocation._id.toString();
      const pgResult = await pgClient.query('SELECT * FROM locations WHERE id = $1', [mongoId]);
      
      if (pgResult.rows.length === 0) {
        console.log(`❌ Location ${mongoId} not found in PostgreSQL`);
        continue;
      }
      
      const pgLocation = pgResult.rows[0];
      
      // Compare key fields
      console.log(`\nComparing location ${mongoId}:`);
      
      // Name
      const mongoName = mongoLocation.name || '';
      if (mongoName === pgLocation.name) {
        console.log(`✅ Name matches: ${pgLocation.name}`);
      } else {
        console.log(`❌ Name mismatch: MongoDB (${mongoName}) vs PostgreSQL (${pgLocation.name})`);
      }
      
      // Address
      const mongoAddress = mongoLocation.address || null;
      if (mongoAddress === pgLocation.address) {
        console.log(`✅ Address matches: ${pgLocation.address}`);
      } else {
        console.log(`❌ Address mismatch: MongoDB (${mongoAddress}) vs PostgreSQL (${pgLocation.address})`);
      }
      
      // City
      const mongoCity = mongoLocation.city || null;
      if (mongoCity === pgLocation.city) {
        console.log(`✅ City matches: ${pgLocation.city}`);
      } else {
        console.log(`❌ City mismatch: MongoDB (${mongoCity}) vs PostgreSQL (${pgLocation.city})`);
      }
      
      // State
      const mongoState = mongoLocation.state || null;
      if (mongoState === pgLocation.state) {
        console.log(`✅ State matches: ${pgLocation.state}`);
      } else {
        console.log(`❌ State mismatch: MongoDB (${mongoState}) vs PostgreSQL (${pgLocation.state})`);
      }
      
      // Zip
      const mongoZip = mongoLocation.zip || null;
      if (mongoZip === pgLocation.zip) {
        console.log(`✅ Zip matches: ${pgLocation.zip}`);
      } else {
        console.log(`❌ Zip mismatch: MongoDB (${mongoZip}) vs PostgreSQL (${pgLocation.zip})`);
      }
      
      // Customer ID
      const mongoCustomerId = mongoLocation.customer ? mongoLocation.customer.toString() : null;
      if (mongoCustomerId === pgLocation.customer_id) {
        console.log(`✅ Customer ID matches: ${pgLocation.customer_id}`);
      } else {
        console.log(`❌ Customer ID mismatch: MongoDB (${mongoCustomerId}) vs PostgreSQL (${pgLocation.customer_id})`);
        console.log('   Note: This could be due to the customer not existing in PostgreSQL.');
      }
      
      // Archived
      const mongoArchived = mongoLocation.archived || false;
      if (mongoArchived === pgLocation.archived) {
        console.log(`✅ Archived matches: ${pgLocation.archived}`);
      } else {
        console.log(`❌ Archived mismatch: MongoDB (${mongoArchived}) vs PostgreSQL (${pgLocation.archived})`);
      }
      
      // Overrides
      if (mongoLocation.overrides && Object.keys(mongoLocation.overrides).length > 0) {
        const mongoOverrides = JSON.stringify(mongoLocation.overrides);
        // For overrides, we need to compare the parsed JSON values since PostgreSQL might format it differently
        const pgOverrides = pgLocation.overrides ? pgLocation.overrides : null;
        
        if (pgOverrides === null) {
          console.log(`❌ Overrides mismatch: MongoDB has overrides but PostgreSQL has null`);
        } else {
          try {
            const mongoObj = JSON.parse(mongoOverrides);
            const pgObj = JSON.parse(pgOverrides);
            
            if (JSON.stringify(mongoObj) === JSON.stringify(pgObj)) {
              console.log(`✅ Overrides matches`);
            } else {
              console.log(`❌ Overrides mismatch: MongoDB and PostgreSQL have different overrides`);
            }
          } catch (error) {
            console.log(`❌ Error comparing overrides: ${error.message}`);
          }
        }
      } else if (pgLocation.overrides === null) {
        console.log(`✅ Overrides matches: both are null or empty`);
      } else {
        console.log(`❌ Overrides mismatch: MongoDB is null/empty but PostgreSQL has overrides`);
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
verifyLocationsOnlyMigration()
  .then(() => console.log('Locations verification script completed'))
  .catch(err => console.error('Locations verification script failed:', err));
