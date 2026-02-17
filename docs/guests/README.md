# Guests App Documentation

## Overview

The Guests app is the public-facing application where users can discover and book experiences in Montenegro. This app allows self-registration and is optimized for discoverability and user experience.

## Access

- **URL**: https://mne-select.com (production)
- **Local**: http://localhost:3001
- **Authentication**: Public sign-up (optional for browsing)

## Features

### Planned Feature Areas

#### Discovery
- Browse businesses by category
- Search and filtering
- Maps integration
- Featured listings

#### Restaurants
- Browse menus
- Make reservations
- Read reviews
- View photos

#### Gyms
- View class schedules
- Book classes
- Browse membership plans
- See trainer profiles

#### Bookings
- Reservation management
- Booking history
- Cancellations
- Reminders

#### User Profile
- Account settings
- Saved favorites
- Booking history
- Reviews written

## User Flows

### Discovery (No Account)

1. User visits site
2. Browses categories
3. Views business listings
4. Clicks on business for details
5. Prompted to create account for booking

### Registration

1. User clicks "Sign Up"
2. Fills email/password form
3. Receives verification email
4. Clicks verification link
5. Account activated
6. User redirected to dashboard

### Booking Flow

1. User searches for experience
2. Selects date/time/options
3. Reviews booking details
4. Confirms and pays (if required)
5. Receives confirmation email
6. Booking appears in user's dashboard

## Project Structure

```
apps/guests/
├── app/                    # Next.js App Router
│   ├── (marketing)/       # Public pages (no auth)
│   │   ├── page.tsx       # Homepage
│   │   ├── restaurants/
│   │   ├── gyms/
│   │   └── ...
│   ├── (auth)/            # Auth routes
│   │   ├── login/
│   │   ├── register/
│   │   └── verify/
│   ├── (dashboard)/       # Protected user dashboard
│   │   ├── bookings/
│   │   ├── profile/
│   │   └── favorites/
│   ├── layout.tsx
│   └── page.tsx
│
├── components/            # App-specific components
│   ├── Header/
│   ├── Footer/
│   ├── SearchBar/
│   └── ...
│
├── features/             # Feature modules
│   ├── discovery/
│   ├── restaurants/
│   ├── gyms/
│   ├── bookings/
│   └── ...
│
└── lib/                  # App-specific utilities
    ├── api.ts
    └── hooks/
```

## Authentication

### Optional Authentication

Most pages are public, but some require login:

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  
  // Protected paths
  const protectedPaths = ['/dashboard', '/bookings', '/profile']
  
  if (protectedPaths.some(p => path.startsWith(p))) {
    // Check auth
  }
  
  return NextResponse.next()
}
```

### Public Sign-up

```typescript
import { publicSignUp } from '@mne-select/auth'
import { supabase } from '@mne-select/supabase-client'

async function handleSignUp(email: string, password: string) {
  const data = await publicSignUp(supabase, {
    email,
    password,
    metadata: {
      accountType: 'guest'
    }
  })
  
  // Show success message
  alert('Check your email to verify your account!')
}
```

## SEO Optimization

### Metadata

```typescript
// app/restaurants/[id]/page.tsx
import type { Metadata } from 'next'

export async function generateMetadata({ params }): Promise<Metadata> {
  const restaurant = await getRestaurant(params.id)
  
  return {
    title: `${restaurant.name} - MNE Select`,
    description: restaurant.description,
    openGraph: {
      images: [restaurant.coverImageUrl],
    },
  }
}
```

### Server-Side Rendering

Use server components for SEO:

```typescript
// Server Component (default)
async function RestaurantPage({ params }) {
  const restaurant = await getRestaurant(params.id)
  
  return (
    <div>
      <h1>{restaurant.name}</h1>
      <p>{restaurant.description}</p>
    </div>
  )
}
```

## Shared Components

```typescript
import { Button, Card } from '@mne-select/ui'

