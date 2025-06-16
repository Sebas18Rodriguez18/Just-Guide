/*
  # Create legal_history table

  1. New Tables
    - `legal_history`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `procedure_type` (text, required)
      - `result` (text, required)
      - `date` (timestamp, default now)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `legal_history` table
    - Add policy for users to manage their own legal history
*/

CREATE TABLE IF NOT EXISTS legal_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  procedure_type text NOT NULL,
  result text NOT NULL,
  date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE legal_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own legal history"
  ON legal_history
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Create trigger for legal_history table
CREATE TRIGGER update_legal_history_updated_at
  BEFORE UPDATE ON legal_history
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_legal_history_user_id ON legal_history(user_id);
CREATE INDEX IF NOT EXISTS idx_legal_history_date ON legal_history(date);