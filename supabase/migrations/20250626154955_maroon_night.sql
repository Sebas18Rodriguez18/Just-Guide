/*
  # Create simplified_guides table

  1. New Tables
    - `simplified_guides`
      - `id` (uuid, primary key)
      - `document_id` (uuid, foreign key to documents)
      - `summary` (text, required)
      - `steps` (text array, required)
      - `reading_level` (text, default 'B1')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `simplified_guides` table
    - Add policy for users to access guides for their documents
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
CREATE TRIGGER update_simplified_guides_updated_at
  BEFORE UPDATE ON simplified_guides
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_simplified_guides_document_id ON simplified_guides(document_id);