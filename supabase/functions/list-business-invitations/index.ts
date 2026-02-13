/**
 * List Business Invitations
 * 
 * List all invitations for a business (for admins to manage).
 * Platform admins can view any business, business admins can only view their own.
 * 
 * GET /functions/v1/list-business-invitations?business_id=xxx
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { authenticateRequest, isPlatformAdmin, isBusinessAdmin } from '../_shared/auth.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
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

    const auth = await authenticateRequest(req, supabaseClient);

    // Get business_id from query params
    const url = new URL(req.url);
    const businessId = url.searchParams.get('business_id');

    if (!businessId) {
      throw new Error('business_id query parameter is required');
    }

    console.log('Listing invitations for business:', businessId);

    // Authorization check
    const isPlatformAdminUser = await isPlatformAdmin(auth.user_id, supabaseClient);
    const isBusinessAdminUser = await isBusinessAdmin(auth.user_id, businessId, supabaseClient);

    if (!isPlatformAdminUser && !isBusinessAdminUser) {
      throw new Error('Forbidden: You do not have permission to view these invitations');
    }

    // Fetch invitations
    const { data: invitations, error } = await supabaseClient
      .from('invitations')
      .select('id, email, role, status, expires_at, sent_at, accepted_at, created_at, resent_count, last_resent_at')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch invitations: ${error.message}`);
    }

    console.log(`Found ${invitations.length} invitations`);

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
      },
    );
  } catch (error) {
    console.error('Error in list-business-invitations:', error);

    let statusCode = 500;
    if (error.message.includes('Forbidden')) {
      statusCode = 403;
    } else if (error.message.includes('authorization')) {
      statusCode = 401;
    } else if (error.message.includes('required')) {
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
