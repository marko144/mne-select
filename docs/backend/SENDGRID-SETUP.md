# SendGrid Email Configuration

## Overview

SendGrid is configured and ready to send emails from `montenegroselect.me`. This document explains how the API key is stored and used by the application.

---

## ✅ Current Status

- **Domain**: `montenegroselect.me` - VERIFIED ✅
- **API Key**: Stored as `sendgrid_key` in Supabase Secrets ✅
- **Sending Address**: `noreply@montenegroselect.me`
- **Reply-To Address**: `support@montenegroselect.me`

## ⚠️ Important for Developers

**The Supabase secret is named `sendgrid_key` (all lowercase, no underscore between send and grid).**

In your code, use:
```typescript
const SENDGRID_API_KEY = Deno.env.get('sendgrid_key')  // ✅ Correct
// NOT: Deno.env.get('SENDGRID_API_KEY')  // ❌ Wrong
```

---

## 🔐 API Key Storage

### Production & Staging (Supabase Secrets)

Your SendGrid API key is already stored in **Supabase Secrets** as `sendgrid_key` ✅

#### Secret Configuration

- **Secret Name**: `sendgrid_key` (already created in dashboard)
- **Secret Value**: Your SendGrid API key
- **Location**: Supabase Dashboard → Settings → Edge Functions → Secrets

#### To Update the Secret (if needed)

Via Supabase Dashboard:
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Settings** → **Edge Functions**
4. Click **Manage Secrets**
5. Find `sendgrid_key` and update if needed

Via Command Line:
```bash
# Connect to your Supabase project
supabase link --project-ref your-project-ref

# Update the secret
supabase secrets set sendgrid_key=YOUR_NEW_API_KEY_HERE
```

---

## 💻 Local Development

Create a `.env` file in your project root for local development:

```bash
# .env (NEVER commit to git!)

# SendGrid Configuration (use same name as Supabase secret)
sendgrid_key=SG.your_api_key_here
EMAIL_FROM_ADDRESS=noreply@montenegroselect.me
EMAIL_FROM_NAME=MNE Select
EMAIL_REPLY_TO=support@montenegroselect.me

# Supabase Configuration
SUPABASE_URL=http://localhost:54321
SUPABASE_SERVICE_ROLE_KEY=your-local-service-role-key

# Application URLs
PORTAL_APP_URL=http://localhost:3000
SUPPORT_URL=https://montenegroselect.me/support
TERMS_URL=https://montenegroselect.me/terms
PRIVACY_URL=https://montenegroselect.me/privacy
```

### Load Secrets Locally

```bash
# Load environment variables into Supabase local instance
supabase secrets set --env-file .env
```

### Verify .gitignore

Ensure `.env` is in your `.gitignore`:

```bash
# .gitignore
.env
.env.*
!.env.example
```

---

## 📧 Email Configuration

### Email Addresses

| Purpose | Address | Description |
|---------|---------|-------------|
| **From** | `noreply@montenegroselect.me` | Main sending address for all automated emails |
| **Reply-To** | `support@montenegroselect.me` | Users can reply here for support |
| **Display Name** | `MNE Select` | Appears as sender name in email clients |

### Email Template Variables

All email templates will use these addresses automatically:

```typescript
// Configured in email-service.ts
from: 'MNE Select <noreply@montenegroselect.me>'
replyTo: 'support@montenegroselect.me'
```

---

## 🔧 SendGrid Integration Code

### Email Service Implementation

**File**: `supabase/functions/_shared/email-service.ts`

```typescript
import sgMail from 'npm:@sendgrid/mail@8.1.0'

// Initialize SendGrid with API key from Supabase Secrets
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

/**
 * Send email via SendGrid
 */
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
      statusCode: response.statusCode,
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

/**
 * Validate email address format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
  return emailRegex.test(email)
}
```

---

## 📨 Email Templates

All email templates are defined in `phase-1-email-templates.md` and include:

1. **Business Admin Invitation** - Sent when creating a new business
2. **Team Member Invitation** - Sent when inviting team members
3. **Invitation Resent** - Sent when resending pending invitations

