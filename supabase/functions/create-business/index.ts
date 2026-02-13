/**
 * Create Business & Send First Invitation
 * 
 * Platform admins create a new business and automatically send an invitation
 * to the first admin user.
 * 
 * POST /functions/v1/create-business
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { authenticateRequest, requirePlatformAdmin } from '../_shared/auth.ts';
import { validateBusinessData, ValidationError } from '../_shared/validation.ts';
import { sendEmail } from '../_shared/email-service.ts';
import { renderBusinessAdminInvitation, generateInvitationLink, getEnvironmentUrls, formatDate } from '../_shared/email-templates.ts';

serve(async (req) => {
  // CORS preflight
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
    // Initialize Supabase client with service role
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );

    // Authenticate and authorize request
    const auth = await authenticateRequest(req, supabaseClient);
    await requirePlatformAdmin(auth.user_id, supabaseClient);

    // Parse and validate request body
    const requestData = await req.json();
    const businessData = validateBusinessData(requestData);

    console.log('Creating business:', businessData.name);

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
      .single();

    if (addressError) {
      throw new Error(`Failed to create address: ${addressError.message}`);
    }

    console.log('Address created:', address.id);

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
      .single();

    if (businessError) {
      // Cleanup: delete address if business creation failed
      await supabaseClient.from('addresses').delete().eq('id', address.id);
      throw new Error(`Failed to create business: ${businessError.message}`);
    }

    console.log('Business created:', business.id);

    // Step 3: Get business type name for email
    const { data: businessType } = await supabaseClient
      .from('business_types')
      .select('name')
      .eq('id', businessData.business_type_id)
      .single();

    // Step 4: Create invitation
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

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
      .single();

    if (invitationError) {
      throw new Error(`Failed to create invitation: ${invitationError.message}`);
    }

    console.log('Invitation created:', invitation.id);

    // Step 5: Send invitation email
    const invitationLink = generateInvitationLink(invitation.id);
    const urls = getEnvironmentUrls();
    
    const { html, text, subject } = renderBusinessAdminInvitation({
      first_name: businessData.admin_first_name,
      business_name: business.name,
      business_type: businessType?.name || 'Business',
      invitation_link: invitationLink,
      expiry_date: formatDate(expiresAt),
      ...urls,
    });

    try {
      const emailResult = await sendEmail({
        to: businessData.admin_email,
        subject,
        html,
        text,
      });

      if (emailResult.success) {
        // Update invitation sent_at timestamp
        await supabaseClient
          .from('invitations')
          .update({ sent_at: new Date().toISOString() })
          .eq('id', invitation.id);
        
        console.log('Invitation email sent successfully');
      } else {
        console.error('Failed to send invitation email:', emailResult.error);
      }
    } catch (emailError) {
      console.error('Failed to send invitation email:', emailError);
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
      },
    );
  } catch (error) {
    console.error('Error in create-business:', error);

    // Determine appropriate status code
    let statusCode = 500;
    if (error instanceof ValidationError) {
      statusCode = 400;
    } else if (error.message.includes('Forbidden') || error.message.includes('admin')) {
      statusCode = 403;
    } else if (error.message.includes('authorization')) {
      statusCode = 401;
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
