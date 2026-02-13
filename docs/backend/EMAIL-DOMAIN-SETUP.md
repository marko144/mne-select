# SendGrid Email Setup Guide

## Overview

This guide walks you through using SendGrid to send emails from your verified domain (`montenegroselect.me`). Your domain is already verified and ready to use!

---

## Architecture

### Email Flow

```
Edge Function → Resend API → Your Domain (mneselect.me) → Recipient
```

**No Supabase configuration needed!** Resend handles all email delivery directly.

---

## Step 1: Choose Your Sending Address

### Recommended Setup

For transactional emails like invitations, use a **subdomain** to protect your main domain reputation:

✅ **Recommended (Best Practice):**
```
From: MNE Select <noreply@mneselect.me>
Reply-To: support@mneselect.me
```

✅ **Alternative (Subdomain for transactional):**
```
From: MNE Select <noreply@mail.mneselect.me>
Reply-To: support@mneselect.me
```

❌ **Avoid:**
```
From: noreply@resend.dev  (default, looks unprofessional)
```

### Why Use `noreply@`?

- ✅ Invitation emails are transactional (no replies expected)
- ✅ Prevents inbox clutter
- ✅ Clear that it's automated
- ✅ Include `Reply-To: support@mneselect.me` for support questions

---

## Step 2: Create Resend Account

### 2.1: Sign Up

