const fs = require('fs');
const path = require('path');

// Path to the problematic file
const filePath = 'C:\\Users\\KATREDDY LOKESH\\Downloads\\mechdx_data-20250513T022728Z-1-001\\mechdx_data\\reporttemplates.json';

// Function to examine file structure
async function examineFile() {
  try {
    console.log(`Examining file: ${filePath}`);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error(`File does not exist: ${filePath}`);
      return;
    }
    
    // Get file stats
    const stats = fs.statSync(filePath);
    console.log(`File size: ${stats.size} bytes`);
    
    // Read the file
    const data = fs.readFileSync(filePath, 'utf8');
    console.log(`Read ${data.length} bytes of data`);
    
    // Basic file structure analysis
    const lines = data.split(/\r?\n/);
    console.log(`File has ${lines.length} lines`);
    
    // Check first few characters
    console.log(`First 100 characters: ${JSON.stringify(data.substring(0, 100))}`);
    
    // Check characters around position 349 (where the error occurred)
    if (data.length > 349) {
      console.log(`Characters at position 349: ${JSON.stringify(data.substring(345, 355))}`);
    }
    
    // Try to find valid JSON objects
    console.log('\nAttempting to find valid JSON objects:');
    
    // Try parsing the whole file
    try {
      JSON.parse(data);
      console.log('The entire file is valid JSON');
    } catch (e) {
      console.log(`Full file parse error: ${e.message}`);
      
      // Try to find the first valid JSON object
      try {
        const firstClosingBrace = data.indexOf('}');
        if (firstClosingBrace > 0) {
          const firstObjectStr = data.substring(0, firstClosingBrace + 1);
          const firstObject = JSON.parse(firstObjectStr);
          console.log('Successfully parsed the first JSON object:');
          console.log(JSON.stringify(firstObject, null, 2).substring(0, 200) + '...');
        }
      } catch (e) {
        console.log(`Failed to parse first object: ${e.message}`);
      }
      
      // Check if it might be JSONL format (one JSON object per line)
      let validJsonLines = 0;
      for (let i = 0; i < Math.min(5, lines.length); i++) {
        try {
          if (lines[i].trim()) {
            JSON.parse(lines[i]);
            validJsonLines++;
          }
        } catch (e) {
          // Not valid JSON
        }
      }
      
      if (validJsonLines > 0) {
        console.log(`Found ${validJsonLines} valid JSON lines in the first 5 lines`);
      } else {
        console.log('No valid JSON lines found in the first 5 lines');
      }
      
      // Check for concatenated JSON objects
      const matches = data.match(/}\s*{/g);
      if (matches && matches.length > 0) {
        console.log(`Found ${matches.length} potential concatenated JSON objects (}{ pattern)`);
        
        // Try to fix by adding commas and wrapping in array
        try {
          const fixedData = '[' + data.replace(/}\s*{/g, '},{') + ']';
          JSON.parse(fixedData);
          console.log('Successfully parsed after adding commas and wrapping in array');
        } catch (e) {
          console.log(`Failed to parse after adding commas: ${e.message}`);
        }
      }
    }
    
    // Manual extraction of JSON objects
    console.log('\nAttempting manual extraction of JSON objects:');
    const jsonObjects = [];
    let currentPos = 0;
    let maxObjects = 5; // Limit to first 5 objects for brevity
    
    while (currentPos < data.length && jsonObjects.length < maxObjects) {
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
    
    console.log(`Extracted ${jsonObjects.length} valid JSON objects`);
    
    // Create a fixed version of the file if needed
    if (jsonObjects.length > 0) {
      const fixedFilePath = path.join(path.dirname(filePath), 'fixed_' + path.basename(filePath));
      fs.writeFileSync(fixedFilePath, JSON.stringify(jsonObjects), 'utf8');
      console.log(`Wrote fixed JSON to: ${fixedFilePath}`);
    }
    
  } catch (error) {
    console.error(`Error examining file: ${error.message}`);
  }
}

// Run the examination
examineFile()
  .then(() => console.log('File examination complete'))
  .catch(err => console.error('Error:', err));
