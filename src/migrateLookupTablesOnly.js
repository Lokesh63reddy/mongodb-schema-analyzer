/**
 * Script to migrate only lookup_tables table data from MongoDB to PostgreSQL
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

// Main function to migrate lookup tables
async function migrateLookupTablesOnly() {
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

    // Get lookuptables collection
    const lookupTablesCollection = db.collection('lookuptables');

    // Count lookup tables
    const count = await lookupTablesCollection.countDocuments();
    console.log(`Found ${count} lookup tables in MongoDB`);

    if (count === 0) {
      console.log('No lookup tables to migrate. Exiting.');
      return;
    }

    // Begin PostgreSQL transaction
    await pgClient.query('BEGIN');

    // Process lookup tables in batches
    const batchSize = 5;
    let processed = 0;

    // Use cursor for efficient processing of large collections
    const cursor = lookupTablesCollection.find();

    let batch = [];
    let doc = await cursor.next();

    while (doc) {
      // Transform lookup table document
      const transformedLookupTable = transformLookupTable(doc);
      batch.push(transformedLookupTable);

      // Process batch when it reaches batch size
      if (batch.length >= batchSize) {
        await processBatch(pgClient, batch);
        processed += batch.length;
        console.log(`Processed ${processed}/${count} lookup tables`);
        batch = [];
      }

      // Get next document
      doc = await cursor.next();
    }

    // Process remaining lookup tables
    if (batch.length > 0) {
      await processBatch(pgClient, batch);
      processed += batch.length;
      console.log(`Processed ${processed}/${count} lookup tables`);
    }

    // Commit transaction
    await pgClient.query('COMMIT');

    console.log('Lookup tables migration completed successfully');

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

// Function to transform MongoDB lookup table to PostgreSQL format
function transformLookupTable(doc) {
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
        console.warn(`Invalid createdAt date for lookup table ${id}, using current date instead`);
        createdAt = new Date();
      }
    } catch (error) {
      console.warn(`Error parsing createdAt date for lookup table ${id}, using current date instead:`, error.message);
      createdAt = new Date();
    }
  } else {
    console.warn(`No createdAt date for lookup table ${id}, using current date`);
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
        console.warn(`Invalid updatedAt date for lookup table ${id}, using current date instead`);
        updatedAt = new Date();
      }
    } catch (error) {
      console.warn(`Error parsing updatedAt date for lookup table ${id}, using current date instead:`, error.message);
      updatedAt = new Date();
    }
  } else {
    console.warn(`No updatedAt date for lookup table ${id}, using current date`);
    updatedAt = new Date();
  }

  // Extract name
  const name = doc.name || '';

  // Create description from columns if available
  const description = doc.columns ? `Columns: ${doc.columns.join(', ')}` : '';

  // Combine all data into a data object
  const data = {
    columns: doc.columns || [],
    data: doc.data || [],
    __v: doc.__v
  };

  // Transform lookup table document
  return {
    id,
    name,
    description,
    data: JSON.stringify(data),
    created_at: createdAt,
    updated_at: updatedAt
  };
}

// Process a batch of lookup tables
async function processBatch(pgClient, batch) {
  for (const lookupTable of batch) {
    await insertLookupTableIntoPostgres(pgClient, lookupTable);
  }
}

// Function to insert lookup table into PostgreSQL
async function insertLookupTableIntoPostgres(pgClient, lookupTable) {
  try {
    const query = `
      INSERT INTO lookup_tables (
        id, name, description, data, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (id) DO UPDATE SET
        name = $2,
        description = $3,
        data = $4,
        updated_at = $6
    `;

    const values = [
      lookupTable.id,
      lookupTable.name,
      lookupTable.description,
      lookupTable.data,
      lookupTable.created_at,
      lookupTable.updated_at
    ];

    await pgClient.query(query, values);
  } catch (error) {
    console.error(`Error inserting lookup table ${lookupTable.id}:`, error);
    throw error;
  }
}

// Run the migration
migrateLookupTablesOnly()
  .then(() => console.log('Lookup tables migration script completed'))
  .catch(err => console.error('Lookup tables migration script failed:', err));
