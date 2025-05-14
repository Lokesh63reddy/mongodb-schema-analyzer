/**
 * MongoDB to PostgreSQL Migration Script
 * This script migrates data from MongoDB to PostgreSQL with proper relationships
 */

const { MongoClient } = require('mongodb');
const { Client } = require('pg');
require('dotenv').config();

// Configuration
const mongoUri = process.env.MONGODB_URI;
const dbName = process.env.DATABASE_NAME;

// PostgreSQL configuration
const pgConfig = {
  host: process.env.PG_HOST || 'localhost',
  port: process.env.PG_PORT || 5432,
  database: process.env.PG_DATABASE,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD
};

// Collections to migrate (in order of dependency)
const collectionsToMigrate = [
  {
    name: 'groups',
    primaryKey: '_id',
    references: []
  },
  {
    name: 'permissions',
    primaryKey: '_id',
    references: []
  },
  {
    name: 'users',
    primaryKey: '_id',
    references: [
      { field: 'group', collection: 'groups', targetField: '_id' }
    ]
  },
  {
    name: 'contacts',
    primaryKey: '_id',
    references: [
      { field: 'user', collection: 'users', targetField: '_id' }
    ]
  },
  {
    name: 'customers',
    primaryKey: '_id',
    references: []
  },
  {
    name: 'locations',
    primaryKey: '_id',
    references: [
      { field: 'customer', collection: 'customers', targetField: '_id' }
    ]
  },
  {
    name: 'equipment_types',
    primaryKey: '_id',
    references: []
  },
  {
    name: 'equipment',
    primaryKey: '_id',
    references: [
      { field: 'type', collection: 'equipment_types', targetField: '_id' },
      { field: 'location', collection: 'locations', targetField: '_id' }
    ]
  },
  {
    name: 'licenses',
    primaryKey: '_id',
    references: [
      { field: 'customer', collection: 'customers', targetField: '_id' }
    ]
  },
  {
    name: 'globals',
    primaryKey: '_id',
    references: []
  },
  {
    name: 'apikeys',
    primaryKey: '_id',
    references: [
      { field: 'user', collection: 'users', targetField: '_id' }
    ]
  },
  {
    name: 'options',
    primaryKey: '_id',
    references: []
  },
  {
    name: 'betawhitelists',
    primaryKey: '_id',
    references: []
  },
  {
    name: 'betawaitlists',
    primaryKey: '_id',
    references: []
  },
  {
    name: 'alerts',
    primaryKey: '_id',
    references: [
      { field: 'user', collection: 'users', targetField: '_id' }
    ]
  },
  {
    name: 'plans',
    primaryKey: '_id',
    references: []
  },
  {
    name: 'audits',
    primaryKey: '_id',
    references: [
      { field: 'equipment', collection: 'equipment', targetField: '_id' },
      { field: 'user', collection: 'users', targetField: '_id' }
    ]
  },
  {
    name: 'activities',
    primaryKey: '_id',
    references: [
      { field: 'user', collection: 'users', targetField: '_id' }
    ]
  },
  {
    name: 'notifications',
    primaryKey: '_id',
    references: [
      { field: 'user', collection: 'users', targetField: '_id' }
    ]
  },
  {
    name: 'logs',
    primaryKey: '_id',
    references: [
      { field: 'user', collection: 'users', targetField: '_id' }
    ]
  },
  {
    name: 'uploads',
    primaryKey: '_id',
    references: [
      { field: 'user', collection: 'users', targetField: '_id' }
    ]
  },
  {
    name: 'templates',
    primaryKey: '_id',
    references: []
  },
  {
    name: 'reporttemplates',
    primaryKey: '_id',
    references: []
  },
  {
    name: 'reporttemplates_fixed',
    primaryKey: '_id',
    references: [
      { field: 'template', collection: 'templates', targetField: '_id' },
      { field: 'createdBy', collection: 'users', targetField: '_id' }
    ]
  },
  {
    name: 'lookuptables',
    primaryKey: '_id',
    references: []
  }
];

