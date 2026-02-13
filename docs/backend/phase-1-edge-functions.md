# Phase 1: Edge Functions Specification

## Overview

This document specifies Supabase Edge Functions for Phase 1 business onboarding and invitation workflows. Edge Functions provide secure, server-side business logic that cannot be bypassed by client-side manipulation.

---

## Architecture

### Function Organization

```
supabase/functions/
├── _shared/
│   ├── auth.ts              # Authentication utilities
│   ├── validation.ts        # Input validation
│   ├── email-service.ts     # Email sending logic
│   ├── email-templates.ts   # Email template rendering
│   └── types.ts             # Shared TypeScript types
│
├── create-business/
│   └── index.ts             # Create business + first admin
│
├── send-invitation/
│   └── index.ts             # Send/resend invitations
│
├── accept-invitation/
│   └── index.ts             # Accept invitation & create user
│
└── list-business-invitations/
    └── index.ts             # List invitations for a business
```

---

## Shared Utilities

### 1. Authentication Helper

**File**: `supabase/functions/_shared/auth.ts`

```typescript
import { createClient, SupabaseClient } from '@supabase/supabase-js@2'

export interface AuthenticatedRequest {
  user_id: string
  email: string
  role?: string
}

/**
 * Verify JWT token and extract user information
 */
export async function authenticateRequest(
  req: Request,
  supabaseClient: SupabaseClient
): Promise<AuthenticatedRequest> {
  const authHeader = req.headers.get('Authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid authorization header')
  }

  const token = authHeader.replace('Bearer ', '')

  const { data: { user }, error } = await supabaseClient.auth.getUser(token)

  if (error || !user) {
    throw new Error('Invalid or expired token')
  }

  return {
    user_id: user.id,
    email: user.email!,
    role: user.user_metadata?.role
  }
}

/**
 * Check if user is a platform admin
 */
export async function isPlatformAdmin(
  userId: string,
  supabaseClient: SupabaseClient
): Promise<boolean> {
  const { data, error } = await supabaseClient
    .from('platform_admins')
    .select('id')
    .eq('user_id', userId)
    .eq('is_active', true)
    .is('deleted_at', null)
    .single()

  return !error && data !== null
}

/**
 * Check if user is a business admin
 */
export async function isBusinessAdmin(
  userId: string,
  businessId: string,
  supabaseClient: SupabaseClient
): Promise<boolean> {
  const { data, error } = await supabaseClient
    .from('business_users')
    .select('id')
    .eq('user_id', userId)
    .eq('business_id', businessId)
    .eq('role', 'admin')
    .eq('is_active', true)
    .is('deleted_at', null)
    .single()

  return !error && data !== null
}

/**
 * Require platform admin role or throw error
 */
export async function requirePlatformAdmin(
  userId: string,
  supabaseClient: SupabaseClient
): Promise<void> {
  const isAdmin = await isPlatformAdmin(userId, supabaseClient)
  
  if (!isAdmin) {
    throw new Error('Forbidden: Platform admin access required')
  }
}
```

---

### 2. Validation Helper

**File**: `supabase/functions/_shared/validation.ts`

