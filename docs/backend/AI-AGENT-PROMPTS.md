# AI Agent Implementation Prompts - Phase 1

## Overview

This document contains structured prompts for AI coding agents to implement Phase 1 of the MNE Select backend. Each prompt references the specification files directly so the agent can read them.

---

## ⚙️ Session 0: Local Development Setup (First Time Only)

### Prompt 0: Environment Setup

```
You are setting up the MNE Select development environment for the first time.

# PREREQUISITES
Before implementing any features, you must set up your local development environment.

## Instructions
1. Read the complete setup guide:
   - `/Users/markobabic/LocalDev/mne-select/docs/backend/phase-1-implementation-guide.md`
   - Section: "Prerequisites" (at the top of the document)

2. Follow these steps in order:
   - Install Docker Desktop (required)
   - Install Supabase CLI
   - Initialize Supabase in project: `supabase init`
   - Start local Supabase: `supabase start`
   - Create `.env` file with local credentials
   - Verify setup by accessing Supabase Studio at http://localhost:54323

## Critical Setup Steps

### 1. Install Docker Desktop
Download and install from: https://www.docker.com/products/docker-desktop/
Launch Docker Desktop and wait for it to start.

### 2. Install Supabase CLI
```bash
brew install supabase/tap/supabase
```

### 3. Initialize and Start Supabase
```bash
cd /Users/markobabic/LocalDev/mne-select
supabase init
supabase start  # First time takes 2-3 minutes
```

### 4. Save Output Credentials
The `supabase start` command outputs important values:
- API URL
- anon key
- service_role key

Save these in a `.env` file (see implementation guide for complete template).

## Deliverables
- [ ] Docker Desktop installed and running
- [ ] Supabase CLI installed
- [ ] Local Supabase started successfully
- [ ] Can access Supabase Studio at http://localhost:54323
- [ ] `.env` file created with credentials
- [ ] `.env` is in `.gitignore`

## Testing
Verify everything is working:
```bash
# Check Docker containers
docker ps  # Should show supabase containers

# Check Supabase status
supabase status  # Should show all services running

# Access Studio
open http://localhost:54323  # Should open Supabase UI
```

Once this is complete and verified, proceed to Session 1 (Database Foundation).
```

---

## 🎯 Session 1: Database Foundation

### Prompt 1A: Database Schema Implementation

```
You are a senior backend developer implementing Phase 1 of the MNE Select platform using Supabase (PostgreSQL + Edge Functions).

# PREREQUISITES
Ensure you have completed Session 0 (Local Development Setup) and local Supabase is running.

# CONTEXT
First, read this file to understand the overall scope and architecture:
- `/Users/markobabic/LocalDev/mne-select/docs/backend/PHASE-1-README.md`

# YOUR TASK
Implement the complete database foundation including tables, indexes, helper functions, and constraints.

## Instructions
1. Read the complete database schema specification:
   - `/Users/markobabic/LocalDev/mne-select/docs/backend/phase-1-database-schema.md`

2. Create migration files in `supabase/migrations/` following this order:
   - Migration 1: Extensions and helper functions
   - Migration 2: Core tables (business_types, addresses, businesses, platform_admins, business_users, invitations)
   - Migration 3: Helper functions (is_platform_admin, get_user_business_id, has_business_role)

3. Follow the "Migration Order" section in the schema specification exactly

4. Ensure all:
   - Foreign key constraints are properly defined
   - Indexes are created as specified
   - Check constraints are implemented
   - Triggers are attached
   - Comments are added to tables/columns

## Deliverables
- [ ] Migration files created in correct order
- [ ] All tables created with proper structure
- [ ] All indexes created
- [ ] All helper functions implemented
- [ ] Migrations can be applied without errors
- [ ] TypeScript types generated from schema

## Implementation Steps

1. Create migration files in `supabase/migrations/`
2. Apply migrations:
   ```bash
   supabase db push
   ```
3. **CRITICAL: Generate TypeScript types**:
   ```bash
   supabase gen types typescript --local > packages/shared-types/src/database.types.ts
   ```
4. Commit both migrations and generated types to git

**Note:** Always regenerate types after any schema change! This ensures frontend has type-safe access to all tables and columns.

## Reference
For implementation steps, see:
- `/Users/markobabic/LocalDev/mne-select/docs/backend/phase-1-implementation-guide.md` (Step 2: Create Database Migrations)

Do not proceed to RLS policies until I confirm this step is complete.
```

