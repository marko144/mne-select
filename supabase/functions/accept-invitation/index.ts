/**
 * Accept Invitation & Create User
 * 
 * Accept an invitation and create a new business user account.
 * This is a public endpoint (no authentication required).
 * 
 * POST /functions/v1/accept-invitation
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { ValidationError, isValidEmail } from '../_shared/validation.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    const { invitation_id, email, password, first_name, last_name } = await req.json();

    console.log('Accepting invitation:', invitation_id);

    // Validate input
    if (!invitation_id || !email || !password || !first_name || !last_name) {
      throw new ValidationError('All fields are required');
    }

    if (!isValidEmail(email)) {
      throw new ValidationError('Invalid email format');
    }

    if (password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters');
    }

    // Get invitation details
    const { data: invitation, error: invitationError } = await supabaseClient
      .from('invitations')
      .select('*, businesses(name)')
      .eq('id', invitation_id)
      .eq('status', 'pending')
      .single();

    if (invitationError || !invitation) {
      throw new Error('Invalid or expired invitation');
    }

    // Verify email matches
    if (invitation.email.toLowerCase() !== email.toLowerCase()) {
      throw new Error('Email does not match invitation');
    }

    // Check if expired
    if (new Date(invitation.expires_at) < new Date()) {
      // Mark as expired
      await supabaseClient
        .from('invitations')
        .update({ status: 'expired' })
        .eq('id', invitation_id);

      throw new Error('This invitation has expired');
    }

    console.log('Creating auth user for:', email);

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
    });

    if (authError) {
      throw new Error(`Failed to create user account: ${authError.message}`);
    }

    console.log('Auth user created:', authData.user.id);

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
      });

    if (businessUserError) {
      // Cleanup: delete auth user if business_users creation failed
      console.error('Failed to create business_users record, cleaning up auth user');
      await supabaseClient.auth.admin.deleteUser(authData.user.id);
      throw new Error(`Failed to create business user: ${businessUserError.message}`);
    }

    console.log('Business user record created');

    // Mark invitation as accepted
    await supabaseClient
      .from('invitations')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString(),
      })
      .eq('id', invitation_id);

    console.log('Invitation marked as accepted');

    // Return success with session
    const { data: sessionData, error: sessionError } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (sessionError) {
      console.error('Failed to create session, but user was created successfully');
      // User was created successfully, just couldn't auto-login
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Account created successfully. Please log in.',
          data: {
            user_id: authData.user.id,
            email: authData.user.email,
            business_name: invitation.businesses?.name,
          },
        }),
        {
          status: 201,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        },
      );
    }

    // Return success with session
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Account created and logged in successfully',
        data: {
          user: sessionData.user,
          session: sessionData.session,
          business_name: invitation.businesses?.name,
        },
      }),
      {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      },
    );
  } catch (error) {
    console.error('Error in accept-invitation:', error);

    let statusCode = 500;
    if (error instanceof ValidationError) {
      statusCode = 400;
    } else if (error.message.includes('Invalid or expired')) {
      statusCode = 404;
    } else if (error.message.includes('Email does not match')) {
      statusCode = 400;
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
      },
    );
  }
});
