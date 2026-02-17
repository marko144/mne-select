# Notion Waitlist Integration Setup Guide

This guide walks you through connecting the Montenegro Select email waitlist form to your Notion database.

---

## Prerequisites

- [ ] Notion account (free or paid)
- [ ] Notion database created for waitlist
- [ ] Development server access to the guests app

---

## Step 1: Create Notion Integration

1. **Go to Notion Integrations page:**
   - Visit: https://www.notion.so/my-integrations
   - Or: Notion → Settings & Members → Integrations → Develop your own integrations

2. **Create New Integration:**
   - Click "New integration"
   - **Name**: `Montenegro Select Waitlist`
   - **Associated workspace**: Select your workspace
   - **Type**: Internal integration
   - Click "Submit"

3. **Copy the Integration Secret:**
   - After creation, you'll see an "Internal Integration Secret"
   - Click "Show" and copy this key
   - Format: `secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - **Keep this secret safe!**

---

## Step 2: Set Up Notion Database

### Option A: Create New Database

1. **Create a new page in Notion**
2. **Add a Database** (type `/database` and select "Table")
3. **Name it**: "Montenegro Select Waitlist"
4. **Add these properties:**

   | Property Name | Type | Description |
   |---------------|------|-------------|
   | **Email** | Email | Primary email address |
   | **Status** | Select | Options: Pending, Contacted, Joined |
   | **Submitted At** | Date | When they joined waitlist |
   | **Source** | Select | Options: Landing Page, Other |
   | **Name** (optional) | Text | For future use |

5. **Set Email as Title:**
   - Click on "Name" property → Rename to "Email"
   - Or keep Name and add Email as a separate Email property

### Option B: Use Existing Database

If you already have a database:
- Ensure it has an **Email** property (type: Email)
- Add other properties listed above if desired
- The API will adapt to your schema

---

## Step 3: Connect Database to Integration

1. **Open your Notion database page**
2. **Click the `•••` menu** (top right)
3. **Select "Connections"** (or "Add connections")
4. **Find and select**: `Montenegro Select Waitlist` (your integration)
5. **Click "Confirm"**

✅ Your integration can now read/write to this database.

---

## Step 4: Get Database ID

1. **Open your Notion database** in your browser
2. **Copy the URL** - it looks like:
   ```
   https://www.notion.so/your-workspace-name/DATABASE_ID?v=VIEW_ID
   ```
3. **Extract the DATABASE_ID** - it's the part between the last `/` and `?`
   - Format: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` (32 characters, no dashes)
   - Example: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`

**Alternative method:**
1. Click "Share" on your database
2. Click "Copy link"
3. Extract the ID from the copied URL

---

## Step 5: Configure Environment Variables

1. **Open your `.env.local` file:**
   ```bash
   apps/guests/.env.local
   ```

2. **Add your Notion credentials:**
   ```env
   # Notion Configuration (for waitlist email capture)
   NOTION_API_KEY=secret_xxxxxxxxxxxxxxxxxxxxxxxxxx
   NOTION_WAITLIST_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

3. **Replace the values:**
   - `NOTION_API_KEY`: Your integration secret from Step 1
   - `NOTION_WAITLIST_DATABASE_ID`: Your database ID from Step 4

4. **Save the file**

---

## Step 6: Restart Development Server

```bash
# Stop the current dev server (Ctrl+C)
# Then restart:
cd apps/guests
pnpm dev
```

**Important**: Next.js only reads `.env.local` on server startup, so you MUST restart after adding these variables.

---

## Step 7: Test the Integration

1. **Open the landing page** in your browser
2. **Open browser console** (F12 or Cmd+Option+I)
3. **Enter an email** in the waitlist form
4. **Click "Request Early Access"**
5. **Watch the console** for logs:
   ```
   ✅ Email submitted successfully: test@example.com
   ```
6. **Check your Notion database** - the email should appear as a new entry!

---

## Troubleshooting

### Error: "Notion integration not configured"

**Problem**: `NOTION_API_KEY` not set or not loaded

**Fix:**
1. Check `.env.local` has `NOTION_API_KEY=secret_...`
2. Restart dev server
3. Try again