---

### Prompt 1B: Row-Level Security Policies

```
# PREVIOUS CONTEXT
You have successfully implemented the database schema from Phase 1.

# YOUR TASK
Implement comprehensive Row-Level Security (RLS) policies for multi-tenant data isolation.

## Instructions
1. Read the RLS policies specification:
   - `/Users/markobabic/LocalDev/mne-select/docs/backend/phase-1-rls-policies.md`

2. Create a new migration file: `supabase/migrations/YYYYMMDDHHMMSS_enable_rls.sql`

3. Implement ALL policies for these tables (in order):
   - business_types
   - addresses
   - businesses
   - business_users
   - platform_admins
   - invitations

4. Follow the exact policy definitions from the specification

5. Ensure each table has:
   - `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;` statement
   - All SELECT, INSERT, UPDATE policies as specified
   - Proper use of helper functions (is_platform_admin, get_user_business_id, has_business_role)

## Critical Requirements
- ✅ All policies must filter `deleted_at IS NULL` for SELECT operations
- ✅ All policies must require authentication (`TO authenticated`)
- ✅ Platform admin bypass logic must be included where specified
- ✅ UPDATE policies must have both USING and WITH CHECK clauses

## Deliverables
- [ ] RLS enabled on all tables
- [ ] All policies created as specified
- [ ] Migration can be applied without errors
- [ ] No security gaps (all tables have proper policies)
- [ ] TypeScript types regenerated (optional but recommended)

## Implementation Steps

1. Create RLS migration file: `supabase/migrations/YYYYMMDDHHMMSS_enable_rls.sql`
2. Apply migration:
   ```bash
   supabase db push
   ```
3. (Optional) Regenerate types:
   ```bash
   supabase gen types typescript --local > packages/shared-types/src/database.types.ts
   ```
4. Commit migration to git

## Testing
After implementation, verify policies work correctly:
1. Test as platform admin (should see all data)
2. Test as business user (should only see own business data)
3. Test cross-tenant access prevention

Do not proceed to seed data until I confirm this step is complete.
```

---

### Prompt 1C: Seed Data Implementation

```
# PREVIOUS CONTEXT
You have successfully implemented:
1. Database schema (tables, indexes, constraints)
2. RLS policies (multi-tenant security)

# YOUR TASK
Create seed data scripts to populate initial data and create the platform admin user.

## Instructions
1. Read the seed data specification:
   - `/Users/markobabic/LocalDev/mne-select/docs/backend/phase-1-seed-data.md`

2. Create two seed scripts:
   - `supabase/seed.sql` (for local development with test data)
   - `supabase/seed-production.sql` (for production with minimal data only)

3. Seed data must include:
   - All 12 business types (Restaurant, Bar, Coffee Shop, Gym, Spa, Boat Tour, Experience, Guide, Car Rental, Transfer, Beach, Camp Site)
   - Platform admin user: marko+admin@velocci.me / Password1*
   - (Local only) Test businesses, test users, sample invitations

4. Follow the exact SQL from the specification

## Critical Requirements
- ✅ Use `ON CONFLICT` clauses for idempotency (safe to run multiple times)
- ✅ Platform admin must be created in both `auth.users` and `platform_admins` tables
- ✅ Test data should only be included in local seed, not production seed
- ✅ Use proper password hashing with bcrypt

## Deliverables
- [ ] `supabase/seed.sql` created with full seed data
- [ ] `supabase/seed-production.sql` created with minimal production data
- [ ] Scripts are idempotent (can run multiple times safely)
- [ ] Platform admin can be created successfully

## Testing
After implementation:
1. Run seed script locally: `supabase db reset`
2. Verify platform admin exists: `SELECT * FROM platform_admins;`
3. Verify business types exist: `SELECT * FROM business_types ORDER BY display_order;`
4. Test platform admin login with provided credentials

## Next Steps
After seed data is confirmed working, we'll move to Phase 2: Email System.
```

---

## 🎯 Session 2: Email System

### Prompt 2A: Email Service Setup

