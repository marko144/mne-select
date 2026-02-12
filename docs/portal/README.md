# Portal App Documentation

## Overview

The Portal app is an invite-only business management platform where business owners and administrators can manage their presence on MNE Select.

## Access

- **URL**: https://portal.mne-select.com (production)
- **Local**: http://localhost:3000
- **Authentication**: Invitation-based only

## Features

### Planned Feature Areas

#### Admin
- User management
- Business approvals
- System configuration
- Analytics dashboard

#### Restaurants
- Menu management
- Reservations
- Reviews
- Photos/gallery

#### Gyms
- Class schedules
- Membership management
- Trainer profiles
- Equipment inventory

#### Other Business Types
- Spas
- Hotels
- Activities
- Tours

## User Flows

### Invitation & Registration

1. Admin sends invitation via Portal
2. User receives email with invitation link
3. User clicks link (includes token in URL)
4. User fills registration form
5. System validates token
6. Account created with pre-assigned role
7. User redirected to Portal dashboard

### Daily Usage

1. User logs in with email/password
2. Dashboard shows relevant metrics
3. User navigates to feature area (e.g., Restaurants)
4. User performs CRUD operations
5. Changes sync to database
6. Guest app reflects updates in real-time

## Project Structure

```
apps/portal/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth routes (login, register)
│   ├── (dashboard)/       # Protected dashboard routes
│   │   ├── admin/
│   │   ├── restaurants/
│   │   ├── gyms/
│   │   └── ...
│   ├── layout.tsx
│   └── page.tsx
│
├── components/            # App-specific components
│   ├── Navigation/
│   ├── Dashboard/
│   └── ...
│
├── features/             # Feature modules
│   ├── admin/
│   ├── restaurants/
│   ├── gyms/
│   └── ...
│
├── lib/                  # App-specific utilities
│   ├── api.ts
│   └── hooks/
│
└── middleware.ts         # Route protection
```

## Authentication

### Protected Routes

Use Next.js middleware to protect routes:

```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const supabase = createServerClient(...)
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*']
}
```

## Role-Based Access Control

Different user roles have different permissions:

```typescript
// Check user role
const { data: user } = await supabase.auth.getUser()
const role = user?.user_metadata?.role

if (role === 'admin') {
  // Show admin features
} else if (role === 'business_owner') {
  // Show business management features
}
```

## Shared Components

Import from `@mne-select/ui`:

```typescript
import { Button, Card } from '@mne-select/ui'

export function MyComponent() {
  return (
    <Card>
      <h2>Business Dashboard</h2>
      <Button variant="primary">Save Changes</Button>
    </Card>
  )
}
```

## Environment Variables

Required in `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
NEXT_PUBLIC_API_URL=https://api.mne-select.com
NEXT_PUBLIC_PORTAL_URL=http://localhost:3000
NEXT_PUBLIC_GUESTS_URL=http://localhost:3001
```

## Development

```bash
# Start portal app only
pnpm dev:portal

# Build for production
pnpm build:portal

# Type check
pnpm type-check

# Lint
pnpm lint
```

## Deployment

### Vercel Configuration

1. Create new Vercel project
2. Set root directory to `apps/portal`
3. Set build command: `cd ../.. && pnpm turbo build --filter=portal`
4. Set output directory: `.next`
5. Add environment variables

### Build Settings

```json
{
  "buildCommand": "cd ../.. && pnpm turbo build --filter=portal",
  "outputDirectory": ".next",
  "installCommand": "pnpm install",
  "framework": "nextjs"
}
```

## Best Practices

1. **Use middleware for auth** - Don't check auth in every component
2. **Leverage shared packages** - Import from `@mne-select/*`
3. **Feature-based structure** - Organize by business feature, not file type
4. **Type safety** - Use TypeScript types from `@mne-select/shared-types`
5. **Responsive design** - Use Tailwind breakpoints
6. **Accessibility** - Follow WCAG guidelines
7. **Error handling** - Show user-friendly error messages

## Common Tasks

### Adding a New Feature Area

1. Create folder in `features/[feature-name]/`
2. Add route in `app/(dashboard)/[feature-name]/`
3. Add navigation link
4. Implement CRUD operations
5. Add RLS policies in Supabase

### Creating a New Page

```typescript
// app/(dashboard)/restaurants/page.tsx
import { RestaurantList } from '@/features/restaurants/RestaurantList'

export default function RestaurantsPage() {
  return (
    <div>
      <h1>Restaurant Management</h1>
      <RestaurantList />
    </div>
  )
}
```

### Fetching Data

```typescript
'use client'

import { supabase } from '@mne-select/supabase-client'
import { useEffect, useState } from 'react'

export function RestaurantList() {
  const [restaurants, setRestaurants] = useState([])

  useEffect(() => {
    async function fetchRestaurants() {
      const { data } = await supabase
        .from('businesses')
        .select('*')
        .eq('type', 'restaurant')
      
      setRestaurants(data || [])
    }
    
    fetchRestaurants()
  }, [])

  return <div>{/* Render restaurants */}</div>
}
```

## Testing

### Manual Testing Checklist

- [ ] Invitation flow works end-to-end
- [ ] Protected routes redirect to login
- [ ] CRUD operations save correctly
- [ ] Changes reflect in Guests app
- [ ] Mobile responsive
- [ ] Accessibility (keyboard navigation, screen readers)

## Troubleshooting

### Common Issues

1. **401 Unauthorized**: Check if user is logged in and token is valid
2. **403 Forbidden**: Check RLS policies in Supabase
3. **Build errors**: Ensure all shared packages are built first
4. **Hydration errors**: Check server/client component boundaries

## Further Reading

- [Next.js App Router](https://nextjs.org/docs/app)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Tailwind CSS](https://tailwindcss.com/docs)
