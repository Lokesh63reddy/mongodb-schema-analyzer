/**
 * Script to migrate users from MongoDB to PostgreSQL
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

// Main function to migrate users
async function migrateUsers() {
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
    
    // Get users collection
    const usersCollection = db.collection('users');
    
    // Count users
    const count = await usersCollection.countDocuments();
    console.log(`Found ${count} users in MongoDB`);
    
    if (count === 0) {
      console.log('No users to migrate. Exiting.');
      return;
    }
    
    // Begin PostgreSQL transaction
    await pgClient.query('BEGIN');
    
    // Process users in batches
    const batchSize = 100;
    let processed = 0;
    
    // Use cursor for efficient processing of large collections
    const cursor = usersCollection.find();
    
    let batch = [];
    let doc = await cursor.next();
    
    while (doc) {
      // Transform user document
      const transformedUser = transformUser(doc);
      batch.push(transformedUser);
      
      // Process batch when it reaches batch size
      if (batch.length >= batchSize) {
        await processBatch(pgClient, batch);
        processed += batch.length;
        console.log(`Processed ${processed}/${count} users`);
        batch = [];
      }
      
      // Get next document
      doc = await cursor.next();
    }
    
    // Process remaining users
    if (batch.length > 0) {
      await processBatch(pgClient, batch);
      processed += batch.length;
      console.log(`Processed ${processed}/${count} users`);
    }
    
    // Commit transaction
    await pgClient.query('COMMIT');
    
    console.log('Users migration completed successfully');
    
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

// Function to transform MongoDB user to PostgreSQL format
function transformUser(doc) {
  // Extract MongoDB _id as string
  const id = doc._id.toString();
  
  // Handle dates
  const createdAt = doc.createdAt instanceof Date ? doc.createdAt : 
                   (doc.createdAt ? new Date(doc.createdAt) : null);
  
  const updatedAt = doc.updatedAt instanceof Date ? doc.updatedAt : 
                   (doc.updatedAt ? new Date(doc.updatedAt) : null);
  
  // Handle group reference
  const groupId = doc.group ? doc.group.toString() : null;
  
  // Transform user document
  return {
    id,
    name: doc.name || '',
    email: doc.email || '',
    password: doc.password || '',
    group_id: groupId,
    timezone: doc.timezone || null,
    privacy: doc.privacy || null,
    terms_and_conditions: doc.termsAndConditions || null,
    archived: doc.archived || false,
    preferences: doc.preferences ? JSON.stringify(doc.preferences) : null,
    access: doc.access ? JSON.stringify(doc.access) : null,
    log_access: doc.logAccess ? JSON.stringify(doc.logAccess) : null,
    last_login: doc.lastLogin ? JSON.stringify(doc.lastLogin) : null,
    recovery: doc.recovery || null,
    created_at: createdAt,
    updated_at: updatedAt
  };
}

// Process a batch of users
async function processBatch(pgClient, batch) {
  for (const user of batch) {
    await insertUserIntoPostgres(pgClient, user);
  }
}

// Function to insert user into PostgreSQL
async function insertUserIntoPostgres(pgClient, user) {
  try {
    const query = `
      INSERT INTO users (
        id, name, email, password, group_id, timezone, privacy, 
        terms_and_conditions, archived, preferences, access, 
        log_access, last_login, recovery, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      ON CONFLICT (id) DO UPDATE SET
        name = $2,
        email = $3,
        password = $4,
        group_id = $5,
        timezone = $6,
        privacy = $7,
        terms_and_conditions = $8,
        archived = $9,
        preferences = $10,
        access = $11,
        log_access = $12,
        last_login = $13,
        recovery = $14,
        updated_at = $16
    `;
    
    const values = [
      user.id,
      user.name,
      user.email,
      user.password,
      user.group_id,
      user.timezone,
      user.privacy,
      user.terms_and_conditions,
      user.archived,
      user.preferences,
      user.access,
      user.log_access,
      user.last_login,
      user.recovery,
      user.created_at,
      user.updated_at
    ];
    
    await pgClient.query(query, values);
  } catch (error) {
    // Handle unique constraint violations
    if (error.code === '23505' && error.constraint === 'users_email_key') {
      console.warn(`Skipping user with duplicate email: ${user.email}`);
    } else {
      console.error(`Error inserting user ${user.id}:`, error);
      throw error;
    }
  }
}

// Run the migration
migrateUsers()
  .then(() => console.log('Users migration script completed'))
  .catch(err => console.error('Users migration script failed:', err));
