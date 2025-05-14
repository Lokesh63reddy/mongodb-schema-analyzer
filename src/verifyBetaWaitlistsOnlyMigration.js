/**
 * Script to verify betawaitlists table migration from MongoDB to PostgreSQL
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

// Main function to verify beta waitlists migration
async function verifyBetaWaitlistsOnlyMigration() {
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
    
    // Count beta waitlists in MongoDB
    const mongoCount = await betaWaitlistsCollection.countDocuments();
    console.log(`Found ${mongoCount} beta waitlists in MongoDB`);
    
    // Count beta waitlists in PostgreSQL
    const pgResult = await pgClient.query('SELECT COUNT(*) FROM betawaitlists');
    const pgCount = parseInt(pgResult.rows[0].count);
    console.log(`Found ${pgCount} beta waitlists in PostgreSQL`);
    
    // Compare counts
    if (mongoCount === pgCount) {
      console.log('✅ Beta waitlist counts match!');
    } else {
      console.log(`❌ Beta waitlist counts don't match: MongoDB (${mongoCount}) vs PostgreSQL (${pgCount})`);
    }
    
    // Sample a few beta waitlists to verify data integrity
    console.log('\nVerifying sample beta waitlists:');
    const sampleBetaWaitlists = await betaWaitlistsCollection.find().limit(3).toArray();
    
    for (const mongoBetaWaitlist of sampleBetaWaitlists) {
      const mongoId = mongoBetaWaitlist._id.toString();
      const pgResult = await pgClient.query('SELECT * FROM betawaitlists WHERE id = $1', [mongoId]);
      
      if (pgResult.rows.length === 0) {
        console.log(`❌ Beta waitlist ${mongoId} not found in PostgreSQL`);
        continue;
      }
      
      const pgBetaWaitlist = pgResult.rows[0];
      
      // Compare key fields
      console.log(`\nComparing beta waitlist ${mongoId}:`);
      
      // Email
      const mongoEmail = mongoBetaWaitlist.email || '';
      if (mongoEmail === pgBetaWaitlist.email) {
        console.log(`✅ Email matches: ${pgBetaWaitlist.email}`);
      } else {
        console.log(`❌ Email mismatch: MongoDB (${mongoEmail}) vs PostgreSQL (${pgBetaWaitlist.email})`);
      }
      
      // Metadata
      if (pgBetaWaitlist.metadata) {
        try {
          const pgMetadata = JSON.parse(pgBetaWaitlist.metadata);
          
          // Check name
          const mongoName = mongoBetaWaitlist.name || '';
          if (mongoName === pgMetadata.name) {
            console.log(`✅ Name in metadata matches: ${pgMetadata.name}`);
          } else {
            console.log(`❌ Name in metadata mismatch: MongoDB (${mongoName}) vs PostgreSQL (${pgMetadata.name})`);
          }
          
          // Check __v
          if (mongoBetaWaitlist.__v === pgMetadata.__v) {
            console.log(`✅ Version (__v) in metadata matches: ${pgMetadata.__v}`);
          } else {
            console.log(`❌ Version (__v) in metadata mismatch: MongoDB (${mongoBetaWaitlist.__v}) vs PostgreSQL (${pgMetadata.__v})`);
          }
          
        } catch (error) {
          console.log(`❌ Error parsing metadata JSON: ${error.message}`);
        }
      } else {
        console.log(`❌ Metadata is null in PostgreSQL`);
      }
    }
    
    // List all beta waitlists
    console.log('\nListing all beta waitlists:');
    const allBetaWaitlists = await pgClient.query(`
      SELECT id, email, metadata 
      FROM betawaitlists 
      ORDER BY email
    `);
    
    console.log('Beta waitlists in PostgreSQL:');
    for (const row of allBetaWaitlists.rows) {
      let name = '';
      try {
        const metadata = JSON.parse(row.metadata);
        name = metadata.name || '';
      } catch (error) {
        name = 'Error parsing metadata';
      }
      
      console.log(`- ${row.email} (Name: ${name}, ID: ${row.id})`);
    }
    
    // Check for duplicate emails
    console.log('\nChecking for duplicate emails:');
    const duplicateEmails = await pgClient.query(`
      SELECT email, COUNT(*) 
      FROM betawaitlists 
      GROUP BY email 
      HAVING COUNT(*) > 1
    `);
    
    if (duplicateEmails.rows.length === 0) {
      console.log('✅ No duplicate emails found');
    } else {
      console.log('⚠️ Found duplicate emails:');
      for (const row of duplicateEmails.rows) {
        console.log(`- ${row.email} (${row.count} occurrences)`);
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
verifyBetaWaitlistsOnlyMigration()
  .then(() => console.log('Beta waitlists verification script completed'))
  .catch(err => console.error('Beta waitlists verification script failed:', err));
