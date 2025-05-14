/**
 * Script to verify uploads table migration from MongoDB to PostgreSQL
 * This script only verifies the uploads table
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

// Main function to verify uploads migration
async function verifyUploadsOnlyMigration() {
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
    
    // Get uploads collection
    const uploadsCollection = db.collection('uploads');
    
    // Count uploads in MongoDB
    const mongoCount = await uploadsCollection.countDocuments();
    console.log(`Found ${mongoCount} uploads in MongoDB`);
    
    // Count uploads in PostgreSQL
    const pgResult = await pgClient.query('SELECT COUNT(*) FROM uploads');
    const pgCount = parseInt(pgResult.rows[0].count);
    console.log(`Found ${pgCount} uploads in PostgreSQL`);
    
    // Compare counts
    if (mongoCount === pgCount) {
      console.log('✅ Upload counts match!');
    } else {
      console.log(`❌ Upload counts don't match: MongoDB (${mongoCount}) vs PostgreSQL (${pgCount})`);
    }
    
    // Sample a few uploads to verify data integrity
    console.log('\nVerifying sample uploads:');
    const sampleUploads = await uploadsCollection.find().limit(5).toArray();
    
    for (const mongoUpload of sampleUploads) {
      const mongoId = mongoUpload._id.toString();
      const pgResult = await pgClient.query('SELECT * FROM uploads WHERE id = $1', [mongoId]);
      
      if (pgResult.rows.length === 0) {
        console.log(`❌ Upload ${mongoId} not found in PostgreSQL`);
        continue;
      }
      
      const pgUpload = pgResult.rows[0];
      
      // Compare key fields
      console.log(`\nComparing upload ${mongoId}:`);
      
      // Filename
      const mongoFilename = mongoUpload.filename || mongoUpload.name || '';
      if (mongoFilename === pgUpload.filename) {
        console.log(`✅ Filename matches: ${pgUpload.filename}`);
      } else {
        console.log(`❌ Filename mismatch: MongoDB (${mongoFilename}) vs PostgreSQL (${pgUpload.filename})`);
      }
      
      // Mimetype
      const mongoMimetype = mongoUpload.filetype || '';
      if (mongoMimetype === pgUpload.mimetype) {
        console.log(`✅ Mimetype matches: ${pgUpload.mimetype}`);
      } else {
        console.log(`❌ Mimetype mismatch: MongoDB (${mongoMimetype}) vs PostgreSQL (${pgUpload.mimetype})`);
      }
      
      // Size
      const mongoSize = mongoUpload.filesize || 0;
      if (mongoSize === parseInt(pgUpload.size)) {
        console.log(`✅ Size matches: ${pgUpload.size}`);
      } else {
        console.log(`❌ Size mismatch: MongoDB (${mongoSize}) vs PostgreSQL (${pgUpload.size})`);
      }
      
      // Path
      const mongoPath = mongoUpload.key || '';
      if (mongoPath === pgUpload.path) {
        console.log(`✅ Path matches: ${pgUpload.path}`);
      } else {
        console.log(`❌ Path mismatch: MongoDB (${mongoPath}) vs PostgreSQL (${pgUpload.path})`);
      }
      
      // User ID
      let mongoUserId = null;
      if (mongoUpload.activity && mongoUpload.activity.length > 0 && mongoUpload.activity[0].by) {
        mongoUserId = mongoUpload.activity[0].by.toString();
      }
      
      if (mongoUserId === pgUpload.user_id) {
        console.log(`✅ User ID matches: ${pgUpload.user_id}`);
      } else if (pgUpload.user_id === null && mongoUserId !== null) {
        console.log(`⚠️ User ID in PostgreSQL is NULL, but in MongoDB it's ${mongoUserId}`);
        console.log('   This could be because the user does not exist in PostgreSQL');
      } else {
        console.log(`❌ User ID mismatch: MongoDB (${mongoUserId}) vs PostgreSQL (${pgUpload.user_id})`);
      }
      
      // Metadata
      if (pgUpload.metadata) {
        try {
          const pgMetadata = JSON.parse(pgUpload.metadata);
          
          // Check resource
          if (mongoUpload.resource === pgMetadata.resource) {
            console.log(`✅ Resource in metadata matches: ${pgMetadata.resource}`);
          } else {
            console.log(`❌ Resource in metadata mismatch: MongoDB (${mongoUpload.resource}) vs PostgreSQL (${pgMetadata.resource})`);
          }
          
          // Check resourceId
          if (mongoUpload.resourceId === pgMetadata.resourceId) {
            console.log(`✅ ResourceId in metadata matches: ${pgMetadata.resourceId}`);
          } else {
            console.log(`❌ ResourceId in metadata mismatch: MongoDB (${mongoUpload.resourceId}) vs PostgreSQL (${pgMetadata.resourceId})`);
          }
          
          // Check description
          if (mongoUpload.description === pgMetadata.description) {
            console.log(`✅ Description in metadata matches: ${pgMetadata.description}`);
          } else {
            console.log(`❌ Description in metadata mismatch: MongoDB (${mongoUpload.description}) vs PostgreSQL (${pgMetadata.description})`);
          }
          
        } catch (error) {
          console.log(`❌ Error parsing metadata JSON: ${error.message}`);
        }
      } else {
        console.log(`❌ Metadata is null in PostgreSQL`);
      }
    }
    
    // Check user references
    console.log('\nChecking user references:');
    const userUploads = await pgClient.query(`
      SELECT user_id, COUNT(*) 
      FROM uploads 
      WHERE user_id IS NOT NULL 
      GROUP BY user_id 
      LIMIT 5
    `);
    
    for (const row of userUploads.rows) {
      const userId = row.user_id;
      const count = parseInt(row.count);
      
      // Check if user exists in PostgreSQL
      const userExists = await checkRecordExists(pgClient, 'users', userId);
      if (userExists) {
        console.log(`✅ User ${userId} exists in PostgreSQL with ${count} uploads`);
      } else {
        console.log(`❌ User ${userId} does not exist in PostgreSQL but has ${count} uploads`);
      }
    }
    
    // Check resource types
    console.log('\nChecking resource types:');
    const resourceTypes = await pgClient.query(`
      SELECT jsonb_extract_path_text(metadata::jsonb, 'resource') as resource_type, COUNT(*) 
      FROM uploads 
      GROUP BY resource_type 
      ORDER BY COUNT(*) DESC 
      LIMIT 5
    `);
    
    console.log('Top resource types in uploads:');
    for (const row of resourceTypes.rows) {
      console.log(`- ${row.resource_type || 'NULL'}: ${row.count} uploads`);
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
verifyUploadsOnlyMigration()
  .then(() => console.log('Uploads verification script completed'))
  .catch(err => console.error('Uploads verification script failed:', err));
