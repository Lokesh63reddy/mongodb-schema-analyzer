/**
 * Script to migrate only alerts table data from MongoDB to PostgreSQL
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

// Main function to migrate alerts
async function migrateAlertsOnly() {
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
    
    // Get alerts collection
    const alertsCollection = db.collection('alerts');
    
    // Count alerts
    const count = await alertsCollection.countDocuments();
    console.log(`Found ${count} alerts in MongoDB`);
    
    if (count === 0) {
      console.log('No alerts to migrate. Exiting.');
      return;
    }
    
    // Begin PostgreSQL transaction
    await pgClient.query('BEGIN');
    
    // Process alerts in batches
    const batchSize = 10;
    let processed = 0;
    
    // Use cursor for efficient processing of large collections
    const cursor = alertsCollection.find();
    
    let batch = [];
    let doc = await cursor.next();
    
    while (doc) {
      // Transform alert document
      const transformedAlert = transformAlert(doc);
      batch.push(transformedAlert);
      
      // Process batch when it reaches batch size
      if (batch.length >= batchSize) {
        await processBatch(pgClient, batch);
        processed += batch.length;
        console.log(`Processed ${processed}/${count} alerts`);
        batch = [];
      }
      
      // Get next document
      doc = await cursor.next();
    }
    
    // Process remaining alerts
    if (batch.length > 0) {
      await processBatch(pgClient, batch);
      processed += batch.length;
      console.log(`Processed ${processed}/${count} alerts`);
    }
    
    // Commit transaction
    await pgClient.query('COMMIT');
    
    console.log('Alerts migration completed successfully');
    
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

// Function to transform MongoDB alert to PostgreSQL format
function transformAlert(doc) {
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
        console.warn(`Invalid createdAt date for alert ${id}, using current date instead`);
        createdAt = new Date();
      }
    } catch (error) {
      console.warn(`Error parsing createdAt date for alert ${id}, using current date instead:`, error.message);
      createdAt = new Date();
    }
  } else {
    console.warn(`No createdAt date for alert ${id}, using current date`);
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
        console.warn(`Invalid updatedAt date for alert ${id}, using current date instead`);
        updatedAt = new Date();
      }
    } catch (error) {
      console.warn(`Error parsing updatedAt date for alert ${id}, using current date instead:`, error.message);
      updatedAt = new Date();
    }
  } else {
    console.warn(`No updatedAt date for alert ${id}, using current date`);
    updatedAt = new Date();
  }
  
  // Extract title (using type as title if available)
  const title = doc.type || 'Alert';
  
  // Extract message (using first comment message if available)
  let message = '';
  if (doc.data && doc.data.comments && doc.data.comments.length > 0) {
    message = doc.data.comments[0].message || '';
  }
  
  // Extract type
  const type = doc.type || '';
  
  // Extract level (using status value if available)
  let level = '';
  if (doc.data && doc.data.status && doc.data.status.length > 0) {
    level = doc.data.status[0].value || '';
  }
  
  // Extract user_id
  const userId = doc.by ? doc.by.toString() : null;
  
  // Create metadata object from data and other fields
  const metadata = {
    data: doc.data || {},
    __v: doc.__v
  };
  
  // Transform alert document
  return {
    id,
    title,
    message,
    type,
    level,
    user_id: userId,
    metadata: JSON.stringify(metadata),
    created_at: createdAt,
    updated_at: updatedAt
  };
}

// Process a batch of alerts
async function processBatch(pgClient, batch) {
  for (const alert of batch) {
    await insertAlertIntoPostgres(pgClient, alert);
  }
}

// Function to insert alert into PostgreSQL
async function insertAlertIntoPostgres(pgClient, alert) {
  try {
    // Check if user_id exists in users table if it's not null
    if (alert.user_id) {
      const userExists = await checkRecordExists(pgClient, 'users', alert.user_id);
      if (!userExists) {
        console.warn(`User ${alert.user_id} does not exist in PostgreSQL. Setting user_id to NULL for alert ${alert.id}.`);
        alert.user_id = null;
      }
    }
    
    const query = `
      INSERT INTO alerts (
        id, title, message, type, level, user_id, metadata, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (id) DO UPDATE SET
        title = $2,
        message = $3,
        type = $4,
        level = $5,
        user_id = $6,
        metadata = $7,
        updated_at = $9
    `;
    
    const values = [
      alert.id,
      alert.title,
      alert.message,
      alert.type,
      alert.level,
      alert.user_id,
      alert.metadata,
      alert.created_at,
      alert.updated_at
    ];
    
    await pgClient.query(query, values);
  } catch (error) {
    console.error(`Error inserting alert ${alert.id}:`, error);
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
migrateAlertsOnly()
  .then(() => console.log('Alerts migration script completed'))
  .catch(err => console.error('Alerts migration script failed:', err));
