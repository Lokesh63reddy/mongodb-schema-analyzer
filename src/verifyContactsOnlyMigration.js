/**
 * Script to verify contacts table migration from MongoDB to PostgreSQL
 * This script only verifies the contacts table
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

// Main function to verify contacts migration
async function verifyContactsOnlyMigration() {
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
    
    // Get contacts collection
    const contactsCollection = db.collection('contacts');
    
    // Count contacts in MongoDB
    const mongoCount = await contactsCollection.countDocuments();
    console.log(`Found ${mongoCount} contacts in MongoDB`);
    
    // Count contacts in PostgreSQL
    const pgResult = await pgClient.query('SELECT COUNT(*) FROM contacts');
    const pgCount = parseInt(pgResult.rows[0].count);
    console.log(`Found ${pgCount} contacts in PostgreSQL`);
    
    // Compare counts
    if (mongoCount === pgCount) {
      console.log('✅ Contact counts match!');
    } else {
      console.log(`❌ Contact counts don't match: MongoDB (${mongoCount}) vs PostgreSQL (${pgCount})`);
    }
    
    // Sample a few contacts to verify data integrity
    console.log('\nVerifying sample contacts:');
    const sampleContacts = await contactsCollection.find().limit(5).toArray();
    
    for (const mongoContact of sampleContacts) {
      const mongoId = mongoContact._id.toString();
      const pgResult = await pgClient.query('SELECT * FROM contacts WHERE id = $1', [mongoId]);
      
      if (pgResult.rows.length === 0) {
        console.log(`❌ Contact ${mongoId} not found in PostgreSQL`);
        continue;
      }
      
      const pgContact = pgResult.rows[0];
      
      // Compare key fields
      console.log(`\nComparing contact ${mongoId}:`);
      
      // First Name
      const mongoFirstName = mongoContact.name?.first || '';
      if (mongoFirstName === pgContact.first_name) {
        console.log(`✅ First name matches: ${pgContact.first_name}`);
      } else {
        console.log(`❌ First name mismatch: MongoDB (${mongoFirstName}) vs PostgreSQL (${pgContact.first_name})`);
      }
      
      // Last Name
      const mongoLastName = mongoContact.name?.last || '';
      if (mongoLastName === pgContact.last_name) {
        console.log(`✅ Last name matches: ${pgContact.last_name}`);
      } else {
        console.log(`❌ Last name mismatch: MongoDB (${mongoLastName}) vs PostgreSQL (${pgContact.last_name})`);
      }
      
      // Email
      const mongoEmail = mongoContact.email || null;
      if (mongoEmail === pgContact.email) {
        console.log(`✅ Email matches: ${pgContact.email}`);
      } else {
        console.log(`❌ Email mismatch: MongoDB (${mongoEmail}) vs PostgreSQL (${pgContact.email})`);
      }
      
      // User ID
      const mongoUserId = mongoContact.user ? mongoContact.user.toString() : null;
      if (mongoUserId === pgContact.user_id) {
        console.log(`✅ User ID matches: ${pgContact.user_id}`);
      } else {
        console.log(`❌ User ID mismatch: MongoDB (${mongoUserId}) vs PostgreSQL (${pgContact.user_id})`);
        console.log('   Note: This could be due to the user not existing in PostgreSQL.');
      }
      
      // Archived
      const mongoArchived = mongoContact.archived || false;
      if (mongoArchived === pgContact.archived) {
        console.log(`✅ Archived matches: ${pgContact.archived}`);
      } else {
        console.log(`❌ Archived mismatch: MongoDB (${mongoArchived}) vs PostgreSQL (${pgContact.archived})`);
      }
      
      // Phone
      const mongoPhone = mongoContact.phone && Array.isArray(mongoContact.phone) ? 
                        JSON.stringify(mongoContact.phone) : null;
      // For phone, we need to compare the parsed JSON values since PostgreSQL might format it differently
      const pgPhone = pgContact.phone ? pgContact.phone : null;
      
      if ((mongoPhone === null && pgPhone === null) || 
          (mongoPhone !== null && pgPhone !== null && 
           JSON.stringify(JSON.parse(mongoPhone)) === JSON.stringify(JSON.parse(pgPhone)))) {
        console.log(`✅ Phone matches`);
      } else {
        console.log(`❌ Phone mismatch: MongoDB (${mongoPhone}) vs PostgreSQL (${pgPhone})`);
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
verifyContactsOnlyMigration()
  .then(() => console.log('Contacts verification script completed'))
  .catch(err => console.error('Contacts verification script failed:', err));
