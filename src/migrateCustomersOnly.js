/**
 * Script to migrate only customers table data from MongoDB to PostgreSQL
 * This script does NOT migrate customer_contacts or locations
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

// Main function to migrate customers
async function migrateCustomersOnly() {
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
    
    // Count customers
    const count = await customersCollection.countDocuments();
    console.log(`Found ${count} customers in MongoDB`);
    
    if (count === 0) {
      console.log('No customers to migrate. Exiting.');
      return;
    }
    
    // Begin PostgreSQL transaction
    await pgClient.query('BEGIN');
    
    // Process customers in batches
    const batchSize = 50;
    let processed = 0;
    
    // Use cursor for efficient processing of large collections
    const cursor = customersCollection.find();
    
    let batch = [];
    let doc = await cursor.next();
    
    while (doc) {
      // Transform customer document
      const transformedCustomer = transformCustomer(doc);
      batch.push(transformedCustomer);
      
      // Process batch when it reaches batch size
      if (batch.length >= batchSize) {
        await processBatch(pgClient, batch);
        processed += batch.length;
        console.log(`Processed ${processed}/${count} customers`);
        batch = [];
      }
      
      // Get next document
      doc = await cursor.next();
    }
    
    // Process remaining customers
    if (batch.length > 0) {
      await processBatch(pgClient, batch);
      processed += batch.length;
      console.log(`Processed ${processed}/${count} customers`);
    }
    
    // Commit transaction
    await pgClient.query('COMMIT');
    
    console.log('Customers migration completed successfully');
    
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

// Function to transform MongoDB customer to PostgreSQL format
function transformCustomer(doc) {
  // Extract MongoDB _id as string
  const id = doc._id.toString();
  
  // Handle dates
  const createdAt = doc.createdAt instanceof Date ? doc.createdAt : 
                   (doc.createdAt ? new Date(doc.createdAt) : null);
  
  const updatedAt = doc.updatedAt instanceof Date ? doc.updatedAt : 
                   (doc.updatedAt ? new Date(doc.updatedAt) : null);
  
  // Handle metadata object
  const metadata = doc.metadata ? JSON.stringify(doc.metadata) : null;
  
  // Transform customer document
  return {
    id,
    name: doc.name || '',
    address: doc.address || null,
    city: doc.city || null,
    state: doc.state || null,
    zip: doc.zip || null,
    archived: doc.archived || false,
    metadata,
    created_at: createdAt,
    updated_at: updatedAt
  };
}

// Process a batch of customers
async function processBatch(pgClient, batch) {
  for (const customer of batch) {
    await insertCustomerIntoPostgres(pgClient, customer);
  }
}

// Function to insert customer into PostgreSQL
async function insertCustomerIntoPostgres(pgClient, customer) {
  try {
    const query = `
      INSERT INTO customers (
        id, name, address, city, state, zip, archived, metadata, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (id) DO UPDATE SET
        name = $2,
        address = $3,
        city = $4,
        state = $5,
        zip = $6,
        archived = $7,
        metadata = $8,
        updated_at = $10
    `;
    
    const values = [
      customer.id,
      customer.name,
      customer.address,
      customer.city,
      customer.state,
      customer.zip,
      customer.archived,
      customer.metadata,
      customer.created_at,
      customer.updated_at
    ];
    
    await pgClient.query(query, values);
  } catch (error) {
    console.error(`Error inserting customer ${customer.id}:`, error);
    throw error;
  }
}

// Run the migration
migrateCustomersOnly()
  .then(() => console.log('Customers migration script completed'))
  .catch(err => console.error('Customers migration script failed:', err));
