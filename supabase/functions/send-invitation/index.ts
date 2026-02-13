/**
 * Send/Resend Invitation
 * 
 * Send a new invitation or resend an existing pending invitation.
 * 
 * POST /functions/v1/send-invitation
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { authenticateRequest, isPlatformAdmin, isBusinessAdmin } from '../_shared/auth.ts';
import { validateInvitationData, ValidationError } from '../_shared/validation.ts';
import { sendEmail } from '../_shared/email-service.ts';
import {
  renderBusinessAdminInvitation,
  renderTeamMemberInvitation,
  renderInvitationResent,
  generateInvitationLink,
  formatDate,
  getEnvironmentUrls,
} from '../_shared/email-templates.ts';

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

    const auth = await authenticateRequest(req, supabaseClient);
    const requestData = await req.json();

    // Check if this is a resend operation
    const isResend = !!requestData.invitation_id;

    if (isResend) {
      // Resend existing invitation
      console.log('Resending invitation:', requestData.invitation_id);

      // Get invitation details
      const { data: invitation, error: invitationError } = await supabaseClient
        .from('invitations')
        .select('*, businesses(name, business_type_id)')
        .eq('id', requestData.invitation_id)
        .eq('status', 'pending')
        .single();

      if (invitationError || !invitation) {
        throw new Error('Invitation not found or already used');
      }

      // Check if invitation is expired
      if (new Date(invitation.expires_at) < new Date()) {
        throw new Error('Invitation has expired and cannot be resent');
      }

      // Authorization: Platform admin OR business admin of this business
      const isPlatformAdminUser = await isPlatformAdmin(auth.user_id, supabaseClient);
      const isBusinessAdminUser = await isBusinessAdmin(
        auth.user_id,
        invitation.business_id,
        supabaseClient,
      );

      if (!isPlatformAdminUser && !isBusinessAdminUser) {
        throw new Error('Forbidden: You do not have permission to resend this invitation');
      }

      // Get business type name
      const { data: businessType } = await supabaseClient
        .from('business_types')
        .select('name')
        .eq('id', invitation.businesses.business_type_id)
        .single();

      // Render and send email
      const invitationLink = generateInvitationLink(invitation.id);
      const expiryDate = formatDate(new Date(invitation.expires_at));

      const { html, text, subject } = renderInvitationResent({
        first_name: requestData.first_name || 'there',
        business_name: invitation.businesses.name,
        role: invitation.role === 'admin' ? 'Administrator' : 'Team Member',
        invitation_link: invitationLink,
        expiry_date: expiryDate,
      });

      const emailResult = await sendEmail({
        to: invitation.email,
        subject,
        html,
        text,
      });

      if (!emailResult.success) {
        throw new Error(`Failed to send email: ${emailResult.error}`);
      }

      // Update invitation resend tracking
      await supabaseClient
        .from('invitations')
        .update({
          resent_count: invitation.resent_count + 1,
          last_resent_at: new Date().toISOString(),
        })
        .eq('id', invitation.id);

      console.log('Invitation resent successfully');

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Invitation resent successfully',
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        },
      );
    } else {
      // Create new invitation
      console.log('Creating new invitation');

      const invitationData = validateInvitationData(requestData);

      // Authorization check
      const isPlatformAdminUser = await isPlatformAdmin(auth.user_id, supabaseClient);
      const isBusinessAdminUser = await isBusinessAdmin(
        auth.user_id,
        invitationData.business_id,
        supabaseClient,
      );

      if (!isPlatformAdminUser && !isBusinessAdminUser) {
        throw new Error('Forbidden: You do not have permission to send invitations');
      }

      // Business admins can only invite team members, not other admins
      if (isBusinessAdminUser && !isPlatformAdminUser && invitationData.role === 'admin') {
        throw new Error('Forbidden: Only platform admins can invite business administrators');
      }

      // Check if user already exists with this email
      const { data: existingUser } = await supabaseClient
        .from('business_users')
        .select('id')
        .eq('email', invitationData.email)
        .eq('business_id', invitationData.business_id)
        .is('deleted_at', null)
        .single();

      if (existingUser) {
        throw new Error('A user with this email already exists in this business');
      }

      // Check if pending invitation already exists
      const { data: existingInvitation } = await supabaseClient
        .from('invitations')
        .select('id')
        .eq('email', invitationData.email)
        .eq('business_id', invitationData.business_id)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())
        .single();

      if (existingInvitation) {
        throw new Error('A pending invitation already exists for this email');
      }

      // Get business details
      const { data: business } = await supabaseClient
        .from('businesses')
        .select('name, business_type_id')
        .eq('id', invitationData.business_id)
        .single();

      if (!business) {
        throw new Error('Business not found');
      }

      const { data: businessType } = await supabaseClient
        .from('business_types')
        .select('name')
        .eq('id', business.business_type_id)
        .single();

      // Create invitation
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const { data: invitation, error: createError } = await supabaseClient
        .from('invitations')
        .insert({
          business_id: invitationData.business_id,
          email: invitationData.email,
          role: invitationData.role,
          status: 'pending',
          expires_at: expiresAt.toISOString(),
          created_by: auth.user_id,
        })
        .select('id')
        .single();

      if (createError) {
        throw new Error(`Failed to create invitation: ${createError.message}`);
      }

      console.log('Invitation created:', invitation.id);

      // Send email
      const invitationLink = generateInvitationLink(invitation.id);
      const urls = getEnvironmentUrls();

      const templateData = {
        first_name: invitationData.first_name,
        business_name: business.name,
        business_type: businessType?.name || 'Business',
        invitation_link: invitationLink,
        expiry_date: formatDate(expiresAt),
        ...urls,
      };

      const { html, text, subject } = invitationData.role === 'admin'
        ? renderBusinessAdminInvitation(templateData)
        : renderTeamMemberInvitation({
          ...templateData,
          inviter_name: auth.email,
          inviter_email: auth.email,
        });

      const emailResult = await sendEmail({
        to: invitationData.email,
        subject,
        html,
        text,
      });

      if (emailResult.success) {
        // Update sent_at
        await supabaseClient
          .from('invitations')
          .update({ sent_at: new Date().toISOString() })
          .eq('id', invitation.id);

        console.log('Invitation email sent successfully');
      } else {
        console.error('Failed to send invitation email:', emailResult.error);
      }

      return new Response(
        JSON.stringify({
          success: true,
          data: {
            invitation_id: invitation.id,
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
  } catch (error) {
    console.error('Error in send-invitation:', error);

    let statusCode = 500;
    if (error instanceof ValidationError) {
      statusCode = 400;
    } else if (error.message.includes('Forbidden')) {
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
