/**
 * Email Templates - Handlebars Template Rendering
 * 
 * Renders email templates for the MNE Select invitation system.
 */

// deno-lint-ignore-file

/**
 * Generate invitation link from invitation ID
 */
export function generateInvitationLink(invitationId: string): string {
  const baseUrl = Deno.env.get('PORTAL_APP_URL') || 'http://localhost:3000';
  return `${baseUrl}/invite?id=${invitationId}`;
}

/**
 * Format date to readable string
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Get environment URLs
 */
export function getEnvironmentUrls() {
  return {
    support_url: Deno.env.get('SUPPORT_URL') || 'https://montenegroselect.me/support',
    terms_url: Deno.env.get('TERMS_URL') || 'https://montenegroselect.me/terms',
    privacy_url: Deno.env.get('PRIVACY_URL') || 'https://montenegroselect.me/privacy',
  };
}

// ============================================================================
// Template Data Interfaces
// ============================================================================

export interface BusinessAdminInvitationData {
  first_name: string;
  business_name: string;
  business_type: string;
  invitation_link: string;
  expiry_date: string;
  support_url: string;
  terms_url: string;
  privacy_url: string;
}

export interface TeamMemberInvitationData {
  first_name: string;
  business_name: string;
  business_type: string;
  inviter_name: string;
  inviter_email: string;
  invitation_link: string;
  expiry_date: string;
  support_url: string;
  terms_url: string;
  privacy_url: string;
}

export interface InvitationResentData {
  first_name: string;
  business_name: string;
  role: string;
  invitation_link: string;
  expiry_date: string;
}

export interface TemplateResult {
  html: string;
  text: string;
  subject: string;
}

// ============================================================================
// Template Rendering Functions
// ============================================================================

/**
 * Render Business Admin Invitation Email
 */
export function renderBusinessAdminInvitation(
  data: BusinessAdminInvitationData,
): TemplateResult {
  const html = BUSINESS_ADMIN_INVITATION_HTML
    .replace(/\{\{first_name\}\}/g, data.first_name)
    .replace(/\{\{business_name\}\}/g, data.business_name)
    .replace(/\{\{business_type\}\}/g, data.business_type)
    .replace(/\{\{invitation_link\}\}/g, data.invitation_link)
    .replace(/\{\{expiry_date\}\}/g, data.expiry_date)
    .replace(/\{\{support_url\}\}/g, data.support_url)
    .replace(/\{\{terms_url\}\}/g, data.terms_url)
    .replace(/\{\{privacy_url\}\}/g, data.privacy_url);

  const text = BUSINESS_ADMIN_INVITATION_TEXT
    .replace(/\{\{first_name\}\}/g, data.first_name)
    .replace(/\{\{business_name\}\}/g, data.business_name)
    .replace(/\{\{business_type\}\}/g, data.business_type)
    .replace(/\{\{invitation_link\}\}/g, data.invitation_link)
    .replace(/\{\{expiry_date\}\}/g, data.expiry_date)
    .replace(/\{\{support_url\}\}/g, data.support_url)
    .replace(/\{\{terms_url\}\}/g, data.terms_url)
    .replace(/\{\{privacy_url\}\}/g, data.privacy_url);

  return {
    html,
    text,
    subject: `You're invited to manage ${data.business_name} on MNE Select`,
  };
}

/**
 * Render Team Member Invitation Email
 */
