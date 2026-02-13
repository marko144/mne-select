/**
 * API Contract Types for Edge Functions
 * 
 * These types define the request/response contracts for all API endpoints.
 * Frontend developers should import these types for type-safe API calls.
 */

import type { Database } from './database.types';

// Utility types from database
export type BusinessUserRole = Database['public']['Enums']['business_user_role'];
export type InvitationStatus = Database['public']['Enums']['invitation_status'];
export type BusinessStatus = Database['public']['Enums']['business_status'];

// Database table types
export type BusinessType = Database['public']['Tables']['business_types']['Row'];
export type Address = Database['public']['Tables']['addresses']['Row'];
export type Business = Database['public']['Tables']['businesses']['Row'];
export type BusinessUser = Database['public']['Tables']['business_users']['Row'];
export type PlatformAdmin = Database['public']['Tables']['platform_admins']['Row'];
export type Invitation = Database['public']['Tables']['invitations']['Row'];

// ============================================================================
// COMMON TYPES
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
}

// ============================================================================
// ENDPOINT: POST /functions/v1/create-business
// ============================================================================

export interface CreateBusinessRequest {
  name: string;
  business_type_id: string;
  address: {
    address_line_1: string;
    address_line_2?: string;
    city: string;
    country: string;
    postal_code?: string;
    latitude?: number;
    longitude?: number;
  };
  license_document_number?: string;
  is_pdv_registered: boolean;
  pdv_number?: string;
  pib?: string;
  company_number?: string;
  accepts_bookings: boolean;
  default_booking_commission?: number;
  admin_email: string;
  admin_first_name: string;
  admin_last_name: string;
}

export interface CreateBusinessResponse {
  success: true;
  data: {
    business_id: string;
    business_name: string;
    invitation_id: string;
    invitation_sent: boolean;
  };
}

// ============================================================================
// ENDPOINT: POST /functions/v1/send-invitation
// ============================================================================

// Send new invitation
export interface SendInvitationRequest {
  business_id: string;
  email: string;
  role: BusinessUserRole;
  first_name: string;
  last_name: string;
}

// Resend existing invitation
export interface ResendInvitationRequest {
  invitation_id: string;
  first_name?: string;
}

export type SendInvitationRequestBody = SendInvitationRequest | ResendInvitationRequest;

export interface SendInvitationResponse {
  success: true;
  data?: {
    invitation_id: string;
  };
  message?: string;
}

// ============================================================================
// ENDPOINT: POST /functions/v1/accept-invitation
// ============================================================================

export interface AcceptInvitationRequest {
  invitation_id: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

export interface AcceptInvitationResponse {
  success: true;
  message: string;
  data: {
    user: {
      id: string;
      email: string;
      [key: string]: unknown;
    };
    session?: {
      access_token: string;
      refresh_token: string;
      expires_at: number;
      [key: string]: unknown;
    };
    business_name: string;
  };
}

// ============================================================================
// ENDPOINT: GET /functions/v1/list-business-invitations
// ============================================================================

export interface ListInvitationsRequest {
  business_id: string; // Query parameter
}

export interface InvitationListItem {
  id: string;
  email: string;
  role: BusinessUserRole;
  status: InvitationStatus;
  expires_at: string;
  sent_at: string | null;
  accepted_at: string | null;
  created_at: string;
  resent_count: number;
  last_resent_at: string | null;
}

export interface ListInvitationsResponse {
  success: true;
  data: InvitationListItem[];
}

// ============================================================================
// AUTH TYPES
// ============================================================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    user_metadata: {
      role?: string;
      first_name?: string;
      last_name?: string;
    };
  };
  session: {
    access_token: string;
    refresh_token: string;
    expires_at: number;
  };
}

// ============================================================================
// BUSINESS TYPES
// ============================================================================

export interface BusinessWithRelations extends Business {
  business_type?: BusinessType;
  address?: Address;
}

export interface BusinessUserWithRelations extends BusinessUser {
  business?: BusinessWithRelations;
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isApiError(response: unknown): response is ApiError {
  return (
    typeof response === 'object' &&
    response !== null &&
    'success' in response &&
    response.success === false &&
    'error' in response
  );
}

export function isApiResponse<T>(response: unknown): response is ApiResponse<T> {
  return (
    typeof response === 'object' &&
    response !== null &&
    'success' in response &&
    typeof response.success === 'boolean'
  );
}

// ============================================================================
// VALIDATION TYPES
// ============================================================================

export interface ValidationError {
  field?: string;
  message: string;
}

export interface ValidationErrorResponse {
  success: false;
  error: string;
  validationErrors?: ValidationError[];
}
