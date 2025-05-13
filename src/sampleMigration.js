/**
 * Sample migration script for a specific collection
 * This demonstrates how to migrate a MongoDB collection to PostgreSQL
 */

const { MongoClient } = require('mongodb');
const { Client } = require('pg');
require('dotenv').config();

// Configuration
const mongoUri = process.env.MONGODB_URI;
const dbName = process.env.DATABASE_NAME;
const collectionName = 'users'; // Change this to your collection name

// PostgreSQL configuration
const pgConfig = {
  host: process.env.PG_HOST || 'localhost',
  port: process.env.PG_PORT || 5432,
  database: process.env.PG_DATABASE,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD
};

// Function to create PostgreSQL table
async function createPostgresTable(pgClient) {
  // This is a sample schema - modify based on your actual collection structure
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT,
      email TEXT,
      first_name TEXT,
      last_name TEXT,
      created_at TIMESTAMP,
      updated_at TIMESTAMP,
      profile JSONB,
      settings JSONB,
      roles TEXT[]
    );
  `;
  
  try {
    await pgClient.query(createTableQuery);
    console.log('PostgreSQL table created or already exists');
  } catch (error) {
    console.error('Error creating PostgreSQL table:', error);
    throw error;
  }
}

// Function to transform MongoDB document to PostgreSQL format
function transformDocument(doc) {
  // Extract MongoDB _id as string
  const id = doc._id.toString();
  
  // Handle dates
  const createdAt = doc.created_at instanceof Date ? doc.created_at : 
                   (doc.created_at ? new Date(doc.created_at) : null);
  
  const updatedAt = doc.updated_at instanceof Date ? doc.updated_at : 
                   (doc.updated_at ? new Date(doc.updated_at) : null);
  
  // Handle nested objects using JSONB
  const profile = doc.profile ? JSON.stringify(doc.profile) : null;
  const settings = doc.settings ? JSON.stringify(doc.settings) : null;
  
  // Handle arrays
  const roles = doc.roles && Array.isArray(doc.roles) ? doc.roles : [];
  
  // Return transformed document
  return {
    id,
    username: doc.username,
    email: doc.email,
    first_name: doc.first_name,
    last_name: doc.last_name,
    created_at: createdAt,
    updated_at: updatedAt,
    profile,
    settings,
    roles
  };
}

// Function to insert document into PostgreSQL
async function insertIntoPostgres(pgClient, doc) {
  const query = `
    INSERT INTO users (
      id, username, email, first_name, last_name, 
      created_at, updated_at, profile, settings, roles
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    ON CONFLICT (id) DO UPDATE SET
      username = $2,
      email = $3,
      first_name = $4,
      last_name = $5,
      updated_at = $6,
      profile = $8,
      settings = $9,
      roles = $10
  `;
  
  const values = [
    doc.id,
    doc.username,
    doc.email,
    doc.first_name,
    doc.last_name,
    doc.created_at,
    doc.updated_at,
    doc.profile,
    doc.settings,
    doc.roles
  ];
  
  try {
    await pgClient.query(query, values);
  } catch (error) {
    console.error(`Error inserting document ${doc.id}:`, error);
    throw error;
  }
}

// Main migration function
async function migrateCollection() {
  const mongoClient = new MongoClient(mongoUri);
  const pgClient = new Client(pgConfig);
  
  try {
    // Connect to MongoDB
    await mongoClient.connect();
    console.log('Connected to MongoDB');
    
    // Connect to PostgreSQL
    await pgClient.connect();
    console.log('Connected to PostgreSQL');
    
    // Create PostgreSQL table if it doesn't exist
    await createPostgresTable(pgClient);
    
    // Get MongoDB collection
    const db = mongoClient.db(dbName);
    const collection = db.collection(collectionName);
    
    // Count documents
    const count = await collection.countDocuments();
    console.log(`Found ${count} documents in ${collectionName} collection`);
    
    // Begin PostgreSQL transaction
    await pgClient.query('BEGIN');
    
    // Process documents in batches
    const batchSize = 100;
    let processed = 0;
    
    // Use cursor for efficient processing of large collections
    const cursor = collection.find();
    
    let batch = [];
    let doc = await cursor.next();
    
    while (doc) {
      // Transform document
      const transformedDoc = transformDocument(doc);
      batch.push(transformedDoc);
      
      // Process batch when it reaches batch size
      if (batch.length >= batchSize) {
        await processBatch(pgClient, batch);
        processed += batch.length;
        console.log(`Processed ${processed}/${count} documents`);
        batch = [];
      }
      
      // Get next document
      doc = await cursor.next();
    }
    
    // Process remaining documents
    if (batch.length > 0) {
      await processBatch(pgClient, batch);
      processed += batch.length;
      console.log(`Processed ${processed}/${count} documents`);
    }
    
    // Commit transaction
    await pgClient.query('COMMIT');
    
    console.log(`Migration of ${collectionName} completed successfully`);
    
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

// Process a batch of documents
async function processBatch(pgClient, batch) {
  for (const doc of batch) {
    await insertIntoPostgres(pgClient, doc);
  }
}

// Run the migration
migrateCollection()
  .then(() => console.log('Migration script completed'))
  .catch(err => console.error('Migration script failed:', err));