export function renderTeamMemberInvitation(
  data: TeamMemberInvitationData,
): TemplateResult {
  const html = TEAM_MEMBER_INVITATION_HTML
    .replace(/\{\{first_name\}\}/g, data.first_name)
    .replace(/\{\{business_name\}\}/g, data.business_name)
    .replace(/\{\{business_type\}\}/g, data.business_type)
    .replace(/\{\{inviter_name\}\}/g, data.inviter_name)
    .replace(/\{\{inviter_email\}\}/g, data.inviter_email)
    .replace(/\{\{invitation_link\}\}/g, data.invitation_link)
    .replace(/\{\{expiry_date\}\}/g, data.expiry_date)
    .replace(/\{\{support_url\}\}/g, data.support_url)
    .replace(/\{\{terms_url\}\}/g, data.terms_url)
    .replace(/\{\{privacy_url\}\}/g, data.privacy_url);

  const text = TEAM_MEMBER_INVITATION_TEXT
    .replace(/\{\{first_name\}\}/g, data.first_name)
    .replace(/\{\{business_name\}\}/g, data.business_name)
    .replace(/\{\{business_type\}\}/g, data.business_type)
    .replace(/\{\{inviter_name\}\}/g, data.inviter_name)
    .replace(/\{\{inviter_email\}\}/g, data.inviter_email)
    .replace(/\{\{invitation_link\}\}/g, data.invitation_link)
    .replace(/\{\{expiry_date\}\}/g, data.expiry_date)
    .replace(/\{\{support_url\}\}/g, data.support_url)
    .replace(/\{\{terms_url\}\}/g, data.terms_url)
    .replace(/\{\{privacy_url\}\}/g, data.privacy_url);

  return {
    html,
    text,
    subject: `You're invited to join ${data.business_name} team on MNE Select`,
  };
}

/**
 * Render Invitation Resent Email
 */
export function renderInvitationResent(
  data: InvitationResentData,
): TemplateResult {
  const html = INVITATION_RESENT_HTML
    .replace(/\{\{first_name\}\}/g, data.first_name)
    .replace(/\{\{business_name\}\}/g, data.business_name)
    .replace(/\{\{role\}\}/g, data.role)
    .replace(/\{\{invitation_link\}\}/g, data.invitation_link)
    .replace(/\{\{expiry_date\}\}/g, data.expiry_date);

  const text = INVITATION_RESENT_TEXT
    .replace(/\{\{first_name\}\}/g, data.first_name)
    .replace(/\{\{business_name\}\}/g, data.business_name)
    .replace(/\{\{role\}\}/g, data.role)
    .replace(/\{\{invitation_link\}\}/g, data.invitation_link)
    .replace(/\{\{expiry_date\}\}/g, data.expiry_date);

  return {
    html,
    text,
    subject: `Reminder: You're invited to ${data.business_name} on MNE Select`,
  };
}

// ============================================================================
// HTML Templates
// ============================================================================

const EMAIL_STYLES = `
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    line-height: 1.6;
    color: #333;
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
    background-color: #f5f5f5;
  }
  .email-container {
    background-color: #ffffff;
    border-radius: 8px;
    padding: 40px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  .logo {
    text-align: center;
    margin-bottom: 30px;
  }
  .logo h1 {
    color: #2563eb;
    font-size: 32px;
    margin: 0;
  }
  h2 {
    color: #1f2937;
    font-size: 24px;
    margin-top: 0;
  }
  p {
    color: #4b5563;
    font-size: 16px;
    margin: 16px 0;
  }
  .business-info {
    background-color: #f9fafb;
    border-left: 4px solid #2563eb;
    padding: 16px;
    margin: 24px 0;
  }
  .business-info h3 {
    margin: 0 0 8px 0;
    color: #1f2937;
    font-size: 18px;
  }
  .business-info p {
    margin: 4px 0;
    font-size: 14px;
  }
  .cta-button {
    display: inline-block;
    background-color: #2563eb;
    color: #ffffff !important;
    text-decoration: none;
    padding: 14px 28px;
    border-radius: 6px;
    font-weight: 600;
    font-size: 16px;
    margin: 24px 0;
    text-align: center;
  }
  .cta-button:hover {
    background-color: #1d4ed8;
  }
  .expiry-notice {
    background-color: #fef3c7;
    border-left: 4px solid #f59e0b;
    padding: 12px;
    margin: 20px 0;
    font-size: 14px;
    color: #92400e;
  }
  .footer {
    margin-top: 40px;
    padding-top: 20px;
    border-top: 1px solid #e5e7eb;
    font-size: 14px;
    color: #6b7280;
    text-align: center;
  }
  .footer a {
    color: #2563eb;
    text-decoration: none;
  }
  @media only screen and (max-width: 600px) {
    body {
      padding: 10px;
    }
    .email-container {
      padding: 20px;
    }
    h2 {
      font-size: 20px;
    }
    .cta-button {
      display: block;
      width: 100%;
    }
  }
`;

