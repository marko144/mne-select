/**
 * Authentication utilities for MNE Select
 * Supports two authentication flows:
 * 1. Public sign-up (for guests app)
 * 2. Invitation-based sign-up (for portal app)
 */

import type { SupabaseClient } from '@supabase/supabase-js'

export interface SignUpOptions {
  email: string
  password: string
  metadata?: Record<string, any>
}

export interface InviteSignUpOptions extends SignUpOptions {
  invitationToken: string
}

/**
 * Public sign-up for guests application
 * Users can register themselves with email verification
 */
export async function publicSignUp(
  supabase: SupabaseClient,
  options: SignUpOptions
) {
  const { data, error } = await supabase.auth.signUp({
    email: options.email,
    password: options.password,
    options: {
      data: options.metadata,
      emailRedirectTo: `${process.env.NEXT_PUBLIC_GUESTS_URL}/auth/callback`,
    },
  })

  if (error) throw error
  return data
}

/**
 * Invitation-based sign-up for portal application
 * Users must have a valid invitation token to register
 */
export async function inviteSignUp(
  supabase: SupabaseClient,
  options: InviteSignUpOptions
) {
  // Validate invitation token first
  const { data: invitation, error: validationError } = await supabase
    .from('invitations')
    .select('*')
    .eq('token', options.invitationToken)
    .eq('status', 'pending')
    .single()

  if (validationError || !invitation) {
    throw new Error('Invalid or expired invitation')
  }

  // Create user account
  const { data, error } = await supabase.auth.signUp({
    email: options.email,
    password: options.password,
    options: {
      data: {
        ...options.metadata,
        invitationId: invitation.id,
        role: invitation.role,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_PORTAL_URL}/auth/callback`,
    },
  })

  if (error) throw error

  // Mark invitation as used
  if (data.user) {
    await supabase
      .from('invitations')
      .update({ status: 'accepted', used_at: new Date().toISOString() })
      .eq('id', invitation.id)
  }

  return data
}

/**
 * Sign in with email and password
 * Works for both portal and guests users
 */
export async function signIn(
  supabase: SupabaseClient,
  email: string,
  password: string
) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
  return data
}

/**
 * Sign out current user
 */
export async function signOut(supabase: SupabaseClient) {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

/**
 * Get current session
 */
export async function getSession(supabase: SupabaseClient) {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data.session
}
