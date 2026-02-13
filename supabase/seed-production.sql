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
