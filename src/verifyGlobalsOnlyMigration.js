/**
 * Script to verify globals table migration from MongoDB to PostgreSQL
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

// Main function to verify globals migration
async function verifyGlobalsOnlyMigration() {
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
    
    // Get globals collection
    const globalsCollection = db.collection('globals');
    
    // Count globals in MongoDB
    const mongoCount = await globalsCollection.countDocuments();
    console.log(`Found ${mongoCount} globals in MongoDB`);
    
    // Count globals in PostgreSQL
    const pgResult = await pgClient.query('SELECT COUNT(*) FROM globals');
    const pgCount = parseInt(pgResult.rows[0].count);
    console.log(`Found ${pgCount} globals in PostgreSQL`);
    
    // Compare counts
    if (mongoCount === pgCount) {
      console.log('✅ Global counts match!');
    } else {
      console.log(`❌ Global counts don't match: MongoDB (${mongoCount}) vs PostgreSQL (${pgCount})`);
    }
    
    // Sample a few globals to verify data integrity
    console.log('\nVerifying sample globals:');
    const sampleGlobals = await globalsCollection.find().limit(3).toArray();
    
    for (const mongoGlobal of sampleGlobals) {
      const mongoId = mongoGlobal._id.toString();
      const pgResult = await pgClient.query('SELECT * FROM globals WHERE id = $1', [mongoId]);
      
      if (pgResult.rows.length === 0) {
        console.log(`❌ Global ${mongoId} not found in PostgreSQL`);
        continue;
      }
      
      const pgGlobal = pgResult.rows[0];
      
      // Compare key fields
      console.log(`\nComparing global ${mongoId}:`);
      
      // Name
      const mongoName = mongoGlobal.name || '';
      if (mongoName === pgGlobal.name) {
        console.log(`✅ Name matches: ${pgGlobal.name}`);
      } else {
        console.log(`❌ Name mismatch: MongoDB (${mongoName}) vs PostgreSQL (${pgGlobal.name})`);
      }
      
      // Description
      const mongoDescription = mongoGlobal.description || '';
      if (mongoDescription === pgGlobal.description) {
        console.log(`✅ Description matches: ${pgGlobal.description}`);
      } else {
        console.log(`❌ Description mismatch: MongoDB (${mongoDescription}) vs PostgreSQL (${pgGlobal.description})`);
      }
      
      // Value
      if (pgGlobal.value) {
        try {
          const pgValue = JSON.parse(pgGlobal.value);
          
          // Check references array
          if (pgValue.references && mongoGlobal.references) {
            const pgReferencesLength = pgValue.references.length;
            const mongoReferencesLength = mongoGlobal.references.length;
            
            if (pgReferencesLength === mongoReferencesLength) {
              console.log(`✅ References array length matches: ${pgReferencesLength}`);
            } else {
              console.log(`❌ References array length mismatch: MongoDB (${mongoReferencesLength}) vs PostgreSQL (${pgReferencesLength})`);
            }
            
            // Check first reference if available
            if (pgReferencesLength > 0 && mongoReferencesLength > 0) {
              const pgFirstRef = pgValue.references[0].ref;
              const mongoFirstRef = mongoGlobal.references[0].ref;
              
              if (pgFirstRef === mongoFirstRef) {
                console.log(`✅ First reference matches: ${pgFirstRef}`);
              } else {
                console.log(`❌ First reference mismatch: MongoDB (${mongoFirstRef}) vs PostgreSQL (${pgFirstRef})`);
              }
            }
          }
          
          // Check __v
          if (pgValue.__v === mongoGlobal.__v) {
            console.log(`✅ Version (__v) matches: ${pgValue.__v}`);
          } else {
            console.log(`❌ Version (__v) mismatch: MongoDB (${mongoGlobal.__v}) vs PostgreSQL (${pgValue.__v})`);
          }
          
        } catch (error) {
          console.log(`❌ Error parsing value JSON: ${error.message}`);
        }
      } else {
        console.log(`❌ Value is null in PostgreSQL`);
      }
    }
    
    // Check for template references in globals
    console.log('\nChecking for template references in globals:');
    const globals = await pgClient.query('SELECT id, name, value FROM globals');
    
    for (const row of globals.rows) {
      try {
        const value = JSON.parse(row.value);
        
        if (value.references && value.references.length > 0) {
          console.log(`Global ${row.id} (${row.name}) has ${value.references.length} references:`);
          
          for (let i = 0; i < Math.min(3, value.references.length); i++) {
            const ref = value.references[i];
            console.log(`- Reference ${i+1}: ref=${ref.ref}, id=${ref.id}`);
            
            // Check if reference exists in templates table
            const templateExists = await checkRecordExists(pgClient, 'templates', ref.ref);
            if (templateExists) {
              console.log(`  ✅ Template ${ref.ref} exists in PostgreSQL templates table`);
            } else {
              console.log(`  ⚠️ Template ${ref.ref} does not exist in PostgreSQL templates table`);
            }
          }
        }
      } catch (error) {
        console.log(`❌ Error parsing value JSON for global ${row.id}: ${error.message}`);
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
verifyGlobalsOnlyMigration()
  .then(() => console.log('Globals verification script completed'))
  .catch(err => console.error('Globals verification script failed:', err));
