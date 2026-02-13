# Frontend Developer API Guide

## Quick Reference

### Import Types
```typescript
import type {
  CreateBusinessRequest,
  SendInvitationRequest,
  AcceptInvitationRequest,
  ApiResponse,
} from '@mne-select/shared-types';
```

### Base URLs
- **Local**: `http://127.0.0.1:54321`
- **Production**: `https://your-project.supabase.co`

---

## API Endpoints

### 1. Create Business (Platform Admin Only)

**Endpoint**: `POST /functions/v1/create-business`

**Headers**:
```typescript
{
  'Authorization': 'Bearer YOUR_JWT_TOKEN',
  'Content-Type': 'application/json'
}
```

**Request**:
```typescript
import type { CreateBusinessRequest } from '@mne-select/shared-types';

const payload: CreateBusinessRequest = {
  name: 'Adriatic Beach Club',
  business_type_id: 'uuid-of-business-type',
  address: {
    address_line_1: 'Jadranska 123',
    address_line_2: null, // optional
    city: 'Budva',
    country: 'Montenegro',
    postal_code: '85310', // optional
    latitude: 42.2865, // optional
    longitude: 18.8410, // optional
  },
  license_document_number: 'LIC-2024-001', // optional
  is_pdv_registered: true,
  pdv_number: '12345678', // required if is_pdv_registered = true
  pib: '987654321', // optional
  company_number: 'COMP-001', // optional
  accepts_bookings: true,
  default_booking_commission: 5.00, // required if accepts_bookings = true
  admin_email: 'admin@beachclub.me',
  admin_first_name: 'John',
  admin_last_name: 'Doe'
};
```

**Response**:
```typescript
import type { CreateBusinessResponse } from '@mne-select/shared-types';

const response: CreateBusinessResponse = {
  success: true,
  data: {
    business_id: 'uuid',
    business_name: 'Adriatic Beach Club',
    invitation_id: 'uuid',
    invitation_sent: true
  }
};
```

**Example**:
```typescript
const createBusiness = async (data: CreateBusinessRequest) => {
  const response = await fetch('http://127.0.0.1:54321/functions/v1/create-business', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  return response.json() as Promise<CreateBusinessResponse>;
};
```

---

### 2. Send Invitation

**Endpoint**: `POST /functions/v1/send-invitation`

**Authorization**: Platform Admin OR Business Admin

**Two Modes**:

#### A. Send New Invitation

```typescript
import type { SendInvitationRequest } from '@mne-select/shared-types';

const payload: SendInvitationRequest = {
  business_id: 'uuid',
  email: 'newuser@example.com',
  role: 'team_member', // 'admin' or 'team_member'
  first_name: 'Jane',
  last_name: 'Smith'
};
```

#### B. Resend Existing Invitation

```typescript
import type { ResendInvitationRequest } from '@mne-select/shared-types';

const payload: ResendInvitationRequest = {
  invitation_id: 'uuid',
  first_name: 'Jane' // optional - updates name in email
};
```

**Response**:
```typescript
// New invitation
{
  success: true,
  data: {
    invitation_id: 'uuid'
  }
}

// Resend
{
  success: true,
  message: 'Invitation resent successfully'
}
```

**Example**:
```typescript
const sendInvitation = async (data: SendInvitationRequest | ResendInvitationRequest) => {
  const response = await fetch('http://127.0.0.1:54321/functions/v1/send-invitation', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  return response.json();
};
```

**Important Notes**:
- Business admins can only invite `team_member` role (not `admin`)
- Platform admins can invite any role
- Cannot send invitation if one already exists for that email

---

### 3. Accept Invitation (Public - No Auth)

**Endpoint**: `POST /functions/v1/accept-invitation`

**Headers**: No authorization required!

```typescript
{
  'Content-Type': 'application/json'
}
```

**Request**:
```typescript
import type { AcceptInvitationRequest } from '@mne-select/shared-types';

const payload: AcceptInvitationRequest = {
  invitation_id: 'uuid-from-email-link',
  email: 'newuser@example.com',
  password: 'SecurePassword123!', // Min 8 characters
  first_name: 'Jane',
  last_name: 'Smith'
};
```

**Response**:
```typescript
import type { AcceptInvitationResponse } from '@mne-select/shared-types';

const response: AcceptInvitationResponse = {
  success: true,
  message: 'Account created and logged in successfully',
  data: {
    user: {
      id: 'uuid',
      email: 'newuser@example.com',
      // ... other user fields
    },
    session: {
      access_token: 'jwt-token',
      refresh_token: 'refresh-token',
      expires_at: 1234567890,
      // ... other session fields
    },
    business_name: 'Adriatic Beach Club'
  }
};
```

**Example**:
```typescript
const acceptInvitation = async (data: AcceptInvitationRequest) => {
  const response = await fetch('http://127.0.0.1:54321/functions/v1/accept-invitation', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  const result = await response.json() as AcceptInvitationResponse;
  
  // Save the session token for authenticated requests
  if (result.success && result.data.session) {
    localStorage.setItem('access_token', result.data.session.access_token);
  }
  
  return result;
};
```

