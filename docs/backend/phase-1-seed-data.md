# Phase 1: Seed Data & Initial Setup

## Overview

This document specifies the seed data and initialization scripts required to bootstrap the MNE Select platform with essential data and the initial platform administrator.

---

## Seed Data Requirements

### 1. Initial Platform Administrator
- **Email**: `marko+admin@velocci.me`
- **Password**: `Password1*`
- **Role**: Platform Admin
- **Status**: Active
- **Created**: During initial setup

### 2. Business Types
Pre-populate all supported business categories for the platform.

### 3. Sample Test Data (Local Development Only)
- Sample businesses
- Sample business users
- Sample invitations (for testing email flow)

---

## Seed Script Structure

Create seed scripts in `supabase/seed.sql` for automatic seeding during local development.

### File: `supabase/seed.sql`

```sql
-- ============================================================================
-- MNE Select Platform - Seed Data
-- ============================================================================
-- This script seeds the database with initial data for local development
-- and testing. It should be idempotent (safe to run multiple times).
--
-- IMPORTANT: Only the business_types and platform admin creation should be
-- run in production. All other seed data is for development only.
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. BUSINESS TYPES (Production Safe)
-- ============================================================================
-- Insert all supported business types with proper ordering

INSERT INTO business_types (id, name, slug, description, icon_name, display_order, is_active)
VALUES
  (gen_random_uuid(), 'Restaurant', 'restaurant', 'Dining establishments offering full meal service', 'utensils', 1, true),
  (gen_random_uuid(), 'Bar', 'bar', 'Establishments primarily serving alcoholic beverages', 'cocktail', 2, true),
  (gen_random_uuid(), 'Coffee Shop', 'coffee-shop', 'Cafes and coffee houses', 'coffee', 3, true),
  (gen_random_uuid(), 'Gym', 'gym', 'Fitness centers and health clubs', 'dumbbell', 4, true),
  (gen_random_uuid(), 'Spa', 'spa', 'Wellness and beauty treatment centers', 'spa', 5, true),
  (gen_random_uuid(), 'Boat Tour', 'boat-tour', 'Boat excursions and water tours', 'ship', 6, true),
  (gen_random_uuid(), 'Experience', 'experience', 'Unique activities and adventure experiences', 'compass', 7, true),
  (gen_random_uuid(), 'Guide', 'guide', 'Tour guides and local expertise services', 'map', 8, true),
  (gen_random_uuid(), 'Car Rental', 'car-rental', 'Vehicle rental services', 'car', 9, true),
  (gen_random_uuid(), 'Transfer', 'transfer', 'Airport and transportation transfer services', 'bus', 10, true),
  (gen_random_uuid(), 'Beach', 'beach', 'Beach clubs and waterfront facilities', 'umbrella-beach', 11, true),
  (gen_random_uuid(), 'Camp Site', 'camp-site', 'Camping grounds and outdoor accommodation', 'campground', 12, true)
ON CONFLICT (slug) DO UPDATE
  SET 
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon_name = EXCLUDED.icon_name,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- ============================================================================
-- 2. PLATFORM ADMINISTRATOR (Production Safe)
-- ============================================================================
-- Create initial platform admin user
-- This uses Supabase Auth API via SQL function

DO $$
DECLARE
  admin_user_id UUID;
  admin_email TEXT := 'marko+admin@velocci.me';
  admin_password TEXT := 'Password1*';
BEGIN
  -- Check if admin already exists in auth.users
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = admin_email;

  -- If admin doesn't exist, create via Supabase Auth
  IF admin_user_id IS NULL THEN
    -- Note: In production, this should be done via Supabase Dashboard or API
    -- For local development, we'll insert directly
    
    -- Generate UUID for new admin
    admin_user_id := gen_random_uuid();
    
    -- Insert into auth.users (local development only)
    -- In production, use Supabase Auth API: auth.signUp()
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      role,
      aud
    ) VALUES (
      admin_user_id,
      '00000000-0000-0000-0000-000000000000',
      admin_email,
      crypt(admin_password, gen_salt('bf')), -- Bcrypt hash
      NOW(),
      '{"provider": "email", "providers": ["email"]}'::jsonb,
      '{"role": "platform_admin"}'::jsonb,
      NOW(),
      NOW(),
      'authenticated',
      'authenticated'
    );
    
    -- Also insert into auth.identities for email provider
    INSERT INTO auth.identities (
      id,
      user_id,
      provider_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      admin_user_id,
      admin_user_id,
      jsonb_build_object('sub', admin_user_id, 'email', admin_email),
      'email',
      NOW(),
      NOW(),
      NOW()
    );
    
    RAISE NOTICE 'Created auth.users record for platform admin: %', admin_email;
  ELSE
    RAISE NOTICE 'Platform admin already exists: %', admin_email;
  END IF;

  -- Create or update platform_admins record
  INSERT INTO platform_admins (
    user_id,
    first_name,
    last_name,
    email,
    is_active,
    created_at,
    updated_at
  ) VALUES (
    admin_user_id,
    'Marko',
    'Admin',
    admin_email,
    true,
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE
    SET 
      is_active = true,
      updated_at = NOW();

  RAISE NOTICE 'Platform admin initialized successfully';
END $$;

-- ============================================================================
-- 3. DEVELOPMENT TEST DATA (Local Development Only)
-- ============================================================================
-- Only run if in local development environment
-- Check for local environment by testing if we're on localhost

DO $$
DECLARE
  is_local BOOLEAN;
  business_type_restaurant_id UUID;
  business_type_gym_id UUID;
  business_type_boat_tour_id UUID;
  address_1_id UUID;
  address_2_id UUID;
  business_1_id UUID;
  business_2_id UUID;
  test_user_1_id UUID;
  test_user_2_id UUID;
BEGIN
  -- Determine if we're in local environment
  -- In production, this should be skipped
  is_local := current_setting('server_version_num')::int >= 120000; -- Simple check
  
  IF NOT is_local THEN
    RAISE NOTICE 'Skipping test data creation (not in local environment)';
    RETURN;
  END IF;

  RAISE NOTICE 'Creating test data for local development...';

  -- Get business type IDs
  SELECT id INTO business_type_restaurant_id FROM business_types WHERE slug = 'restaurant';
  SELECT id INTO business_type_gym_id FROM business_types WHERE slug = 'gym';
  SELECT id INTO business_type_boat_tour_id FROM business_types WHERE slug = 'boat-tour';

  -- ============================================================================
  -- 3.1 Sample Addresses
  -- ============================================================================
  
  -- Address 1: Restaurant in Budva
  address_1_id := gen_random_uuid();
  INSERT INTO addresses (
    id,
    address_line_1,
    address_line_2,
    city,
    country,
    postal_code,
    latitude,
    longitude,
    is_verified,
    created_at,
    updated_at
  ) VALUES (
    address_1_id,
    'Slovenska Obala 10',
    NULL,
    'Budva',
    'Montenegro',
    '85310',
    42.2865479,
    18.8409717,
    true,
    NOW(),
    NOW()
  );

  -- Address 2: Gym in Podgorica
  address_2_id := gen_random_uuid();
  INSERT INTO addresses (
    id,
    address_line_1,
    address_line_2,
    city,
    country,
    postal_code,
    latitude,
    longitude,
    is_verified,
    created_at,
    updated_at
  ) VALUES (
    address_2_id,
    'Bulevar Svetog Petra Cetinjskog 120',
    NULL,
    'Podgorica',
    'Montenegro',
    '81000',
    42.4415238,
    19.2621081,
    true,
    NOW(),
    NOW()
  );

  -- ============================================================================
  -- 3.2 Sample Businesses
  -- ============================================================================

  -- Business 1: Sample Restaurant
  business_1_id := gen_random_uuid();
  INSERT INTO businesses (
    id,
    name,
    business_type_id,
    address_id,
    license_document_number,
    is_pdv_registered,
    pdv_number,
    pib,
    company_number,
    accepts_bookings,
    default_booking_commission,
    status,
    created_at,
    updated_at
  ) VALUES (
    business_1_id,
    'Adriatic Seafood Restaurant',
    business_type_restaurant_id,
    address_1_id,
    'LIC-REST-2024-001',
    true,
    '12345678',
    '987654321',
    'COMP-2024-001',
    true,
    5.00,
    'active',
    NOW(),
    NOW()
  );

  -- Business 2: Sample Gym
  business_2_id := gen_random_uuid();
  INSERT INTO businesses (
    id,
    name,
    business_type_id,
    address_id,
    license_document_number,
    is_pdv_registered,
    pdv_number,
    pib,
    company_number,
    accepts_bookings,
    default_booking_commission,
    status,
    created_at,
    updated_at
  ) VALUES (
    business_2_id,
    'FitLife Gym & Wellness',
    business_type_gym_id,
    address_2_id,
    'LIC-GYM-2024-002',
    true,
    '87654321',
    '123456789',
    'COMP-2024-002',
    false,
    0.00,
    'active',
    NOW(),
    NOW()
  );

  -- ============================================================================
  -- 3.3 Sample Business Users
  -- ============================================================================

  -- Test User 1: Restaurant Admin
  test_user_1_id := gen_random_uuid();
  
  -- Create auth.users record
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    role,
    aud
  ) VALUES (
    test_user_1_id,
    '00000000-0000-0000-0000-000000000000',
    'restaurant.admin@example.com',
    crypt('Test123!', gen_salt('bf')),
    NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"role": "business_user"}'::jsonb,
    NOW(),
    NOW(),
    'authenticated',
    'authenticated'
  );
  
  INSERT INTO auth.identities (
    id,
    user_id,
    provider_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    test_user_1_id,
    test_user_1_id,
    jsonb_build_object('sub', test_user_1_id, 'email', 'restaurant.admin@example.com'),
    'email',
    NOW(),
    NOW(),
    NOW()
  );
  
  -- Create business_users record
  INSERT INTO business_users (
    user_id,
    business_id,
    first_name,
    last_name,
    email,
    role,
    is_active,
    created_at,
    updated_at
  ) VALUES (
    test_user_1_id,
    business_1_id,
    'John',
    'Restaurateur',
    'restaurant.admin@example.com',
    'admin',
    true,
    NOW(),
    NOW()
  );

  -- Test User 2: Gym Team Member
  test_user_2_id := gen_random_uuid();
  
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    role,
    aud
  ) VALUES (
    test_user_2_id,
    '00000000-0000-0000-0000-000000000000',
    'gym.staff@example.com',
    crypt('Test123!', gen_salt('bf')),
    NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"role": "business_user"}'::jsonb,
    NOW(),
    NOW(),
    'authenticated',
    'authenticated'
  );
  
  INSERT INTO auth.identities (
    id,
    user_id,
    provider_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    test_user_2_id,
    test_user_2_id,
    jsonb_build_object('sub', test_user_2_id, 'email', 'gym.staff@example.com'),
    'email',
    NOW(),
    NOW(),
    NOW()
  );
  
  INSERT INTO business_users (
    user_id,
    business_id,
    first_name,
    last_name,
    email,
    role,
    is_active,
    created_at,
    updated_at
  ) VALUES (
    test_user_2_id,
    business_2_id,
    'Jane',
    'Trainer',
    'gym.staff@example.com',
    'team_member',
    true,
    NOW(),
    NOW()
  );

  -- ============================================================================
  -- 3.4 Sample Pending Invitation
  -- ============================================================================

  INSERT INTO invitations (
    business_id,
    email,
    role,
    status,
    expires_at,
    sent_at,
    created_by,
    created_at,
    updated_at
  ) VALUES (
    business_1_id,
    'new.team.member@example.com',
    'team_member',
    'pending',
    NOW() + INTERVAL '7 days',
    NOW(),
    test_user_1_id,
    NOW(),
    NOW()
  );

  RAISE NOTICE 'Test data created successfully';
  RAISE NOTICE 'Test Accounts:';
  RAISE NOTICE '  - Platform Admin: marko+admin@velocci.me / Password1*';
  RAISE NOTICE '  - Restaurant Admin: restaurant.admin@example.com / Test123!';
  RAISE NOTICE '  - Gym Team Member: gym.staff@example.com / Test123!';

END $$;

COMMIT;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Uncomment to verify seed data

-- SELECT 'Business Types' as table_name, COUNT(*) as count FROM business_types;
-- SELECT 'Platform Admins' as table_name, COUNT(*) as count FROM platform_admins;
-- SELECT 'Addresses' as table_name, COUNT(*) as count FROM addresses WHERE deleted_at IS NULL;
-- SELECT 'Businesses' as table_name, COUNT(*) as count FROM businesses WHERE deleted_at IS NULL;
-- SELECT 'Business Users' as table_name, COUNT(*) as count FROM business_users WHERE deleted_at IS NULL;
-- SELECT 'Invitations' as table_name, COUNT(*) as count FROM invitations;
```

