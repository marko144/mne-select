-- Migration 4: Row-Level Security (RLS) Policies
-- Description: Enable RLS and create policies for multi-tenant data isolation

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ============================================================================

ALTER TABLE business_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- TABLE 1: business_types POLICIES
-- ============================================================================

-- Policy: All authenticated users can read active business types
CREATE POLICY "authenticated_read_active_business_types"
  ON business_types
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Policy: Only platform admins can manage business types
CREATE POLICY "platform_admin_manage_business_types"
  ON business_types
  FOR ALL
  TO authenticated
  USING (is_platform_admin())
  WITH CHECK (is_platform_admin());

-- ============================================================================
-- TABLE 2: addresses POLICIES
-- ============================================================================

-- Policy: Platform admins can read all addresses
CREATE POLICY "platform_admin_read_addresses"
  ON addresses
  FOR SELECT
  TO authenticated
  USING (
    is_platform_admin() 
    AND deleted_at IS NULL
  );

-- Policy: Business users can read addresses linked to their business
CREATE POLICY "business_user_read_own_addresses"
  ON addresses
  FOR SELECT
  TO authenticated
  USING (
    deleted_at IS NULL
    AND id IN (
      SELECT address_id 
      FROM businesses 
      WHERE id = get_user_business_id()
        AND deleted_at IS NULL
    )
  );

-- Policy: Platform admins can create addresses
CREATE POLICY "platform_admin_create_addresses"
  ON addresses
  FOR INSERT
  TO authenticated
  WITH CHECK (is_platform_admin());

-- Policy: Platform admins and business admins can update addresses
CREATE POLICY "authorized_update_addresses"
  ON addresses
  FOR UPDATE
  TO authenticated
  USING (
    deleted_at IS NULL
    AND (
      is_platform_admin()
      OR (
        has_business_role('admin')
        AND id IN (
          SELECT address_id 
          FROM businesses 
          WHERE id = get_user_business_id()
            AND deleted_at IS NULL
        )
      )
    )
  )
  WITH CHECK (
    is_platform_admin()
    OR (
      has_business_role('admin')
      AND id IN (
        SELECT address_id 
        FROM businesses 
        WHERE id = get_user_business_id()
          AND deleted_at IS NULL
      )
    )
  );

-- Policy: Only platform admins can soft-delete addresses
CREATE POLICY "platform_admin_delete_addresses"
  ON addresses
  FOR UPDATE
  TO authenticated
  USING (is_platform_admin())
  WITH CHECK (is_platform_admin());

-- ============================================================================
-- TABLE 3: businesses POLICIES
-- ============================================================================

-- Policy: Platform admins can read all businesses
CREATE POLICY "platform_admin_read_businesses"
  ON businesses
  FOR SELECT
  TO authenticated
  USING (
    is_platform_admin() 
    AND deleted_at IS NULL
  );

-- Policy: Business users can read their own business
CREATE POLICY "business_user_read_own_business"
  ON businesses
  FOR SELECT
  TO authenticated
  USING (
    deleted_at IS NULL
    AND id = get_user_business_id()
  );

-- Policy: Only platform admins can create businesses
CREATE POLICY "platform_admin_create_businesses"
  ON businesses
  FOR INSERT
  TO authenticated
  WITH CHECK (is_platform_admin());

-- Policy: Platform admins can update any business
CREATE POLICY "platform_admin_update_businesses"
  ON businesses
  FOR UPDATE
  TO authenticated
  USING (
    is_platform_admin()
    AND deleted_at IS NULL
  )
  WITH CHECK (is_platform_admin());

-- Policy: Business admins can update their own business
CREATE POLICY "business_admin_update_own_business"
  ON businesses
  FOR UPDATE
  TO authenticated
  USING (
    deleted_at IS NULL
    AND id = get_user_business_id()
    AND has_business_role('admin')
  )
  WITH CHECK (
    id = get_user_business_id()
    AND has_business_role('admin')
  );

-- Policy: Only platform admins can soft-delete businesses
CREATE POLICY "platform_admin_delete_businesses"
  ON businesses
  FOR UPDATE
  TO authenticated
  USING (is_platform_admin())
  WITH CHECK (is_platform_admin());

-- Policy: Only platform admins can suspend/activate businesses
CREATE POLICY "platform_admin_change_business_status"
  ON businesses
  FOR UPDATE
  TO authenticated
  USING (
    is_platform_admin()
    AND deleted_at IS NULL
  )
  WITH CHECK (is_platform_admin());

-- ============================================================================
-- TABLE 4: business_users POLICIES
-- ============================================================================

-- Policy: Platform admins can read all business users
CREATE POLICY "platform_admin_read_business_users"
  ON business_users
  FOR SELECT
  TO authenticated
  USING (
    is_platform_admin()
    AND deleted_at IS NULL
  );

