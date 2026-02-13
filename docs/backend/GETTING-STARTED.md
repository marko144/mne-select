# Getting Started - Phase 1 Backend Implementation

## 🚀 Quick Start Checklist

Follow this checklist to get your development environment ready for Phase 1 implementation.

### ☐ Step 1: Prerequisites (30 minutes)

#### Install Docker Desktop
- [ ] Download from [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/)
- [ ] Install and launch Docker Desktop
- [ ] Verify: `docker --version` shows version 24.x or higher
- [ ] Docker whale icon appears in menu bar

#### Install Supabase CLI
- [ ] Run: `brew install supabase/tap/supabase`
- [ ] Verify: `supabase --version` shows version 1.x or higher

#### Verify Node.js & pnpm
- [ ] Run: `node --version` (should be v18+ or v20+)
- [ ] Run: `pnpm --version` (should be 8.x or higher)

---

### ☐ Step 2: Initialize Supabase (5 minutes)

```bash
# Navigate to project root
cd /Users/markobabic/LocalDev/mne-select

# Initialize Supabase (creates supabase/ folder)
supabase init

# Start Supabase (first time takes 2-3 minutes)
supabase start
```

**Checklist:**
- [ ] `supabase/` folder created with `config.toml`
- [ ] Docker containers running (verify with `docker ps`)
- [ ] Can access Supabase Studio at http://localhost:54323
- [ ] Received API URL, anon key, and service_role key

---

### ☐ Step 3: Environment Configuration (5 minutes)

#### Create `.env` file
- [ ] Create `.env` in project root
- [ ] Add Supabase local credentials (from `supabase start` output)
- [ ] Add SendGrid API key: `sendgrid_key=SG.xxx`
- [ ] Add email configuration (see template below)
- [ ] Verify `.env` is in `.gitignore`

**Template:**
```bash
# Supabase Local
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=<from supabase start output>
SUPABASE_SERVICE_ROLE_KEY=<from supabase start output>

# SendGrid
sendgrid_key=SG.xxxxxxxxxxxxxxxxxxxxxxxx.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Email
EMAIL_FROM_ADDRESS=noreply@montenegroselect.me
EMAIL_REPLY_TO=support@montenegroselect.me

# URLs
PORTAL_APP_URL=http://localhost:3000
SUPPORT_URL=https://montenegroselect.me/support
TERMS_URL=https://montenegroselect.me/terms
PRIVACY_URL=https://montenegroselect.me/privacy
```

---

### ☐ Step 4: Verify Setup (2 minutes)

```bash
# Check Docker containers
docker ps
# Should show: supabase_db, supabase_auth, supabase_studio, etc.

# Check Supabase status
supabase status
# Should show: All services running

# Access Studio
open http://localhost:54323
# Should open Supabase Studio UI

# Access Inbucket (email testing)
open http://localhost:54324
# Should open Inbucket email interface
```

**Checklist:**
- [ ] Docker shows 8+ Supabase containers running
- [ ] `supabase status` shows all services running
- [ ] Can access Supabase Studio in browser
- [ ] Can access Inbucket (email testing) in browser

---

## 📚 What to Read Next

Now that your environment is set up, read these documents in order:

### 1. Overview & Context
- [ ] [PHASE-1-README.md](./PHASE-1-README.md) - Project overview and scope

### 2. Implementation Prompts
- [ ] [AI-AGENT-PROMPTS.md](./AI-AGENT-PROMPTS.md) - Ready-to-use prompts for implementation

### 3. Technical Specifications (as needed)
- [ ] [phase-1-database-schema.md](./phase-1-database-schema.md) - Database design
- [ ] [phase-1-rls-policies.md](./phase-1-rls-policies.md) - Security policies
- [ ] [phase-1-seed-data.md](./phase-1-seed-data.md) - Initial data
- [ ] [SENDGRID-SETUP.md](./SENDGRID-SETUP.md) - Email configuration
- [ ] [phase-1-email-templates.md](./phase-1-email-templates.md) - Email templates
- [ ] [phase-1-edge-functions.md](./phase-1-edge-functions.md) - API endpoints

---

## 🎯 Your First Task

Once setup is complete, start with:

**Session 1A: Database Schema Implementation**

Use the prompt from [AI-AGENT-PROMPTS.md](./AI-AGENT-PROMPTS.md) → Session 1A

This will guide you through:
1. Creating database migrations
2. Implementing tables, indexes, constraints
3. Testing the schema locally

---

## 📝 TypeScript Type Generation (Important!)

### When to Regenerate Types