```typescript
/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
  return emailRegex.test(email)
}

/**
 * Validate business data
 */
export interface BusinessData {
  name: string
  business_type_id: string
  address: {
    address_line_1: string
    address_line_2?: string
    city: string
    country: string
    postal_code?: string
    latitude?: number
    longitude?: number
  }
  license_document_number?: string
  is_pdv_registered: boolean
  pdv_number?: string
  pib?: string
  company_number?: string
  accepts_bookings: boolean
  default_booking_commission?: number
  admin_email: string
  admin_first_name: string
  admin_last_name: string
}

export function validateBusinessData(data: any): BusinessData {
  const errors: string[] = []

  // Required fields
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push('Business name is required')
  }

  if (!data.business_type_id || typeof data.business_type_id !== 'string') {
    errors.push('Business type is required')
  }

  // Address validation
  if (!data.address || typeof data.address !== 'object') {
    errors.push('Address is required')
  } else {
    if (!data.address.address_line_1 || data.address.address_line_1.trim().length === 0) {
      errors.push('Address line 1 is required')
    }
    if (!data.address.city || data.address.city.trim().length === 0) {
      errors.push('City is required')
    }
    if (!data.address.country || data.address.country.trim().length === 0) {
      errors.push('Country is required')
    }
    
    // Optional lat/long validation
    if (data.address.latitude !== undefined && (
      typeof data.address.latitude !== 'number' ||
      data.address.latitude < -90 ||
      data.address.latitude > 90
    )) {
      errors.push('Invalid latitude (must be between -90 and 90)')
    }
    
    if (data.address.longitude !== undefined && (
      typeof data.address.longitude !== 'number' ||
      data.address.longitude < -180 ||
      data.address.longitude > 180
    )) {
      errors.push('Invalid longitude (must be between -180 and 180)')
    }
  }

  // PDV validation
  if (data.is_pdv_registered === true && !data.pdv_number) {
    errors.push('PDV number is required when PDV registered')
  }

  // Booking commission validation
  if (data.accepts_bookings === true) {
    if (data.default_booking_commission === undefined) {
      errors.push('Booking commission is required when bookings are enabled')
    } else if (
      typeof data.default_booking_commission !== 'number' ||
      data.default_booking_commission < 0
    ) {
      errors.push('Booking commission must be a positive number')
    }
  }

  // Admin email validation
  if (!data.admin_email || !isValidEmail(data.admin_email)) {
    errors.push('Valid admin email is required')
  }

  if (!data.admin_first_name || data.admin_first_name.trim().length === 0) {
    errors.push('Admin first name is required')
  }

  if (!data.admin_last_name || data.admin_last_name.trim().length === 0) {
    errors.push('Admin last name is required')
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join('; '))
  }

  return data as BusinessData
}

/**
 * Validate invitation data
 */
export interface InvitationData {
  business_id: string
  email: string
  role: 'admin' | 'team_member'
  first_name: string
  last_name: string
}

export function validateInvitationData(data: any): InvitationData {
  const errors: string[] = []

  if (!data.business_id || typeof data.business_id !== 'string') {
    errors.push('Business ID is required')
  }

  if (!data.email || !isValidEmail(data.email)) {
    errors.push('Valid email is required')
  }

  if (!data.role || !['admin', 'team_member'].includes(data.role)) {
    errors.push('Role must be either "admin" or "team_member"')
  }

  if (!data.first_name || data.first_name.trim().length === 0) {
    errors.push('First name is required')
  }

  if (!data.last_name || data.last_name.trim().length === 0) {
    errors.push('Last name is required')
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join('; '))
  }

  return data as InvitationData
}

/**
 * Custom validation error
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}
```

---

## Edge Functions

### 1. Create Business & Send First Invitation

**Endpoint**: `POST /functions/v1/create-business`

**Purpose**: Platform admins create a new business and automatically send an invitation to the first admin user.

