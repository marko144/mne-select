# Montenegro Select - SEO Implementation Guide

## 📋 Overview

This document provides a complete guide to the SEO setup for Montenegro Select. All core SEO features have been implemented and are ready for deployment.

---

## ✅ What's Been Implemented

### 1. **SEO Configuration** (`config/seo.config.ts`)

A centralized configuration file containing:

- Site metadata (title, description, URL)
- Business information (locations, services, contact)
- Target keywords (long-tail, brand-focused)
- Multi-language support
- Open Graph & Twitter Card settings
- Structured data schemas

**Key Features:**

- Easy to update in one place
- Type-safe configuration
- Helper functions for generating metadata

### 2. **Robots.txt Files**

**Guests App** (`apps/guests/public/robots.txt`):

- ✅ Allows all search engines to crawl
- ✅ Points to sitemap.xml
- ✅ Sets crawl delay to prevent server overload

**Portal App** (`apps/portal/public/robots.txt`):

- ✅ Blocks all search engines (login-protected content)
- ✅ No sitemap (not meant for public discovery)

### 3. **Dynamic Sitemap** (`app/sitemap.ts`)

- ✅ Auto-generated sitemap.xml
- ✅ Includes language alternates (en/sr)
- ✅ Proper priority and change frequency
- ✅ Ready to add new pages as they're created

**Access:** `https://montenegroselect.me/sitemap.xml`

### 4. **Enhanced Metadata** (`app/layout.tsx`)

- ✅ Comprehensive meta tags
- ✅ Open Graph tags (Facebook, LinkedIn)
- ✅ Twitter Card tags
- ✅ Viewport configuration
- ✅ Theme color settings
- ✅ Apple Web App settings

### 5. **Structured Data (JSON-LD)** (`components/StructuredData.tsx`)

Implemented schemas:

- ✅ **Organization** - Business information
- ✅ **LocalBusiness** - Geographic presence
- ✅ **WebSite** - Site structure
- ✅ **BreadcrumbList** - Navigation
- ✅ **Service** - Service offerings
- ✅ **FAQPage** - FAQ section (ready to use)

**Benefits:**

- Better search engine understanding
- Enhanced search results (rich snippets)
- Potential for featured snippets in Google

### 6. **Multi-Language SEO** (`lib/seo-utils.ts`)

- ✅ hreflang tags (en, sr)
- ✅ Language-specific meta descriptions
- ✅ Canonical URL generation
- ✅ Proper locale mapping

**Languages:**

- English (primary)
- Serbian/Montenegrin (secondary)

### 7. **PWA Manifest** (`app/manifest.ts`)

- ✅ Web App Manifest for installability
- ✅ Theme colors and branding
- ✅ Icon specifications
- ✅ Standalone display mode

---

## 🎯 SEO Strategy

### **Keyword Approach**

**Focus Areas:**

1. **Brand Building** - "Montenegro Select" as the primary search term
2. **Long-tail Keywords**:
   - "curated luxury experiences Montenegro"
   - "private boat charter Kotor"
   - "trusted Montenegro partners"
   - "Montenegro travel concierge"
3. **Local Intent**:
   - City names: Kotor, Tivat, Budva, Perast, etc.
   - Service + Location: "boat tours Kotor Bay"

**Why This Works:**

- Avoids direct competition with big platforms (TripAdvisor, Booking.com)
- Targets quality over quantity
- Builds brand recognition
- Matches user intent (curated, trusted, luxury)

### **Content Strategy (Priority Services)**

1. **Boat Tours & Charters** - Highest priority
2. **Private Transfers**
3. **Car Rental**
4. **Wine Tasting**
5. **Local Experiences**

### **Target Locations**

**Primary:**

- Kotor, Tivat, Budva

**Secondary:**

- Perast, Bar, Ulcinj, Podgorica

**Mountain:**

- Žabljak, Kolašin

---

## 🚀 Deployment Checklist

### **Before Launch**

- [ ] Create favicon and app icons (see `/public/icons/FAVICON_SETUP.md`)
- [ ] Create Open Graph image (1200x630px)
- [ ] Review all metadata in `config/seo.config.ts`
- [ ] Test sitemap: `http://localhost:3001/sitemap.xml`
- [ ] Test manifest: `http://localhost:3001/manifest.json`
- [ ] Verify robots.txt: `http://localhost:3001/robots.txt`

### **At Launch**

- [ ] Deploy to Vercel
- [ ] Verify production sitemap: `https://montenegroselect.me/sitemap.xml`
- [ ] Test Open Graph tags (Facebook Sharing Debugger)
- [ ] Submit sitemap to Google Search Console (see below)
- [ ] Set up Google Analytics (see below)
- [ ] Create Google Search Console verification (see below)

### **Post-Launch**

- [ ] Monitor Google Search Console for indexing status
- [ ] Check for crawl errors
- [ ] Monitor page speed with PageSpeed Insights
- [ ] Set up social media accounts and update config
- [ ] Add social links to footer

