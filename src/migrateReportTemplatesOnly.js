/**
 * Script to migrate only report_templates table data from MongoDB to PostgreSQL
 * Note: This script migrates data from the reporttemplates_fixed collection in MongoDB
 * to both the report_templates and reporttemplates_fixed tables in PostgreSQL.
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

// Main function to migrate report templates
async function migrateReportTemplatesOnly() {
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
    
    // Get reporttemplates_fixed collection
    const reportTemplatesCollection = db.collection('reporttemplates_fixed');
    
    // Count report templates
    const count = await reportTemplatesCollection.countDocuments();
    console.log(`Found ${count} report templates in MongoDB`);
    
    if (count === 0) {
      console.log('No report templates to migrate. Exiting.');
      return;
    }
    
    // Begin PostgreSQL transaction
    await pgClient.query('BEGIN');
    
    // Process report templates in batches
    const batchSize = 10;
    let processed = 0;
    
    // Use cursor for efficient processing of large collections
    const cursor = reportTemplatesCollection.find();
    
    let batch = [];
    let doc = await cursor.next();
    
    while (doc) {
      // Transform report template document
      const transformedReportTemplate = transformReportTemplate(doc);
      batch.push(transformedReportTemplate);
      
      // Process batch when it reaches batch size
      if (batch.length >= batchSize) {
        await processBatch(pgClient, batch);
        processed += batch.length;
        console.log(`Processed ${processed}/${count} report templates`);
        batch = [];
      }
      
      // Get next document
      doc = await cursor.next();
    }
    
    // Process remaining report templates
    if (batch.length > 0) {
      await processBatch(pgClient, batch);
      processed += batch.length;
      console.log(`Processed ${processed}/${count} report templates`);
    }
    
    // Commit transaction
    await pgClient.query('COMMIT');
    
    console.log('Report templates migration completed successfully');
    
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

// Function to transform MongoDB report template to PostgreSQL format
function transformReportTemplate(doc) {
  // Extract MongoDB _id as string
  const id = doc._id.toString();
  
  // Handle dates
  const createdAt = doc.createdAt instanceof Date ? doc.createdAt : 
                   (doc.createdAt ? new Date(doc.createdAt) : null);
  
  const updatedAt = doc.updatedAt instanceof Date ? doc.updatedAt : 
                   (doc.updatedAt ? new Date(doc.updatedAt) : null);
  
  // Extract title, description, and template
  const title = doc.title || '';
  const description = doc.description || '';
  const templateId = doc.template || null;
  
  // Extract createdBy
  const createdBy = doc.createdBy ? doc.createdBy.toString() : null;
  
  // Extract visibility and archived
  const visibility = doc.visibility || 0;
  const archived = doc.archived || false;
  
  // Extract components
  const components = doc.components || [];
  
  // Create content object for report_templates table
  const content = {
    title,
    description,
    template: templateId,
    components,
    visibility,
    createdBy,
    archived,
    __v: doc.__v
  };
  
  // Return both report_templates and reporttemplates_fixed data
  return {
    id,
    // For report_templates table
    report_template: {
      id,
      name: title,
      description,
      content: JSON.stringify(content),
      created_at: createdAt,
      updated_at: updatedAt
    },
    // For reporttemplates_fixed table
    reporttemplates_fixed: {
      id,
      title,
      description,
      template: templateId,
      components: JSON.stringify(components),
      visibility,
      created_by: createdBy,
      archived,
      created_at: createdAt,
      updated_at: updatedAt,
      version: 0
    }
  };
}

// Process a batch of report templates
async function processBatch(pgClient, batch) {
  for (const reportTemplate of batch) {
    await insertReportTemplateIntoPostgres(pgClient, reportTemplate);
  }
}

// Function to insert report template into PostgreSQL
async function insertReportTemplateIntoPostgres(pgClient, reportTemplate) {
  try {
    // Check if template exists in templates table if it's not null
    if (reportTemplate.reporttemplates_fixed.template) {
      const templateExists = await checkRecordExists(pgClient, 'templates', reportTemplate.reporttemplates_fixed.template);
      if (!templateExists) {
        console.warn(`Template ${reportTemplate.reporttemplates_fixed.template} does not exist in PostgreSQL. Setting template to NULL for report template ${reportTemplate.id}.`);
        reportTemplate.reporttemplates_fixed.template = null;
      }
    }
    
    // Check if created_by exists in users table if it's not null
    if (reportTemplate.reporttemplates_fixed.created_by) {
      const userExists = await checkRecordExists(pgClient, 'users', reportTemplate.reporttemplates_fixed.created_by);
      if (!userExists) {
        console.warn(`User ${reportTemplate.reporttemplates_fixed.created_by} does not exist in PostgreSQL. Setting created_by to NULL for report template ${reportTemplate.id}.`);
        reportTemplate.reporttemplates_fixed.created_by = null;
      }
    }
    
    // Insert into report_templates table
    const reportTemplateQuery = `
      INSERT INTO report_templates (
        id, name, description, content, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (id) DO UPDATE SET
        name = $2,
        description = $3,
        content = $4,
        updated_at = $6
    `;
    
    const reportTemplateValues = [
      reportTemplate.report_template.id,
      reportTemplate.report_template.name,
      reportTemplate.report_template.description,
      reportTemplate.report_template.content,
      reportTemplate.report_template.created_at,
      reportTemplate.report_template.updated_at
    ];
    
    await pgClient.query(reportTemplateQuery, reportTemplateValues);
    
    // Insert into reporttemplates_fixed table
    const reporttemplatesFixedQuery = `
      INSERT INTO reporttemplates_fixed (
        id, title, description, template, components, visibility, created_by, archived, created_at, updated_at, version
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (id) DO UPDATE SET
        title = $2,
        description = $3,
        template = $4,
        components = $5,
        visibility = $6,
        created_by = $7,
        archived = $8,
        updated_at = $10,
        version = $11
    `;
    
    const reporttemplatesFixedValues = [
      reportTemplate.reporttemplates_fixed.id,
      reportTemplate.reporttemplates_fixed.title,
      reportTemplate.reporttemplates_fixed.description,
      reportTemplate.reporttemplates_fixed.template,
      reportTemplate.reporttemplates_fixed.components,
      reportTemplate.reporttemplates_fixed.visibility,
      reportTemplate.reporttemplates_fixed.created_by,
      reportTemplate.reporttemplates_fixed.archived,
      reportTemplate.reporttemplates_fixed.created_at,
      reportTemplate.reporttemplates_fixed.updated_at,
      reportTemplate.reporttemplates_fixed.version
    ];
    
    await pgClient.query(reporttemplatesFixedQuery, reporttemplatesFixedValues);
  } catch (error) {
    console.error(`Error inserting report template ${reportTemplate.id}:`, error);
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
migrateReportTemplatesOnly()
  .then(() => console.log('Report templates migration script completed'))
  .catch(err => console.error('Report templates migration script failed:', err));
