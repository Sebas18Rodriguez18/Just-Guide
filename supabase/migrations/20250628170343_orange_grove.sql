/*
  # Fix user deletion and re-registration issues

  1. Updates
    - Update the handle_new_user function to handle conflicts properly
    - Add ON CONFLICT DO NOTHING to prevent duplicate key errors
    - Ensure proper cleanup when users are deleted
*/

-- Update the handle_new_user function to handle conflicts properly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- First check if the user already exists
  IF EXISTS (SELECT 1 FROM public.users WHERE id = NEW.id) THEN
    -- Update existing user
    UPDATE public.users
    SET 
      name = COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
      email = NEW.email,
      language = COALESCE(NEW.raw_user_meta_data->>'language', 'en'),
      literacy_level = COALESCE(NEW.raw_user_meta_data->>'literacy_level', 'basic'),
      updated_at = NEW.created_at
    WHERE id = NEW.id;
  ELSE
    -- Insert new user
    INSERT INTO public.users (
      id,
      name,
      email,
      hashed_password,
      language,
      literacy_level,
      uploaded_documents,
      history,
      created_at,
      updated_at
    )
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
      NEW.email,
      'supabase_auth',
      COALESCE(NEW.raw_user_meta_data->>'language', 'en'),
      COALESCE(NEW.raw_user_meta_data->>'literacy_level', 'basic'),
      '[]'::jsonb,
      '{}'::jsonb,
      NEW.created_at,
      NEW.created_at
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to handle user deletion
CREATE OR REPLACE FUNCTION public.handle_user_deletion()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete the user from public.users
  DELETE FROM public.users WHERE id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for user deletion
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
CREATE TRIGGER on_auth_user_deleted
  AFTER DELETE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_deletion();

-- Add a function to clean up email confirmations when a user is deleted
CREATE OR REPLACE FUNCTION public.clean_up_user_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete any pending email confirmations
  DELETE FROM auth.flow_state 
  WHERE id IN (
    SELECT fs.id 
    FROM auth.flow_state fs
    JOIN auth.identities i ON fs.auth_code = i.id::text
    WHERE i.user_id = OLD.id
  );
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to clean up user data before deletion
DROP TRIGGER IF EXISTS before_auth_user_deleted ON auth.users;
CREATE TRIGGER before_auth_user_deleted
  BEFORE DELETE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.clean_up_user_data();