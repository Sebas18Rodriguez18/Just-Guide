/*
  # Fix simplified_guides table and policies
  
  1. New Tables
    - Ensures simplified_guides table exists with proper structure
  2. Security
    - Adds RLS policy if it doesn't exist yet
    - Creates trigger for updated_at column
  3. Performance
    - Adds index on document_id for better query performance
*/

CREATE TABLE IF NOT EXISTS simplified_guides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  summary text NOT NULL,
  steps text[] NOT NULL,
  reading_level text DEFAULT 'B1',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE simplified_guides ENABLE ROW LEVEL SECURITY;

-- Add IF NOT EXISTS to policy creation to avoid error when policy already exists
CREATE POLICY IF NOT EXISTS "Users can access guides for their documents"
  ON simplified_guides
  FOR ALL
  TO authenticated
  USING (
    document_id IN (
      SELECT id FROM documents WHERE user_id = auth.uid()
    )
  );

-- Create trigger for simplified_guides table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_simplified_guides_updated_at'
  ) THEN
    CREATE TRIGGER update_simplified_guides_updated_at
      BEFORE UPDATE ON simplified_guides
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_simplified_guides_document_id ON simplified_guides(document_id);

-- Create unique index to ensure one guide per document
CREATE UNIQUE INDEX IF NOT EXISTS idx_simplified_guides_document_unique ON simplified_guides(document_id);