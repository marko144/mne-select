# Phase 1: Database Schema Specification

## Overview

This document specifies the database schema for the initial phase of MNE Select platform, focusing on:
- Platform administration
- Business entity creation and management
- User invitation system
- Multi-tenant security foundation

## Design Principles

1. **Multi-tenancy**: Strict data isolation between businesses using RLS
2. **Soft Deletes**: All entities support soft deletion for audit trail and recovery
3. **Audit Trail**: Comprehensive timestamp tracking (created_at, updated_at, deleted_at)
4. **Data Integrity**: Foreign key constraints and check constraints
5. **Performance**: Strategic indexing for common queries
6. **Scalability**: UUID primary keys for distributed systems
7. **Type Safety**: Enums for status fields and business types

---

## Core Tables

### 1. `business_types` (Lookup Table)

Master list of business categories supported by the platform.

```sql
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
```

**Initial Data:**
- Restaurant
- Bar
- Coffee Shop
- Gym
- Spa
- Boat Tour
- Experience
- Guide
- Car Rental
- Transfer
- Beach
- Camp Site

---

### 2. `addresses`

Reusable address records with geocoding support. Normalized for future expansion (tour pickup locations, delivery addresses, etc.).

```sql
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
```

---

### 3. `businesses`

Core business entity with regulatory and financial information.

```sql
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
```

---

### 4. `business_users`

Business portal users with invitation-based onboarding. Separated from guest users.

```sql
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
```

---

### 5. `platform_admins`

Platform administrators with elevated privileges across all businesses.

```sql
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
```

---

### 6. `invitations`

Invitation system for onboarding business users.

```sql
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
  WHERE status = 'pending' AND expires_at > NOW();

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
```

---

## Helper Functions

### 1. Updated At Trigger Function

Automatically updates `updated_at` timestamp on row modifications.

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_updated_at_column IS 'Trigger function to auto-update updated_at timestamp';
```

---

### 2. Platform Admin Check Function

Helper function for RLS policies to identify platform administrators.

```sql
CREATE OR REPLACE FUNCTION is_platform_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM platform_admins 
    WHERE user_id = auth.uid() 
      AND is_active = true 
      AND deleted_at IS NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

COMMENT ON FUNCTION is_platform_admin IS 'Returns true if current user is an active platform admin';
```

---

### 3. User Business ID Function

Retrieves the business_id for the current authenticated business user.

```sql
CREATE OR REPLACE FUNCTION get_user_business_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT business_id 
    FROM business_users 
    WHERE user_id = auth.uid() 
      AND is_active = true 
      AND deleted_at IS NULL
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

COMMENT ON FUNCTION get_user_business_id IS 'Returns business_id for current authenticated business user';
```

---

### 4. User Role Check Function

Checks if current user has a specific role within their business.

```sql
CREATE OR REPLACE FUNCTION has_business_role(required_role business_user_role)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM business_users 
    WHERE user_id = auth.uid() 
      AND role = required_role
      AND is_active = true 
      AND deleted_at IS NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