1. Go to [resend.com](https://resend.com)
2. Click "Sign Up"
3. Use your email: `marko+admin@velocci.me` (or company email)
4. Verify your email address

### 2.2: Generate API Key

1. Navigate to **API Keys** in dashboard
2. Click **Create API Key**
3. Name: `MNE Select Production`
4. Permissions: **Full Access** (for production) or **Sending access** (more restrictive)
5. **Copy the API key** (you'll only see it once!)
6. Store securely (this goes in your `.env` file)

```bash
RESEND_API_KEY=re_123abc...xyz
```

---

## Step 3: Add and Verify Your Domain

### 3.1: Add Domain to Resend

1. In Resend dashboard, go to **Domains**
2. Click **Add Domain**
3. Enter: `mneselect.me`
4. Click **Add Domain**

**Result**: Resend will show you DNS records that need to be configured.

### 3.2: DNS Records to Configure

Resend will provide these records:

#### **SPF Record** (TXT)
Specifies which servers can send email on behalf of your domain.

```
Type: TXT
Name: @ (or mneselect.me)
Value: v=spf1 include:_spf.resend.com ~all
```

#### **DKIM Record** (TXT)
Cryptographic signature to verify email authenticity.

```
Type: TXT
Name: resend._domainkey (Resend will provide exact name)
Value: [Long cryptographic key provided by Resend]
```

#### **DMARC Record** (TXT)
Tells receiving servers what to do with emails that fail SPF/DKIM checks.

```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=quarantine; rua=mailto:dmarc@mneselect.me
```

**Explanation:**
- `p=quarantine`: Failed emails go to spam (not rejected outright)
- `rua=mailto:dmarc@mneselect.me`: Aggregate reports sent to this email
- You can start with `p=none` (monitoring mode) then move to `p=quarantine` or `p=reject`

---

## Step 4: Configure DNS

### Where to Configure DNS

**It depends on where your domain is registered:**

#### Option A: Domain Registrar (Namecheap, GoDaddy, etc.)
1. Log into your domain registrar
2. Find **DNS Management** or **DNS Settings**
3. Add the three DNS records from Step 3.2

#### Option B: Cloudflare (Recommended if you use Cloudflare)
1. Log into Cloudflare
2. Select domain: `mneselect.me`
3. Go to **DNS** → **Records**
4. Click **Add Record** for each DNS entry
5. **Important**: Set Proxy status to **DNS only** (gray cloud) for email records

#### Option C: Other DNS Provider (Route 53, Vercel DNS, etc.)
Follow provider-specific instructions for adding TXT records.

### Example: Adding Records in Cloudflare

```
1. SPF Record
   Type: TXT
   Name: @
   Content: v=spf1 include:_spf.resend.com ~all
   TTL: Auto
   Proxy: DNS only (gray cloud)

2. DKIM Record
   Type: TXT
   Name: resend._domainkey
   Content: [Paste key from Resend]
   TTL: Auto
   Proxy: DNS only (gray cloud)

3. DMARC Record
   Type: TXT
   Name: _dmarc
   Content: v=DMARC1; p=quarantine; rua=mailto:dmarc@mneselect.me
   TTL: Auto
   Proxy: DNS only (gray cloud)
```

---

## Step 5: Verify Domain in Resend

### 5.1: Wait for DNS Propagation

DNS changes can take:
- **5-10 minutes** (typical)
- **Up to 24 hours** (rare)

### 5.2: Check DNS Propagation

Use online tools to verify:
- [MXToolbox](https://mxtoolbox.com/SuperTool.aspx)
- [DNS Checker](https://dnschecker.org/)

Search for:
```
TXT records for mneselect.me
TXT records for resend._domainkey.mneselect.me
TXT records for _dmarc.mneselect.me
```

### 5.3: Verify in Resend Dashboard

1. Go to **Domains** in Resend
2. Click on `mneselect.me`
3. Click **Verify Domain**
4. Resend will check your DNS records

**Status should change to:** ✅ **Verified**

---

## Step 6: Update Email Templates

### Update `email-service.ts`

Now that your domain is verified, update the `from` address:

```typescript
// supabase/functions/_shared/email-service.ts

export async function sendEmail({
  to,
  subject,
  html,
  text,
  from = 'MNE Select <noreply@mneselect.me>', // ✅ Your verified domain
  replyTo = 'support@mneselect.me' // ✅ Support email for replies
}: SendEmailParams) {
  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
      text,
      reply_to: replyTo, // Important for user replies!
    })

    // ... rest of code
  }
}
```

### Update Environment Variables

```bash
# .env.production
RESEND_API_KEY=re_your_production_key
EMAIL_FROM_DOMAIN=mneselect.me
EMAIL_FROM_ADDRESS=noreply@mneselect.me
EMAIL_FROM_NAME=MNE Select
EMAIL_REPLY_TO=support@mneselect.me
```

---

## Step 7: Test Email Sending

### Send Test Email

Create a test script:

```typescript
// supabase/functions/test-email-domain.ts

import { sendEmail } from './_shared/email-service.ts'

await sendEmail({
  to: 'marko+test@velocci.me', // Your test email
  subject: 'Test Email from MNE Select',
  html: '<h1>Test</h1><p>If you receive this, your domain is configured correctly!</p>',
  text: 'Test: If you receive this, your domain is configured correctly!',
  from: 'MNE Select <noreply@mneselect.me>',
  replyTo: 'support@mneselect.me',
})

console.log('Test email sent!')
```

**Run it:**
```bash
deno run --allow-net --allow-env supabase/functions/test-email-domain.ts
```

### Verify Test Email

Check that:
- ✅ Email arrives in inbox (not spam)
- ✅ `From` shows: **MNE Select <noreply@mneselect.me>**
- ✅ Reply address is: **support@mneselect.me**
- ✅ Email passes SPF/DKIM checks (check email headers)

---

## Step 8: Check Email Headers (Important!)

### View Email Headers

In Gmail:
1. Open the test email
2. Click **⋮** (three dots)
3. Click **Show original**
4. Look for these headers:

```
✅ SPF: PASS
✅ DKIM: PASS
✅ DMARC: PASS
```

If any say **FAIL**, your DNS records are not configured correctly.

---

## Troubleshooting

### Issue: Domain Not Verifying

**Symptoms:**
- Resend shows "Pending verification"
- DNS records added but not detecting

**Solutions:**
1. **Wait longer**: DNS can take up to 24 hours
2. **Check TTL**: Lower TTL to 300 seconds (5 minutes)
3. **Remove conflicting records**: Check for existing SPF/DKIM records
4. **Verify exact values**: Copy-paste from Resend (typos cause failures)
5. **Disable proxy**: Cloudflare DNS records should be **DNS only** (gray cloud)

### Issue: Emails Go to Spam

**Symptoms:**
- Emails sent but land in spam folder

**Solutions:**
1. **Verify SPF/DKIM/DMARC**: Check email headers
2. **Warm up domain**: Send gradually increasing volumes
3. **Improve content**: Avoid spam trigger words
4. **Add physical address**: Include company address in footer
5. **Authentication**: Ensure DKIM signature is valid
6. **Reputation**: Use [Google Postmaster Tools](https://postmaster.google.com/) to monitor

### Issue: "Invalid From Address" Error

**Symptoms:**
- Resend API returns error about unauthorized sender

**Solutions:**
1. **Domain not verified**: Complete verification in Resend
2. **Wrong domain**: Ensure email uses verified domain
3. **Subdomain mismatch**: If you verified `mail.mneselect.me`, use that exactly
4. **API key permissions**: Ensure key has sending permissions

### Issue: Bounced Emails

**Symptoms:**
- Emails bounce back or fail to deliver

**Solutions:**
1. **Check recipient email**: Ensure it's valid
2. **Check SPF record**: Ensure `include:_spf.resend.com` is present
3. **DMARC policy too strict**: Start with `p=none` instead of `p=reject`
4. **Domain reputation**: New domains need time to build reputation

---

## Advanced Configuration (Optional)

### Custom Tracking Domain

For branded tracking links, set up a custom tracking subdomain:

1. **Add subdomain**: `track.mneselect.me`
2. **Configure DNS**: Add CNAME record pointing to Resend
3. **Enable in Resend**: Dashboard → Tracking → Custom domain

### Multiple Sending Addresses

You can verify multiple addresses:
- `noreply@mneselect.me` - Automated emails
- `invitations@mneselect.me` - Invitation emails specifically
- `notifications@mneselect.me` - Notification emails

All use the same DNS records since they're on the same domain.

### Email Signatures

Add company signature to all emails:

```html
<div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
  <p><strong>MNE Select</strong></p>
  <p>Connecting Montenegro with the World</p>
  <p>Budva, Montenegro</p>
  <p><a href="mailto:support@mneselect.me">support@mneselect.me</a></p>
</div>
```

---

## Monitoring & Maintenance

### Monitor Email Deliverability

**Resend Dashboard:**
- Delivery rate (should be > 98%)
- Bounce rate (should be < 2%)
- Complaint rate (should be < 0.1%)

**External Tools:**
- [Google Postmaster Tools](https://postmaster.google.com/) - Monitor Gmail reputation
- [MXToolbox](https://mxtoolbox.com/blacklists.aspx) - Check if your domain is blacklisted
- [Mail Tester](https://www.mail-tester.com/) - Test email score (should be 10/10)

### Regular Checks (Monthly)

1. **Verify DNS records still exist** (domain transfers can break this)
2. **Check email deliverability metrics** in Resend
3. **Review bounce reports** and remove invalid addresses
4. **Monitor domain reputation** via Postmaster Tools

---

## Production Deployment Checklist

Before going live, ensure:

- [ ] Domain verified in Resend (green checkmark)
- [ ] SPF, DKIM, DMARC records configured correctly
- [ ] Test email sent successfully from your domain
- [ ] Email passes SPF/DKIM/DMARC checks (view headers)
- [ ] Email lands in inbox (not spam)
- [ ] Reply-To address configured correctly
- [ ] API key stored securely in environment variables
- [ ] From address updated in `email-service.ts`
- [ ] Test invitation workflow end-to-end

---

## Security Best Practices

### Protect Your API Key

```bash
# ❌ NEVER commit this
RESEND_API_KEY=re_123abc...

# ✅ Store in:
# - Supabase project secrets (for edge functions)
# - Environment variables (for local dev)
# - Secure vault (1Password, AWS Secrets Manager)
```

### Rotate API Keys Regularly

1. Generate new API key in Resend
2. Update environment variables
3. Delete old API key
4. Test to ensure new key works

### Monitor for Abuse

Watch for:
- Sudden spike in email volume (potential abuse)
- High bounce rates (invalid email lists)
- Spam complaints (content issues)

---

## Cost Estimation

### Resend Pricing (as of 2026)

**Free Tier:**
- 3,000 emails/month
- 100 emails/day
- All features included

**Pro Tier ($20/month):**
- 50,000 emails/month
- Additional emails: $1 per 1,000

### Expected Usage (Phase 1)

**Conservative Estimate:**
- 50 businesses onboarded/month
- 3 invitations per business (avg)
- = **150 emails/month**

**Free tier is sufficient** for Phase 1 and early growth!

---

## Summary

### What You Need to Do

1. ✅ **Create Resend account** (5 minutes)
2. ✅ **Add domain to Resend** (2 minutes)
3. ✅ **Configure DNS records** (10 minutes)
4. ✅ **Wait for DNS propagation** (5-60 minutes)
5. ✅ **Verify domain in Resend** (1 minute)
6. ✅ **Update email service code** (5 minutes)
7. ✅ **Send test email** (2 minutes)
8. ✅ **Verify email headers** (2 minutes)

**Total Time: ~30 minutes** (plus DNS propagation wait)

### What Supabase Does

**Nothing!** Supabase is not involved in email sending. Edge Functions call Resend API directly.

---

## Support Resources

- **Resend Documentation**: https://resend.com/docs
- **Resend Support**: help@resend.com
- **DNS Configuration Help**: Your domain registrar support
- **SPF/DKIM Testing**: https://mxtoolbox.com/
- **Email Deliverability**: https://www.mail-tester.com/

---

## Next Steps

After email domain setup is complete:
1. Update the `EMAIL_FROM_ADDRESS` in `phase-1-email-templates.md`
2. Configure environment variables in `.env` files
3. Test invitation workflow end-to-end
4. Monitor deliverability in Resend dashboard

Your emails will now come from **`MNE Select <noreply@mneselect.me>`** instead of generic addresses! 🎉
