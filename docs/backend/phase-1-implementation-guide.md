# Phase 1: Implementation Guide

## Overview

This document provides a comprehensive guide for implementing Phase 1 of the MNE Select backend, focusing on business onboarding and invitation workflows.

---

## Implementation Scope

### Core Features

1. **Platform Administration**
   - Initial platform admin user creation
   - Cross-tenant data access for admins

2. **Business Management**
   - Create new business entities
   - Manage business information
   - Business type categorization

3. **User Invitation System**
   - Invite business administrators
   - Invite team members
   - Resend pending invitations
   - Accept invitations and create accounts

4. **Multi-Tenant Security**
   - Row-Level Security (RLS) policies
   - Tenant data isolation
   - Role-based access control (RBAC)

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Platform Admin User                      │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │   Portal App (Next.js)        │
        │   - Business creation         │
        │   - Team management           │
        │   - Invitation management     │
        └───────────────┬───────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │   Supabase Edge Functions     │
        │   - create-business           │
        │   - send-invitation           │
        │   - accept-invitation         │
        │   - list-invitations          │
        └───────────────┬───────────────┘
                        │
                ┌───────┴────────┐
                │                │
                ▼                ▼
    ┌───────────────┐   ┌──────────────┐
    │   PostgreSQL  │   │  Email       │
    │   + RLS       │   │  Service     │
    │               │   │  (Resend)    │
    └───────────────┘   └──────────────┘
```

---

## Prerequisites

Before starting implementation, ensure the following software is installed and running on your development machine.

### Required Software

#### 1. Docker Desktop (Required for Local Supabase)

**Why:** Supabase CLI uses Docker to run PostgreSQL database, Auth service, Edge Functions, and other services locally.

**Install:**
1. Download Docker Desktop for Mac: [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/)
2. Install Docker Desktop
3. Launch Docker Desktop app
4. Wait for Docker to start (whale icon appears in menu bar)

**Verify Installation:**
```bash
docker --version
# Should show: Docker version 24.x.x or higher

docker ps
# Should show: CONTAINER ID   IMAGE   ... (empty list is fine)
```

**System Requirements:**
- **RAM**: 8 GB minimum (16 GB recommended)
- **Disk Space**: 10 GB free (for Docker images and containers)
- **OS**: macOS 10.15+ (you're on 24.6.0 ✅)

**Troubleshooting:**
- If Docker Desktop won't start, restart your Mac
- If port conflicts occur, check what's using ports 54321-54324: `lsof -i :54321`
- If disk space issues, clean Docker: `docker system prune -a`

---

#### 2. Supabase CLI (Required)

**Why:** Manages local Supabase instance, migrations, and deployments.

**Install via Homebrew (Recommended for Mac):**
```bash
brew install supabase/tap/supabase
```

**Or install via npm:**
```bash
npm install -g supabase
```

**Verify Installation:**
```bash
supabase --version
# Should show: supabase 1.x.x or higher
```

---

#### 3. Node.js & pnpm (Already Installed for Monorepo)

**Verify:**
```bash
node --version  # Should be v18+ or v20+
pnpm --version  # Should be 8.x or higher
```

---

### Initial Supabase Setup

#### Step 1: Initialize Supabase in Project

```bash
# Navigate to project root
cd /Users/markobabic/LocalDev/mne-select

# Initialize Supabase (creates supabase/ folder)
supabase init
```

**This creates:**
```
supabase/
├── config.toml          # Supabase configuration
├── seed.sql            # Seed data (you'll create this)
└── migrations/         # Database migrations (you'll create these)
```

---

#### Step 2: Start Local Supabase

```bash
# Start all Supabase services (first time takes 2-3 minutes to download images)
supabase start
```

**What This Does:**
- Pulls Docker images (first time only)
- Starts PostgreSQL 15 database
- Starts Supabase Auth service
- Starts Supabase Studio (database UI)
- Starts Edge Functions runtime
- Starts Realtime service
- Starts Inbucket (email testing - catches emails locally)

**Expected Output:**
```
Started supabase local development setup.

         API URL: http://localhost:54321
          DB URL: postgresql://postgres:postgres@localhost:54322/postgres
      Studio URL: http://localhost:54323
    Inbucket URL: http://localhost:54324
      JWT secret: super-secret-jwt-token-with-at-least-32-characters-long
        anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**IMPORTANT: Save these values!** You'll need them for your `.env` file.

---

