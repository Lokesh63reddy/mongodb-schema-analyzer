/**
 * Script to migrate only audits table data from MongoDB to PostgreSQL
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

// Main function to migrate audits
async function migrateAuditsOnly() {
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
    
    // Get audits collection
    const auditsCollection = db.collection('audits');
    
    // Count audits
    const count = await auditsCollection.countDocuments();
    console.log(`Found ${count} audits in MongoDB`);
    
    if (count === 0) {
      console.log('No audits to migrate. Exiting.');
      return;
    }
    
    // Begin PostgreSQL transaction
    await pgClient.query('BEGIN');
    
    // Process audits in batches
    const batchSize = 100;
    let processed = 0;
    
    // Use cursor for efficient processing of large collections
    const cursor = auditsCollection.find();
    
    let batch = [];
    let doc = await cursor.next();
    
    while (doc) {
      // Transform audit document
      const transformedAudit = transformAudit(doc);
      batch.push(transformedAudit);
      
      // Process batch when it reaches batch size
      if (batch.length >= batchSize) {
        await processBatch(pgClient, batch);
        processed += batch.length;
        console.log(`Processed ${processed}/${count} audits`);
        batch = [];
      }
      
      // Get next document
      doc = await cursor.next();
    }
    
    // Process remaining audits
    if (batch.length > 0) {
      await processBatch(pgClient, batch);
      processed += batch.length;
      console.log(`Processed ${processed}/${count} audits`);
    }
    
    // Commit transaction
    await pgClient.query('COMMIT');
    
    console.log('Audits migration completed successfully');
    
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

// Function to transform MongoDB audit to PostgreSQL format
function transformAudit(doc) {
  // Extract MongoDB _id as string
  const id = doc._id.toString();
  
  // Handle dates
  const createdAt = doc.createdAt instanceof Date ? doc.createdAt : 
                   (doc.createdAt ? new Date(doc.createdAt) : null);
  
  const updatedAt = doc.updatedAt instanceof Date ? doc.updatedAt : 
                   (doc.updatedAt ? new Date(doc.updatedAt) : null);
  
  // Handle references
  const equipmentId = doc.equipment ? doc.equipment.toString() : null;
  const userId = doc.user ? doc.user.toString() : null;
  
  // Combine all data into a single JSON object
  const data = {
    action: doc.action,
    description: doc.description,
    resource: doc.resource,
    resourceID: doc.resourceID,
    level: doc.level,
    occurred: doc.occurred,
    __v: doc.__v
  };
  
  // Transform audit document
  return {
    id,
    equipment_id: equipmentId,
    user_id: userId,
    data: JSON.stringify(data),
    created_at: createdAt,
    updated_at: updatedAt
  };
}

// Process a batch of audits
async function processBatch(pgClient, batch) {
  for (const audit of batch) {
    await insertAuditIntoPostgres(pgClient, audit);
  }
}

// Function to insert audit into PostgreSQL
async function insertAuditIntoPostgres(pgClient, audit) {
  try {
    // Check if equipment_id exists in equipment table if it's not null
    if (audit.equipment_id) {
      const equipmentExists = await checkRecordExists(pgClient, 'equipment', audit.equipment_id);
      if (!equipmentExists) {
        console.warn(`Equipment ${audit.equipment_id} does not exist in PostgreSQL. Setting equipment_id to NULL for audit ${audit.id}.`);
        audit.equipment_id = null;
      }
    }
    
    // Check if user_id exists in users table if it's not null
    if (audit.user_id) {
      const userExists = await checkRecordExists(pgClient, 'users', audit.user_id);
      if (!userExists) {
        console.warn(`User ${audit.user_id} does not exist in PostgreSQL. Setting user_id to NULL for audit ${audit.id}.`);
        audit.user_id = null;
      }
    }
    
    const query = `
      INSERT INTO audits (
        id, equipment_id, user_id, data, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (id) DO UPDATE SET
        equipment_id = $2,
        user_id = $3,
        data = $4,
        updated_at = $6
    `;
    
    const values = [
      audit.id,
      audit.equipment_id,
      audit.user_id,
      audit.data,
      audit.created_at,
      audit.updated_at
    ];
    
    await pgClient.query(query, values);
  } catch (error) {
    console.error(`Error inserting audit ${audit.id}:`, error);
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
migrateAuditsOnly()
  .then(() => console.log('Audits migration script completed'))
  .catch(err => console.error('Audits migration script failed:', err));
