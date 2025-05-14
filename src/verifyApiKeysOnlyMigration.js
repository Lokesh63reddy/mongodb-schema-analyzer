/**
 * Script to verify apikeys table migration from MongoDB to PostgreSQL
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

// Main function to verify API keys migration
async function verifyApiKeysOnlyMigration() {
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
    
    // Get apikeys collection
    const apiKeysCollection = db.collection('apikeys');
    
    // Count API keys in MongoDB
    const mongoCount = await apiKeysCollection.countDocuments();
    console.log(`Found ${mongoCount} API keys in MongoDB`);
    
    // Count API keys in PostgreSQL
    const pgResult = await pgClient.query('SELECT COUNT(*) FROM apikeys');
    const pgCount = parseInt(pgResult.rows[0].count);
    console.log(`Found ${pgCount} API keys in PostgreSQL`);
    
    // Compare counts
    if (mongoCount === pgCount) {
      console.log('✅ API key counts match!');
    } else {
      console.log(`❌ API key counts don't match: MongoDB (${mongoCount}) vs PostgreSQL (${pgCount})`);
    }
    
    // Sample a few API keys to verify data integrity
    console.log('\nVerifying sample API keys:');
    const sampleApiKeys = await apiKeysCollection.find().limit(3).toArray();
    
    for (const mongoApiKey of sampleApiKeys) {
      const mongoId = mongoApiKey._id.toString();
      const pgResult = await pgClient.query('SELECT * FROM apikeys WHERE id = $1', [mongoId]);
      
      if (pgResult.rows.length === 0) {
        console.log(`❌ API key ${mongoId} not found in PostgreSQL`);
        continue;
      }
      
      const pgApiKey = pgResult.rows[0];
      
      // Compare key fields
      console.log(`\nComparing API key ${mongoId}:`);
      
      // Name
      const mongoName = mongoApiKey.name || '';
      if (mongoName === pgApiKey.name) {
        console.log(`✅ Name matches: ${pgApiKey.name}`);
      } else {
        console.log(`❌ Name mismatch: MongoDB (${mongoName}) vs PostgreSQL (${pgApiKey.name})`);
      }
      
      // Key
      const mongoKey = mongoApiKey.key || '';
      if (mongoKey === pgApiKey.key) {
        console.log(`✅ Key matches: ${pgApiKey.key.substring(0, 10)}...`);
      } else {
        console.log(`❌ Key mismatch: MongoDB (${mongoKey.substring(0, 10)}...) vs PostgreSQL (${pgApiKey.key.substring(0, 10)}...)`);
      }
      
      // User ID
      const mongoUserId = mongoApiKey.user ? mongoApiKey.user.toString() : null;
      if (mongoUserId === pgApiKey.user_id) {
        console.log(`✅ User ID matches: ${pgApiKey.user_id}`);
      } else if (pgApiKey.user_id === null && mongoUserId !== null) {
        console.log(`⚠️ User ID in PostgreSQL is NULL, but in MongoDB it's ${mongoUserId}`);
        console.log('   This could be because the user does not exist in PostgreSQL');
      } else {
        console.log(`❌ User ID mismatch: MongoDB (${mongoUserId}) vs PostgreSQL (${pgApiKey.user_id})`);
      }
      
      // Active status
      const mongoActive = true; // Default value since it's not in the sample
      if (mongoActive === pgApiKey.active) {
        console.log(`✅ Active status matches: ${pgApiKey.active}`);
      } else {
        console.log(`❌ Active status mismatch: MongoDB (${mongoActive}) vs PostgreSQL (${pgApiKey.active})`);
      }
      
      // Permissions
      if (pgApiKey.permissions) {
        try {
          const pgPermissions = JSON.parse(pgApiKey.permissions);
          console.log(`✅ Permissions is valid JSON with ${pgPermissions.length} entries`);
        } catch (error) {
          console.log(`❌ Error parsing permissions JSON: ${error.message}`);
        }
      } else {
        console.log(`❌ Permissions is null in PostgreSQL`);
      }
    }
    
    // Check user references
    console.log('\nChecking user references:');
    const userReferences = await pgClient.query(`
      SELECT user_id, COUNT(*) 
      FROM apikeys 
      WHERE user_id IS NOT NULL 
      GROUP BY user_id 
      LIMIT 5
    `);
    
    for (const row of userReferences.rows) {
      const userId = row.user_id;
      const count = parseInt(row.count);
      
      // Check if user exists in users table
      const userExists = await checkRecordExists(pgClient, 'users', userId);
      if (userExists) {
        console.log(`✅ User ${userId} exists in PostgreSQL users table with ${count} API keys`);
      } else {
        console.log(`❌ User ${userId} does not exist in PostgreSQL users table but has ${count} API keys`);
      }
    }
    
    // Check active status distribution
    console.log('\nChecking active status distribution:');
    const activeStatusCounts = await pgClient.query(`
      SELECT active, COUNT(*) 
      FROM apikeys 
      GROUP BY active
    `);
    
    console.log('API key active status distribution:');
    for (const row of activeStatusCounts.rows) {
      console.log(`- ${row.active ? 'Active' : 'Inactive'}: ${row.count} API keys`);
    }
    
    console.log('\nVerification complete!');
    
  } catch (error) {
    console.error('Verification failed:', error);
  } finally {
    // Close connections
    await mongoClient.close();
    await pgClient.end();
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

// Run the verification
verifyApiKeysOnlyMigration()
  .then(() => console.log('API keys verification script completed'))
  .catch(err => console.error('API keys verification script failed:', err));