---

## 📊 Google Search Console Setup

### **Why It's Important**

Google Search Console helps you:

- Monitor how Google crawls your site
- See which keywords drive traffic
- Identify and fix indexing issues
- Submit sitemaps for faster indexing
- Track search performance

### **Setup Steps**

1. **Create Account**
   - Go to: https://search.google.com/search-console
   - Sign in with Google account
   - Click "Add Property"

2. **Verify Ownership (Choose One Method)**

   **Method A: HTML File** (Recommended)
   - Download verification file from Search Console
   - Place in `apps/guests/public/`
   - Deploy to production
   - Click "Verify" in Search Console

   **Method B: Meta Tag**
   - Copy verification meta tag
   - Add to `app/layout.tsx` in metadata.verification object:
     ```typescript
     verification: {
       google: 'your-verification-code',
     }
     ```
   - Deploy to production
   - Click "Verify"

   **Method C: DNS (If you manage DNS)**
   - Add TXT record to domain
   - Format: `google-site-verification=XXXXXXXXX`

3. **Submit Sitemap**
   - In Search Console, go to "Sitemaps"
   - Add new sitemap URL: `https://montenegroselect.me/sitemap.xml`
   - Click "Submit"

4. **Set Preferred Domain**
   - Choose between www and non-www (recommend non-www)
   - Ensure redirects are set up

### **Important Settings**

- **URL Inspection** - Check if specific pages are indexed
- **Coverage Report** - See indexing status
- **Core Web Vitals** - Monitor performance
- **Mobile Usability** - Ensure mobile-friendliness

---

## 📈 Google Analytics Setup

### **Why It's Important**

Google Analytics provides:

- Visitor traffic and behavior data
- Conversion tracking (waitlist signups)
- User demographics and interests
- Traffic sources (where visitors come from)
- Page performance metrics

### **Setup Steps (Google Analytics 4)**

1. **Create Property**
   - Go to: https://analytics.google.com
   - Click "Admin" → "Create Property"
   - Property name: "Montenegro Select - Guests"
   - Time zone: Europe/Belgrade
   - Currency: EUR

2. **Get Measurement ID**
   - Navigate to "Data Streams"
   - Click "Add Stream" → "Web"
   - Website URL: `https://montenegroselect.me`
   - Stream name: "Montenegro Select Web"
   - Copy Measurement ID (format: `G-XXXXXXXXXX`)

3. **Install in Next.js**

   **Option A: Using Google Tag Manager (Recommended)**

   Install GTM package:
   ```bash
   pnpm add @next/third-parties
   ```

   Update `app/layout.tsx`:
   ```typescript
   import { GoogleAnalytics } from '@next/third-parties/google'

   export default function RootLayout({ children }) {
     return (
       <html lang="en">
         <body>
           {children}
           <GoogleAnalytics gaId="G-XXXXXXXXXX" />
         </body>
       </html>
     )
   }
   ```

   **Option B: Manual Installation**

   Add to `.env.local`:
   ```bash
   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

   Create `lib/analytics.ts`:
   ```typescript
   export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

   export const pageview = (url: string) => {
     if (typeof window !== 'undefined' && window.gtag) {
       window.gtag('config', GA_MEASUREMENT_ID, {
         page_path: url,
       })
     }
   }

   export const event = ({ action, category, label, value }) => {
     if (typeof window !== 'undefined' && window.gtag) {
       window.gtag('event', action, {
         event_category: category,
         event_label: label,
         value: value,
       })
     }
   }
   ```

   Add to `app/layout.tsx`:
   ```typescript
   <Script
     src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
     strategy="afterInteractive"
   />
   <Script id="google-analytics" strategy="afterInteractive">
     {`
       window.dataLayer = window.dataLayer || [];
       function gtag(){dataLayer.push(arguments);}
       gtag('js', new Date());
       gtag('config', '${GA_MEASUREMENT_ID}');
     `}
   </Script>
   ```

4. **Configure Events**

   Track important actions:

   ```typescript
   import { event } from '@/lib/analytics'

   // Waitlist signup
   event({
     action: 'waitlist_signup',
     category: 'engagement',
     label: 'hero_form',
     value: 1,
   })

   // Email capture
   event({
     action: 'email_captured',
     category: 'lead',
     label: 'footer_form',
     value: 1,
   })
   ```

5. **Privacy Considerations**

   - Add cookie consent banner (required by GDPR if EU visitors)
   - Update Privacy Policy to mention analytics
   - Consider IP anonymization

### **Key Metrics to Monitor**

1. **Traffic Sources**
   - Where do visitors come from?
   - Which channels drive the most traffic?

2. **User Behavior**
   - Which sections get the most engagement?
   - How long do users stay?

3. **Conversions**
   - Waitlist signup rate
   - Email capture rate

4. **Demographics**
   - Location of visitors
   - Language preferences

---

## 🔍 Testing Your SEO Setup

### **1. Test Sitemap**

```bash
# Local
curl http://localhost:3001/sitemap.xml

