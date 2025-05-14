/**
 * Script to verify customers table migration from MongoDB to PostgreSQL
 * This script only verifies the customers table
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

// Main function to verify customers migration
async function verifyCustomersOnlyMigration() {
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
    
    // Get customers collection
    const customersCollection = db.collection('customers');
    
    // Count customers in MongoDB
    const mongoCount = await customersCollection.countDocuments();
    console.log(`Found ${mongoCount} customers in MongoDB`);
    
    // Count customers in PostgreSQL
    const pgResult = await pgClient.query('SELECT COUNT(*) FROM customers');
    const pgCount = parseInt(pgResult.rows[0].count);
    console.log(`Found ${pgCount} customers in PostgreSQL`);
    
    // Compare counts
    if (mongoCount === pgCount) {
      console.log('✅ Customer counts match!');
    } else {
      console.log(`❌ Customer counts don't match: MongoDB (${mongoCount}) vs PostgreSQL (${pgCount})`);
    }
    
    // Sample a few customers to verify data integrity
    console.log('\nVerifying sample customers:');
    const sampleCustomers = await customersCollection.find().limit(5).toArray();
    
    for (const mongoCustomer of sampleCustomers) {
      const mongoId = mongoCustomer._id.toString();
      const pgResult = await pgClient.query('SELECT * FROM customers WHERE id = $1', [mongoId]);
      
      if (pgResult.rows.length === 0) {
        console.log(`❌ Customer ${mongoId} not found in PostgreSQL`);
        continue;
      }
      
      const pgCustomer = pgResult.rows[0];
      
      // Compare key fields
      console.log(`\nComparing customer ${mongoId}:`);
      
      // Name
      const mongoName = mongoCustomer.name || '';
      if (mongoName === pgCustomer.name) {
        console.log(`✅ Name matches: ${pgCustomer.name}`);
      } else {
        console.log(`❌ Name mismatch: MongoDB (${mongoName}) vs PostgreSQL (${pgCustomer.name})`);
      }
      
      // Address
      const mongoAddress = mongoCustomer.address || null;
      if (mongoAddress === pgCustomer.address) {
        console.log(`✅ Address matches: ${pgCustomer.address}`);
      } else {
        console.log(`❌ Address mismatch: MongoDB (${mongoAddress}) vs PostgreSQL (${pgCustomer.address})`);
      }
      
      // City
      const mongoCity = mongoCustomer.city || null;
      if (mongoCity === pgCustomer.city) {
        console.log(`✅ City matches: ${pgCustomer.city}`);
      } else {
        console.log(`❌ City mismatch: MongoDB (${mongoCity}) vs PostgreSQL (${pgCustomer.city})`);
      }
      
      // State
      const mongoState = mongoCustomer.state || null;
      if (mongoState === pgCustomer.state) {
        console.log(`✅ State matches: ${pgCustomer.state}`);
      } else {
        console.log(`❌ State mismatch: MongoDB (${mongoState}) vs PostgreSQL (${pgCustomer.state})`);
      }
      
      // Zip
      const mongoZip = mongoCustomer.zip || null;
      if (mongoZip === pgCustomer.zip) {
        console.log(`✅ Zip matches: ${pgCustomer.zip}`);
      } else {
        console.log(`❌ Zip mismatch: MongoDB (${mongoZip}) vs PostgreSQL (${pgCustomer.zip})`);
      }
      
      // Archived
      const mongoArchived = mongoCustomer.archived || false;
      if (mongoArchived === pgCustomer.archived) {
        console.log(`✅ Archived matches: ${pgCustomer.archived}`);
      } else {
        console.log(`❌ Archived mismatch: MongoDB (${mongoArchived}) vs PostgreSQL (${pgCustomer.archived})`);
      }
      
      // Metadata
      if (mongoCustomer.metadata) {
        const mongoMetadata = JSON.stringify(mongoCustomer.metadata);
        // For metadata, we need to compare the parsed JSON values since PostgreSQL might format it differently
        const pgMetadata = pgCustomer.metadata ? pgCustomer.metadata : null;
        
        if (pgMetadata === null) {
          console.log(`❌ Metadata mismatch: MongoDB has metadata but PostgreSQL has null`);
        } else {
          try {
            const mongoObj = JSON.parse(mongoMetadata);
            const pgObj = JSON.parse(pgMetadata);
            
            if (JSON.stringify(mongoObj) === JSON.stringify(pgObj)) {
              console.log(`✅ Metadata matches`);
            } else {
              console.log(`❌ Metadata mismatch: MongoDB and PostgreSQL have different metadata`);
            }
          } catch (error) {
            console.log(`❌ Error comparing metadata: ${error.message}`);
          }
        }
      } else if (pgCustomer.metadata === null) {
        console.log(`✅ Metadata matches: both are null`);
      } else {
        console.log(`❌ Metadata mismatch: MongoDB is null but PostgreSQL has metadata`);
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
verifyCustomersOnlyMigration()
  .then(() => console.log('Customers verification script completed'))
  .catch(err => console.error('Customers verification script failed:', err));
