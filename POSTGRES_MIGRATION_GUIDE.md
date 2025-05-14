# MongoDB to PostgreSQL Migration Guide

This guide provides a comprehensive approach to migrating your data from MongoDB to PostgreSQL.

## Table of Contents

1. [Understanding the Differences](#understanding-the-differences)
2. [Migration Process Overview](#migration-process-overview)
3. [Schema Analysis and Design](#schema-analysis-and-design)
4. [Data Migration](#data-migration)
5. [Handling MongoDB-Specific Features](#handling-mongodb-specific-features)
6. [Post-Migration Validation](#post-migration-validation)
7. [Application Code Changes](#application-code-changes)

## Understanding the Differences

MongoDB and PostgreSQL represent two different database paradigms:

| MongoDB | PostgreSQL |
|---------|------------|
| Document-oriented (NoSQL) | Relational (SQL) |
| Schema-less | Schema-based |
| Nested documents | Relational tables |
| BSON format | Structured tables with data types |
| ObjectId as primary key | User-defined primary keys |

Key challenges in migration:
- Converting nested documents to relational structure
- Handling arrays and embedded documents
- Mapping MongoDB data types to PostgreSQL types
- Preserving relationships between collections

## Migration Process Overview

1. **Analyze MongoDB Schema**: Understand your data structure
2. **Design PostgreSQL Schema**: Create tables, relationships, and constraints
3. **Set Up PostgreSQL Environment**: Install and configure PostgreSQL
4. **Develop Migration Scripts**: Create scripts to transform and load data
5. **Test Migration**: Validate with a subset of data
6. **Perform Full Migration**: Execute the migration
7. **Validate Results**: Ensure data integrity and completeness
8. **Update Application Code**: Modify your application to work with PostgreSQL

## Schema Analysis and Design

### Analyzing Your MongoDB Schema

Run the schema analysis tool:

```bash
npm run pg-analyze
```

This will:
- Analyze all collections in your MongoDB database
- Generate a detailed report of field types and relationships
- Create a proposed PostgreSQL schema
- Suggest migration strategies for each collection

The analysis results will be saved in the `migration_output` directory:
- `migration_summary.md`: Overview of all collections
- `[collection_name]_analysis.md`: Detailed analysis for each collection
- `postgresql_schema.sql`: Generated PostgreSQL schema
- `migration_script.js`: Template for data migration

### PostgreSQL Schema Design Principles

1. **Normalize Data**: Break nested structures into separate tables
2. **Define Relationships**: Use foreign keys to maintain relationships
3. **Choose Appropriate Data Types**: Map MongoDB types to PostgreSQL types
4. **Handle Complex Data**: Store complex nested structures as JSON strings (TEXT)
5. **Define Constraints**: Add primary keys, foreign keys, and other constraints

## Data Migration

### Prerequisites

1. Install PostgreSQL client library:

```bash
npm install pg
```

2. Update your `.env` file to include PostgreSQL connection details:

```
PG_HOST=localhost
PG_PORT=5432
PG_DATABASE=your_database_name
PG_USER=your_username
PG_PASSWORD=your_password
```

### Migration Approaches

#### 1. Direct Migration

Use the generated migration script template:

```bash
node migration_output/migration_script.js
```

This script:
- Connects to both MongoDB and PostgreSQL
- Extracts data from MongoDB
- Transforms documents to match PostgreSQL schema
- Loads data into PostgreSQL tables

#### 2. ETL Tools

For large datasets, consider using ETL tools:
- Apache NiFi
- Talend
- Pentaho Data Integration

#### 3. Database Migration Services

Cloud providers offer migration services:
- AWS Database Migration Service
- Azure Database Migration Service
- Google Database Migration Service

## Handling MongoDB-Specific Features

### ObjectId

Convert MongoDB ObjectId to text in PostgreSQL:

```javascript
// In migration code
const id = doc._id.toString();
```

### Nested Documents

Options for handling nested documents:

1. **Normalization**: Create separate tables with foreign key relationships
2. **JSON Strings**: Store complex nested structures as JSON strings (TEXT) in PostgreSQL
3. **Hybrid Approach**: Normalize frequently queried fields, use TEXT for others

Example of using TEXT for JSON data:

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT,
  profile TEXT
);
```

### Arrays

Options for handling arrays:

1. **Junction Tables**: For arrays of simple values or references
2. **JSON Strings**: Store arrays as JSON strings (TEXT) in PostgreSQL
3. **PostgreSQL Arrays**: Use native PostgreSQL arrays for simple types
4. **Separate Tables**: Create child tables for complex array items

Example of a junction table:

```sql
CREATE TABLE user_tags (
  user_id TEXT REFERENCES users(id),
  tag TEXT,
  PRIMARY KEY (user_id, tag)
);
```

### Date/Time Handling

Convert MongoDB dates to PostgreSQL timestamps:

```javascript
// In migration code
const createdAt = new Date(doc.created_at);
```

## Post-Migration Validation

Validate your migration with these checks:

1. **Record Count**: Ensure all documents were migrated
2. **Data Integrity**: Verify data was correctly transformed
3. **Relationships**: Check that relationships are maintained
4. **Queries**: Test common queries against the new database
5. **Performance**: Benchmark query performance

## Application Code Changes

Update your application to work with PostgreSQL:

1. **Database Driver**: Replace MongoDB driver with PostgreSQL driver
2. **Query Language**: Convert MongoDB queries to SQL
3. **ORM/ODM**: Update or replace your data access layer
4. **Transaction Handling**: Implement proper transaction management
5. **Connection Pooling**: Configure connection pooling for PostgreSQL

### Example: MongoDB vs PostgreSQL Queries

MongoDB:
```javascript
db.users.find({ age: { $gt: 21 } }).sort({ name: 1 });
```

PostgreSQL:
```sql
SELECT * FROM users WHERE age > 21 ORDER BY name ASC;
```

## Conclusion

Migrating from MongoDB to PostgreSQL requires careful planning and execution. The tools provided in this project will help you analyze your MongoDB schema, design an appropriate PostgreSQL schema, and generate migration scripts.

Remember that each migration is unique, and you may need to customize the approach based on your specific data structure and requirements.

For complex migrations, consider engaging with database migration experts or using professional migration tools.
