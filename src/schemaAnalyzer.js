const { getDatabase } = require('./db');

/**
 * Analyzes the schema of a MongoDB collection
 * @param {string} collectionName - The name of the collection to analyze
 * @param {number} sampleSize - Number of documents to sample (default: 100)
 * @returns {Object} Schema information
 */
async function analyzeCollectionSchema(collectionName, sampleSize = 100) {
  const db = await getDatabase();
  const collection = db.collection(collectionName);
  
  // Get sample documents
  const sampleDocs = await collection.find().limit(sampleSize).toArray();
  
  if (sampleDocs.length === 0) {
    return { error: 'No documents found in collection' };
  }
  
  // Analyze schema
  const schemaInfo = {
    collectionName,
    documentCount: await collection.countDocuments(),
    sampleSize: sampleDocs.length,
    fields: {},
    commonFields: [],
    uniqueFields: new Set(),
  };
  
  // Analyze each document to build field information
  sampleDocs.forEach(doc => {
    const fields = extractFields(doc);
    
    fields.forEach(field => {
      if (!schemaInfo.fields[field.path]) {
        schemaInfo.fields[field.path] = {
          types: {},
          count: 0,
          examples: []
        };
      }
      
      const fieldInfo = schemaInfo.fields[field.path];
      fieldInfo.count++;
      
      const type = getType(field.value);
      fieldInfo.types[type] = (fieldInfo.types[type] || 0) + 1;
      
      if (fieldInfo.examples.length < 3 && !fieldInfo.examples.includes(field.value)) {
        fieldInfo.examples.push(field.value);
      }
    });
  });
  
  // Calculate field frequency and identify common fields
  Object.keys(schemaInfo.fields).forEach(fieldPath => {
    const field = schemaInfo.fields[fieldPath];
    field.frequency = field.count / sampleDocs.length;
    
    if (field.frequency > 0.9) {
      schemaInfo.commonFields.push(fieldPath);
    }
    
    // Check if field might be unique
    if (field.count === sampleDocs.length && new Set(field.examples).size === field.examples.length) {
      schemaInfo.uniqueFields.add(fieldPath);
    }
  });
  
  // Convert uniqueFields from Set to Array
  schemaInfo.uniqueFields = Array.from(schemaInfo.uniqueFields);
  
  return schemaInfo;
}

/**
 * Extract all fields from a document with their paths
 * @param {Object} doc - MongoDB document
 * @param {string} prefix - Field path prefix
 * @returns {Array} Array of {path, value} objects
 */
function extractFields(doc, prefix = '') {
  let fields = [];
  
  Object.keys(doc).forEach(key => {
    if (key === '_id') return; // Skip _id field
    
    const path = prefix ? `${prefix}.${key}` : key;
    const value = doc[key];
    
    fields.push({ path, value });
    
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      // Recursively extract fields from nested objects
      fields = fields.concat(extractFields(value, path));
    }
  });
  
  return fields;
}

/**
 * Get the type of a value
 * @param {any} value - The value to check
 * @returns {string} Type name
 */
function getType(value) {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  if (value instanceof Date) return 'date';
  return typeof value;
}

/**
 * Analyze relationships between collections
 * @param {Array} collectionNames - Array of collection names to analyze
 * @returns {Object} Relationship information
 */
async function analyzeRelationships(collectionNames) {
  const db = await getDatabase();
  const relationships = [];
  
  // Get schema info for all collections
  const schemaInfos = {};
  for (const collectionName of collectionNames) {
    schemaInfos[collectionName] = await analyzeCollectionSchema(collectionName);
  }
  
  // Look for potential relationships
  for (const sourceCollection of collectionNames) {
    const sourceSchema = schemaInfos[sourceCollection];
    
    for (const fieldPath in sourceSchema.fields) {
      // Skip array fields for simplicity
      if (Object.keys(sourceSchema.fields[fieldPath].types).includes('array')) {
        continue;
      }
      
      // Check if field name suggests a relationship
      const fieldName = fieldPath.split('.').pop();
      if (fieldName.endsWith('Id') || fieldName.endsWith('_id')) {
        const possibleTargetName = fieldName.replace(/Id$|_id$/, '');
        
        // Check if there's a collection with a similar name
        for (const targetCollection of collectionNames) {
          if (targetCollection.toLowerCase() === possibleTargetName.toLowerCase() ||
              targetCollection.toLowerCase() === `${possibleTargetName.toLowerCase()}s`) {
            relationships.push({
              sourceCollection,
              targetCollection,
              fieldPath,
              relationshipType: 'reference',
              confidence: 'medium'
            });
          }
        }
      }
    }
  }
  
  return relationships;
}

module.exports = {
  analyzeCollectionSchema,
  analyzeRelationships
};
