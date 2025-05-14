/**
 * Script to migrate only betawaitlists table data from MongoDB to PostgreSQL
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

// Main function to migrate beta waitlists
async function migrateBetaWaitlistsOnly() {
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
    
    // Get betawaitlists collection
    const betaWaitlistsCollection = db.collection('betawaitlists');
    
    // Count beta waitlists
    const count = await betaWaitlistsCollection.countDocuments();
    console.log(`Found ${count} beta waitlists in MongoDB`);
    
    if (count === 0) {
      console.log('No beta waitlists to migrate. Exiting.');
      return;
    }
    
    // Begin PostgreSQL transaction
    await pgClient.query('BEGIN');
    
    // Process beta waitlists in batches
    const batchSize = 10;
    let processed = 0;
    
    // Use cursor for efficient processing of large collections
    const cursor = betaWaitlistsCollection.find();
    
    let batch = [];
    let doc = await cursor.next();
    
    while (doc) {
      // Transform beta waitlist document
      const transformedBetaWaitlist = transformBetaWaitlist(doc);
      batch.push(transformedBetaWaitlist);
      
      // Process batch when it reaches batch size
      if (batch.length >= batchSize) {
        await processBatch(pgClient, batch);
        processed += batch.length;
        console.log(`Processed ${processed}/${count} beta waitlists`);
        batch = [];
      }
      
      // Get next document
      doc = await cursor.next();
    }
    
    // Process remaining beta waitlists
    if (batch.length > 0) {
      await processBatch(pgClient, batch);
      processed += batch.length;
      console.log(`Processed ${processed}/${count} beta waitlists`);
    }
    
    // Commit transaction
    await pgClient.query('COMMIT');
    
    console.log('Beta waitlists migration completed successfully');
    
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

// Function to transform MongoDB beta waitlist to PostgreSQL format
function transformBetaWaitlist(doc) {
  // Extract MongoDB _id as string
  const id = doc._id.toString();
  
  // Extract email
  const email = doc.email || '';
  
  // Create metadata object from name and other fields
  const metadata = {
    name: doc.name || '',
    __v: doc.__v
  };
  
  // Set default timestamps if not present
  const createdAt = new Date();
  const updatedAt = new Date();
  
  // Transform beta waitlist document
  return {
    id,
    email,
    metadata: JSON.stringify(metadata),
    created_at: createdAt,
    updated_at: updatedAt
  };
}

// Process a batch of beta waitlists
async function processBatch(pgClient, batch) {
  for (const betaWaitlist of batch) {
    await insertBetaWaitlistIntoPostgres(pgClient, betaWaitlist);
  }
}

// Function to insert beta waitlist into PostgreSQL
async function insertBetaWaitlistIntoPostgres(pgClient, betaWaitlist) {
  try {
    const query = `
      INSERT INTO betawaitlists (
        id, email, metadata, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (id) DO UPDATE SET
        email = $2,
        metadata = $3,
        updated_at = $5
    `;
    
    const values = [
      betaWaitlist.id,
      betaWaitlist.email,
      betaWaitlist.metadata,
      betaWaitlist.created_at,
      betaWaitlist.updated_at
    ];
    
    await pgClient.query(query, values);
  } catch (error) {
    console.error(`Error inserting beta waitlist ${betaWaitlist.id}:`, error);
    throw error;
  }
}

// Run the migration
migrateBetaWaitlistsOnly()
  .then(() => console.log('Beta waitlists migration script completed'))
  .catch(err => console.error('Beta waitlists migration script failed:', err));
