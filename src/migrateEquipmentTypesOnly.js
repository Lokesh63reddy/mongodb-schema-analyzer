/**
 * Script to migrate only equipment_types table data from MongoDB to PostgreSQL
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

// Main function to migrate equipment_types
async function migrateEquipmentTypesOnly() {
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
    
    // Get equipment_types collection
    const equipmentTypesCollection = db.collection('equipment_types');
    
    // Count equipment_types
    const count = await equipmentTypesCollection.countDocuments();
    console.log(`Found ${count} equipment types in MongoDB`);
    
    if (count === 0) {
      console.log('No equipment types to migrate. Exiting.');
      return;
    }
    
    // Begin PostgreSQL transaction
    await pgClient.query('BEGIN');
    
    // Process equipment_types in batches
    const batchSize = 50;
    let processed = 0;
    
    // Use cursor for efficient processing of large collections
    const cursor = equipmentTypesCollection.find();
    
    let batch = [];
    let doc = await cursor.next();
    
    while (doc) {
      // Transform equipment_type document
      const transformedEquipmentType = transformEquipmentType(doc);
      batch.push(transformedEquipmentType);
      
      // Process batch when it reaches batch size
      if (batch.length >= batchSize) {
        await processBatch(pgClient, batch);
        processed += batch.length;
        console.log(`Processed ${processed}/${count} equipment types`);
        batch = [];
      }
      
      // Get next document
      doc = await cursor.next();
    }
    
    // Process remaining equipment_types
    if (batch.length > 0) {
      await processBatch(pgClient, batch);
      processed += batch.length;
      console.log(`Processed ${processed}/${count} equipment types`);
    }
    
    // Commit transaction
    await pgClient.query('COMMIT');
    
    console.log('Equipment types migration completed successfully');
    
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

// Function to transform MongoDB equipment_type to PostgreSQL format
function transformEquipmentType(doc) {
  // Extract MongoDB _id as string
  const id = doc._id.toString();
  
  // Handle dates
  const createdAt = doc.createdAt instanceof Date ? doc.createdAt : 
                   (doc.createdAt ? new Date(doc.createdAt) : null);
  
  const updatedAt = doc.updatedAt instanceof Date ? doc.updatedAt : 
                   (doc.updatedAt ? new Date(doc.updatedAt) : null);
  
  // Transform equipment_type document
  return {
    id,
    name: doc.name || '',
    description: doc.description || null,
    archived: doc.archived || false,
    created_at: createdAt,
    updated_at: updatedAt
  };
}

// Process a batch of equipment_types
async function processBatch(pgClient, batch) {
  for (const equipmentType of batch) {
    await insertEquipmentTypeIntoPostgres(pgClient, equipmentType);
  }
}

// Function to insert equipment_type into PostgreSQL
async function insertEquipmentTypeIntoPostgres(pgClient, equipmentType) {
  try {
    const query = `
      INSERT INTO equipment_types (
        id, name, description, archived, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (id) DO UPDATE SET
        name = $2,
        description = $3,
        archived = $4,
        updated_at = $6
    `;
    
    const values = [
      equipmentType.id,
      equipmentType.name,
      equipmentType.description,
      equipmentType.archived,
      equipmentType.created_at,
      equipmentType.updated_at
    ];
    
    await pgClient.query(query, values);
  } catch (error) {
    console.error(`Error inserting equipment type ${equipmentType.id}:`, error);
    throw error;
  }
}

// Run the migration
migrateEquipmentTypesOnly()
  .then(() => console.log('Equipment types migration script completed'))
  .catch(err => console.error('Equipment types migration script failed:', err));
