# MNE Select - Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Start Supabase
```bash
cd /Users/markobabic/LocalDev/mne-select
supabase start
```

### Step 2: Start Edge Functions
```bash
supabase functions serve --no-verify-jwt
```

### Step 3: Access Services
- **Studio (Database UI)**: http://127.0.0.1:54323
- **API**: http://127.0.0.1:54321
- **Functions**: http://127.0.0.1:54321/functions/v1/
- **Mailpit (Emails)**: http://127.0.0.1:54324

---

## 🔐 Test Accounts

### Platform Admin
- **Email**: `marko+admin@velocci.me`
- **Password**: `Password1*`
- **Access**: All businesses, all features

### Restaurant Admin
- **Email**: `restaurant.admin@example.com`
- **Password**: `Test123!`
- **Business**: Adriatic Seafood Restaurant

### Gym Team Member
- **Email**: `gym.staff@example.com`
- **Password**: `Test123!`
- **Business**: FitLife Gym & Wellness

---

## 📡 API Endpoints

### Available Functions

1. **Create Business** (Platform Admin Only)
   ```bash
   POST /functions/v1/create-business
   ```

2. **Send Invitation** (Platform Admin OR Business Admin)
   ```bash
   POST /functions/v1/send-invitation
   ```

3. **Accept Invitation** (Public - No Auth)
   ```bash
   POST /functions/v1/accept-invitation
   ```

4. **List Invitations** (Platform Admin OR Business Admin)
   ```bash
   GET /functions/v1/list-business-invitations?business_id=xxx
   ```

---

## 🧪 Quick API Test

### 1. Login to Get Token
```bash
curl -X POST http://127.0.0.1:54321/auth/v1/token?grant_type=password \
  -H "apikey: sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "marko+admin@velocci.me",
    "password": "Password1*"
  }'
```

Copy the `access_token` from the response.

### 2. Create a Business
```bash
curl -X POST http://127.0.0.1:54321/functions/v1/create-business \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Test Business",
    "business_type_id": "GET_FROM_DATABASE",
    "address": {
      "address_line_1": "123 Main St",
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

## 📊 Database Access

### Via Supabase Studio
1. Open http://127.0.0.1:54323
2. Go to "Table Editor"
3. Browse all tables

### Via SQL Editor
1. Open http://127.0.0.1:54323
2. Go to "SQL Editor"
3. Run queries:

```sql
-- View all business types
SELECT * FROM business_types ORDER BY display_order;

-- View all businesses
SELECT 
  b.name,
  bt.name as type,
  b.status
FROM businesses b
JOIN business_types bt ON b.business_type_id = bt.id
WHERE b.deleted_at IS NULL;

-- View platform admins
SELECT * FROM platform_admins WHERE deleted_at IS NULL;

-- View invitations
SELECT 
  email,
  role,
  status,
  expires_at,
  created_at
FROM invitations
ORDER BY created_at DESC;
```

---

## 🛠️ Common Commands

### Database
```bash
# Reset database (DELETES ALL DATA)
supabase db reset

# Re-run migrations
supabase db push

# View database status
supabase status
```

### Functions
```bash
# Serve functions locally
supabase functions serve --no-verify-jwt

# View function logs
supabase functions logs create-business --tail

# Deploy a function (to remote)
supabase functions deploy create-business
```

### Services
```bash
# Stop all Supabase services
supabase stop

# Start Supabase services
supabase start

# View service status
supabase status
```

---

## 📁 Important Files

### Configuration
- `.env` - Environment variables (LOCAL ONLY - not in git)
- `supabase/config.toml` - Supabase configuration

### Database
- `supabase/migrations/` - Database schema migrations
- `supabase/seed.sql` - Development seed data
- `supabase/seed-production.sql` - Production seed data

### Functions
- `supabase/functions/_shared/` - Shared utilities
- `supabase/functions/create-business/` - Create business function
- `supabase/functions/send-invitation/` - Send invitation function
- `supabase/functions/accept-invitation/` - Accept invitation function
- `supabase/functions/list-business-invitations/` - List invitations function

### Documentation
- `docs/backend/PHASE-1-COMPLETE.md` - Full implementation guide
- `docs/backend/AI-AGENT-PROMPTS.md` - Agent implementation prompts
- `docs/backend/phase-1-*.md` - Detailed specifications

---

## 🎯 What's Implemented

✅ **Database Foundation**
- 6 core tables with RLS security
- Multi-tenant data isolation
- Soft delete support

✅ **Email System**
- SendGrid integration
- 3 email templates (HTML + text)
- Invitation emails

✅ **Edge Functions (APIs)**
- Create business endpoint
- Send/resend invitations
- Accept invitations
- List invitations

✅ **Seed Data**
- 12 business types
- Platform admin account
- 2 test businesses
- Test users

---

## 🆘 Need Help?

### Check Logs
```bash
# View all Supabase logs
supabase logs

# View function logs
supabase functions logs FUNCTION_NAME --tail
```

### Verify Setup
```bash
# Check Docker is running
docker ps

# Check Supabase is running
supabase status

# Check environment variables
cat .env
```

### Reset Everything
```bash
# Stop services
supabase stop

# Start fresh
supabase start

# Reset database
supabase db reset
```

---

## 📚 Full Documentation

- [Phase 1 Complete Guide](./docs/backend/PHASE-1-COMPLETE.md)
- [Database Schema](./docs/backend/phase-1-database-schema.md)
- [RLS Policies](./docs/backend/phase-1-rls-policies.md)
- [Edge Functions](./docs/backend/phase-1-edge-functions.md)
- [Implementation Guide](./docs/backend/phase-1-implementation-guide.md)

---

**Ready to go!** 🚀

Start with Step 1 above and you'll be up and running in minutes.