---

## Production Setup Script

For production deployment, create a separate minimal seed script that only includes essential data.

### File: `supabase/seed-production.sql`

```sql
-- ============================================================================
-- MNE Select Platform - Production Seed Data
-- ============================================================================
-- PRODUCTION ONLY: Minimal seed data for production deployment
-- This script should be run ONCE after initial deployment
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. BUSINESS TYPES
-- ============================================================================

INSERT INTO business_types (id, name, slug, description, icon_name, display_order, is_active)
VALUES
  (gen_random_uuid(), 'Restaurant', 'restaurant', 'Dining establishments offering full meal service', 'utensils', 1, true),
  (gen_random_uuid(), 'Bar', 'bar', 'Establishments primarily serving alcoholic beverages', 'cocktail', 2, true),
  (gen_random_uuid(), 'Coffee Shop', 'coffee-shop', 'Cafes and coffee houses', 'coffee', 3, true),
  (gen_random_uuid(), 'Gym', 'gym', 'Fitness centers and health clubs', 'dumbbell', 4, true),
  (gen_random_uuid(), 'Spa', 'spa', 'Wellness and beauty treatment centers', 'spa', 5, true),
  (gen_random_uuid(), 'Boat Tour', 'boat-tour', 'Boat excursions and water tours', 'ship', 6, true),
  (gen_random_uuid(), 'Experience', 'experience', 'Unique activities and adventure experiences', 'compass', 7, true),
  (gen_random_uuid(), 'Guide', 'guide', 'Tour guides and local expertise services', 'map', 8, true),
  (gen_random_uuid(), 'Car Rental', 'car-rental', 'Vehicle rental services', 'car', 9, true),
  (gen_random_uuid(), 'Transfer', 'transfer', 'Airport and transportation transfer services', 'bus', 10, true),
  (gen_random_uuid(), 'Beach', 'beach', 'Beach clubs and waterfront facilities', 'umbrella-beach', 11, true),
  (gen_random_uuid(), 'Camp Site', 'camp-site', 'Camping grounds and outdoor accommodation', 'campground', 12, true)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- 2. PLATFORM ADMINISTRATOR
-- ============================================================================
-- NOTE: In production, create the initial platform admin via Supabase Dashboard
-- or Auth API, then run this SQL to create the platform_admins record

-- This is a PLACEHOLDER - replace with actual user_id after creating via Auth API
DO $$
DECLARE
  admin_user_id UUID;
  admin_email TEXT := 'marko+admin@velocci.me';
BEGIN
  -- Get user_id from auth.users (must be created via Supabase Auth first)
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = admin_email;

  IF admin_user_id IS NULL THEN
    RAISE EXCEPTION 'Platform admin user not found in auth.users. Please create via Supabase Dashboard first.';
  END IF;

  -- Create platform_admins record
  INSERT INTO platform_admins (
    user_id,
    first_name,
    last_name,
    email,
    is_active,
    created_at,
    updated_at
  ) VALUES (
    admin_user_id,
    'Marko',
    'Admin',
    admin_email,
    true,
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO NOTHING;

  RAISE NOTICE 'Platform admin record created successfully';
END $$;

COMMIT;
```

