# 🚀 Party OS - 48 Hour Deployment Guide

## ✅ Pre-Deployment Checklist

- [x] Build passes locally (`npx next build`)
- [x] Thermal printer page created (`/admin/print`)
- [x] Mobile viewport optimized (no input zoom)
- [x] Audio initialization on first interaction
- [x] AwehChat floating button integrated
- [x] Trash talk button on sim racing leaderboard

## 📋 Environment Variables Required

Copy these from your `.env.local` to Vercel:

```bash
# Database
DATABASE_URL=postgresql://...

# Pusher (Real-time updates)
PUSHER_APP_ID=...
PUSHER_KEY=...
PUSHER_SECRET=...
PUSHER_CLUSTER=ap1
NEXT_PUBLIC_PUSHER_KEY=...
NEXT_PUBLIC_PUSHER_CLUSTER=ap1

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

# Google AI
GOOGLE_GENAI_API_KEY=...
```

## 🌐 Vercel Deployment Steps

### 1. Push to GitHub (if not already)
```bash
git add .
git commit -m "Party OS ready for deployment"
git push origin main
```

### 2. Import to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "Import Project"
3. Connect your GitHub repository
4. Vercel will auto-detect Next.js

### 3. Configure Environment Variables
1. In Vercel Dashboard → Settings → Environment Variables
2. Add ALL variables from `.env.local`
3. Make sure `NEXT_PUBLIC_*` variables are set for Production, Preview, and Development

### 4. Deploy
1. Click "Deploy"
2. Wait 2-3 minutes for build
3. Visit your deployed URL (e.g., `your-project.vercel.app`)

## 🏷️ Custom Domain Setup

### Option A: Using Vercel's DNS
1. Vercel Dashboard → Settings → Domains
2. Add your domain (e.g., `partyos.yourdomain.com`)
3. Update your domain's nameservers to Vercel's:
   - `ns1.vercel-dns.com`
   - `ns2.vercel-dns.com`

### Option B: Using Existing DNS Provider
1. Vercel Dashboard → Settings → Domains
2. Add your domain
3. Vercel shows you the DNS records needed:
   ```
   Type: A
   Name: @ (or subdomain)
   Value: 76.76.21.21
   ```
   OR
   ```
   Type: CNAME
   Name: www (or subdomain)
   Value: cname.vercel-dns.com
   ```
4. Add these records in your DNS provider (GoDaddy, Afrihost, Cloudflare, etc.)
5. Wait 5-15 minutes for DNS propagation

## 🖨️ Thermal Printer Setup

### Access the Print Page
Once deployed, go to: `https://yourdomain.com/admin/print`

### Mobile Printing (Android/iOS)
1. Connect Bluetooth thermal printer to phone
2. Open `/admin/print` in Chrome/Safari
3. Tap Share → Print
4. Select Bluetooth Printer
5. OR Screenshot and print via printer's app

### Desktop Printing (USB)
1. Connect USB thermal printer
2. Open `/admin/print` in Chrome
3. Press `Ctrl+P` (Windows) or `Cmd+P` (Mac)
4. Select thermal printer
5. Set margins to "None" or "Minimum"
6. Paper size: "58mm" or custom

### Batch Printing
Click "Print All Tasks" to generate a long strip of QR codes for cutting.

## 🔊 Audio Files Setup

Add sound effects to `public/sounds/`:

- `cash-register.mp3` - Plays when betting
- `success.mp3` - Plays on task completion

Get free sounds from:
- [Freesound.org](https://freesound.org)
- [Zapsplat.com](https://zapsplat.com)
- [Mixkit.co](https://mixkit.co/free-sound-effects/)

## 📱 Mobile Testing Checklist

Test on actual phones before the event:

- [ ] No input zoom when tapping text fields
- [ ] Audio plays after first button click
- [ ] AwehChat FAB visible in bottom-right
- [ ] QR codes scannable from `/admin/print`
- [ ] Trash talk button opens AwehChat
- [ ] Party join page loads on first visit
- [ ] Dashboard responsive on small screens

## 🎮 Party OS URLs (Post-Deployment)

| Feature | URL |
|---------|-----|
| **Guest Entry** | `/party/join` |
| **Dashboard** | `/party/dashboard` |
| **TV Mode** | `/party/tv` |
| **Admin Control** | `/admin/control` |
| **Thermal Printer** | `/admin/print` |
| **QR Studio** | `/admin/qr-studio` |
| **Portal Hub** | `/portal` |

## 🚨 Common Issues & Fixes

### Build Fails on Vercel
- Check environment variables are set correctly
- Ensure `NEXT_PUBLIC_*` variables are added
- Check TypeScript errors in build logs

### Audio Doesn't Play
- Audio requires user interaction (fixed with `initializeAudio()`)
- Check browser console for audio permissions
- Ensure sound files exist in `public/sounds/`

### Real-time Updates Not Working
- Verify Pusher credentials match your Pusher app
- Check `NEXT_PUBLIC_PUSHER_*` variables are set
- Test on `/party/tv` page

### Domain Not Resolving
- Wait 10-15 minutes for DNS propagation
- Clear browser cache or use incognito mode
- Verify DNS records in your domain provider

## 🎯 Day-Of Event Checklist

**2 Hours Before:**
- [ ] Deploy latest version to Vercel
- [ ] Print QR codes for "Join Party" 
- [ ] Test on 2-3 different phones
- [ ] Verify AwehChat opens correctly
- [ ] Check thermal printer connectivity

**Event Start:**
- [ ] Share join URL or display QR code
- [ ] Open `/party/tv` on big screen
- [ ] Keep `/admin/control` open on host device
- [ ] Monitor guest approvals

**During Event:**
- [ ] Print task QR codes as needed
- [ ] Monitor real-time leaderboard
- [ ] Check wallet balances
- [ ] Approve pending guests

## 🔗 Quick Links

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Domain Setup Guide:** https://vercel.com/docs/custom-domains
- **Next.js Deployment:** https://nextjs.org/docs/deployment
- **AwehChat:** https://www.awehchat.co.za

---

**Event is in 48 hours** - Deploy NOW and test thoroughly! 🏎️💨
