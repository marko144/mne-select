# Phase 1: Backend Specification - Quick Reference

## Overview

This directory contains comprehensive specifications for Phase 1 of the MNE Select backend implementation. Phase 1 focuses on **business onboarding and invitation workflows**.

## ⚠️ Before You Start

**First-time setup required!** Before implementing any features, you must set up your local development environment:

1. **Install Docker Desktop** (required for local Supabase)
2. **Install Supabase CLI**
3. **Start local Supabase** with `supabase start`

**📖 Complete setup instructions:** See [phase-1-implementation-guide.md](./phase-1-implementation-guide.md) → "Prerequisites" section

**Or use the ready-to-go prompt:** [AI-AGENT-PROMPTS.md](./AI-AGENT-PROMPTS.md) → Session 0

---

## Document Structure

### 📘 Core Specifications

| Document | Purpose | Status |
|----------|---------|--------|
| [GETTING-STARTED.md](./GETTING-STARTED.md) | ⭐ **START HERE** - Quick setup checklist & first steps | ✅ Ready |
| [phase-1-implementation-guide.md](./phase-1-implementation-guide.md) | Complete implementation roadmap with detailed steps | ✅ Ready |
| [phase-1-database-schema.md](./phase-1-database-schema.md) | Database tables, indexes, and constraints | ✅ Ready |
| [phase-1-rls-policies.md](./phase-1-rls-policies.md) | Row-Level Security policies for multi-tenancy | ✅ Ready |
| [phase-1-seed-data.md](./phase-1-seed-data.md) | Initial data and platform admin setup | ✅ Ready |
| [SENDGRID-SETUP.md](./SENDGRID-SETUP.md) | ⭐ **SendGrid email configuration** (API key, verified domain) | ✅ Ready |
| [phase-1-email-templates.md](./phase-1-email-templates.md) | Email templates and delivery system | ✅ Ready |
| [phase-1-edge-functions.md](./phase-1-edge-functions.md) | Supabase Edge Functions (API endpoints) | ✅ Ready |
| [AI-AGENT-PROMPTS.md](./AI-AGENT-PROMPTS.md) | ⭐ **Ready-to-use prompts** for AI coding agents | ✅ Ready |

---

## Quick Start

### For Developers

1. **Read**: [phase-1-implementation-guide.md](./phase-1-implementation-guide.md)
2. **Set up local environment**: Follow "Local Supabase Setup" section
3. **Apply migrations**: Copy SQL from database schema doc
4. **Implement edge functions**: Copy code from edge functions doc
5. **Test**: Use provided test scripts and curl commands

### For Project Managers

