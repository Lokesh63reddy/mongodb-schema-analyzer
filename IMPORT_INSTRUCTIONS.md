# MongoDB Data Import Instructions

This document provides instructions for importing JSON data files into MongoDB using the provided import script.

## Prerequisites

1. MongoDB server running (locally or remotely)
2. Node.js installed
3. JSON data files located at: `C:\Users\KATREDDY LOKESH\Downloads\mechdx_data-20250513T022728Z-1-001\mechdx_data`

## Configuration

The import script uses the following configuration from the `.env` file:

```
MONGODB_URI=mongodb://localhost:27017/
DATABASE_NAME=mechdx
```

Make sure these settings are correct for your environment:
- `MONGODB_URI`: The connection string for your MongoDB server
- `DATABASE_NAME`: The name of the database where collections will be imported

## Running the Import

To import all JSON files from the specified directory:

```bash
npm run import
```

## Handling Problematic JSON Files

If you encounter issues with malformed JSON files (like the `reporttemplates.json` file), you can use the following utilities:

### 1. Examine a Problematic File

To analyze the structure of a problematic JSON file:

```bash
npm run examine
```

This will:
- Show detailed information about the file structure
- Attempt to identify valid JSON objects within the file
- Display information about potential formatting issues

### 2. Fix a Problematic JSON File

To automatically fix a problematic JSON file:

```bash
npm run fix-json
```

This will:
- Extract all valid JSON objects from the file
- Create a fixed version of the file
- Back up the original file
- Replace the original file with the fixed version

## Handling MongoDB Extended JSON Format

The import script now automatically handles MongoDB Extended JSON format, which includes special field types like:

- `$oid` fields (MongoDB ObjectIds)
- `$date` fields (MongoDB Dates)
- Fields with problematic names (starting with `-`, `$`, or containing dots)

### How It Works

1. The script detects fields in Extended JSON format
2. It converts these fields to appropriate MongoDB types
3. It sanitizes field names that would cause import errors
4. It skips fields that cannot be properly imported

This ensures that data exported from MongoDB using tools like `mongoexport` can be properly imported back into MongoDB.

## What the Import Script Does

1. Reads all JSON files from the specified directory
2. For each file:
   - Uses the filename (without extension) as the collection name
   - Parses the JSON content
   - Drops the collection if it already exists
   - Imports the data into a new collection
3. Provides a summary of the import process

## Handling Different JSON Formats

The script handles two types of JSON files:
- Files containing an array of documents (most common)
- Files containing a single document

## Troubleshooting

If you encounter issues:

1. **Connection errors**: Verify MongoDB is running and the connection string is correct
2. **Permission errors**: Ensure you have read access to the data files
3. **JSON parsing errors**: Check that the JSON files are valid
4. **Import failures**: Look at the specific error messages in the console output

## After Import

After importing the data, you can run the schema analyzer to examine the imported collections:

```bash
npm start
```

This will analyze the schema of each collection and identify potential relationships between them.
