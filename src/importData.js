const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
require('dotenv').config();

// Configuration
const dataDir = 'C:\\Users\\KATREDDY LOKESH\\Downloads\\mechdx_data-20250513T022728Z-1-001\\mechdx_data';
const mongoUri = process.env.MONGODB_URI;
const dbName = process.env.DATABASE_NAME;

// Function to read JSON files from a directory
async function readJsonFiles(directory) {
  try {
    const files = await fs.promises.readdir(directory);
    const jsonFiles = files.filter(file => path.extname(file).toLowerCase() === '.json');

    console.log(`Found ${jsonFiles.length} JSON files in the directory.`);
    return jsonFiles;
  } catch (error) {
    console.error(`Error reading directory: ${error.message}`);
    throw error;
  }
}

// Function to examine file structure for debugging
async function examineFileStructure(filePath) {
  try {
    const data = await fs.promises.readFile(filePath, 'utf8');
    const lines = data.split(/\r?\n/);

    console.log(`File structure analysis for ${path.basename(filePath)}:`);
    console.log(`- Total size: ${data.length} bytes`);
    console.log(`- Total lines: ${lines.length}`);

    // Show first few characters
    console.log(`- First 50 characters: ${JSON.stringify(data.substring(0, 50))}`);

    // Check if it starts with [ or {
    if (data.trim().startsWith('[')) {
      console.log('- File appears to start with an array [');
    } else if (data.trim().startsWith('{')) {
      console.log('- File appears to start with an object {');
    } else {
      console.log(`- File starts with unexpected character: ${data.trim()[0]}`);
    }

    // Check if it's potentially JSONL format
    let jsonlCount = 0;
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      if (lines[i].trim().startsWith('{') && lines[i].trim().endsWith('}')) {
        jsonlCount++;
      }
    }
    if (jsonlCount > 0) {
      console.log(`- ${jsonlCount} of the first 5 lines appear to be individual JSON objects (possible JSONL format)`);
    }

    // Check for concatenated JSON objects
    const matches = data.match(/}\s*{/g);
    if (matches && matches.length > 0) {
      console.log(`- Found ${matches.length} potential concatenated JSON objects (}{ pattern)`);
    }

    // Show problematic positions if they exist
    if (data.length > 348) {
      console.log(`- Characters around position 349: ${JSON.stringify(data.substring(345, 355))}`);
    }
  } catch (error) {
    console.error(`Error examining file structure: ${error.message}`);
  }
}

// Function to parse JSON file
async function parseJsonFile(filePath) {
  try {
    // First examine the file structure for debugging
    await examineFileStructure(filePath);

    const data = await fs.promises.readFile(filePath, 'utf8');
    try {
      // First try normal parsing
      return JSON.parse(data);
    } catch (parseError) {
      // If normal parsing fails, try to fix common JSON issues
      console.log(`Standard JSON parsing failed for ${filePath}, attempting to fix format...`);
      return fixAndParseJson(data, filePath);
    }
  } catch (error) {
    console.error(`Error reading JSON file ${filePath}: ${error.message}`);
    throw error;
  }
}

