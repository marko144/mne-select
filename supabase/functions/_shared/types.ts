/**
 * Shared TypeScript Types
 * 
 * Common type definitions used across edge functions.
 */

/**
 * Authenticated request with user info
 */
export interface AuthenticatedRequest {
  user_id: string;
  email: string;
  role?: string;
}

/**
 * Business types enum
 */
export type BusinessUserRole = 'admin' | 'team_member';
export type InvitationStatus = 'pending' | 'accepted' | 'expired';
export type BusinessStatus = 'active' | 'suspended';

/**
 * Database record interfaces
 */
export interface BusinessType {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon_name?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Address {
  id: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  country: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface Business {
  id: string;
  name: string;
  business_type_id: string;
  address_id?: string;
  license_document_number?: string;
  is_pdv_registered: boolean;
  pdv_number?: string;
  pib?: string;
  company_number?: string;
  accepts_bookings: boolean;
  default_booking_commission?: number;
  status: BusinessStatus;
  created_at: string;
  created_by?: string;
  updated_at: string;
  updated_by?: string;
  deleted_at?: string;
}

export interface BusinessUser {
  id: string;
  user_id: string;
  business_id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: BusinessUserRole;
  is_active: boolean;
  created_at: string;
  created_by?: string;
  updated_at: string;
  updated_by?: string;
  deleted_at?: string;
}

export interface PlatformAdmin {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  is_active: boolean;
  created_at: string;
  created_by?: string;
  updated_at: string;
  updated_by?: string;
  deleted_at?: string;
}

export interface Invitation {
  id: string;
  business_id: string;
  email: string;
  role: BusinessUserRole;
  status: InvitationStatus;
  expires_at: string;
  accepted_at?: string;
  sent_at?: string;
  resent_count: number;
  last_resent_at?: string;
  created_at: string;
  created_by: string;
  updated_at: string;
}

/**
 * API response types
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ErrorResponse {
  error: string;
  details?: string;
}

/**
 * Email sending result
 */
export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}
