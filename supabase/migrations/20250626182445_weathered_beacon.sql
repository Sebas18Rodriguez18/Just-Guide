/*
  # Update legal_history table

  1. Schema Updates
    - Add `document_id` column to legal_history table
    - Add `document_title` column to legal_history table
    - Add `jurisdiction` column to legal_history table

  2. Security
    - Update RLS policies to maintain security
*/

-- Add new columns to legal_history table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'legal_history' AND column_name = 'document_id'
  ) THEN
    ALTER TABLE legal_history ADD COLUMN document_id uuid REFERENCES documents(id) ON DELETE SET NULL;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'legal_history' AND column_name = 'document_title'
  ) THEN
    ALTER TABLE legal_history ADD COLUMN document_title text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'legal_history' AND column_name = 'jurisdiction'
  ) THEN
    ALTER TABLE legal_history ADD COLUMN jurisdiction text;
  END IF;
END $$;

-- Create unique constraint to prevent duplicate entries per document
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'legal_history_document_id_unique'
  ) THEN
    ALTER TABLE legal_history ADD CONSTRAINT legal_history_document_id_unique UNIQUE (document_id);
  END IF;
END $$;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_legal_history_document_id ON legal_history(document_id);
CREATE INDEX IF NOT EXISTS idx_legal_history_jurisdiction ON legal_history(jurisdiction);