-- Policy: Business users can read users in their business
CREATE POLICY "business_user_read_team"
  ON business_users
  FOR SELECT
  TO authenticated
  USING (
    deleted_at IS NULL
    AND business_id = get_user_business_id()
  );

-- Policy: Platform admins can create business users (invitation flow)
CREATE POLICY "platform_admin_create_business_users"
  ON business_users
  FOR INSERT
  TO authenticated
  WITH CHECK (is_platform_admin());

-- Policy: Business admins can invite team members (via edge function)
CREATE POLICY "business_admin_create_team_members"
  ON business_users
  FOR INSERT
  TO authenticated
  WITH CHECK (
    business_id = get_user_business_id()
    AND has_business_role('admin')
    AND role = 'team_member' -- Can only invite team members, not admins
  );

-- Policy: Platform admins can update any business user
CREATE POLICY "platform_admin_update_business_users"
  ON business_users
  FOR UPDATE
  TO authenticated
  USING (
    is_platform_admin()
    AND deleted_at IS NULL
  )
  WITH CHECK (is_platform_admin());

-- Policy: Business admins can update team members (not other admins)
CREATE POLICY "business_admin_update_team_members"
  ON business_users
  FOR UPDATE
  TO authenticated
  USING (
    deleted_at IS NULL
    AND business_id = get_user_business_id()
    AND has_business_role('admin')
    AND role = 'team_member' -- Can only update team members
  )
  WITH CHECK (
    business_id = get_user_business_id()
    AND has_business_role('admin')
    AND role = 'team_member'
  );

-- Policy: Users can update their own profile (limited fields)
CREATE POLICY "user_update_own_profile"
  ON business_users
  FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid()
    AND deleted_at IS NULL
  )
  WITH CHECK (user_id = auth.uid());

-- Policy: Only platform admins can soft-delete business users
CREATE POLICY "platform_admin_delete_business_users"
  ON business_users
  FOR UPDATE
  TO authenticated
  USING (is_platform_admin())
  WITH CHECK (is_platform_admin());

-- ============================================================================
-- TABLE 5: platform_admins POLICIES
-- ============================================================================

-- Policy: Platform admins can read all platform admins
CREATE POLICY "platform_admin_read_platform_admins"
  ON platform_admins
  FOR SELECT
  TO authenticated
  USING (
    is_platform_admin()
    AND deleted_at IS NULL
  );

-- Policy: Platform admins can read their own record
CREATE POLICY "platform_admin_read_self"
  ON platform_admins
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    AND deleted_at IS NULL
  );

-- Policy: Only platform admins can create new platform admins
CREATE POLICY "platform_admin_create_platform_admins"
  ON platform_admins
  FOR INSERT
  TO authenticated
  WITH CHECK (is_platform_admin());

-- Policy: Platform admins can update other platform admins
CREATE POLICY "platform_admin_update_platform_admins"
  ON platform_admins
  FOR UPDATE
  TO authenticated
  USING (
    is_platform_admin()
    AND deleted_at IS NULL
  )
  WITH CHECK (is_platform_admin());

-- Policy: Platform admins can update their own profile
CREATE POLICY "platform_admin_update_self"
  ON platform_admins
  FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid()
    AND deleted_at IS NULL
  )
  WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- TABLE 6: invitations POLICIES
-- ============================================================================

-- Policy: Platform admins can read all invitations
CREATE POLICY "platform_admin_read_invitations"
  ON invitations
  FOR SELECT
  TO authenticated
  USING (is_platform_admin());

-- Policy: Business admins can read invitations for their business
CREATE POLICY "business_admin_read_own_invitations"
  ON invitations
  FOR SELECT
  TO authenticated
  USING (
    business_id = get_user_business_id()
    AND has_business_role('admin')
  );

-- Policy: Platform admins can create invitations for any business
CREATE POLICY "platform_admin_create_invitations"
  ON invitations
  FOR INSERT
  TO authenticated
  WITH CHECK (is_platform_admin());

-- Policy: Business admins can create invitations for their business
CREATE POLICY "business_admin_create_invitations"
  ON invitations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    business_id = get_user_business_id()
    AND has_business_role('admin')
    AND role = 'team_member' -- Can only invite team members
  );

-- Policy: Platform admins can update any invitation
CREATE POLICY "platform_admin_update_invitations"
  ON invitations
  FOR UPDATE
  TO authenticated
  USING (is_platform_admin())
  WITH CHECK (is_platform_admin());

-- Policy: Business admins can update their business invitations (resend)
CREATE POLICY "business_admin_update_own_invitations"
  ON invitations
  FOR UPDATE
  TO authenticated
  USING (
    business_id = get_user_business_id()
    AND has_business_role('admin')
    AND status = 'pending'
  )
  WITH CHECK (
    business_id = get_user_business_id()
    AND has_business_role('admin')
  );