1. Review the [Implementation Sequence](./phase-1-implementation-guide.md#implementation-sequence) for timeline
2. Check [Testing Strategy](./phase-1-implementation-guide.md#testing-strategy) for QA requirements
3. Review [Deployment Checklist](./phase-1-implementation-guide.md#deployment-checklist) before go-live

### For Architects

1. Review [Database Schema](./phase-1-database-schema.md) for data model
2. Check [RLS Policies](./phase-1-rls-policies.md) for security architecture
3. Review [Edge Functions](./phase-1-edge-functions.md) for API design

---

## Phase 1 Scope

### ✅ What's Included

**Database:**
- ✅ Business types (Restaurant, Bar, Gym, etc.)
- ✅ Businesses with full regulatory info
- ✅ Addresses (normalized, with geocoding)
- ✅ Business users (admins & team members)
- ✅ Platform admins
- ✅ Invitation system with 7-day expiry
- ✅ Multi-tenant RLS policies
- ✅ Soft deletes on all tables

**APIs (Edge Functions):**
- ✅ Create business + send first admin invitation
- ✅ Send/resend invitations
- ✅ Accept invitation + create user account
- ✅ List invitations for a business

**Email System:**
- ✅ Resend integration
- ✅ Business admin invitation template
- ✅ Team member invitation template
- ✅ Invitation resent notification
- ✅ HTML + plain text versions

**Security:**
- ✅ Row-Level Security (RLS) on all tables
- ✅ Platform admin bypass mechanism
- ✅ Tenant data isolation
- ✅ Role-based access control (RBAC)
- ✅ Input validation
- ✅ Authentication checks

### ❌ Not Included (Future Phases)

- ❌ Guest/visitor user system
- ❌ Offers and promotions
- ❌ Booking and reservation system
- ❌ Voucher redemption
- ❌ Analytics and reporting
- ❌ Payment processing
- ❌ Business-specific features (tour scheduling, etc.)

---

## Data Model Summary

### Core Entities

```
platform_admins (platform-wide access)
    ↓
businesses (multi-tenant root)
    ├── business_users (tenant members)
    ├── invitations (onboarding)
    └── addresses (location data)
```

### Key Relationships

- **Platform Admin** → Can access all businesses
- **Business** → Has many business_users
- **Business** → Has one address
- **Business** → Has many invitations
- **Business User** → Belongs to ONE business (no cross-tenant users)
- **Invitation** → Belongs to ONE business

---

## API Endpoints Summary

### Edge Functions

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/functions/v1/create-business` | POST | Platform Admin | Create business + first invitation |
| `/functions/v1/send-invitation` | POST | Platform/Business Admin | Send/resend invitation |
| `/functions/v1/accept-invitation` | POST | Public | Accept invitation & create account |
| `/functions/v1/list-business-invitations` | GET | Platform/Business Admin | List invitations for business |

---

## Security Model

### Access Levels

| User Type | Access Scope | Implementation |
|-----------|--------------|----------------|
| **Platform Admin** | All businesses, all data | `is_platform_admin()` = true |
| **Business Admin** | Own business, full CRUD | `business_id = get_user_business_id()` + `role = 'admin'` |
| **Team Member** | Own business, limited CRUD | `business_id = get_user_business_id()` + `role = 'team_member'` |
| **Unauthenticated** | No access | All policies require `auth.uid()` |

### RLS Policy Pattern

```sql
-- Standard RLS policy structure
CREATE POLICY "policy_name"
  ON table_name
  FOR SELECT
  TO authenticated
  USING (
    deleted_at IS NULL
    AND (
      is_platform_admin()
      OR business_id = get_user_business_id()
    )
  );
```

---

## Key Technical Decisions

### 1. **Separate Business Users from Guest Users**

**Decision**: Use separate tables (`business_users` vs `guest_users`)

**Rationale**:
- Different authentication flows (invite vs public)
- Different data models (roles vs loyalty tiers)
- Cleaner RLS policies
- Better separation of concerns

### 2. **Address as Separate Table**

**Decision**: Normalize addresses into separate table

**Rationale**:
- Reusable for multiple purposes (business address, tour locations, etc.)
- Consistent geocoding (lat/long) management
- Easier to add address validation later

### 3. **No Token in Invitation**

**Decision**: Use invitation UUID as the unique identifier

**Rationale**:
- UUID is sufficiently random (128-bit)
- Simpler implementation
- No need for additional token generation
- One-time use enforced by status change

### 4. **7-Day Invitation Expiry**

**Decision**: Hard-coded 7-day expiry, auto-cleanup after 30 days

**Rationale**:
- Reasonable window for recipients to respond
- Balances security with user convenience
- Auto-cleanup prevents database bloat

### 5. **Soft Deletes Everywhere**

**Decision**: All tables have `deleted_at` column

**Rationale**:
- Audit trail preservation
- Easy recovery from accidental deletions
- Historical data for analytics
- Compliance requirements (GDPR right to erasure via hard delete later)

### 6. **Platform Admins Bypass RLS**

**Decision**: `is_platform_admin()` check in RLS policies

**Rationale**:
- Platform admins need cross-tenant access
- Cleaner than separate admin-only policies
- Still requires authentication
- Centralized access control logic

---

## Environment Variables

### Required for Development

```bash
SUPABASE_URL=http://localhost:54321
SUPABASE_SERVICE_ROLE_KEY=your-local-service-role-key
sendgrid_key=SG.xxxxxxxxxxxx
PORTAL_APP_URL=http://localhost:3000
SUPPORT_URL=https://montenegroselect.me/support
TERMS_URL=https://montenegroselect.me/terms
PRIVACY_URL=https://montenegroselect.me/privacy
EMAIL_FROM_ADDRESS=noreply@montenegroselect.me
EMAIL_REPLY_TO=support@montenegroselect.me
```

### Required for Production

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key
sendgrid_key=SG.xxxxxxxxxxxx  # Already in Supabase Secrets ✅
PORTAL_APP_URL=https://portal.montenegroselect.me
SUPPORT_URL=https://montenegroselect.me/support
TERMS_URL=https://montenegroselect.me/terms
PRIVACY_URL=https://montenegroselect.me/privacy
EMAIL_FROM_ADDRESS=noreply@montenegroselect.me
EMAIL_REPLY_TO=support@montenegroselect.me
```

### Email Configuration

**SendGrid is configured and ready to use:**

- ✅ Domain `montenegroselect.me` is VERIFIED
- ✅ SendGrid API key stored as `sendgrid_key` in Supabase Secrets
- ✅ Sending from: `noreply@montenegroselect.me`
- ✅ Reply-to: `support@montenegroselect.me`

**📖 Complete configuration details:** [SENDGRID-SETUP.md](./SENDGRID-SETUP.md)

---

## Testing Requirements

### Must Test

- [ ] RLS policies with different user roles (platform admin, business admin, team member)
- [ ] Cross-tenant access prevention (user A cannot see business B's data)
- [ ] Invitation expiry and cleanup
- [ ] Email delivery (test, staging, production)
- [ ] Soft delete behavior (deleted records not returned in queries)
- [ ] Business creation + invitation workflow (end-to-end)
- [ ] Invitation acceptance + user creation workflow
- [ ] Input validation (malformed requests return 400)
- [ ] Authorization checks (unauthorized requests return 403)

---

## Performance Benchmarks

### Target Metrics

| Operation | Target | Notes |
|-----------|--------|-------|
| Business creation | < 500ms | Includes invitation creation |
| Send invitation | < 300ms | Includes email send |
| Accept invitation | < 700ms | Includes user creation |
| List invitations | < 100ms | For typical business (< 50 invitations) |
| Business name search | < 200ms | Using trigram index |

### Index Verification

```sql
-- Verify critical indexes exist
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('businesses', 'business_users', 'invitations')
ORDER BY tablename, indexname;
```

---

## Monitoring Checklist

### Database

- [ ] Query performance (slow query log)
- [ ] Connection pool usage
- [ ] Index hit rate (should be > 95%)
- [ ] Table bloat
- [ ] RLS policy overhead

### API (Edge Functions)

- [ ] Response times (p50, p95, p99)
- [ ] Error rates
- [ ] Request volume
- [ ] Function invocation count

### Email

- [ ] Delivery rate (should be > 98%)
- [ ] Bounce rate (should be < 2%)
- [ ] Open rate (tracking pixel)
- [ ] Click rate (invitation links)

---

## Deployment Order

### Critical: Follow This Sequence

1. ✅ **Extensions** (uuid-ossp, pg_trgm)
2. ✅ **Helper functions** (update_updated_at_column)
3. ✅ **Core tables** (in dependency order)
4. ✅ **RLS policies** (after tables exist)
5. ✅ **Helper functions** (is_platform_admin, etc.)
6. ✅ **Seed data** (business types, platform admin)
7. ✅ **Edge functions** (after database is ready)

**Why this order?**
- Foreign key constraints require parent tables first
- RLS policies require tables to exist
- Helper functions used by RLS policies must exist first
- Edge functions call database, so database must be ready

---

## Common Gotchas

### 1. ❌ Forgetting `deleted_at IS NULL` in queries

```sql
-- BAD: Returns deleted records
SELECT * FROM businesses WHERE id = ?

-- GOOD: Filters deleted records
SELECT * FROM businesses WHERE id = ? AND deleted_at IS NULL
```

**Solution**: RLS policies include this check, but direct queries need it too.

### 2. ❌ Not checking platform admin in RLS policies

```sql
-- BAD: Only tenant users can access
USING (business_id = get_user_business_id())

-- GOOD: Platform admins can access too
USING (is_platform_admin() OR business_id = get_user_business_id())
```

### 3. ❌ Forgetting WITH CHECK on UPDATE policies

```sql
-- BAD: Only validates reads
CREATE POLICY "update_business" ON businesses FOR UPDATE
USING (business_id = get_user_business_id());

-- GOOD: Validates both reads and writes
CREATE POLICY "update_business" ON businesses FOR UPDATE
USING (business_id = get_user_business_id())
WITH CHECK (business_id = get_user_business_id());
```

### 4. ❌ Using service role key in client code

```typescript
// BAD: Exposes service role key to browser
const supabase = createClient(url, SERVICE_ROLE_KEY)

// GOOD: Use anon key in client, service role only in edge functions
const supabase = createClient(url, ANON_KEY)
```

---

## FAQ

### Q: Can a user be part of multiple businesses?

**A**: No. In Phase 1, users belong to exactly ONE business. This simplifies tenant isolation. Future phases may add support for multiple business memberships if needed.

### Q: Can business admins invite other admins?

**A**: No. Only platform admins can invite business admins. Business admins can only invite team members. This prevents privilege escalation.

### Q: What happens if invitation email fails to send?

**A**: The invitation record is still created. The admin can resend the invitation later. The `sent_at` field tracks whether the email was sent.

### Q: How do expired invitations get cleaned up?

**A**: A scheduled SQL cron job runs daily at 2 AM UTC, marking pending invitations as expired and deleting old expired invitations (> 30 days old).

### Q: Can platform admins see deleted records?

**A**: No, RLS policies filter `deleted_at IS NULL` for all users, including platform admins. To see deleted records, use direct SQL with service role.

### Q: What's the difference between `deleted_at` and `status = 'suspended'`?

**A**: `status = 'suspended'` is a business state (temporarily inactive but visible). `deleted_at` is a soft delete (removed from queries, kept for audit trail).

---

## Next Steps

### After Phase 1 Completion

1. **Phase 2**: Guest user system + spending tracking
2. **Phase 3**: Offers and promotions
3. **Phase 4**: Booking system
4. **Phase 5**: Business-specific features (tour scheduling, table reservations)

### Immediate Todo

- [ ] Review all specification documents
- [ ] Set up local development environment
- [ ] Apply database migrations
- [ ] **Store SendGrid API key** in Supabase Secrets (see [SENDGRID-SETUP.md](./SENDGRID-SETUP.md))
- [ ] Implement edge functions
- [ ] Test email delivery from `montenegroselect.me`
- [ ] Integrate with Portal app
- [ ] Deploy to staging
- [ ] Conduct UAT
- [ ] Deploy to production

---

## Support & Questions

If you have questions during implementation:

1. **Check the relevant spec document** (links above)
2. **Review the [Implementation Guide](./phase-1-implementation-guide.md)** for detailed steps
3. **Test locally first** before deploying to staging/production
4. **Check Supabase logs** for error messages and debugging info

---

## Document Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2026-02-12 | 1.0 | Initial Phase 1 specifications |

---

## Contributors

- **Architect**: Marko (marko+admin@velocci.me)
- **Platform**: Supabase (PostgreSQL + Edge Functions)
- **Email Service**: Resend
- **Frontend**: Next.js 15 (Portal App)

---

**Ready to build? Start with the [Implementation Guide](./phase-1-implementation-guide.md)! 🚀**
