/**
 * Shared TypeScript types for MNE Select
 * These types are used across all applications and packages
 */

// User types
export interface User {
  id: string
  email: string
  role: UserRole
  profile?: UserProfile
  createdAt: string
  updatedAt: string
}

export type UserRole = 'admin' | 'business_owner' | 'staff' | 'guest'

export interface UserProfile {
  firstName?: string
  lastName?: string
  phoneNumber?: string
  avatarUrl?: string
}

// Business types
export interface Business {
  id: string
  name: string
  type: BusinessType
  description?: string
  logoUrl?: string
  coverImageUrl?: string
  contactEmail?: string
  contactPhone?: string
  address?: Address
  status: BusinessStatus
  ownerId: string
  createdAt: string
  updatedAt: string
}

export type BusinessType = 'restaurant' | 'gym' | 'spa' | 'hotel' | 'activity' | 'other'

export type BusinessStatus = 'active' | 'pending' | 'suspended' | 'inactive'

export interface Address {
  street?: string
  city?: string
  region?: string
  country: string
  postalCode?: string
  coordinates?: {
    latitude: number
    longitude: number
  }
}

// Invitation types
export interface Invitation {
  id: string
  email: string
  role: UserRole
  businessId?: string
  token: string
  status: InvitationStatus
  expiresAt: string
  createdAt: string
  usedAt?: string
}

export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'revoked'

// API Response types
export interface ApiResponse<T> {
  data?: T
  error?: ApiError
  metadata?: {
    page?: number
    pageSize?: number
    totalCount?: number
  }
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, any>
}