```
# PREVIOUS CONTEXT
You have successfully implemented:
1. Database schema with RLS policies
2. Seed data with platform admin

# YOUR TASK
Set up the email service integration and create email templates for the invitation system.

## IMPORTANT: Email Configuration
SendGrid is already configured and ready to use:
- Read: `/Users/markobabic/LocalDev/mne-select/docs/backend/SENDGRID-SETUP.md`
- Domain `montenegroselect.me` is VERIFIED ✅
- SendGrid API key is stored in Supabase Secrets as `sendgrid_key` ✅
- Use `Deno.env.get('sendgrid_key')` in your code (note: lowercase, no underscore)
- Use `noreply@montenegroselect.me` as the from address

## Instructions
1. Read the email templates specification:
   - `/Users/markobabic/LocalDev/mne-select/docs/backend/phase-1-email-templates.md`

2. Create these files in `supabase/functions/_shared/`:
   - `email-service.ts` - Email sending utility using SendGrid
   - `email-templates.ts` - Template rendering engine with Handlebars

3. Implement three email templates:
   - Business Admin Invitation (HTML + plain text)
   - Team Member Invitation (HTML + plain text)
   - Invitation Resent Notification (HTML + plain text)

4. Use the exact HTML/text templates from the specification

## Implementation Details

### email-service.ts
- Integrate with SendGrid API (npm:@sendgrid/mail@8.1.0)
- Export `sendEmail()` function
- Handle errors gracefully
- Log all email sending attempts
- Use from address: `noreply@montenegroselect.me`

### email-templates.ts
- Use Handlebars for template rendering
- Export rendering functions for each template type
- Include `generateInvitationLink()` helper
- Support all template variables specified in the doc

## Environment Variables Required
```bash
sendgrid_key=SG.xxxxxxxxxxxxx  # Already configured in Supabase Secrets ✅
EMAIL_FROM_ADDRESS=noreply@montenegroselect.me
EMAIL_REPLY_TO=support@montenegroselect.me
PORTAL_APP_URL=https://portal.montenegroselect.me
SUPPORT_URL=https://montenegroselect.me/support
TERMS_URL=https://montenegroselect.me/terms
PRIVACY_URL=https://montenegroselect.me/privacy
```

## Deliverables
- [ ] `supabase/functions/_shared/email-service.ts` created
- [ ] `supabase/functions/_shared/email-templates.ts` created
- [ ] All three email templates implemented (HTML + text)
- [ ] Template variables properly substituted
- [ ] Mobile-responsive HTML email design

## Testing
Create a test script to send a test email:
1. Create `supabase/functions/test-email.ts`
2. Send test invitation email
3. Verify email is received and displays correctly
4. Test on mobile and desktop email clients

Do not proceed to edge functions until email system is confirmed working.
```

---

## 🎯 Session 3: Edge Functions (API Endpoints)

### Prompt 3A: Shared Utilities

```
# PREVIOUS CONTEXT
You have successfully implemented:
1. Database schema with RLS policies
2. Seed data
3. Email service and templates

# YOUR TASK
Create shared utility functions for edge functions (authentication, validation, types).

## Instructions
1. Read the edge functions specification:
   - `/Users/markobabic/LocalDev/mne-select/docs/backend/phase-1-edge-functions.md`

2. Create these shared utility files in `supabase/functions/_shared/`:
   - `auth.ts` - Authentication and authorization helpers
   - `validation.ts` - Input validation functions
   - `types.ts` - Shared TypeScript types

3. Implement all functions exactly as specified in the doc

## Files to Create

### auth.ts
Must include:
- `authenticateRequest()` - Verify JWT and extract user info
- `isPlatformAdmin()` - Check if user is platform admin
- `isBusinessAdmin()` - Check if user is business admin
- `requirePlatformAdmin()` - Throw error if not platform admin

### validation.ts
Must include:
- `isValidEmail()` - Email format validation
- `validateBusinessData()` - Validate business creation data
- `validateInvitationData()` - Validate invitation data
- `ValidationError` - Custom error class

### types.ts
Must include:
- `AuthenticatedRequest` interface
- `BusinessData` interface
- `InvitationData` interface
- Any other shared types

## Deliverables
- [ ] All three utility files created in `_shared/`
- [ ] All functions implemented with proper TypeScript types
- [ ] Error handling implemented correctly
- [ ] Functions can be imported by edge functions

## Next Steps
After utilities are confirmed working, we'll implement the actual edge functions.
```

---

### Prompt 3B: Edge Function - Create Business

