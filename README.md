# MNE Select

A modern monorepo application for managing business listings and guest experiences in Montenegro. Built with Next.js, Supabase, and Turborepo.

## 🏗️ Project Structure

```
mne-select/
├── apps/
│   ├── portal/              # Business portal (invite-only)
│   └── guests/              # Public guest application
│
├── packages/
│   ├── ui/                  # Shared UI components
│   ├── design-system/       # Tailwind config & design tokens
│   ├── auth/                # Authentication utilities
│   ├── supabase-client/     # Supabase client configuration
│   ├── shared-types/        # TypeScript types
│   └── shared-utils/        # Common utilities
│
├── supabase/                # Backend (database, auth, functions)
│
└── docs/                    # Documentation
    ├── backend/
    ├── portal/
    └── guests/
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ (currently using v22.16.0)
- pnpm 9+ (package manager)
- Supabase CLI (for backend development)

### Installation

1. **Clone the repository**

```bash
git clone <your-repo-url>
cd mne-select
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Set up environment variables**

Copy `.env.example` to `.env.local` in each app:

```bash
cp .env.example apps/portal/.env.local
cp .env.example apps/guests/.env.local
```

Update the values with your Supabase credentials.

4. **Start Supabase locally (optional)**

```bash
cd supabase
supabase start
```

## 🛠️ Development

### Run all apps

```bash
pnpm dev
```

### Run specific app

```bash
# Portal app (http://localhost:3000)
pnpm dev:portal

# Guests app (http://localhost:3001)
pnpm dev:guests
```

## 📦 Building

### Build all apps

```bash
pnpm build
```

### Build specific app

```bash
pnpm build:portal
pnpm build:guests
```

## 🧪 Testing & Quality

```bash
# Type checking
pnpm type-check

# Linting
pnpm lint

# Format code
pnpm format
```

## 📚 Documentation

Detailed documentation is available in the `/docs` folder:

- [Architecture Overview](./docs/ARCHITECTURE.md)
- [Backend Documentation](./docs/backend/)
- [Portal App Documentation](./docs/portal/)
- [Guests App Documentation](./docs/guests/)

## 🏛️ Architecture

- **Frontend**: Next.js 15 with App Router
- **Styling**: Tailwind CSS with shared design system
- **Backend**: Supabase (PostgreSQL, Auth, Functions)
- **Monorepo**: Turborepo + pnpm workspaces
- **API Security**: Cloudflare Workers proxy (planned)
- **Deployment**: Vercel (frontend), Supabase (backend)

## 🔐 Authentication

Two authentication flows are supported:

1. **Public Sign-up** (Guests app)
   - Users can register themselves
   - Email verification required

2. **Invitation-based** (Portal app)
   - Admin sends invitation
   - Users register with invitation token

Both use Supabase Auth under the hood.

## 📖 Key Commands

```bash
# Development
pnpm dev              # Run all apps in development mode
pnpm dev:portal       # Run portal app only
pnpm dev:guests       # Run guests app only

# Building
pnpm build            # Build all apps
pnpm build:portal     # Build portal app only
pnpm build:guests     # Build guests app only

# Code Quality
pnpm lint             # Lint all packages
pnpm format           # Format all code
pnpm type-check       # TypeScript type checking

# Maintenance
pnpm clean            # Clean all build artifacts
```

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and type-checking
4. Submit a pull request

## 📄 License

Private project - All rights reserved

## 🔗 Links

- [Supabase Dashboard](https://app.supabase.com)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Turborepo Docs](https://turbo.build/repo/docs)
