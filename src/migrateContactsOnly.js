/**
 * Script to migrate only contacts table data from MongoDB to PostgreSQL
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

// Main function to migrate contacts
async function migrateContactsOnly() {
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
    
    // Count contacts
    const count = await contactsCollection.countDocuments();
    console.log(`Found ${count} contacts in MongoDB`);
    
    if (count === 0) {
      console.log('No contacts to migrate. Exiting.');
      return;
    }
    
    // Begin PostgreSQL transaction
    await pgClient.query('BEGIN');
    
    // Process contacts in batches
    const batchSize = 50;
    let processed = 0;
    
    // Use cursor for efficient processing of large collections
    const cursor = contactsCollection.find();
    
    let batch = [];
    let doc = await cursor.next();
    
    while (doc) {
      // Transform contact document
      const transformedContact = transformContact(doc);
      batch.push(transformedContact);
      
      // Process batch when it reaches batch size
      if (batch.length >= batchSize) {
        await processBatch(pgClient, batch);
        processed += batch.length;
        console.log(`Processed ${processed}/${count} contacts`);
        batch = [];
      }
      
      // Get next document
      doc = await cursor.next();
    }
    
    // Process remaining contacts
    if (batch.length > 0) {
      await processBatch(pgClient, batch);
      processed += batch.length;
      console.log(`Processed ${processed}/${count} contacts`);
    }
    
    // Commit transaction
    await pgClient.query('COMMIT');
    
    console.log('Contacts migration completed successfully');
    
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

// Function to transform MongoDB contact to PostgreSQL format
function transformContact(doc) {
  // Extract MongoDB _id as string
  const id = doc._id.toString();
  
  // Handle dates
  const createdAt = doc.createdAt instanceof Date ? doc.createdAt : 
                   (doc.createdAt ? new Date(doc.createdAt) : null);
  
  const updatedAt = doc.updatedAt instanceof Date ? doc.updatedAt : 
                   (doc.updatedAt ? new Date(doc.updatedAt) : null);
  
  // Handle user reference
  const userId = doc.user ? doc.user.toString() : null;
  
  // Extract name components
  const firstName = doc.name?.first || '';
  const middleName = doc.name?.middle || '';
  const lastName = doc.name?.last || '';
  
  // Handle phone array
  const phone = doc.phone && Array.isArray(doc.phone) ? JSON.stringify(doc.phone) : null;
  
  // Transform contact document
  return {
    id,
    first_name: firstName,
    middle_name: middleName,
    last_name: lastName,
    email: doc.email || null,
    user_id: userId,
    archived: doc.archived || false,
    phone,
    created_at: createdAt,
    updated_at: updatedAt
  };
}

// Process a batch of contacts
async function processBatch(pgClient, batch) {
  for (const contact of batch) {
    await insertContactIntoPostgres(pgClient, contact);
  }
}

// Function to insert contact into PostgreSQL
async function insertContactIntoPostgres(pgClient, contact) {
  try {
    // Check if user_id exists in users table if it's not null
    if (contact.user_id) {
      const userExists = await checkUserExists(pgClient, contact.user_id);
      if (!userExists) {
        console.warn(`User ${contact.user_id} does not exist in PostgreSQL. Setting user_id to NULL for contact ${contact.id}.`);
        contact.user_id = null;
      }
    }
    
    const query = `
      INSERT INTO contacts (
        id, first_name, middle_name, last_name, email, user_id, archived, phone, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (id) DO UPDATE SET
        first_name = $2,
        middle_name = $3,
        last_name = $4,
        email = $5,
        user_id = $6,
        archived = $7,
        phone = $8,
        updated_at = $10
    `;
    
    const values = [
      contact.id,
      contact.first_name,
      contact.middle_name,
      contact.last_name,
      contact.email,
      contact.user_id,
      contact.archived,
      contact.phone,
      contact.created_at,
      contact.updated_at
    ];
    
    await pgClient.query(query, values);
  } catch (error) {
    console.error(`Error inserting contact ${contact.id}:`, error);
    throw error;
  }
}

// Helper function to check if a user exists in PostgreSQL
async function checkUserExists(pgClient, userId) {
  const query = `
    SELECT EXISTS (
      SELECT FROM users 
      WHERE id = $1
    )
  `;
  
  const result = await pgClient.query(query, [userId]);
  return result.rows[0].exists;
}

// Run the migration
migrateContactsOnly()
  .then(() => console.log('Contacts migration script completed'))
  .catch(err => console.error('Contacts migration script failed:', err));
