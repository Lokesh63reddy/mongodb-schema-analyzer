/**
 * Script to verify options table migration from MongoDB to PostgreSQL
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

// Main function to verify options migration
async function verifyOptionsOnlyMigration() {
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
    
    // Get options collection
    const optionsCollection = db.collection('options');
    
    // Count options in MongoDB
    const mongoCount = await optionsCollection.countDocuments();
    console.log(`Found ${mongoCount} options in MongoDB`);
    
    // Count options in PostgreSQL
    const pgResult = await pgClient.query('SELECT COUNT(*) FROM options');
    const pgCount = parseInt(pgResult.rows[0].count);
    console.log(`Found ${pgCount} options in PostgreSQL`);
    
    // Compare counts
    if (mongoCount === pgCount) {
      console.log('✅ Option counts match!');
    } else {
      console.log(`❌ Option counts don't match: MongoDB (${mongoCount}) vs PostgreSQL (${pgCount})`);
    }
    
    // Sample a few options to verify data integrity
    console.log('\nVerifying sample options:');
    const sampleOptions = await optionsCollection.find().limit(3).toArray();
    
    for (const mongoOption of sampleOptions) {
      const mongoId = mongoOption._id.toString();
      const pgResult = await pgClient.query('SELECT * FROM options WHERE id = $1', [mongoId]);
      
      if (pgResult.rows.length === 0) {
        console.log(`❌ Option ${mongoId} not found in PostgreSQL`);
        continue;
      }
      
      const pgOption = pgResult.rows[0];
      
      // Compare key fields
      console.log(`\nComparing option ${mongoId}:`);
      
      // Name
      const mongoName = mongoOption.name || '';
      if (mongoName === pgOption.name) {
        console.log(`✅ Name matches: ${pgOption.name}`);
      } else {
        console.log(`❌ Name mismatch: MongoDB (${mongoName}) vs PostgreSQL (${pgOption.name})`);
      }
      
      // Description
      const mongoDescription = mongoOption.description || '';
      if (mongoDescription === pgOption.description) {
        console.log(`✅ Description matches: ${pgOption.description}`);
      } else {
        console.log(`❌ Description mismatch: MongoDB (${mongoDescription}) vs PostgreSQL (${pgOption.description})`);
      }
      
      // Value
      if (pgOption.value) {
        try {
          const pgValue = JSON.parse(pgOption.value);
          
          // Check permissions array
          if (pgValue.permissions && mongoOption.permissions) {
            const pgPermissionsLength = pgValue.permissions.length;
            const mongoPermissionsLength = mongoOption.permissions.length;
            
            if (pgPermissionsLength === mongoPermissionsLength) {
              console.log(`✅ Permissions array length matches: ${pgPermissionsLength}`);
            } else {
              console.log(`❌ Permissions array length mismatch: MongoDB (${mongoPermissionsLength}) vs PostgreSQL (${pgPermissionsLength})`);
            }
          }
          
          // Check __v
          if (pgValue.__v === mongoOption.__v) {
            console.log(`✅ Version (__v) matches: ${pgValue.__v}`);
          } else {
            console.log(`❌ Version (__v) mismatch: MongoDB (${mongoOption.__v}) vs PostgreSQL (${pgValue.__v})`);
          }
          
        } catch (error) {
          console.log(`❌ Error parsing value JSON: ${error.message}`);
        }
      } else {
        console.log(`❌ Value is null in PostgreSQL`);
      }
    }
    
    // Check for options with specific names
    console.log('\nChecking for options with specific names:');
    const optionNames = await pgClient.query(`
      SELECT name, id 
      FROM options 
      ORDER BY name
    `);
    
    console.log('Options in PostgreSQL:');
    for (const row of optionNames.rows) {
      console.log(`- ${row.name} (ID: ${row.id})`);
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
verifyOptionsOnlyMigration()
  .then(() => console.log('Options verification script completed'))
  .catch(err => console.error('Options verification script failed:', err));