```
# PREVIOUS CONTEXT
Shared utilities are implemented and ready to use.

# YOUR TASK
Implement the `create-business` edge function that creates a new business and sends the first admin invitation.

## Instructions
1. Reference the edge functions specification:
   - `/Users/markobabic/LocalDev/mne-select/docs/backend/phase-1-edge-functions.md`
   - Section: "1. Create Business & Send First Invitation"

2. Create the function:
   ```bash
   supabase functions new create-business
   ```

3. Implement in `supabase/functions/create-business/index.ts`

4. Copy the complete implementation from the specification

## Function Requirements
- ✅ Only platform admins can create businesses
- ✅ Creates address record first
- ✅ Creates business record
- ✅ Creates invitation record
- ✅ Sends invitation email
- ✅ Returns business_id and invitation_id
- ✅ Proper error handling and rollback on failures

## Transaction Logic
The function must:
1. Create address
2. Create business (with foreign key to address)
3. Create invitation (with foreign key to business)
4. Send email (non-blocking, can fail without rollback)
5. Update invitation.sent_at timestamp

If steps 1-3 fail, previous steps must be rolled back.

## Deliverables
- [ ] Function created in `supabase/functions/create-business/`
- [ ] All imports from `_shared/` working correctly
- [ ] CORS headers configured
- [ ] Request validation implemented
- [ ] Authorization check enforced
- [ ] Error responses return proper status codes

## Testing
Test with curl:
```bash
curl -X POST http://localhost:54321/functions/v1/create-business \
  -H "Authorization: Bearer PLATFORM_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d @test-data/create-business.json
```

Expected: Business created, invitation sent, 201 status code returned.
```

---

### Prompt 3C: Edge Function - Send/Resend Invitation

```
# PREVIOUS CONTEXT
The `create-business` function is implemented and working.

# YOUR TASK
Implement the `send-invitation` edge function for sending new invitations and resending existing ones.

## Instructions
1. Reference the edge functions specification:
   - `/Users/markobabic/LocalDev/mne-select/docs/backend/phase-1-edge-functions.md`
   - Section: "2. Send/Resend Invitation"

2. Create the function:
   ```bash
   supabase functions new send-invitation
   ```

3. Implement in `supabase/functions/send-invitation/index.ts`

## Function Requirements
- ✅ Supports both NEW invitations and RESEND existing invitations
- ✅ Platform admins can invite anyone to any business
- ✅ Business admins can invite team members to their business only
- ✅ Business admins CANNOT invite other admins (privilege escalation prevention)
- ✅ Checks for existing pending invitations (prevents duplicates)
- ✅ Validates invitation hasn't expired before resending
- ✅ Increments resent_count and updates last_resent_at

## Two Modes of Operation

### Mode 1: New Invitation
Request includes: business_id, email, role, first_name, last_name

### Mode 2: Resend Existing
Request includes: invitation_id, first_name (optional)

## Deliverables
- [ ] Function handles both new and resend operations
- [ ] Authorization checks for both modes
- [ ] Prevents business admins from inviting other admins
- [ ] Checks for duplicate pending invitations
- [ ] Updates resend tracking fields
- [ ] Different email templates for new vs resend

## Testing
Test new invitation:
```bash
curl -X POST http://localhost:54321/functions/v1/send-invitation \
  -H "Authorization: Bearer BUSINESS_ADMIN_TOKEN" \
  -d '{"business_id":"xxx","email":"user@test.com","role":"team_member",...}'
```

Test resend:
```bash
curl -X POST http://localhost:54321/functions/v1/send-invitation \
  -H "Authorization: Bearer BUSINESS_ADMIN_TOKEN" \
  -d '{"invitation_id":"xxx","first_name":"John"}'
```
```

---

### Prompt 3D: Edge Function - Accept Invitation

