# Backend Documentation

## Overview

The MNE Select backend is powered by Supabase, providing database, authentication, real-time subscriptions, and serverless functions.

## Architecture

- **Database**: PostgreSQL 15 with Row-Level Security (RLS)
- **Authentication**: Supabase Auth (JWT-based)
- **Functions**: Supabase Edge Functions (Deno runtime)
- **Storage**: Supabase Storage (for user uploads)
- **Real-time**: WebSocket connections for live updates

## Database Schema

### Core Tables

#### `users` (extended from auth.users)
- User profile information
- Links to auth.users via foreign key
- Contains additional metadata

#### `businesses`
- Business listings
- Owner reference
- Business type (restaurant, gym, spa, etc.)
- Status (active, pending, suspended)

#### `invitations`
- Portal user invitations
- Token-based validation
- Expiration tracking
- Status (pending, accepted, expired, revoked)

### Example Schema

```sql
-- businesses table
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  cover_image_url TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  status TEXT DEFAULT 'pending',
  owner_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- invitations table
CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  business_id UUID REFERENCES businesses(id),
  token TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending',
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Row-Level Security (RLS)

RLS policies control data access at the database level.

### Example Policies

```sql
-- Users can read their own businesses
CREATE POLICY "Users can view own businesses"
  ON businesses FOR SELECT
  USING (auth.uid() = owner_id);

-- Only admins can create invitations
CREATE POLICY "Admins can create invitations"
  ON invitations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
```

## Edge Functions

Supabase Edge Functions run on Deno Deploy and can:
- Process complex business logic
- Integrate with AWS services
- Send emails and notifications
- Process webhooks

### Example Function Structure

```typescript
// supabase/functions/example-function/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const { data } = await req.json()
    
    // Process request
    const result = await processData(data)
    
    return new Response(
      JSON.stringify({ success: true, result }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
```

## Authentication

### JWT Structure

Supabase issues JWTs with the following claims:
- `sub`: User ID
- `email`: User email
- `role`: Database role (authenticated, anon)
- `user_metadata`: Custom user data
- `app_metadata`: System metadata (role, etc.)

### Custom Claims

Add custom data during signup:

```typescript
const { data } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      role: 'business_owner',
      businessId: 'xxx',
    }
  }
})
```

## API Endpoints

### REST API

Supabase auto-generates REST endpoints:

```
GET    /rest/v1/businesses
POST   /rest/v1/businesses
PATCH  /rest/v1/businesses?id=eq.xxx
DELETE /rest/v1/businesses?id=eq.xxx
```

### Edge Functions

Custom endpoints:

```
POST /functions/v1/invite-user
POST /functions/v1/upload-to-s3
POST /functions/v1/process-booking
```

## Real-time Subscriptions

Subscribe to database changes:

```typescript
const subscription = supabase
  .channel('businesses')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'businesses' },
    (payload) => {
      console.log('Change received!', payload)
    }
  )
  .subscribe()
```

## AWS Integration

Edge functions can integrate with AWS services:

```typescript
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

const s3Client = new S3Client({
  region: Deno.env.get('AWS_REGION'),
  credentials: {
    accessKeyId: Deno.env.get('AWS_ACCESS_KEY_ID')!,
    secretAccessKey: Deno.env.get('AWS_SECRET_ACCESS_KEY')!,
  },
})

// Upload to S3
await s3Client.send(new PutObjectCommand({
  Bucket: 'your-bucket',
  Key: 'path/to/file',
  Body: fileData,
}))
```

## Environment Variables

Required environment variables for edge functions:

```bash
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxx
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_REGION=us-east-1
AWS_S3_BUCKET=xxx
```

## Development Commands

```bash
# Start Supabase locally
supabase start

# Create migration
supabase migration new migration_name

# Apply migrations
supabase db push

# Reset database
supabase db reset

# Generate types
supabase gen types typescript --local > ../packages/shared-types/src/database.types.ts

# Create edge function
supabase functions new function-name

# Serve function locally
supabase functions serve function-name

# Deploy function
supabase functions deploy function-name

# View function logs
supabase functions logs function-name --tail
```

## Best Practices

1. **Always use RLS policies** - Never rely solely on client-side security
2. **Validate input** - Check all data in edge functions
3. **Use prepared statements** - Prevent SQL injection
4. **Keep secrets secure** - Use environment variables
5. **Add indexes** - Optimize query performance
6. **Monitor logs** - Watch for errors and slow queries
7. **Version migrations** - Never edit applied migrations
8. **Test locally first** - Use `supabase start` before deploying

## Security Checklist

- [ ] RLS policies enabled on all tables
- [ ] Service role key kept secure (server-side only)
- [ ] Input validation in all functions
- [ ] Rate limiting configured
- [ ] Audit logging for sensitive operations
- [ ] Database backups configured
- [ ] SSL/TLS enforced
- [ ] CORS properly configured

## Troubleshooting

### Common Issues

1. **RLS blocking queries**: Check policies match your use case
2. **Function timeout**: Optimize slow operations
3. **CORS errors**: Configure allowed origins
4. **Type mismatches**: Regenerate database types

## Further Reading

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL RLS](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Deno Deploy](https://deno.com/deploy/docs)
