-- Migration 3: Helper Functions for RLS Policies
-- Description: Create helper functions for Row-Level Security policies

-- ============================================================================
-- FUNCTION: is_platform_admin()
-- ============================================================================

-- Purpose: Check if current authenticated user is a platform administrator
-- Returns: BOOLEAN - true if user is active platform admin, false otherwise
-- Usage: Used in RLS policies to grant platform admins cross-tenant access

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

-- ============================================================================
-- FUNCTION: get_user_business_id()
-- ============================================================================

-- Purpose: Retrieve the business_id for the current authenticated business user
-- Returns: UUID - business_id of the user's business, or NULL if not a business user
-- Usage: Used in RLS policies for tenant data isolation

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

-- ============================================================================
-- FUNCTION: has_business_role(required_role)
-- ============================================================================

-- Purpose: Check if current user has a specific role within their business
-- Parameters:
--   - required_role: business_user_role - The role to check for ('admin' or 'team_member')
-- Returns: BOOLEAN - true if user has the specified role, false otherwise
-- Usage: Used in RLS policies to implement role-based access control (RBAC)

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
