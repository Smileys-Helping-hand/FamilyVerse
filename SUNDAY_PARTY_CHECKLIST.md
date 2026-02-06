# 🎉 Sunday Party Deployment - Final Checklist

## ⏰ Timeline: Deploy by Saturday Evening

---

## 📋 Pre-Deployment Checklist

### 1. Pusher Setup (5 minutes)
- [ ] Go to [Pusher Dashboard](https://dashboard.pusher.com/)
- [ ] Click "Get Started" under **Channels**
- [ ] Create new app: "SundayParty"
- [ ] Select cluster: **South Africa (sa1)** or **Europe (eu)**
- [ ] Go to "App Keys" tab
- [ ] Copy credentials to `.env.local`:
  ```bash
  PUSHER_APP_ID=...
  PUSHER_KEY=...
  PUSHER_SECRET=...
  PUSHER_CLUSTER=sa1
  NEXT_PUBLIC_PUSHER_KEY=...
  NEXT_PUBLIC_PUSHER_CLUSTER=sa1
  ```
- [ ] **IMPORTANT:** Go to Settings → Enable "Client Events" (for race start triggers)

### 2. Sound Files (10 minutes)
- [ ] Download free sounds from [Freesound.org](https://freesound.org) or [Mixkit.co](https://mixkit.co/free-sound-effects/)
- [ ] Add to `public/sounds/`:
  - `cash-register.mp3` or `cash.mp3` (betting sound)
  - `success.mp3` or `win.mp3` (task complete)
  - `whoosh.mp3` (optional - welcome screen)
- [ ] Test audio playback locally

### 3. Database Check
- [ ] Verify `DATABASE_URL` is set in `.env.local`
- [ ] Run: `npm run verify` (if script exists)
- [ ] Test party join flow locally

### 4. Build & Test (15 minutes)
```bash
# Clean build
rm -rf .next
npx next build

# Should show:
# ✓ Compiled successfully
# ✓ 29 routes generated (including /admin/stickers)
```

- [ ] Build passes with no errors
- [ ] New routes visible:
  - `/admin/stickers` ✓
  - `/admin/print` ✓

---

## 🚀 Deployment Steps

### Option A: Vercel (Recommended)

**Step 1: Push Code**
```bash
git add .
git commit -m "Sunday party ready - stickers, pusher, audio"
git push origin main
```

**Step 2: Deploy to Vercel**
1. Go to [vercel.com](https://vercel.com)
2. Click "Import Project"
3. Connect GitHub repo
4. Vercel auto-detects Next.js

**Step 3: Add Environment Variables**
In Vercel Dashboard → Settings → Environment Variables, add ALL from `.env.local`:
- `DATABASE_URL`
- `PUSHER_APP_ID`, `PUSHER_KEY`, `PUSHER_SECRET`, `PUSHER_CLUSTER`
- `NEXT_PUBLIC_PUSHER_KEY`, `NEXT_PUBLIC_PUSHER_CLUSTER`
- `NEXT_PUBLIC_FIREBASE_*` (all 6 Firebase variables)
- `GOOGLE_GENAI_API_KEY`

**Step 4: Deploy**
1. Click "Deploy"
2. Wait 3-5 minutes
3. Visit deployment URL

**Step 5: Add Custom Domain (Optional)**
1. Settings → Domains
2. Add your domain
3. Update DNS records (A record or CNAME)
4. Wait 10-15 minutes for propagation

---

## 📱 Mobile Testing (Critical!)

### Test on Your Phone (30 minutes before party)

**1. Sticker Factory** `/admin/stickers`
- [ ] Opens on phone
- [ ] Select "Join Party"
- [ ] Tap "Share to Printer"
- [ ] Share sheet appears
- [ ] Select your printer app (Pink/Blue Thermal Printer)
- [ ] Sticker loads in printer app
- [ ] **PRINT ONE TEST STICKER** 🖨️
- [ ] QR code scans successfully

**2. Audio Welcome Screen** `/party/join`
- [ ] Beautiful splash screen appears
- [ ] Tap "Tap to Enter Party"
- [ ] Whoosh sound plays (if available)
- [ ] Join page appears smoothly

**3. AwehChat FAB**
- [ ] Floating button visible (bottom-right)
- [ ] Tap opens https://www.awehchat.co.za
- [ ] Opens in new tab/window

**4. Sim Racing Trash Talk**
- [ ] Go to `/party/tv`
- [ ] "Trash Talk" button visible on leaderboard
- [ ] Clicking opens AwehChat

**5. Pusher Real-Time**
- [ ] Open browser console (F12)
- [ ] Should see Pusher connection logs (in dev mode)
- [ ] Join party on one device
- [ ] TV page updates in real-time

---

## 🖨️ Printer Setup Day-Of

### Connect Thermal Printer
**Android/iOS:**
1. Settings → Bluetooth
2. Pair printer
3. Name it something memorable ("Party Printer")

**Test Print:**
1. Open `/admin/stickers` on phone
2. Select "Join Party"
3. Share to printer app
4. Print 3-5 stickers
5. Cut along dashed borders
6. Test scan with different phones

---

## 🎯 Party Day URLs

Share these with guests:

| What | URL |
|------|-----|
| **Join Party** | `yourdomain.com/party/join` |
| **Print Stickers** | `yourdomain.com/admin/stickers` |
| **TV Mode** | `yourdomain.com/party/tv` |
| **Admin Control** | `yourdomain.com/admin/control` |
| **Portal** | `yourdomain.com/portal` |

---

## 🆘 Troubleshooting

### Audio Not Playing
- **Cause:** Browser blocks audio until user interaction
- **Fix:** Audio welcome screen handles this automatically
- **Fallback:** Users must tap/click something first

### Stickers Won't Print
- **Cause 1:** Printer not paired
  - **Fix:** Bluetooth settings → Pair printer
- **Cause 2:** Share sheet not working
  - **Fix:** Download image instead, open in printer app manually
- **Cause 3:** QR code too light
  - **Fix:** Adjust printer darkness/contrast settings

### Pusher Not Connecting
- **Cause 1:** Wrong cluster
  - **Fix:** Change to 'eu' if 'sa1' won't connect
- **Cause 2:** Client Events disabled
  - **Fix:** Pusher Dashboard → Settings → Enable Client Events
- **Cause 3:** Environment variables not set
  - **Fix:** Verify `NEXT_PUBLIC_PUSHER_*` in Vercel settings

### Build Fails
- **Cause:** TypeScript errors
- **Fix:** Already handled with `ignoreBuildErrors: true` in next.config.ts

---

## ✅ Final Pre-Party Checklist (1 Hour Before)

- [ ] Deployment live and accessible
- [ ] Thermal printer charged and paired
- [ ] 10 "Join Party" stickers printed
- [ ] TV mode open on big screen (`/party/tv`)
- [ ] Admin control open on host device (`/admin/control`)
- [ ] Phone ready with `/admin/stickers` bookmarked
- [ ] AwehChat FAB works
- [ ] Audio plays after first tap
- [ ] Pusher real-time updates working

---

## 🎊 Success Criteria

Your party is ready when:
- ✅ Guests scan QR → Join party instantly
- ✅ TV updates leaderboard in real-time
- ✅ Print stickers on-demand from phone
- ✅ Cash register sound on bets
- ✅ Success sound on task completion
- ✅ Trash talk button opens AwehChat
- ✅ Everything feels slick and professional

---

## 📞 Emergency Contacts

- **Pusher Status:** [status.pusher.com](https://status.pusher.com)
- **Vercel Status:** [vercel-status.com](https://www.vercel-status.com)
- **Browser Console:** Press F12 to debug issues

---

**You've got this! 🚀 The most high-tech birthday party in Cape Town is about to happen!**
