const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Configuration
const mongoUri = process.env.MONGODB_URI;
const dbName = process.env.DATABASE_NAME;
const outputDir = path.join(__dirname, '..', 'migration_output');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// MongoDB to PostgreSQL type mapping
const mongoToPgTypeMap = {
  'string': 'TEXT',
  'number': 'NUMERIC',
  'boolean': 'BOOLEAN',
  'date': 'TIMESTAMP',
  'objectId': 'TEXT',
  'array': 'JSONB',
  'object': 'JSONB',
  'null': 'TEXT',
  'undefined': 'TEXT'
};

// Function to get PostgreSQL type from MongoDB value
function getPgType(value) {
  if (value === null) return mongoToPgTypeMap['null'];
  if (Array.isArray(value)) return mongoToPgTypeMap['array'];
  if (value instanceof Date) return mongoToPgTypeMap['date'];
  
  const type = typeof value;
  if (type === 'object') {
    // Check if it's an ObjectId (string representation in our case)
    if (value.$oid || (typeof value.toString === 'function' && 
        value.toString().match(/^[0-9a-fA-F]{24}$/))) {
      return mongoToPgTypeMap['objectId'];
    }
    return mongoToPgTypeMap['object'];
  }
  
  return mongoToPgTypeMap[type] || 'TEXT';
}

// Function to sanitize field name for PostgreSQL
function sanitizeFieldName(name) {
  // Replace invalid characters and convert to lowercase
  return name.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
}

// Function to analyze a MongoDB collection for PostgreSQL migration
async function analyzeCollectionForPostgres(db, collectionName) {
  console.log(`\nAnalyzing collection: ${collectionName} for PostgreSQL migration`);
  
  const collection = db.collection(collectionName);
  const count = await collection.countDocuments();
  
  if (count === 0) {
    console.log(`Collection ${collectionName} is empty. Skipping analysis.`);
    return null;
  }
  
  console.log(`Collection has ${count} documents`);
  
  // Sample documents for analysis
  const sampleSize = Math.min(100, count);
  const sampleDocs = await collection.find().limit(sampleSize).toArray();
  
  // Analyze fields
  const fieldAnalysis = {};
  const nestedFields = new Set();
  const arrayFields = new Set();
  
  sampleDocs.forEach(doc => {
    analyzeDocument(doc, '', fieldAnalysis, nestedFields, arrayFields);
  });
  
  // Generate PostgreSQL schema
  const tableName = sanitizeFieldName(collectionName);
  const pgSchema = generatePostgresSchema(tableName, fieldAnalysis, nestedFields, arrayFields);
  
  // Generate migration strategy
  const migrationStrategy = generateMigrationStrategy(
    collectionName, 
    tableName, 
    fieldAnalysis, 
    nestedFields, 
    arrayFields
  );
  
  return {
    collectionName,
    documentCount: count,
    sampleSize,
    fieldAnalysis,
    nestedFields: Array.from(nestedFields),
    arrayFields: Array.from(arrayFields),
    postgresqlSchema: pgSchema,
    migrationStrategy
  };
}

