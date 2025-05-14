/**
 * Script to migrate only group_permissions junction table data from MongoDB to PostgreSQL
 * This script assumes that groups and permissions tables already exist in PostgreSQL
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

// Main function to migrate group_permissions
async function migrateGroupPermissionsOnly() {
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
    
    // Begin PostgreSQL transaction
    await pgClient.query('BEGIN');
    
    // Migrate group_permissions junction table
    console.log('Migrating group_permissions junction table...');
    const count = await migrateGroupPermissions(db, pgClient);
    
    // Commit transaction
    await pgClient.query('COMMIT');
    
    console.log(`Successfully migrated ${count} group_permissions relationships`);
    
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

// Function to migrate group_permissions junction table
async function migrateGroupPermissions(db, pgClient) {
  console.log('Migrating group_permissions junction table');
  
  // First, check if groups and permissions tables exist in PostgreSQL
  const groupsExist = await checkTableExists(pgClient, 'groups');
  const permissionsExist = await checkTableExists(pgClient, 'permissions');
  
  if (!groupsExist) {
    throw new Error('Groups table does not exist in PostgreSQL. Please migrate groups first.');
  }
  
  if (!permissionsExist) {
    throw new Error('Permissions table does not exist in PostgreSQL. Please migrate permissions first.');
  }
  
  // Get groups collection
  const groups = db.collection('groups');
  
  // Find groups with permissions array
  const cursor = groups.find({ 'permissions.0': { $exists: true } });
  
  let count = 0;
  let doc = await cursor.next();
  
  while (doc) {
    if (doc.permissions && Array.isArray(doc.permissions)) {
      for (const permission of doc.permissions) {
        if (permission.ref) {
          try {
            // Check if the group exists in PostgreSQL
            const groupExists = await checkRecordExists(pgClient, 'groups', doc._id.toString());
            if (!groupExists) {
              console.warn(`Group ${doc._id} does not exist in PostgreSQL. Skipping its permissions.`);
              continue;
            }
            
            // Check if the permission exists in PostgreSQL
            const permissionExists = await checkRecordExists(pgClient, 'permissions', permission.ref.toString());
            if (!permissionExists) {
              console.warn(`Permission ${permission.ref} does not exist in PostgreSQL. Skipping this relationship.`);
              continue;
            }
            
            const query = `
              INSERT INTO group_permissions (
                id, group_id, permission_id, value, scope, created_at, updated_at
              ) VALUES ($1, $2, $3, $4, $5, $6, $7)
              ON CONFLICT DO NOTHING
            `;
            
            const permissionId = permission._id ? permission._id.toString() : `${doc._id}_${permission.ref}`;
            const groupId = doc._id.toString();
            const permissionRefId = permission.ref.toString();
            const value = permission.value !== undefined ? 
                         (typeof permission.value === 'boolean' ? 
                          permission.value.toString() : permission.value) : null;
            const scope = permission.scope || null;
            
            const values = [
              permissionId,
              groupId,
              permissionRefId,
              value,
              scope,
              new Date(),
              new Date()
            ];
            
            await pgClient.query(query, values);
            count++;
            
            if (count % 100 === 0) {
              console.log(`Processed ${count} group_permissions relationships`);
            }
          } catch (error) {
            console.error(`Error inserting group_permission: ${error.message}`);
          }
        }
      }
    }
    
    doc = await cursor.next();
  }
  
  console.log(`Migrated ${count} group_permissions relationships`);
  return count;
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
migrateGroupPermissionsOnly()
  .then(() => console.log('Group_permissions migration script completed'))
  .catch(err => console.error('Group_permissions migration script failed:', err));