```
# PREVIOUS CONTEXT
The invitation sending system is fully implemented.

# YOUR TASK
Implement the `accept-invitation` edge function that accepts an invitation and creates a new user account.

## Instructions
1. Reference the edge functions specification:
   - `/Users/markobabic/LocalDev/mne-select/docs/backend/phase-1-edge-functions.md`
   - Section: "3. Accept Invitation & Create User"

2. Create the function:
   ```bash
   supabase functions new accept-invitation
   ```

3. Implement in `supabase/functions/accept-invitation/index.ts`

## Function Requirements
- ✅ Public endpoint (no authentication required)
- ✅ Validates invitation exists and is pending
- ✅ Checks email matches invitation email
- ✅ Checks invitation hasn't expired
- ✅ Creates auth.users record via Supabase Auth Admin API
- ✅ Creates business_users record
- ✅ Marks invitation as accepted
- ✅ Returns session for immediate login
- ✅ Rollback on failure

## Critical Flow
1. Validate input (invitation_id, email, password, first_name, last_name)
2. Fetch invitation and verify status/expiry
3. Create auth user with `auth.admin.createUser()`
4. Create business_users record
5. Mark invitation as accepted
6. Return session

If step 4 fails, delete the auth user (cleanup).

## Deliverables
- [ ] Function accepts invitation data
- [ ] Creates user in Supabase Auth
- [ ] Creates business_users profile
- [ ] Marks invitation as accepted
- [ ] Returns session for immediate login
- [ ] Proper error handling and cleanup

## Testing
Test acceptance flow:
```bash
curl -X POST http://localhost:54321/functions/v1/accept-invitation \
  -H "Content-Type: application/json" \
  -d '{
    "invitation_id":"xxx",
    "email":"user@test.com",
    "password":"SecurePass123!",
    "first_name":"John",
    "last_name":"Doe"
  }'
```

Expected: User created, session returned, 201 status code.
```

---

### Prompt 3E: Edge Function - List Business Invitations

```
# PREVIOUS CONTEXT
All core invitation functions are implemented.

# YOUR TASK
Implement the `list-business-invitations` edge function to list all invitations for a business.

## Instructions
1. Reference the edge functions specification:
   - `/Users/markobabic/LocalDev/mne-select/docs/backend/phase-1-edge-functions.md`
   - Section: "4. List Business Invitations"

2. Create the function:
   ```bash
   supabase functions new list-business-invitations
   ```

3. Implement in `supabase/functions/list-business-invitations/index.ts`

## Function Requirements
- ✅ GET request with business_id query parameter
- ✅ Platform admins can list invitations for any business
- ✅ Business admins can list invitations for their business only
- ✅ Returns all invitation records (pending, accepted, expired)
- ✅ Sorted by created_at descending (newest first)
- ✅ Includes relevant fields only (no sensitive data)

## Query Parameters
- `business_id` (required): UUID of the business

## Response Format
Returns array of invitation objects with fields:
- id, email, role, status, expires_at, sent_at, accepted_at, created_at, resent_count

## Deliverables
- [ ] Function accepts business_id query param
- [ ] Authorization check (platform admin OR business admin)
- [ ] Returns filtered invitation list
- [ ] Proper sorting (newest first)
- [ ] Returns 403 if not authorized

## Testing
Test as business admin:
```bash
curl -X GET "http://localhost:54321/functions/v1/list-business-invitations?business_id=xxx" \
  -H "Authorization: Bearer BUSINESS_ADMIN_TOKEN"
```

Expected: Array of invitations for that business only.
```

---

## 🎯 Session 4: Deployment & Testing

### Prompt 4A: Local Testing & Verification

```
# PREVIOUS CONTEXT
All edge functions are implemented.

# YOUR TASK
Test the complete Phase 1 implementation locally and verify all workflows work end-to-end.

## Instructions
1. Reference the testing section in:
   - `/Users/markobabic/LocalDev/mne-select/docs/backend/phase-1-implementation-guide.md`
   - Section: "Testing Strategy"

2. Perform these tests:

### Database Tests
- [ ] Verify all migrations applied successfully
- [ ] Check all tables exist with correct structure
- [ ] Verify all indexes are created
- [ ] Test RLS policies with different user roles
- [ ] Verify soft delete behavior
- [ ] Test foreign key constraints

### Edge Function Tests
- [ ] Test create-business as platform admin (should succeed)
- [ ] Test create-business as business user (should fail with 403)
- [ ] Test send-invitation as business admin (should succeed for team_member only)
- [ ] Test send-invitation as business admin for admin role (should fail)
- [ ] Test accept-invitation with valid invitation (should succeed)
- [ ] Test accept-invitation with expired invitation (should fail)
- [ ] Test list-invitations with proper authorization

### Email Tests
- [ ] Send test invitation email
- [ ] Verify email is received
- [ ] Check email displays correctly on mobile
- [ ] Verify invitation link format
- [ ] Test email deliverability (check spam folder)

## Create Test Scripts
Create these test files:
1. `tests/database-rls-tests.sql` - SQL tests for RLS policies
2. `tests/edge-functions-tests.sh` - Bash script with curl commands
3. `tests/test-users.json` - Test user credentials

## Deliverables
- [ ] All tests passing
- [ ] Test scripts created and documented
- [ ] Any bugs found are fixed
- [ ] RLS policies verified for all user roles
- [ ] Email delivery confirmed working

## Next Steps
After all tests pass, we'll proceed to deployment configuration.
```

