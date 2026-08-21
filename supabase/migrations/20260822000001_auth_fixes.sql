-- Create trigger for auth.users to auto-create profile
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'customer'::user_role)
  )
  ON CONFLICT (id) DO UPDATE SET 
    email = EXCLUDED.email,
    role = COALESCE(EXCLUDED.role, profiles.role);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Enable pgcrypto if not already enabled (required for setting password)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Update seeded users to have a password (password123)
UPDATE auth.users 
SET encrypted_password = extensions.crypt('password123', extensions.gen_salt('bf'))
WHERE email IN (
  'admin@grabscene.app',
  'organiser@grabscene.app',
  'customer1@example.com',
  'customer2@example.com'
);