#### Step 3: Verify Services Are Running

**Check Docker Containers:**
```bash
docker ps
```

**You should see containers like:**
```
supabase_db_mne-select          # PostgreSQL database
supabase_auth_mne-select        # Authentication service
supabase_rest_mne-select        # Auto-generated REST API
supabase_studio_mne-select      # Database UI
supabase_functions_mne-select   # Edge Functions runtime
supabase_inbucket_mne-select    # Email testing
```

**Access Supabase Studio (Database UI):**
Open in browser: http://localhost:54323

You should see the Supabase Studio interface with:
- Table Editor
- SQL Editor
- Authentication
- Storage
- etc.

---

#### Step 4: Create Environment Variables File

Create `.env` file in project root:

```bash
# Create .env file
cat > .env << 'EOF'
# Supabase Local
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=<paste anon key from supabase start output>
SUPABASE_SERVICE_ROLE_KEY=<paste service_role key from supabase start output>

# SendGrid (already configured in Supabase dashboard)
sendgrid_key=SG.xxxxxxxxxxxxxxxxxxxxxxxx.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Email Configuration
EMAIL_FROM_ADDRESS=noreply@montenegroselect.me
EMAIL_FROM_NAME=MNE Select
EMAIL_REPLY_TO=support@montenegroselect.me

# Application URLs
PORTAL_APP_URL=http://localhost:3000
SUPPORT_URL=https://montenegroselect.me/support
TERMS_URL=https://montenegroselect.me/terms
PRIVACY_URL=https://montenegroselect.me/privacy
EOF

# Make sure .env is in .gitignore
echo ".env" >> .gitignore
```

---

#### Step 5: Verify .gitignore

**CRITICAL: Ensure `.env` is NOT committed to git:**

```bash
# Check .gitignore contains .env
grep -q "^\.env$" .gitignore || echo ".env" >> .gitignore

# Verify .env is ignored
git status
# Should NOT show .env in untracked files
```

---

### Local Development Commands

#### Starting Development

```bash
# Terminal 1: Start Supabase (if not already running)
supabase start

# Terminal 2: Start Next.js apps
pnpm dev
```

**Your apps will be available at:**
- Portal App: http://localhost:3000
- Guests App: http://localhost:3001
- Supabase Studio: http://localhost:54323
- Inbucket (Email Testing): http://localhost:54324

---

#### Stopping Development

```bash
# Stop Supabase (keeps data intact)
supabase stop

# Stop and reset all data (fresh start)
supabase db reset

# Stop and remove all Docker containers (clean slate)
supabase stop --no-backup
```

---

#### Useful Commands

```bash
# Check Supabase status
supabase status

# View Supabase logs
supabase logs

# Access database with psql
supabase db psql

# View database URL
supabase db url

# List all migrations
supabase migration list

# Apply migrations
supabase db push

# Generate TypeScript types from database
supabase gen types typescript --local > packages/shared-types/src/database.types.ts
```

---

### Email Testing with Inbucket

