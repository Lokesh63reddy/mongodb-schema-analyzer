# MongoDB to PostgreSQL Migration Guide

This guide provides step-by-step instructions for migrating your MongoDB database to PostgreSQL.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Schema Design](#schema-design)
3. [Setting Up PostgreSQL](#setting-up-postgresql)
4. [Running the Migration](#running-the-migration)
5. [Validating the Migration](#validating-the-migration)
6. [Troubleshooting](#troubleshooting)

## Prerequisites

Before starting the migration, ensure you have:

1. **MongoDB Connection**: Working connection to your MongoDB database
2. **PostgreSQL Installation**: PostgreSQL installed and running
3. **Node.js Environment**: Node.js and npm installed
4. **Required Packages**: All required npm packages installed

```bash
# Install required packages
npm install mongodb pg dotenv
```

5. **Environment Configuration**: Update the `.env` file with your database connection details:

```
# MongoDB connection
MONGODB_URI=mongodb://localhost:27017/
DATABASE_NAME=mechdx

# PostgreSQL connection
PG_HOST=localhost
PG_PORT=5432
PG_DATABASE=mechdx_pg
PG_USER=postgres
PG_PASSWORD=your_password
```

## Schema Design

The PostgreSQL schema has been designed based on the analysis of your MongoDB collections. The schema includes:

- **Primary Keys**: Each table has a primary key (using the MongoDB `_id` field)
- **Foreign Keys**: Proper relationships between tables
- **Data Types**: Appropriate PostgreSQL data types for each field
- **Complex Data**: JSON strings for complex nested structures
- **Indexes**: Indexes for frequently queried fields

The complete schema is available in `migration_output/final_schema.sql`.

### Key Tables and Relationships

1. **Users and Authentication**:
   - `users`: Core user information
   - `groups`: User groups/roles
   - `permissions`: Available permissions
   - `group_permissions`: Junction table for group-permission relationships

2. **Customer Management**:
   - `customers`: Customer organizations
   - `locations`: Physical locations
   - `contacts`: Contact information
   - `customer_contacts`: Junction table for customer-contact relationships
   - `location_contacts`: Junction table for location-contact relationships

3. **Equipment Management**:
   - `equipment_types`: Types of equipment
   - `equipment`: Equipment instances
   - `audits`: Equipment audits

4. **Activity and Logging**:
   - `activities`: User activities
   - `notifications`: User notifications
   - `logs`: System logs

## Setting Up PostgreSQL

1. **Create PostgreSQL Database**:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE mechdx_pg;

# Exit psql
\q
```

2. **Apply the Schema**:

```bash
# Apply the schema to the database
psql -U postgres -d mechdx_pg -f migration_output/final_schema.sql
```

## Running the Migration

The migration process is handled by the `migrateToPg.js` script, which:

1. Connects to both MongoDB and PostgreSQL
2. Migrates collections in the correct order (respecting dependencies)
3. Transforms MongoDB documents to PostgreSQL format
4. Handles complex data structures
5. Creates proper relationships between tables

To run the migration:

```bash
# Run the migration script
npm run migrate-to-pg
```

The migration process will:

1. Migrate base tables first (groups, permissions, users, etc.)
2. Migrate dependent tables (equipment, audits, etc.)
3. Create junction tables for many-to-many relationships

## Validating the Migration

After the migration completes, validate the results:

1. **Check Record Counts**:

```sql
-- In PostgreSQL
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM customers;
SELECT COUNT(*) FROM equipment;
-- etc.
```

Compare these counts with the MongoDB collections.

2. **Verify Relationships**:

```sql
-- Check if relationships are maintained
SELECT u.name, g.name AS group_name
FROM users u
JOIN groups g ON u.group_id = g.id
LIMIT 10;

SELECT e.id, l.name AS location_name, t.name AS type_name
FROM equipment e
JOIN locations l ON e.location_id = l.id
JOIN equipment_types t ON e.type_id = t.id
LIMIT 10;
```

3. **Validate Complex Data**:

```sql
-- Check if complex data was properly migrated
SELECT id, name, preferences::json->'notifications'->>'email' AS email_notifications
FROM users
WHERE preferences IS NOT NULL
LIMIT 10;
```

## Troubleshooting

### Common Issues

1. **Connection Problems**:
   - Verify MongoDB and PostgreSQL connection strings
   - Ensure both databases are running
   - Check network connectivity

2. **Schema Issues**:
   - If you encounter schema errors, check the PostgreSQL error logs
   - Verify that the schema was properly applied

3. **Data Transformation Errors**:
   - Check for data type mismatches
   - Look for invalid JSON in complex fields

4. **Foreign Key Violations**:
   - Ensure collections are migrated in the correct order
   - Check for missing references

### Fixing Issues

If you encounter issues during migration:

1. **Fix the Schema**:
   - Modify `final_schema.sql` as needed
   - Reapply the schema to the database

2. **Adjust the Migration Script**:
   - Modify `migrateToPg.js` to handle specific data issues
   - Update the transformation functions for problematic collections

3. **Partial Migration**:
   - You can modify the script to migrate specific collections
   - Comment out already migrated collections in the `collectionsToMigrate` array

## Next Steps

After successful migration:

1. **Update Application Code**:
   - Modify your application to use PostgreSQL instead of MongoDB
   - Update queries to use SQL instead of MongoDB query language

2. **Optimize Performance**:
   - Add additional indexes based on query patterns
   - Consider denormalizing frequently joined data

3. **Set Up Backup Strategy**:
   - Implement regular PostgreSQL backups
   - Consider using pg_dump for database dumps

4. **Monitor Performance**:
   - Set up monitoring for PostgreSQL
   - Watch for slow queries and optimize as needed