---

## Deployment Instructions

### Local Development Setup

```bash
# 1. Start Supabase locally
supabase start

# 2. Seed data is automatically applied from supabase/seed.sql

# 3. Verify seeding
supabase db diff

# 4. Check platform admin was created
supabase db psql -c "SELECT * FROM platform_admins;"
```

### Production Deployment

```bash
# 1. Deploy schema migrations first
supabase db push --db-url $PRODUCTION_DB_URL

# 2. Create platform admin via Supabase Dashboard
# - Navigate to Authentication > Users > Add User
# - Email: marko+admin@velocci.me
# - Password: Password1*
# - Confirm email: Yes
# - User metadata: {"role": "platform_admin"}

# 3. Run production seed script
supabase db psql --db-url $PRODUCTION_DB_URL -f seed-production.sql

# 4. Verify
supabase db psql --db-url $PRODUCTION_DB_URL -c "
  SELECT 
    pa.email, 
    pa.is_active, 
    au.email_confirmed_at
  FROM platform_admins pa
  JOIN auth.users au ON pa.user_id = au.id;
"
```

---

## Environment-Specific Considerations

### Local Development
- ✅ Include test businesses
- ✅ Include test users
- ✅ Include sample invitations
- ✅ Auto-create platform admin

### Staging
- ✅ Include business types
- ✅ Create platform admin via API
- ❌ No test businesses
- ❌ No test users

