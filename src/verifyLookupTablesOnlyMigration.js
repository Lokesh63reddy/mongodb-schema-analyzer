/**
 * Script to verify lookup_tables table migration from MongoDB to PostgreSQL
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

// Main function to verify lookup tables migration
async function verifyLookupTablesOnlyMigration() {
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
    
    // Get lookuptables collection
    const lookupTablesCollection = db.collection('lookuptables');
    
    // Count lookup tables in MongoDB
    const mongoCount = await lookupTablesCollection.countDocuments();
    console.log(`Found ${mongoCount} lookup tables in MongoDB`);
    
    // Count lookup tables in PostgreSQL
    const pgResult = await pgClient.query('SELECT COUNT(*) FROM lookup_tables');
    const pgCount = parseInt(pgResult.rows[0].count);
    console.log(`Found ${pgCount} lookup tables in PostgreSQL`);
    
    // Compare counts
    if (mongoCount === pgCount) {
      console.log('✅ Lookup table counts match!');
    } else {
      console.log(`❌ Lookup table counts don't match: MongoDB (${mongoCount}) vs PostgreSQL (${pgCount})`);
    }
    
    // Sample a few lookup tables to verify data integrity
    console.log('\nVerifying sample lookup tables:');
    const sampleLookupTables = await lookupTablesCollection.find().limit(3).toArray();
    
    for (const mongoLookupTable of sampleLookupTables) {
      const mongoId = mongoLookupTable._id.toString();
      const pgResult = await pgClient.query('SELECT * FROM lookup_tables WHERE id = $1', [mongoId]);
      
      if (pgResult.rows.length === 0) {
        console.log(`❌ Lookup table ${mongoId} not found in PostgreSQL`);
        continue;
      }
      
      const pgLookupTable = pgResult.rows[0];
      
      // Compare key fields
      console.log(`\nComparing lookup table ${mongoId}:`);
      
      // Name
      const mongoName = mongoLookupTable.name || '';
      if (mongoName === pgLookupTable.name) {
        console.log(`✅ Name matches: ${pgLookupTable.name}`);
      } else {
        console.log(`❌ Name mismatch: MongoDB (${mongoName}) vs PostgreSQL (${pgLookupTable.name})`);
      }
      
      // Data
      if (pgLookupTable.data) {
        try {
          const pgData = JSON.parse(pgLookupTable.data);
          
          // Check columns
          const mongoColumns = mongoLookupTable.columns || [];
          const pgColumns = pgData.columns || [];
          
          if (JSON.stringify(mongoColumns) === JSON.stringify(pgColumns)) {
            console.log(`✅ Columns match: ${JSON.stringify(pgColumns)}`);
          } else {
            console.log(`❌ Columns mismatch: MongoDB (${JSON.stringify(mongoColumns)}) vs PostgreSQL (${JSON.stringify(pgColumns)})`);
          }
          
          // Check data array length
          const mongoDataLength = mongoLookupTable.data ? mongoLookupTable.data.length : 0;
          const pgDataLength = pgData.data ? pgData.data.length : 0;
          
          if (mongoDataLength === pgDataLength) {
            console.log(`✅ Data array length matches: ${pgDataLength}`);
          } else {
            console.log(`❌ Data array length mismatch: MongoDB (${mongoDataLength}) vs PostgreSQL (${pgDataLength})`);
          }
          
          // Check first data entry if available
          if (mongoDataLength > 0 && pgDataLength > 0) {
            const mongoFirstDataKey = mongoLookupTable.data[0].key;
            const pgFirstDataKey = pgData.data[0].key;
            
            if (mongoFirstDataKey === pgFirstDataKey) {
              console.log(`✅ First data entry key matches: ${pgFirstDataKey}`);
            } else {
              console.log(`❌ First data entry key mismatch: MongoDB (${mongoFirstDataKey}) vs PostgreSQL (${pgFirstDataKey})`);
            }
            
            // Check values array length for first data entry
            const mongoValuesLength = mongoLookupTable.data[0].values ? mongoLookupTable.data[0].values.length : 0;
            const pgValuesLength = pgData.data[0].values ? pgData.data[0].values.length : 0;
            
            if (mongoValuesLength === pgValuesLength) {
              console.log(`✅ First data entry values array length matches: ${pgValuesLength}`);
            } else {
              console.log(`❌ First data entry values array length mismatch: MongoDB (${mongoValuesLength}) vs PostgreSQL (${pgValuesLength})`);
            }
          }
          
        } catch (error) {
          console.log(`❌ Error parsing data JSON: ${error.message}`);
        }
      } else {
        console.log(`❌ Data is null in PostgreSQL`);
      }
    }
    
    // Check for large lookup tables
    console.log('\nChecking for large lookup tables:');
    const largeTablesResult = await pgClient.query(`
      SELECT id, name, pg_column_size(data) as data_size 
      FROM lookup_tables 
      ORDER BY pg_column_size(data) DESC 
      LIMIT 3
    `);
    
    for (const row of largeTablesResult.rows) {
      const id = row.id;
      const name = row.name;
      const dataSize = parseInt(row.data_size);
      
      console.log(`Lookup table ${id} (${name}) has data size of ${formatBytes(dataSize)}`);
      
      // Get a sample of the data to verify it's valid JSON
      const dataResult = await pgClient.query(`
        SELECT data 
        FROM lookup_tables 
        WHERE id = $1
      `, [id]);
      
      if (dataResult.rows.length > 0) {
        try {
          const data = JSON.parse(dataResult.rows[0].data);
          const columnsCount = data.columns ? data.columns.length : 0;
          const dataEntriesCount = data.data ? data.data.length : 0;
          
          console.log(`✅ Valid JSON data with ${columnsCount} columns and ${dataEntriesCount} data entries`);
        } catch (error) {
          console.log(`❌ Invalid JSON data: ${error.message}`);
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

// Helper function to format bytes
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Run the verification
verifyLookupTablesOnlyMigration()
  .then(() => console.log('Lookup tables verification script completed'))
  .catch(err => console.error('Lookup tables verification script failed:', err));
