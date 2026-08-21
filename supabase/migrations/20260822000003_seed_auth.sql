-- Migration: 20260822_seed_auth.sql
-- Description: Seed the remote auth users properly

CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, 
  email_confirmed_at, recovery_sent_at, last_sign_in_at, 
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
  confirmation_token, email_change, email_change_token_new, recovery_token
) 
VALUES 
(
  '00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'authenticated', 'authenticated', 'admin@grabscene.app', extensions.crypt('password123', extensions.gen_salt('bf')), 
  NOW(), NULL, NULL, 
  '{"provider": "email", "providers": ["email"]}', '{"role": "admin"}', NOW(), NOW(), 
  '', '', '', ''
),
(
  '00000000-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222', 'authenticated', 'authenticated', 'organiser@grabscene.app', extensions.crypt('password123', extensions.gen_salt('bf')), 
  NOW(), NULL, NULL, 
  '{"provider": "email", "providers": ["email"]}', '{"role": "organiser"}', NOW(), NOW(), 
  '', '', '', ''
),
(
  '00000000-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333', 'authenticated', 'authenticated', 'customer1@example.com', extensions.crypt('password123', extensions.gen_salt('bf')), 
  NOW(), NULL, NULL, 
  '{"provider": "email", "providers": ["email"]}', '{"role": "customer"}', NOW(), NOW(), 
  '', '', '', ''
),
(
  '00000000-0000-0000-0000-000000000000', '44444444-4444-4444-4444-444444444444', 'authenticated', 'authenticated', 'customer2@example.com', extensions.crypt('password123', extensions.gen_salt('bf')), 
  NOW(), NULL, NULL, 
  '{"provider": "email", "providers": ["email"]}', '{"role": "customer"}', NOW(), NOW(), 
  '', '', '', ''
)
ON CONFLICT (id) DO UPDATE SET 
  encrypted_password = EXCLUDED.encrypted_password,
  email_confirmed_at = EXCLUDED.email_confirmed_at,
  raw_user_meta_data = EXCLUDED.raw_user_meta_data;

INSERT INTO auth.identities (
  id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
)
VALUES 
(
  '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '{"sub": "11111111-1111-1111-1111-111111111111", "email": "admin@grabscene.app"}', 'email', NULL, NOW(), NOW()
),
(
  '22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', '{"sub": "22222222-2222-2222-2222-222222222222", "email": "organiser@grabscene.app"}', 'email', NULL, NOW(), NOW()
),
(
  '33333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', '{"sub": "33333333-3333-3333-3333-333333333333", "email": "customer1@example.com"}', 'email', NULL, NOW(), NOW()
),
(
  '44444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', '{"sub": "44444444-4444-4444-4444-444444444444", "email": "customer2@example.com"}', 'email', NULL, NOW(), NOW()
)
ON CONFLICT (provider, provider_id) DO NOTHING;

-- Make sure profiles exist too
INSERT INTO public.profiles (id, email, role) VALUES 
('11111111-1111-1111-1111-111111111111', 'admin@grabscene.app', 'admin'),
('22222222-2222-2222-2222-222222222222', 'organiser@grabscene.app', 'organiser'),
('33333333-3333-3333-3333-333333333333', 'customer1@example.com', 'customer'),
('44444444-4444-4444-4444-444444444444', 'customer2@example.com', 'customer')
ON CONFLICT (id) DO UPDATE SET 
  email = EXCLUDED.email,
  role = EXCLUDED.role;