// Function to fix common JSON formatting issues
function fixAndParseJson(data, filePath) {
  const fileName = path.basename(filePath);

  // Special handling for reporttemplates.json
  if (fileName === 'reporttemplates.json') {
    console.log('Applying special fix for reporttemplates.json');

    // Based on the error message, try a very specific fix for reporttemplates.json
    try {
      // The error suggests there might be multiple JSON objects concatenated
      // First, try to extract the first valid JSON object
      let firstObject = null;
      try {
        // Find the first complete JSON object
        const firstClosingBrace = data.indexOf('}');
        if (firstClosingBrace > 0) {
          const firstObjectStr = data.substring(0, firstClosingBrace + 1);
          firstObject = JSON.parse(firstObjectStr);
          console.log('Successfully extracted the first JSON object');

          // If we only want the first object, return it
          return [firstObject];
        }
      } catch (e) {
        console.error(`Failed to extract first JSON object: ${e.message}`);
      }

      // Try a more manual approach - split at position 349 (the error location)
      try {
        const firstPart = data.substring(0, 349);
        // Find the last complete JSON object in the first part
        const lastOpenBrace = firstPart.lastIndexOf('{');
        const lastCloseBrace = firstPart.lastIndexOf('}');

        if (lastCloseBrace > lastOpenBrace && lastOpenBrace >= 0) {
          // We have a complete JSON object
          const jsonStr = firstPart.substring(lastOpenBrace, lastCloseBrace + 1);
          try {
            const obj = JSON.parse(jsonStr);
            console.log('Successfully extracted JSON object using position-based approach');
            return [obj];
          } catch (e) {
            console.error(`Failed to parse extracted JSON: ${e.message}`);
          }
        }
      } catch (e) {
        console.error(`Failed with position-based approach: ${e.message}`);
      }
    } catch (e) {
      console.error(`Failed specific reporttemplates.json fix: ${e.message}`);
    }

    // Try to handle the case where multiple JSON objects are concatenated
    try {
      // Split by newlines and filter out empty lines
      const lines = data.split(/\r?\n/).filter(line => line.trim() !== '');

      // Check if each line might be a separate JSON object
      const jsonObjects = [];

      for (let line of lines) {
        try {
          const obj = JSON.parse(line);
          jsonObjects.push(obj);
        } catch (e) {
          // If a line isn't valid JSON, try to find valid JSON objects within it
          // This is a more aggressive approach for badly formatted files
          const potentialObjects = line.split('}{');

          if (potentialObjects.length > 1) {
            for (let i = 0; i < potentialObjects.length; i++) {
              let potentialObj = potentialObjects[i];

              // Add missing braces
              if (!potentialObj.startsWith('{')) potentialObj = '{' + potentialObj;
              if (!potentialObj.endsWith('}')) potentialObj = potentialObj + '}';

              try {
                const obj = JSON.parse(potentialObj);
                jsonObjects.push(obj);
              } catch (e) {
                // Skip invalid objects
              }
            }
          }
        }
      }

      if (jsonObjects.length > 0) {
        console.log(`Successfully extracted ${jsonObjects.length} JSON objects from file`);
        return jsonObjects;
      }
    } catch (e) {
      console.error(`Failed to fix JSON with line-by-line approach: ${e.message}`);
    }

    // If the above approach failed, try another method
    try {
      // Replace any sequence of }{, which might indicate concatenated JSON objects
      const fixedData = data.replace(/}\s*{/g, '},{');

      // Wrap in array brackets if it seems like multiple objects
      if (fixedData.includes('},{')) {
        const arrayData = '[' + fixedData + ']';
        return JSON.parse(arrayData);
      }

      // Try parsing again
      return JSON.parse(fixedData);
    } catch (e) {
      console.error(`Failed to fix JSON with replacement approach: ${e.message}`);
    }

    // Last resort: try to manually fix the file by reading it as text and extracting valid parts
    try {
      console.log('Attempting last resort manual fix...');

      // Try to extract all valid JSON objects from the file
      const jsonObjects = [];
      let currentPos = 0;

      while (currentPos < data.length) {
        // Find the next opening brace
        const nextOpenBrace = data.indexOf('{', currentPos);
        if (nextOpenBrace === -1) break;

        // Find the matching closing brace
        let braceCount = 1;
        let closingPos = nextOpenBrace + 1;

        while (braceCount > 0 && closingPos < data.length) {
          if (data[closingPos] === '{') braceCount++;
          else if (data[closingPos] === '}') braceCount--;
          closingPos++;
        }

        if (braceCount === 0) {
          // We found a complete JSON object
          try {
            const jsonStr = data.substring(nextOpenBrace, closingPos);
            const obj = JSON.parse(jsonStr);
            jsonObjects.push(obj);
          } catch (e) {
            // Not a valid JSON object, continue
          }
        }

        currentPos = closingPos;
      }

      if (jsonObjects.length > 0) {
        console.log(`Last resort approach: extracted ${jsonObjects.length} valid JSON objects`);
        return jsonObjects;
      }
    } catch (e) {
      console.error(`Last resort approach failed: ${e.message}`);
    }
  }

  // Generic approach for other files
  try {
    // Try to handle JSONL (JSON Lines) format
    const lines = data.split(/\r?\n/).filter(line => line.trim() !== '');
    const jsonObjects = [];

    let validLines = 0;
    for (const line of lines) {
      try {
        if (line.trim()) {
          const obj = JSON.parse(line);
          jsonObjects.push(obj);
          validLines++;
        }
      } catch (e) {
        // Skip invalid lines
      }
    }

    if (validLines > 0) {
      console.log(`File appears to be in JSONL format. Extracted ${validLines} valid objects.`);
      return jsonObjects;
    }
  } catch (e) {
    console.error(`Failed to parse as JSONL: ${e.message}`);
  }

  // If all else fails, throw an error
  throw new Error(`Could not parse JSON file after multiple attempts`);
}