export function BusinessCard({ business }) {
  return (
    <Card>
      <img src={business.logoUrl} alt={business.name} />
      <h3>{business.name}</h3>
      <p>{business.description}</p>
      <Button>View Details</Button>
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
NEXT_PUBLIC_GUESTS_URL=http://localhost:3001
```

## Development

```bash
# Start guests app only
pnpm dev:guests

# Build for production
pnpm build:guests

# Type check
pnpm type-check

# Lint
pnpm lint
```

## Deployment

### Vercel Configuration

1. Create new Vercel project
2. Set root directory to `apps/guests`
3. Set build command: `cd ../.. && pnpm turbo build --filter=guests`
4. Set output directory: `.next`
5. Add environment variables

### Build Settings

```json
{
  "buildCommand": "cd ../.. && pnpm turbo build --filter=guests",
  "outputDirectory": ".next",
  "installCommand": "pnpm install",
  "framework": "nextjs"
}
```

## Performance Optimization

### Image Optimization

```typescript
import Image from 'next/image'

<Image
  src={business.coverImageUrl}
  alt={business.name}
  width={800}
  height={400}
  priority={isAboveFold}
/>
```

### Lazy Loading

```typescript
import dynamic from 'next/dynamic'

const Map = dynamic(() => import('./Map'), {
  loading: () => <p>Loading map...</p>,
  ssr: false
})
```

## Best Practices

1. **Optimize for SEO** - Use server components, metadata, structured data
2. **Progressive enhancement** - Work without JavaScript where possible
3. **Mobile-first** - Design for mobile, enhance for desktop
4. **Fast page loads** - Optimize images, lazy load components
5. **Accessibility** - WCAG AA compliance minimum
6. **Error boundaries** - Graceful error handling
7. **Analytics** - Track user behavior for insights

## Common Tasks

### Adding a Business Category Page

1. Create route in `app/(marketing)/[category]/`
2. Fetch businesses of that type
3. Implement filtering/search
4. Add category to navigation

### Creating a Booking Flow

1. Add booking form component
2. Validate availability
3. Process payment (if required)
4. Create booking in database
5. Send confirmation email
6. Update user's booking list

### Fetching and Displaying Data

```typescript
// Server Component
async function RestaurantList() {
  const { data: restaurants } = await supabase
    .from('businesses')
    .select('*')
    .eq('type', 'restaurant')
    .eq('status', 'active')
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {restaurants.map(r => (
        <BusinessCard key={r.id} business={r} />
      ))}
    </div>
  )
}
```

## Real-time Updates

Subscribe to changes:

```typescript
'use client'

useEffect(() => {
  const channel = supabase
    .channel('business-updates')
    .on(
      'postgres_changes',
      { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'businesses' 
      },
      (payload) => {
        // Update UI with new data
        updateBusinessInList(payload.new)
      }
    )
    .subscribe()
  
  return () => {
    channel.unsubscribe()
  }
}, [])
```

## Analytics

Track key metrics:

```typescript
import { track } from '@vercel/analytics'

function BusinessCard({ business }) {
  const handleClick = () => {
    track('business_view', {
      businessId: business.id,
      businessType: business.type
    })
  }
  
  return <Card onClick={handleClick}>...</Card>
}
```

## Testing

### Manual Testing Checklist

- [ ] Homepage loads quickly
- [ ] Search and filters work
- [ ] Business details page shows all info
- [ ] Sign-up flow completes successfully
- [ ] Email verification works
- [ ] Booking flow works end-to-end
- [ ] Mobile responsive
- [ ] Works on slow connections
- [ ] Accessible (WCAG AA)

## Troubleshooting

### Common Issues

1. **Slow page loads**: Optimize images, check bundle size
2. **Hydration errors**: Check server/client component usage
3. **SEO issues**: Verify metadata, check robots.txt
4. **Build errors**: Ensure shared packages build first

## SEO & Analytics Documentation

### SEO Implementation
- **[SEO Quick Start](./SEO_QUICK_START.md)** - Get SEO set up in 30 minutes
- **[SEO Setup Guide](./SEO_SETUP_GUIDE.md)** - Complete SEO implementation guide
- **[SEO Implementation Summary](./SEO_IMPLEMENTATION_SUMMARY.md)** - Overview of what's implemented

### Google Analytics
- **[Google Analytics Guide](./GOOGLE_ANALYTICS_GUIDE.md)** - Complete GA4 tracking guide

### Other Documentation
- **[Notion Waitlist Setup](./NOTION_WAITLIST_SETUP.md)** - Waitlist integration guide
- **[Landing Page Spec](./montenegro_select_landing_page_spec.md)** - Design specifications
- **[UI Reviews](./landing_page_UI_review_1.md)** - Design feedback and improvements

## Further Reading

- [Next.js App Router](https://nextjs.org/docs/app)
- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [Vercel Analytics](https://vercel.com/analytics)