**File**: `supabase/functions/create-business/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from '@supabase/supabase-js@2'
import { authenticateRequest, requirePlatformAdmin } from '../_shared/auth.ts'
import { validateBusinessData, ValidationError } from '../_shared/validation.ts'
import { sendEmail } from '../_shared/email-service.ts'
import { renderBusinessAdminInvitation, generateInvitationLink } from '../_shared/email-templates.ts'

serve(async (req) => {
  // CORS headers
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    // Initialize Supabase client with service role
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Authenticate and authorize request
    const auth = await authenticateRequest(req, supabaseClient)
    await requirePlatformAdmin(auth.user_id, supabaseClient)

    // Parse and validate request body
    const requestData = await req.json()
    const businessData = validateBusinessData(requestData)

    // Start transaction (use Supabase RPC for transactions)
    // Step 1: Create address
    const { data: address, error: addressError } = await supabaseClient
      .from('addresses')
      .insert({
        address_line_1: businessData.address.address_line_1,
        address_line_2: businessData.address.address_line_2,
        city: businessData.address.city,
        country: businessData.address.country,
        postal_code: businessData.address.postal_code,
        latitude: businessData.address.latitude,
        longitude: businessData.address.longitude,
      })
      .select('id')
      .single()

    if (addressError) {
      throw new Error(`Failed to create address: ${addressError.message}`)
    }

    // Step 2: Create business
    const { data: business, error: businessError } = await supabaseClient
      .from('businesses')
      .insert({
        name: businessData.name,
        business_type_id: businessData.business_type_id,
        address_id: address.id,
        license_document_number: businessData.license_document_number,
        is_pdv_registered: businessData.is_pdv_registered,
        pdv_number: businessData.pdv_number,
        pib: businessData.pib,
        company_number: businessData.company_number,
        accepts_bookings: businessData.accepts_bookings,
        default_booking_commission: businessData.default_booking_commission || 0,
        status: 'active',
        created_by: auth.user_id,
        updated_by: auth.user_id,
      })
      .select('id, name')
      .single()

    if (businessError) {
      // Cleanup: delete address if business creation failed
      await supabaseClient.from('addresses').delete().eq('id', address.id)
      throw new Error(`Failed to create business: ${businessError.message}`)
    }

    // Step 3: Get business type name for email
    const { data: businessType } = await supabaseClient
      .from('business_types')
      .select('name')
      .eq('id', businessData.business_type_id)
      .single()

    // Step 4: Create invitation
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 days from now

    const { data: invitation, error: invitationError } = await supabaseClient
      .from('invitations')
      .insert({
        business_id: business.id,
        email: businessData.admin_email,
        role: 'admin',
        status: 'pending',
        expires_at: expiresAt.toISOString(),
        created_by: auth.user_id,
      })
      .select('id')
      .single()

    if (invitationError) {
      throw new Error(`Failed to create invitation: ${invitationError.message}`)
    }

    // Step 5: Send invitation email
    const invitationLink = generateInvitationLink(invitation.id)
    const { html, text, subject } = renderBusinessAdminInvitation({
      first_name: businessData.admin_first_name,
      business_name: business.name,
      business_type: businessType?.name || 'Business',
      invitation_link: invitationLink,
      expiry_date: expiresAt.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      support_url: Deno.env.get('SUPPORT_URL') || 'https://mneselect.me/support',
      terms_url: Deno.env.get('TERMS_URL') || 'https://mneselect.me/terms',
      privacy_url: Deno.env.get('PRIVACY_URL') || 'https://mneselect.me/privacy',
    })

    try {
      await sendEmail({
        to: businessData.admin_email,
        subject,
        html,
        text,
      })

      // Update invitation sent_at timestamp
      await supabaseClient
        .from('invitations')
        .update({ sent_at: new Date().toISOString() })
        .eq('id', invitation.id)

    } catch (emailError) {
      console.error('Failed to send invitation email:', emailError)
      // Don't fail the entire operation if email fails
      // Admin can resend the invitation later
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          business_id: business.id,
          business_name: business.name,
          invitation_id: invitation.id,
          invitation_sent: true,
        },
      }),
      {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )

  } catch (error) {
    console.error('Error in create-business:', error)

    // Determine appropriate status code
    let statusCode = 500
    if (error instanceof ValidationError) {
      statusCode = 400
    } else if (error.message.includes('Forbidden') || error.message.includes('admin')) {
      statusCode = 403
    } else if (error.message.includes('authorization')) {
      statusCode = 401
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal server error',
      }),
      {
        status: statusCode,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  }
})
```

**Request Body:**
```json
{
  "name": "Adriatic Seafood Restaurant",
  "business_type_id": "uuid-here",
  "address": {
    "address_line_1": "Slovenska Obala 10",
    "address_line_2": null,
    "city": "Budva",
    "country": "Montenegro",
    "postal_code": "85310",
    "latitude": 42.2865479,
    "longitude": 18.8409717
  },
  "license_document_number": "LIC-REST-2024-001",
  "is_pdv_registered": true,
  "pdv_number": "12345678",
  "pib": "987654321",
  "company_number": "COMP-2024-001",
  "accepts_bookings": true,
  "default_booking_commission": 5.00,
  "admin_email": "owner@restaurant.me",
  "admin_first_name": "John",
  "admin_last_name": "Restaurateur"
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "business_id": "uuid-here",
    "business_name": "Adriatic Seafood Restaurant",
    "invitation_id": "uuid-here",
    "invitation_sent": true
  }
}
```

---

### 2. Send/Resend Invitation

**Endpoint**: `POST /functions/v1/send-invitation`

**Purpose**: Send a new invitation or resend an existing pending invitation.