Each template includes:
- ✅ HTML version (responsive, mobile-friendly)
- ✅ Plain text version (for email clients that don't support HTML)
- ✅ Proper branding with MNE Select logo/colors
- ✅ Clear call-to-action buttons
- ✅ Expiry notices

---

## ✅ Testing Email Sending

### Test Script

Create `supabase/functions/test-email.ts`:

```typescript
import { sendEmail } from './_shared/email-service.ts'

console.log('Testing SendGrid email...')

await sendEmail({
  to: 'marko+test@velocci.me', // Your test email
  subject: 'Test Email from MNE Select',
  html: `
    <h1>Test Email</h1>
    <p>If you receive this, SendGrid is configured correctly!</p>
    <p>Sending from: <strong>montenegroselect.me</strong></p>
  `,
  text: 'Test Email\n\nIf you receive this, SendGrid is configured correctly!\n\nSending from: montenegroselect.me',
})

console.log('✅ Test email sent successfully!')
```

### Run Test

```bash
# Make sure environment variables are loaded
supabase secrets set --env-file .env

# Run test
deno run --allow-net --allow-env supabase/functions/test-email.ts
```

### Verify Test Results

Check your test email inbox and verify:
- ✅ Email arrives (not in spam)
- ✅ From: **MNE Select <noreply@montenegroselect.me>**
- ✅ Reply-To: **support@montenegroselect.me**
- ✅ Content displays correctly

---

## 🔍 Monitoring & Debugging

### View SendGrid Activity

1. Go to [SendGrid Dashboard](https://app.sendgrid.com/)
2. Navigate to **Activity**
3. View recent email sends, delivery status, bounces, etc.

### Check Email Deliverability

View email headers to verify authentication:

```
✅ SPF: PASS
✅ DKIM: PASS
✅ DMARC: PASS
```

### Common Issues

#### Issue: "Unauthorized sender" error

**Solution**: Verify domain is actually verified in SendGrid:
- Go to SendGrid → Settings → Sender Authentication
- Check domain status shows "Verified"

#### Issue: Emails going to spam

**Solutions**:
1. Verify SPF/DKIM records are configured
2. Check domain reputation in SendGrid dashboard
3. Avoid spam trigger words in subject lines
4. Include company address in email footer

#### Issue: API key not working

**Solutions**:
1. Verify API key has "Mail Send" permissions
2. Check API key hasn't been rotated/deleted
3. Ensure no extra spaces when copying key
4. Regenerate key if necessary

---

## 📊 SendGrid Quotas & Limits

### Current Plan Limits

Check your SendGrid plan for:
- **Daily sending limit**: [Check in dashboard]
- **Rate limiting**: Typically 600 emails per second
- **Monthly quota**: [Check in dashboard]

### Monitoring Usage

1. SendGrid Dashboard → **Email Activity**
2. Monitor:
   - Emails sent today
   - Delivery rate (should be > 98%)
   - Bounce rate (should be < 2%)
   - Spam complaints (should be < 0.1%)

---

## 🔒 Security Best Practices

### API Key Security

✅ **DO:**
- Store in Supabase Secrets (production)
- Store in `.env` file (local, not committed)
- Use environment variables only
- Rotate keys periodically

❌ **DON'T:**
- Commit API key to git
- Expose in frontend/client code
- Share in public channels
- Hard-code in application

### Key Rotation

To rotate your SendGrid API key:

1. **Generate new key** in SendGrid dashboard
2. **Update Supabase Secrets**:
   ```bash
   supabase secrets set SENDGRID_API_KEY=NEW_KEY_HERE
   ```
3. **Test** with new key
4. **Delete old key** in SendGrid dashboard

---

## 📋 Deployment Checklist

Before deploying to production:

- [ ] Domain `montenegroselect.me` verified in SendGrid
- [ ] API key stored in Supabase Secrets (production project)
- [ ] API key stored in Supabase Secrets (staging project)
- [ ] Test email sent successfully from production environment
- [ ] Email passes SPF/DKIM/DMARC checks
- [ ] Reply-To address configured correctly
- [ ] Email templates tested and displaying correctly
- [ ] Monitoring configured in SendGrid dashboard
- [ ] `.env` file is in `.gitignore`

---

## 💰 Cost Considerations

### SendGrid Pricing

Check your current plan:
- **Free Plan**: Up to 100 emails/day
- **Essentials**: Starting at $19.95/month (40k-100k emails)
- **Pro**: Starting at $89.95/month (100k+ emails)

### Expected Usage (Phase 1)

**Conservative Estimate:**
- 50 businesses onboarded/month
- 3 invitations per business (on average)
- = **150 emails/month**

Your current SendGrid plan should be more than sufficient!

### Cost Optimization

- Use invitation expiry to avoid resend spam
- Track bounce rates and remove invalid emails
- Monitor delivery rates to maintain reputation

---

## 🆘 Support

### SendGrid Support
- **Documentation**: https://docs.sendgrid.com/
- **Support Portal**: https://support.sendgrid.com/
- **Status Page**: https://status.sendgrid.com/

### Troubleshooting Resources
- [SendGrid API Error Codes](https://docs.sendgrid.com/api-reference/how-to-use-the-sendgrid-v3-api/responses)
- [Email Deliverability Best Practices](https://docs.sendgrid.com/ui/sending-email/deliverability)
- [Authentication Setup](https://docs.sendgrid.com/ui/account-and-settings/how-to-set-up-domain-authentication)

---

## ✅ Summary

### Current Configuration

```
Domain: montenegroselect.me (VERIFIED ✅)
API Key: Available (store in Supabase Secrets)
From Address: noreply@montenegroselect.me
Reply-To: support@montenegroselect.me
Status: Ready to use!
```

### Developer Next Steps

1. Read this configuration document
2. Store API key in Supabase Secrets
3. Implement email service using provided code
4. Implement email templates from `phase-1-email-templates.md`
5. Test email sending
6. Deploy edge functions

**Everything is configured and ready to go!** 🚀
