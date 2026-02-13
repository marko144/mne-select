# @mne-select/shared-types

TypeScript types for MNE Select platform - shared across all applications.

## What's Included

### 1. Database Types (Auto-Generated)
- **File**: `src/database.types.ts`
- **Source**: Generated from Supabase database schema
- **Update**: Run `npm run generate:types` to regenerate

### 2. API Contract Types
- **File**: `src/api.types.ts`
- **Purpose**: Type-safe contracts for all API endpoints

## Usage in Frontend

### Import Types

```typescript
import type {
  // Database types
  Business,
  BusinessUser,
  Invitation,
  BusinessType,
  
  // Enums
  BusinessUserRole,
  InvitationStatus,
  BusinessStatus,
  
  // API request/response types
  CreateBusinessRequest,
  CreateBusinessResponse,
  SendInvitationRequest,
  AcceptInvitationRequest,
  ListInvitationsResponse,
  
  // Generic API types
  ApiResponse,
  ApiError,
} from '@mne-select/shared-types';
```

## API Endpoint Types

### 1. Create Business

```typescript
import type { CreateBusinessRequest, CreateBusinessResponse } from '@mne-select/shared-types';

// Request
const request: CreateBusinessRequest = {
  name: 'My Restaurant',
  business_type_id: 'uuid-here',
  address: {
    address_line_1: '123 Main St',
    city: 'Budva',
    country: 'Montenegro',
  },
  is_pdv_registered: false,
  accepts_bookings: true,
  admin_email: 'admin@restaurant.com',
  admin_first_name: 'John',
  admin_last_name: 'Doe',
};

// Response
const response: CreateBusinessResponse = {
  success: true,
  data: {
    business_id: 'uuid',
    business_name: 'My Restaurant',
    invitation_id: 'uuid',
    invitation_sent: true,
  },
};
```

### 2. Send Invitation

```typescript
import type { SendInvitationRequest, SendInvitationResponse } from '@mne-select/shared-types';

// Send new invitation
const request: SendInvitationRequest = {
  business_id: 'uuid',
  email: 'user@example.com',
  role: 'team_member',
  first_name: 'Jane',
  last_name: 'Smith',
};

// Or resend existing
const resendRequest: ResendInvitationRequest = {
  invitation_id: 'uuid',
  first_name: 'Jane', // optional
};
```

### 3. Accept Invitation

```typescript
import type { AcceptInvitationRequest, AcceptInvitationResponse } from '@mne-select/shared-types';

const request: AcceptInvitationRequest = {
  invitation_id: 'uuid',
  email: 'user@example.com',
  password: 'SecurePassword123!',
  first_name: 'Jane',
  last_name: 'Smith',
};

const response: AcceptInvitationResponse = {
  success: true,
  message: 'Account created successfully',
  data: {
    user: { id: 'uuid', email: 'user@example.com' },
    session: { access_token: 'jwt-token', ... },
    business_name: 'My Restaurant',
  },
};
```

### 4. List Invitations

```typescript
import type { ListInvitationsResponse, InvitationListItem } from '@mne-select/shared-types';

// Response
const response: ListInvitationsResponse = {
  success: true,
  data: [
    {
      id: 'uuid',
      email: 'user@example.com',
      role: 'team_member',
      status: 'pending',
      expires_at: '2026-02-19T...',
      sent_at: '2026-02-12T...',
      accepted_at: null,
      created_at: '2026-02-12T...',
      resent_count: 0,
      last_resent_at: null,
    },
  ],
};
```

## Database Query Types

### Supabase Client Usage

```typescript
import type { Database } from '@mne-select/shared-types';
import { createClient } from '@supabase/supabase-js';

// Create typed Supabase client
const supabase = createClient<Database>(url, key);

// Queries are now type-safe!
const { data: businesses } = await supabase
  .from('businesses')
  .select('*')
  .eq('status', 'active'); // TypeScript knows 'status' exists and its valid values

// Type-safe inserts
const { data: newBusiness } = await supabase
  .from('businesses')
  .insert({
    name: 'My Business',
    business_type_id: 'uuid',
    // TypeScript will enforce all required fields
  });
```

## Enums

All database enums are typed:

```typescript
import type { BusinessUserRole, InvitationStatus, BusinessStatus } from '@mne-select/shared-types';

const role: BusinessUserRole = 'admin'; // 'admin' | 'team_member'
const status: InvitationStatus = 'pending'; // 'pending' | 'accepted' | 'expired'
const businessStatus: BusinessStatus = 'active'; // 'active' | 'suspended'
```

## Type Guards

Use type guards to safely check API responses:

```typescript
import { isApiError, isApiResponse } from '@mne-select/shared-types';

const response = await fetch('/api/...');
const data = await response.json();

if (isApiError(data)) {
  console.error(data.error);
} else if (isApiResponse(data)) {
  console.log(data.data);
}
```

## Regenerating Types

When the database schema changes:

```bash
# From project root
npm run generate:types

# Or manually
cd /path/to/project
supabase gen types typescript --local > packages/shared-types/src/database.types.ts
```

## Files

```
packages/shared-types/
├── src/
│   ├── index.ts              # Main exports
│   ├── database.types.ts     # Auto-generated from database
│   └── api.types.ts          # API contracts (manually maintained)
├── package.json
└── README.md
```

## Notes

- **Database types** are auto-generated - never edit `database.types.ts` manually
- **API types** are manually maintained in `api.types.ts`
- Update API types when edge functions change
- All types are exported from `index.ts` for convenience

## Support

If types are missing or incorrect:
1. Check if database schema is up to date
2. Regenerate types with `npm run generate:types`
3. Check if API contracts in `api.types.ts` are current