**File**: `supabase/functions/send-invitation/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from '@supabase/supabase-js@2'
import { authenticateRequest, isPlatformAdmin, isBusinessAdmin } from '../_shared/auth.ts'
import { validateInvitationData, ValidationError } from '../_shared/validation.ts'
import { sendEmail } from '../_shared/email-service.ts'
import {
  renderBusinessAdminInvitation,
  renderTeamMemberInvitation,
  renderInvitationResent,
  generateInvitationLink
} from '../_shared/email-templates.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const auth = await authenticateRequest(req, supabaseClient)
    const requestData = await req.json()

    // Check if this is a resend operation
    const isResend = !!requestData.invitation_id

    if (isResend) {
      // Resend existing invitation
      const invitationId = requestData.invitation_id

      // Get invitation details
      const { data: invitation, error: invitationError } = await supabaseClient
        .from('invitations')
        .select('*, businesses(name, business_type_id)')
        .eq('id', invitationId)
        .eq('status', 'pending')
        .single()

      if (invitationError || !invitation) {
        throw new Error('Invitation not found or already used')
      }

      // Check if invitation is expired
      if (new Date(invitation.expires_at) < new Date()) {
        throw new Error('Invitation has expired and cannot be resent')
      }

      // Authorization: Platform admin OR business admin of this business
      const isPlatformAdminUser = await isPlatformAdmin(auth.user_id, supabaseClient)
      const isBusinessAdminUser = await isBusinessAdmin(
        auth.user_id,
        invitation.business_id,
        supabaseClient
      )

      if (!isPlatformAdminUser && !isBusinessAdminUser) {
        throw new Error('Forbidden: You do not have permission to resend this invitation')
      }

      // Get business type name
      const { data: businessType } = await supabaseClient
        .from('business_types')
        .select('name')
        .eq('id', invitation.businesses.business_type_id)
        .single()

      // Render and send email
      const invitationLink = generateInvitationLink(invitation.id)
      const expiryDate = new Date(invitation.expires_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })

      const { html, text, subject } = renderInvitationResent({
        first_name: requestData.first_name || 'there',
        business_name: invitation.businesses.name,
        role: invitation.role === 'admin' ? 'Administrator' : 'Team Member',
        invitation_link: invitationLink,
        expiry_date: expiryDate,
      })

      await sendEmail({
        to: invitation.email,
        subject,
        html,
        text,
      })

      // Update invitation resend tracking
      await supabaseClient
        .from('invitations')
        .update({
          resent_count: invitation.resent_count + 1,
          last_resent_at: new Date().toISOString(),
        })
        .eq('id', invitation.id)

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Invitation resent successfully',
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      )

    } else {
      // Create new invitation
      const invitationData = validateInvitationData(requestData)

      // Authorization check
      const isPlatformAdminUser = await isPlatformAdmin(auth.user_id, supabaseClient)
      const isBusinessAdminUser = await isBusinessAdmin(
        auth.user_id,
        invitationData.business_id,
        supabaseClient
      )

      if (!isPlatformAdminUser && !isBusinessAdminUser) {
        throw new Error('Forbidden: You do not have permission to send invitations')
      }

      // Business admins can only invite team members, not other admins
      if (isBusinessAdminUser && !isPlatformAdminUser && invitationData.role === 'admin') {
        throw new Error('Forbidden: Only platform admins can invite business administrators')
      }

      // Check if user already exists with this email
      const { data: existingUser } = await supabaseClient
        .from('business_users')
        .select('id')
        .eq('email', invitationData.email)
        .eq('business_id', invitationData.business_id)
        .is('deleted_at', null)
        .single()

      if (existingUser) {
        throw new Error('A user with this email already exists in this business')
      }

      // Check if pending invitation already exists
      const { data: existingInvitation } = await supabaseClient
        .from('invitations')
        .select('id')
        .eq('email', invitationData.email)
        .eq('business_id', invitationData.business_id)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())
        .single()

      if (existingInvitation) {
        throw new Error('A pending invitation already exists for this email')
      }

      // Get business details
      const { data: business } = await supabaseClient
        .from('businesses')
        .select('name, business_type_id')
        .eq('id', invitationData.business_id)
        .single()

      if (!business) {
        throw new Error('Business not found')
      }

      const { data: businessType } = await supabaseClient
        .from('business_types')
        .select('name')
        .eq('id', business.business_type_id)
        .single()

      // Create invitation
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7)

      const { data: invitation, error: createError } = await supabaseClient
        .from('invitations')
        .insert({
          business_id: invitationData.business_id,
          email: invitationData.email,
          role: invitationData.role,
          status: 'pending',
          expires_at: expiresAt.toISOString(),
          created_by: auth.user_id,
        })
        .select('id')
        .single()

      if (createError) {
        throw new Error(`Failed to create invitation: ${createError.message}`)
      }

      // Send email
      const invitationLink = generateInvitationLink(invitation.id)
      
      const templateData = {
        first_name: invitationData.first_name,
        business_name: business.name,
        business_type: businessType?.name || 'Business',
        invitation_link: invitationLink,
        expiry_date: expiresAt.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        support_url: Deno.env.get('SUPPORT_URL') || 'https://mneselect.me/support',
        terms_url: Deno.env.get('TERMS_URL') || 'https://mneselect.me/terms',
        privacy_url: Deno.env.get('PRIVACY_URL') || 'https://mneselect.me/privacy',
      }

      const { html, text, subject } = invitationData.role === 'admin'
        ? renderBusinessAdminInvitation(templateData)
        : renderTeamMemberInvitation({
            ...templateData,
            inviter_name: `${auth.email}`, // Could fetch actual name
            inviter_email: auth.email,
          })

      await sendEmail({
        to: invitationData.email,
        subject,
        html,
        text,
      })

      // Update sent_at
      await supabaseClient
        .from('invitations')
        .update({ sent_at: new Date().toISOString() })
        .eq('id', invitation.id)

      return new Response(
        JSON.stringify({
          success: true,
          data: {
            invitation_id: invitation.id,
          },
        }),
        {
          status: 201,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      )
    }

  } catch (error) {
    console.error('Error in send-invitation:', error)

    let statusCode = 500
    if (error instanceof ValidationError) {
      statusCode = 400
    } else if (error.message.includes('Forbidden')) {
      statusCode = 403
    } else if (error.message.includes('authorization')) {
      statusCode = 401
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal server error',
      }),
      {
        status: statusCode,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  }
})
```

