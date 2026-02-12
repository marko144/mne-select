# MNE Select - Architecture Overview

## System Architecture

MNE Select is built as a monorepo with two separate web applications sharing common packages and a unified backend.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Users/Clients                         │
└────────────┬──────────────────────────────┬─────────────────┘
             │                              │
    ┌────────▼────────┐          ┌─────────▼──────────┐
    │  Portal App     │          │   Guests App       │
    │  (Vercel)       │          │   (Vercel)         │
    │  Port: 3000     │          │   Port: 3001       │
    └────────┬────────┘          └─────────┬──────────┘
             │                              │
             └──────────────┬───────────────┘
                            │
                ┌───────────▼────────────┐
                │  Cloudflare Workers    │
                │  (API Proxy/Security)  │
                │  - Rate limiting       │
                │  - WAF                 │
                │  - IP filtering        │
                └───────────┬────────────┘
                            │
                ┌───────────▼────────────┐
                │  Supabase Backend      │
                │  - PostgreSQL          │
                │  - Auth                │
                │  - Edge Functions      │
                │  - Realtime            │
                └───────────┬────────────┘
                            │
                ┌───────────▼────────────┐
                │  AWS Services          │
                │  - S3 (storage)        │
                │  - CloudFront (CDN)    │
                │  - Other services      │
                └────────────────────────┘
```

## Technology Stack

### Frontend
- **Framework**: Next.js 15 (App Router, React 19)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **State Management**: React hooks + Supabase client
- **Deployment**: Vercel

### Backend
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **API**: Supabase Edge Functions (Deno)
- **Real-time**: Supabase Realtime
- **Deployment**: Supabase Cloud

### Infrastructure
- **Monorepo**: Turborepo + pnpm workspaces
- **Package Manager**: pnpm
- **API Security**: Cloudflare Workers (proxy layer)
- **Media Storage**: AWS S3
- **Media Delivery**: AWS CloudFront CDN

## Monorepo Structure

### Apps
Two independent Next.js applications that can be built and deployed separately:

1. **Portal** (`apps/portal/`)
   - Invite-only business management application
   - Features: Admin, Restaurant management, Gym management, etc.
   - Auth flow: Invitation-based registration

2. **Guests** (`apps/guests/`)
   - Public-facing application for end users
   - Features: Browse businesses, book experiences, etc.
   - Auth flow: Public self-registration

### Packages
Shared code across applications:

1. **UI** (`packages/ui/`)
   - Reusable React components (Button, Card, etc.)
   - Ensures UI consistency across apps

2. **Design System** (`packages/design-system/`)
   - Tailwind configuration
   - Design tokens (colors, spacing, typography)
   - Theme definitions

3. **Auth** (`packages/auth/`)
   - Authentication utilities
   - Supports both public and invite-based signup
   - Session management

4. **Supabase Client** (`packages/supabase-client/`)
   - Configured Supabase client
   - Can use Cloudflare proxy URL
   - Browser and server-side clients

5. **Shared Types** (`packages/shared-types/`)
   - TypeScript interfaces and types
   - Database types (generated from Supabase)
   - API response types

6. **Shared Utils** (`packages/shared-utils/`)
   - Common utility functions
   - Date formatting, validation, etc.

## Authentication Strategy

### Two Authentication Flows

#### 1. Public Sign-up (Guests App)
```typescript
User fills form → Email verification → Account created
```
- Open registration
- Email confirmation required
- User can immediately start using the app

#### 2. Invitation-based (Portal App)
```typescript
Admin sends invite → User receives email → 
User registers with token → Account created with role
```
- Controlled access
- Token-based validation
- Pre-assigned roles

### Implementation
Both flows use **Supabase Auth** with different business logic:
- Same authentication system
- Different registration endpoints
- Role-based access control via RLS policies

## Security Architecture

### Multi-Layer Security

#### Layer 1: Cloudflare Workers
- Rate limiting (per IP, per user)
- Web Application Firewall (WAF)
- IP filtering and blocklists
- DDoS protection
- Request validation

#### Layer 2: Supabase
- Row-Level Security (RLS) policies
- JWT-based authentication
- API key rotation
- Audit logging

#### Layer 3: Next.js Middleware
- Route protection
- Client-side validation
- CSRF protection
- Secure headers

#### Layer 4: Application Logic
- Input sanitization
- Business rule validation
- Authorization checks

## Data Flow

### Read Operations
```
User → Next.js → Cloudflare Proxy → Supabase → PostgreSQL
                                                    ↓