**Inbucket catches all emails sent locally** (they don't actually go to SendGrid).

**View test emails:**
1. Open http://localhost:54324 in browser
2. Click on any email to view it
3. Test invitation emails during development

**Note:** In production, emails will use SendGrid and actually send to recipients.

---

### Troubleshooting Local Setup

#### Issue: Docker not running
```
Error: Cannot connect to Docker daemon
```
**Solution:** Start Docker Desktop app (whale icon in menu bar)

---

#### Issue: Port already in use
```
Error: Port 54321 is already allocated
```
**Solution:**
```bash
# Stop Supabase
supabase stop

# Find what's using the port
lsof -i :54321

# Kill the process or restart Docker
```

---

#### Issue: Supabase won't start
```
Error: supabase start failed
```
**Solutions:**
1. Restart Docker Desktop
2. Clean up Docker resources:
   ```bash
   docker system prune -a
   supabase stop --no-backup
   supabase start
   ```
3. Check Docker has enough resources (Settings → Resources → increase memory)

---

#### Issue: Can't connect to database
```
Error: Connection refused
```
**Solution:**
```bash
# Check Supabase is running
supabase status

# If not, start it
supabase start

# Verify database container is running
docker ps | grep supabase_db
```

---

#### Issue: Out of disk space
```
Error: No space left on device
```
**Solution:**
```bash
# Clean Docker images and containers
docker system prune -a --volumes

# Remove old Supabase data
supabase stop --no-backup
```

---

### Development Workflow Summary

**Daily Workflow:**
1. ✅ Start Docker Desktop
2. ✅ Run `supabase start` (takes ~10 seconds after first time)
3. ✅ Run `pnpm dev` to start Next.js apps
4. ✅ Build features, test locally
5. ✅ Run `supabase stop` when done (or leave running)

**After Creating/Modifying Migrations:**
1. ✅ Apply migrations: `supabase db push`
2. ✅ **ALWAYS generate types**: `supabase gen types typescript --local > packages/shared-types/src/database.types.ts`
3. ✅ Commit both migration and updated types to git
4. ✅ Restart Next.js apps to pick up new types

**Why generate types?** This creates TypeScript definitions from your database schema so frontend has autocomplete and type safety for all tables/columns.

**When to generate types:**
- ✅ After any migration that changes schema (tables, columns, enums)
- ✅ After `supabase db reset`
- ❌ NOT needed after just inserting data

---

## Implementation Sequence

### Phase 1.1: Database Foundation (Week 1)

**Tasks:**
1. ✅ Set up local Supabase instance
2. ✅ Create database migrations
3. ✅ Implement helper functions
4. ✅ Enable RLS on all tables
5. ✅ Create RLS policies
6. ✅ Seed initial data (business types, platform admin)
7. ✅ Generate TypeScript types

**Deliverables:**
- Migration files in `supabase/migrations/`
- Seed script in `supabase/seed.sql`
- Generated types in `packages/shared-types/src/database.types.ts`

**Testing:**
- Verify RLS policies with different user roles
- Test soft delete functionality
- Validate foreign key constraints

---

### Phase 1.2: Email System (Week 1)

**Tasks:**
1. ✅ Set up Resend account and verify domain
2. ✅ Create email templates (HTML + plain text)
3. ✅ Implement email service utility
4. ✅ Implement template rendering engine
5. ✅ Test email delivery

**Deliverables:**
- Email service in `supabase/functions/_shared/email-service.ts`
- Email templates in `supabase/functions/_shared/email-templates.ts`
- Test email sending script

**Testing:**
- Send test emails to verify deliverability
- Test template rendering with sample data
- Verify mobile responsiveness of emails

---

### Phase 1.3: Edge Functions (Week 2)

**Tasks:**
1. ✅ Implement shared utilities (auth, validation)
2. ✅ Create `create-business` function
3. ✅ Create `send-invitation` function
4. ✅ Create `accept-invitation` function
5. ✅ Create `list-business-invitations` function
6. ✅ Test functions locally
7. ✅ Deploy functions to staging

**Deliverables:**
- Edge functions in `supabase/functions/`
- Shared utilities in `supabase/functions/_shared/`
- API documentation for frontend team

**Testing:**
- Unit tests for validation logic
- Integration tests for complete workflows
- Authorization tests (RLS enforcement)

---

### Phase 1.4: Portal App Integration (Week 2-3)

**Tasks:**
1. ✅ Create business creation form
2. ✅ Create invitation management UI
3. ✅ Create invitation acceptance flow
4. ✅ Implement authentication guards
5. ✅ Test end-to-end workflows

**Deliverables:**
- Business creation page in Portal app
- Team management page
- Invitation acceptance page
- Integration with edge functions

**Testing:**
- E2E tests for complete user journeys
- Form validation tests
- Authorization tests

---

### Phase 1.5: Production Deployment (Week 3)

**Tasks:**
1. ✅ Deploy database migrations to production
2. ✅ Deploy edge functions to production
3. ✅ Configure production environment variables
4. ✅ Create production platform admin
5. ✅ Verify production email delivery
6. ✅ Monitor initial usage

**Deliverables:**
- Production-ready backend
- Deployment documentation
- Monitoring dashboards

**Testing:**
- Smoke tests in production
- Load testing
- Security testing

---

## Detailed Implementation Steps

### Step 1: Local Supabase Setup

```bash
# Initialize Supabase project (if not already done)
supabase init

# Start local Supabase
supabase start

# Note the API URL and keys displayed
```

**Expected Output:**
```
API URL: http://localhost:54321
DB URL: postgresql://postgres:postgres@localhost:54322/postgres
anon key: eyJhbGc...
service_role key: eyJhbGc...
```

---

### Step 2: Create Database Migrations

Create migrations in order:

#### Migration 1: Extensions and Helper Functions

**File**: `supabase/migrations/20260212000001_setup_extensions.sql`

```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Helper function: update_updated_at_column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

#### Migration 2: Core Tables

**File**: `supabase/migrations/20260212000002_create_core_tables.sql`

```sql
-- Copy table definitions from phase-1-database-schema.md
-- In order: business_types, addresses, businesses, platform_admins, business_users, invitations
```

#### Migration 3: Helper Functions

**File**: `supabase/migrations/20260212000003_create_helper_functions.sql`

```sql
-- Copy helper functions from phase-1-database-schema.md
-- is_platform_admin(), get_user_business_id(), has_business_role()
```

#### Migration 4: RLS Policies

**File**: `supabase/migrations/20260212000004_enable_rls.sql`

```sql
-- Copy RLS policies from phase-1-rls-policies.md
```

**Apply Migrations:**

```bash
# Apply migrations locally
supabase db push

# Verify migrations
supabase db diff

# Generate TypeScript types
supabase gen types typescript --local > ../packages/shared-types/src/database.types.ts
```

---

### Step 3: Seed Initial Data

**File**: `supabase/seed.sql`

Copy seed script from `phase-1-seed-data.md`.

**Verify Seeding:**

```bash
# Connect to database
supabase db psql

# Check business types
SELECT * FROM business_types ORDER BY display_order;

# Check platform admin
SELECT pa.*, au.email 
FROM platform_admins pa 
JOIN auth.users au ON pa.user_id = au.id;
```

---

### Step 4: Set Up Email Service

#### 4.1: Create Resend Account

1. Go to [resend.com](https://resend.com)
2. Create account
3. Verify email
4. Add domain: `mneselect.me`
5. Configure DNS records (SPF, DKIM, DMARC)
6. Generate API key

#### 4.2: Test Email Delivery

```bash
# Create test script
cat > supabase/functions/test-email.ts << 'EOF'
// Copy test email script from phase-1-email-templates.md
EOF

# Run test
deno run --allow-net --allow-env supabase/functions/test-email.ts
```

---

### Step 5: Implement Edge Functions

#### 5.1: Create Shared Utilities

```bash
mkdir -p supabase/functions/_shared

# Create files
touch supabase/functions/_shared/auth.ts
touch supabase/functions/_shared/validation.ts
touch supabase/functions/_shared/email-service.ts
touch supabase/functions/_shared/email-templates.ts
touch supabase/functions/_shared/types.ts
```

Copy content from `phase-1-edge-functions.md`.

#### 5.2: Create Edge Functions

```bash
# Create functions
supabase functions new create-business
supabase functions new send-invitation
supabase functions new accept-invitation
supabase functions new list-business-invitations
```

Copy function code from `phase-1-edge-functions.md`.

#### 5.3: Set Environment Variables

```bash
# Create .env file
cat > .env.local << 'EOF'
SUPABASE_URL=http://localhost:54321
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
RESEND_API_KEY=your-resend-api-key
PORTAL_APP_URL=http://localhost:3000
SUPPORT_URL=https://mneselect.me/support
TERMS_URL=https://mneselect.me/terms
PRIVACY_URL=https://mneselect.me/privacy
EOF

# Set secrets for local functions
supabase secrets set --env-file .env.local
```

#### 5.4: Test Functions Locally

```bash
# Start functions server
supabase functions serve

# In another terminal, test create-business
curl -X POST http://localhost:54321/functions/v1/create-business \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Restaurant",
    "business_type_id": "uuid-here",
    "address": {
      "address_line_1": "Test Street 123",
      "city": "Budva",
      "country": "Montenegro"
    },
    "is_pdv_registered": false,
    "accepts_bookings": false,
    "admin_email": "test@example.com",
    "admin_first_name": "Test",
    "admin_last_name": "User"
  }'