---

### 3. Accept Invitation & Create User

**Endpoint**: `POST /functions/v1/accept-invitation`

**Purpose**: Accept an invitation and create a new business user account.

**File**: `supabase/functions/accept-invitation/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from '@supabase/supabase-js@2'
import { ValidationError, isValidEmail } from '../_shared/validation.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { invitation_id, email, password, first_name, last_name } = await req.json()

    // Validate input
    if (!invitation_id || !email || !password || !first_name || !last_name) {
      throw new ValidationError('All fields are required')
    }

    if (!isValidEmail(email)) {
      throw new ValidationError('Invalid email format')
    }

    if (password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters')
    }

    // Get invitation details
    const { data: invitation, error: invitationError } = await supabaseClient
      .from('invitations')
      .select('*, businesses(name)')
      .eq('id', invitation_id)
      .eq('status', 'pending')
      .single()

    if (invitationError || !invitation) {
      throw new Error('Invalid or expired invitation')
    }

    // Verify email matches
    if (invitation.email.toLowerCase() !== email.toLowerCase()) {
      throw new Error('Email does not match invitation')
    }

    // Check if expired
    if (new Date(invitation.expires_at) < new Date()) {
      // Mark as expired
      await supabaseClient
        .from('invitations')
        .update({ status: 'expired' })
        .eq('id', invitation_id)

      throw new Error('This invitation has expired')
    }

    // Create auth user
    const { data: authData, error: authError } = await supabaseClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        role: 'business_user',
        first_name,
        last_name,
      },
    })

    if (authError) {
      throw new Error(`Failed to create user account: ${authError.message}`)
    }

    // Create business_users record
    const { error: businessUserError } = await supabaseClient
      .from('business_users')
      .insert({
        user_id: authData.user.id,
        business_id: invitation.business_id,
        first_name,
        last_name,
        email,
        role: invitation.role,
        is_active: true,
        created_by: invitation.created_by,
      })

    if (businessUserError) {
      // Cleanup: delete auth user if business_users creation failed
      await supabaseClient.auth.admin.deleteUser(authData.user.id)
      throw new Error(`Failed to create business user: ${businessUserError.message}`)
    }

    // Mark invitation as accepted
    await supabaseClient
      .from('invitations')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString(),
      })
      .eq('id', invitation_id)

    // Return success with session
    const { data: sessionData, error: sessionError } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    })

    if (sessionError) {
      console.error('Failed to create session:', sessionError)
      // Don't fail the operation, user can log in manually
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Account created successfully',
        data: {
          user_id: authData.user.id,
          business_id: invitation.business_id,
          business_name: invitation.businesses.name,
          session: sessionData?.session || null,
        },
      }),
      {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )

  } catch (error) {
    console.error('Error in accept-invitation:', error)

    let statusCode = 500
    if (error instanceof ValidationError) {
      statusCode = 400
    } else if (error.message.includes('Invalid') || error.message.includes('expired')) {
      statusCode = 400
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal server error',
      }),
      {
        status: statusCode,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  }
})
```

