# Phase 1: Email Templates Specification

## Overview

This document specifies email templates for the business user invitation system. Emails are transactional and must be reliable, branded, and mobile-responsive.

---

## Email Delivery Service

### Configured: SendGrid

**SendGrid is already set up and ready to use:**
- ✅ Domain `montenegroselect.me` verified
- ✅ API key available
- ✅ High deliverability rates
- ✅ Detailed analytics and logs
- ✅ Production-ready

**Configuration details**: See `SENDGRID-SETUP.md`

---

## Email Templates

### 1. Business Admin Invitation

**Template ID**: `business-admin-invitation`

**Use Case**: Platform admin creates a business and invites the first admin user

**From**: `noreply@montenegroselect.me`  
**Subject**: `You're invited to manage [Business Name] on MNE Select`

#### Email Content (HTML)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Business Invitation</title>
  <style>
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
  </style>
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
```

#### Template Variables

| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| `first_name` | string | Recipient's first name | `John` |
| `business_name` | string | Name of the business | `Adriatic Seafood Restaurant` |
| `business_type` | string | Type of business | `Restaurant` |
| `invitation_link` | string | Unique invitation URL | `https://portal.mneselect.me/invite?id=xxx` |
| `expiry_date` | string | Formatted expiry date | `February 19, 2026` |
| `support_url` | string | Support page URL | `https://mneselect.me/support` |
| `terms_url` | string | Terms of service URL | `https://mneselect.me/terms` |
| `privacy_url` | string | Privacy policy URL | `https://mneselect.me/privacy` |

---

### 2. Team Member Invitation

**Template ID**: `team-member-invitation`

**Use Case**: Business admin invites a team member to join their business

**From**: `noreply@montenegroselect.me`  
**Subject**: `You're invited to join [Business Name] team on MNE Select`

#### Email Content (HTML)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Team Invitation</title>
  <style>
    /* Same styles as above */
  </style>
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
```

#### Template Variables

| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| `first_name` | string | Recipient's first name | `Jane` |
| `business_name` | string | Name of the business | `FitLife Gym` |
| `business_type` | string | Type of business | `Gym` |
| `inviter_name` | string | Name of person who sent invite | `John Smith` |
| `inviter_email` | string | Email of inviter | `john@fitlifegym.me` |
| `invitation_link` | string | Unique invitation URL | `https://portal.mneselect.me/invite?id=xxx` |
| `expiry_date` | string | Formatted expiry date | `February 19, 2026` |
| `support_url` | string | Support page URL | `https://mneselect.me/support` |
| `terms_url` | string | Terms of service URL | `https://mneselect.me/terms` |
| `privacy_url` | string | Privacy policy URL | `https://mneselect.me/privacy` |

---

### 3. Invitation Resent Notification

**Template ID**: `invitation-resent`

**Use Case**: Someone clicks "Resend Invitation" for a pending invite

**From**: `noreply@montenegroselect.me`  
**Subject**: `Reminder: You're invited to [Business Name] on MNE Select`

#### Email Content (HTML)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <!-- Same head as above -->
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
```

---

## Plain Text Versions

All email templates must include plain text versions for accessibility and spam filter compatibility.

### Business Admin Invitation (Plain Text)

```
MNE Select - Business Invitation

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
```

---

## Implementation Details

### Email Service Integration

#### Setup SendGrid (Configured)

```typescript
// supabase/functions/_shared/email-service.ts

import sgMail from 'npm:@sendgrid/mail@8.1.0'

const SENDGRID_API_KEY = Deno.env.get('sendgrid_key')

if (!SENDGRID_API_KEY) {
  throw new Error('sendgrid_key secret is not configured in Supabase')
}

sgMail.setApiKey(SENDGRID_API_KEY)

export interface SendEmailParams {
  to: string
  subject: string
  html: string
  text: string
  from?: string
  replyTo?: string
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
  from = 'MNE Select <noreply@montenegroselect.me>',
  replyTo = 'support@montenegroselect.me'
}: SendEmailParams) {
  try {
    const msg = {
      to,
      from,
      subject,
      text,
      html,
      replyTo,
    }

    const [response] = await sgMail.send(msg)

    console.log('Email sent successfully:', {
      to,
      subject,
      messageId: response.headers['x-message-id'],
    })

    return {
      success: true,
      messageId: response.headers['x-message-id'],
    }
  } catch (error) {
    console.error('SendGrid error:', {
      message: error.message,
      response: error.response?.body,
    })

    throw new Error(`Failed to send email: ${error.message}`)
  }
}
```

---

### Template Rendering

#### Handlebars Template Engine

```typescript
// supabase/functions/_shared/email-templates.ts

import Handlebars from 'handlebars'

