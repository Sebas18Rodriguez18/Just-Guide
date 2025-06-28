/*
  # Fix user deletion functionality

  1. Updates
    - Update the delete_user_completely function to properly handle user deletion
    - Ensure all user data is completely removed from the database
    - Allow users to re-register with the same email after deletion
*/

-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS public.delete_user_completely(jsonb);

-- Create an improved version of the function
CREATE OR REPLACE FUNCTION public.delete_user_completely()
RETURNS boolean AS $$
DECLARE
  current_user_id uuid;
  current_user_email text;
  success boolean := false;
BEGIN
  -- Get the current user's ID
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Get the user's email before deletion
  SELECT email INTO current_user_email FROM auth.users WHERE id = current_user_id;
  
  IF current_user_email IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  -- Begin transaction
  BEGIN
    -- Delete from all related tables in public schema
    -- This will cascade to all tables with foreign key constraints
    DELETE FROM public.users WHERE id = current_user_id;
    
    -- Delete from auth schema tables
    -- Delete from auth.identities
    DELETE FROM auth.identities WHERE user_id = current_user_id;
    
    -- Delete from auth.sessions
    DELETE FROM auth.sessions WHERE user_id = current_user_id;
    
    -- Delete from auth.refresh_tokens
    DELETE FROM auth.refresh_tokens WHERE user_id = current_user_id;
    
    -- Delete from auth.mfa_factors
    DELETE FROM auth.mfa_factors WHERE user_id = current_user_id;
    
    -- Delete from auth.flow_state
    DELETE FROM auth.flow_state 
    WHERE id IN (
      SELECT fs.id 
      FROM auth.flow_state fs
      WHERE fs.auth_code = current_user_id::text
      OR fs.auth_code LIKE '%' || current_user_id::text || '%'
    );
    
    -- Delete from auth.users
    DELETE FROM auth.users WHERE id = current_user_id;
    
    -- Clean up any remaining email confirmations for this email
    DELETE FROM auth.flow_state 
    WHERE auth_code LIKE '%' || current_user_email || '%';
    
    success := true;
    
    -- If we get here, everything succeeded
    RETURN success;
  EXCEPTION
    WHEN OTHERS THEN
      -- Log the error
      RAISE NOTICE 'Error deleting user: %', SQLERRM;
      RETURN false;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to all authenticated users
GRANT EXECUTE ON FUNCTION public.delete_user_completely() TO authenticated;

-- Add comment to function
COMMENT ON FUNCTION public.delete_user_completely() IS 'Completely deletes the current user from both auth and public schemas, allowing re-registration with the same email';