User ← Next.js ← Cloudflare Proxy ← Supabase ← Result
```

### Write Operations
```
User → Next.js → Validation → Cloudflare Proxy → 
Supabase Function → Business Logic → PostgreSQL → Response
```

### Media Operations
```
Upload: User → Next.js → Supabase Function → AWS S3
Delivery: User → AWS CloudFront CDN → Media file
```

## Build & Deployment Strategy

### Turborepo Build Pipeline
```
packages/design-system (build) →
packages/ui (build) →
packages/auth (build) →
apps/portal (build) + apps/guests (build)
```

**Benefits**:
- Smart caching (only rebuilds changed packages)
- Parallel builds where possible
- Dependency-aware build order

### Deployment Flow

#### Portal App
```
Git push → Vercel detects changes in apps/portal/ or packages/ →
Builds portal → Deploys to Vercel edge network
```

#### Guests App
```
Git push → Vercel detects changes in apps/guests/ or packages/ →
Builds guests → Deploys to Vercel edge network
```

**Key Feature**: Each app only rebuilds when its code or shared dependencies change.

## Scalability Considerations

### Horizontal Scaling
- Vercel automatically scales Next.js apps
- Supabase handles database connection pooling
- Cloudflare Workers scale globally

### Caching Strategy
- Static assets: CDN cached (CloudFront)
- API responses: Cloudflare Workers cache
- Database queries: Supabase built-in caching
- Build artifacts: Turborepo local cache

### Performance Optimizations
- Next.js App Router (streaming SSR)
- Edge functions (low latency)
- Image optimization (Next.js Image)
- Code splitting (automatic)
- Turbopack (fast builds)

## Development Workflow

### Local Development
```bash
# Terminal 1: Start Supabase locally
cd supabase && supabase start

# Terminal 2: Start both apps
pnpm dev

# Portal: http://localhost:3000
# Guests: http://localhost:3001
```

### Adding Features
1. Create feature in `apps/[app]/features/[feature-name]/`
2. Add shared components to `packages/ui/`
3. Add types to `packages/shared-types/`
4. Add backend logic to `supabase/functions/`

### Database Changes
```bash
# Create migration
supabase migration new add_feature

# Edit SQL in supabase/migrations/

# Apply locally
supabase db push

# Generate types
supabase gen types typescript --local > packages/shared-types/src/database.types.ts
```

## Future Considerations

### Potential Enhancements
- **Storybook**: Component documentation
- **Testing**: Jest + React Testing Library
- **E2E Testing**: Playwright
- **Monitoring**: Sentry error tracking
- **Analytics**: Vercel Analytics
- **Remote Caching**: Turborepo remote cache (Vercel)

### Cloudflare Workers Setup (Next Phase)
When ready to implement API proxy:
1. Create Cloudflare Worker
2. Implement rate limiting with Upstash Redis
3. Add WAF rules
4. Update `NEXT_PUBLIC_API_URL` to Worker URL
5. Configure Worker to proxy to Supabase

## Design Principles

1. **Separation of Concerns**: Apps, packages, and backend are clearly separated
2. **Reusability**: Shared packages prevent code duplication
3. **Type Safety**: TypeScript everywhere with strict mode
4. **Security in Depth**: Multiple security layers
5. **Developer Experience**: Fast builds, hot reload, clear structure
6. **Scalability**: Architecture supports growth without major refactoring
7. **Maintainability**: Clear conventions and documentation

## Performance Targets

- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s
- **Lighthouse Score**: > 90
- **API Response Time**: < 200ms (p95)
- **Build Time**: < 5 minutes (with cache)

## Monitoring & Observability

### Application Monitoring
- Vercel Analytics (frontend performance)
- Supabase logs (backend errors)
- Cloudflare Analytics (API metrics)

### Key Metrics
- Page load times
- API response times
- Error rates
- User authentication success rates
- Database query performance

## Summary

MNE Select is architected as a modern, scalable monorepo application that:
- Shares code effectively while maintaining app independence
- Implements security at multiple layers
- Optimizes for developer experience and performance
- Uses industry-standard tools and best practices
- Can scale horizontally without architectural changes
