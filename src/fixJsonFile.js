const fs = require('fs');
const path = require('path');

// Configuration
const sourceFilePath = 'C:\\Users\\KATREDDY LOKESH\\Downloads\\mechdx_data-20250513T022728Z-1-001\\mechdx_data\\reporttemplates.json';
const outputFilePath = 'C:\\Users\\KATREDDY LOKESH\\Downloads\\mechdx_data-20250513T022728Z-1-001\\mechdx_data\\reporttemplates_fixed.json';

// Function to fix the JSON file
async function fixJsonFile() {
  try {
    console.log(`Fixing file: ${sourceFilePath}`);
    
    // Check if file exists
    if (!fs.existsSync(sourceFilePath)) {
      console.error(`Source file does not exist: ${sourceFilePath}`);
      return;
    }
    
    // Read the file
    const data = fs.readFileSync(sourceFilePath, 'utf8');
    console.log(`Read ${data.length} bytes of data`);
    
    // Extract all valid JSON objects
    const jsonObjects = extractValidJsonObjects(data);
    
    if (jsonObjects.length === 0) {
      console.error('No valid JSON objects found in the file');
      return;
    }
    
    console.log(`Extracted ${jsonObjects.length} valid JSON objects`);
    
    // Write the fixed JSON to the output file
    fs.writeFileSync(outputFilePath, JSON.stringify(jsonObjects, null, 2), 'utf8');
    console.log(`Fixed JSON written to: ${outputFilePath}`);
    
    // Create a backup of the original file
    const backupFilePath = sourceFilePath + '.bak';
    fs.copyFileSync(sourceFilePath, backupFilePath);
    console.log(`Original file backed up to: ${backupFilePath}`);
    
    // Replace the original file with the fixed version
    fs.copyFileSync(outputFilePath, sourceFilePath);
    console.log(`Original file replaced with fixed version`);
    
  } catch (error) {
    console.error(`Error fixing JSON file: ${error.message}`);
  }
}

// Function to extract all valid JSON objects from a string
function extractValidJsonObjects(data) {
  const jsonObjects = [];
  
  // First try to parse the entire file
  try {
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed)) {
      console.log('File is already a valid JSON array');
      return parsed;
    } else {
      console.log('File is a valid JSON object');
      return [parsed];
    }
  } catch (e) {
    console.log(`Full file parse error: ${e.message}`);
  }
  
  // Try to extract individual JSON objects
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
        console.log(`Found valid JSON object #${jsonObjects.length} at positions ${nextOpenBrace}-${closingPos}`);
      } catch (e) {
        console.log(`Found invalid JSON at positions ${nextOpenBrace}-${closingPos}: ${e.message}`);
      }
    }
    
    currentPos = Math.max(closingPos, nextOpenBrace + 1);
  }
  
  // If we couldn't extract any objects, try the JSONL approach
  if (jsonObjects.length === 0) {
    console.log('Trying JSONL approach (one JSON object per line)');
    
    const lines = data.split(/\r?\n/).filter(line => line.trim() !== '');
    for (const line of lines) {
      try {
        const obj = JSON.parse(line);
        jsonObjects.push(obj);
      } catch (e) {
        // Skip invalid lines
      }
    }
  }
  
  return jsonObjects;
}

// Run the fix
fixJsonFile()
  .then(() => console.log('JSON file fix complete'))
  .catch(err => console.error('Error:', err));
