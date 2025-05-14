/**
 * Script to migrate only plans table data from MongoDB to PostgreSQL
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

// Main function to migrate plans
async function migratePlansOnly() {
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
    
    // Get plans collection
    const plansCollection = db.collection('plans');
    
    // Count plans
    const count = await plansCollection.countDocuments();
    console.log(`Found ${count} plans in MongoDB`);
    
    if (count === 0) {
      console.log('No plans to migrate. Exiting.');
      return;
    }
    
    // Begin PostgreSQL transaction
    await pgClient.query('BEGIN');
    
    // Process plans in batches
    const batchSize = 10;
    let processed = 0;
    
    // Use cursor for efficient processing of large collections
    const cursor = plansCollection.find();
    
    let batch = [];
    let doc = await cursor.next();
    
    while (doc) {
      // Transform plan document
      const transformedPlan = transformPlan(doc);
      batch.push(transformedPlan);
      
      // Process batch when it reaches batch size
      if (batch.length >= batchSize) {
        await processBatch(pgClient, batch);
        processed += batch.length;
        console.log(`Processed ${processed}/${count} plans`);
        batch = [];
      }
      
      // Get next document
      doc = await cursor.next();
    }
    
    // Process remaining plans
    if (batch.length > 0) {
      await processBatch(pgClient, batch);
      processed += batch.length;
      console.log(`Processed ${processed}/${count} plans`);
    }
    
    // Commit transaction
    await pgClient.query('COMMIT');
    
    console.log('Plans migration completed successfully');
    
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

// Function to transform MongoDB plan to PostgreSQL format
function transformPlan(doc) {
  // Extract MongoDB _id as string
  const id = doc._id.toString();
  
  // Extract name
  const name = doc.name || '';
  
  // Extract description
  const description = doc.description || '';
  
  // Extract features (permissions array in MongoDB)
  const features = JSON.stringify(doc.permissions || []);
  
  // Set price (not present in MongoDB, using 0 as default)
  const price = 0;
  
  // Set default timestamps if not present
  const createdAt = new Date();
  const updatedAt = new Date();
  
  // Transform plan document
  return {
    id,
    name,
    description,
    features,
    price,
    created_at: createdAt,
    updated_at: updatedAt
  };
}

// Process a batch of plans
async function processBatch(pgClient, batch) {
  for (const plan of batch) {
    await insertPlanIntoPostgres(pgClient, plan);
  }
}

// Function to insert plan into PostgreSQL
async function insertPlanIntoPostgres(pgClient, plan) {
  try {
    const query = `
      INSERT INTO plans (
        id, name, description, features, price, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (id) DO UPDATE SET
        name = $2,
        description = $3,
        features = $4,
        price = $5,
        updated_at = $7
    `;
    
    const values = [
      plan.id,
      plan.name,
      plan.description,
      plan.features,
      plan.price,
      plan.created_at,
      plan.updated_at
    ];
    
    await pgClient.query(query, values);
  } catch (error) {
    console.error(`Error inserting plan ${plan.id}:`, error);
    throw error;
  }
}

// Run the migration
migratePlansOnly()
  .then(() => console.log('Plans migration script completed'))
  .catch(err => console.error('Plans migration script failed:', err));