const BUSINESS_ADMIN_INVITATION_HTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Business Invitation</title>
  <style>${EMAIL_STYLES}</style>
</head>
<body>
  <div class="email-container">
    <div class="logo">
      <h1>🇲🇪 MNE Select</h1>
    </div>
    
    <h2>Welcome to MNE Select!</h2>
    
    <p>Hi {{first_name}},</p>
    
    <p>You've been invited to manage <strong>{{business_name}}</strong> on MNE Select, Montenegro's premier platform connecting businesses with tourists and visitors.</p>
    
    <div class="business-info">
      <h3>Business Details</h3>
      <p><strong>Business Name:</strong> {{business_name}}</p>
      <p><strong>Business Type:</strong> {{business_type}}</p>
      <p><strong>Your Role:</strong> Administrator</p>
    </div>
    
    <p>As an administrator, you'll be able to:</p>
    <ul>
      <li>Manage your business profile and information</li>
      <li>Create and manage offers for visitors</li>
      <li>Invite team members to help manage your business</li>
      <li>Track bookings and reservations (if enabled)</li>
      <li>Access analytics and insights</li>
    </ul>
    
    <p style="text-align: center;">
      <a href="{{invitation_link}}" class="cta-button">Accept Invitation & Create Account</a>
    </p>
    
    <div class="expiry-notice">
      ⏰ <strong>Important:</strong> This invitation expires in 7 days ({{expiry_date}}). Please accept it before then.
    </div>
    
    <p>If you didn't expect this invitation or have any questions, please contact our support team.</p>
    
    <div class="footer">
      <p><strong>MNE Select</strong></p>
      <p>Connecting Montenegro with the World</p>
      <p>
        <a href="{{support_url}}">Support</a> | 
        <a href="{{terms_url}}">Terms of Service</a> | 
        <a href="{{privacy_url}}">Privacy Policy</a>
      </p>
      <p style="margin-top: 16px; font-size: 12px;">
        If the button above doesn't work, copy and paste this link into your browser:<br>
        <span style="color: #2563eb;">{{invitation_link}}</span>
      </p>
    </div>
  </div>
</body>
</html>
`;

const BUSINESS_ADMIN_INVITATION_TEXT = `MNE Select - Business Invitation

Hi {{first_name}},

You've been invited to manage {{business_name}} on MNE Select, Montenegro's premier platform connecting businesses with tourists and visitors.

Business Details:
- Business Name: {{business_name}}
- Business Type: {{business_type}}
- Your Role: Administrator

As an administrator, you'll be able to:
- Manage your business profile and information
- Create and manage offers for visitors
- Invite team members to help manage your business
- Track bookings and reservations (if enabled)
- Access analytics and insights

Accept your invitation and create your account here:
{{invitation_link}}

IMPORTANT: This invitation expires in 7 days ({{expiry_date}}).

If you didn't expect this invitation or have any questions, please contact our support team.

---
MNE Select
Connecting Montenegro with the World