// Function to recursively analyze document fields
function analyzeDocument(doc, prefix, fieldAnalysis, nestedFields, arrayFields, depth = 0) {
  // Limit recursion depth to avoid infinite loops
  if (depth > 5) return;
  
  Object.entries(doc).forEach(([key, value]) => {
    // Skip _id field at the root level
    if (depth === 0 && key === '_id') {
      const fieldName = prefix ? `${prefix}.${key}` : key;
      fieldAnalysis[fieldName] = {
        name: key,
        path: fieldName,
        types: { 'objectId': 1 },
        isPrimaryKey: true,
        samples: [value]
      };
      return;
    }
    
    const fieldName = prefix ? `${prefix}.${key}` : key;
    
    if (!fieldAnalysis[fieldName]) {
      fieldAnalysis[fieldName] = {
        name: key,
        path: fieldName,
        types: {},
        samples: []
      };
    }
    
    const field = fieldAnalysis[fieldName];
    
    // Determine the type
    let type;
    if (value === null) {
      type = 'null';
    } else if (Array.isArray(value)) {
      type = 'array';
      arrayFields.add(fieldName);
      
      // Analyze array items if they exist
      if (value.length > 0) {
        // If array contains objects, analyze them
        value.forEach((item, index) => {
          if (item && typeof item === 'object' && !Array.isArray(item)) {
            analyzeDocument(item, `${fieldName}[${index}]`, fieldAnalysis, nestedFields, arrayFields, depth + 1);
          }
        });
      }
    } else if (value instanceof Date) {
      type = 'date';
    } else if (typeof value === 'object') {
      type = 'object';
      nestedFields.add(fieldName);
      
      // Recursively analyze nested objects
      analyzeDocument(value, fieldName, fieldAnalysis, nestedFields, arrayFields, depth + 1);
    } else {
      type = typeof value;
    }
    
    // Update type count
    field.types[type] = (field.types[type] || 0) + 1;
    
    // Add sample if we have fewer than 3
    if (field.samples.length < 3 && !field.samples.includes(value)) {
      if (type !== 'object' && type !== 'array') {
        field.samples.push(value);
      } else {
        // For objects and arrays, just note the type
        field.samples.push(`[${type}]`);
      }
    }
  });
}

// Function to generate PostgreSQL schema
function generatePostgresSchema(tableName, fieldAnalysis, nestedFields, arrayFields) {
  let schema = `CREATE TABLE ${tableName} (\n`;
  const columns = [];
  const constraints = [];
  
  // Process fields
  Object.values(fieldAnalysis).forEach(field => {
    // Skip nested fields and array fields - they'll be handled separately
    if (field.path.includes('.') || arrayFields.has(field.path)) {
      return;
    }
    
    // Determine PostgreSQL type based on MongoDB types
    let pgType;
    const types = Object.keys(field.types);
    
    if (types.includes('objectId') || field.isPrimaryKey) {
      pgType = 'TEXT';
    } else if (types.includes('date')) {
      pgType = 'TIMESTAMP';
    } else if (types.includes('number')) {
      pgType = 'NUMERIC';
    } else if (types.includes('boolean')) {
      pgType = 'BOOLEAN';
    } else if (types.includes('object') || types.includes('array')) {
      pgType = 'JSONB';
    } else {
      pgType = 'TEXT';
    }
    
    const columnName = sanitizeFieldName(field.name);
    let columnDef = `  "${columnName}" ${pgType}`;
    
    // Add NOT NULL if the field appears in all documents
    // This is a simplification - would need more analysis for a real migration
    if (field.isPrimaryKey) {
      columnDef += ' NOT NULL';
      constraints.push(`  PRIMARY KEY ("${columnName}")`);
    }
    
    columns.push(columnDef);
  });
  
  // Add columns for nested objects and arrays as JSONB
  nestedFields.forEach(fieldPath => {
    // Only handle top-level nested fields
    if (!fieldPath.includes('.')) {
      const columnName = sanitizeFieldName(fieldPath);
      columns.push(`  "${columnName}" JSONB`);
    }
  });
  
  arrayFields.forEach(fieldPath => {
    // Only handle top-level array fields
    if (!fieldPath.includes('.')) {
      const columnName = sanitizeFieldName(fieldPath);
      columns.push(`  "${columnName}" JSONB`);
    }
  });
  
  schema += columns.join(',\n');
  
  if (constraints.length > 0) {
    schema += ',\n' + constraints.join(',\n');
  }
  
  schema += '\n);\n';
  
  return schema;
}

