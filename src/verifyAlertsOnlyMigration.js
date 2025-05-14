/**
 * Script to verify alerts table migration from MongoDB to PostgreSQL
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

// Main function to verify alerts migration
async function verifyAlertsOnlyMigration() {
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
    
    // Get alerts collection
    const alertsCollection = db.collection('alerts');
    
    // Count alerts in MongoDB
    const mongoCount = await alertsCollection.countDocuments();
    console.log(`Found ${mongoCount} alerts in MongoDB`);
    
    // Count alerts in PostgreSQL
    const pgResult = await pgClient.query('SELECT COUNT(*) FROM alerts');
    const pgCount = parseInt(pgResult.rows[0].count);
    console.log(`Found ${pgCount} alerts in PostgreSQL`);
    
    // Compare counts
    if (mongoCount === pgCount) {
      console.log('✅ Alert counts match!');
    } else {
      console.log(`❌ Alert counts don't match: MongoDB (${mongoCount}) vs PostgreSQL (${pgCount})`);
    }
    
    // Sample a few alerts to verify data integrity
    console.log('\nVerifying sample alerts:');
    const sampleAlerts = await alertsCollection.find().limit(3).toArray();
    
    for (const mongoAlert of sampleAlerts) {
      const mongoId = mongoAlert._id.toString();
      const pgResult = await pgClient.query('SELECT * FROM alerts WHERE id = $1', [mongoId]);
      
      if (pgResult.rows.length === 0) {
        console.log(`❌ Alert ${mongoId} not found in PostgreSQL`);
        continue;
      }
      
      const pgAlert = pgResult.rows[0];
      
      // Compare key fields
      console.log(`\nComparing alert ${mongoId}:`);
      
      // Type
      const mongoType = mongoAlert.type || '';
      if (mongoType === pgAlert.type) {
        console.log(`✅ Type matches: ${pgAlert.type}`);
      } else {
        console.log(`❌ Type mismatch: MongoDB (${mongoType}) vs PostgreSQL (${pgAlert.type})`);
      }
      
      // Title
      const mongoTitle = mongoAlert.type || 'Alert';
      if (mongoTitle === pgAlert.title) {
        console.log(`✅ Title matches: ${pgAlert.title}`);
      } else {
        console.log(`❌ Title mismatch: MongoDB (${mongoTitle}) vs PostgreSQL (${pgAlert.title})`);
      }
      
      // Message
      let mongoMessage = '';
      if (mongoAlert.data && mongoAlert.data.comments && mongoAlert.data.comments.length > 0) {
        mongoMessage = mongoAlert.data.comments[0].message || '';
      }
      
      if (mongoMessage === pgAlert.message) {
        console.log(`✅ Message matches: ${pgAlert.message}`);
      } else {
        console.log(`❌ Message mismatch: MongoDB (${mongoMessage}) vs PostgreSQL (${pgAlert.message})`);
      }
      
      // Level
      let mongoLevel = '';
      if (mongoAlert.data && mongoAlert.data.status && mongoAlert.data.status.length > 0) {
        mongoLevel = mongoAlert.data.status[0].value || '';
      }
      
      if (mongoLevel === pgAlert.level) {
        console.log(`✅ Level matches: ${pgAlert.level}`);
      } else {
        console.log(`❌ Level mismatch: MongoDB (${mongoLevel}) vs PostgreSQL (${pgAlert.level})`);
      }
      
      // User ID
      const mongoUserId = mongoAlert.by ? mongoAlert.by.toString() : null;
      if (mongoUserId === pgAlert.user_id) {
        console.log(`✅ User ID matches: ${pgAlert.user_id}`);
      } else if (pgAlert.user_id === null && mongoUserId !== null) {
        console.log(`⚠️ User ID in PostgreSQL is NULL, but in MongoDB it's ${mongoUserId}`);
        console.log('   This could be because the user does not exist in PostgreSQL');
      } else {
        console.log(`❌ User ID mismatch: MongoDB (${mongoUserId}) vs PostgreSQL (${pgAlert.user_id})`);
      }
      
      // Metadata
      if (pgAlert.metadata) {
        try {
          const pgMetadata = JSON.parse(pgAlert.metadata);
          
          // Check data
          if (pgMetadata.data && mongoAlert.data) {
            console.log(`✅ Data exists in metadata`);
            
            // Check comments
            if (pgMetadata.data.comments && mongoAlert.data.comments) {
              const pgCommentsLength = pgMetadata.data.comments.length;
              const mongoCommentsLength = mongoAlert.data.comments.length;
              
              if (pgCommentsLength === mongoCommentsLength) {
                console.log(`✅ Comments array length matches: ${pgCommentsLength}`);
              } else {
                console.log(`❌ Comments array length mismatch: MongoDB (${mongoCommentsLength}) vs PostgreSQL (${pgCommentsLength})`);
              }
            }
            
            // Check status
            if (pgMetadata.data.status && mongoAlert.data.status) {
              const pgStatusLength = pgMetadata.data.status.length;
              const mongoStatusLength = mongoAlert.data.status.length;
              
              if (pgStatusLength === mongoStatusLength) {
                console.log(`✅ Status array length matches: ${pgStatusLength}`);
              } else {
                console.log(`❌ Status array length mismatch: MongoDB (${mongoStatusLength}) vs PostgreSQL (${pgStatusLength})`);
              }
            }
          }
          
          // Check __v
          if (pgMetadata.__v === mongoAlert.__v) {
            console.log(`✅ Version (__v) matches: ${pgMetadata.__v}`);
          } else {
            console.log(`❌ Version (__v) mismatch: MongoDB (${mongoAlert.__v}) vs PostgreSQL (${pgMetadata.__v})`);
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
    const userReferences = await pgClient.query(`
      SELECT user_id, COUNT(*) 
      FROM alerts 
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
        console.log(`✅ User ${userId} exists in PostgreSQL users table with ${count} alerts`);
      } else {
        console.log(`❌ User ${userId} does not exist in PostgreSQL users table but has ${count} alerts`);
      }
    }
    
    // Check alert types distribution
    console.log('\nChecking alert types distribution:');
    const alertTypes = await pgClient.query(`
      SELECT type, COUNT(*) 
      FROM alerts 
      GROUP BY type
    `);
    
    console.log('Alert types distribution:');
    for (const row of alertTypes.rows) {
      console.log(`- ${row.type || 'No type'}: ${row.count} alerts`);
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
verifyAlertsOnlyMigration()
  .then(() => console.log('Alerts verification script completed'))
  .catch(err => console.error('Alerts verification script failed:', err));
