/**
 * Script to migrate only templates table data from MongoDB to PostgreSQL
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

// Main function to migrate templates
async function migrateTemplatesOnly() {
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
    
    // Get templates collection
    const templatesCollection = db.collection('templates');
    
    // Count templates
    const count = await templatesCollection.countDocuments();
    console.log(`Found ${count} templates in MongoDB`);
    
    if (count === 0) {
      console.log('No templates to migrate. Exiting.');
      return;
    }
    
    // Begin PostgreSQL transaction
    await pgClient.query('BEGIN');
    
    // Process templates in batches
    const batchSize = 10;
    let processed = 0;
    
    // Use cursor for efficient processing of large collections
    const cursor = templatesCollection.find();
    
    let batch = [];
    let doc = await cursor.next();
    
    while (doc) {
      // Transform template document
      const transformedTemplate = transformTemplate(doc);
      batch.push(transformedTemplate);
      
      // Process batch when it reaches batch size
      if (batch.length >= batchSize) {
        await processBatch(pgClient, batch);
        processed += batch.length;
        console.log(`Processed ${processed}/${count} templates`);
        batch = [];
      }
      
      // Get next document
      doc = await cursor.next();
    }
    
    // Process remaining templates
    if (batch.length > 0) {
      await processBatch(pgClient, batch);
      processed += batch.length;
      console.log(`Processed ${processed}/${count} templates`);
    }
    
    // Commit transaction
    await pgClient.query('COMMIT');
    
    console.log('Templates migration completed successfully');
    
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

// Function to transform MongoDB template to PostgreSQL format
function transformTemplate(doc) {
  // Extract MongoDB _id as string
  const id = doc._id.toString();
  
  // Handle dates
  const createdAt = doc.createdAt instanceof Date ? doc.createdAt : 
                   (doc.createdAt ? new Date(doc.createdAt) : null);
  
  const updatedAt = doc.updatedAt instanceof Date ? doc.updatedAt : 
                   (doc.updatedAt ? new Date(doc.updatedAt) : null);
  
  // Extract name and description
  const name = doc.name || '';
  const description = ''; // Templates in MongoDB don't seem to have a description field
  
  // Combine all other data into a content object
  const content = {
    archived: doc.archived,
    defaultVariant: doc.defaultVariant,
    variants: doc.variants,
    costAnalyses: doc.costAnalyses,
    efficiencyConfiguration: doc.efficiencyConfiguration,
    history: doc.history,
    __v: doc.__v
  };
  
  // Transform template document
  return {
    id,
    name,
    description,
    content: JSON.stringify(content),
    created_at: createdAt,
    updated_at: updatedAt
  };
}

// Process a batch of templates
async function processBatch(pgClient, batch) {
  for (const template of batch) {
    await insertTemplateIntoPostgres(pgClient, template);
  }
}

// Function to insert template into PostgreSQL
async function insertTemplateIntoPostgres(pgClient, template) {
  try {
    const query = `
      INSERT INTO templates (
        id, name, description, content, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (id) DO UPDATE SET
        name = $2,
        description = $3,
        content = $4,
        updated_at = $6
    `;
    
    const values = [
      template.id,
      template.name,
      template.description,
      template.content,
      template.created_at,
      template.updated_at
    ];
    
    await pgClient.query(query, values);
  } catch (error) {
    console.error(`Error inserting template ${template.id}:`, error);
    throw error;
  }
}

// Run the migration
migrateTemplatesOnly()
  .then(() => console.log('Templates migration script completed'))
  .catch(err => console.error('Templates migration script failed:', err));