---

### Prompt 4B: Production Deployment Configuration

```
# PREVIOUS CONTEXT
All features are implemented and tested locally.

# YOUR TASK
Prepare for production deployment by configuring environment variables, deployment scripts, and documentation.

## Instructions
1. Reference the deployment section in:
   - `/Users/markobabic/LocalDev/mne-select/docs/backend/phase-1-implementation-guide.md`
   - Section: "Step 6: Deploy to Staging" and "Deployment Checklist"

2. Create deployment configuration files:

### Environment Files
Create these files (do NOT commit with real values):
- `.env.local.example` - Template for local development
- `.env.staging.example` - Template for staging environment
- `.env.production.example` - Template for production environment

### Deployment Scripts
Create `scripts/deploy-functions.sh`:
- Script to deploy all edge functions
- Includes environment variable setup
- Includes verification steps

Create `scripts/apply-migrations.sh`:
- Script to apply database migrations
- Includes rollback procedures
- Includes verification queries

### Documentation
Update `docs/backend/DEPLOYMENT.md` with:
- Pre-deployment checklist
- Step-by-step deployment process
- Environment variable configuration
- Rollback procedures
- Troubleshooting guide

## Deliverables
- [ ] Environment template files created
- [ ] Deployment scripts created and tested
- [ ] Deployment documentation written
- [ ] Secrets management documented
- [ ] Rollback procedures documented

## Production Readiness Checklist
- [ ] All migrations tested
- [ ] All edge functions tested
- [ ] RLS policies verified
- [ ] Email deliverability configured
- [ ] Environment variables documented
- [ ] Monitoring configured
- [ ] Backup strategy defined
```

---

## 📋 Quick Reference

### File Reading Order
For complete understanding, read specifications in this order:
1. `/Users/markobabic/LocalDev/mne-select/docs/backend/GETTING-STARTED.md` ⭐ (Setup checklist)
2. `/Users/markobabic/LocalDev/mne-select/docs/backend/PHASE-1-README.md` (Overview)
3. `/Users/markobabic/LocalDev/mne-select/docs/backend/phase-1-database-schema.md`
3. `/Users/markobabic/LocalDev/mne-select/docs/backend/phase-1-rls-policies.md`
4. `/Users/markobabic/LocalDev/mne-select/docs/backend/phase-1-seed-data.md`
5. `/Users/markobabic/LocalDev/mne-select/docs/backend/SENDGRID-SETUP.md` ⭐ (SendGrid configuration)
6. `/Users/markobabic/LocalDev/mne-select/docs/backend/phase-1-email-templates.md`
7. `/Users/markobabic/LocalDev/mne-select/docs/backend/phase-1-edge-functions.md`
8. `/Users/markobabic/LocalDev/mne-select/docs/backend/phase-1-implementation-guide.md`

### Critical Success Factors
- ✅ Follow migration order exactly (dependencies matter!)
- ✅ Test RLS policies with different user roles
- ✅ Verify email delivery before production
- ✅ Never expose service role key to client
- ✅ Always check `deleted_at IS NULL` in queries
- ✅ Use platform admin bypass pattern in RLS policies

### Common Commands
```bash
# Start Supabase locally
supabase start

# Apply migrations
supabase db push

# Generate types
supabase gen types typescript --local > packages/shared-types/src/database.types.ts

# Serve functions locally
supabase functions serve

# Deploy function
supabase functions deploy function-name

# View logs
supabase functions logs function-name --tail
```

---

## 🆘 Troubleshooting

If the agent encounters issues, refer to:
- `/Users/markobabic/LocalDev/mne-select/docs/backend/phase-1-implementation-guide.md`
  - Section: "Common Issues & Solutions"

Common problems and solutions are documented there.

---

## ✅ Completion Criteria

Phase 1 is complete when:
- [ ] All database migrations applied successfully
- [ ] All RLS policies implemented and tested
- [ ] Seed data creates platform admin successfully
- [ ] All 4 edge functions deployed and working
- [ ] Email system delivers invitations reliably
- [ ] End-to-end testing passes (create business → send invite → accept invite)
- [ ] Documentation updated with deployment instructions
- [ ] Production deployment successful

---

**Note**: Each session builds on the previous one. Do not skip sessions or change the order without understanding the dependencies.