---

### 4. List Business Invitations

**Endpoint**: `GET /functions/v1/list-business-invitations?business_id=xxx`

**Purpose**: List all invitations for a business (for admins to manage).

**File**: `supabase/functions/list-business-invitations/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from '@supabase/supabase-js@2'
import { authenticateRequest, isPlatformAdmin, isBusinessAdmin } from '../_shared/auth.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const auth = await authenticateRequest(req, supabaseClient)

    // Get business_id from query params
    const url = new URL(req.url)
    const businessId = url.searchParams.get('business_id')

    if (!businessId) {
      throw new Error('business_id query parameter is required')
    }

    // Authorization check
    const isPlatformAdminUser = await isPlatformAdmin(auth.user_id, supabaseClient)
    const isBusinessAdminUser = await isBusinessAdmin(auth.user_id, businessId, supabaseClient)

    if (!isPlatformAdminUser && !isBusinessAdminUser) {
      throw new Error('Forbidden: You do not have permission to view these invitations')
    }

    // Fetch invitations
    const { data: invitations, error } = await supabaseClient
      .from('invitations')
      .select('id, email, role, status, expires_at, sent_at, accepted_at, created_at, resent_count')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch invitations: ${error.message}`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: invitations,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )

  } catch (error) {
    console.error('Error in list-business-invitations:', error)

    let statusCode = 500
    if (error.message.includes('Forbidden')) {
      statusCode = 403
    } else if (error.message.includes('authorization')) {
      statusCode = 401
    } else if (error.message.includes('required')) {
      statusCode = 400
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal server error',
      }),
      {
        status: statusCode,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  }
})
```

---

## Scheduled Functions

### Cleanup Expired Invitations

**Purpose**: Automatically delete expired invitations that are past their expiry date.

**Schedule**: Run daily at 2:00 AM UTC

**Implementation**: Use Supabase SQL Cron

```sql
-- Create cleanup function
CREATE OR REPLACE FUNCTION cleanup_expired_invitations()
RETURNS void AS $$
BEGIN
  -- Mark expired invitations
  UPDATE invitations
  SET status = 'expired'
  WHERE status = 'pending'
    AND expires_at < NOW();
  
  -- Delete expired invitations older than 30 days (for audit trail)
  DELETE FROM invitations
  WHERE status = 'expired'
    AND expires_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Schedule via pg_cron (requires pg_cron extension)
SELECT cron.schedule(
  'cleanup-expired-invitations',
  '0 2 * * *', -- Daily at 2 AM UTC
  $$SELECT cleanup_expired_invitations()$$
);
```

---

## Environment Variables

Required for all edge functions:

```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Email Service (SendGrid)
sendgrid_key=SG.xxxxxxxxxxxx  # Already configured in Supabase Secrets ✅

# Application URLs
PORTAL_APP_URL=https://portal.montenegroselect.me
SUPPORT_URL=https://montenegroselect.me/support
TERMS_URL=https://montenegroselect.me/terms
PRIVACY_URL=https://montenegroselect.me/privacy
```

---

## Testing Edge Functions

### Local Testing

```bash
# Start functions locally
supabase functions serve

# Test create-business
curl -X POST http://localhost:54321/functions/v1/create-business \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d @test-data/create-business.json

# Test send-invitation
curl -X POST http://localhost:54321/functions/v1/send-invitation \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d @test-data/send-invitation.json
```

---

## Deployment

```bash
# Deploy all functions
supabase functions deploy create-business
supabase functions deploy send-invitation
supabase functions deploy accept-invitation
supabase functions deploy list-business-invitations

# Set environment variables
supabase secrets set --env-file .env.production
```

---

## Error Handling Best Practices

1. **Always return JSON responses**
2. **Use appropriate HTTP status codes**
3. **Log errors with context**
4. **Never expose sensitive information in error messages**
5. **Implement retry logic for external services (email)**
6. **Use transactions where multiple operations must succeed together**

---

## References

- [Supabase Edge Functions Documentation](https://supabase.com/docs/guides/functions)
- [Deno Deploy Documentation](https://deno.com/deploy/docs)
- [Supabase Auth Admin API](https://supabase.com/docs/reference/javascript/auth-admin-api)
