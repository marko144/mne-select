# Supabase Backend

This directory contains the Supabase configuration, database migrations, and edge functions for MNE Select.

## Getting Started

### Prerequisites

Install the Supabase CLI:

```bash
brew install supabase/tap/supabase
# or
npm install -g supabase
```

### Link to Your Project

```bash
supabase link --project-ref your-project-ref
```

### Local Development

Start Supabase locally:

```bash
supabase start
```

This will start all Supabase services locally:
- PostgreSQL database
- Auth server
- Storage
- Realtime
- Studio (web interface)

### Database Migrations

Create a new migration:

```bash
supabase migration new migration_name
```

Apply migrations:

```bash
supabase db push
```

### Edge Functions

Create a new edge function:

```bash
supabase functions new function-name
```

Deploy functions:

```bash
supabase functions deploy function-name
```

## Structure

```
supabase/
├── config.toml          # Supabase configuration
├── migrations/          # Database migrations
├── functions/           # Edge functions (Deno)
├── seed.sql            # Seed data for development
└── README.md           # This file
```

## Useful Commands

```bash
# Start local Supabase
supabase start

# Stop local Supabase
supabase stop

# Reset database (WARNING: deletes all data)
supabase db reset

# Generate TypeScript types from database
supabase gen types typescript --local > ../packages/shared-types/src/database.types.ts

# View logs
supabase functions logs function-name

# Test edge function locally
supabase functions serve function-name
```

## Environment Variables

Required environment variables are in `.env.example` at the root of the project.

## More Information

See the main documentation in `/docs/backend/` for detailed backend architecture and API documentation.
