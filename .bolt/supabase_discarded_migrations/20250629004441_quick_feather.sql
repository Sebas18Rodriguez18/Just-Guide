/*
  # Create simplified guides table

  1. New Tables
    - `simplified_guides`
      - `id` (uuid, primary key)
      - `document_id` (uuid, foreign key to documents)
      - `summary` (text)
      - `steps` (text array)
      - `reading_level` (text, default 'B1')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  2. Security
    - Enable RLS on `simplified_guides` table
    - Add policy for authenticated users to access guides for their documents
  3. Performance
    - Add index on document_id
    - Add unique constraint for one guide per document
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

-- Create policy without IF NOT EXISTS (PostgreSQL doesn't support this for policies)
CREATE POLICY "Users can access guides for their documents"
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