// Function to generate migration strategy
function generateMigrationStrategy(collectionName, tableName, fieldAnalysis, nestedFields, arrayFields) {
  let strategy = `-- Migration strategy for ${collectionName} to ${tableName}\n\n`;
  
  // Basic migration steps
  strategy += `1. Create the PostgreSQL table:\n\n`;
  
  // Identify complex fields that need special handling
  const complexFields = [...nestedFields, ...arrayFields].filter(f => !f.includes('.'));
  
  if (complexFields.length > 0) {
    strategy += `2. Complex fields that need special handling:\n`;
    complexFields.forEach(field => {
      strategy += `   - ${field}: Store as JSONB\n`;
    });
    strategy += '\n';
  }
  
  // Relationships
  strategy += `3. Potential relationships to consider:\n`;
  
  // Look for fields that might be foreign keys
  Object.values(fieldAnalysis).forEach(field => {
    if (field.path.includes('.')) return; // Skip nested fields
    
    const name = field.name.toLowerCase();
    if (
      (name.endsWith('_id') || name.endsWith('id') || name === 'id') &&
      !field.isPrimaryKey
    ) {
      strategy += `   - ${field.path} might be a foreign key to another table\n`;
    }
  });
  
  strategy += '\n4. Data migration approach:\n';
  strategy += '   - Extract data from MongoDB\n';
  strategy += '   - Transform nested structures to match PostgreSQL schema\n';
  strategy += '   - Load data into PostgreSQL\n\n';
  
  strategy += '5. Indexing strategy:\n';
  strategy += '   - Create indexes on frequently queried fields\n';
  strategy += '   - Consider creating GIN indexes for JSONB fields if you need to query inside them\n\n';
  
  return strategy;
}

