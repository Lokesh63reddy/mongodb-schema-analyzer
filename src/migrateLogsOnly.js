/**
 * Script to migrate only logs table data from MongoDB to PostgreSQL
 * Note: The logs collection in MongoDB is quite different from the logs table in PostgreSQL.
 * This script adapts the data as needed.
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

// Main function to migrate logs
async function migrateLogsOnly() {
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
    
    // Begin PostgreSQL transaction
    await pgClient.query('BEGIN');
    
    // Migrate logs from logs collection
    console.log('Migrating logs from logs collection...');
    const logsCount = await migrateLogsCollection(db, pgClient);
    
    // Migrate logs from audits collection (which is more similar to the logs table in PostgreSQL)
    console.log('Migrating logs from audits collection...');
    const auditsCount = await migrateAuditsCollection(db, pgClient);
    
    // Commit transaction
    await pgClient.query('COMMIT');
    
    console.log(`Successfully migrated ${logsCount + auditsCount} logs`);
    
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

// Function to migrate logs from logs collection
async function migrateLogsCollection(db, pgClient) {
  const logsCollection = db.collection('logs');
  
  // Count logs
  const count = await logsCollection.countDocuments();
  console.log(`Found ${count} logs in MongoDB logs collection`);
  
  if (count === 0) {
    return 0;
  }
  
  // Process logs in batches
  const batchSize = 100;
  let processed = 0;
  
  // Use cursor for efficient processing of large collections
  const cursor = logsCollection.find();
  
  let batch = [];
  let doc = await cursor.next();
  
  while (doc) {
    // Transform log document
    const transformedLog = transformLogFromLogsCollection(doc);
    batch.push(transformedLog);
    
    // Process batch when it reaches batch size
    if (batch.length >= batchSize) {
      await processBatch(pgClient, batch);
      processed += batch.length;
      console.log(`Processed ${processed}/${count} logs from logs collection`);
      batch = [];
    }
    
    // Get next document
    doc = await cursor.next();
  }
  
  // Process remaining logs
  if (batch.length > 0) {
    await processBatch(pgClient, batch);
    processed += batch.length;
    console.log(`Processed ${processed}/${count} logs from logs collection`);
  }
  
  return processed;
}

// Function to migrate logs from audits collection
async function migrateAuditsCollection(db, pgClient) {
  const auditsCollection = db.collection('audits');
  
  // Count audits
  const count = await auditsCollection.countDocuments();
  console.log(`Found ${count} audits in MongoDB audits collection`);
  
  if (count === 0) {
    return 0;
  }
  
  // Process audits in batches
  const batchSize = 100;
  let processed = 0;
  
  // Use cursor for efficient processing of large collections
  const cursor = auditsCollection.find();
  
  let batch = [];
  let doc = await cursor.next();
  
  while (doc) {
    // Transform audit document to log format
    const transformedLog = transformLogFromAuditsCollection(doc);
    batch.push(transformedLog);
    
    // Process batch when it reaches batch size
    if (batch.length >= batchSize) {
      await processBatch(pgClient, batch);
      processed += batch.length;
      console.log(`Processed ${processed}/${count} logs from audits collection`);
      batch = [];
    }
    
    // Get next document
    doc = await cursor.next();
  }
  
  // Process remaining audits
  if (batch.length > 0) {
    await processBatch(pgClient, batch);
    processed += batch.length;
    console.log(`Processed ${processed}/${count} logs from audits collection`);
  }
  
  return processed;
}

// Function to transform MongoDB log from logs collection to PostgreSQL format
function transformLogFromLogsCollection(doc) {
  // Extract MongoDB _id as string
  const id = doc._id.toString();
  
  // Handle user reference
  const userId = doc.technician && doc.technician._id ? doc.technician._id.toString() : null;
  
  // Extract action
  const action = doc.action || 'LOG';
  
  // Extract entity type and ID
  const entityType = 'equipment';
  const entityId = doc.equipment ? doc.equipment.toString() : null;
  
  // Combine all other data into a details object
  const details = {
    customer: doc.customer,
    location: doc.location,
    workOrder: doc.workOrder,
    conclusion: doc.conclusion,
    completion: doc.completion,
    archived: doc.archived,
    locked: doc.locked,
    log: doc.log,
    checklist: doc.checklist,
    calculations: doc.calculations,
    costAnalyses: doc.costAnalyses,
    verified: doc.verified,
    technician: doc.technician ? {
      name: doc.technician.name,
      username: doc.technician.username,
      email: doc.technician.email,
      role: doc.technician.role
    } : null
  };
  
  // Handle dates
  const createdAt = doc.createdAt instanceof Date ? doc.createdAt : 
                   (doc.createdAt ? new Date(doc.createdAt) : new Date());
  
  // Transform log document
  return {
    id,
    user_id: userId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    details: JSON.stringify(details),
    created_at: createdAt
  };
}

// Function to transform MongoDB audit to PostgreSQL log format
function transformLogFromAuditsCollection(doc) {
  // Extract MongoDB _id as string
  const id = doc._id.toString();
  
  // Handle user reference
  const userId = doc.user ? doc.user.toString() : null;
  
  // Extract action
  const action = doc.action || 'AUDIT';
  
  // Extract entity type and ID
  const entityType = doc.resource || 'system';
  const entityId = doc.resourceID && doc.resourceID !== 'none' ? doc.resourceID : null;
  
  // Combine all other data into a details object
  const details = {
    description: doc.description,
    level: doc.level,
    occurred: doc.occurred,
    __v: doc.__v
  };
  
  // Handle dates
  const createdAt = doc.occurred instanceof Date ? doc.occurred : 
                   (doc.occurred ? new Date(doc.occurred) : new Date());
  
  // Transform audit document to log format
  return {
    id,
    user_id: userId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    details: JSON.stringify(details),
    created_at: createdAt
  };
}

// Process a batch of logs
async function processBatch(pgClient, batch) {
  for (const log of batch) {
    await insertLogIntoPostgres(pgClient, log);
  }
}

// Function to insert log into PostgreSQL
async function insertLogIntoPostgres(pgClient, log) {
  try {
    // Check if user_id exists in users table if it's not null
    if (log.user_id) {
      const userExists = await checkRecordExists(pgClient, 'users', log.user_id);
      if (!userExists) {
        console.warn(`User ${log.user_id} does not exist in PostgreSQL. Setting user_id to NULL for log ${log.id}.`);
        log.user_id = null;
      }
    }
    
    const query = `
      INSERT INTO logs (
        id, user_id, action, entity_type, entity_id, details, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (id) DO NOTHING
    `;
    
    const values = [
      log.id,
      log.user_id,
      log.action,
      log.entity_type,
      log.entity_id,
      log.details,
      log.created_at
    ];
    
    await pgClient.query(query, values);
  } catch (error) {
    console.error(`Error inserting log ${log.id}:`, error);
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
migrateLogsOnly()
  .then(() => console.log('Logs migration script completed'))
  .catch(err => console.error('Logs migration script failed:', err));
