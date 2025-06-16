/*
  # Create assisted_responses table

  1. New Tables
    - `assisted_responses`
      - `id` (uuid, primary key)
      - `document_id` (uuid, foreign key to documents)
      - `user_id` (uuid, foreign key to users)
      - `answers` (jsonb, stores user responses)
      - `completion_status` (text, default 'in_progress')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `assisted_responses` table
    - Add policy for users to manage their own responses
*/

CREATE TABLE IF NOT EXISTS assisted_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  answers jsonb DEFAULT '{}'::jsonb,
  completion_status text DEFAULT 'in_progress',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(document_id, user_id)
);

ALTER TABLE assisted_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own responses"
  ON assisted_responses
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Create trigger for assisted_responses table
CREATE TRIGGER update_assisted_responses_updated_at
  BEFORE UPDATE ON assisted_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_assisted_responses_user_id ON assisted_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_assisted_responses_document_id ON assisted_responses(document_id);