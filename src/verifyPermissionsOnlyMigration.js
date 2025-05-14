/**
 * Script to verify permissions table migration from MongoDB to PostgreSQL
 * This script only verifies the permissions table, not group_permissions
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

// Main function to verify permissions migration
async function verifyPermissionsOnlyMigration() {
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
    
    // Get permissions collection
    const permissionsCollection = db.collection('permissions');
    
    // Count permissions in MongoDB
    const mongoCount = await permissionsCollection.countDocuments();
    console.log(`Found ${mongoCount} permissions in MongoDB`);
    
    // Count permissions in PostgreSQL
    const pgResult = await pgClient.query('SELECT COUNT(*) FROM permissions');
    const pgCount = parseInt(pgResult.rows[0].count);
    console.log(`Found ${pgCount} permissions in PostgreSQL`);
    
    // Compare counts
    if (mongoCount === pgCount) {
      console.log('✅ Permission counts match!');
    } else {
      console.log(`❌ Permission counts don't match: MongoDB (${mongoCount}) vs PostgreSQL (${pgCount})`);
    }
    
    // Sample a few permissions to verify data integrity
    console.log('\nVerifying sample permissions:');
    const samplePermissions = await permissionsCollection.find().limit(5).toArray();
    
    for (const mongoPermission of samplePermissions) {
      const mongoId = mongoPermission._id.toString();
      const pgResult = await pgClient.query('SELECT * FROM permissions WHERE id = $1', [mongoId]);
      
      if (pgResult.rows.length === 0) {
        console.log(`❌ Permission ${mongoId} not found in PostgreSQL`);
        continue;
      }
      
      const pgPermission = pgResult.rows[0];
      
      // Compare key fields
      console.log(`\nComparing permission ${mongoId}:`);
      
      // Name
      const mongoName = mongoPermission.longname || mongoPermission.shortname || '';
      if (mongoName === pgPermission.name) {
        console.log(`✅ Name matches: ${pgPermission.name}`);
      } else {
        console.log(`❌ Name mismatch: MongoDB (${mongoName}) vs PostgreSQL (${pgPermission.name})`);
      }
      
      // Description
      const mongoDescription = mongoPermission.description || null;
      if (mongoDescription === pgPermission.description) {
        console.log(`✅ Description matches: ${pgPermission.description}`);
      } else {
        console.log(`❌ Description mismatch: MongoDB (${mongoDescription}) vs PostgreSQL (${pgPermission.description})`);
      }
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

// Run the verification
verifyPermissionsOnlyMigration()
  .then(() => console.log('Permissions verification script completed'))
  .catch(err => console.error('Permissions verification script failed:', err));