// Helper function to sanitize table names
function sanitizeTableName(name) {
  return name.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
}

// Helper function to sanitize field names
function sanitizeFieldName(name) {
  return name.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
}

// Main migration function
async function migrateToPostgres() {
  const mongoClient = new MongoClient(mongoUri);
  const pgClient = new Client(pgConfig);

  try {
    // Connect to MongoDB
    await mongoClient.connect();
    console.log('Connected to MongoDB');

    // Connect to PostgreSQL
    await pgClient.connect();
    console.log('Connected to PostgreSQL');

    // Get MongoDB database
    const db = mongoClient.db(dbName);

    // Begin PostgreSQL transaction
    await pgClient.query('BEGIN');

    // Migrate each collection in order
    for (const collectionConfig of collectionsToMigrate) {
      await migrateCollection(db, pgClient, collectionConfig);
    }

    // Migrate junction tables (for arrays of references)
    await migrateJunctionTables(db, pgClient);

    // Commit transaction
    await pgClient.query('COMMIT');

    console.log('Migration completed successfully');

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
      const transformedDoc = transformDocument(doc, collectionConfig);
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

// Function to migrate junction tables for arrays of references
async function migrateJunctionTables(db, pgClient) {
  console.log('\nMigrating junction tables for arrays of references');

  try {
    // Migrate customer_contacts
    await migrateCustomerContacts(db, pgClient);

    // Migrate location_contacts
    await migrateLocationContacts(db, pgClient);

    // Migrate group_permissions
    await migrateGroupPermissions(db, pgClient);

    console.log('Junction tables migration completed successfully');
  } catch (error) {
    console.error('Error migrating junction tables:', error);
    throw error;
  }
}

// Function to migrate customer_contacts junction table
async function migrateCustomerContacts(db, pgClient) {
  console.log('Migrating customer_contacts junction table');

  const customers = db.collection('customers');
  const cursor = customers.find({ 'contacts.0': { $exists: true } });

  let count = 0;
  let doc = await cursor.next();

  while (doc) {
    if (doc.contacts && Array.isArray(doc.contacts)) {
      for (const contact of doc.contacts) {
        if (contact.ref) {
          try {
            const query = `
              INSERT INTO customer_contacts (
                id, customer_id, contact_id, primary_contact
              ) VALUES ($1, $2, $3, $4)
              ON CONFLICT DO NOTHING
            `;

            const values = [
              contact._id ? contact._id.toString() : `${doc._id}_${contact.ref}`,
              doc._id.toString(),
              contact.ref.toString(),
              contact.primary || false
            ];

            await pgClient.query(query, values);
            count++;
          } catch (error) {
            console.error(`Error inserting customer_contact: ${error.message}`);
          }
        }
      }
    }

    doc = await cursor.next();
  }

  console.log(`Migrated ${count} customer_contacts relationships`);
}

// Function to migrate location_contacts junction table
async function migrateLocationContacts(db, pgClient) {
  console.log('Migrating location_contacts junction table');

  const locations = db.collection('locations');
  const cursor = locations.find({ 'contacts.0': { $exists: true } });

  let count = 0;
  let doc = await cursor.next();

  while (doc) {
    if (doc.contacts && Array.isArray(doc.contacts)) {
      for (const contact of doc.contacts) {
        if (contact.ref) {
          try {
            const query = `
              INSERT INTO location_contacts (
                id, location_id, contact_id, primary_contact
              ) VALUES ($1, $2, $3, $4)
              ON CONFLICT DO NOTHING
            `;

            const values = [
              contact._id ? contact._id.toString() : `${doc._id}_${contact.ref}`,
              doc._id.toString(),
              contact.ref.toString(),
              contact.primary || false
            ];

            await pgClient.query(query, values);
            count++;
          } catch (error) {
            console.error(`Error inserting location_contact: ${error.message}`);
          }
        }
      }
    }

    doc = await cursor.next();
  }

  console.log(`Migrated ${count} location_contacts relationships`);
}

// Function to migrate group_permissions junction table
async function migrateGroupPermissions(db, pgClient) {
  console.log('Migrating group_permissions junction table');

  const groups = db.collection('groups');
  const cursor = groups.find({ 'permissions.0': { $exists: true } });

  let count = 0;
  let doc = await cursor.next();

  while (doc) {
    if (doc.permissions && Array.isArray(doc.permissions)) {
      for (const permission of doc.permissions) {
        if (permission.ref) {
          try {
            const query = `
              INSERT INTO group_permissions (
                id, group_id, permission_id, value, scope
              ) VALUES ($1, $2, $3, $4, $5)
              ON CONFLICT DO NOTHING
            `;

            const values = [
              permission._id ? permission._id.toString() : `${doc._id}_${permission.ref}`,
              doc._id.toString(),
              permission.ref.toString(),
              permission.value ? permission.value.toString() : null,
              permission.scope || null
            ];

            await pgClient.query(query, values);
            count++;
          } catch (error) {
            console.error(`Error inserting group_permission: ${error.message}`);
          }
        }
      }
    }

    doc = await cursor.next();
  }

  console.log(`Migrated ${count} group_permissions relationships`);
}

// Process a batch of documents
async function processBatch(pgClient, batch, collectionConfig) {
  for (const doc of batch) {
    await insertIntoPostgres(pgClient, doc, collectionConfig);
  }
}

// Function to transform document
function transformDocument(doc, collectionConfig) {
  // Extract MongoDB _id as string
  const id = doc._id.toString();

  // Handle dates
  const createdAt = doc.createdAt instanceof Date ? doc.createdAt :
                   (doc.createdAt ? new Date(doc.createdAt) : null);

  const updatedAt = doc.updatedAt instanceof Date ? doc.updatedAt :
                   (doc.updatedAt ? new Date(doc.updatedAt) : null);

  // Base document with common fields
  const baseDoc = {
    id,
    created_at: createdAt,
    updated_at: updatedAt,
    archived: doc.archived || false
  };

  // Collection-specific transformations
  const collectionName = collectionConfig.name;

  // Handle references
  collectionConfig.references.forEach(ref => {
    if (doc[ref.field]) {
      baseDoc[`${sanitizeFieldName(ref.field)}_id`] = doc[ref.field].toString();
    } else {
      baseDoc[`${sanitizeFieldName(ref.field)}_id`] = null;
    }
  });

  // Handle specific collections
  switch (collectionName) {
    case 'users':
      return {
        ...baseDoc,
        name: doc.name,
        email: doc.email,
        password: doc.password,
        timezone: doc.timezone,
        privacy: doc.privacy,
        terms_and_conditions: doc.termsAndConditions,
        preferences: doc.preferences ? JSON.stringify(doc.preferences) : null,
        access: doc.access ? JSON.stringify(doc.access) : null,
        log_access: doc.logAccess ? JSON.stringify(doc.logAccess) : null,
        last_login: doc.lastLogin ? JSON.stringify(doc.lastLogin) : null,
        recovery: doc.recovery
      };

    case 'contacts':
      return {
        ...baseDoc,
        first_name: doc.name?.first || '',
        middle_name: doc.name?.middle || '',
        last_name: doc.name?.last || '',
        email: doc.email,
        phone: doc.phone ? JSON.stringify(doc.phone) : null
      };

    case 'customers':
      return {
        ...baseDoc,
        name: doc.name,
        address: doc.address,
        city: doc.city,
        state: doc.state,
        zip: doc.zip,
        metadata: doc.metadata ? JSON.stringify(doc.metadata) : null
      };

    case 'locations':
      return {
        ...baseDoc,
        name: doc.name,
        address: doc.address,
        city: doc.city,
        state: doc.state,
        zip: doc.zip,
        overrides: doc.overrides ? JSON.stringify(doc.overrides) : null
      };

    case 'equipment':
      return {
        ...baseDoc,
        completion: doc.completion,
        design: doc.design ? JSON.stringify(doc.design) : null,
        info: doc.info ? JSON.stringify(doc.info) : null
      };

    case 'licenses':
      return {
        ...baseDoc,
        name: doc.name || '',
        key: doc.key,
        type: doc.type,
        status: doc.status,
        metadata: doc.metadata ? JSON.stringify(doc.metadata) : null,
        expires_at: doc.expiresAt instanceof Date ? doc.expiresAt :
                   (doc.expiresAt ? new Date(doc.expiresAt) : null)
      };

    case 'globals':
      return {
        ...baseDoc,
        name: doc.name,
        value: doc.value ? JSON.stringify(doc.value) : null,
        description: doc.description
      };

    case 'apikeys':
      return {
        ...baseDoc,
        name: doc.name,
        key: doc.key,
        secret: doc.secret,
        permissions: doc.permissions ? JSON.stringify(doc.permissions) : null,
        active: doc.active !== undefined ? doc.active : true
      };

    case 'options':
      return {
        ...baseDoc,
        name: doc.name,
        value: doc.value ? JSON.stringify(doc.value) : null,
        description: doc.description
      };

    case 'betawhitelists':
      return {
        ...baseDoc,
        email: doc.email,
        metadata: doc.metadata ? JSON.stringify(doc.metadata) : null
      };

    case 'betawaitlists':
      return {
        ...baseDoc,
        email: doc.email,
        metadata: doc.metadata ? JSON.stringify(doc.metadata) : null
      };

    case 'alerts':
      return {
        ...baseDoc,
        title: doc.title || '',
        message: doc.message,
        type: doc.type,
        level: doc.level,
        metadata: doc.metadata ? JSON.stringify(doc.metadata) : null
      };

    case 'plans':
      return {
        ...baseDoc,
        name: doc.name,
        description: doc.description,
        features: doc.features ? JSON.stringify(doc.features) : null,
        price: doc.price
      };

    case 'reporttemplates_fixed':
      return {
        ...baseDoc,
        title: doc.title || '',
        description: doc.description || '',
        components: doc.components ? JSON.stringify(doc.components) : null,
        visibility: doc.visibility || 0,
        version: doc.__v || 0
      };

    default:
      // Generic transformation for other collections
      return {
        ...baseDoc,
        // Add other fields as needed
        ...Object.entries(doc)
          .filter(([key]) => !['_id', 'createdAt', 'updatedAt', 'archived'].includes(key) &&
                            !collectionConfig.references.some(ref => ref.field === key))
          .reduce((obj, [key, value]) => {
            // Handle different types of values
            if (value === null || value === undefined) {
              obj[sanitizeFieldName(key)] = null;
            } else if (typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
              obj[sanitizeFieldName(key)] = JSON.stringify(value);
            } else if (Array.isArray(value)) {
              obj[sanitizeFieldName(key)] = JSON.stringify(value);
            } else {
              obj[sanitizeFieldName(key)] = value;
            }
            return obj;
          }, {})
      };
  }
}

// Function to insert document into PostgreSQL
async function insertIntoPostgres(pgClient, doc, collectionConfig) {
  const tableName = sanitizeTableName(collectionConfig.name);

  try {
    // Get field names and values
    const fields = Object.keys(doc);
    const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');
    const values = Object.values(doc);

    // Build query
    const query = `
      INSERT INTO ${tableName} (${fields.join(', ')})
      VALUES (${placeholders})
      ON CONFLICT (id) DO UPDATE SET
        ${fields.filter(f => f !== 'id').map((f, i) => `${f} = $${i + 2}`).join(',\n        ')}
    `;

    await pgClient.query(query, values);
  } catch (error) {
    console.error(`Error inserting document ${doc.id} into ${tableName}:`, error);
    throw error;
  }
}

// Run the migration
migrateToPostgres()
  .then(() => console.log('Migration script completed'))
  .catch(err => console.error('Migration script failed:', err));
