/**
 * Authentication and Authorization Utilities
 * 
 * Handles user authentication, role checking, and authorization logic
 * for Supabase Edge Functions.
 */

import { createClient, SupabaseClient } from 'npm:@supabase/supabase-js@2';

export interface AuthenticatedRequest {
  user_id: string;
  email: string;
  role?: string;
}

/**
 * Verify JWT token and extract user information
 * 
 * @param req - HTTP request with Authorization header
 * @param supabaseClient - Supabase client instance
 * @returns User information from JWT
 * @throws Error if authentication fails
 */
export async function authenticateRequest(
  req: Request,
  supabaseClient: SupabaseClient,
): Promise<AuthenticatedRequest> {
  const authHeader = req.headers.get('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid authorization header');
  }

  const token = authHeader.replace('Bearer ', '');

  const { data: { user }, error } = await supabaseClient.auth.getUser(token);

  if (error || !user) {
    throw new Error('Invalid or expired token');
  }

  return {
    user_id: user.id,
    email: user.email!,
    role: user.user_metadata?.role,
  };
}

/**
 * Check if user is a platform admin
 * 
 * @param userId - User's UUID
 * @param supabaseClient - Supabase client instance
 * @returns True if user is an active platform admin
 */
export async function isPlatformAdmin(
  userId: string,
  supabaseClient: SupabaseClient,
): Promise<boolean> {
  const { data, error } = await supabaseClient
    .from('platform_admins')
    .select('id')
    .eq('user_id', userId)
    .eq('is_active', true)
    .is('deleted_at', null)
    .single();

  return !error && data !== null;
}

/**
 * Check if user is a business admin for a specific business
 * 
 * @param userId - User's UUID
 * @param businessId - Business UUID
 * @param supabaseClient - Supabase client instance
 * @returns True if user is an active business admin
 */
export async function isBusinessAdmin(
  userId: string,
  businessId: string,
  supabaseClient: SupabaseClient,
): Promise<boolean> {
  const { data, error } = await supabaseClient
    .from('business_users')
    .select('id')
    .eq('user_id', userId)
    .eq('business_id', businessId)
    .eq('role', 'admin')
    .eq('is_active', true)
    .is('deleted_at', null)
    .single();

  return !error && data !== null;
}

/**
 * Require platform admin role or throw error
 * 
 * @param userId - User's UUID
 * @param supabaseClient - Supabase client instance
 * @throws Error if user is not a platform admin
 */
export async function requirePlatformAdmin(
  userId: string,
  supabaseClient: SupabaseClient,
): Promise<void> {
  const isAdmin = await isPlatformAdmin(userId, supabaseClient);

  if (!isAdmin) {
    throw new Error('Forbidden: Platform admin access required');
  }
}

/**
 * Get user's business ID
 * 
 * @param userId - User's UUID
 * @param supabaseClient - Supabase client instance
 * @returns Business ID or null if not a business user
 */
export async function getUserBusinessId(
  userId: string,
  supabaseClient: SupabaseClient,
): Promise<string | null> {
  const { data, error } = await supabaseClient
    .from('business_users')
    .select('business_id')
    .eq('user_id', userId)
    .eq('is_active', true)
    .is('deleted_at', null)
    .single();

  if (error || !data) {
    return null;
  }

  return data.business_id;
}

/**
 * Create Supabase client for edge function
 * Uses service role key for admin operations
 */
export function createServiceClient(): SupabaseClient {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  return createClient(supabaseUrl, supabaseServiceKey);
}

/**
 * Create Supabase client with user's JWT token
 * Uses anon key with user authentication
 */
export function createAuthenticatedClient(token: string): SupabaseClient {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
}