# Production
curl https://montenegroselect.me/sitemap.xml
```

### **2. Test Robots.txt**

```bash
# Local
curl http://localhost:3001/robots.txt

# Production
curl https://montenegroselect.me/robots.txt
```

### **3. Test Structured Data**

Tools:

- **Google Rich Results Test**: https://search.google.com/test/rich-results
- **Schema.org Validator**: https://validator.schema.org/

Steps:

1. Go to Rich Results Test
2. Enter URL: `https://montenegroselect.me`
3. Check for errors/warnings
4. Verify all schemas are detected

### **4. Test Open Graph Tags**

Tools:

- **Facebook Sharing Debugger**: https://developers.facebook.com/tools/debug/
- **LinkedIn Post Inspector**: https://www.linkedin.com/post-inspector/
- **Twitter Card Validator**: https://cards-dev.twitter.com/validator

Steps:

1. Enter URL: `https://montenegroselect.me`
2. Click "Scrape/Fetch"
3. Verify image, title, description appear correctly

### **5. Test Page Speed**

Tools:

- **PageSpeed Insights**: https://pagespeed.web.dev/
- **GTmetrix**: https://gtmetrix.com/
- **WebPageTest**: https://www.webpagetest.org/

Target Scores:

- Mobile: 90+ (Performance)
- Desktop: 95+ (Performance)
- SEO: 100

### **6. Test Mobile Usability**

Tools:

- **Google Mobile-Friendly Test**: https://search.google.com/test/mobile-friendly
- Chrome DevTools Device Mode

Checklist:

- [ ] Text is readable without zooming
- [ ] Touch targets are properly sized
- [ ] Content fits screen width
- [ ] No horizontal scrolling

---

## 📱 Social Media Integration (When Ready)

When you create social media accounts, update `config/seo.config.ts`:

```typescript
social: {
  instagram: 'https://instagram.com/montenegroselect',
  facebook: 'https://facebook.com/montenegroselect',
  twitter: 'https://twitter.com/montenegroselect',
  linkedin: 'https://linkedin.com/company/montenegroselect',
},
```

This will:

- Add social profile structured data
- Enable proper Twitter Card attribution
- Improve brand signals to search engines

---

## 🎯 Next Steps (Priority Order)

1. **Critical (Before Launch)**
   - [ ] Create favicon and app icons
   - [ ] Create Open Graph image
   - [ ] Review and finalize metadata

2. **At Launch**
   - [ ] Deploy to production
   - [ ] Verify all SEO elements work
   - [ ] Submit sitemap to Google

3. **Within First Week**
   - [ ] Set up Google Search Console
   - [ ] Set up Google Analytics
   - [ ] Monitor initial indexing

4. **Within First Month**
   - [ ] Create social media accounts
   - [ ] Update config with social links
   - [ ] Start content marketing (blog posts)
   - [ ] Build backlinks (partnerships, press)

---

## 📚 Additional Resources

### **SEO Learning**

- [Google Search Central](https://developers.google.com/search)
- [Moz Beginner's Guide to SEO](https://moz.com/beginners-guide-to-seo)
- [Ahrefs SEO Guide](https://ahrefs.com/seo)

### **Technical SEO**

- [Next.js SEO Guide](https://nextjs.org/learn/seo/introduction-to-seo)
- [Schema.org Documentation](https://schema.org/)
- [Open Graph Protocol](https://ogp.me/)

### **Tools**

- [Google Search Console](https://search.google.com/search-console)
- [Google Analytics](https://analytics.google.com)
- [Google PageSpeed Insights](https://pagespeed.web.dev/)
- [Ahrefs Webmaster Tools](https://ahrefs.com/webmaster-tools) - Free alternative to some paid tools

---

## 🆘 Troubleshooting

### **Site Not Indexing**

1. Check robots.txt - ensure it allows crawling
2. Submit sitemap in Search Console
3. Request indexing for specific URLs
4. Check for manual penalties in Search Console
5. Ensure site is accessible (no password protection)

### **Structured Data Errors**

1. Use Rich Results Test to identify issues
2. Check for missing required fields
3. Ensure proper JSON-LD syntax
4. Verify URLs are absolute (include domain)

### **Open Graph Not Working**

1. Clear Facebook/LinkedIn cache
2. Check image dimensions (1200x630 recommended)
3. Ensure image is publicly accessible
4. Verify meta tags in page source (View Source)

### **Poor Performance Scores**

1. Optimize images (WebP format, compression)
2. Enable caching headers
3. Minimize JavaScript bundles
4. Use lazy loading for images
5. Consider CDN (Vercel includes this)

---

## 📞 Support

For questions or issues with SEO implementation:

1. Check this documentation first
2. Review Next.js documentation
3. Use Google Search Central Help Community
4. Test with Google's tools before asking for help

---

**Last Updated:** February 2026  
**Version:** 1.0  
**Author:** Montenegro Select Development Team
