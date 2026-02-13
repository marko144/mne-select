/**
 * Email Service - SendGrid Integration
 * 
 * Handles email sending via SendGrid for the MNE Select platform.
 * Configured to use noreply@montenegroselect.me as the sender.
 */

import sgMail from 'npm:@sendgrid/mail@8.1.0';

// Initialize SendGrid with API key from Supabase Secrets
const SENDGRID_API_KEY = Deno.env.get('sendgrid_key');

if (!SENDGRID_API_KEY) {
  throw new Error('sendgrid_key secret is not configured in Supabase');
}

sgMail.setApiKey(SENDGRID_API_KEY);

/**
 * Email sending parameters
 */
export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text: string;
  from?: string;
  replyTo?: string;
}

/**
 * Email sending result
 */
export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send an email via SendGrid
 * 
 * @param params - Email parameters
 * @returns Promise with send result
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
  from = 'MNE Select <noreply@montenegroselect.me>',
  replyTo = 'support@montenegroselect.me',
}: SendEmailParams): Promise<SendEmailResult> {
  try {
    console.log('Sending email:', {
      to,
      subject,
      from,
      timestamp: new Date().toISOString(),
    });

    const msg = {
      to,
      from,
      subject,
      text,
      html,
      replyTo,
    };

    const [response] = await sgMail.send(msg);

    const messageId = response.headers['x-message-id'] as string;

    console.log('Email sent successfully:', {
      to,
      subject,
      messageId,
      statusCode: response.statusCode,
    });

    return {
      success: true,
      messageId,
    };
  } catch (error) {
    console.error('SendGrid error:', {
      message: error.message,
      code: error.code,
      response: error.response?.body,
      to,
      subject,
    });

    return {
      success: false,
      error: `Failed to send email: ${error.message}`,
    };
  }
}

/**
 * Send an invitation email
 * Wrapper function for sending invitation emails with proper error handling
 */
export async function sendInvitationEmail(
  to: string,
  subject: string,
  html: string,
  text: string,
): Promise<SendEmailResult> {
  return sendEmail({
    to,
    subject,
    html,
    text,
  });
}

/**
 * Validate email address format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  return emailRegex.test(email);
}
