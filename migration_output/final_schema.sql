-- PostgreSQL schema for MongoDB migration
-- This schema includes proper primary and foreign key relationships

-- Enable UUID extension for generating unique IDs if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create groups table
CREATE TABLE groups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  archived BOOLEAN DEFAULT FALSE,
  order_num INTEGER,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Create permissions table
CREATE TABLE permissions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Create group_permissions junction table
CREATE TABLE group_permissions (
  id TEXT PRIMARY KEY,
  group_id TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  permission_id TEXT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  value TEXT,
  scope TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  UNIQUE(group_id, permission_id, scope)
);

-- Create users table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  group_id TEXT REFERENCES groups(id) ON DELETE SET NULL,
  timezone TEXT,
  privacy TEXT,
  terms_and_conditions TEXT,
  archived BOOLEAN DEFAULT FALSE,
  preferences TEXT, -- JSON string for complex nested data
  access TEXT, -- JSON string for array data
  log_access TEXT, -- JSON string for array data
  last_login TEXT, -- JSON string for object data
  recovery TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Create contacts table
CREATE TABLE contacts (
  id TEXT PRIMARY KEY,
  first_name TEXT NOT NULL,
  middle_name TEXT,
  last_name TEXT NOT NULL,
  email TEXT,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  archived BOOLEAN DEFAULT FALSE,
  phone TEXT, -- JSON string for array data
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Create customers table
CREATE TABLE customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  archived BOOLEAN DEFAULT FALSE,
  metadata TEXT, -- JSON string for complex nested data
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Create customer_contacts junction table
CREATE TABLE customer_contacts (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  contact_id TEXT NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  primary_contact BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  UNIQUE(customer_id, contact_id)
);

-- Create locations table
CREATE TABLE locations (
  id TEXT PRIMARY KEY,
  customer_id TEXT REFERENCES customers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  archived BOOLEAN DEFAULT FALSE,
  overrides TEXT, -- JSON string for object data
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Create location_contacts junction table
CREATE TABLE location_contacts (
  id TEXT PRIMARY KEY,
  location_id TEXT NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  contact_id TEXT NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  primary_contact BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  UNIQUE(location_id, contact_id)
);

-- Create equipment_types table
CREATE TABLE equipment_types (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Create equipment table
CREATE TABLE equipment (
  id TEXT PRIMARY KEY,
  type_id TEXT REFERENCES equipment_types(id) ON DELETE SET NULL,
  location_id TEXT REFERENCES locations(id) ON DELETE SET NULL,
  completion NUMERIC,
  archived BOOLEAN DEFAULT FALSE,
  design TEXT, -- JSON string for array data
  info TEXT, -- JSON string for array data
  created_at VARCHAR(255),
  updated_at VARCHAR(255),
);

-- Create audits table
CREATE TABLE audits (
  id TEXT PRIMARY KEY,
  equipment_id TEXT REFERENCES equipment(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  data TEXT, -- JSON string for complex data
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Create activities table
CREATE TABLE activities (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  type TEXT,
  description TEXT,
  metadata TEXT, -- JSON string for complex data
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Create notifications table
CREATE TABLE notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  type TEXT,
  message TEXT,
  read BOOLEAN DEFAULT FALSE,
  metadata TEXT, -- JSON string for complex data
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Create logs table
CREATE TABLE logs (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  action TEXT,
  entity_type TEXT,
  entity_id TEXT,
  details TEXT, -- JSON string for complex data
  created_at TIMESTAMP
);

-- Add a constraint to ensure entity_id references the correct table based on entity_type
-- This is a comment as PostgreSQL doesn't support dynamic foreign keys directly
-- You would need to implement this with triggers or application logic

-- Create uploads table
CREATE TABLE uploads (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  filename TEXT,
  mimetype TEXT,
  size NUMERIC,
  path TEXT,
  metadata TEXT, -- JSON string for complex data
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Create templates table
CREATE TABLE templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  content TEXT, -- JSON string for complex data
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Create report_templates table
CREATE TABLE report_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  content TEXT, -- JSON string for complex data
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Create reporttemplates_fixed table
CREATE TABLE reporttemplates_fixed (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  template TEXT REFERENCES templates(id) ON DELETE SET NULL,
  components TEXT, -- JSON string for array data
  visibility INTEGER DEFAULT 0,
  created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  archived BOOLEAN DEFAULT FALSE,
  created_at VARCHAR(255),
  updated_at VARCHAR(255),
  version INTEGER DEFAULT 0
);

-- Create lookup_tables table
CREATE TABLE lookup_tables (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  data TEXT, -- JSON string for complex data
  created_at VARCHAR(255),
  updated_at VARCHAR(255)
);

-- Create licenses table
CREATE TABLE licenses (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  key TEXT,
  type TEXT,
  status TEXT,
  customer_id TEXT REFERENCES customers(id) ON DELETE CASCADE,
  metadata TEXT, -- JSON string for complex data
  expires_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Create globals table
CREATE TABLE globals (
  id TEXT PRIMARY KEY,
  name TEXT,
  value TEXT, -- JSON string for complex data
  description TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Create apikeys table
CREATE TABLE apikeys (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  key TEXT NOT NULL,
  secret TEXT,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  permissions TEXT, -- JSON string for array data
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Create options table
CREATE TABLE options (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  value TEXT, -- JSON string for complex data
  description TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Create betawhitelists table
CREATE TABLE betawhitelists (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  metadata TEXT, -- JSON string for complex data
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Create betawaitlists table
CREATE TABLE betawaitlists (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  metadata TEXT, -- JSON string for complex data
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Create alerts table
CREATE TABLE alerts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT,
  type TEXT,
  level TEXT,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  metadata TEXT, -- JSON string for complex data
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Create plans table
CREATE TABLE plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  features TEXT, -- JSON string for array data
  price NUMERIC,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Create indexes for foreign keys and frequently queried fields
CREATE INDEX idx_users_group_id ON users(group_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_contacts_user_id ON contacts(user_id);
CREATE INDEX idx_locations_customer_id ON locations(customer_id);
CREATE INDEX idx_equipment_location_id ON equipment(location_id);
CREATE INDEX idx_equipment_type_id ON equipment(type_id);
CREATE INDEX idx_audits_equipment_id ON audits(equipment_id);
CREATE INDEX idx_audits_user_id ON audits(user_id);
CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_logs_user_id ON logs(user_id);
CREATE INDEX idx_logs_entity_id ON logs(entity_id);
CREATE INDEX idx_uploads_user_id ON uploads(user_id);

-- Create indexes for archived fields for filtered queries
CREATE INDEX idx_users_archived ON users(archived);
CREATE INDEX idx_customers_archived ON customers(archived);
CREATE INDEX idx_locations_archived ON locations(archived);
CREATE INDEX idx_equipment_archived ON equipment(archived);
CREATE INDEX idx_contacts_archived ON contacts(archived);

-- Create indexes for the new tables
CREATE INDEX idx_licenses_customer_id ON licenses(customer_id);
CREATE INDEX idx_apikeys_user_id ON apikeys(user_id);
CREATE INDEX idx_alerts_user_id ON alerts(user_id);
CREATE INDEX idx_betawhitelists_email ON betawhitelists(email);
CREATE INDEX idx_betawaitlists_email ON betawaitlists(email);
CREATE INDEX idx_reporttemplates_fixed_template ON reporttemplates_fixed(template);
CREATE INDEX idx_reporttemplates_fixed_created_by ON reporttemplates_fixed(created_by);
CREATE INDEX idx_reporttemplates_fixed_archived ON reporttemplates_fixed(archived);