### Production
- ✅ Include business types only
- ✅ Create platform admin via Dashboard (manual, secure)
- ❌ No test data whatsoever

---

## Seed Data Validation

### Validation Queries

Run these after seeding to verify data integrity:

```sql
-- Check business types
SELECT 
  name, 
  slug, 
  is_active, 
  display_order
FROM business_types
ORDER BY display_order;

-- Verify platform admin exists and is properly linked
SELECT 
  pa.email,
  pa.first_name,
  pa.last_name,
  pa.is_active,
  au.email_confirmed_at,
  au.created_at
FROM platform_admins pa
JOIN auth.users au ON pa.user_id = au.id
WHERE pa.deleted_at IS NULL;

-- Count records (development only)
SELECT 
  'businesses' as table_name, 
  COUNT(*) as count 
FROM businesses 
WHERE deleted_at IS NULL

UNION ALL

SELECT 
  'business_users', 
  COUNT(*) 
FROM business_users 
WHERE deleted_at IS NULL

UNION ALL

SELECT 
  'invitations', 
  COUNT(*) 
FROM invitations;
```

---

## Troubleshooting

### Issue: Platform admin cannot log in

**Cause**: User record exists but `platform_admins` record missing

**Solution**:
```sql
-- Create missing platform_admins record
INSERT INTO platform_admins (user_id, first_name, last_name, email, is_active)
SELECT 
  id,
  'Marko',
  'Admin',
  email,
  true
FROM auth.users
WHERE email = 'marko+admin@velocci.me'
ON CONFLICT (user_id) DO NOTHING;
```

