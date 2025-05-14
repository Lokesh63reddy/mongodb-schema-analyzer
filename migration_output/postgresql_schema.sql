-- PostgreSQL schema for all collections

CREATE TABLE customers (
  "_id" TEXT NOT NULL,
  "name" TEXT,
  "address" TEXT,
  "city" TEXT,
  "state" TEXT,
  "zip" TEXT,
  "archived" BOOLEAN,
  "metadata" TEXT,
  "__v" NUMERIC,
  "metadata" TEXT,
  "contacts" TEXT,
  "locations" TEXT,
  PRIMARY KEY ("_id")
);

CREATE TABLE licenses (
  "_id" TEXT NOT NULL,
  "plan" TEXT,
  "__v" NUMERIC,
  "metadata" TEXT,
  "plan" TEXT,
  "metadata" TEXT,
  "customers" TEXT,
  "users" TEXT,
  "contacts" TEXT,
  "groups" TEXT,
  PRIMARY KEY ("_id")
);

CREATE TABLE globals (
  "_id" TEXT NOT NULL,
  "name" TEXT,
  "description" TEXT,
  "createdat" TEXT,
  "updatedat" TEXT,
  "__v" NUMERIC,
  "createdat" TEXT,
  "updatedat" TEXT,
  "references" TEXT,
  PRIMARY KEY ("_id")
);

CREATE TABLE equipment (
  "_id" TEXT NOT NULL,
  "archived" BOOLEAN,
  "type" TEXT,
  "location" TEXT,
  "createdat" TEXT,
  "updatedat" TEXT,
  "__v" NUMERIC,
  "completion" NUMERIC,
  "createdat" TEXT,
  "updatedat" TEXT,
  "design" TEXT,
  "info" TEXT,
  PRIMARY KEY ("_id")
);

CREATE TABLE audits (
  "_id" TEXT NOT NULL,
  "action" TEXT,
  "description" TEXT,
  "resource" TEXT,
  "resourceid" TEXT,
  "user" TEXT,
  "level" NUMERIC,
  "occurred" TEXT,
  "__v" NUMERIC,
  "occurred" TEXT,
  PRIMARY KEY ("_id")
);

CREATE TABLE apikeys (
  "_id" TEXT NOT NULL,
  "name" TEXT,
  "key" TEXT,
  "expires" TEXT,
  "user" TEXT,
  "createdat" TEXT,
  "updatedat" TEXT,
  "__v" NUMERIC,
  "createdat" TEXT,
  "updatedat" TEXT,
  "expires" TEXT,
  PRIMARY KEY ("_id")
);

CREATE TABLE reporttemplates (
  "_id" TEXT NOT NULL,
  "title" TEXT,
  "description" TEXT,
  "template" TEXT,
  "visibility" NUMERIC,
  "createdby" TEXT,
  "archived" BOOLEAN,
  "createdat" TEXT,
  "updatedat" TEXT,
  "__v" NUMERIC,
  "ispreset" BOOLEAN,
  "createdat" TEXT,
  "updatedat" TEXT,
  "components" TEXT,
  PRIMARY KEY ("_id")
);

CREATE TABLE reporttemplates_fixed (
  "_id" TEXT NOT NULL,
  "title" TEXT,
  "description" TEXT,
  "template" TEXT,
  "visibility" NUMERIC,
  "createdby" TEXT,
  "archived" BOOLEAN,
  "createdat" TEXT,
  "updatedat" TEXT,
  "__v" NUMERIC,
  "ispreset" BOOLEAN,
  "createdat" TEXT,
  "updatedat" TEXT,
  "components" TEXT,
  PRIMARY KEY ("_id")
);

CREATE TABLE options (
  "_id" TEXT NOT NULL,
  "name" TEXT,
  "description" TEXT,
  "__v" NUMERIC,
  "permissions" TEXT,
  PRIMARY KEY ("_id")
);

CREATE TABLE permissions (
  "_id" TEXT NOT NULL,
  "longname" TEXT,
  "shortname" TEXT,
  "description" TEXT,
  "type" TEXT,
  "scope" TEXT,
  "__v" NUMERIC,
  PRIMARY KEY ("_id")
);

CREATE TABLE templates (
  "_id" TEXT NOT NULL,
  "archived" BOOLEAN,
  "name" TEXT,
  "__v" NUMERIC,
  "updatedat" TEXT,
  "createdat" TEXT,
  "efficiencyconfiguration" TEXT,
  "defaultvariant" TEXT,
  "updatedat" TEXT,
  "createdat" TEXT,
  "efficiencyconfiguration" TEXT,
  "history" TEXT,
  "variants" TEXT,
  "costanalyses" TEXT,
  PRIMARY KEY ("_id")
);

