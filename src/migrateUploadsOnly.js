/**
 * Script to migrate only uploads table data from MongoDB to PostgreSQL
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

// Main function to migrate uploads
async function migrateUploadsOnly() {
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
    
    // Get uploads collection
    const uploadsCollection = db.collection('uploads');
    
    // Count uploads
    const count = await uploadsCollection.countDocuments();
    console.log(`Found ${count} uploads in MongoDB`);
    
    if (count === 0) {
      console.log('No uploads to migrate. Exiting.');
      return;
    }
    
    // Begin PostgreSQL transaction
    await pgClient.query('BEGIN');
    
    // Process uploads in batches
    const batchSize = 50;
    let processed = 0;
    
    // Use cursor for efficient processing of large collections
    const cursor = uploadsCollection.find();
    
    let batch = [];
    let doc = await cursor.next();
    
    while (doc) {
      // Transform upload document
      const transformedUpload = transformUpload(doc);
      batch.push(transformedUpload);
      
      // Process batch when it reaches batch size
      if (batch.length >= batchSize) {
        await processBatch(pgClient, batch);
        processed += batch.length;
        console.log(`Processed ${processed}/${count} uploads`);
        batch = [];
      }
      
      // Get next document
      doc = await cursor.next();
    }
    
    // Process remaining uploads
    if (batch.length > 0) {
      await processBatch(pgClient, batch);
      processed += batch.length;
      console.log(`Processed ${processed}/${count} uploads`);
    }
    
    // Commit transaction
    await pgClient.query('COMMIT');
    
    console.log('Uploads migration completed successfully');
    
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

// Function to transform MongoDB upload to PostgreSQL format
function transformUpload(doc) {
  // Extract MongoDB _id as string
  const id = doc._id.toString();
  
  // Handle dates
  const createdAt = doc.createdAt instanceof Date ? doc.createdAt : 
                   (doc.createdAt ? new Date(doc.createdAt) : null);
  
  const updatedAt = doc.updatedAt instanceof Date ? doc.updatedAt : 
                   (doc.updatedAt ? new Date(doc.updatedAt) : null);
  
  // Extract user ID from the first activity entry if available
  let userId = null;
  if (doc.activity && doc.activity.length > 0 && doc.activity[0].by) {
    userId = doc.activity[0].by.toString();
  }
  
  // Extract filename, mimetype, size, and path
  const filename = doc.filename || doc.name || '';
  const mimetype = doc.filetype || '';
  const size = doc.filesize || 0;
  const path = doc.key || '';
  
  // Combine all other data into a metadata object
  const metadata = {
    resource: doc.resource,
    resourceId: doc.resourceId,
    description: doc.description,
    archived: doc.archived,
    activity: doc.activity,
    name: doc.name,
    __v: doc.__v
  };
  
  // Transform upload document
  return {
    id,
    user_id: userId,
    filename,
    mimetype,
    size,
    path,
    metadata: JSON.stringify(metadata),
    created_at: createdAt,
    updated_at: updatedAt
  };
}

// Process a batch of uploads
async function processBatch(pgClient, batch) {
  for (const upload of batch) {
    await insertUploadIntoPostgres(pgClient, upload);
  }
}

// Function to insert upload into PostgreSQL
async function insertUploadIntoPostgres(pgClient, upload) {
  try {
    // Check if user_id exists in users table if it's not null
    if (upload.user_id) {
      const userExists = await checkRecordExists(pgClient, 'users', upload.user_id);
      if (!userExists) {
        console.warn(`User ${upload.user_id} does not exist in PostgreSQL. Setting user_id to NULL for upload ${upload.id}.`);
        upload.user_id = null;
      }
    }
    
    const query = `
      INSERT INTO uploads (
        id, user_id, filename, mimetype, size, path, metadata, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (id) DO UPDATE SET
        user_id = $2,
        filename = $3,
        mimetype = $4,
        size = $5,
        path = $6,
        metadata = $7,
        updated_at = $9
    `;
    
    const values = [
      upload.id,
      upload.user_id,
      upload.filename,
      upload.mimetype,
      upload.size,
      upload.path,
      upload.metadata,
      upload.created_at,
      upload.updated_at
    ];
    
    await pgClient.query(query, values);
  } catch (error) {
    console.error(`Error inserting upload ${upload.id}:`, error);
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
migrateUploadsOnly()
  .then(() => console.log('Uploads migration script completed'))
  .catch(err => console.error('Uploads migration script failed:', err));