```

---

### Step 6: Deploy to Staging

#### 6.1: Create Staging Project in Supabase

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create new project: `mne-select-staging`
3. Note the project URL and keys

#### 6.2: Deploy Migrations

```bash
# Link to staging project
supabase link --project-ref your-staging-ref

# Apply migrations
supabase db push --db-url $STAGING_DB_URL

# Run production seed (business types + admin)
supabase db psql --db-url $STAGING_DB_URL -f seed-production.sql
```

#### 6.3: Deploy Functions

```bash
# Deploy all functions
supabase functions deploy create-business
supabase functions deploy send-invitation
supabase functions deploy accept-invitation
supabase functions deploy list-business-invitations

# Set production secrets
supabase secrets set --env-file .env.staging
```

---

### Step 7: Portal App Integration

#### 7.1: Install Dependencies

```bash
cd apps/portal

# Install Supabase client (if not already installed)
pnpm add @supabase/supabase-js
```

#### 7.2: Create API Client

**File**: `apps/portal/lib/api/business.ts`

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function createBusiness(data: CreateBusinessData) {
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    throw new Error('Not authenticated')
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-business`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create business')
  }

  return response.json()
}

// Similar functions for other operations...
```

#### 7.3: Create Business Creation Form

**File**: `apps/portal/app/(authenticated)/businesses/new/page.tsx`

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBusiness } from '@/lib/api/business'

export default function CreateBusinessPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    const data = {
      name: formData.get('name') as string,
      business_type_id: formData.get('business_type_id') as string,
      address: {
        address_line_1: formData.get('address_line_1') as string,
        city: formData.get('city') as string,
        country: formData.get('country') as string,
      },
      is_pdv_registered: formData.get('is_pdv_registered') === 'on',
      pdv_number: formData.get('pdv_number') as string,
      accepts_bookings: formData.get('accepts_bookings') === 'on',
      admin_email: formData.get('admin_email') as string,
      admin_first_name: formData.get('admin_first_name') as string,
      admin_last_name: formData.get('admin_last_name') as string,
    }

    try {
      const result = await createBusiness(data)
      router.push(`/businesses/${result.data.business_id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create business')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1>Create New Business</h1>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        {/* Form fields */}
        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Business'}
        </button>
      </form>
    </div>
  )
}
```

---

## Testing Strategy

### Unit Tests

```typescript
// Test validation functions
describe('validateBusinessData', () => {
  it('should accept valid business data', () => {
    const data = {
      name: 'Test Restaurant',
      business_type_id: 'uuid-here',
      // ... valid data
    }
    expect(() => validateBusinessData(data)).not.toThrow()
  })

  it('should reject missing required fields', () => {
    const data = { name: '' }
    expect(() => validateBusinessData(data)).toThrow()
  })
})
```

### Integration Tests

```typescript
// Test complete workflows
describe('Business Creation Workflow', () => {
  it('should create business and send invitation', async () => {
    // 1. Create business via API
    const result = await createBusiness(testData)
    expect(result.success).toBe(true)

    // 2. Verify business exists in database
    const business = await getBusinessById(result.data.business_id)
    expect(business.name).toBe(testData.name)

    // 3. Verify invitation was created
    const invitation = await getInvitationById(result.data.invitation_id)
    expect(invitation.email).toBe(testData.admin_email)

    // 4. Verify email was sent (check email service logs)
  })
})
```

### E2E Tests (Playwright)

```typescript
test('Platform admin can create business and invite admin', async ({ page }) => {
  // Login as platform admin
  await page.goto('/login')
  await page.fill('input[name=email]', 'marko+admin@velocci.me')
  await page.fill('input[name=password]', 'Password1*')
  await page.click('button[type=submit]')

  // Navigate to create business
  await page.goto('/businesses/new')

  // Fill form
  await page.fill('input[name=name]', 'Test Restaurant')
  await page.selectOption('select[name=business_type_id]', 'restaurant')
  // ... fill other fields

  // Submit
  await page.click('button[type=submit]')

  // Verify success
  await expect(page).toHaveURL(/\/businesses\/.+/)
  await expect(page.locator('h1')).toContainText('Test Restaurant')
})
```

---

## Monitoring & Observability

### Key Metrics to Track

1. **Business Creation**
   - Total businesses created
   - Creation success rate
   - Average creation time

2. **Invitations**
   - Invitations sent
   - Acceptance rate
   - Time to acceptance
   - Resend frequency

3. **Email Delivery**
   - Delivery rate
   - Open rate
   - Click rate
   - Bounce rate

4. **Database Performance**
   - Query execution time (p50, p95, p99)
   - RLS policy overhead
   - Connection pool usage

5. **API Performance**
   - Edge function response times
   - Error rates
   - Request volume

### Monitoring Setup

#### Supabase Dashboard

- Navigate to Supabase project dashboard
- Monitor database queries
- View function logs
- Check auth analytics

#### Custom Logging

```typescript
// Add structured logging to edge functions
function logEvent(event: string, data: any) {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    event,
    data,
  }))
}

