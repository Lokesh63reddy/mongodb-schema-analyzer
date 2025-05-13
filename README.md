# MongoDB Schema Analyzer

A Node.js tool for analyzing MongoDB database schemas and relationships between collections.

## Features

- Analyze the schema of MongoDB collections
- Detect common fields and their data types
- Identify potential unique fields
- Discover relationships between collections
- Generate schema statistics

## Installation

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Configure your MongoDB connection in the `.env` file:
   ```
   MONGODB_URI=mongodb://localhost:27017/
   DATABASE_NAME=your_database_name
   ```

## Usage

Run the analyzer:

```
npm start
```

The tool will:
1. Connect to your MongoDB database
2. List all collections
3. Analyze the schema of each collection
4. Detect relationships between collections
5. Output the results to the console

## Customization

You can modify the `src/index.js` file to:
- Analyze specific collections instead of all collections
- Change the sample size for schema analysis
- Export the results to a file
- Visualize the schema and relationships

## How It Works

The schema analyzer:
1. Samples documents from each collection
2. Extracts field paths and their values
3. Determines data types and frequencies
4. Identifies common fields and potential unique fields
5. Looks for naming patterns that suggest relationships

## License

ISC
