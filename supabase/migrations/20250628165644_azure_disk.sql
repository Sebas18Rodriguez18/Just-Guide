/*
  # Create user profile trigger

  1. Function
    - `handle_new_user()` - Creates a user profile when a new auth user is created
    - Extracts metadata from auth.users and creates corresponding entry in public.users

  2. Trigger
    - Automatically runs when a new user is inserted into auth.users
    - Ensures data consistency between auth.users and public.users tables

  3. Security
    - Function runs with security definer privileges
    - Only creates user profiles, doesn't modify existing ones
*/

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
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
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();