/**
 * Input Validation Utilities
 * 
 * Validates and sanitizes user input for edge functions.
 */

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  return emailRegex.test(email);
}

/**
 * Business data interface
 */
export interface BusinessData {
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

/**
 * Validate business data
 */
export function validateBusinessData(data: any): BusinessData {
  const errors: string[] = [];

  // Required fields
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push('Business name is required');
  }

  if (!data.business_type_id || typeof data.business_type_id !== 'string') {
    errors.push('Business type is required');
  }

  // Address validation
  if (!data.address || typeof data.address !== 'object') {
    errors.push('Address is required');
  } else {
    if (!data.address.address_line_1 || data.address.address_line_1.trim().length === 0) {
      errors.push('Address line 1 is required');
    }
    if (!data.address.city || data.address.city.trim().length === 0) {
      errors.push('City is required');
    }
    if (!data.address.country || data.address.country.trim().length === 0) {
      errors.push('Country is required');
    }

    // Optional lat/long validation
    if (
      data.address.latitude !== undefined &&
      (typeof data.address.latitude !== 'number' ||
        data.address.latitude < -90 ||
        data.address.latitude > 90)
    ) {
      errors.push('Invalid latitude (must be between -90 and 90)');
    }

    if (
      data.address.longitude !== undefined &&
      (typeof data.address.longitude !== 'number' ||
        data.address.longitude < -180 ||
        data.address.longitude > 180)
    ) {
      errors.push('Invalid longitude (must be between -180 and 180)');
    }
  }

  // PDV validation
  if (data.is_pdv_registered === true && !data.pdv_number) {
    errors.push('PDV number is required when PDV registered');
  }

  // Booking commission validation
  if (data.accepts_bookings === true) {
    if (data.default_booking_commission === undefined) {
      errors.push('Booking commission is required when bookings are enabled');
    } else if (
      typeof data.default_booking_commission !== 'number' ||
      data.default_booking_commission < 0
    ) {
      errors.push('Booking commission must be a positive number');
    }
  }

  // Admin email validation
  if (!data.admin_email || !isValidEmail(data.admin_email)) {
    errors.push('Valid admin email is required');
  }

  if (!data.admin_first_name || data.admin_first_name.trim().length === 0) {
    errors.push('Admin first name is required');
  }

  if (!data.admin_last_name || data.admin_last_name.trim().length === 0) {
    errors.push('Admin last name is required');
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join('; '));
  }

  return data as BusinessData;
}

/**
 * Invitation data interface
 */
export interface InvitationData {
  business_id: string;
  email: string;
  role: 'admin' | 'team_member';
  first_name: string;
  last_name: string;
}

/**
 * Validate invitation data
 */
export function validateInvitationData(data: any): InvitationData {
  const errors: string[] = [];

  if (!data.business_id || typeof data.business_id !== 'string') {
    errors.push('Business ID is required');
  }

  if (!data.email || !isValidEmail(data.email)) {
    errors.push('Valid email is required');
  }

  if (!data.role || !['admin', 'team_member'].includes(data.role)) {
    errors.push('Role must be either "admin" or "team_member"');
  }

  if (!data.first_name || data.first_name.trim().length === 0) {
    errors.push('First name is required');
  }

  if (!data.last_name || data.last_name.trim().length === 0) {
    errors.push('Last name is required');
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join('; '));
  }

  return data as InvitationData;
}

/**
 * Validate accept invitation data
 */
export interface AcceptInvitationData {
  invitation_id: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

export function validateAcceptInvitationData(data: any): AcceptInvitationData {
  const errors: string[] = [];

  if (!data.invitation_id || typeof data.invitation_id !== 'string') {
    errors.push('Invitation ID is required');
  }

  if (!data.email || !isValidEmail(data.email)) {
    errors.push('Valid email is required');
  }

  if (!data.password || data.password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }

  if (!data.first_name || data.first_name.trim().length === 0) {
    errors.push('First name is required');
  }

  if (!data.last_name || data.last_name.trim().length === 0) {
    errors.push('Last name is required');
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join('; '));
  }

  return data as AcceptInvitationData;
}

/**
 * Custom validation error
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}
