/**
 * Enhanced sample migration script with relationship handling
 * This demonstrates how to migrate MongoDB collections to PostgreSQL
 * with proper primary key and foreign key relationships
 */

const { MongoClient } = require('mongodb');
const { Client } = require('pg');
require('dotenv').config();

// Configuration
const mongoUri = process.env.MONGODB_URI;
const dbName = process.env.DATABASE_NAME;

// Collections to migrate (in order of dependency)
// Order matters: collections with foreign keys should come after their referenced collections
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

// PostgreSQL configuration
const pgConfig = {
  host: process.env.PG_HOST || 'localhost',
  port: process.env.PG_PORT || 5432,
  database: process.env.PG_DATABASE,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD
};

// Function to create PostgreSQL tables with proper relationships
async function createPostgresTables(pgClient) {
  try {
    // Create tables in order (respecting dependencies)
    for (const collection of collectionsToMigrate) {
      await createSingleTable(pgClient, collection);
    }

    // Add foreign key constraints after all tables are created
    for (const collection of collectionsToMigrate) {
      if (collection.references && collection.references.length > 0) {
        await addForeignKeyConstraints(pgClient, collection);
      }
    }

    console.log('All PostgreSQL tables created with proper relationships');
  } catch (error) {
    console.error('Error creating PostgreSQL tables:', error);
    throw error;
  }
}

// Function to create a single PostgreSQL table
async function createSingleTable(pgClient, collectionConfig) {
  const tableName = sanitizeTableName(collectionConfig.name);
  const primaryKeyField = sanitizeFieldName(collectionConfig.primaryKey);

  // Sample schema for each collection - modify based on your actual collection structure
  let createTableQuery;

  if (collectionConfig.name === 'users') {
    createTableQuery = `
      CREATE TABLE IF NOT EXISTS ${tableName} (
        ${primaryKeyField} TEXT PRIMARY KEY,
        username TEXT,
        email TEXT,
        first_name TEXT,
        last_name TEXT,
        created_at TIMESTAMP,
        updated_at TIMESTAMP,
        profile TEXT,
        settings TEXT,
        roles TEXT[]
      );
    `;
  } else if (collectionConfig.name === 'posts') {
    createTableQuery = `
      CREATE TABLE IF NOT EXISTS ${tableName} (
        ${primaryKeyField} TEXT PRIMARY KEY,
        title TEXT,
        content TEXT,
        user_id TEXT,
        created_at TIMESTAMP,
        updated_at TIMESTAMP,
        tags TEXT[],
        metadata TEXT
      );
    `;
  } else if (collectionConfig.name === 'comments') {
    createTableQuery = `
      CREATE TABLE IF NOT EXISTS ${tableName} (
        ${primaryKeyField} TEXT PRIMARY KEY,
        content TEXT,
        post_id TEXT,
        user_id TEXT,
        created_at TIMESTAMP,
        parent_comment_id TEXT,
        metadata TEXT
      );
    `;
  } else {
    // Generic table creation for other collections
    createTableQuery = `
      CREATE TABLE IF NOT EXISTS ${tableName} (
        ${primaryKeyField} TEXT PRIMARY KEY
      );
    `;
  }

  try {
    await pgClient.query(createTableQuery);
    console.log(`Table ${tableName} created or already exists`);
  } catch (error) {
    console.error(`Error creating table ${tableName}:`, error);
    throw error;
  }
}

// Function to add foreign key constraints
async function addForeignKeyConstraints(pgClient, collectionConfig) {
  const tableName = sanitizeTableName(collectionConfig.name);

  for (const reference of collectionConfig.references) {
    const foreignKeyField = sanitizeFieldName(reference.field);
    const referencedTable = sanitizeTableName(reference.collection);
    const referencedField = sanitizeFieldName(reference.targetField);

    const constraintName = `fk_${tableName}_${foreignKeyField}`;

    const addForeignKeyQuery = `
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = '${constraintName}'
        ) THEN
          ALTER TABLE ${tableName}
          ADD CONSTRAINT ${constraintName}
          FOREIGN KEY (${foreignKeyField})
          REFERENCES ${referencedTable}(${referencedField})
          ON DELETE SET NULL;
        END IF;
      END
      $$;
    `;

    try {
      await pgClient.query(addForeignKeyQuery);
      console.log(`Foreign key constraint added: ${tableName}.${foreignKeyField} -> ${referencedTable}.${referencedField}`);
    } catch (error) {
      console.error(`Error adding foreign key constraint to ${tableName}:`, error);
      throw error;
    }
  }
}

