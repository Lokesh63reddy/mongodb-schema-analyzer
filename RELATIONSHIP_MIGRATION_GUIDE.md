# MongoDB to PostgreSQL Migration with Relationships

This guide explains how to use the enhanced migration script (`sampleMigration.js`) to migrate MongoDB collections to PostgreSQL while maintaining proper primary key and foreign key relationships.

## Understanding the Enhanced Migration Script

The enhanced migration script provides a comprehensive approach to migrating MongoDB collections to PostgreSQL with proper relationship handling. It:

1. Creates tables in the correct order (respecting dependencies)
2. Establishes primary key constraints
3. Adds foreign key constraints between related tables
4. Handles data transformation for each collection type
5. Maintains referential integrity during migration

## Collection Relationships Configuration

The script uses a configuration object to define collections and their relationships:

```javascript
const collectionsToMigrate = [
  { 
    name: 'users',
    primaryKey: '_id',
    references: [] // No foreign keys in this collection
  },
  { 
    name: 'posts',
    primaryKey: '_id',
    references: [
      { 
        field: 'user_id', 
        collection: 'users', 
        targetField: '_id' 
      }
    ]
  },
  { 
    name: 'comments',
    primaryKey: '_id',
    references: [
      { 
        field: 'post_id', 
        collection: 'posts', 
        targetField: '_id' 
      },
      { 
        field: 'user_id', 
        collection: 'users', 
        targetField: '_id' 
      }
    ]
  }
];
```

For each collection, you define:
- `name`: The MongoDB collection name
- `primaryKey`: The field to use as the primary key in PostgreSQL
- `references`: An array of foreign key relationships

Each reference includes:
- `field`: The field in this collection that references another collection
- `collection`: The target collection being referenced
- `targetField`: The field in the target collection being referenced

## How to Use the Script

### 1. Configure Your Collections

Modify the `collectionsToMigrate` array to match your MongoDB collections and their relationships. Make sure to:

- List collections in the correct order (referenced collections should come before collections that reference them)
- Identify the primary key field for each collection
- Define all foreign key relationships

### 2. Customize Table Schemas

The `createSingleTable` function contains table creation SQL for each collection. Modify these statements to match your collection schemas:

```javascript
if (collectionConfig.name === 'your_collection') {
  createTableQuery = `
    CREATE TABLE IF NOT EXISTS ${tableName} (
      ${primaryKeyField} TEXT PRIMARY KEY,
      field1 TEXT,
      field2 NUMERIC,
      reference_id TEXT,
      ...
    );
  `;
}
```

### 3. Customize Document Transformation

The `transformDocumentByType` function transforms MongoDB documents to PostgreSQL format. Add custom transformation logic for each of your collections:

```javascript
if (collectionName === 'your_collection') {
  return {
    ...baseDoc,
    field1: doc.field1,
    field2: doc.field2,
    reference_id: doc.reference_id ? doc.reference_id.toString() : null,
    complex_field: doc.complex_field ? JSON.stringify(doc.complex_field) : null
  };
}
```

### 4. Customize Insert Queries

The `insertIntoPostgres` function contains INSERT statements for each collection. Modify these to match your collection schemas:

```javascript
if (collectionName === 'your_collection') {
  query = `
    INSERT INTO ${tableName} (
      id, field1, field2, reference_id, ...
    ) VALUES ($1, $2, $3, $4, ...)
    ON CONFLICT (id) DO UPDATE SET
      field1 = $2,
      field2 = $3,
      ...
  `;
  
  values = [
    doc.id,
    doc.field1,
    doc.field2,
    doc.reference_id,
    ...
  ];
}
```

### 5. Run the Migration

Execute the script to migrate your collections:

```bash
npm run pg-migrate-sample
```

## How the Migration Works

1. **Table Creation**: Tables are created in the correct order to respect dependencies
2. **Foreign Key Constraints**: Foreign key constraints are added after all tables exist
3. **Data Migration**: Each collection is migrated in order
4. **Referential Integrity**: Foreign key constraints ensure data integrity
5. **Transaction Management**: All operations are wrapped in a transaction

## Best Practices

1. **Order Matters**: Always list collections in dependency order
2. **Handle ObjectIds**: Convert MongoDB ObjectIds to strings
3. **Complex Fields**: Store complex nested objects as JSON strings
4. **Batch Processing**: Process documents in batches for efficiency
5. **Error Handling**: Use transactions to ensure atomicity

## Customizing for Your Schema

To adapt this script for your specific MongoDB schema:

1. Analyze your MongoDB collections to identify relationships
2. Map your MongoDB schema to a relational PostgreSQL schema
3. Define primary keys for each table
4. Identify foreign key relationships between tables
5. Update the configuration and SQL statements accordingly

## Handling Special Cases

### Many-to-Many Relationships

For many-to-many relationships, create a junction table:

```javascript
// Add to collectionsToMigrate
{
  name: 'user_roles',
  primaryKey: 'id',
  references: [
    { field: 'user_id', collection: 'users', targetField: '_id' },
    { field: 'role_id', collection: 'roles', targetField: '_id' }
  ]
}
```

### Self-References

For self-referencing relationships (like parent-child):

```javascript
// In references array
{ field: 'parent_id', collection: 'same_collection', targetField: '_id' }
```

### Composite Keys

For composite primary keys, modify the table creation SQL:

```sql
CREATE TABLE IF NOT EXISTS ${tableName} (
  field1 TEXT,
  field2 TEXT,
  ...,
  PRIMARY KEY (field1, field2)
);
```

## Conclusion

This enhanced migration script provides a robust framework for migrating MongoDB collections to PostgreSQL while maintaining proper relationships. By customizing the configuration and SQL statements, you can adapt it to your specific schema and requirements.
