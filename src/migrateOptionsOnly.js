/**
 * Script to migrate only options table data from MongoDB to PostgreSQL
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

// Main function to migrate options
async function migrateOptionsOnly() {
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
    
    // Get options collection
    const optionsCollection = db.collection('options');
    
    // Count options
    const count = await optionsCollection.countDocuments();
    console.log(`Found ${count} options in MongoDB`);
    
    if (count === 0) {
      console.log('No options to migrate. Exiting.');
      return;
    }
    
    // Begin PostgreSQL transaction
    await pgClient.query('BEGIN');
    
    // Process options in batches
    const batchSize = 10;
    let processed = 0;
    
    // Use cursor for efficient processing of large collections
    const cursor = optionsCollection.find();
    
    let batch = [];
    let doc = await cursor.next();
    
    while (doc) {
      // Transform option document
      const transformedOption = transformOption(doc);
      batch.push(transformedOption);
      
      // Process batch when it reaches batch size
      if (batch.length >= batchSize) {
        await processBatch(pgClient, batch);
        processed += batch.length;
        console.log(`Processed ${processed}/${count} options`);
        batch = [];
      }
      
      // Get next document
      doc = await cursor.next();
    }
    
    // Process remaining options
    if (batch.length > 0) {
      await processBatch(pgClient, batch);
      processed += batch.length;
      console.log(`Processed ${processed}/${count} options`);
    }
    
    // Commit transaction
    await pgClient.query('COMMIT');
    
    console.log('Options migration completed successfully');
    
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

// Function to transform MongoDB option to PostgreSQL format
function transformOption(doc) {
  // Extract MongoDB _id as string
  const id = doc._id.toString();
  
  // Extract name
  const name = doc.name || '';
  
  // Extract description
  const description = doc.description || '';
  
  // Create value object from permissions and other fields
  const value = {
    permissions: doc.permissions || [],
    __v: doc.__v
  };
  
  // Set default timestamps if not present
  const createdAt = new Date();
  const updatedAt = new Date();
  
  // Transform option document
  return {
    id,
    name,
    value: JSON.stringify(value),
    description,
    created_at: createdAt,
    updated_at: updatedAt
  };
}

// Process a batch of options
async function processBatch(pgClient, batch) {
  for (const option of batch) {
    await insertOptionIntoPostgres(pgClient, option);
  }
}

// Function to insert option into PostgreSQL
async function insertOptionIntoPostgres(pgClient, option) {
  try {
    const query = `
      INSERT INTO options (
        id, name, value, description, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (id) DO UPDATE SET
        name = $2,
        value = $3,
        description = $4,
        updated_at = $6
    `;
    
    const values = [
      option.id,
      option.name,
      option.value,
      option.description,
      option.created_at,
      option.updated_at
    ];
    
    await pgClient.query(query, values);
  } catch (error) {
    console.error(`Error inserting option ${option.id}:`, error);
    throw error;
  }
}

// Run the migration
migrateOptionsOnly()
  .then(() => console.log('Options migration script completed'))
  .catch(err => console.error('Options migration script failed:', err));
