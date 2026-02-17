/**
 * Shared TypeScript types for MNE Select
 * 
 * This package exports:
 * 1. Database types (auto-generated from Supabase schema)
 * 2. API contract types (for edge functions)
 */

// Export all database types
export * from './database.types';

// Export all API types
export * from './api.types';

// Re-export commonly used types for convenience
export type {
  // Database table types
  BusinessType,
  Address,
  Business,
  BusinessUser,
  PlatformAdmin,
  Invitation,
  // Enums
  BusinessUserRole,
  InvitationStatus,
  BusinessStatus,
  // API types
  ApiResponse,
  ApiError,
  // Request types
  CreateBusinessRequest,
  SendInvitationRequest,
  ResendInvitationRequest,
  AcceptInvitationRequest,
  // Response types
  CreateBusinessResponse,
  SendInvitationResponse,
  AcceptInvitationResponse,
  ListInvitationsResponse,
  InvitationListItem,
} from './api.types';

// Export cookie consent types
export * from './cookies';
