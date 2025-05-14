/**
 * Script to migrate only activities table data from MongoDB to PostgreSQL
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

// Main function to migrate activities
async function migrateActivitiesOnly() {
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
    
    // Get activities collection
    const activitiesCollection = db.collection('activities');
    
    // Count activities
    const count = await activitiesCollection.countDocuments();
    console.log(`Found ${count} activities in MongoDB`);
    
    if (count === 0) {
      console.log('No activities to migrate. Exiting.');
      return;
    }
    
    // Begin PostgreSQL transaction
    await pgClient.query('BEGIN');
    
    // Process activities in batches
    const batchSize = 100;
    let processed = 0;
    
    // Use cursor for efficient processing of large collections
    const cursor = activitiesCollection.find();
    
    let batch = [];
    let doc = await cursor.next();
    
    while (doc) {
      // Transform activity document
      const transformedActivity = transformActivity(doc);
      batch.push(transformedActivity);
      
      // Process batch when it reaches batch size
      if (batch.length >= batchSize) {
        await processBatch(pgClient, batch);
        processed += batch.length;
        console.log(`Processed ${processed}/${count} activities`);
        batch = [];
      }
      
      // Get next document
      doc = await cursor.next();
    }
    
    // Process remaining activities
    if (batch.length > 0) {
      await processBatch(pgClient, batch);
      processed += batch.length;
      console.log(`Processed ${processed}/${count} activities`);
    }
    
    // Commit transaction
    await pgClient.query('COMMIT');
    
    console.log('Activities migration completed successfully');
    
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

// Function to transform MongoDB activity to PostgreSQL format
function transformActivity(doc) {
  // Extract MongoDB _id as string
  const id = doc._id.toString();
  
  // Handle dates
  const createdAt = doc.createdAt instanceof Date ? doc.createdAt : 
                   (doc.createdAt ? new Date(doc.createdAt) : null);
  
  const updatedAt = doc.updatedAt instanceof Date ? doc.updatedAt : 
                   (doc.updatedAt ? new Date(doc.updatedAt) : null);
  
  // Handle user reference
  const userId = doc.by ? doc.by.toString() : null;
  
  // Map activity type
  const type = doc.activity || null;
  
  // Map description (using resource and resourceId)
  const description = doc.resource ? 
    (doc.resourceId ? `${doc.resource} ${doc.resourceId}` : doc.resource) : 
    null;
  
  // Handle metadata (ts array and any other fields)
  const metadata = {
    resource: doc.resource,
    resourceId: doc.resourceId,
    ts: doc.ts,
    __v: doc.__v
  };
  
  // Transform activity document
  return {
    id,
    user_id: userId,
    type,
    description,
    metadata: JSON.stringify(metadata),
    created_at: createdAt,
    updated_at: updatedAt
  };
}

// Process a batch of activities
async function processBatch(pgClient, batch) {
  for (const activity of batch) {
    await insertActivityIntoPostgres(pgClient, activity);
  }
}

// Function to insert activity into PostgreSQL
async function insertActivityIntoPostgres(pgClient, activity) {
  try {
    // Check if user_id exists in users table if it's not null
    if (activity.user_id) {
      const userExists = await checkRecordExists(pgClient, 'users', activity.user_id);
      if (!userExists) {
        console.warn(`User ${activity.user_id} does not exist in PostgreSQL. Setting user_id to NULL for activity ${activity.id}.`);
        activity.user_id = null;
      }
    }
    
    const query = `
      INSERT INTO activities (
        id, user_id, type, description, metadata, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (id) DO UPDATE SET
        user_id = $2,
        type = $3,
        description = $4,
        metadata = $5,
        updated_at = $7
    `;
    
    const values = [
      activity.id,
      activity.user_id,
      activity.type,
      activity.description,
      activity.metadata,
      activity.created_at,
      activity.updated_at
    ];
    
    await pgClient.query(query, values);
  } catch (error) {
    console.error(`Error inserting activity ${activity.id}:`, error);
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
migrateActivitiesOnly()
  .then(() => console.log('Activities migration script completed'))
  .catch(err => console.error('Activities migration script failed:', err));
