/**
 * Script to verify betawhitelists table migration from MongoDB to PostgreSQL
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

// Main function to verify beta whitelists migration
async function verifyBetaWhitelistsOnlyMigration() {
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
    
    // Get betawhitelists collection
    const betaWhitelistsCollection = db.collection('betawhitelists');
    
    // Count beta whitelists in MongoDB
    const mongoCount = await betaWhitelistsCollection.countDocuments();
    console.log(`Found ${mongoCount} beta whitelists in MongoDB`);
    
    // Count beta whitelists in PostgreSQL
    const pgResult = await pgClient.query('SELECT COUNT(*) FROM betawhitelists');
    const pgCount = parseInt(pgResult.rows[0].count);
    console.log(`Found ${pgCount} beta whitelists in PostgreSQL`);
    
    // Compare counts
    if (mongoCount === pgCount) {
      console.log('✅ Beta whitelist counts match!');
    } else {
      console.log(`❌ Beta whitelist counts don't match: MongoDB (${mongoCount}) vs PostgreSQL (${pgCount})`);
    }
    
    // Sample a few beta whitelists to verify data integrity
    console.log('\nVerifying sample beta whitelists:');
    const sampleBetaWhitelists = await betaWhitelistsCollection.find().limit(3).toArray();
    
    for (const mongoBetaWhitelist of sampleBetaWhitelists) {
      const mongoId = mongoBetaWhitelist._id.toString();
      const pgResult = await pgClient.query('SELECT * FROM betawhitelists WHERE id = $1', [mongoId]);
      
      if (pgResult.rows.length === 0) {
        console.log(`❌ Beta whitelist ${mongoId} not found in PostgreSQL`);
        continue;
      }
      
      const pgBetaWhitelist = pgResult.rows[0];
      
      // Compare key fields
      console.log(`\nComparing beta whitelist ${mongoId}:`);
      
      // Email
      const mongoEmail = mongoBetaWhitelist.email || '';
      if (mongoEmail === pgBetaWhitelist.email) {
        console.log(`✅ Email matches: ${pgBetaWhitelist.email}`);
      } else {
        console.log(`❌ Email mismatch: MongoDB (${mongoEmail}) vs PostgreSQL (${pgBetaWhitelist.email})`);
      }
      
      // Metadata
      if (pgBetaWhitelist.metadata) {
        try {
          const pgMetadata = JSON.parse(pgBetaWhitelist.metadata);
          
          // Check name
          const mongoName = mongoBetaWhitelist.name || '';
          if (mongoName === pgMetadata.name) {
            console.log(`✅ Name in metadata matches: ${pgMetadata.name}`);
          } else {
            console.log(`❌ Name in metadata mismatch: MongoDB (${mongoName}) vs PostgreSQL (${pgMetadata.name})`);
          }
          
          // Check __v
          if (mongoBetaWhitelist.__v === pgMetadata.__v) {
            console.log(`✅ Version (__v) in metadata matches: ${pgMetadata.__v}`);
          } else {
            console.log(`❌ Version (__v) in metadata mismatch: MongoDB (${mongoBetaWhitelist.__v}) vs PostgreSQL (${pgMetadata.__v})`);
          }
          
        } catch (error) {
          console.log(`❌ Error parsing metadata JSON: ${error.message}`);
        }
      } else {
        console.log(`❌ Metadata is null in PostgreSQL`);
      }
    }
    
    // List all beta whitelists
    console.log('\nListing all beta whitelists:');
    const allBetaWhitelists = await pgClient.query(`
      SELECT id, email, metadata 
      FROM betawhitelists 
      ORDER BY email
    `);
    
    console.log('Beta whitelists in PostgreSQL:');
    for (const row of allBetaWhitelists.rows) {
      let name = '';
      try {
        const metadata = JSON.parse(row.metadata);
        name = metadata.name || '';
      } catch (error) {
        name = 'Error parsing metadata';
      }
      
      console.log(`- ${row.email} (Name: ${name}, ID: ${row.id})`);
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
verifyBetaWhitelistsOnlyMigration()
  .then(() => console.log('Beta whitelists verification script completed'))
  .catch(err => console.error('Beta whitelists verification script failed:', err));