// Main function to analyze all collections
async function analyzeForPostgresqlMigration() {
  const client = new MongoClient(mongoUri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(dbName);
    const collections = await db.listCollections().toArray();
    
    console.log(`Found ${collections.length} collections`);
    
    // Analyze each collection
    const analysisResults = [];
    for (const collInfo of collections) {
      const result = await analyzeCollectionForPostgres(db, collInfo.name);
      if (result) {
        analysisResults.push(result);
      }
    }
    
    // Generate migration report
    generateMigrationReport(analysisResults);
    
    console.log(`\nMigration analysis complete. Results saved to ${outputDir}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

// Function to generate migration report
function generateMigrationReport(results) {
  // Create summary report
  let summaryReport = '# MongoDB to PostgreSQL Migration Report\n\n';
  summaryReport += `Database: ${dbName}\n`;
  summaryReport += `Collections analyzed: ${results.length}\n\n`;
  
  summaryReport += '## Collections Summary\n\n';
  summaryReport += '| Collection | Documents | PostgreSQL Table | Complex Fields |\n';
  summaryReport += '|------------|-----------|------------------|----------------|\n';
  
  results.forEach(result => {
    const complexFields = [...result.nestedFields, ...result.arrayFields]
      .filter(f => !f.includes('.'))
      .length;
    
    summaryReport += `| ${result.collectionName} | ${result.documentCount} | ${sanitizeFieldName(result.collectionName)} | ${complexFields} |\n`;
  });
  
  // Save summary report
  fs.writeFileSync(path.join(outputDir, 'migration_summary.md'), summaryReport);
  
  // Save detailed analysis for each collection
  results.forEach(result => {
    const fileName = `${sanitizeFieldName(result.collectionName)}_analysis.md`;
    let report = `# ${result.collectionName} Analysis\n\n`;
    
    report += `Documents: ${result.documentCount}\n`;
    report += `Sample size: ${result.sampleSize}\n\n`;
    
    report += '## Field Analysis\n\n';
    report += '| Field | Types | PostgreSQL Type | Notes |\n';
    report += '|-------|-------|----------------|-------|\n';
    
    Object.values(result.fieldAnalysis)
      .filter(field => !field.path.includes('.')) // Only show top-level fields
      .forEach(field => {
        const types = Object.keys(field.types).join(', ');
        const pgType = getPgType(field.samples[0]);
        const notes = [];
        
        if (field.isPrimaryKey) notes.push('Primary Key');
        if (result.nestedFields.includes(field.path)) notes.push('Nested Object');
        if (result.arrayFields.includes(field.path)) notes.push('Array');
        
        report += `| ${field.path} | ${types} | ${pgType} | ${notes.join(', ')} |\n`;
      });
    
    report += '\n## PostgreSQL Schema\n\n';
    report += '```sql\n' + result.postgresqlSchema + '```\n\n';
    
    report += '## Migration Strategy\n\n';
    report += result.migrationStrategy;
    
    fs.writeFileSync(path.join(outputDir, fileName), report);
  });
  
  // Generate SQL schema file with all tables
  let sqlSchema = '-- PostgreSQL schema for all collections\n\n';
  results.forEach(result => {
    sqlSchema += result.postgresqlSchema + '\n';
  });
  
  fs.writeFileSync(path.join(outputDir, 'postgresql_schema.sql'), sqlSchema);
  
  // Generate migration script template
  let migrationScript = `
const { MongoClient } = require('mongodb');
const { Client } = require('pg');
require('dotenv').config();

// Configuration
const mongoUri = process.env.MONGODB_URI;
const mongoDbName = process.env.DATABASE_NAME;
const pgConfig = {
  host: process.env.PG_HOST || 'localhost',
  port: process.env.PG_PORT || 5432,
  database: process.env.PG_DATABASE,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD
};

async function migrateData() {
  const mongoClient = new MongoClient(mongoUri);
  const pgClient = new Client(pgConfig);
  
  try {
    // Connect to both databases
    await mongoClient.connect();
    await pgClient.connect();
    
    console.log('Connected to both MongoDB and PostgreSQL');
    
    const mongoDb = mongoClient.db(mongoDbName);
    
    // Begin transaction
    await pgClient.query('BEGIN');
    
    // Migrate each collection
${results.map(result => `    await migrate${result.collectionName}(mongoDb, pgClient);`).join('\n')}
    
    // Commit transaction
    await pgClient.query('COMMIT');
    
    console.log('Migration completed successfully');
    
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

${results.map(result => `
async function migrate${result.collectionName}(mongoDb, pgClient) {
  console.log('Migrating ${result.collectionName}...');
  
  const collection = mongoDb.collection('${result.collectionName}');
  const documents = await collection.find().toArray();
  
  console.log(\`Found \${documents.length} documents in ${result.collectionName}\`);
  
  for (const doc of documents) {
    // Transform document for PostgreSQL
    const pgDoc = transformDocument${result.collectionName}(doc);
    
    // Insert into PostgreSQL
    await insertInto${sanitizeFieldName(result.collectionName)}(pgClient, pgDoc);
  }
  
  console.log(\`Migrated \${documents.length} documents from ${result.collectionName}\`);
}

function transformDocument${result.collectionName}(doc) {
  // Transform MongoDB document to PostgreSQL format
  return {
    // Map fields appropriately
    ${Object.values(result.fieldAnalysis)
      .filter(field => !field.path.includes('.') && !result.arrayFields.includes(field.path))
      .map(field => {
        if (field.name === '_id') {
          return `${sanitizeFieldName(field.name)}: doc._id.toString()`;
        } else if (result.nestedFields.includes(field.path)) {
          return `${sanitizeFieldName(field.name)}: doc.${field.name} ? JSON.stringify(doc.${field.name}) : null`;
        } else {
          return `${sanitizeFieldName(field.name)}: doc.${field.name}`;
        }
      })
      .join(',\n    ')}
  };
}

async function insertInto${sanitizeFieldName(result.collectionName)}(pgClient, doc) {
  const query = \`
    INSERT INTO ${sanitizeFieldName(result.collectionName)} (
      ${Object.values(result.fieldAnalysis)
        .filter(field => !field.path.includes('.'))
        .map(field => `"${sanitizeFieldName(field.name)}"`)
        .join(',\n      ')}
    ) VALUES (
      ${Object.values(result.fieldAnalysis)
        .filter(field => !field.path.includes('.'))
        .map((_, i) => `$\${i + 1}`)
        .join(', ')}
    )
  \`;
  
  const values = [
    ${Object.values(result.fieldAnalysis)
      .filter(field => !field.path.includes('.'))
      .map(field => `doc.${sanitizeFieldName(field.name)}`)
      .join(',\n    ')}
  ];
  
  await pgClient.query(query, values);
}
`).join('\n')}

// Run the migration
migrateData()
  .then(() => console.log('Migration script completed'))
  .catch(err => console.error('Migration script failed:', err));
`;

  fs.writeFileSync(path.join(outputDir, 'migration_script.js'), migrationScript);
}

// Run the analysis
analyzeForPostgresqlMigration()
  .then(() => console.log('Analysis complete'))
  .catch(err => console.error('Analysis failed:', err));