### Error: "Database not configured"

**Problem**: `NOTION_WAITLIST_DATABASE_ID` not set or invalid

**Fix:**
1. Double-check database ID is correct (32 characters, no dashes)
2. Ensure `.env.local` has this variable
3. Restart dev server

### Error: "object_not_found" or "Could not find database"

**Problem**: Integration doesn't have access to database

**Fix:**
1. Go to your Notion database
2. Click `•••` → Connections
3. Add your integration
4. Try again

### Error: "validation_error" or property errors

**Problem**: Database properties don't match the API expectations

**Fix:** Update the API route `/app/api/waitlist/route.ts` properties to match your database schema:

```typescript
properties: {
  // Change these to match YOUR database property names
  'Your Email Property Name': {
    email: email,
  },
  'Your Status Property Name': {
    select: { name: 'Pending' },
  },
  // etc.
}
```

### Email appears but properties are empty

**Problem**: Property names in code don't match Notion database

**Fix:**
1. Open your Notion database
2. Note the EXACT names of your properties (case-sensitive!)
3. Update the API route to use those exact names

---

## Database Schema Reference

Your Notion database should have these properties (names can vary, but types must match):

```
┌─────────────────┬───────────┬──────────────────────────┐
│ Property Name   │ Type      │ Example Value            │
├─────────────────┼───────────┼──────────────────────────┤
│ Email           │ Email     │ john@example.com         │
│ Status          │ Select    │ Pending/Contacted/Joined │
│ Submitted At    │ Date      │ 2026-02-13               │
│ Source          │ Select    │ Landing Page             │
│ Name (optional) │ Text      │ John Doe                 │
└─────────────────┴───────────┴──────────────────────────┘
```

---

## Security Notes

⚠️ **Important Security Considerations:**

1. **Never commit `.env.local`** to git (it's already in `.gitignore`)
2. **Keep your Integration Secret private** - it has write access to your database
3. **Use rate limiting** in production to prevent spam (add later)
4. **Validate email on server side** (already implemented)
5. **Consider adding reCAPTCHA** for production to prevent bots

---

## Production Deployment

When deploying to Vercel (or other platforms):

1. **Add environment variables** to your deployment platform:
   - `NOTION_API_KEY`
   - `NOTION_WAITLIST_DATABASE_ID`

2. **In Vercel:**
   - Go to Project Settings → Environment Variables
   - Add both variables
   - Set for: Production, Preview, Development
   - Save and redeploy

3. **Test on production URL** before launching

---

## API Endpoint Reference

**Endpoint**: `POST /api/waitlist`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Successfully joined waitlist",
  "id": "notion-page-id"
}
```

**Error Response (400/500):**
```json
{
  "error": "Error message here"
}
```

---

## Current Implementation Status

✅ **Completed:**
- [x] Notion SDK installed (`@notionhq/client`)
- [x] API route created (`/app/api/waitlist/route.ts`)
- [x] EmailCaptureForm updated to call API
- [x] Email validation (client + server side)
- [x] Error handling
- [x] Loading states
- [x] Success feedback

⏳ **You Need to Configure:**
- [ ] Create Notion integration
- [ ] Set up Notion database
- [ ] Add environment variables
- [ ] Restart dev server
- [ ] Test the integration

---

## Quick Setup Checklist

```bash
# 1. Create Notion integration at https://www.notion.so/my-integrations
# 2. Copy integration secret

# 3. Create/find your database and get its ID

# 4. Connect integration to database (click ••• → Connections)

# 5. Add to .env.local:
NOTION_API_KEY=secret_your_key_here
NOTION_WAITLIST_DATABASE_ID=your_database_id_here

# 6. Restart server:
pnpm dev:guests

# 7. Test by submitting an email!
```

---

## Support

If you encounter issues:
- Check browser console for error messages
- Check server terminal for API errors
- Verify property names match your database
- Ensure integration has database access

**Notion API Documentation**: https://developers.notion.com/

---

**Ready to go!** Follow the steps above and the waitlist form will automatically save emails to your Notion database.
