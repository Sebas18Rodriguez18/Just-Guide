/*
  # Add missing columns to legal_history table

  1. Schema Updates
    - Add `description` column to legal_history table
    - Add `status` column to legal_history table  
    - Add `entity` column to legal_history table

  2. Security
    - Maintain existing RLS policies
*/

-- Add missing columns to legal_history table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'legal_history' AND column_name = 'description'
  ) THEN
    ALTER TABLE legal_history ADD COLUMN description text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'legal_history' AND column_name = 'status'
  ) THEN
    ALTER TABLE legal_history ADD COLUMN status text DEFAULT 'completed';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'legal_history' AND column_name = 'entity'
  ) THEN
    ALTER TABLE legal_history ADD COLUMN entity text;
  END IF;
END $$;

-- Create index for better query performance on status column
CREATE INDEX IF NOT EXISTS idx_legal_history_status ON legal_history(status);