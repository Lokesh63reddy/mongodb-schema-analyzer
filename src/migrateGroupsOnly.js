/**
 * Script to migrate only groups table data from MongoDB to PostgreSQL
 * This script does NOT migrate group_permissions
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

// Main function to migrate groups
async function migrateGroupsOnly() {
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
    
    // Get groups collection
    const groupsCollection = db.collection('groups');
    
    // Count groups
    const count = await groupsCollection.countDocuments();
    console.log(`Found ${count} groups in MongoDB`);
    
    if (count === 0) {
      console.log('No groups to migrate. Exiting.');
      return;
    }
    
    // Begin PostgreSQL transaction
    await pgClient.query('BEGIN');
    
    // Process groups in batches
    const batchSize = 50;
    let processed = 0;
    
    // Use cursor for efficient processing of large collections
    const cursor = groupsCollection.find();
    
    let batch = [];
    let doc = await cursor.next();
    
    while (doc) {
      // Transform group document
      const transformedGroup = transformGroup(doc);
      batch.push(transformedGroup);
      
      // Process batch when it reaches batch size
      if (batch.length >= batchSize) {
        await processBatch(pgClient, batch);
        processed += batch.length;
        console.log(`Processed ${processed}/${count} groups`);
        batch = [];
      }
      
      // Get next document
      doc = await cursor.next();
    }
    
    // Process remaining groups
    if (batch.length > 0) {
      await processBatch(pgClient, batch);
      processed += batch.length;
      console.log(`Processed ${processed}/${count} groups`);
    }
    
    // Commit transaction
    await pgClient.query('COMMIT');
    
    console.log('Groups migration completed successfully');
    
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

// Function to transform MongoDB group to PostgreSQL format
function transformGroup(doc) {
  // Extract MongoDB _id as string
  const id = doc._id.toString();
  
  // Handle dates
  const createdAt = doc.createdAt instanceof Date ? doc.createdAt : 
                   (doc.createdAt ? new Date(doc.createdAt) : null);
  
  const updatedAt = doc.updatedAt instanceof Date ? doc.updatedAt : 
                   (doc.updatedAt ? new Date(doc.updatedAt) : null);
  
  // Transform group document
  return {
    id,
    name: doc.name || '',
    archived: doc.archived || false,
    order_num: doc.order !== undefined ? doc.order : null,
    created_at: createdAt,
    updated_at: updatedAt
  };
}

// Process a batch of groups
async function processBatch(pgClient, batch) {
  for (const group of batch) {
    await insertGroupIntoPostgres(pgClient, group);
  }
}

// Function to insert group into PostgreSQL
async function insertGroupIntoPostgres(pgClient, group) {
  try {
    const query = `
      INSERT INTO groups (
        id, name, archived, order_num, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (id) DO UPDATE SET
        name = $2,
        archived = $3,
        order_num = $4,
        updated_at = $6
    `;
    
    const values = [
      group.id,
      group.name,
      group.archived,
      group.order_num,
      group.created_at,
      group.updated_at
    ];
    
    await pgClient.query(query, values);
  } catch (error) {
    console.error(`Error inserting group ${group.id}:`, error);
    throw error;
  }
}

// Run the migration
migrateGroupsOnly()
  .then(() => console.log('Groups migration script completed'))
  .catch(err => console.error('Groups migration script failed:', err));
