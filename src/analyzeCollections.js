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

// Function to analyze a collection
async function analyzeCollection(db, collectionName) {
  console.log(`\nAnalyzing collection: ${collectionName}`);
  
  const collection = db.collection(collectionName);
  const count = await collection.countDocuments();
  
  console.log(`Total documents: ${count}`);
  
  if (count === 0) {
    console.log('Collection is empty. Skipping analysis.');
    return {
      name: collectionName,
      count: 0,
      fields: [],
      sample: null
    };
  }
  
  // Get a sample document
  const sampleDoc = await collection.findOne();
  
  // Get field names and types
  const fields = [];
  const analyzeObject = (obj, prefix = '') => {
    if (!obj) return;
    
    Object.entries(obj).forEach(([key, value]) => {
      const fieldPath = prefix ? `${prefix}.${key}` : key;
      let type = typeof value;
      
      if (value === null) {
        type = 'null';
      } else if (Array.isArray(value)) {
        type = 'array';
        if (value.length > 0) {
          const itemType = typeof value[0];
          type = `array(${itemType})`;
          
          // If array contains objects, analyze first item
          if (itemType === 'object' && value[0] !== null) {
            analyzeObject(value[0], `${fieldPath}[0]`);
          }
        }
      } else if (type === 'object') {
        if (value instanceof Date) {
          type = 'date';
        } else {
          // Recursively analyze nested objects
          analyzeObject(value, fieldPath);
        }
      }
      
      fields.push({
        path: fieldPath,
        type: type,
        example: value
      });
    });
  };
  
  analyzeObject(sampleDoc);
  
  // Get a few more samples for key fields
  const sampleSize = Math.min(5, count);
  const samples = await collection.find().limit(sampleSize).toArray();
  
  return {
    name: collectionName,
    count,
    fields,
    samples
  };
}

// Main function
async function analyzeCollections() {
  const client = new MongoClient(mongoUri);
  
  try {
    await client.connect();
    console.log(`Connected to MongoDB database: ${dbName}`);
    
    const db = client.db(dbName);
    const collections = await db.listCollections().toArray();
    
    console.log(`Found ${collections.length} collections`);
    
    const results = [];
    for (const collInfo of collections) {
      const result = await analyzeCollection(db, collInfo.name);
      results.push(result);
    }
    
    // Generate report
    generateReport(results);
    
    console.log(`\nAnalysis complete. Results saved to ${outputDir}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

// Function to generate report
function generateReport(results) {
  // Create summary report
  let summaryReport = '# MongoDB Collections Analysis\n\n';
  summaryReport += `Database: ${dbName}\n`;
  summaryReport += `Collections analyzed: ${results.length}\n\n`;
  
  summaryReport += '## Collections Summary\n\n';
  summaryReport += '| Collection | Documents | Fields |\n';
  summaryReport += '|------------|-----------|-------|\n';
  
  results.forEach(result => {
    const uniqueTopLevelFields = new Set();
    result.fields.forEach(field => {
      if (!field.path.includes('.')) {
        uniqueTopLevelFields.add(field.path);
      }
    });
    
    summaryReport += `| ${result.name} | ${result.count} | ${uniqueTopLevelFields.size} |\n`;
  });
  
  // Save summary report
  fs.writeFileSync(path.join(outputDir, 'collections_summary.md'), summaryReport);
  
  // Save detailed analysis for each collection
  results.forEach(result => {
    if (result.count === 0) return;
    
    const fileName = `${result.name}_analysis.md`;
    let report = `# ${result.name} Collection Analysis\n\n`;
    
    report += `Documents: ${result.count}\n\n`;
    
    report += '## Field Analysis\n\n';
    report += '| Field | Type | Example |\n';
    report += '|-------|------|--------|\n';
    
    // Group fields by path
    const fieldsByPath = {};
    result.fields.forEach(field => {
      fieldsByPath[field.path] = field;
    });
    
    // Sort fields by path
    const sortedFields = Object.values(fieldsByPath).sort((a, b) => {
      // Put top-level fields first
      const aDepth = a.path.split('.').length;
      const bDepth = b.path.split('.').length;
      if (aDepth !== bDepth) return aDepth - bDepth;
      return a.path.localeCompare(b.path);
    });
    
    sortedFields.forEach(field => {
      let example = '';
      if (field.type === 'object' || field.type.startsWith('array')) {
        example = field.type;
      } else if (field.type === 'string') {
        example = `"${String(field.example).substring(0, 30)}${String(field.example).length > 30 ? '...' : ''}"`;
      } else {
        example = String(field.example).substring(0, 50);
      }
      
      report += `| ${field.path} | ${field.type} | ${example} |\n`;
    });
    
    report += '\n## Sample Document\n\n';
    report += '```json\n' + JSON.stringify(result.samples[0], null, 2) + '\n```\n\n';
    
    // Potential relationships
    report += '## Potential Relationships\n\n';
    const potentialForeignKeys = sortedFields.filter(field => 
      !field.path.includes('.') && 
      (field.path.endsWith('_id') || field.path.endsWith('Id') || field.path === 'id') &&
      field.path !== '_id'
    );
    
    if (potentialForeignKeys.length > 0) {
      report += 'Fields that might be foreign keys:\n\n';
      potentialForeignKeys.forEach(field => {
        report += `- ${field.path}\n`;
      });
    } else {
      report += 'No obvious foreign key fields detected.\n';
    }
    
    fs.writeFileSync(path.join(outputDir, fileName), report);
  });
  
  // Save raw data for further processing
  fs.writeFileSync(
    path.join(outputDir, 'analysis_data.json'), 
    JSON.stringify(results, null, 2)
  );
}

// Run the analysis
analyzeCollections()
  .then(() => console.log('Analysis script completed'))
  .catch(err => console.error('Analysis script failed:', err));