// Usage
logEvent('business_created', {
  business_id: result.id,
  business_type: data.business_type_id,
  user_id: auth.user_id,
})
```

---

## Security Checklist

- [ ] RLS enabled on all tables
- [ ] RLS policies tested with different user roles
- [ ] Input validation on all edge functions
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (input sanitization)
- [ ] CSRF protection (SameSite cookies)
- [ ] Rate limiting configured
- [ ] Secrets stored securely (environment variables)
- [ ] Service role key never exposed to client
- [ ] Authentication required for all sensitive operations
- [ ] Authorization checks in all edge functions
- [ ] Email deliverability configured (SPF, DKIM, DMARC)
- [ ] Audit logging for sensitive operations

---

## Deployment Checklist

### Pre-Deployment

- [ ] All migrations tested locally
- [ ] Edge functions tested locally
- [ ] RLS policies verified
- [ ] Email delivery tested
- [ ] TypeScript types generated
- [ ] Frontend integration tested
- [ ] E2E tests passing

### Deployment

- [ ] Migrations applied to staging
- [ ] Edge functions deployed to staging
- [ ] Environment variables configured
- [ ] Platform admin created
- [ ] Smoke tests passed on staging

### Post-Deployment

- [ ] Migrations applied to production
- [ ] Edge functions deployed to production
- [ ] Production platform admin created
- [ ] Email delivery verified in production
- [ ] Monitoring dashboards configured
- [ ] Smoke tests passed on production
- [ ] Documentation updated

---

## Rollback Plan

### Database Rollback

```bash
# If migration fails, rollback
supabase db reset