**ALWAYS run after these changes:**
```bash
supabase gen types typescript --local > packages/shared-types/src/database.types.ts
```

✅ **Run AFTER:**
- Creating new tables
- Adding/removing columns
- Changing column types
- Adding/removing enums
- Creating/modifying views
- Running `supabase db reset`

❌ **NOT needed after:**
- Inserting/updating/deleting data (seed data, test data)
- Changing RLS policies
- Adding/removing indexes
- Modifying helper functions

### What Happens If You Forget?

**Symptom:** TypeScript errors in frontend even though query works
```typescript
// Database has 'phone' column but types don't
const { data } = await supabase
  .from('businesses')
  .select('phone')  // ❌ TypeScript error: Property doesn't exist
```

**Solution:** Regenerate types
```bash
supabase gen types typescript --local > packages/shared-types/src/database.types.ts
```

---

## 🔄 Daily Development Workflow

### Starting Work
```bash
# 1. Start Docker Desktop (if not already running)

# 2. Start Supabase
supabase start  # Takes ~10 seconds

# 3. Start Next.js apps
pnpm dev
```

**Your apps:**
- Portal: http://localhost:3000
- Guests: http://localhost:3001
- Supabase Studio: http://localhost:54323
- Email Testing: http://localhost:54324

### Ending Work
```bash
# Stop Supabase (keeps data)
supabase stop

# Or leave it running (uses ~2GB RAM)
```

---

## 🛠️ Common Commands

### Database Operations
```bash
# Apply migrations
supabase db push

# Generate TypeScript types (RUN AFTER EVERY SCHEMA CHANGE!)
supabase gen types typescript --local > packages/shared-types/src/database.types.ts

# Apply migration + generate types (combined)
supabase db push && supabase gen types typescript --local > packages/shared-types/src/database.types.ts

# Reset database (fresh start)
supabase db reset

# Access database with psql
supabase db psql
```

### Helper Scripts (Recommended)

Add these to your `package.json` for easier workflow:

```json
{
  "scripts": {
    "db:push": "supabase db push",
    "db:types": "supabase gen types typescript --local > packages/shared-types/src/database.types.ts",
    "db:migrate": "pnpm db:push && pnpm db:types",
    "db:reset": "supabase db reset && pnpm db:types"
  }
}
```

**Usage:**
```bash
# After creating/modifying a migration:
pnpm db:migrate  # Applies migration AND generates types

# Fresh database start:
pnpm db:reset    # Resets DB AND generates types
```

### Edge Functions
```bash
# Create new function
supabase functions new function-name

# Serve functions locally
supabase functions serve

# View function logs
supabase functions logs
```

### Troubleshooting
```bash
# Check service status
supabase status

# View logs
supabase logs

# Restart everything
supabase stop
supabase start
```

---

## 🆘 Troubleshooting

### Docker Issues

**Problem:** Docker not running
```
Error: Cannot connect to Docker daemon
```
**Solution:** Start Docker Desktop app

---

**Problem:** Port already in use
```
Error: Port 54321 is already allocated
```
**Solution:**
```bash
# Find what's using the port
lsof -i :54321

# Stop Supabase and try again
supabase stop
supabase start
```

---

**Problem:** Out of disk space
```
Error: No space left on device
```
**Solution:**
```bash
# Clean Docker
docker system prune -a

# Remove old Supabase data
supabase stop --no-backup
```

---

### Supabase Issues

**Problem:** Can't connect to database
```
Error: Connection refused
```
**Solution:**
```bash
# Restart Supabase
supabase stop
supabase start

# Check containers are running
docker ps | grep supabase
```

---

**Problem:** Migrations fail
```
Error: Migration failed
```
**Solution:**
```bash
# Check migration SQL for errors
cat supabase/migrations/YYYYMMDDHHMMSS_migration_name.sql

# Reset database and try again
supabase db reset
supabase db push
```

---

## ✅ Setup Complete!

You're ready to start implementing Phase 1! 🎉

**Next Steps:**
1. ✅ Read [AI-AGENT-PROMPTS.md](./AI-AGENT-PROMPTS.md)
2. ✅ Start with Session 1A: Database Schema
3. ✅ Follow the implementation sequence
4. ✅ Test everything locally before deploying

---

## 📞 Need Help?

- **Supabase Docs**: https://supabase.com/docs
- **Docker Docs**: https://docs.docker.com/
- **Project Architecture**: [../ARCHITECTURE.md](../ARCHITECTURE.md)
- **Implementation Guide**: [phase-1-implementation-guide.md](./phase-1-implementation-guide.md)

---

**Last Updated:** 2026-02-12
