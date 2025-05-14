/**
 * Script to migrate only locations table data from MongoDB to PostgreSQL
 * This script does NOT migrate location_contacts or equipment
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

// Main function to migrate locations
async function migrateLocationsOnly() {
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
    
    // Count locations
    const count = await locationsCollection.countDocuments();
    console.log(`Found ${count} locations in MongoDB`);
    
    if (count === 0) {
      console.log('No locations to migrate. Exiting.');
      return;
    }
    
    // Begin PostgreSQL transaction
    await pgClient.query('BEGIN');
    
    // Process locations in batches
    const batchSize = 50;
    let processed = 0;
    
    // Use cursor for efficient processing of large collections
    const cursor = locationsCollection.find();
    
    let batch = [];
    let doc = await cursor.next();
    
    while (doc) {
      // Transform location document
      const transformedLocation = transformLocation(doc);
      batch.push(transformedLocation);
      
      // Process batch when it reaches batch size
      if (batch.length >= batchSize) {
        await processBatch(pgClient, batch);
        processed += batch.length;
        console.log(`Processed ${processed}/${count} locations`);
        batch = [];
      }
      
      // Get next document
      doc = await cursor.next();
    }
    
    // Process remaining locations
    if (batch.length > 0) {
      await processBatch(pgClient, batch);
      processed += batch.length;
      console.log(`Processed ${processed}/${count} locations`);
    }
    
    // Commit transaction
    await pgClient.query('COMMIT');
    
    console.log('Locations migration completed successfully');
    
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

// Function to transform MongoDB location to PostgreSQL format
function transformLocation(doc) {
  // Extract MongoDB _id as string
  const id = doc._id.toString();
  
  // Handle dates
  const createdAt = doc.createdAt instanceof Date ? doc.createdAt : 
                   (doc.createdAt ? new Date(doc.createdAt) : null);
  
  const updatedAt = doc.updatedAt instanceof Date ? doc.updatedAt : 
                   (doc.updatedAt ? new Date(doc.updatedAt) : null);
  
  // Handle customer reference
  const customerId = doc.customer ? doc.customer.toString() : null;
  
  // Handle overrides object
  const overrides = doc.overrides ? JSON.stringify(doc.overrides) : null;
  
  // Transform location document
  return {
    id,
    name: doc.name || '',
    address: doc.address || null,
    city: doc.city || null,
    state: doc.state || null,
    zip: doc.zip || null,
    customer_id: customerId,
    archived: doc.archived || false,
    overrides,
    created_at: createdAt,
    updated_at: updatedAt
  };
}

// Process a batch of locations
async function processBatch(pgClient, batch) {
  for (const location of batch) {
    await insertLocationIntoPostgres(pgClient, location);
  }
}

// Function to insert location into PostgreSQL
async function insertLocationIntoPostgres(pgClient, location) {
  try {
    // Check if customer_id exists in customers table if it's not null
    if (location.customer_id) {
      const customerExists = await checkCustomerExists(pgClient, location.customer_id);
      if (!customerExists) {
        console.warn(`Customer ${location.customer_id} does not exist in PostgreSQL. Setting customer_id to NULL for location ${location.id}.`);
        location.customer_id = null;
      }
    }
    
    const query = `
      INSERT INTO locations (
        id, name, address, city, state, zip, customer_id, archived, overrides, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (id) DO UPDATE SET
        name = $2,
        address = $3,
        city = $4,
        state = $5,
        zip = $6,
        customer_id = $7,
        archived = $8,
        overrides = $9,
        updated_at = $11
    `;
    
    const values = [
      location.id,
      location.name,
      location.address,
      location.city,
      location.state,
      location.zip,
      location.customer_id,
      location.archived,
      location.overrides,
      location.created_at,
      location.updated_at
    ];
    
    await pgClient.query(query, values);
  } catch (error) {
    console.error(`Error inserting location ${location.id}:`, error);
    throw error;
  }
}

// Helper function to check if a customer exists in PostgreSQL
async function checkCustomerExists(pgClient, customerId) {
  const query = `
    SELECT EXISTS (
      SELECT FROM customers 
      WHERE id = $1
    )
  `;
  
  const result = await pgClient.query(query, [customerId]);
  return result.rows[0].exists;
}

// Run the migration
migrateLocationsOnly()
  .then(() => console.log('Locations migration script completed'))
  .catch(err => console.error('Locations migration script failed:', err));