COMMENT ON FUNCTION has_business_role IS 'Checks if current user has specified role in their business';
```

---

## Required PostgreSQL Extensions

```sql
-- UUID generation (v7 recommended for better indexing, fallback to v4)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Trigram extension for fuzzy text search (business name search)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Case-insensitive text extension (optional, for email comparisons)
CREATE EXTENSION IF NOT EXISTS citext;
```

---

## Data Integrity Rules

### Business Validation
1. Business name must be unique within active businesses (case-insensitive)
2. PDV number required when `is_pdv_registered = true`
3. Commission must be >= 0
4. Status can only be 'active' or 'suspended'

### User Validation
1. User can only belong to ONE business (enforced by unique constraint)
2. Email format validation on invitations
3. Platform admins cannot also be business users (enforced in application logic)

### Invitation Rules
1. Expires exactly 7 days after creation
2. Email must be valid format
3. Cannot accept expired invitations (enforced in application logic)
4. Expired invitations auto-deleted via scheduled job

---

## Performance Considerations

### Indexing Strategy

**High Priority Indexes:**
- `businesses.name` (trigram) - Business search is core feature
- `business_users.business_id` - Tenant isolation queries
- `business_users.user_id` - User session lookups
- All `deleted_at` columns - Soft delete filtering

**Medium Priority Indexes:**
- `businesses.business_type_id` - Category filtering
- `addresses.latitude, longitude` - Geospatial queries
- `invitations.email` - Invitation lookup

**Future Optimization:**
- Consider partitioning for high-volume tables (businesses, users)
- Add materialized views for dashboard aggregations
- Implement connection pooling (PgBouncer recommended)

---

## Migration Order

Critical: Tables must be created in this order due to foreign key dependencies:

1. **Extensions** (uuid-ossp, pg_trgm)
2. **Helper Functions** (update_updated_at_column)
3. **business_types** (no dependencies)
4. **addresses** (no dependencies)
5. **businesses** (depends on: business_types, addresses, auth.users)
6. **platform_admins** (depends on: auth.users)
7. **business_users** (depends on: businesses, auth.users)
8. **invitations** (depends on: businesses, auth.users)
9. **Helper Functions** (is_platform_admin, get_user_business_id, has_business_role)

---

## Future Considerations

### Phase 2 Additions
- **guest_users**: Separate table for visitor/tourist users
- **offers**: Promotional offers linked to businesses
- **bookings**: Reservation system
- **transactions**: Purchase tracking for guests
- **loyalty_tiers**: Guest reward tiers

### Scalability
- Consider **read replicas** for reporting queries
- Implement **caching layer** (Redis) for frequently accessed data
- Use **database triggers** for audit logging (separate audit table)
- Consider **time-series database** (TimescaleDB) for analytics

### Data Archival
- Implement archival strategy for deleted records (move to archive schema after N days)
- Set up automated backups (Supabase provides daily backups)
- Consider point-in-time recovery (PITR) for production

---

## Testing Requirements

### Data Integrity Tests
1. Verify foreign key constraints
2. Test soft delete behavior
3. Validate check constraints (commission >= 0, PDV validation)
4. Test unique constraints (user-business uniqueness)

### Performance Tests
1. Benchmark business name search (should use trigram index)
2. Test tenant isolation queries (business_users.business_id lookups)
3. Verify index usage with EXPLAIN ANALYZE
4. Load test with realistic data volumes

### Security Tests
1. Verify RLS policies block unauthorized access
2. Test platform admin bypass logic
3. Validate invitation expiry enforcement
4. Test soft delete filtering in all queries

---

## Implementation Checklist

- [ ] Create database migration files in `supabase/migrations/`
- [ ] Apply migrations to local Supabase instance
- [ ] Generate TypeScript types from schema
- [ ] Implement RLS policies (see phase-1-rls-policies.md)
- [ ] Create seed data script (see phase-1-seed-data.md)
- [ ] Test schema with sample data
- [ ] Document schema changes in changelog
- [ ] Deploy to staging environment
- [ ] Run performance benchmarks
- [ ] Deploy to production

---

## Maintenance Notes

### Regular Maintenance Tasks
1. **Weekly**: Review slow query logs
2. **Monthly**: Analyze index usage and remove unused indexes
3. **Quarterly**: Review and optimize RLS policies
4. **Annually**: Audit data retention and archival needs

### Monitoring Metrics
- Query execution time (p50, p95, p99)
- Index hit rate (should be > 95%)
- Table bloat percentage
- Connection pool usage
- Replication lag (if using replicas)

---

## References

- [PostgreSQL Row Level Security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase Database Best Practices](https://supabase.com/docs/guides/database/database-best-practices)
- [PostgreSQL Indexing Strategies](https://www.postgresql.org/docs/current/indexes.html)
- [pg_trgm Extension](https://www.postgresql.org/docs/current/pgtrgm.html)
