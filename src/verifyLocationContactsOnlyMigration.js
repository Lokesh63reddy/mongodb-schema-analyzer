/**
 * Script to verify location_contacts junction table migration from MongoDB to PostgreSQL
 * This script only verifies the location_contacts junction table
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

// Main function to verify location_contacts migration
async function verifyLocationContactsOnlyMigration() {
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
    
    // First, check if location_contacts table exists in PostgreSQL
    const tableExists = await checkTableExists(pgClient, 'location_contacts');
    
    if (!tableExists) {
      console.error('location_contacts table does not exist in PostgreSQL.');
      return;
    }
    
    // Count total contacts in MongoDB across all locations
    const locations = db.collection('locations');
    const mongoLocations = await locations.find({ 'contacts.0': { $exists: true } }).toArray();
    
    let totalMongoContacts = 0;
    for (const location of mongoLocations) {
      if (location.contacts && Array.isArray(location.contacts)) {
        totalMongoContacts += location.contacts.length;
      }
    }
    
    console.log(`Found ${totalMongoContacts} location_contacts relationships in MongoDB`);
    
    // Count location_contacts in PostgreSQL
    const pgResult = await pgClient.query('SELECT COUNT(*) FROM location_contacts');
    const pgCount = parseInt(pgResult.rows[0].count);
    console.log(`Found ${pgCount} location_contacts relationships in PostgreSQL`);
    
    // Compare counts
    if (totalMongoContacts === pgCount) {
      console.log('✅ Location_contacts counts match!');
    } else {
      console.log(`❌ Location_contacts counts don't match: MongoDB (${totalMongoContacts}) vs PostgreSQL (${pgCount})`);
      console.log('Note: This could be due to skipped relationships where locations or contacts were not migrated.');
    }
    
    // Sample a few locations to verify their contacts
    console.log('\nVerifying sample location contacts:');
    const sampleLocations = await locations.find({ 'contacts.0': { $exists: true } }).limit(3).toArray();
    
    for (const mongoLocation of sampleLocations) {
      const locationId = mongoLocation._id.toString();
      console.log(`\nChecking contacts for location ${locationId} (${mongoLocation.name || 'unnamed'}):`);
      
      // Count contacts for this location in MongoDB
      const mongoContactsCount = mongoLocation.contacts ? mongoLocation.contacts.length : 0;
      
      // Count contacts for this location in PostgreSQL
      const pgContactsResult = await pgClient.query(
        'SELECT COUNT(*) FROM location_contacts WHERE location_id = $1', 
        [locationId]
      );
      const pgContactsCount = parseInt(pgContactsResult.rows[0].count);
      
      console.log(`MongoDB: ${mongoContactsCount} contacts, PostgreSQL: ${pgContactsCount} contacts`);
      
      if (mongoContactsCount === pgContactsCount) {
        console.log(`✅ Contact counts match for location ${locationId}!`);
      } else {
        console.log(`❌ Contact counts don't match for location ${locationId}`);
      }
      
      // Sample a few contacts from this location to verify
      if (mongoLocation.contacts && mongoLocation.contacts.length > 0) {
        const sampleSize = Math.min(3, mongoLocation.contacts.length);
        for (let i = 0; i < sampleSize; i++) {
          const contact = mongoLocation.contacts[i];
          if (contact.ref) {
            const contactId = contact.ref.toString();
            
            // Check if this contact relationship exists in PostgreSQL
            const pgContactResult = await pgClient.query(
              'SELECT * FROM location_contacts WHERE location_id = $1 AND contact_id = $2', 
              [locationId, contactId]
            );
            
            if (pgContactResult.rows.length > 0) {
              console.log(`✅ Contact ${contactId} found in PostgreSQL`);
              
              // Compare primary flag
              const pgContact = pgContactResult.rows[0];
              const mongoPrimary = contact.primary || false;
              
              if (mongoPrimary === pgContact.primary_contact) {
                console.log(`  ✅ Primary flag matches: ${pgContact.primary_contact}`);
              } else {
                console.log(`  ❌ Primary flag mismatch: MongoDB (${mongoPrimary}) vs PostgreSQL (${pgContact.primary_contact})`);
              }
            } else {
              console.log(`❌ Contact ${contactId} not found in PostgreSQL`);
            }
          }
        }
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

// Helper function to check if a table exists in PostgreSQL
async function checkTableExists(pgClient, tableName) {
  const query = `
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = $1
    )
  `;
  
  const result = await pgClient.query(query, [tableName]);
  return result.rows[0].exists;
}

// Run the verification
verifyLocationContactsOnlyMigration()
  .then(() => console.log('Location_contacts verification script completed'))
  .catch(err => console.error('Location_contacts verification script failed:', err));
