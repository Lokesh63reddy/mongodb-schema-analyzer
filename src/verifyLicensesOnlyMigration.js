/**
 * Script to verify licenses table migration from MongoDB to PostgreSQL
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

// Main function to verify licenses migration
async function verifyLicensesOnlyMigration() {
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
    
    // Get licenses collection
    const licensesCollection = db.collection('licenses');
    
    // Count licenses in MongoDB
    const mongoCount = await licensesCollection.countDocuments();
    console.log(`Found ${mongoCount} licenses in MongoDB`);
    
    // Count licenses in PostgreSQL
    const pgResult = await pgClient.query('SELECT COUNT(*) FROM licenses');
    const pgCount = parseInt(pgResult.rows[0].count);
    console.log(`Found ${pgCount} licenses in PostgreSQL`);
    
    // Compare counts
    if (mongoCount === pgCount) {
      console.log('✅ License counts match!');
    } else {
      console.log(`❌ License counts don't match: MongoDB (${mongoCount}) vs PostgreSQL (${pgCount})`);
    }
    
    // Sample a few licenses to verify data integrity
    console.log('\nVerifying sample licenses:');
    const sampleLicenses = await licensesCollection.find().limit(3).toArray();
    
    for (const mongoLicense of sampleLicenses) {
      const mongoId = mongoLicense._id.toString();
      const pgResult = await pgClient.query('SELECT * FROM licenses WHERE id = $1', [mongoId]);
      
      if (pgResult.rows.length === 0) {
        console.log(`❌ License ${mongoId} not found in PostgreSQL`);
        continue;
      }
      
      const pgLicense = pgResult.rows[0];
      
      // Compare key fields
      console.log(`\nComparing license ${mongoId}:`);
      
      // Name
      const mongoName = mongoLicense.metadata && mongoLicense.metadata.organization ? 
                        mongoLicense.metadata.organization : `License ${mongoId}`;
      if (mongoName === pgLicense.name) {
        console.log(`✅ Name matches: ${pgLicense.name}`);
      } else {
        console.log(`❌ Name mismatch: MongoDB (${mongoName}) vs PostgreSQL (${pgLicense.name})`);
      }
      
      // Status
      const mongoStatus = mongoLicense.metadata && mongoLicense.metadata.licensed ? 'active' : 'inactive';
      if (mongoStatus === pgLicense.status) {
        console.log(`✅ Status matches: ${pgLicense.status}`);
      } else {
        console.log(`❌ Status mismatch: MongoDB (${mongoStatus}) vs PostgreSQL (${pgLicense.status})`);
      }
      
      // Customer ID
      let mongoCustomerId = null;
      if (mongoLicense.customers && mongoLicense.customers.length > 0 && mongoLicense.customers[0].ref) {
        mongoCustomerId = mongoLicense.customers[0].ref.toString();
      }
      
      if (mongoCustomerId === pgLicense.customer_id) {
        console.log(`✅ Customer ID matches: ${pgLicense.customer_id}`);
      } else if (pgLicense.customer_id === null && mongoCustomerId !== null) {
        console.log(`⚠️ Customer ID in PostgreSQL is NULL, but in MongoDB it's ${mongoCustomerId}`);
        console.log('   This could be because the customer does not exist in PostgreSQL');
      } else {
        console.log(`❌ Customer ID mismatch: MongoDB (${mongoCustomerId}) vs PostgreSQL (${pgLicense.customer_id})`);
      }
      
      // Metadata
      if (pgLicense.metadata) {
        try {
          const pgMetadata = JSON.parse(pgLicense.metadata);
          
          // Check if metadata contains plan
          if (pgMetadata.plan && mongoLicense.plan) {
            console.log(`✅ Plan in metadata is present`);
            
            // Check plan.primary if available
            if (pgMetadata.plan.primary === mongoLicense.plan.primary) {
              console.log(`✅ Plan primary matches: ${pgMetadata.plan.primary}`);
            } else {
              console.log(`❌ Plan primary mismatch: MongoDB (${mongoLicense.plan.primary}) vs PostgreSQL (${pgMetadata.plan.primary})`);
            }
          }
          
          // Check if metadata contains customers array
          if (pgMetadata.customers && mongoLicense.customers) {
            const pgCustomersLength = pgMetadata.customers.length;
            const mongoCustomersLength = mongoLicense.customers.length;
            
            if (pgCustomersLength === mongoCustomersLength) {
              console.log(`✅ Customers array length matches: ${pgCustomersLength}`);
            } else {
              console.log(`❌ Customers array length mismatch: MongoDB (${mongoCustomersLength}) vs PostgreSQL (${pgCustomersLength})`);
            }
          }
          
        } catch (error) {
          console.log(`❌ Error parsing metadata JSON: ${error.message}`);
        }
      } else {
        console.log(`❌ Metadata is null in PostgreSQL`);
      }
    }
    
    // Check customer references
    console.log('\nChecking customer references:');
    const customerReferences = await pgClient.query(`
      SELECT customer_id, COUNT(*) 
      FROM licenses 
      WHERE customer_id IS NOT NULL 
      GROUP BY customer_id 
      LIMIT 5
    `);
    
    for (const row of customerReferences.rows) {
      const customerId = row.customer_id;
      const count = parseInt(row.count);
      
      // Check if customer exists in customers table
      const customerExists = await checkRecordExists(pgClient, 'customers', customerId);
      if (customerExists) {
        console.log(`✅ Customer ${customerId} exists in PostgreSQL customers table with ${count} licenses`);
      } else {
        console.log(`❌ Customer ${customerId} does not exist in PostgreSQL customers table but has ${count} licenses`);
      }
    }
    
    // Check license statuses
    console.log('\nChecking license statuses:');
    const statusCounts = await pgClient.query(`
      SELECT status, COUNT(*) 
      FROM licenses 
      GROUP BY status 
      ORDER BY COUNT(*) DESC
    `);
    
    console.log('License status distribution:');
    for (const row of statusCounts.rows) {
      console.log(`- ${row.status || 'NULL'}: ${row.count} licenses`);
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
verifyLicensesOnlyMigration()
  .then(() => console.log('Licenses verification script completed'))
  .catch(err => console.error('Licenses verification script failed:', err));
