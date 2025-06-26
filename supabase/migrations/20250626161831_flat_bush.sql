/*
  # Fix simplified_guides table schema

  1. Schema Changes
    - Drop existing simplified_guides table if it exists with wrong schema
    - Create new simplified_guides table with correct columns:
      - `id` (uuid, primary key)
      - `document_id` (uuid, foreign key to documents)
      - `summary` (text, required)
      - `steps` (text array, required) - This is the key missing column
      - `reading_level` (text, default 'B1')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `simplified_guides` table
    - Add policy for users to access guides for their documents

  3. Performance
    - Add index for document_id lookups
*/

-- Drop existing table if it has wrong schema
DROP TABLE IF EXISTS simplified_guides CASCADE;

-- Create the table with correct schema
CREATE TABLE simplified_guides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  summary text NOT NULL,
  steps text[] NOT NULL,
  reading_level text DEFAULT 'B1',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE simplified_guides ENABLE ROW LEVEL SECURITY;

-- Create policy for users to access guides for their documents
CREATE POLICY "Users can access guides for their documents"
  ON simplified_guides
  FOR ALL
  TO authenticated
  USING (
    document_id IN (
      SELECT id FROM documents WHERE user_id = auth.uid()
    )
  );

-- Create trigger for updated_at if the function exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
    CREATE TRIGGER update_simplified_guides_updated_at
      BEFORE UPDATE ON simplified_guides
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Create index for better query performance
CREATE INDEX idx_simplified_guides_document_id ON simplified_guides(document_id);

-- Create unique constraint to prevent duplicate guides per document
CREATE UNIQUE INDEX idx_simplified_guides_document_unique ON simplified_guides(document_id);