// Helper function to sanitize table names
function sanitizeTableName(name) {
  return name.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
}

// Helper function to sanitize field names
function sanitizeFieldName(name) {
  return name.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
}

// This function is replaced by transformDocumentByType

// Function to insert document into PostgreSQL
async function insertIntoPostgres(pgClient, doc, collectionConfig) {
  const tableName = sanitizeTableName(collectionConfig.name);
  const collectionName = collectionConfig.name;

  try {
    let query, values;

    // Collection-specific insert queries
    if (collectionName === 'users') {
      query = `
        INSERT INTO ${tableName} (
          id, username, email, first_name, last_name,
          created_at, updated_at, profile, settings, roles
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (id) DO UPDATE SET
          username = $2,
          email = $3,
          first_name = $4,
          last_name = $5,
          updated_at = $7,
          profile = $8,
          settings = $9,
          roles = $10
      `;

      values = [
        doc.id,
        doc.username,
        doc.email,
        doc.first_name,
        doc.last_name,
        doc.created_at,
        doc.updated_at,
        doc.profile,
        doc.settings,
        doc.roles
      ];
    }
    else if (collectionName === 'posts') {
      query = `
        INSERT INTO ${tableName} (
          id, title, content, user_id, created_at, updated_at, tags, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (id) DO UPDATE SET
          title = $2,
          content = $3,
          user_id = $4,
          updated_at = $6,
          tags = $7,
          metadata = $8
      `;

      values = [
        doc.id,
        doc.title,
        doc.content,
        doc.user_id,
        doc.created_at,
        doc.updated_at,
        doc.tags,
        doc.metadata
      ];
    }
    else if (collectionName === 'comments') {
      query = `
        INSERT INTO ${tableName} (
          id, content, post_id, user_id, created_at, parent_comment_id, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (id) DO UPDATE SET
          content = $2,
          post_id = $3,
          user_id = $4,
          parent_comment_id = $6,
          metadata = $7
      `;

      values = [
        doc.id,
        doc.content,
        doc.post_id,
        doc.user_id,
        doc.created_at,
        doc.parent_comment_id,
        doc.metadata
      ];
    }
    else {
      // Generic insert for other collections
      // This is a simplified approach - in a real scenario, you'd need to dynamically
      // build the query based on the document structure
      const fields = Object.keys(doc);
      const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');
      const updateFields = fields
        .filter(field => field !== 'id')
        .map((field, i) => `${field} = $${i + 2}`)
        .join(', ');

      query = `
        INSERT INTO ${tableName} (${fields.join(', ')})
        VALUES (${placeholders})
        ON CONFLICT (id) DO UPDATE SET
        ${updateFields}
      `;

      values = Object.values(doc);
    }

    await pgClient.query(query, values);
  } catch (error) {
    console.error(`Error inserting document ${doc.id} into ${tableName}:`, error);
    throw error;
  }
}

// Main migration function
async function migrateCollections() {
  const mongoClient = new MongoClient(mongoUri);
  const pgClient = new Client(pgConfig);

  try {
    // Connect to MongoDB
    await mongoClient.connect();
    console.log('Connected to MongoDB');

    // Connect to PostgreSQL
    await pgClient.connect();
    console.log('Connected to PostgreSQL');

    // Create PostgreSQL tables with relationships
    await createPostgresTables(pgClient);

    // Get MongoDB database
    const db = mongoClient.db(dbName);

    // Begin PostgreSQL transaction
    await pgClient.query('BEGIN');

    // Migrate each collection in order
    for (const collectionConfig of collectionsToMigrate) {
      await migrateCollection(db, pgClient, collectionConfig);
    }

    // Commit transaction
    await pgClient.query('COMMIT');

    console.log('Migration of all collections completed successfully');

  } catch (error) {
    console.error('Migration failed:', error);

    // Rollback transaction
    try {
      await pgClient.query('ROLLBACK');
    } catch (rollbackError) {
      console.error('Rollback failed:', rollbackError);
    }

  } finally {
    // Close connections
    await mongoClient.close();
    await pgClient.end();
  }
}

