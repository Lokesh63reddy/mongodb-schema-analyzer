const { connectToDatabase, closeConnection, getDatabase } = require('./db');
const { analyzeCollectionSchema, analyzeRelationships } = require('./schemaAnalyzer');

async function main() {
  try {
    await connectToDatabase();
    const db = await getDatabase();
    
    // Get all collection names
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    console.log(`Found ${collectionNames.length} collections: ${collectionNames.join(', ')}`);
    
    // Analyze schema for each collection
    console.log('\n=== Collection Schemas ===');
    for (const collectionName of collectionNames) {
      console.log(`\nAnalyzing schema for collection: ${collectionName}`);
      const schemaInfo = await analyzeCollectionSchema(collectionName);
      
      console.log(`Document count: ${schemaInfo.documentCount}`);
      console.log(`Common fields: ${schemaInfo.commonFields.join(', ')}`);
      console.log(`Potential unique fields: ${schemaInfo.uniqueFields.join(', ')}`);
      
      console.log('Field details:');
      Object.keys(schemaInfo.fields).forEach(fieldPath => {
        const field = schemaInfo.fields[fieldPath];
        const types = Object.keys(field.types).join(', ');
        console.log(`  - ${fieldPath}: ${types} (${Math.round(field.frequency * 100)}% of documents)`);
      });
    }
    
    // Analyze relationships between collections
    if (collectionNames.length > 1) {
      console.log('\n=== Collection Relationships ===');
      const relationships = await analyzeRelationships(collectionNames);
      
      if (relationships.length === 0) {
        console.log('No clear relationships detected between collections.');
      } else {
        relationships.forEach(rel => {
          console.log(`${rel.sourceCollection} -> ${rel.targetCollection} via ${rel.fieldPath} (${rel.confidence} confidence)`);
        });
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await closeConnection();
  }
}

main();