// Function to convert MongoDB Extended JSON format to standard format
function convertExtendedJsonToStandard(data) {
  if (!data) return data;

  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(item => convertExtendedJsonToStandard(item));
  }

  // Handle objects
  if (typeof data === 'object' && data !== null) {
    const result = {};

    for (const [key, value] of Object.entries(data)) {
      // Skip fields that start with '-' as they seem to be causing issues
      if (key.startsWith('-')) {
        console.log(`Skipping field with problematic name: ${key}`);
        continue;
      }

      // Handle $oid fields (MongoDB ObjectId)
      if (value && typeof value === 'object' && value.$oid) {
        try {
          // Convert $oid to MongoDB ObjectId
          // Use string version to avoid deprecated signature warning
          result[key] = value.$oid;
        } catch (e) {
          console.log(`Could not convert $oid value for field ${key}, using as string: ${e.message}`);
          result[key] = value.$oid; // Use as string if conversion fails
        }
      }
      // Handle $date fields (MongoDB Date)
      else if (value && typeof value === 'object' && value.$date) {
        try {
          // Convert $date to JavaScript Date
          if (typeof value.$date === 'string') {
            result[key] = new Date(value.$date);
          } else if (typeof value.$date === 'object' && value.$date.$numberLong) {
            result[key] = new Date(parseInt(value.$date.$numberLong));
          } else {
            result[key] = new Date(value.$date);
          }
        } catch (e) {
          console.log(`Could not convert $date value for field ${key}: ${e.message}`);
          result[key] = null; // Use null if conversion fails
        }
      }
      // Handle nested objects and arrays
      else if (value && typeof value === 'object') {
        result[key] = convertExtendedJsonToStandard(value);
      }
      // Handle primitive values
      else {
        result[key] = value;
      }
    }

    return result;
  }

  // Return primitive values as is
  return data;
}

// Function to sanitize document fields
function sanitizeDocument(doc) {
  if (!doc) return doc;

  // Handle arrays
  if (Array.isArray(doc)) {
    return doc.map(item => sanitizeDocument(item));
  }

  // Handle objects
  if (typeof doc === 'object' && doc !== null) {
    const result = {};

    for (const [key, value] of Object.entries(doc)) {
      // Skip fields with problematic names (starting with '-', '$', or containing dots)
      if (key.startsWith('-') || key.startsWith('$') || key.includes('.')) {
        console.log(`Skipping field with problematic name: ${key}`);
        continue;
      }

      // Handle nested objects and arrays
      if (value && typeof value === 'object') {
        result[key] = sanitizeDocument(value);
      } else {
        result[key] = value;
      }
    }

    return result;
  }

  // Return primitive values as is
  return doc;
}

// Function to import data into MongoDB
async function importToMongoDB(collectionName, data) {
  const client = new MongoClient(mongoUri);

  try {
    await client.connect();
    console.log(`Connected to MongoDB for collection: ${collectionName}`);

    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Check if collection already has data
    const count = await collection.countDocuments();
    if (count > 0) {
      console.log(`Collection ${collectionName} already has ${count} documents. Dropping collection...`);
      await collection.drop();
    }

    // Convert Extended JSON format and sanitize documents
    console.log(`Converting and sanitizing data for collection: ${collectionName}`);
    let processedData;

    if (Array.isArray(data)) {
      processedData = data.map(doc => {
        // First convert Extended JSON format
        const convertedDoc = convertExtendedJsonToStandard(doc);
        // Then sanitize field names
        return sanitizeDocument(convertedDoc);
      });
    } else {
      // First convert Extended JSON format
      const convertedDoc = convertExtendedJsonToStandard(data);
      // Then sanitize field names
      processedData = sanitizeDocument(convertedDoc);
    }

    // Insert the processed data
    if (Array.isArray(processedData)) {
      if (processedData.length === 0) {
        console.log(`No data to import for collection: ${collectionName}`);
        return 0;
      }

      const result = await collection.insertMany(processedData);
      console.log(`Imported ${result.insertedCount} documents into collection: ${collectionName}`);
      return result.insertedCount;
    } else {
      await collection.insertOne(processedData);
      console.log(`Imported 1 document into collection: ${collectionName}`);
      return 1;
    }
  } catch (error) {
    console.error(`Error importing data to MongoDB for collection ${collectionName}: ${error.message}`);
    throw error;
  } finally {
    await client.close();
  }
}

// Main function to process all files
async function importAllData() {
  try {
    const jsonFiles = await readJsonFiles(dataDir);
    let totalDocuments = 0;
    let successfulImports = 0;

    for (const file of jsonFiles) {
      const filePath = path.join(dataDir, file);
      const collectionName = path.basename(file, '.json');

      try {
        console.log(`\nProcessing file: ${file} for collection: ${collectionName}`);
        const data = await parseJsonFile(filePath);
        const importedCount = await importToMongoDB(collectionName, data);

        totalDocuments += importedCount;
        successfulImports++;
      } catch (error) {
        console.error(`Failed to import ${file}: ${error.message}`);
      }
    }

    console.log(`\n=== Import Summary ===`);
    console.log(`Total files processed: ${jsonFiles.length}`);
    console.log(`Successful imports: ${successfulImports}`);
    console.log(`Failed imports: ${jsonFiles.length - successfulImports}`);
    console.log(`Total documents imported: ${totalDocuments}`);

  } catch (error) {
    console.error(`Import process failed: ${error.message}`);
  }
}

// Run the import
importAllData()
  .then(() => console.log('Import process completed.'))
  .catch(err => console.error('Import process failed:', err));
