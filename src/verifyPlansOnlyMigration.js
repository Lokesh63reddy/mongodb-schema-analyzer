/**
 * Script to verify plans table migration from MongoDB to PostgreSQL
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

// Main function to verify plans migration
async function verifyPlansOnlyMigration() {
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
    
    // Get plans collection
    const plansCollection = db.collection('plans');
    
    // Count plans in MongoDB
    const mongoCount = await plansCollection.countDocuments();
    console.log(`Found ${mongoCount} plans in MongoDB`);
    
    // Count plans in PostgreSQL
    const pgResult = await pgClient.query('SELECT COUNT(*) FROM plans');
    const pgCount = parseInt(pgResult.rows[0].count);
    console.log(`Found ${pgCount} plans in PostgreSQL`);
    
    // Compare counts
    if (mongoCount === pgCount) {
      console.log('✅ Plan counts match!');
    } else {
      console.log(`❌ Plan counts don't match: MongoDB (${mongoCount}) vs PostgreSQL (${pgCount})`);
    }
    
    // Sample all plans to verify data integrity (since there are only a few)
    console.log('\nVerifying all plans:');
    const allPlans = await plansCollection.find().toArray();
    
    for (const mongoPlan of allPlans) {
      const mongoId = mongoPlan._id.toString();
      const pgResult = await pgClient.query('SELECT * FROM plans WHERE id = $1', [mongoId]);
      
      if (pgResult.rows.length === 0) {
        console.log(`❌ Plan ${mongoId} not found in PostgreSQL`);
        continue;
      }
      
      const pgPlan = pgResult.rows[0];
      
      // Compare key fields
      console.log(`\nComparing plan ${mongoId}:`);
      
      // Name
      const mongoName = mongoPlan.name || '';
      if (mongoName === pgPlan.name) {
        console.log(`✅ Name matches: ${pgPlan.name}`);
      } else {
        console.log(`❌ Name mismatch: MongoDB (${mongoName}) vs PostgreSQL (${pgPlan.name})`);
      }
      
      // Description
      const mongoDescription = mongoPlan.description || '';
      if (mongoDescription === pgPlan.description) {
        console.log(`✅ Description matches: ${pgPlan.description}`);
      } else {
        console.log(`❌ Description mismatch: MongoDB (${mongoDescription}) vs PostgreSQL (${pgPlan.description})`);
      }
      
      // Features
      if (pgPlan.features) {
        try {
          const pgFeatures = JSON.parse(pgPlan.features);
          const mongoPermissions = mongoPlan.permissions || [];
          
          if (pgFeatures.length === mongoPermissions.length) {
            console.log(`✅ Features array length matches: ${pgFeatures.length}`);
          } else {
            console.log(`❌ Features array length mismatch: MongoDB (${mongoPermissions.length}) vs PostgreSQL (${pgFeatures.length})`);
          }
          
        } catch (error) {
          console.log(`❌ Error parsing features JSON: ${error.message}`);
        }
      } else {
        console.log(`❌ Features is null in PostgreSQL`);
      }
      
      // Price
      console.log(`ℹ️ Price in PostgreSQL: ${pgPlan.price} (default value, not present in MongoDB)`);
    }
    
    // List all plans
    console.log('\nListing all plans:');
    const allPgPlans = await pgClient.query(`
      SELECT id, name, description, price 
      FROM plans 
      ORDER BY name
    `);
    
    console.log('Plans in PostgreSQL:');
    for (const row of allPgPlans.rows) {
      console.log(`- ${row.name} (${row.description}, Price: ${row.price}, ID: ${row.id})`);
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
verifyPlansOnlyMigration()
  .then(() => console.log('Plans verification script completed'))
  .catch(err => console.error('Plans verification script failed:', err));
