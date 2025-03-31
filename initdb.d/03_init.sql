-- Create a custom schema for your project
CREATE SCHEMA IF NOT EXISTS public;

-- Create a sample table
CREATE TABLE IF NOT EXISTS public.todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id UUID NOT NULL
);

-- Example comment
COMMENT ON TABLE public.todos IS 'A table to store todo items';

-- Create an example view
CREATE OR REPLACE VIEW public.active_todos AS
  SELECT * FROM public.todos WHERE completed = FALSE;

-- Add permissions for authenticated users
-- This will be automatically set up by Hasura Auth 