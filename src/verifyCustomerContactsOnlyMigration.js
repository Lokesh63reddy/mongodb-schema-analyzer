/**
 * Script to verify customer_contacts junction table migration from MongoDB to PostgreSQL
 * This script only verifies the customer_contacts junction table
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

// Main function to verify customer_contacts migration
async function verifyCustomerContactsOnlyMigration() {
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
    
    // First, check if customer_contacts table exists in PostgreSQL
    const tableExists = await checkTableExists(pgClient, 'customer_contacts');
    
    if (!tableExists) {
      console.error('customer_contacts table does not exist in PostgreSQL.');
      return;
    }
    
    // Count total contacts in MongoDB across all customers
    const customers = db.collection('customers');
    const mongoCustomers = await customers.find({ 'contacts.0': { $exists: true } }).toArray();
    
    let totalMongoContacts = 0;
    for (const customer of mongoCustomers) {
      if (customer.contacts && Array.isArray(customer.contacts)) {
        totalMongoContacts += customer.contacts.length;
      }
    }
    
    console.log(`Found ${totalMongoContacts} customer_contacts relationships in MongoDB`);
    
    // Count customer_contacts in PostgreSQL
    const pgResult = await pgClient.query('SELECT COUNT(*) FROM customer_contacts');
    const pgCount = parseInt(pgResult.rows[0].count);
    console.log(`Found ${pgCount} customer_contacts relationships in PostgreSQL`);
    
    // Compare counts
    if (totalMongoContacts === pgCount) {
      console.log('✅ Customer_contacts counts match!');
    } else {
      console.log(`❌ Customer_contacts counts don't match: MongoDB (${totalMongoContacts}) vs PostgreSQL (${pgCount})`);
      console.log('Note: This could be due to skipped relationships where customers or contacts were not migrated.');
    }
    
    // Sample a few customers to verify their contacts
    console.log('\nVerifying sample customer contacts:');
    const sampleCustomers = await customers.find({ 'contacts.0': { $exists: true } }).limit(3).toArray();
    
    for (const mongoCustomer of sampleCustomers) {
      const customerId = mongoCustomer._id.toString();
      console.log(`\nChecking contacts for customer ${customerId} (${mongoCustomer.name || 'unnamed'}):`);
      
      // Count contacts for this customer in MongoDB
      const mongoContactsCount = mongoCustomer.contacts ? mongoCustomer.contacts.length : 0;
      
      // Count contacts for this customer in PostgreSQL
      const pgContactsResult = await pgClient.query(
        'SELECT COUNT(*) FROM customer_contacts WHERE customer_id = $1', 
        [customerId]
      );
      const pgContactsCount = parseInt(pgContactsResult.rows[0].count);
      
      console.log(`MongoDB: ${mongoContactsCount} contacts, PostgreSQL: ${pgContactsCount} contacts`);
      
      if (mongoContactsCount === pgContactsCount) {
        console.log(`✅ Contact counts match for customer ${customerId}!`);
      } else {
        console.log(`❌ Contact counts don't match for customer ${customerId}`);
      }
      
      // Sample a few contacts from this customer to verify
      if (mongoCustomer.contacts && mongoCustomer.contacts.length > 0) {
        const sampleSize = Math.min(3, mongoCustomer.contacts.length);
        for (let i = 0; i < sampleSize; i++) {
          const contact = mongoCustomer.contacts[i];
          if (contact.ref) {
            const contactId = contact.ref.toString();
            
            // Check if this contact relationship exists in PostgreSQL
            const pgContactResult = await pgClient.query(
              'SELECT * FROM customer_contacts WHERE customer_id = $1 AND contact_id = $2', 
              [customerId, contactId]
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
verifyCustomerContactsOnlyMigration()
  .then(() => console.log('Customer_contacts verification script completed'))
  .catch(err => console.error('Customer_contacts verification script failed:', err));
