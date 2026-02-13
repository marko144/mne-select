# Phase 1: Row-Level Security (RLS) Policies

## Overview

This document specifies comprehensive Row-Level Security policies for multi-tenant data isolation in MNE Select platform. RLS ensures that:

1. **Platform admins** can access all data across all businesses
2. **Business users** can only access data within their business (tenant isolation)
3. **Unauthenticated users** have no access to any data
4. **Soft-deleted records** are excluded from queries by default

---

## Security Model

### Access Levels

| User Type | Access Scope | Implementation |
|-----------|--------------|----------------|
| Platform Admin | All businesses, all data | `is_platform_admin()` bypass in policies |
| Business Admin | Own business data, full CRUD | `business_id = get_user_business_id()` |
| Team Member | Own business data, limited CRUD | `business_id = get_user_business_id()` + role checks |
| Unauthenticated | No access | All policies require `auth.uid()` |

### Policy Strategy

Each table implements a **layered security approach**:

1. **Authentication Layer**: Must be logged in (`auth.uid() IS NOT NULL`)
2. **Authorization Layer**: Platform admin OR tenant member
3. **Soft Delete Layer**: Exclude `deleted_at IS NOT NULL` records
4. **Role Layer** (where applicable): Check user role for write operations

---

## RLS Policy Definitions

### 1. `business_types` Table

Business types are **read-only reference data** accessible to authenticated users.

```sql
-- Enable RLS
ALTER TABLE business_types ENABLE ROW LEVEL SECURITY;

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
```

**Rationale:**
- Business types needed for dropdowns in business creation forms
- Only platform admins should modify the master list
- Inactive types hidden from users but preserved for historical data

---

### 2. `addresses` Table

Addresses are **owned by businesses** and only accessible to authorized users.

```sql
-- Enable RLS
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

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
      WHERE business_id = get_user_business_id()
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
          WHERE business_id = get_user_business_id()
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
        WHERE business_id = get_user_business_id()
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
```

**Rationale:**
- Addresses linked to businesses enforce tenant isolation
- Prevents users from seeing other businesses' addresses
- Soft delete requires admin privileges to prevent accidental data loss

---

### 3. `businesses` Table

Core multi-tenant table with strict isolation.

```sql
-- Enable RLS
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

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
```

**Rationale:**
- Only platform admins create businesses (controlled onboarding)
- Business admins can update their business details but cannot delete
- Status changes (active/suspended) reserved for platform admins
- Team members have read-only access to business info

---

### 4. `business_users` Table

User management within tenant boundaries.

```sql
-- Enable RLS
ALTER TABLE business_users ENABLE ROW LEVEL SECURITY;

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
  WITH CHECK (
    user_id = auth.uid()
    -- Restrict which columns can be updated via application logic
  );

-- Policy: Only platform admins can soft-delete business users
CREATE POLICY "platform_admin_delete_business_users"
  ON business_users
  FOR UPDATE
  TO authenticated
  USING (is_platform_admin())
  WITH CHECK (is_platform_admin());
```

