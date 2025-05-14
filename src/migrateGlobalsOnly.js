/**
 * Script to migrate only globals table data from MongoDB to PostgreSQL
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

// Main function to migrate globals
async function migrateGlobalsOnly() {
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
    
    // Get globals collection
    const globalsCollection = db.collection('globals');
    
    // Count globals
    const count = await globalsCollection.countDocuments();
    console.log(`Found ${count} globals in MongoDB`);
    
    if (count === 0) {
      console.log('No globals to migrate. Exiting.');
      return;
    }
    
    // Begin PostgreSQL transaction
    await pgClient.query('BEGIN');
    
    // Process globals in batches
    const batchSize = 10;
    let processed = 0;
    
    // Use cursor for efficient processing of large collections
    const cursor = globalsCollection.find();
    
    let batch = [];
    let doc = await cursor.next();
    
    while (doc) {
      // Transform global document
      const transformedGlobal = transformGlobal(doc);
      batch.push(transformedGlobal);
      
      // Process batch when it reaches batch size
      if (batch.length >= batchSize) {
        await processBatch(pgClient, batch);
        processed += batch.length;
        console.log(`Processed ${processed}/${count} globals`);
        batch = [];
      }
      
      // Get next document
      doc = await cursor.next();
    }
    
    // Process remaining globals
    if (batch.length > 0) {
      await processBatch(pgClient, batch);
      processed += batch.length;
      console.log(`Processed ${processed}/${count} globals`);
    }
    
    // Commit transaction
    await pgClient.query('COMMIT');
    
    console.log('Globals migration completed successfully');
    
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

// Function to transform MongoDB global to PostgreSQL format
function transformGlobal(doc) {
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
        console.warn(`Invalid createdAt date for global ${id}, using current date instead`);
        createdAt = new Date();
      }
    } catch (error) {
      console.warn(`Error parsing createdAt date for global ${id}, using current date instead:`, error.message);
      createdAt = new Date();
    }
  } else {
    console.warn(`No createdAt date for global ${id}, using current date`);
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
        console.warn(`Invalid updatedAt date for global ${id}, using current date instead`);
        updatedAt = new Date();
      }
    } catch (error) {
      console.warn(`Error parsing updatedAt date for global ${id}, using current date instead:`, error.message);
      updatedAt = new Date();
    }
  } else {
    console.warn(`No updatedAt date for global ${id}, using current date`);
    updatedAt = new Date();
  }
  
  // Extract name
  const name = doc.name || '';
  
  // Extract description
  const description = doc.description || '';
  
  // Create value object from references and other fields
  const value = {
    references: doc.references || [],
    __v: doc.__v
  };
  
  // Transform global document
  return {
    id,
    name,
    value: JSON.stringify(value),
    description,
    created_at: createdAt,
    updated_at: updatedAt
  };
}

// Process a batch of globals
async function processBatch(pgClient, batch) {
  for (const global of batch) {
    await insertGlobalIntoPostgres(pgClient, global);
  }
}

// Function to insert global into PostgreSQL
async function insertGlobalIntoPostgres(pgClient, global) {
  try {
    const query = `
      INSERT INTO globals (
        id, name, value, description, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (id) DO UPDATE SET
        name = $2,
        value = $3,
        description = $4,
        updated_at = $6
    `;
    
    const values = [
      global.id,
      global.name,
      global.value,
      global.description,
      global.created_at,
      global.updated_at
    ];
    
    await pgClient.query(query, values);
  } catch (error) {
    console.error(`Error inserting global ${global.id}:`, error);
    throw error;
  }
}

// Run the migration
migrateGlobalsOnly()
  .then(() => console.log('Globals migration script completed'))
  .catch(err => console.error('Globals migration script failed:', err));
