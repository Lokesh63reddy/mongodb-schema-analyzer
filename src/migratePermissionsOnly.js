/**
 * Script to migrate only permissions table data from MongoDB to PostgreSQL
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

// Main function to migrate permissions
async function migratePermissionsOnly() {
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
    
    // Get permissions collection
    const permissionsCollection = db.collection('permissions');
    
    // Count permissions
    const count = await permissionsCollection.countDocuments();
    console.log(`Found ${count} permissions in MongoDB`);
    
    if (count === 0) {
      console.log('No permissions to migrate. Exiting.');
      return;
    }
    
    // Begin PostgreSQL transaction
    await pgClient.query('BEGIN');
    
    // Process permissions in batches
    const batchSize = 50;
    let processed = 0;
    
    // Use cursor for efficient processing of large collections
    const cursor = permissionsCollection.find();
    
    let batch = [];
    let doc = await cursor.next();
    
    while (doc) {
      // Transform permission document
      const transformedPermission = transformPermission(doc);
      batch.push(transformedPermission);
      
      // Process batch when it reaches batch size
      if (batch.length >= batchSize) {
        await processBatch(pgClient, batch);
        processed += batch.length;
        console.log(`Processed ${processed}/${count} permissions`);
        batch = [];
      }
      
      // Get next document
      doc = await cursor.next();
    }
    
    // Process remaining permissions
    if (batch.length > 0) {
      await processBatch(pgClient, batch);
      processed += batch.length;
      console.log(`Processed ${processed}/${count} permissions`);
    }
    
    // Commit transaction
    await pgClient.query('COMMIT');
    
    console.log('Permissions migration completed successfully');
    
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

// Function to transform MongoDB permission to PostgreSQL format
function transformPermission(doc) {
  // Extract MongoDB _id as string
  const id = doc._id.toString();
  
  // Handle dates
  const createdAt = doc.createdAt instanceof Date ? doc.createdAt : 
                   (doc.createdAt ? new Date(doc.createdAt) : null);
  
  const updatedAt = doc.updatedAt instanceof Date ? doc.updatedAt : 
                   (doc.updatedAt ? new Date(doc.updatedAt) : null);
  
  // Use longname as the primary name, fallback to shortname
  const name = doc.longname || doc.shortname || '';
  
  // Transform permission document
  return {
    id,
    name,
    description: doc.description || null,
    shortname: doc.shortname || null,
    type: doc.type || null,
    scope: doc.scope || null,
    created_at: createdAt,
    updated_at: updatedAt
  };
}

// Process a batch of permissions
async function processBatch(pgClient, batch) {
  for (const permission of batch) {
    await insertPermissionIntoPostgres(pgClient, permission);
  }
}

// Function to insert permission into PostgreSQL
async function insertPermissionIntoPostgres(pgClient, permission) {
  try {
    const query = `
      INSERT INTO permissions (
        id, name, description, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (id) DO UPDATE SET
        name = $2,
        description = $3,
        updated_at = $5
    `;
    
    const values = [
      permission.id,
      permission.name,
      permission.description,
      permission.created_at,
      permission.updated_at
    ];
    
    await pgClient.query(query, values);
  } catch (error) {
    console.error(`Error inserting permission ${permission.id}:`, error);
    throw error;
  }
}

// Run the migration
migratePermissionsOnly()
  .then(() => console.log('Permissions migration script completed'))
  .catch(err => console.error('Permissions migration script failed:', err));
