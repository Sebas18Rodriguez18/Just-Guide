/*
  # Create stored procedure for complete user deletion

  1. New Functions
    - `delete_user_completely` - A stored procedure that completely removes a user from auth and public schemas
    - This function allows users to delete their accounts and re-register with the same email

  2. Security
    - Function is accessible to authenticated users to delete their own accounts
*/

-- Create a function to completely delete a user
CREATE OR REPLACE FUNCTION public.delete_user_completely()
RETURNS void AS $$
DECLARE
  current_user_id uuid;
  current_user_email text;
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
  
  -- Delete the user from public.users (this will cascade to related tables)
  DELETE FROM public.users WHERE id = current_user_id;
  
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
  
  -- Delete from auth.users_with_role
  DELETE FROM auth.users_with_role WHERE id = current_user_id;
  
  -- Clean up any remaining email confirmations for this email
  DELETE FROM auth.flow_state 
  WHERE auth_code LIKE '%' || current_user_email || '%';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to all authenticated users
GRANT EXECUTE ON FUNCTION public.delete_user_completely() TO authenticated;

-- Add comment to function
COMMENT ON FUNCTION public.delete_user_completely() IS 'Completely deletes the current user from both auth and public schemas, allowing re-registration with the same email';