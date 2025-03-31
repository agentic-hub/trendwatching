-- Create the 'storage' schema required by Hasura Storage
CREATE SCHEMA IF NOT EXISTS storage;

-- Set appropriate privileges
GRANT USAGE ON SCHEMA storage TO postgres;
GRANT ALL ON SCHEMA storage TO postgres; 