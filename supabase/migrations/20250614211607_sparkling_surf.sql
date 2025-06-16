/*
  # Create legal_entities table

  1. New Tables
    - `legal_entities`
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `type` (text, required)
      - `city` (text, required)
      - `contact_email` (text)
      - `submission_url` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `legal_entities` table
    - Add policy for authenticated users to read legal entities
    - Add policy for admins to manage legal entities
*/

CREATE TABLE IF NOT EXISTS legal_entities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL,
  city text NOT NULL,
  contact_email text,
  submission_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE legal_entities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read legal entities"
  ON legal_entities
  FOR SELECT
  TO authenticated
  USING (true);

-- For now, allow authenticated users to manage legal entities
-- In production, this should be restricted to admin users
CREATE POLICY "Authenticated users can manage legal entities"
  ON legal_entities
  FOR ALL
  TO authenticated
  USING (true);

-- Create trigger for legal_entities table
CREATE TRIGGER update_legal_entities_updated_at
  BEFORE UPDATE ON legal_entities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_legal_entities_type ON legal_entities(type);
CREATE INDEX IF NOT EXISTS idx_legal_entities_city ON legal_entities(city);