**Rationale:**
- Strict tenant isolation: users only see their own team
- Business admins can manage team members but not other admins
- Prevents privilege escalation (can't create another admin)
- Users can update their own basic profile info

---

### 5. `platform_admins` Table

Highly restricted table for platform administration.

```sql
-- Enable RLS
ALTER TABLE platform_admins ENABLE ROW LEVEL SECURITY;

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

-- Note: No delete policy - platform admins should never be deleted via RLS
-- Use direct SQL with service role for administrative removals
```

**Rationale:**
- Only platform admins can manage platform admin accounts
- Self-service profile updates allowed
- No soft-delete via RLS (use service role for safety)
- Prevents accidental removal of last admin

---

### 6. `invitations` Table

Invitation management with business-scoped access.

```sql
-- Enable RLS
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

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

-- Policy: No direct delete - use expiry mechanism
-- Expired invitations removed via scheduled cleanup job
```

**Rationale:**
- Invitations scoped to business (tenant isolation)
- Business admins can only invite team members (not admins)
- Resend capability limited to pending invitations
- No hard deletes via RLS (use automated cleanup)

---

## Special Considerations

### Platform Admin Bypass

Platform admins bypass tenant restrictions but still require authentication:

```sql
-- Good: Allows admin access while maintaining security
USING (is_platform_admin() OR business_id = get_user_business_id())

-- Bad: Overly broad, allows unauthenticated access
USING (is_platform_admin() OR TRUE)
```

### Soft Delete Filtering

All SELECT policies must exclude soft-deleted records:

```sql
-- Always include in USING clause for SELECT
USING (deleted_at IS NULL AND ...)
```

### Performance Impact

RLS policies are evaluated **on every query**. Optimization strategies:

1. **Keep helper functions STABLE**: `is_platform_admin()` marked as STABLE for caching
2. **Use indexes**: Ensure `business_users.business_id` indexed for `get_user_business_id()`
3. **Minimize subqueries**: Use JOINs where possible
4. **Monitor query plans**: Use `EXPLAIN ANALYZE` to verify index usage

---

## Testing RLS Policies

### Test Scenarios

#### 1. Platform Admin Access
```sql
-- Set session as platform admin
SET LOCAL request.jwt.claim.sub = '<platform_admin_user_id>';

-- Should return all active businesses
SELECT * FROM businesses WHERE deleted_at IS NULL;
```

#### 2. Business User Tenant Isolation
```sql
-- Set session as business user
SET LOCAL request.jwt.claim.sub = '<business_user_id>';

-- Should only return their business
SELECT * FROM businesses WHERE deleted_at IS NULL;
```

#### 3. Cross-Tenant Prevention
```sql
-- As business user A
SELECT * FROM businesses WHERE id = '<business_b_id>';
-- Should return 0 rows
```

#### 4. Unauthenticated Access
```sql
-- Clear session
RESET request.jwt.claim.sub;

-- Should return 0 rows
SELECT * FROM businesses;
```

---

## Policy Validation Checklist

For each table, verify:

- [ ] **RLS Enabled**: `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`
- [ ] **SELECT Policy**: Enforces tenant isolation or admin bypass
- [ ] **INSERT Policy**: Restricts who can create records
- [ ] **UPDATE Policy**: Validates both USING and WITH CHECK
- [ ] **DELETE Policy**: Soft delete handled (if applicable)
- [ ] **Soft Delete Filter**: All SELECT policies exclude `deleted_at IS NOT NULL`
- [ ] **Authentication Required**: All policies check `auth.uid()`
- [ ] **Index Support**: Helper functions use indexed columns
- [ ] **Test Coverage**: Policies tested with different user roles

---

## Migration Implementation

### Step 1: Apply Policies in Migration

```sql
-- File: supabase/migrations/YYYYMMDDHHMMSS_enable_rls.sql

-- Enable RLS on all tables
ALTER TABLE business_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- Create policies (copy from sections above)
-- ...
```

### Step 2: Test Policies Locally

```bash
# Apply migration
supabase db reset

# Run test suite
npm run test:rls
```

### Step 3: Deploy to Staging

```bash
supabase db push --db-url $STAGING_DB_URL
```

### Step 4: Validate in Staging

- Test with platform admin account
- Test with business admin account
- Test with team member account
- Verify cross-tenant access blocked

---

## Monitoring & Auditing

### Query Performance

Monitor policy overhead using Supabase dashboard:
- Track slow queries (> 100ms)
- Check `is_platform_admin()` cache hit rate
- Verify index usage in query plans

### Security Audits

Regular security reviews:
1. **Monthly**: Review policy changes in git history
2. **Quarterly**: Penetration testing (cross-tenant access attempts)
3. **Annually**: External security audit

---

## Common Pitfalls

### ❌ Mistake 1: Missing Authentication Check

```sql
-- BAD: Allows unauthenticated access
CREATE POLICY "read_businesses"
  ON businesses FOR SELECT
  USING (business_id = get_user_business_id());

-- GOOD: Requires authentication
CREATE POLICY "read_businesses"
  ON businesses FOR SELECT
  TO authenticated
  USING (business_id = get_user_business_id());
```

### ❌ Mistake 2: Forgetting WITH CHECK on UPDATE

```sql
-- BAD: Only validates reads, not writes
CREATE POLICY "update_business"
  ON businesses FOR UPDATE
  USING (business_id = get_user_business_id());

-- GOOD: Validates both reads and writes
CREATE POLICY "update_business"
  ON businesses FOR UPDATE
  USING (business_id = get_user_business_id())
  WITH CHECK (business_id = get_user_business_id());
```

### ❌ Mistake 3: Not Filtering Soft Deletes

```sql
-- BAD: Returns deleted records
CREATE POLICY "read_businesses"
  ON businesses FOR SELECT
  USING (business_id = get_user_business_id());

-- GOOD: Excludes deleted records
CREATE POLICY "read_businesses"
  ON businesses FOR SELECT
  USING (
    deleted_at IS NULL
    AND business_id = get_user_business_id()
  );
```

---

## Future Enhancements

### Phase 2 Considerations

1. **Field-Level Security**: Restrict which columns users can update
2. **Audit Logging**: Track all policy violations
3. **Dynamic Roles**: Support custom roles beyond admin/team_member
4. **Temporary Access**: Time-limited permissions for specific operations
5. **API Rate Limiting**: Combine RLS with rate limiting for additional security

---

## References

- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [RLS Performance Best Practices](https://supabase.com/docs/guides/database/database-best-practices#row-level-security-performance)