# Apply previous migration
supabase db push --up-to PREVIOUS_MIGRATION_ID
```

### Function Rollback

```bash
# Deploy previous version
git checkout PREVIOUS_COMMIT
supabase functions deploy FUNCTION_NAME
```

---

## Common Issues & Solutions

### Issue: RLS blocks admin queries

**Symptom**: Platform admin cannot see all businesses

**Solution**: Verify `is_platform_admin()` function:
```sql
-- Test as admin user
SELECT is_platform_admin(); -- Should return true

-- Check platform_admins record
SELECT * FROM platform_admins WHERE user_id = auth.uid();
```

### Issue: Invitation email not received

**Symptom**: User doesn't receive invitation email

**Solution**:
1. Check email service logs in edge function
2. Verify Resend API key is correct
3. Check spam folder
4. Verify domain DNS records (SPF, DKIM)
5. Check invitation record was created:
   ```sql
   SELECT * FROM invitations WHERE email = 'user@example.com';
   ```

### Issue: Invitation link expired

**Symptom**: User clicks link but invitation is expired

**Solution**:
1. Check invitation expiry date
2. Resend invitation (creates new invitation)
3. Consider increasing expiry window if needed

---

## Next Steps (Phase 2)

Once Phase 1 is complete and stable:

1. **Guest User System**
   - Public registration
   - Guest profile management
   - Spending tracking

2. **Offers & Promotions**
   - Create/manage offers
   - Redemption system
   - Voucher validation

3. **Booking System**
   - Tour scheduling
   - Table reservations
   - Availability management

4. **Analytics Dashboard**
   - Business performance metrics
   - Guest engagement analytics
   - Revenue tracking

---

## Resources

### Documentation References
- [phase-1-database-schema.md](./phase-1-database-schema.md)
- [phase-1-rls-policies.md](./phase-1-rls-policies.md)
- [phase-1-seed-data.md](./phase-1-seed-data.md)
- [phase-1-email-templates.md](./phase-1-email-templates.md)
- [phase-1-edge-functions.md](./phase-1-edge-functions.md)

### External Resources
- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Resend Documentation](https://resend.com/docs)
- [Deno Documentation](https://deno.land/manual)

---

## Support

For questions or issues during implementation:
1. Review relevant specification documents
2. Check Supabase logs and error messages
3. Verify RLS policies and authorization
4. Test with curl or Postman before integrating with frontend
5. Check database constraints and foreign keys

---

## Conclusion

This implementation guide provides a comprehensive roadmap for building the Phase 1 backend. Follow the sequence carefully, test thoroughly, and refer to the detailed specification documents for each component.

**Key Success Factors:**
- ✅ Test early and often
- ✅ Verify RLS policies with different user roles
- ✅ Monitor email deliverability from the start
- ✅ Keep environment variables secure
- ✅ Document any deviations from the plan

Good luck with the implementation! 🚀