// Function to migrate a single collection
async function migrateCollection(db, pgClient, collectionConfig) {
  const collectionName = collectionConfig.name;
  console.log(`\nMigrating collection: ${collectionName}`);

  try {
    // Get MongoDB collection
    const collection = db.collection(collectionName);

    // Count documents
    const count = await collection.countDocuments();
    console.log(`Found ${count} documents in ${collectionName} collection`);

    if (count === 0) {
      console.log(`Collection ${collectionName} is empty. Skipping.`);
      return;
    }

    // Process documents in batches
    const batchSize = 100;
    let processed = 0;

    // Use cursor for efficient processing of large collections
    const cursor = collection.find();

    let batch = [];
    let doc = await cursor.next();

    while (doc) {
      // Transform document based on collection type
      const transformedDoc = transformDocumentByType(doc, collectionConfig);
      batch.push(transformedDoc);

      // Process batch when it reaches batch size
      if (batch.length >= batchSize) {
        await processBatch(pgClient, batch, collectionConfig);
        processed += batch.length;
        console.log(`Processed ${processed}/${count} documents from ${collectionName}`);
        batch = [];
      }

      // Get next document
      doc = await cursor.next();
    }

    // Process remaining documents
    if (batch.length > 0) {
      await processBatch(pgClient, batch, collectionConfig);
      processed += batch.length;
      console.log(`Processed ${processed}/${count} documents from ${collectionName}`);
    }

    console.log(`Migration of ${collectionName} completed successfully`);

  } catch (error) {
    console.error(`Error migrating collection ${collectionName}:`, error);
    throw error;
  }
}

// Process a batch of documents
async function processBatch(pgClient, batch, collectionConfig) {
  for (const doc of batch) {
    await insertIntoPostgres(pgClient, doc, collectionConfig);
  }
}

// Function to transform document based on collection type
function transformDocumentByType(doc, collectionConfig) {
  const collectionName = collectionConfig.name;

  // Extract MongoDB _id as string
  const id = doc._id.toString();

  // Handle dates
  const createdAt = doc.created_at instanceof Date ? doc.created_at :
                   (doc.created_at ? new Date(doc.created_at) : null);

  const updatedAt = doc.updated_at instanceof Date ? doc.updated_at :
                   (doc.updated_at ? new Date(doc.updated_at) : null);

  // Base document with common fields
  const baseDoc = {
    id,
    created_at: createdAt,
    updated_at: updatedAt
  };

  // Collection-specific transformations
  if (collectionName === 'users') {
    return {
      ...baseDoc,
      username: doc.username,
      email: doc.email,
      first_name: doc.first_name,
      last_name: doc.last_name,
      profile: doc.profile ? JSON.stringify(doc.profile) : null,
      settings: doc.settings ? JSON.stringify(doc.settings) : null,
      roles: doc.roles && Array.isArray(doc.roles) ? doc.roles : []
    };
  }
  else if (collectionName === 'posts') {
    return {
      ...baseDoc,
      title: doc.title,
      content: doc.content,
      user_id: doc.user_id ? doc.user_id.toString() : null,
      tags: doc.tags && Array.isArray(doc.tags) ? doc.tags : [],
      metadata: doc.metadata ? JSON.stringify(doc.metadata) : null
    };
  }
  else if (collectionName === 'comments') {
    return {
      ...baseDoc,
      content: doc.content,
      post_id: doc.post_id ? doc.post_id.toString() : null,
      user_id: doc.user_id ? doc.user_id.toString() : null,
      parent_comment_id: doc.parent_comment_id ? doc.parent_comment_id.toString() : null,
      metadata: doc.metadata ? JSON.stringify(doc.metadata) : null
    };
  }

  // Generic transformation for other collections
  return {
    ...baseDoc,
    // Add other fields as needed
    ...Object.entries(doc)
      .filter(([key]) => key !== '_id' && key !== 'created_at' && key !== 'updated_at')
      .reduce((obj, [key, value]) => {
        // Handle different types of values
        if (value === null || value === undefined) {
          obj[key] = null;
        } else if (typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
          obj[key] = JSON.stringify(value);
        } else if (Array.isArray(value)) {
          obj[key] = value;
        } else {
          obj[key] = value;
        }
        return obj;
      }, {})
  };
}

// Run the migration
migrateCollections()
  .then(() => console.log('Migration script completed'))
  .catch(err => console.error('Migration script failed:', err));
