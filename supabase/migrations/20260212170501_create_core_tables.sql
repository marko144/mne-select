-- Migration 2: Core Tables
-- Description: Create all core tables for Phase 1 (business types, addresses, businesses, users, invitations)

-- ============================================================================
-- TABLE 1: business_types (Lookup Table)
-- ============================================================================

CREATE TABLE business_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon_name TEXT, -- for UI display
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for active types ordering
CREATE INDEX idx_business_types_active_order 
  ON business_types(display_order) 
  WHERE is_active = true;

-- Trigger to update updated_at
CREATE TRIGGER update_business_types_updated_at
  BEFORE UPDATE ON business_types
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE business_types IS 'Master list of business categories supported by the platform';

-- ============================================================================
-- TABLE 2: addresses
-- ============================================================================

CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  address_line_1 TEXT NOT NULL,
  address_line_2 TEXT,
  city TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'Montenegro',
  postal_code TEXT,
  latitude DECIMAL(10, 8), -- range: -90 to 90, 8 decimal precision (~1mm)
  longitude DECIMAL(11, 8), -- range: -180 to 180, 8 decimal precision (~1mm)
  is_verified BOOLEAN NOT NULL DEFAULT false, -- for future geocoding verification
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Index for soft delete filtering
CREATE INDEX idx_addresses_deleted_at ON addresses(deleted_at);

-- Index for geospatial queries (future proximity search)
CREATE INDEX idx_addresses_location ON addresses(latitude, longitude)
  WHERE deleted_at IS NULL;

-- Trigger to update updated_at
CREATE TRIGGER update_addresses_updated_at
  BEFORE UPDATE ON addresses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE addresses IS 'Reusable address records with geocoding support';

-- ============================================================================
-- TABLE 3: businesses
-- ============================================================================

CREATE TYPE business_status AS ENUM ('active', 'suspended');

CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  business_type_id UUID NOT NULL REFERENCES business_types(id),
  address_id UUID REFERENCES addresses(id),
  
  -- Regulatory information
  license_document_number TEXT,
  is_pdv_registered BOOLEAN NOT NULL DEFAULT false,
  pdv_number TEXT,
  pib TEXT, -- Poreski Identifikacioni Broj (Tax ID)
  company_number TEXT,
  
  -- Booking & Commission
  accepts_bookings BOOLEAN NOT NULL DEFAULT false,
  default_booking_commission DECIMAL(10, 2) DEFAULT 0.00,
  
  -- Status
  status business_status NOT NULL DEFAULT 'active',
  
  -- Audit fields
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id),
  deleted_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT valid_commission CHECK (default_booking_commission >= 0),
  CONSTRAINT pdv_number_required_when_registered 
    CHECK (
      (is_pdv_registered = false) OR 
      (is_pdv_registered = true AND pdv_number IS NOT NULL)
    )
);

-- Critical index for business name search (case-insensitive)
CREATE INDEX idx_businesses_name_trgm ON businesses USING gin (name gin_trgm_ops)
  WHERE deleted_at IS NULL;

-- Index for status filtering (active businesses)
CREATE INDEX idx_businesses_status ON businesses(status)
  WHERE deleted_at IS NULL;

-- Index for business type filtering
CREATE INDEX idx_businesses_type ON businesses(business_type_id)
  WHERE deleted_at IS NULL;

-- Index for soft delete filtering
CREATE INDEX idx_businesses_deleted_at ON businesses(deleted_at);

-- Composite index for common queries (type + status)
CREATE INDEX idx_businesses_type_status ON businesses(business_type_id, status)
  WHERE deleted_at IS NULL;

-- Trigger to update updated_at
CREATE TRIGGER update_businesses_updated_at
  BEFORE UPDATE ON businesses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE businesses IS 'Core business entities on the platform';
COMMENT ON COLUMN businesses.default_booking_commission IS 'Default commission amount in EUR for bookings';
COMMENT ON COLUMN businesses.pib IS 'Poreski Identifikacioni Broj - Montenegro Tax ID';

-- ============================================================================
-- TABLE 4: platform_admins
-- ============================================================================

CREATE TABLE platform_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Profile information
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- Audit fields
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id),
  deleted_at TIMESTAMPTZ
);

-- Index for active platform admins
CREATE INDEX idx_platform_admins_active ON platform_admins(user_id)
  WHERE deleted_at IS NULL AND is_active = true;

-- Index for soft delete filtering
CREATE INDEX idx_platform_admins_deleted_at ON platform_admins(deleted_at);

-- Trigger to update updated_at
CREATE TRIGGER update_platform_admins_updated_at
  BEFORE UPDATE ON platform_admins
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE platform_admins IS 'Platform administrators with cross-tenant access';

-- ============================================================================
-- TABLE 5: business_users
-- ============================================================================

CREATE TYPE business_user_role AS ENUM ('admin', 'team_member');

CREATE TABLE business_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES businesses(id),
  
  -- Profile information
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL, -- denormalized for quick access
  
  -- Role & permissions
  role business_user_role NOT NULL DEFAULT 'team_member',
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- Audit fields
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id),
  deleted_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT unique_user_business UNIQUE(user_id, business_id)
);

-- Critical index for tenant isolation (business_id lookups)
CREATE INDEX idx_business_users_business ON business_users(business_id)
  WHERE deleted_at IS NULL AND is_active = true;

-- Index for user lookups
CREATE INDEX idx_business_users_user ON business_users(user_id)
  WHERE deleted_at IS NULL;

-- Index for email searches (case-insensitive)
CREATE INDEX idx_business_users_email ON business_users(LOWER(email))
  WHERE deleted_at IS NULL;

-- Index for soft delete filtering
CREATE INDEX idx_business_users_deleted_at ON business_users(deleted_at);

-- Trigger to update updated_at
CREATE TRIGGER update_business_users_updated_at
  BEFORE UPDATE ON business_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE business_users IS 'Business portal users (invitation-based)';
COMMENT ON CONSTRAINT unique_user_business ON business_users IS 'Prevents duplicate user assignments to same business';

-- ============================================================================
-- TABLE 6: invitations
-- ============================================================================

CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'expired');

CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id),
  email TEXT NOT NULL,
  role business_user_role NOT NULL DEFAULT 'team_member',
  
  -- Invitation tracking
  status invitation_status NOT NULL DEFAULT 'pending',
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  
  -- Email tracking
  sent_at TIMESTAMPTZ,
  resent_count INTEGER NOT NULL DEFAULT 0,
  last_resent_at TIMESTAMPTZ,
  
  -- Audit fields
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT valid_expiry CHECK (expires_at > created_at)
);

-- Index for pending invitations lookup (by email)
CREATE INDEX idx_invitations_email_pending ON invitations(email, status)
  WHERE status = 'pending';

-- Index for business invitations lookup
CREATE INDEX idx_invitations_business ON invitations(business_id, status);

-- Index for cleanup job (expired invitations)
CREATE INDEX idx_invitations_expired ON invitations(expires_at, status)
  WHERE status = 'pending';

-- Trigger to update updated_at
CREATE TRIGGER update_invitations_updated_at
  BEFORE UPDATE ON invitations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE invitations IS 'Business user invitation system with 7-day expiry';
COMMENT ON COLUMN invitations.resent_count IS 'Tracks how many times invitation email was resent';