**Important Notes**:
- Email must match the invitation email exactly
- Invitation must not be expired (7 days from creation)
- Password must be at least 8 characters
- Returns a session - user is automatically logged in

---

### 4. List Business Invitations

**Endpoint**: `GET /functions/v1/list-business-invitations?business_id=xxx`

**Authorization**: Platform Admin OR Business Admin (own business only)

**Query Parameters**:
- `business_id` (required): UUID of the business

**Response**:
```typescript
import type { ListInvitationsResponse, InvitationListItem } from '@mne-select/shared-types';

const response: ListInvitationsResponse = {
  success: true,
  data: [
    {
      id: 'uuid',
      email: 'user@example.com',
      role: 'team_member',
      status: 'pending', // 'pending' | 'accepted' | 'expired'
      expires_at: '2026-02-19T12:00:00Z',
      sent_at: '2026-02-12T12:00:00Z',
      accepted_at: null,
      created_at: '2026-02-12T12:00:00Z',
      resent_count: 0,
      last_resent_at: null
    },
    // ... more invitations
  ]
};
```

**Example**:
```typescript
const listInvitations = async (businessId: string) => {
  const response = await fetch(
    `http://127.0.0.1:54321/functions/v1/list-business-invitations?business_id=${businessId}`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  );
  
  return response.json() as Promise<ListInvitationsResponse>;
};
```

---

## Authentication

### Login

**Endpoint**: `POST /auth/v1/token?grant_type=password`

**Headers**:
```typescript
{
  'apikey': 'YOUR_SUPABASE_ANON_KEY',
  'Content-Type': 'application/json'
}
```

**Request**:
```typescript
{
  email: 'user@example.com',
  password: 'password123'
}
```

**Response**:
```typescript
{
  access_token: 'jwt-token',
  refresh_token: 'refresh-token',
  expires_in: 3600,
  token_type: 'bearer',
  user: {
    id: 'uuid',
    email: 'user@example.com',
    // ... other fields
  }
}
```

**Example**:
```typescript
const login = async (email: string, password: string) => {
  const response = await fetch(
    'http://127.0.0.1:54321/auth/v1/token?grant_type=password',
    {
      method: 'POST',
      headers: {
        'apikey': 'YOUR_SUPABASE_ANON_KEY',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    }
  );
  
  const data = await response.json();
  
  if (data.access_token) {
    localStorage.setItem('access_token', data.access_token);
  }
  
  return data;
};
```

---

## Error Handling

All endpoints return this format on error:

```typescript
{
  success: false,
  error: 'Error message here'
}
```

**Status Codes**:
- `200` - Success (GET requests)
- `201` - Created (POST requests that create resources)
- `400` - Validation error (bad request data)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not found
- `500` - Internal server error

**Example Error Handling**:
```typescript
const handleApiCall = async () => {
  try {
    const response = await fetch('...');
    const data = await response.json();
    
    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Request failed');
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};
```

---

## TypeScript Examples

### Complete React Hook Example

```typescript
import { useState } from 'react';
import type { CreateBusinessRequest, CreateBusinessResponse } from '@mne-select/shared-types';

export const useCreateBusiness = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const createBusiness = async (data: CreateBusinessRequest) => {
    setLoading(true);
    setError(null);
    
    try {
      const accessToken = localStorage.getItem('access_token');
      
      const response = await fetch(
        'http://127.0.0.1:54321/functions/v1/create-business',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }
      );
      
      const result = await response.json() as CreateBusinessResponse;
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create business';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  return { createBusiness, loading, error };
};
```

---

## Database Direct Access (via Supabase Client)

If you need to query the database directly:

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@mne-select/shared-types';

const supabase = createClient<Database>(
  'http://127.0.0.1:54321',
  'YOUR_ANON_KEY'
);

// Type-safe queries!
const { data: businesses } = await supabase
  .from('businesses')
  .select('*, business_type:business_types(*), address:addresses(*)')
  .eq('status', 'active')
  .is('deleted_at', null);

// TypeScript knows the exact shape of 'businesses'
```

---

## Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH
```

---

## Test Accounts

### Platform Admin
- Email: `marko+admin@velocci.me`
- Password: `Password1*`
- Can: Everything

### Restaurant Admin
- Email: `restaurant.admin@example.com`
- Password: `Test123!`
- Can: Manage own business, invite team members

### Gym Team Member
- Email: `gym.staff@example.com`
- Password: `Test123!`
- Can: View own business, limited permissions

---

## Need Help?

1. Check types in `packages/shared-types/src/api.types.ts`
2. View database schema: `packages/shared-types/src/database.types.ts`
3. Read detailed specs: `docs/backend/phase-1-edge-functions.md`
4. Access Supabase Studio: http://127.0.0.1:54323
