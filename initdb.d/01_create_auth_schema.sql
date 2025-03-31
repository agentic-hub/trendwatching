-- Create the 'auth' schema required by Hasura Auth
CREATE SCHEMA IF NOT EXISTS auth;

-- Set appropriate privileges
GRANT USAGE ON SCHEMA auth TO postgres;
GRANT ALL ON SCHEMA auth TO postgres;

-- Create extensions if not already present
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; 