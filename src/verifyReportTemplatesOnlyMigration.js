/**
 * Script to verify report_templates table migration from MongoDB to PostgreSQL
 * This script verifies both report_templates and reporttemplates_fixed tables
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

// Main function to verify report templates migration
async function verifyReportTemplatesOnlyMigration() {
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
    
    // Count report templates in MongoDB
    const mongoCount = await reportTemplatesCollection.countDocuments();
    console.log(`Found ${mongoCount} report templates in MongoDB`);
    
    // Count report templates in PostgreSQL
    const pgReportTemplatesResult = await pgClient.query('SELECT COUNT(*) FROM report_templates');
    const pgReportTemplatesCount = parseInt(pgReportTemplatesResult.rows[0].count);
    console.log(`Found ${pgReportTemplatesCount} report templates in PostgreSQL report_templates table`);
    
    // Count reporttemplates_fixed in PostgreSQL
    const pgReportTemplatesFixedResult = await pgClient.query('SELECT COUNT(*) FROM reporttemplates_fixed');
    const pgReportTemplatesFixedCount = parseInt(pgReportTemplatesFixedResult.rows[0].count);
    console.log(`Found ${pgReportTemplatesFixedCount} report templates in PostgreSQL reporttemplates_fixed table`);
    
    // Compare counts
    if (mongoCount === pgReportTemplatesCount && mongoCount === pgReportTemplatesFixedCount) {
      console.log('✅ Report template counts match in all tables!');
    } else {
      console.log(`❌ Report template counts don't match: MongoDB (${mongoCount}) vs PostgreSQL report_templates (${pgReportTemplatesCount}) vs PostgreSQL reporttemplates_fixed (${pgReportTemplatesFixedCount})`);
    }
    
    // Sample a few report templates to verify data integrity
    console.log('\nVerifying sample report templates:');
    const sampleReportTemplates = await reportTemplatesCollection.find().limit(3).toArray();
    
    for (const mongoReportTemplate of sampleReportTemplates) {
      const mongoId = mongoReportTemplate._id.toString();
      
      // Check report_templates table
      const pgReportTemplateResult = await pgClient.query('SELECT * FROM report_templates WHERE id = $1', [mongoId]);
      
      if (pgReportTemplateResult.rows.length === 0) {
        console.log(`❌ Report template ${mongoId} not found in PostgreSQL report_templates table`);
        continue;
      }
      
      const pgReportTemplate = pgReportTemplateResult.rows[0];
      
      // Check reporttemplates_fixed table
      const pgReportTemplateFixedResult = await pgClient.query('SELECT * FROM reporttemplates_fixed WHERE id = $1', [mongoId]);
      
      if (pgReportTemplateFixedResult.rows.length === 0) {
        console.log(`❌ Report template ${mongoId} not found in PostgreSQL reporttemplates_fixed table`);
        continue;
      }
      
      const pgReportTemplateFixed = pgReportTemplateFixedResult.rows[0];
      
      // Compare key fields
      console.log(`\nComparing report template ${mongoId}:`);
      
      // Title/Name
      const mongoTitle = mongoReportTemplate.title || '';
      if (mongoTitle === pgReportTemplate.name && mongoTitle === pgReportTemplateFixed.title) {
        console.log(`✅ Title/Name matches: ${pgReportTemplate.name}`);
      } else {
        console.log(`❌ Title/Name mismatch: MongoDB (${mongoTitle}) vs PostgreSQL report_templates (${pgReportTemplate.name}) vs PostgreSQL reporttemplates_fixed (${pgReportTemplateFixed.title})`);
      }
      
      // Description
      const mongoDescription = mongoReportTemplate.description || '';
      if (mongoDescription === pgReportTemplate.description && mongoDescription === pgReportTemplateFixed.description) {
        console.log(`✅ Description matches: ${pgReportTemplate.description}`);
      } else {
        console.log(`❌ Description mismatch: MongoDB (${mongoDescription}) vs PostgreSQL report_templates (${pgReportTemplate.description}) vs PostgreSQL reporttemplates_fixed (${pgReportTemplateFixed.description})`);
      }
      
      // Template
      const mongoTemplate = mongoReportTemplate.template || null;
      if (mongoTemplate === pgReportTemplateFixed.template) {
        console.log(`✅ Template reference matches: ${pgReportTemplateFixed.template}`);
      } else {
        console.log(`❌ Template reference mismatch: MongoDB (${mongoTemplate}) vs PostgreSQL reporttemplates_fixed (${pgReportTemplateFixed.template})`);
      }
      
      // Components
      if (pgReportTemplateFixed.components) {
        try {
          const pgComponents = JSON.parse(pgReportTemplateFixed.components);
          const mongoComponents = mongoReportTemplate.components || [];
          
          if (pgComponents.length === mongoComponents.length) {
            console.log(`✅ Components array length matches: ${pgComponents.length}`);
          } else {
            console.log(`❌ Components array length mismatch: MongoDB (${mongoComponents.length}) vs PostgreSQL (${pgComponents.length})`);
          }
        } catch (error) {
          console.log(`❌ Error parsing components JSON: ${error.message}`);
        }
      } else {
        console.log(`❌ Components is null in PostgreSQL`);
      }
      
      // Content in report_templates
      if (pgReportTemplate.content) {
        try {
          const pgContent = JSON.parse(pgReportTemplate.content);
          
          // Check title in content
          if (mongoReportTemplate.title === pgContent.title) {
            console.log(`✅ Title in content matches: ${pgContent.title}`);
          } else {
            console.log(`❌ Title in content mismatch: MongoDB (${mongoReportTemplate.title}) vs PostgreSQL (${pgContent.title})`);
          }
          
          // Check archived in content
          if (mongoReportTemplate.archived === pgContent.archived) {
            console.log(`✅ Archived status in content matches: ${pgContent.archived}`);
          } else {
            console.log(`❌ Archived status in content mismatch: MongoDB (${mongoReportTemplate.archived}) vs PostgreSQL (${pgContent.archived})`);
          }
          
        } catch (error) {
          console.log(`❌ Error parsing content JSON: ${error.message}`);
        }
      } else {
        console.log(`❌ Content is null in PostgreSQL`);
      }
    }
    
    // Check template references
    console.log('\nChecking template references:');
    const templateReferences = await pgClient.query(`
      SELECT template, COUNT(*) 
      FROM reporttemplates_fixed 
      WHERE template IS NOT NULL 
      GROUP BY template 
      LIMIT 5
    `);
    
    for (const row of templateReferences.rows) {
      const templateId = row.template;
      const count = parseInt(row.count);
      
      // Check if template exists in templates table
      const templateExists = await checkRecordExists(pgClient, 'templates', templateId);
      if (templateExists) {
        console.log(`✅ Template ${templateId} exists in PostgreSQL templates table with ${count} references`);
      } else {
        console.log(`❌ Template ${templateId} does not exist in PostgreSQL templates table but has ${count} references`);
      }
    }
    
    // Check created_by references
    console.log('\nChecking created_by references:');
    const createdByReferences = await pgClient.query(`
      SELECT created_by, COUNT(*) 
      FROM reporttemplates_fixed 
      WHERE created_by IS NOT NULL 
      GROUP BY created_by 
      LIMIT 5
    `);
    
    for (const row of createdByReferences.rows) {
      const userId = row.created_by;
      const count = parseInt(row.count);
      
      // Check if user exists in users table
      const userExists = await checkRecordExists(pgClient, 'users', userId);
      if (userExists) {
        console.log(`✅ User ${userId} exists in PostgreSQL users table with ${count} report templates`);
      } else {
        console.log(`❌ User ${userId} does not exist in PostgreSQL users table but has ${count} report templates`);
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
verifyReportTemplatesOnlyMigration()
  .then(() => console.log('Report templates verification script completed'))
  .catch(err => console.error('Report templates verification script failed:', err));