// Register helpers
Handlebars.registerHelper('formatDate', (date: Date) => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

export interface BusinessAdminInvitationData {
  first_name: string
  business_name: string
  business_type: string
  invitation_link: string
  expiry_date: string
  support_url: string
  terms_url: string
  privacy_url: string
}

export function renderBusinessAdminInvitation(data: BusinessAdminInvitationData): {
  html: string
  text: string
  subject: string
} {
  const htmlTemplate = Handlebars.compile(BUSINESS_ADMIN_INVITATION_HTML)
  const textTemplate = Handlebars.compile(BUSINESS_ADMIN_INVITATION_TEXT)
  
  return {
    html: htmlTemplate(data),
    text: textTemplate(data),
    subject: `You're invited to manage ${data.business_name} on MNE Select`
  }
}

// Template constants
const BUSINESS_ADMIN_INVITATION_HTML = `
  <!-- Full HTML template from above -->
`

const BUSINESS_ADMIN_INVITATION_TEXT = `
  <!-- Full text template from above -->
`
```

---

### Invitation Link Generation

```typescript
// Generate secure invitation link

export function generateInvitationLink(invitationId: string): string {
  const baseUrl = Deno.env.get('PORTAL_APP_URL') || 'https://portal.montenegroselect.me'
  return `${baseUrl}/invite?id=${invitationId}`
}

// Invitation ID is the UUID from the invitations table
// No need for additional token - UUID is sufficiently random
```

---

## Email Sending Flow

### Sequence Diagram

```
Platform Admin          Edge Function          Database          Email Service
      |                       |                    |                   |
      |--Create Business----->|                    |                   |
      |                       |--Insert Business-->|                   |
      |                       |<--Business ID------|                   |
      |                       |                    |                   |
      |--Send Invitation----->|                    |                   |
      |                       |--Insert Invitation>|                   |
      |                       |<--Invitation ID----|                   |
      |                       |                    |                   |
      |                       |--Render Template-->|                   |
      |                       |<--HTML & Text------|                   |
      |                       |                    |                   |
      |                       |--Send Email--------|------------------>|
      |                       |                    |                   |
      |                       |                    |                   |<-Delivery Status-
      |                       |--Update sent_at--->|                   |
      |<--Success Response----|                    |                   |
```

---

## Email Deliverability Best Practices

### 1. Domain Configuration

**SPF Record:**
```
v=spf1 include:_spf.resend.com ~all
```

**DKIM**: Configured automatically by Resend

**DMARC Record:**
```
v=DMARC1; p=quarantine; rua=mailto:dmarc@mneselect.me
```

### 2. Content Best Practices

- ✅ Include plain text version
- ✅ Keep HTML simple and table-free (use divs)
- ✅ Include unsubscribe link (for marketing emails only)
- ✅ Use clear, descriptive subject lines
- ✅ Avoid spam trigger words
- ✅ Include company address in footer
- ✅ Test across email clients (Gmail, Outlook, Apple Mail)

### 3. Sending Best Practices

- ✅ Implement rate limiting
- ✅ Monitor bounce rates
- ✅ Handle failures gracefully
- ✅ Log all email sending attempts
- ✅ Implement retry logic with exponential backoff

---

## Testing Email Templates

### Local Testing with Resend

```typescript
// Test script: supabase/functions/test-email.ts

import { sendEmail } from './_shared/email-service.ts'
import { renderBusinessAdminInvitation } from './_shared/email-templates.ts'

const testData = {
  first_name: 'John',
  business_name: 'Test Restaurant',
  business_type: 'Restaurant',
  invitation_link: 'https://portal.mneselect.me/invite?id=test-123',
  expiry_date: 'February 19, 2026',
  support_url: 'https://mneselect.me/support',
  terms_url: 'https://mneselect.me/terms',
  privacy_url: 'https://mneselect.me/privacy'
}

const { html, text, subject } = renderBusinessAdminInvitation(testData)

await sendEmail({
  to: 'marko+test@velocci.me',
  subject,
  html,
  text
})

console.log('Test email sent!')
```

### Email Preview Tools

- [Litmus](https://litmus.com) - Cross-client testing
- [Email on Acid](https://www.emailonacid.com) - Comprehensive testing
- [Resend Preview](https://resend.com/docs/send-with-react) - Built-in preview

---

## Monitoring & Analytics

### Metrics to Track

1. **Delivery Rate**: % of emails successfully delivered
2. **Open Rate**: % of emails opened (track via pixel)
3. **Click Rate**: % of invitation links clicked
4. **Conversion Rate**: % of invitations accepted
5. **Time to Accept**: Average time from send to acceptance
6. **Bounce Rate**: % of emails bounced
7. **Spam Complaint Rate**: % marked as spam

### Monitoring Setup

Resend provides built-in analytics. Access via:
- Dashboard: https://resend.com/emails
- API: Track delivery status programmatically

---

## Environment Variables

Required environment variables for email service:

```bash
# SendGrid API Key (matches Supabase secret name)
sendgrid_key=SG.xxxxxxxxxxxxx

# Email configuration
EMAIL_FROM_ADDRESS=noreply@montenegroselect.me
EMAIL_FROM_NAME=MNE Select
EMAIL_REPLY_TO=support@montenegroselect.me

# Portal app URL for invitation links
PORTAL_APP_URL=https://portal.montenegroselect.me

# Support URLs
SUPPORT_URL=https://montenegroselect.me/support
TERMS_URL=https://montenegroselect.me/terms
PRIVACY_URL=https://montenegroselect.me/privacy
```

---

## Future Enhancements

### Phase 2 Email Templates

- Welcome email after account creation
- Password reset email
- Business approval notification
- Booking confirmation email
- Offer redemption confirmation
- Weekly/monthly digest for business admins
- Platform announcements

### Advanced Features

- Email localization (English, Montenegrin)
- A/B testing for subject lines
- Dynamic content based on business type
- Email scheduling
- Automated follow-ups for pending invitations

---

## References

- [Resend Documentation](https://resend.com/docs)
- [Email Design Best Practices](https://www.campaignmonitor.com/resources/guides/email-design/)
- [HTML Email Template Guide](https://templates.mailchimp.com/)
- [Email Deliverability Guide](https://sendgrid.com/blog/email-deliverability-guide/)
