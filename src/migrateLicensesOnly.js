/**
 * Script to migrate only licenses table data from MongoDB to PostgreSQL
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

// Main function to migrate licenses
async function migrateLicensesOnly() {
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
    
    // Count licenses
    const count = await licensesCollection.countDocuments();
    console.log(`Found ${count} licenses in MongoDB`);
    
    if (count === 0) {
      console.log('No licenses to migrate. Exiting.');
      return;
    }
    
    // Begin PostgreSQL transaction
    await pgClient.query('BEGIN');
    
    // Process licenses in batches
    const batchSize = 5;
    let processed = 0;
    
    // Use cursor for efficient processing of large collections
    const cursor = licensesCollection.find();
    
    let batch = [];
    let doc = await cursor.next();
    
    while (doc) {
      // Transform license document
      const transformedLicense = transformLicense(doc);
      batch.push(transformedLicense);
      
      // Process batch when it reaches batch size
      if (batch.length >= batchSize) {
        await processBatch(pgClient, batch);
        processed += batch.length;
        console.log(`Processed ${processed}/${count} licenses`);
        batch = [];
      }
      
      // Get next document
      doc = await cursor.next();
    }
    
    // Process remaining licenses
    if (batch.length > 0) {
      await processBatch(pgClient, batch);
      processed += batch.length;
      console.log(`Processed ${processed}/${count} licenses`);
    }
    
    // Commit transaction
    await pgClient.query('COMMIT');
    
    console.log('Licenses migration completed successfully');
    
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

// Function to transform MongoDB license to PostgreSQL format
function transformLicense(doc) {
  // Extract MongoDB _id as string
  const id = doc._id.toString();
  
  // Handle dates with validation
  let createdAt = null;
  if (doc.createdAt instanceof Date) {
    createdAt = doc.createdAt;
  } else if (doc.createdAt) {
    try {
      const date = new Date(doc.createdAt);
      // Check if date is valid
      if (!isNaN(date.getTime())) {
        createdAt = date;
      } else {
        console.warn(`Invalid createdAt date for license ${id}, using current date instead`);
        createdAt = new Date();
      }
    } catch (error) {
      console.warn(`Error parsing createdAt date for license ${id}, using current date instead:`, error.message);
      createdAt = new Date();
    }
  } else {
    console.warn(`No createdAt date for license ${id}, using current date`);
    createdAt = new Date();
  }
  
  let updatedAt = null;
  if (doc.updatedAt instanceof Date) {
    updatedAt = doc.updatedAt;
  } else if (doc.updatedAt) {
    try {
      const date = new Date(doc.updatedAt);
      // Check if date is valid
      if (!isNaN(date.getTime())) {
        updatedAt = date;
      } else {
        console.warn(`Invalid updatedAt date for license ${id}, using current date instead`);
        updatedAt = new Date();
      }
    } catch (error) {
      console.warn(`Error parsing updatedAt date for license ${id}, using current date instead:`, error.message);
      updatedAt = new Date();
    }
  } else {
    console.warn(`No updatedAt date for license ${id}, using current date`);
    updatedAt = new Date();
  }
  
  // Extract name from metadata or use ID as fallback
  const name = doc.metadata && doc.metadata.organization ? doc.metadata.organization : `License ${id}`;
  
  // Extract key (not present in sample, using empty string as default)
  const key = '';
  
  // Extract type (not present in sample, using 'standard' as default)
  const type = 'standard';
  
  // Extract status (not present in sample, using 'active' as default)
  const status = doc.metadata && doc.metadata.licensed ? 'active' : 'inactive';
  
  // Extract customer_id from the first customer reference if available
  let customerId = null;
  if (doc.customers && doc.customers.length > 0 && doc.customers[0].ref) {
    customerId = doc.customers[0].ref.toString();
  }
  
  // Extract expires_at (not present in sample, using null as default)
  const expiresAt = null;
  
  // Combine all other data into a metadata object
  const metadata = {
    plan: doc.plan,
    customers: doc.customers,
    users: doc.users,
    contacts: doc.contacts,
    groups: doc.groups,
    metadata: doc.metadata,
    __v: doc.__v
  };
  
  // Transform license document
  return {
    id,
    name,
    key,
    type,
    status,
    customer_id: customerId,
    metadata: JSON.stringify(metadata),
    expires_at: expiresAt,
    created_at: createdAt,
    updated_at: updatedAt
  };
}

// Process a batch of licenses
async function processBatch(pgClient, batch) {
  for (const license of batch) {
    await insertLicenseIntoPostgres(pgClient, license);
  }
}

// Function to insert license into PostgreSQL
async function insertLicenseIntoPostgres(pgClient, license) {
  try {
    // Check if customer_id exists in customers table if it's not null
    if (license.customer_id) {
      const customerExists = await checkRecordExists(pgClient, 'customers', license.customer_id);
      if (!customerExists) {
        console.warn(`Customer ${license.customer_id} does not exist in PostgreSQL. Setting customer_id to NULL for license ${license.id}.`);
        license.customer_id = null;
      }
    }
    
    const query = `
      INSERT INTO licenses (
        id, name, key, type, status, customer_id, metadata, expires_at, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (id) DO UPDATE SET
        name = $2,
        key = $3,
        type = $4,
        status = $5,
        customer_id = $6,
        metadata = $7,
        expires_at = $8,
        updated_at = $10
    `;
    
    const values = [
      license.id,
      license.name,
      license.key,
      license.type,
      license.status,
      license.customer_id,
      license.metadata,
      license.expires_at,
      license.created_at,
      license.updated_at
    ];
    
    await pgClient.query(query, values);
  } catch (error) {
    console.error(`Error inserting license ${license.id}:`, error);
    throw error;
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

// Run the migration
migrateLicensesOnly()
  .then(() => console.log('Licenses migration script completed'))
  .catch(err => console.error('Licenses migration script failed:', err));