CREATE TABLE uploads (
  "_id" TEXT NOT NULL,
  "filename" TEXT,
  "filetype" TEXT,
  "filesize" NUMERIC,
  "resource" TEXT,
  "resourceid" TEXT,
  "key" TEXT,
  "name" TEXT,
  "archived" BOOLEAN,
  "createdat" TEXT,
  "updatedat" TEXT,
  "__v" NUMERIC,
  "description" TEXT,
  "resourcecontext" TEXT,
  "createdat" TEXT,
  "updatedat" TEXT,
  "activity" TEXT,
  PRIMARY KEY ("_id")
);

CREATE TABLE lookuptables (
  "_id" TEXT NOT NULL,
  "name" TEXT,
  "createdat" TEXT,
  "updatedat" TEXT,
  "__v" NUMERIC,
  "createdat" TEXT,
  "updatedat" TEXT,
  "columns" TEXT,
  "data" TEXT,
  PRIMARY KEY ("_id")
);

CREATE TABLE betawhitelists (
  "_id" TEXT NOT NULL,
  "name" TEXT,
  "email" TEXT,
  "__v" NUMERIC,
  PRIMARY KEY ("_id")
);

CREATE TABLE activities (
  "_id" TEXT NOT NULL,
  "resource" TEXT,
  "resourceid" TEXT,
  "activity" TEXT,
  "by" TEXT,
  "__v" NUMERIC,
  "ts" TEXT,
  "data" TEXT,
  PRIMARY KEY ("_id")
);

CREATE TABLE betawaitlists (
  "_id" TEXT NOT NULL,
  "name" TEXT,
  "email" TEXT,
  "__v" NUMERIC,
  PRIMARY KEY ("_id")
);

CREATE TABLE locations (
  "_id" TEXT NOT NULL,
  "name" TEXT,
  "address" TEXT,
  "city" TEXT,
  "state" TEXT,
  "zip" TEXT,
  "archived" BOOLEAN,
  "__v" NUMERIC,
  "overrides" TEXT,
  "overrides" TEXT,
  "contacts" TEXT,
  "equipment" TEXT,
  PRIMARY KEY ("_id")
);

CREATE TABLE users (
  "_id" TEXT NOT NULL,
  "name" TEXT,
  "email" TEXT,
  "password" TEXT,
  "privacy" BOOLEAN,
  "termsandconditions" BOOLEAN,
  "lastlogin" TEXT,
  "archived" BOOLEAN,
  "__v" NUMERIC,
  "recovery" TEXT,
  "preferences" TEXT,
  "group" TEXT,
  "timezone" TEXT,
  "lastlogin" TEXT,
  "preferences" TEXT,
  "access" TEXT,
  "logaccess" TEXT,
  PRIMARY KEY ("_id")
);

CREATE TABLE alerts (
  "_id" TEXT NOT NULL,
  "type" TEXT,
  "data" TEXT,
  "by" TEXT,
  "createdat" TEXT,
  "updatedat" TEXT,
  "__v" NUMERIC,
  "data" TEXT,
  "createdat" TEXT,
  "updatedat" TEXT,
  PRIMARY KEY ("_id")
);

CREATE TABLE logs (
  "_id" TEXT NOT NULL,
  "archived" BOOLEAN,
  "customer" TEXT,
  "location" TEXT,
  "equipment" TEXT,
  "createdat" TEXT,
  "updatedat" TEXT,
  "__v" NUMERIC,
  "completion" NUMERIC,
  "conclusion" TEXT,
  "action" TEXT,
  "technician" TEXT,
  "verified" BOOLEAN,
  "workorder" NUMERIC,
  "locked" BOOLEAN,
  "lockts" TEXT,
  "createdat" TEXT,
  "updatedat" TEXT,
  "technician" TEXT,
  "verified" TEXT,
  "lockts" TEXT,
  "calculations" TEXT,
  "checklist" TEXT,
  "log" TEXT,
  "costanalyses" TEXT,
  PRIMARY KEY ("_id")
);

CREATE TABLE groups (
  "_id" TEXT NOT NULL,
  "archived" BOOLEAN,
  "name" TEXT,
  "__v" NUMERIC,
  "order" NUMERIC,
  "description" TEXT,
  "permissions" TEXT,
  PRIMARY KEY ("_id")
);

CREATE TABLE notifications (
  "_id" TEXT NOT NULL,
  "activity" TEXT,
  "user" TEXT,
  "read" BOOLEAN,
  "archived" BOOLEAN,
  "createdat" TEXT,
  "updatedat" TEXT,
  "__v" NUMERIC,
  "createdat" TEXT,
  "updatedat" TEXT,
  PRIMARY KEY ("_id")
);

CREATE TABLE contacts (
  "_id" TEXT NOT NULL,
  "archived" BOOLEAN,
  "name" TEXT,
  "email" TEXT,
  "__v" NUMERIC,
  "user" TEXT,
  "title" TEXT,
  "name" TEXT,
  "phone" TEXT,
  PRIMARY KEY ("_id")
);

CREATE TABLE plans (
  "_id" TEXT NOT NULL,
  "name" TEXT,
  "description" TEXT,
  "__v" NUMERIC,
  "permissions" TEXT,
  PRIMARY KEY ("_id")
);

