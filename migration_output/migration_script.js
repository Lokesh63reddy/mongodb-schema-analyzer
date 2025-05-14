
const { MongoClient } = require('mongodb');
const { Client } = require('pg');
require('dotenv').config();

// Configuration
const mongoUri = process.env.MONGODB_URI;
const mongoDbName = process.env.DATABASE_NAME;
const pgConfig = {
  host: process.env.PG_HOST || 'localhost',
  port: process.env.PG_PORT || 5432,
  database: process.env.PG_DATABASE,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD
};

async function migrateData() {
  const mongoClient = new MongoClient(mongoUri);
  const pgClient = new Client(pgConfig);

  try {
    // Connect to both databases
    await mongoClient.connect();
    await pgClient.connect();

    console.log('Connected to both MongoDB and PostgreSQL');

    const mongoDb = mongoClient.db(mongoDbName);

    // Begin transaction
    await pgClient.query('BEGIN');

    // Migrate each collection
    await migratecustomers(mongoDb, pgClient);
    await migratelicenses(mongoDb, pgClient);
    await migrateglobals(mongoDb, pgClient);
    await migrateequipment(mongoDb, pgClient);
    await migrateaudits(mongoDb, pgClient);
    await migrateapikeys(mongoDb, pgClient);
    await migratereporttemplates(mongoDb, pgClient);
    await migratereporttemplates_fixed(mongoDb, pgClient);
    await migrateoptions(mongoDb, pgClient);
    await migratepermissions(mongoDb, pgClient);
    await migratetemplates(mongoDb, pgClient);
    await migrateuploads(mongoDb, pgClient);
    await migratelookuptables(mongoDb, pgClient);
    await migratebetawhitelists(mongoDb, pgClient);
    await migrateactivities(mongoDb, pgClient);
    await migratebetawaitlists(mongoDb, pgClient);
    await migratelocations(mongoDb, pgClient);
    await migrateusers(mongoDb, pgClient);
    await migratealerts(mongoDb, pgClient);
    await migratelogs(mongoDb, pgClient);
    await migrategroups(mongoDb, pgClient);
    await migratenotifications(mongoDb, pgClient);
    await migratecontacts(mongoDb, pgClient);
    await migrateplans(mongoDb, pgClient);

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


async function migratecustomers(mongoDb, pgClient) {
  console.log('Migrating customers...');

  const collection = mongoDb.collection('customers');
  const documents = await collection.find().toArray();

  console.log(`Found ${documents.length} documents in customers`);

  for (const doc of documents) {
    // Transform document for PostgreSQL
    const pgDoc = transformDocumentcustomers(doc);

    // Insert into PostgreSQL
    await insertIntocustomers(pgClient, pgDoc);
  }

  console.log(`Migrated ${documents.length} documents from customers`);
}

function transformDocumentcustomers(doc) {
  // Transform MongoDB document to PostgreSQL format
  return {
    // Map fields appropriately
    _id: doc._id.toString(),
    name: doc.name,
    address: doc.address,
    city: doc.city,
    state: doc.state,
    zip: doc.zip,
    archived: doc.archived,
    metadata: doc.metadata ? JSON.stringify(doc.metadata) : null,
    __v: doc.__v
  };
}

async function insertIntocustomers(pgClient, doc) {
  const query = `
    INSERT INTO customers (
      "_id",
      "name",
      "address",
      "city",
      "state",
      "zip",
      "contacts",
      "locations",
      "archived",
      "metadata",
      "__v"
    ) VALUES (
      $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}
    )
  `;

  const values = [
    doc._id,
    doc.name,
    doc.address,
    doc.city,
    doc.state,
    doc.zip,
    doc.contacts,
    doc.locations,
    doc.archived,
    doc.metadata,
    doc.__v
  ];

  await pgClient.query(query, values);
}


async function migratelicenses(mongoDb, pgClient) {
  console.log('Migrating licenses...');

  const collection = mongoDb.collection('licenses');
  const documents = await collection.find().toArray();

  console.log(`Found ${documents.length} documents in licenses`);

  for (const doc of documents) {
    // Transform document for PostgreSQL
    const pgDoc = transformDocumentlicenses(doc);

    // Insert into PostgreSQL
    await insertIntolicenses(pgClient, pgDoc);
  }

  console.log(`Migrated ${documents.length} documents from licenses`);
}

function transformDocumentlicenses(doc) {
  // Transform MongoDB document to PostgreSQL format
  return {
    // Map fields appropriately
    _id: doc._id.toString(),
    plan: doc.plan ? JSON.stringify(doc.plan) : null,
    __v: doc.__v,
    metadata: doc.metadata ? JSON.stringify(doc.metadata) : null
  };
}

async function insertIntolicenses(pgClient, doc) {
  const query = `
    INSERT INTO licenses (
      "_id",
      "plan",
      "customers",
      "users",
      "__v",
      "contacts",
      "metadata",
      "groups"
    ) VALUES (
      $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}
    )
  `;

  const values = [
    doc._id,
    doc.plan,
    doc.customers,
    doc.users,
    doc.__v,
    doc.contacts,
    doc.metadata,
    doc.groups
  ];

  await pgClient.query(query, values);
}


async function migrateglobals(mongoDb, pgClient) {
  console.log('Migrating globals...');

  const collection = mongoDb.collection('globals');
  const documents = await collection.find().toArray();

  console.log(`Found ${documents.length} documents in globals`);

  for (const doc of documents) {
    // Transform document for PostgreSQL
    const pgDoc = transformDocumentglobals(doc);

    // Insert into PostgreSQL
    await insertIntoglobals(pgClient, pgDoc);
  }

  console.log(`Migrated ${documents.length} documents from globals`);
}

function transformDocumentglobals(doc) {
  // Transform MongoDB document to PostgreSQL format
  return {
    // Map fields appropriately
    _id: doc._id.toString(),
    name: doc.name,
    description: doc.description,
    createdat: doc.createdAt ? JSON.stringify(doc.createdAt) : null,
    updatedat: doc.updatedAt ? JSON.stringify(doc.updatedAt) : null,
    __v: doc.__v
  };
}

async function insertIntoglobals(pgClient, doc) {
  const query = `
    INSERT INTO globals (
      "_id",
      "name",
      "description",
      "references",
      "createdat",
      "updatedat",
      "__v"
    ) VALUES (
      $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}
    )
  `;

  const values = [
    doc._id,
    doc.name,
    doc.description,
    doc.references,
    doc.createdat,
    doc.updatedat,
    doc.__v
  ];

  await pgClient.query(query, values);
}


async function migrateequipment(mongoDb, pgClient) {
  console.log('Migrating equipment...');

  const collection = mongoDb.collection('equipment');
  const documents = await collection.find().toArray();

  console.log(`Found ${documents.length} documents in equipment`);

  for (const doc of documents) {
    // Transform document for PostgreSQL
    const pgDoc = transformDocumentequipment(doc);

    // Insert into PostgreSQL
    await insertIntoequipment(pgClient, pgDoc);
  }

  console.log(`Migrated ${documents.length} documents from equipment`);
}

function transformDocumentequipment(doc) {
  // Transform MongoDB document to PostgreSQL format
  return {
    // Map fields appropriately
    _id: doc._id.toString(),
    archived: doc.archived,
    type: doc.type,
    location: doc.location,
    createdat: doc.createdAt ? JSON.stringify(doc.createdAt) : null,
    updatedat: doc.updatedAt ? JSON.stringify(doc.updatedAt) : null,
    __v: doc.__v,
    completion: doc.completion
  };
}

async function insertIntoequipment(pgClient, doc) {
  const query = `
    INSERT INTO equipment (
      "_id",
      "archived",
      "type",
      "location",
      "createdat",
      "updatedat",
      "__v",
      "completion",
      "design",
      "info"
    ) VALUES (
      $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}
    )
  `;

  const values = [
    doc._id,
    doc.archived,
    doc.type,
    doc.location,
    doc.createdat,
    doc.updatedat,
    doc.__v,
    doc.completion,
    doc.design,
    doc.info
  ];

  await pgClient.query(query, values);
}


async function migrateaudits(mongoDb, pgClient) {
  console.log('Migrating audits...');

  const collection = mongoDb.collection('audits');
  const documents = await collection.find().toArray();

  console.log(`Found ${documents.length} documents in audits`);

  for (const doc of documents) {
    // Transform document for PostgreSQL
    const pgDoc = transformDocumentaudits(doc);

    // Insert into PostgreSQL
    await insertIntoaudits(pgClient, pgDoc);
  }

  console.log(`Migrated ${documents.length} documents from audits`);
}

function transformDocumentaudits(doc) {
  // Transform MongoDB document to PostgreSQL format
  return {
    // Map fields appropriately
    _id: doc._id.toString(),
    action: doc.action,
    description: doc.description,
    resource: doc.resource,
    resourceid: doc.resourceID,
    user: doc.user,
    level: doc.level,
    occurred: doc.occurred ? JSON.stringify(doc.occurred) : null,
    __v: doc.__v
  };
}

async function insertIntoaudits(pgClient, doc) {
  const query = `
    INSERT INTO audits (
      "_id",
      "action",
      "description",
      "resource",
      "resourceid",
      "user",
      "level",
      "occurred",
      "__v"
    ) VALUES (
      $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}
    )
  `;

  const values = [
    doc._id,
    doc.action,
    doc.description,
    doc.resource,
    doc.resourceid,
    doc.user,
    doc.level,
    doc.occurred,
    doc.__v
  ];

  await pgClient.query(query, values);
}


async function migrateapikeys(mongoDb, pgClient) {
  console.log('Migrating apikeys...');

  const collection = mongoDb.collection('apikeys');
  const documents = await collection.find().toArray();

  console.log(`Found ${documents.length} documents in apikeys`);

  for (const doc of documents) {
    // Transform document for PostgreSQL
    const pgDoc = transformDocumentapikeys(doc);

    // Insert into PostgreSQL
    await insertIntoapikeys(pgClient, pgDoc);
  }

  console.log(`Migrated ${documents.length} documents from apikeys`);
}

function transformDocumentapikeys(doc) {
  // Transform MongoDB document to PostgreSQL format
  return {
    // Map fields appropriately
    _id: doc._id.toString(),
    name: doc.name,
    key: doc.key,
    expires: doc.expires ? JSON.stringify(doc.expires) : null,
    user: doc.user,
    createdat: doc.createdAt ? JSON.stringify(doc.createdAt) : null,
    updatedat: doc.updatedAt ? JSON.stringify(doc.updatedAt) : null,
    __v: doc.__v
  };
}

async function insertIntoapikeys(pgClient, doc) {
  const query = `
    INSERT INTO apikeys (
      "_id",
      "name",
      "key",
      "expires",
      "user",
      "createdat",
      "updatedat",
      "__v"
    ) VALUES (
      $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}
    )
  `;

  const values = [
    doc._id,
    doc.name,
    doc.key,
    doc.expires,
    doc.user,
    doc.createdat,
    doc.updatedat,
    doc.__v
  ];

  await pgClient.query(query, values);
}


async function migratereporttemplates(mongoDb, pgClient) {
  console.log('Migrating reporttemplates...');

  const collection = mongoDb.collection('reporttemplates');
  const documents = await collection.find().toArray();

  console.log(`Found ${documents.length} documents in reporttemplates`);

  for (const doc of documents) {
    // Transform document for PostgreSQL
    const pgDoc = transformDocumentreporttemplates(doc);

    // Insert into PostgreSQL
    await insertIntoreporttemplates(pgClient, pgDoc);
  }

  console.log(`Migrated ${documents.length} documents from reporttemplates`);
}

function transformDocumentreporttemplates(doc) {
  // Transform MongoDB document to PostgreSQL format
  return {
    // Map fields appropriately
    _id: doc._id.toString(),
    title: doc.title,
    description: doc.description,
    template: doc.template,
    visibility: doc.visibility,
    createdby: doc.createdBy,
    archived: doc.archived,
    createdat: doc.createdAt ? JSON.stringify(doc.createdAt) : null,
    updatedat: doc.updatedAt ? JSON.stringify(doc.updatedAt) : null,
    __v: doc.__v,
    ispreset: doc.isPreset
  };
}

async function insertIntoreporttemplates(pgClient, doc) {
  const query = `
    INSERT INTO reporttemplates (
      "_id",
      "title",
      "description",
      "template",
      "components",
      "visibility",
      "createdby",
      "archived",
      "createdat",
      "updatedat",
      "__v",
      "ispreset"
    ) VALUES (
      $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}
    )
  `;

  const values = [
    doc._id,
    doc.title,
    doc.description,
    doc.template,
    doc.components,
    doc.visibility,
    doc.createdby,
    doc.archived,
    doc.createdat,
    doc.updatedat,
    doc.__v,
    doc.ispreset
  ];

  await pgClient.query(query, values);
}


async function migratereporttemplates_fixed(mongoDb, pgClient) {
  console.log('Migrating reporttemplates_fixed...');

  const collection = mongoDb.collection('reporttemplates_fixed');
  const documents = await collection.find().toArray();

  console.log(`Found ${documents.length} documents in reporttemplates_fixed`);

  for (const doc of documents) {
    // Transform document for PostgreSQL
    const pgDoc = transformDocumentreporttemplates_fixed(doc);

    // Insert into PostgreSQL
    await insertIntoreporttemplates_fixed(pgClient, pgDoc);
  }

  console.log(`Migrated ${documents.length} documents from reporttemplates_fixed`);
}

function transformDocumentreporttemplates_fixed(doc) {
  // Transform MongoDB document to PostgreSQL format
  return {
    // Map fields appropriately
    _id: doc._id.toString(),
    title: doc.title,
    description: doc.description,
    template: doc.template,
    visibility: doc.visibility,
    createdby: doc.createdBy,
    archived: doc.archived,
    createdat: doc.createdAt ? JSON.stringify(doc.createdAt) : null,
    updatedat: doc.updatedAt ? JSON.stringify(doc.updatedAt) : null,
    __v: doc.__v,
    ispreset: doc.isPreset
  };
}

async function insertIntoreporttemplates_fixed(pgClient, doc) {
  const query = `
    INSERT INTO reporttemplates_fixed (
      "_id",
      "title",
      "description",
      "template",
      "components",
      "visibility",
      "createdby",
      "archived",
      "createdat",
      "updatedat",
      "__v",
      "ispreset"
    ) VALUES (
      $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}
    )
  `;

  const values = [
    doc._id,
    doc.title,
    doc.description,
    doc.template,
    doc.components,
    doc.visibility,
    doc.createdby,
    doc.archived,
    doc.createdat,
    doc.updatedat,
    doc.__v,
    doc.ispreset
  ];

  await pgClient.query(query, values);
}


async function migrateoptions(mongoDb, pgClient) {
  console.log('Migrating options...');

  const collection = mongoDb.collection('options');
  const documents = await collection.find().toArray();

  console.log(`Found ${documents.length} documents in options`);

  for (const doc of documents) {
    // Transform document for PostgreSQL
    const pgDoc = transformDocumentoptions(doc);

    // Insert into PostgreSQL
    await insertIntooptions(pgClient, pgDoc);
  }

  console.log(`Migrated ${documents.length} documents from options`);
}

function transformDocumentoptions(doc) {
  // Transform MongoDB document to PostgreSQL format
  return {
    // Map fields appropriately
    _id: doc._id.toString(),
    name: doc.name,
    description: doc.description,
    __v: doc.__v
  };
}

async function insertIntooptions(pgClient, doc) {
  const query = `
    INSERT INTO options (
      "_id",
      "permissions",
      "name",
      "description",
      "__v"
    ) VALUES (
      $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}
    )
  `;

  const values = [
    doc._id,
    doc.permissions,
    doc.name,
    doc.description,
    doc.__v
  ];

  await pgClient.query(query, values);
}


async function migratepermissions(mongoDb, pgClient) {
  console.log('Migrating permissions...');

  const collection = mongoDb.collection('permissions');
  const documents = await collection.find().toArray();

  console.log(`Found ${documents.length} documents in permissions`);

  for (const doc of documents) {
    // Transform document for PostgreSQL
    const pgDoc = transformDocumentpermissions(doc);

    // Insert into PostgreSQL
    await insertIntopermissions(pgClient, pgDoc);
  }

  console.log(`Migrated ${documents.length} documents from permissions`);
}

function transformDocumentpermissions(doc) {
  // Transform MongoDB document to PostgreSQL format
  return {
    // Map fields appropriately
    _id: doc._id.toString(),
    longname: doc.longname,
    shortname: doc.shortname,
    description: doc.description,
    type: doc.type,
    scope: doc.scope,
    __v: doc.__v
  };
}

async function insertIntopermissions(pgClient, doc) {
  const query = `
    INSERT INTO permissions (
      "_id",
      "longname",
      "shortname",
      "description",
      "type",
      "scope",
      "__v"
    ) VALUES (
      $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}
    )
  `;

  const values = [
    doc._id,
    doc.longname,
    doc.shortname,
    doc.description,
    doc.type,
    doc.scope,
    doc.__v
  ];

  await pgClient.query(query, values);
}


async function migratetemplates(mongoDb, pgClient) {
  console.log('Migrating templates...');

  const collection = mongoDb.collection('templates');
  const documents = await collection.find().toArray();

  console.log(`Found ${documents.length} documents in templates`);

  for (const doc of documents) {
    // Transform document for PostgreSQL
    const pgDoc = transformDocumenttemplates(doc);

    // Insert into PostgreSQL
    await insertIntotemplates(pgClient, pgDoc);
  }

  console.log(`Migrated ${documents.length} documents from templates`);
}

function transformDocumenttemplates(doc) {
  // Transform MongoDB document to PostgreSQL format
  return {
    // Map fields appropriately
    _id: doc._id.toString(),
    archived: doc.archived,
    name: doc.name,
    __v: doc.__v,
    updatedat: doc.updatedAt ? JSON.stringify(doc.updatedAt) : null,
    createdat: doc.createdAt ? JSON.stringify(doc.createdAt) : null,
    efficiencyconfiguration: doc.efficiencyConfiguration ? JSON.stringify(doc.efficiencyConfiguration) : null,
    defaultvariant: doc.defaultVariant
  };
}

async function insertIntotemplates(pgClient, doc) {
  const query = `
    INSERT INTO templates (
      "_id",
      "history",
      "archived",
      "name",
      "variants",
      "__v",
      "updatedat",
      "createdat",
      "costanalyses",
      "efficiencyconfiguration",
      "defaultvariant"
    ) VALUES (
      $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}
    )
  `;

  const values = [
    doc._id,
    doc.history,
    doc.archived,
    doc.name,
    doc.variants,
    doc.__v,
    doc.updatedat,
    doc.createdat,
    doc.costanalyses,
    doc.efficiencyconfiguration,
    doc.defaultvariant
  ];

  await pgClient.query(query, values);
}


async function migrateuploads(mongoDb, pgClient) {
  console.log('Migrating uploads...');

  const collection = mongoDb.collection('uploads');
  const documents = await collection.find().toArray();

  console.log(`Found ${documents.length} documents in uploads`);

  for (const doc of documents) {
    // Transform document for PostgreSQL
    const pgDoc = transformDocumentuploads(doc);

    // Insert into PostgreSQL
    await insertIntouploads(pgClient, pgDoc);
  }

  console.log(`Migrated ${documents.length} documents from uploads`);
}

function transformDocumentuploads(doc) {
  // Transform MongoDB document to PostgreSQL format
  return {
    // Map fields appropriately
    _id: doc._id.toString(),
    filename: doc.filename,
    filetype: doc.filetype,
    filesize: doc.filesize,
    resource: doc.resource,
    resourceid: doc.resourceId,
    key: doc.key,
    name: doc.name,
    archived: doc.archived,
    createdat: doc.createdAt ? JSON.stringify(doc.createdAt) : null,
    updatedat: doc.updatedAt ? JSON.stringify(doc.updatedAt) : null,
    __v: doc.__v,
    description: doc.description,
    resourcecontext: doc.resourceContext
  };
}

async function insertIntouploads(pgClient, doc) {
  const query = `
    INSERT INTO uploads (
      "_id",
      "filename",
      "filetype",
      "filesize",
      "resource",
      "resourceid",
      "key",
      "name",
      "activity",
      "archived",
      "createdat",
      "updatedat",
      "__v",
      "description",
      "resourcecontext"
    ) VALUES (
      $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}
    )
  `;

  const values = [
    doc._id,
    doc.filename,
    doc.filetype,
    doc.filesize,
    doc.resource,
    doc.resourceid,
    doc.key,
    doc.name,
    doc.activity,
    doc.archived,
    doc.createdat,
    doc.updatedat,
    doc.__v,
    doc.description,
    doc.resourcecontext
  ];

  await pgClient.query(query, values);
}


async function migratelookuptables(mongoDb, pgClient) {
  console.log('Migrating lookuptables...');

  const collection = mongoDb.collection('lookuptables');
  const documents = await collection.find().toArray();

  console.log(`Found ${documents.length} documents in lookuptables`);

  for (const doc of documents) {
    // Transform document for PostgreSQL
    const pgDoc = transformDocumentlookuptables(doc);

    // Insert into PostgreSQL
    await insertIntolookuptables(pgClient, pgDoc);
  }

  console.log(`Migrated ${documents.length} documents from lookuptables`);
}

function transformDocumentlookuptables(doc) {
  // Transform MongoDB document to PostgreSQL format
  return {
    // Map fields appropriately
    _id: doc._id.toString(),
    name: doc.name,
    createdat: doc.createdAt ? JSON.stringify(doc.createdAt) : null,
    updatedat: doc.updatedAt ? JSON.stringify(doc.updatedAt) : null,
    __v: doc.__v
  };
}

async function insertIntolookuptables(pgClient, doc) {
  const query = `
    INSERT INTO lookuptables (
      "_id",
      "name",
      "columns",
      "data",
      "createdat",
      "updatedat",
      "__v"
    ) VALUES (
      $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}
    )
  `;

  const values = [
    doc._id,
    doc.name,
    doc.columns,
    doc.data,
    doc.createdat,
    doc.updatedat,
    doc.__v
  ];

  await pgClient.query(query, values);
}


async function migratebetawhitelists(mongoDb, pgClient) {
  console.log('Migrating betawhitelists...');

  const collection = mongoDb.collection('betawhitelists');
  const documents = await collection.find().toArray();

  console.log(`Found ${documents.length} documents in betawhitelists`);

  for (const doc of documents) {
    // Transform document for PostgreSQL
    const pgDoc = transformDocumentbetawhitelists(doc);

    // Insert into PostgreSQL
    await insertIntobetawhitelists(pgClient, pgDoc);
  }

  console.log(`Migrated ${documents.length} documents from betawhitelists`);
}

function transformDocumentbetawhitelists(doc) {
  // Transform MongoDB document to PostgreSQL format
  return {
    // Map fields appropriately
    _id: doc._id.toString(),
    name: doc.name,
    email: doc.email,
    __v: doc.__v
  };
}

async function insertIntobetawhitelists(pgClient, doc) {
  const query = `
    INSERT INTO betawhitelists (
      "_id",
      "name",
      "email",
      "__v"
    ) VALUES (
      $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}
    )
  `;

  const values = [
    doc._id,
    doc.name,
    doc.email,
    doc.__v
  ];

  await pgClient.query(query, values);
}


async function migrateactivities(mongoDb, pgClient) {
  console.log('Migrating activities...');

  const collection = mongoDb.collection('activities');
  const documents = await collection.find().toArray();

  console.log(`Found ${documents.length} documents in activities`);

  for (const doc of documents) {
    // Transform document for PostgreSQL
    const pgDoc = transformDocumentactivities(doc);

    // Insert into PostgreSQL
    await insertIntoactivities(pgClient, pgDoc);
  }

  console.log(`Migrated ${documents.length} documents from activities`);
}

function transformDocumentactivities(doc) {
  // Transform MongoDB document to PostgreSQL format
  return {
    // Map fields appropriately
    _id: doc._id.toString(),
    resource: doc.resource,
    resourceid: doc.resourceId,
    activity: doc.activity,
    by: doc.by,
    __v: doc.__v
  };
}

async function insertIntoactivities(pgClient, doc) {
  const query = `
    INSERT INTO activities (
      "_id",
      "resource",
      "resourceid",
      "activity",
      "ts",
      "by",
      "__v",
      "data"
    ) VALUES (
      $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}
    )
  `;

  const values = [
    doc._id,
    doc.resource,
    doc.resourceid,
    doc.activity,
    doc.ts,
    doc.by,
    doc.__v,
    doc.data
  ];

  await pgClient.query(query, values);
}


async function migratebetawaitlists(mongoDb, pgClient) {
  console.log('Migrating betawaitlists...');

  const collection = mongoDb.collection('betawaitlists');
  const documents = await collection.find().toArray();

  console.log(`Found ${documents.length} documents in betawaitlists`);

  for (const doc of documents) {
    // Transform document for PostgreSQL
    const pgDoc = transformDocumentbetawaitlists(doc);

    // Insert into PostgreSQL
    await insertIntobetawaitlists(pgClient, pgDoc);
  }

  console.log(`Migrated ${documents.length} documents from betawaitlists`);
}

function transformDocumentbetawaitlists(doc) {
  // Transform MongoDB document to PostgreSQL format
  return {
    // Map fields appropriately
    _id: doc._id.toString(),
    name: doc.name,
    email: doc.email,
    __v: doc.__v
  };
}

async function insertIntobetawaitlists(pgClient, doc) {
  const query = `
    INSERT INTO betawaitlists (
      "_id",
      "name",
      "email",
      "__v"
    ) VALUES (
      $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}
    )
  `;

  const values = [
    doc._id,
    doc.name,
    doc.email,
    doc.__v
  ];

  await pgClient.query(query, values);
}


async function migratelocations(mongoDb, pgClient) {
  console.log('Migrating locations...');

  const collection = mongoDb.collection('locations');
  const documents = await collection.find().toArray();

  console.log(`Found ${documents.length} documents in locations`);

  for (const doc of documents) {
    // Transform document for PostgreSQL
    const pgDoc = transformDocumentlocations(doc);

    // Insert into PostgreSQL
    await insertIntolocations(pgClient, pgDoc);
  }

  console.log(`Migrated ${documents.length} documents from locations`);
}

function transformDocumentlocations(doc) {
  // Transform MongoDB document to PostgreSQL format
  return {
    // Map fields appropriately
    _id: doc._id.toString(),
    name: doc.name,
    address: doc.address,
    city: doc.city,
    state: doc.state,
    zip: doc.zip,
    archived: doc.archived,
    __v: doc.__v,
    overrides: doc.overrides ? JSON.stringify(doc.overrides) : null
  };
}

async function insertIntolocations(pgClient, doc) {
  const query = `
    INSERT INTO locations (
      "_id",
      "name",
      "address",
      "city",
      "state",
      "zip",
      "contacts",
      "equipment",
      "archived",
      "__v",
      "overrides"
    ) VALUES (
      $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}
    )
  `;

  const values = [
    doc._id,
    doc.name,
    doc.address,
    doc.city,
    doc.state,
    doc.zip,
    doc.contacts,
    doc.equipment,
    doc.archived,
    doc.__v,
    doc.overrides
  ];

  await pgClient.query(query, values);
}


async function migrateusers(mongoDb, pgClient) {
  console.log('Migrating users...');

  const collection = mongoDb.collection('users');
  const documents = await collection.find().toArray();

  console.log(`Found ${documents.length} documents in users`);

  for (const doc of documents) {
    // Transform document for PostgreSQL
    const pgDoc = transformDocumentusers(doc);

    // Insert into PostgreSQL
    await insertIntousers(pgClient, pgDoc);
  }

  console.log(`Migrated ${documents.length} documents from users`);
}

function transformDocumentusers(doc) {
  // Transform MongoDB document to PostgreSQL format
  return {
    // Map fields appropriately
    _id: doc._id.toString(),
    name: doc.name,
    email: doc.email,
    password: doc.password,
    privacy: doc.privacy,
    termsandconditions: doc.termsAndConditions,
    lastlogin: doc.lastLogin ? JSON.stringify(doc.lastLogin) : null,
    archived: doc.archived,
    __v: doc.__v,
    recovery: doc.recovery,
    preferences: doc.preferences ? JSON.stringify(doc.preferences) : null,
    group: doc.group,
    timezone: doc.timezone
  };
}

async function insertIntousers(pgClient, doc) {
  const query = `
    INSERT INTO users (
      "_id",
      "name",
      "email",
      "password",
      "access",
      "privacy",
      "termsandconditions",
      "logaccess",
      "lastlogin",
      "archived",
      "__v",
      "recovery",
      "preferences",
      "group",
      "timezone"
    ) VALUES (
      $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}
    )
  `;

  const values = [
    doc._id,
    doc.name,
    doc.email,
    doc.password,
    doc.access,
    doc.privacy,
    doc.termsandconditions,
    doc.logaccess,
    doc.lastlogin,
    doc.archived,
    doc.__v,
    doc.recovery,
    doc.preferences,
    doc.group,
    doc.timezone
  ];

  await pgClient.query(query, values);
}


async function migratealerts(mongoDb, pgClient) {
  console.log('Migrating alerts...');

  const collection = mongoDb.collection('alerts');
  const documents = await collection.find().toArray();

  console.log(`Found ${documents.length} documents in alerts`);

  for (const doc of documents) {
    // Transform document for PostgreSQL
    const pgDoc = transformDocumentalerts(doc);

    // Insert into PostgreSQL
    await insertIntoalerts(pgClient, pgDoc);
  }

  console.log(`Migrated ${documents.length} documents from alerts`);
}

function transformDocumentalerts(doc) {
  // Transform MongoDB document to PostgreSQL format
  return {
    // Map fields appropriately
    _id: doc._id.toString(),
    type: doc.type,
    data: doc.data ? JSON.stringify(doc.data) : null,
    by: doc.by,
    createdat: doc.createdAt ? JSON.stringify(doc.createdAt) : null,
    updatedat: doc.updatedAt ? JSON.stringify(doc.updatedAt) : null,
    __v: doc.__v
  };
}

async function insertIntoalerts(pgClient, doc) {
  const query = `
    INSERT INTO alerts (
      "_id",
      "type",
      "data",
      "by",
      "createdat",
      "updatedat",
      "__v"
    ) VALUES (
      $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}
    )
  `;

  const values = [
    doc._id,
    doc.type,
    doc.data,
    doc.by,
    doc.createdat,
    doc.updatedat,
    doc.__v
  ];

  await pgClient.query(query, values);
}


async function migratelogs(mongoDb, pgClient) {
  console.log('Migrating logs...');

  const collection = mongoDb.collection('logs');
  const documents = await collection.find().toArray();

  console.log(`Found ${documents.length} documents in logs`);

  for (const doc of documents) {
    // Transform document for PostgreSQL
    const pgDoc = transformDocumentlogs(doc);

    // Insert into PostgreSQL
    await insertIntologs(pgClient, pgDoc);
  }

  console.log(`Migrated ${documents.length} documents from logs`);
}

function transformDocumentlogs(doc) {
  // Transform MongoDB document to PostgreSQL format
  return {
    // Map fields appropriately
    _id: doc._id.toString(),
    archived: doc.archived,
    customer: doc.customer,
    location: doc.location,
    equipment: doc.equipment,
    createdat: doc.createdAt ? JSON.stringify(doc.createdAt) : null,
    updatedat: doc.updatedAt ? JSON.stringify(doc.updatedAt) : null,
    __v: doc.__v,
    completion: doc.completion,
    conclusion: doc.conclusion,
    action: doc.action,
    technician: doc.technician ? JSON.stringify(doc.technician) : null,
    verified: doc.verified ? JSON.stringify(doc.verified) : null,
    workorder: doc.workOrder,
    locked: doc.locked,
    lockts: doc.lockTs ? JSON.stringify(doc.lockTs) : null
  };
}

async function insertIntologs(pgClient, doc) {
  const query = `
    INSERT INTO logs (
      "_id",
      "archived",
      "customer",
      "location",
      "equipment",
      "createdat",
      "updatedat",
      "__v",
      "calculations",
      "checklist",
      "completion",
      "log",
      "conclusion",
      "action",
      "technician",
      "verified",
      "workorder",
      "locked",
      "lockts",
      "costanalyses"
    ) VALUES (
      $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}
    )
  `;

  const values = [
    doc._id,
    doc.archived,
    doc.customer,
    doc.location,
    doc.equipment,
    doc.createdat,
    doc.updatedat,
    doc.__v,
    doc.calculations,
    doc.checklist,
    doc.completion,
    doc.log,
    doc.conclusion,
    doc.action,
    doc.technician,
    doc.verified,
    doc.workorder,
    doc.locked,
    doc.lockts,
    doc.costanalyses
  ];

  await pgClient.query(query, values);
}


async function migrategroups(mongoDb, pgClient) {
  console.log('Migrating groups...');

  const collection = mongoDb.collection('groups');
  const documents = await collection.find().toArray();

  console.log(`Found ${documents.length} documents in groups`);

  for (const doc of documents) {
    // Transform document for PostgreSQL
    const pgDoc = transformDocumentgroups(doc);

    // Insert into PostgreSQL
    await insertIntogroups(pgClient, pgDoc);
  }

  console.log(`Migrated ${documents.length} documents from groups`);
}

function transformDocumentgroups(doc) {
  // Transform MongoDB document to PostgreSQL format
  return {
    // Map fields appropriately
    _id: doc._id.toString(),
    archived: doc.archived,
    name: doc.name,
    __v: doc.__v,
    order: doc.order,
    description: doc.description
  };
}

async function insertIntogroups(pgClient, doc) {
  const query = `
    INSERT INTO groups (
      "_id",
      "archived",
      "name",
      "permissions",
      "__v",
      "order",
      "description"
    ) VALUES (
      $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}
    )
  `;

  const values = [
    doc._id,
    doc.archived,
    doc.name,
    doc.permissions,
    doc.__v,
    doc.order,
    doc.description
  ];

  await pgClient.query(query, values);
}


async function migratenotifications(mongoDb, pgClient) {
  console.log('Migrating notifications...');

  const collection = mongoDb.collection('notifications');
  const documents = await collection.find().toArray();

  console.log(`Found ${documents.length} documents in notifications`);

  for (const doc of documents) {
    // Transform document for PostgreSQL
    const pgDoc = transformDocumentnotifications(doc);

    // Insert into PostgreSQL
    await insertIntonotifications(pgClient, pgDoc);
  }

  console.log(`Migrated ${documents.length} documents from notifications`);
}

function transformDocumentnotifications(doc) {
  // Transform MongoDB document to PostgreSQL format
  return {
    // Map fields appropriately
    _id: doc._id.toString(),
    activity: doc.activity,
    user: doc.user,
    read: doc.read,
    archived: doc.archived,
    createdat: doc.createdAt ? JSON.stringify(doc.createdAt) : null,
    updatedat: doc.updatedAt ? JSON.stringify(doc.updatedAt) : null,
    __v: doc.__v
  };
}

async function insertIntonotifications(pgClient, doc) {
  const query = `
    INSERT INTO notifications (
      "_id",
      "activity",
      "user",
      "read",
      "archived",
      "createdat",
      "updatedat",
      "__v"
    ) VALUES (
      $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}
    )
  `;

  const values = [
    doc._id,
    doc.activity,
    doc.user,
    doc.read,
    doc.archived,
    doc.createdat,
    doc.updatedat,
    doc.__v
  ];

  await pgClient.query(query, values);
}


async function migratecontacts(mongoDb, pgClient) {
  console.log('Migrating contacts...');

  const collection = mongoDb.collection('contacts');
  const documents = await collection.find().toArray();

  console.log(`Found ${documents.length} documents in contacts`);

  for (const doc of documents) {
    // Transform document for PostgreSQL
    const pgDoc = transformDocumentcontacts(doc);

    // Insert into PostgreSQL
    await insertIntocontacts(pgClient, pgDoc);
  }

  console.log(`Migrated ${documents.length} documents from contacts`);
}

function transformDocumentcontacts(doc) {
  // Transform MongoDB document to PostgreSQL format
  return {
    // Map fields appropriately
    _id: doc._id.toString(),
    archived: doc.archived,
    name: doc.name ? JSON.stringify(doc.name) : null,
    email: doc.email,
    __v: doc.__v,
    user: doc.user,
    title: doc.title
  };
}

async function insertIntocontacts(pgClient, doc) {
  const query = `
    INSERT INTO contacts (
      "_id",
      "archived",
      "name",
      "email",
      "phone",
      "__v",
      "user",
      "title"
    ) VALUES (
      $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}
    )
  `;

  const values = [
    doc._id,
    doc.archived,
    doc.name,
    doc.email,
    doc.phone,
    doc.__v,
    doc.user,
    doc.title
  ];

  await pgClient.query(query, values);
}


async function migrateplans(mongoDb, pgClient) {
  console.log('Migrating plans...');

  const collection = mongoDb.collection('plans');
  const documents = await collection.find().toArray();

  console.log(`Found ${documents.length} documents in plans`);

  for (const doc of documents) {
    // Transform document for PostgreSQL
    const pgDoc = transformDocumentplans(doc);

    // Insert into PostgreSQL
    await insertIntoplans(pgClient, pgDoc);
  }

  console.log(`Migrated ${documents.length} documents from plans`);
}

function transformDocumentplans(doc) {
  // Transform MongoDB document to PostgreSQL format
  return {
    // Map fields appropriately
    _id: doc._id.toString(),
    name: doc.name,
    description: doc.description,
    __v: doc.__v
  };
}

async function insertIntoplans(pgClient, doc) {
  const query = `
    INSERT INTO plans (
      "_id",
      "permissions",
      "name",
      "description",
      "__v"
    ) VALUES (
      $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}, $${i + 1}
    )
  `;

  const values = [
    doc._id,
    doc.permissions,
    doc.name,
    doc.description,
    doc.__v
  ];

  await pgClient.query(query, values);
}


// Run the migration
migrateData()
  .then(() => console.log('Migration script completed'))
  .catch(err => console.error('Migration script failed:', err));
