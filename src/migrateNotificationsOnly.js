/**
 * Script to migrate only notifications table data from MongoDB to PostgreSQL
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

// Main function to migrate notifications
async function migrateNotificationsOnly() {
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
    
    // Get notifications collection
    const notificationsCollection = db.collection('notifications');
    
    // Count notifications
    const count = await notificationsCollection.countDocuments();
    console.log(`Found ${count} notifications in MongoDB`);
    
    if (count === 0) {
      console.log('No notifications to migrate. Exiting.');
      return;
    }
    
    // Begin PostgreSQL transaction
    await pgClient.query('BEGIN');
    
    // Process notifications in batches
    const batchSize = 100;
    let processed = 0;
    
    // Use cursor for efficient processing of large collections
    const cursor = notificationsCollection.find();
    
    let batch = [];
    let doc = await cursor.next();
    
    while (doc) {
      // Transform notification document
      const transformedNotification = await transformNotification(db, doc);
      batch.push(transformedNotification);
      
      // Process batch when it reaches batch size
      if (batch.length >= batchSize) {
        await processBatch(pgClient, batch);
        processed += batch.length;
        console.log(`Processed ${processed}/${count} notifications`);
        batch = [];
      }
      
      // Get next document
      doc = await cursor.next();
    }
    
    // Process remaining notifications
    if (batch.length > 0) {
      await processBatch(pgClient, batch);
      processed += batch.length;
      console.log(`Processed ${processed}/${count} notifications`);
    }
    
    // Commit transaction
    await pgClient.query('COMMIT');
    
    console.log('Notifications migration completed successfully');
    
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

// Function to transform MongoDB notification to PostgreSQL format
async function transformNotification(db, doc) {
  // Extract MongoDB _id as string
  const id = doc._id.toString();
  
  // Handle dates
  const createdAt = doc.createdAt instanceof Date ? doc.createdAt : 
                   (doc.createdAt ? new Date(doc.createdAt) : null);
  
  const updatedAt = doc.updatedAt instanceof Date ? doc.updatedAt : 
                   (doc.updatedAt ? new Date(doc.updatedAt) : null);
  
  // Handle user reference
  const userId = doc.user ? doc.user.toString() : null;
  
  // Get activity information if available
  let type = 'notification';
  let message = 'System notification';
  
  if (doc.activity) {
    try {
      const activityId = doc.activity.toString();
      const activity = await db.collection('activities').findOne({ _id: doc.activity });
      
      if (activity) {
        type = activity.activity || 'notification';
        message = activity.resource ? 
          (activity.resourceId ? `${activity.resource} ${activity.resourceId}` : activity.resource) : 
          'System notification';
      }
    } catch (error) {
      console.warn(`Could not find activity ${doc.activity} for notification ${id}`);
    }
  }
  
  // Handle metadata (any other fields)
  const metadata = {
    activity: doc.activity ? doc.activity.toString() : null,
    archived: doc.archived,
    __v: doc.__v
  };
  
  // Transform notification document
  return {
    id,
    user_id: userId,
    type,
    message,
    read: doc.read || false,
    metadata: JSON.stringify(metadata),
    created_at: createdAt,
    updated_at: updatedAt
  };
}

// Process a batch of notifications
async function processBatch(pgClient, batch) {
  for (const notification of batch) {
    await insertNotificationIntoPostgres(pgClient, notification);
  }
}

// Function to insert notification into PostgreSQL
async function insertNotificationIntoPostgres(pgClient, notification) {
  try {
    // Check if user_id exists in users table if it's not null
    if (notification.user_id) {
      const userExists = await checkRecordExists(pgClient, 'users', notification.user_id);
      if (!userExists) {
        console.warn(`User ${notification.user_id} does not exist in PostgreSQL. Setting user_id to NULL for notification ${notification.id}.`);
        notification.user_id = null;
      }
    }
    
    const query = `
      INSERT INTO notifications (
        id, user_id, type, message, read, metadata, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (id) DO UPDATE SET
        user_id = $2,
        type = $3,
        message = $4,
        read = $5,
        metadata = $6,
        updated_at = $8
    `;
    
    const values = [
      notification.id,
      notification.user_id,
      notification.type,
      notification.message,
      notification.read,
      notification.metadata,
      notification.created_at,
      notification.updated_at
    ];
    
    await pgClient.query(query, values);
  } catch (error) {
    console.error(`Error inserting notification ${notification.id}:`, error);
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
migrateNotificationsOnly()
  .then(() => console.log('Notifications migration script completed'))
  .catch(err => console.error('Notifications migration script failed:', err));
