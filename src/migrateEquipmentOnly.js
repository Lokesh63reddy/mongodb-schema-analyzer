/**
 * Script to migrate only equipment table data from MongoDB to PostgreSQL
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

// Main function to migrate equipment
async function migrateEquipmentOnly() {
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
    
    // Get equipment collection
    const equipmentCollection = db.collection('equipment');
    
    // Count equipment
    const count = await equipmentCollection.countDocuments();
    console.log(`Found ${count} equipment items in MongoDB`);
    
    if (count === 0) {
      console.log('No equipment to migrate. Exiting.');
      return;
    }
    
    // Begin PostgreSQL transaction
    await pgClient.query('BEGIN');
    
    // Process equipment in batches
    const batchSize = 50;
    let processed = 0;
    
    // Use cursor for efficient processing of large collections
    const cursor = equipmentCollection.find();
    
    let batch = [];
    let doc = await cursor.next();
    
    while (doc) {
      // Transform equipment document
      const transformedEquipment = transformEquipment(doc);
      batch.push(transformedEquipment);
      
      // Process batch when it reaches batch size
      if (batch.length >= batchSize) {
        await processBatch(pgClient, batch);
        processed += batch.length;
        console.log(`Processed ${processed}/${count} equipment items`);
        batch = [];
      }
      
      // Get next document
      doc = await cursor.next();
    }
    
    // Process remaining equipment
    if (batch.length > 0) {
      await processBatch(pgClient, batch);
      processed += batch.length;
      console.log(`Processed ${processed}/${count} equipment items`);
    }
    
    // Commit transaction
    await pgClient.query('COMMIT');
    
    console.log('Equipment migration completed successfully');
    
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

// Function to transform MongoDB equipment to PostgreSQL format
function transformEquipment(doc) {
  // Extract MongoDB _id as string
  const id = doc._id.toString();
  
  // Handle dates
  const createdAt = doc.createdAt instanceof Date ? doc.createdAt : 
                   (doc.createdAt ? new Date(doc.createdAt) : null);
  
  const updatedAt = doc.updatedAt instanceof Date ? doc.updatedAt : 
                   (doc.updatedAt ? new Date(doc.updatedAt) : null);
  
  // Handle references
  const typeId = doc.type ? doc.type.toString() : null;
  const locationId = doc.location ? doc.location.toString() : null;
  
  // Handle arrays
  const design = doc.design ? JSON.stringify(doc.design) : null;
  const info = doc.info ? JSON.stringify(doc.info) : null;
  
  // Transform equipment document
  return {
    id,
    type_id: typeId,
    location_id: locationId,
    completion: doc.completion || null,
    archived: doc.archived || false,
    design,
    info,
    created_at: createdAt,
    updated_at: updatedAt
  };
}

// Process a batch of equipment
async function processBatch(pgClient, batch) {
  for (const equipment of batch) {
    await insertEquipmentIntoPostgres(pgClient, equipment);
  }
}

// Function to insert equipment into PostgreSQL
async function insertEquipmentIntoPostgres(pgClient, equipment) {
  try {
    // Check if type_id exists in equipment_types table if it's not null
    if (equipment.type_id) {
      const typeExists = await checkRecordExists(pgClient, 'equipment_types', equipment.type_id);
      if (!typeExists) {
        console.warn(`Equipment type ${equipment.type_id} does not exist in PostgreSQL. Setting type_id to NULL for equipment ${equipment.id}.`);
        equipment.type_id = null;
      }
    }
    
    // Check if location_id exists in locations table if it's not null
    if (equipment.location_id) {
      const locationExists = await checkRecordExists(pgClient, 'locations', equipment.location_id);
      if (!locationExists) {
        console.warn(`Location ${equipment.location_id} does not exist in PostgreSQL. Setting location_id to NULL for equipment ${equipment.id}.`);
        equipment.location_id = null;
      }
    }
    
    const query = `
      INSERT INTO equipment (
        id, type_id, location_id, completion, archived, design, info, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (id) DO UPDATE SET
        type_id = $2,
        location_id = $3,
        completion = $4,
        archived = $5,
        design = $6,
        info = $7,
        updated_at = $9
    `;
    
    const values = [
      equipment.id,
      equipment.type_id,
      equipment.location_id,
      equipment.completion,
      equipment.archived,
      equipment.design,
      equipment.info,
      equipment.created_at,
      equipment.updated_at
    ];
    
    await pgClient.query(query, values);
  } catch (error) {
    console.error(`Error inserting equipment ${equipment.id}:`, error);
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
migrateEquipmentOnly()
  .then(() => console.log('Equipment migration script completed'))
  .catch(err => console.error('Equipment migration script failed:', err));
