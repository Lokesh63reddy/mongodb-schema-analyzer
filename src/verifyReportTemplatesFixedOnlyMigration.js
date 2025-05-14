/**
 * Script to verify reporttemplates_fixed table migration from MongoDB to PostgreSQL
 * This script focuses exclusively on the reporttemplates_fixed table
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

// Main function to verify reporttemplates_fixed migration
async function verifyReportTemplatesFixedOnlyMigration() {
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
    
    // Count reporttemplates_fixed in PostgreSQL
    const pgResult = await pgClient.query('SELECT COUNT(*) FROM reporttemplates_fixed');
    const pgCount = parseInt(pgResult.rows[0].count);
    console.log(`Found ${pgCount} report templates in PostgreSQL reporttemplates_fixed table`);
    
    // Compare counts
    if (mongoCount === pgCount) {
      console.log('✅ Report template counts match!');
    } else {
      console.log(`❌ Report template counts don't match: MongoDB (${mongoCount}) vs PostgreSQL (${pgCount})`);
    }
    
    // Sample a few report templates to verify data integrity
    console.log('\nVerifying sample report templates:');
    const sampleReportTemplates = await reportTemplatesCollection.find().limit(3).toArray();
    
    for (const mongoReportTemplate of sampleReportTemplates) {
      const mongoId = mongoReportTemplate._id.toString();
      const pgResult = await pgClient.query('SELECT * FROM reporttemplates_fixed WHERE id = $1', [mongoId]);
      
      if (pgResult.rows.length === 0) {
        console.log(`❌ Report template ${mongoId} not found in PostgreSQL`);
        continue;
      }
      
      const pgReportTemplate = pgResult.rows[0];
      
      // Compare key fields
      console.log(`\nComparing report template ${mongoId}:`);
      
      // Title
      const mongoTitle = mongoReportTemplate.title || '';
      if (mongoTitle === pgReportTemplate.title) {
        console.log(`✅ Title matches: ${pgReportTemplate.title}`);
      } else {
        console.log(`❌ Title mismatch: MongoDB (${mongoTitle}) vs PostgreSQL (${pgReportTemplate.title})`);
      }
      
      // Description
      const mongoDescription = mongoReportTemplate.description || '';
      if (mongoDescription === pgReportTemplate.description) {
        console.log(`✅ Description matches: ${pgReportTemplate.description}`);
      } else {
        console.log(`❌ Description mismatch: MongoDB (${mongoDescription}) vs PostgreSQL (${pgReportTemplate.description})`);
      }
      
      // Template
      const mongoTemplate = mongoReportTemplate.template || null;
      if (mongoTemplate === pgReportTemplate.template) {
        console.log(`✅ Template reference matches: ${pgReportTemplate.template}`);
      } else {
        console.log(`❌ Template reference mismatch: MongoDB (${mongoTemplate}) vs PostgreSQL (${pgReportTemplate.template})`);
      }
      
      // Components
      if (pgReportTemplate.components) {
        try {
          const pgComponents = JSON.parse(pgReportTemplate.components);
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
      
      // Visibility
      const mongoVisibility = mongoReportTemplate.visibility || 0;
      if (mongoVisibility === pgReportTemplate.visibility) {
        console.log(`✅ Visibility matches: ${pgReportTemplate.visibility}`);
      } else {
        console.log(`❌ Visibility mismatch: MongoDB (${mongoVisibility}) vs PostgreSQL (${pgReportTemplate.visibility})`);
      }
      
      // Created By
      const mongoCreatedBy = mongoReportTemplate.createdBy ? mongoReportTemplate.createdBy.toString() : null;
      if (mongoCreatedBy === pgReportTemplate.created_by) {
        console.log(`✅ Created By matches: ${pgReportTemplate.created_by}`);
      } else {
        console.log(`❌ Created By mismatch: MongoDB (${mongoCreatedBy}) vs PostgreSQL (${pgReportTemplate.created_by})`);
      }
      
      // Archived
      const mongoArchived = mongoReportTemplate.archived || false;
      if (mongoArchived === pgReportTemplate.archived) {
        console.log(`✅ Archived status matches: ${pgReportTemplate.archived}`);
      } else {
        console.log(`❌ Archived status mismatch: MongoDB (${mongoArchived}) vs PostgreSQL (${pgReportTemplate.archived})`);
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
verifyReportTemplatesFixedOnlyMigration()
  .then(() => console.log('Report templates fixed verification script completed'))
  .catch(err => console.error('Report templates fixed verification script failed:', err));