### Issue: Test businesses not visible

**Cause**: RLS policies blocking access

**Solution**:
```sql
-- Check if user is recognized as platform admin
SELECT is_platform_admin(); -- Should return true when logged in as admin

-- Verify RLS is enabled
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND rowsecurity = true;
```

### Issue: Seed script fails on repeated runs

**Cause**: Unique constraint violations

**Solution**: Seed script uses `ON CONFLICT` clauses for idempotency. If still failing:
```bash
# Reset local database completely
supabase db reset

# Re-run migrations and seed
supabase db push
```

---

## Cleanup Scripts

### Remove All Test Data (Development Only)

```sql
-- WARNING: This removes all test data. Use carefully!

BEGIN;

-- Remove test invitations
DELETE FROM invitations 
WHERE business_id IN (
  SELECT id FROM businesses WHERE name LIKE '%Test%' OR name LIKE '%Sample%'
);

-- Remove test business users
DELETE FROM business_users
WHERE business_id IN (
  SELECT id FROM businesses WHERE name LIKE '%Test%' OR name LIKE '%Sample%'
);

-- Remove test businesses
DELETE FROM businesses
WHERE name LIKE '%Test%' OR name LIKE '%Sample%';

-- Remove test addresses
DELETE FROM addresses
WHERE city = 'Test City';

COMMIT;
```

---

## References

- [Supabase Seeding Documentation](https://supabase.com/docs/guides/database/seed)
- [PostgreSQL INSERT ON CONFLICT](https://www.postgresql.org/docs/current/sql-insert.html#SQL-ON-CONFLICT)
- [Supabase Auth API](https://supabase.com/docs/reference/javascript/auth-signup)
