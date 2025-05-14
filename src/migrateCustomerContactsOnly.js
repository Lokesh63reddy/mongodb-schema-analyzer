/**
 * Script to migrate only customer_contacts junction table data from MongoDB to PostgreSQL
 * This script assumes that customers and contacts tables already exist in PostgreSQL
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

// Main function to migrate customer_contacts
async function migrateCustomerContactsOnly() {
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
    
    // Begin PostgreSQL transaction
    await pgClient.query('BEGIN');
    
    // Migrate customer_contacts junction table
    console.log('Migrating customer_contacts junction table...');
    const count = await migrateCustomerContacts(db, pgClient);
    
    // Commit transaction
    await pgClient.query('COMMIT');
    
    console.log(`Successfully migrated ${count} customer_contacts relationships`);
    
  } catch (error) {
    console.error('Migration failed:', error);
    
    // Rollback transaction
    try {
      await pgClient.query('ROLLBACK');
    } catch (rollbackError) {
      console.error('Rollback failed:', rollbackError);
    }
    
  } finally {
    // Close connections
    await mongoClient.close();
    await pgClient.end();
  }
}

// Function to migrate customer_contacts junction table
async function migrateCustomerContacts(db, pgClient) {
  console.log('Migrating customer_contacts junction table');
  
  // First, check if customers and contacts tables exist in PostgreSQL
  const customersExist = await checkTableExists(pgClient, 'customers');
  const contactsExist = await checkTableExists(pgClient, 'contacts');
  
  if (!customersExist) {
    throw new Error('Customers table does not exist in PostgreSQL. Please migrate customers first.');
  }
  
  if (!contactsExist) {
    throw new Error('Contacts table does not exist in PostgreSQL. Please migrate contacts first.');
  }
  
  // Get customers collection
  const customers = db.collection('customers');
  
  // Find customers with contacts array
  const cursor = customers.find({ 'contacts.0': { $exists: true } });
  
  let count = 0;
  let doc = await cursor.next();
  
  while (doc) {
    if (doc.contacts && Array.isArray(doc.contacts)) {
      for (const contact of doc.contacts) {
        if (contact.ref) {
          try {
            // Check if the customer exists in PostgreSQL
            const customerExists = await checkRecordExists(pgClient, 'customers', doc._id.toString());
            if (!customerExists) {
              console.warn(`Customer ${doc._id} does not exist in PostgreSQL. Skipping its contacts.`);
              continue;
            }
            
            // Check if the contact exists in PostgreSQL
            const contactExists = await checkRecordExists(pgClient, 'contacts', contact.ref.toString());
            if (!contactExists) {
              console.warn(`Contact ${contact.ref} does not exist in PostgreSQL. Skipping this relationship.`);
              continue;
            }
            
            const query = `
              INSERT INTO customer_contacts (
                id, customer_id, contact_id, primary_contact, created_at, updated_at
              ) VALUES ($1, $2, $3, $4, $5, $6)
              ON CONFLICT DO NOTHING
            `;
            
            const relationshipId = contact._id ? contact._id.toString() : `${doc._id}_${contact.ref}`;
            const customerId = doc._id.toString();
            const contactId = contact.ref.toString();
            const isPrimary = contact.primary || false;
            
            const values = [
              relationshipId,
              customerId,
              contactId,
              isPrimary,
              new Date(),
              new Date()
            ];
            
            await pgClient.query(query, values);
            count++;
            
            if (count % 100 === 0) {
              console.log(`Processed ${count} customer_contacts relationships`);
            }
          } catch (error) {
            console.error(`Error inserting customer_contact: ${error.message}`);
          }
        }
      }
    }
    
    doc = await cursor.next();
  }
  
  console.log(`Migrated ${count} customer_contacts relationships`);
  return count;
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

// Run the migration
migrateCustomerContactsOnly()
  .then(() => console.log('Customer_contacts migration script completed'))
  .catch(err => console.error('Customer_contacts migration script failed:', err));