Support: {{support_url}}
Terms: {{terms_url}}
Privacy: {{privacy_url}}
`;

const TEAM_MEMBER_INVITATION_HTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Team Invitation</title>
  <style>${EMAIL_STYLES}</style>
</head>
<body>
  <div class="email-container">
    <div class="logo">
      <h1>🇲🇪 MNE Select</h1>
    </div>
    
    <h2>Join the Team!</h2>
    
    <p>Hi {{first_name}},</p>
    
    <p><strong>{{inviter_name}}</strong> has invited you to join the team at <strong>{{business_name}}</strong> on MNE Select.</p>
    
    <div class="business-info">
      <h3>Team Details</h3>
      <p><strong>Business:</strong> {{business_name}}</p>
      <p><strong>Business Type:</strong> {{business_type}}</p>
      <p><strong>Your Role:</strong> Team Member</p>
      <p><strong>Invited By:</strong> {{inviter_name}}</p>
    </div>
    
    <p>As a team member, you'll be able to:</p>
    <ul>
      <li>View and manage daily operations</li>
      <li>Process bookings and reservations</li>
      <li>Validate redemption vouchers</li>
      <li>Assist customers with inquiries</li>
    </ul>
    
    <p style="text-align: center;">
      <a href="{{invitation_link}}" class="cta-button">Accept Invitation & Create Account</a>
    </p>
    
    <div class="expiry-notice">
      ⏰ <strong>Important:</strong> This invitation expires in 7 days ({{expiry_date}}). Please accept it before then.
    </div>
    
    <p>If you didn't expect this invitation or have any questions, please contact <strong>{{inviter_email}}</strong>.</p>
    
    <div class="footer">
      <p><strong>MNE Select</strong></p>
      <p>Connecting Montenegro with the World</p>
      <p>
        <a href="{{support_url}}">Support</a> | 
        <a href="{{terms_url}}">Terms of Service</a> | 
        <a href="{{privacy_url}}">Privacy Policy</a>
      </p>
      <p style="margin-top: 16px; font-size: 12px;">
        If the button above doesn't work, copy and paste this link into your browser:<br>
        <span style="color: #2563eb;">{{invitation_link}}</span>
      </p>
    </div>
  </div>
</body>
</html>
`;

const TEAM_MEMBER_INVITATION_TEXT = `MNE Select - Team Invitation

Hi {{first_name}},

{{inviter_name}} has invited you to join the team at {{business_name}} on MNE Select.

Team Details:
- Business: {{business_name}}
- Business Type: {{business_type}}
- Your Role: Team Member
- Invited By: {{inviter_name}}

As a team member, you'll be able to:
- View and manage daily operations
- Process bookings and reservations
- Validate redemption vouchers
- Assist customers with inquiries

Accept your invitation and create your account here:
{{invitation_link}}

IMPORTANT: This invitation expires in 7 days ({{expiry_date}}).

If you didn't expect this invitation or have any questions, please contact {{inviter_email}}.

---
MNE Select
Connecting Montenegro with the World

Support: {{support_url}}
Terms: {{terms_url}}
Privacy: {{privacy_url}}
`;

const INVITATION_RESENT_HTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invitation Reminder</title>
  <style>${EMAIL_STYLES}</style>
</head>
<body>
  <div class="email-container">
    <div class="logo">
      <h1>🇲🇪 MNE Select</h1>
    </div>
    
    <h2>Invitation Reminder</h2>
    
    <p>Hi {{first_name}},</p>
    
    <p>This is a friendly reminder that you've been invited to join <strong>{{business_name}}</strong> on MNE Select.</p>
    
    <p>We noticed you haven't accepted your invitation yet. Don't miss this opportunity!</p>
    
    <div class="business-info">
      <h3>Invitation Details</h3>
      <p><strong>Business:</strong> {{business_name}}</p>
      <p><strong>Your Role:</strong> {{role}}</p>
    </div>
    
    <p style="text-align: center;">
      <a href="{{invitation_link}}" class="cta-button">Accept Invitation Now</a>
    </p>
    
    <div class="expiry-notice">
      ⏰ <strong>Important:</strong> This invitation expires on {{expiry_date}}. Please accept it soon!
    </div>
    
    <div class="footer">
      <p><strong>MNE Select</strong></p>
      <p>Connecting Montenegro with the World</p>
    </div>
  </div>
</body>
</html>
`;

const INVITATION_RESENT_TEXT = `MNE Select - Invitation Reminder

Hi {{first_name}},

This is a friendly reminder that you've been invited to join {{business_name}} on MNE Select.

We noticed you haven't accepted your invitation yet. Don't miss this opportunity!

Invitation Details:
- Business: {{business_name}}
- Your Role: {{role}}

Accept your invitation now:
{{invitation_link}}

IMPORTANT: This invitation expires on {{expiry_date}}. Please accept it soon!

---
MNE Select
Connecting Montenegro with the World
`;
