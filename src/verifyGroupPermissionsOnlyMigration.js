/**
 * Script to verify group_permissions junction table migration from MongoDB to PostgreSQL
 * This script only verifies the group_permissions junction table
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

// Main function to verify group_permissions migration
async function verifyGroupPermissionsOnlyMigration() {
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
    
    // First, check if group_permissions table exists in PostgreSQL
    const tableExists = await checkTableExists(pgClient, 'group_permissions');
    
    if (!tableExists) {
      console.error('group_permissions table does not exist in PostgreSQL.');
      return;
    }
    
    // Count total permissions in MongoDB across all groups
    const groups = db.collection('groups');
    const mongoGroups = await groups.find({ 'permissions.0': { $exists: true } }).toArray();
    
    let totalMongoPermissions = 0;
    for (const group of mongoGroups) {
      if (group.permissions && Array.isArray(group.permissions)) {
        totalMongoPermissions += group.permissions.length;
      }
    }
    
    console.log(`Found ${totalMongoPermissions} group_permissions relationships in MongoDB`);
    
    // Count group_permissions in PostgreSQL
    const pgResult = await pgClient.query('SELECT COUNT(*) FROM group_permissions');
    const pgCount = parseInt(pgResult.rows[0].count);
    console.log(`Found ${pgCount} group_permissions relationships in PostgreSQL`);
    
    // Compare counts
    if (totalMongoPermissions === pgCount) {
      console.log('✅ Group_permissions counts match!');
    } else {
      console.log(`❌ Group_permissions counts don't match: MongoDB (${totalMongoPermissions}) vs PostgreSQL (${pgCount})`);
      console.log('Note: This could be due to skipped relationships where groups or permissions were not migrated.');
    }
    
    // Sample a few groups to verify their permissions
    console.log('\nVerifying sample group permissions:');
    const sampleGroups = await groups.find({ 'permissions.0': { $exists: true } }).limit(3).toArray();
    
    for (const mongoGroup of sampleGroups) {
      const groupId = mongoGroup._id.toString();
      console.log(`\nChecking permissions for group ${groupId} (${mongoGroup.name || 'unnamed'}):`);
      
      // Count permissions for this group in MongoDB
      const mongoPermissionsCount = mongoGroup.permissions ? mongoGroup.permissions.length : 0;
      
      // Count permissions for this group in PostgreSQL
      const pgPermissionsResult = await pgClient.query(
        'SELECT COUNT(*) FROM group_permissions WHERE group_id = $1', 
        [groupId]
      );
      const pgPermissionsCount = parseInt(pgPermissionsResult.rows[0].count);
      
      console.log(`MongoDB: ${mongoPermissionsCount} permissions, PostgreSQL: ${pgPermissionsCount} permissions`);
      
      if (mongoPermissionsCount === pgPermissionsCount) {
        console.log(`✅ Permission counts match for group ${groupId}!`);
      } else {
        console.log(`❌ Permission counts don't match for group ${groupId}`);
      }
      
      // Sample a few permissions from this group to verify
      if (mongoGroup.permissions && mongoGroup.permissions.length > 0) {
        const sampleSize = Math.min(3, mongoGroup.permissions.length);
        for (let i = 0; i < sampleSize; i++) {
          const permission = mongoGroup.permissions[i];
          if (permission.ref) {
            const permissionRefId = permission.ref.toString();
            
            // Check if this permission relationship exists in PostgreSQL
            const pgPermissionResult = await pgClient.query(
              'SELECT * FROM group_permissions WHERE group_id = $1 AND permission_id = $2', 
              [groupId, permissionRefId]
            );
            
            if (pgPermissionResult.rows.length > 0) {
              console.log(`✅ Permission ${permissionRefId} found in PostgreSQL`);
              
              // Compare scope and value
              const pgPermission = pgPermissionResult.rows[0];
              const mongoScope = permission.scope || null;
              const mongoValue = permission.value !== undefined ? 
                                (typeof permission.value === 'boolean' ? 
                                 permission.value.toString() : permission.value) : null;
              
              if (mongoScope === pgPermission.scope) {
                console.log(`  ✅ Scope matches: ${pgPermission.scope}`);
              } else {
                console.log(`  ❌ Scope mismatch: MongoDB (${mongoScope}) vs PostgreSQL (${pgPermission.scope})`);
              }
              
              if (mongoValue === pgPermission.value) {
                console.log(`  ✅ Value matches: ${pgPermission.value}`);
              } else {
                console.log(`  ❌ Value mismatch: MongoDB (${mongoValue}) vs PostgreSQL (${pgPermission.value})`);
              }
            } else {
              console.log(`❌ Permission ${permissionRefId} not found in PostgreSQL`);
            }
          }
        }
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

// Helper function to check if a table exists in PostgreSQL
async function checkTableExists(pgClient, tableName) {
  const query = `
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = $1
    )
  `;
  
  const result = await pgClient.query(query, [tableName]);
  return result.rows[0].exists;
}

// Run the verification
verifyGroupPermissionsOnlyMigration()
  .then(() => console.log('Group_permissions verification script completed'))
  .catch(err => console.error('Group_permissions verification script failed:', err));
