/**
 * Script to verify templates table migration from MongoDB to PostgreSQL
 * This script only verifies the templates table
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

// Main function to verify templates migration
async function verifyTemplatesOnlyMigration() {
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
    
    // Count templates in MongoDB
    const mongoCount = await templatesCollection.countDocuments();
    console.log(`Found ${mongoCount} templates in MongoDB`);
    
    // Count templates in PostgreSQL
    const pgResult = await pgClient.query('SELECT COUNT(*) FROM templates');
    const pgCount = parseInt(pgResult.rows[0].count);
    console.log(`Found ${pgCount} templates in PostgreSQL`);
    
    // Compare counts
    if (mongoCount === pgCount) {
      console.log('✅ Template counts match!');
    } else {
      console.log(`❌ Template counts don't match: MongoDB (${mongoCount}) vs PostgreSQL (${pgCount})`);
    }
    
    // Sample a few templates to verify data integrity
    console.log('\nVerifying sample templates:');
    const sampleTemplates = await templatesCollection.find().limit(3).toArray();
    
    for (const mongoTemplate of sampleTemplates) {
      const mongoId = mongoTemplate._id.toString();
      const pgResult = await pgClient.query('SELECT * FROM templates WHERE id = $1', [mongoId]);
      
      if (pgResult.rows.length === 0) {
        console.log(`❌ Template ${mongoId} not found in PostgreSQL`);
        continue;
      }
      
      const pgTemplate = pgResult.rows[0];
      
      // Compare key fields
      console.log(`\nComparing template ${mongoId}:`);
      
      // Name
      const mongoName = mongoTemplate.name || '';
      if (mongoName === pgTemplate.name) {
        console.log(`✅ Name matches: ${pgTemplate.name}`);
      } else {
        console.log(`❌ Name mismatch: MongoDB (${mongoName}) vs PostgreSQL (${pgTemplate.name})`);
      }
      
      // Content
      if (pgTemplate.content) {
        try {
          const pgContent = JSON.parse(pgTemplate.content);
          
          // Check archived status
          if (mongoTemplate.archived === pgContent.archived) {
            console.log(`✅ Archived status in content matches: ${pgContent.archived}`);
          } else {
            console.log(`❌ Archived status in content mismatch: MongoDB (${mongoTemplate.archived}) vs PostgreSQL (${pgContent.archived})`);
          }
          
          // Check defaultVariant
          if (mongoTemplate.defaultVariant === pgContent.defaultVariant) {
            console.log(`✅ Default variant in content matches: ${pgContent.defaultVariant}`);
          } else {
            console.log(`❌ Default variant in content mismatch: MongoDB (${mongoTemplate.defaultVariant}) vs PostgreSQL (${pgContent.defaultVariant})`);
          }
          
          // Check variants array length
          const mongoVariantsLength = mongoTemplate.variants ? mongoTemplate.variants.length : 0;
          const pgVariantsLength = pgContent.variants ? pgContent.variants.length : 0;
          
          if (mongoVariantsLength === pgVariantsLength) {
            console.log(`✅ Variants array length matches: ${pgVariantsLength}`);
          } else {
            console.log(`❌ Variants array length mismatch: MongoDB (${mongoVariantsLength}) vs PostgreSQL (${pgVariantsLength})`);
          }
          
          // Check first variant name if available
          if (mongoVariantsLength > 0 && pgVariantsLength > 0) {
            const mongoFirstVariantName = mongoTemplate.variants[0].name;
            const pgFirstVariantName = pgContent.variants[0].name;
            
            if (mongoFirstVariantName === pgFirstVariantName) {
              console.log(`✅ First variant name matches: ${pgFirstVariantName}`);
            } else {
              console.log(`❌ First variant name mismatch: MongoDB (${mongoFirstVariantName}) vs PostgreSQL (${pgFirstVariantName})`);
            }
          }
          
        } catch (error) {
          console.log(`❌ Error parsing content JSON: ${error.message}`);
        }
      } else {
        console.log(`❌ Content is null in PostgreSQL`);
      }
    }
    
    // Check for references to templates in other tables
    console.log('\nChecking references to templates:');
    
    // Check reporttemplates_fixed table if it exists
    try {
      const reportTemplatesResult = await pgClient.query(`
        SELECT COUNT(*) FROM reporttemplates_fixed WHERE template IS NOT NULL
      `);
      
      const reportTemplatesCount = parseInt(reportTemplatesResult.rows[0].count);
      console.log(`Found ${reportTemplatesCount} references to templates in reporttemplates_fixed table`);
      
      if (reportTemplatesCount > 0) {
        // Sample a few references
        const sampleReferences = await pgClient.query(`
          SELECT id, title, template FROM reporttemplates_fixed WHERE template IS NOT NULL LIMIT 3
        `);
        
        for (const row of sampleReferences.rows) {
          const templateId = row.template;
          
          // Check if template exists in templates table
          const templateExists = await pgClient.query('SELECT EXISTS(SELECT 1 FROM templates WHERE id = $1)', [templateId]);
          
          if (templateExists.rows[0].exists) {
            console.log(`✅ Template ${templateId} referenced by reporttemplates_fixed ${row.id} (${row.title}) exists`);
          } else {
            console.log(`❌ Template ${templateId} referenced by reporttemplates_fixed ${row.id} (${row.title}) does not exist`);
          }
        }
      }
    } catch (error) {
      console.log(`⚠️ Could not check reporttemplates_fixed table: ${error.message}`);
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
verifyTemplatesOnlyMigration()
  .then(() => console.log('Templates verification script completed'))
  .catch(err => console.error('Templates verification script failed:', err));
