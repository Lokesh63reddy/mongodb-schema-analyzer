/**
 * Script to migrate only apikeys table data from MongoDB to PostgreSQL
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

// Main function to migrate API keys
async function migrateApiKeysOnly() {
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
    
    // Get apikeys collection
    const apiKeysCollection = db.collection('apikeys');
    
    // Count API keys
    const count = await apiKeysCollection.countDocuments();
    console.log(`Found ${count} API keys in MongoDB`);
    
    if (count === 0) {
      console.log('No API keys to migrate. Exiting.');
      return;
    }
    
    // Begin PostgreSQL transaction
    await pgClient.query('BEGIN');
    
    // Process API keys in batches
    const batchSize = 10;
    let processed = 0;
    
    // Use cursor for efficient processing of large collections
    const cursor = apiKeysCollection.find();
    
    let batch = [];
    let doc = await cursor.next();
    
    while (doc) {
      // Transform API key document
      const transformedApiKey = transformApiKey(doc);
      batch.push(transformedApiKey);
      
      // Process batch when it reaches batch size
      if (batch.length >= batchSize) {
        await processBatch(pgClient, batch);
        processed += batch.length;
        console.log(`Processed ${processed}/${count} API keys`);
        batch = [];
      }
      
      // Get next document
      doc = await cursor.next();
    }
    
    // Process remaining API keys
    if (batch.length > 0) {
      await processBatch(pgClient, batch);
      processed += batch.length;
      console.log(`Processed ${processed}/${count} API keys`);
    }
    
    // Commit transaction
    await pgClient.query('COMMIT');
    
    console.log('API keys migration completed successfully');
    
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

// Function to transform MongoDB API key to PostgreSQL format
function transformApiKey(doc) {
  // Extract MongoDB _id as string
  const id = doc._id.toString();
  
  // Handle dates with validation
  let createdAt = null;
  if (doc.createdAt instanceof Date) {
    createdAt = doc.createdAt;
  } else if (doc.createdAt) {
    try {
      const date = new Date(doc.createdAt);
      // Check if date is valid
      if (!isNaN(date.getTime())) {
        createdAt = date;
      } else {
        console.warn(`Invalid createdAt date for API key ${id}, using current date instead`);
        createdAt = new Date();
      }
    } catch (error) {
      console.warn(`Error parsing createdAt date for API key ${id}, using current date instead:`, error.message);
      createdAt = new Date();
    }
  } else {
    console.warn(`No createdAt date for API key ${id}, using current date`);
    createdAt = new Date();
  }
  
  let updatedAt = null;
  if (doc.updatedAt instanceof Date) {
    updatedAt = doc.updatedAt;
  } else if (doc.updatedAt) {
    try {
      const date = new Date(doc.updatedAt);
      // Check if date is valid
      if (!isNaN(date.getTime())) {
        updatedAt = date;
      } else {
        console.warn(`Invalid updatedAt date for API key ${id}, using current date instead`);
        updatedAt = new Date();
      }
    } catch (error) {
      console.warn(`Error parsing updatedAt date for API key ${id}, using current date instead:`, error.message);
      updatedAt = new Date();
    }
  } else {
    console.warn(`No updatedAt date for API key ${id}, using current date`);
    updatedAt = new Date();
  }
  
  // Extract name
  const name = doc.name || '';
  
  // Extract key
  const key = doc.key || '';
  
  // Extract secret (not present in sample, using empty string as default)
  const secret = '';
  
  // Extract user_id
  const userId = doc.user ? doc.user.toString() : null;
  
  // Extract permissions (not present in sample, using empty array as default)
  const permissions = JSON.stringify([]);
  
  // Extract active status (not present in sample, using true as default)
  const active = true;
  
  // Transform API key document
  return {
    id,
    name,
    key,
    secret,
    user_id: userId,
    permissions,
    active,
    created_at: createdAt,
    updated_at: updatedAt
  };
}

// Process a batch of API keys
async function processBatch(pgClient, batch) {
  for (const apiKey of batch) {
    await insertApiKeyIntoPostgres(pgClient, apiKey);
  }
}

// Function to insert API key into PostgreSQL
async function insertApiKeyIntoPostgres(pgClient, apiKey) {
  try {
    // Check if user_id exists in users table if it's not null
    if (apiKey.user_id) {
      const userExists = await checkRecordExists(pgClient, 'users', apiKey.user_id);
      if (!userExists) {
        console.warn(`User ${apiKey.user_id} does not exist in PostgreSQL. Setting user_id to NULL for API key ${apiKey.id}.`);
        apiKey.user_id = null;
      }
    }
    
    const query = `
      INSERT INTO apikeys (
        id, name, key, secret, user_id, permissions, active, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (id) DO UPDATE SET
        name = $2,
        key = $3,
        secret = $4,
        user_id = $5,
        permissions = $6,
        active = $7,
        updated_at = $9
    `;
    
    const values = [
      apiKey.id,
      apiKey.name,
      apiKey.key,
      apiKey.secret,
      apiKey.user_id,
      apiKey.permissions,
      apiKey.active,
      apiKey.created_at,
      apiKey.updated_at
    ];
    
    await pgClient.query(query, values);
  } catch (error) {
    console.error(`Error inserting API key ${apiKey.id}:`, error);
    throw error;
  }
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
migrateApiKeysOnly()
  .then(() => console.log('API keys migration script completed'))
  .catch(err => console.error('API keys migration script failed:', err));
