# Favicon and App Icon Setup Guide

This guide explains the favicon and app icon requirements for Montenegro Select.

## 🎯 Required Files

### 1. **Favicon Files** (Place in `/public`)

- `favicon.ico` - 32x32px - The classic favicon that appears in browser tabs
- `favicon-16x16.png` - 16x16px
- `favicon-32x32.png` - 32x32px

### 2. **Apple Touch Icons** (Place in `/public`)

- `apple-touch-icon.png` - 180x180px - For iOS devices (Safari, home screen)

### 3. **Android Chrome Icons** (Place in `/public/icons`)

- `icon-72x72.png`
- `icon-96x96.png`
- `icon-128x128.png`
- `icon-144x144.png`
- `icon-152x152.png`
- `icon-192x192.png`
- `icon-384x384.png`
- `icon-512x512.png`

### 4. **Open Graph Image** (Place in `/public/images`)

- `og-image.jpg` or `og-image.png` - 1200x630px
  - This appears when sharing links on social media (Facebook, LinkedIn, Twitter, etc.)
  - Should be eye-catching and represent your brand
  - Include your logo and a tagline

### 5. **Next.js 15 App Router Icons** (Place in `/app`)

Next.js 15 supports file-based metadata. You can create these files:

- `app/icon.png` or `app/icon.jpg` - Next.js will auto-generate multiple sizes
- `app/apple-icon.png` - For Apple devices
- `app/favicon.ico` - Alternative to public/favicon.ico

## 🎨 Design Guidelines

### Brand Colors

- **Navy Background**: `#1a2332`
- **Gold Accent**: `#c9a55a`
- **Cream**: `#f5f1e8`

### Icon Design Tips

1. **Keep it simple** - Icons are viewed at small sizes
2. **Use your logo mark** - The Montenegro Select logo mark or initials
3. **High contrast** - Ensure the icon stands out on various backgrounds
4. **Test at all sizes** - Check readability at 16x16 up to 512x512

### Recommended Approach

**For App Icons (512x512 base):**

- Start with a 512x512px canvas
- Use the Montenegro Select logo mark (simplified if needed)
- Add padding (safe area) - keep important elements in the center 80%
- Background: Navy (#1a2332)
- Logo: Gold (#c9a55a)

**For Favicon (32x32):**

- Ultra-simplified version
- Just the "M" or "MS" initials might work best
- Very clear and bold

**For OG Image (1200x630):**

- Full logo
- Tagline: "Your curated Montenegro experiences that reward you"
- Background image: Montenegro coastline (subtle)
- Text should be readable even at thumbnail size

## 🛠️ Tools to Generate Icons

### Online Tools (Free)

1. **Favicon.io** - https://favicon.io/
   - Generate from text, image, or emoji
   - Creates all required sizes

2. **RealFaviconGenerator** - https://realfavicongenerator.net/
   - Most comprehensive
   - Tests on various devices
   - Generates all formats

3. **Canva** - https://www.canva.com/
   - Design the OG image
   - Free templates available

### Design Software

- **Figma** - Professional design (free tier available)
- **Adobe Illustrator** - For vector logos
- **Photoshop** - For raster editing

## 📦 Quick Setup Checklist

- [ ] Create base icon design (512x512px)
- [ ] Generate all required sizes using a tool
- [ ] Place files in correct directories
- [ ] Create Open Graph image (1200x630px)
- [ ] Test favicon in browser
- [ ] Test Apple Touch icon on iOS
- [ ] Test Open Graph image on social media (Facebook Sharing Debugger)
- [ ] Verify all icons in manifest.json

## 🔍 Testing Your Icons

### Browser Favicon

- Open `http://localhost:3001` in Chrome/Firefox/Safari
- Check the browser tab - your favicon should appear

### Apple Touch Icon

- Open on iPhone/iPad Safari
- Add to Home Screen
- Check if the icon appears correctly

### Open Graph Image

- Use Facebook Sharing Debugger: https://developers.facebook.com/tools/debug/
- Use Twitter Card Validator: https://cards-dev.twitter.com/validator
- Use LinkedIn Post Inspector: https://www.linkedin.com/post-inspector/

### PWA Manifest

- Chrome DevTools > Application > Manifest
- Check if all icons load correctly

## 📝 Current Status

**Status**: ⚠️ Icons not yet created

**Next Steps**:

1. Design the base icon (512x512px)
2. Use RealFaviconGenerator to create all sizes
3. Create Open Graph image (1200x630px)
4. Place files in appropriate directories
5. Test across devices

## 🎓 Best Practices

1. **Consistency** - All icons should use the same design language
2. **Scalability** - Design should work at all sizes
3. **Accessibility** - Ensure sufficient color contrast
4. **Performance** - Optimize file sizes (compress PNGs)
5. **Testing** - Test on real devices, not just emulators

## 📚 Resources

- [Next.js Metadata Files](https://nextjs.org/docs/app/api-reference/file-conventions/metadata)
- [Web App Manifest Spec](https://www.w3.org/TR/appmanifest/)
- [Favicon Cheat Sheet](https://github.com/audreyfeldroy/favicon-cheat-sheet)
- [Open Graph Protocol](https://ogp.me/)
