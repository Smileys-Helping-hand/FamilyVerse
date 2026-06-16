# 🔐 Vercel Environment Variables Setup

**For your fiancée's Girls Evening to work flawlessly on Vercel**, you need to configure these environment variables.

---

## ✅ What You Need (Checklist)

- ✅ Neon PostgreSQL database connection string
- ✅ Firebase authentication credentials
- ✅ Google Generative AI (Gemini) API key
- ✅ Pusher real-time API credentials
- ✅ Mapbox token (optional, for location search)

---

## 📋 Required Environment Variables for Vercel

### 1. **Database (CRITICAL - Without this, nothing works)**

```
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
```

**How to get it:**
1. Go to [neon.tech](https://neon.tech) → Sign up (free)
2. Create a new project
3. Copy the connection string from the Dashboard
4. Paste into Vercel settings

**Verify it works:**
- Vercel build will auto-run migrations
- Demo page loads: `/demo` should show Girls Evening

---

### 2. **Firebase (For user authentication)**

Get these from your Firebase console at [console.firebase.google.com](https://console.firebase.google.com):

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

**Note:** These start with `NEXT_PUBLIC_` so they can be exposed in the browser safely.

**Verify it works:**
- Login page loads
- Can create account
- User profile saves

---

### 3. **Google Generative AI (Gemini - For AI suggestions)**

```
GOOGLE_GENAI_API_KEY=your_google_genai_api_key
```

**How to get it:**
1. Go to [makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
2. Click **"Create API Key"**
3. Copy the key
4. Paste into Vercel

**What it does:**
- Suggests vendors (BR Pizza, Flavahood, etc.)
- Recommends quantities for shopping list
- Generates smart item descriptions

**Verify it works:**
- Create an event
- Go to shopping list tab
- Click "Get AI Suggestions"
- Should see 3-5 suggestions with descriptions

---

### 4. **Pusher (For real-time updates)**

```
PUSHER_APP_ID=your_app_id
PUSHER_KEY=your_key
PUSHER_SECRET=your_secret
NEXT_PUBLIC_PUSHER_KEY=your_key
NEXT_PUBLIC_PUSHER_CLUSTER=sa1
```

**How to get it:**
1. Go to [pusher.com](https://pusher.com) → Sign up (free tier works!)
2. Create new app
3. Select **South Africa (sa1)** as cluster
4. Copy App ID, Key, Secret

**What it does:**
- Real-time payment tracker updates
- Live shopping list changes
- Instant cousin notifications

**Verify it works:**
- Create event with multiple users
- Update budget from one user
- Other users see update instantly (no refresh)

---

### 5. **Mapbox (OPTIONAL - Location search)**

```
NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_mapbox_token_here
```

**Only needed if:**
- You want location search in event creation
- You want map view for venues

**If you skip it:**
- Event creation still works
- Shop finder still works
- Map features just disabled

---

## 🚀 How to Set These in Vercel

### Step 1: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click **"New Project"**
3. Import FamilyVerse from GitHub
4. Click **"Deploy"** (it will fail on first deploy without env vars)

### Step 2: Add Environment Variables
1. After first deploy, go to **Settings** → **Environment Variables**
2. Click **"Add New"**
3. Enter each variable:
   - **Name**: (e.g., `DATABASE_URL`)
   - **Value**: (paste the value)
   - **Environments**: Select all (Production, Preview, Development)
4. Click **"Save**

### Step 3: Redeploy
1. Go to **Deployments**
2. Click the failed deployment
3. Click **"Redeploy"** at top
4. Wait for build to complete (3-5 minutes)

### Step 4: Test
Visit: `https://[your-vercel-domain].vercel.app/demo`

Should see:
- Girls Evening example loading
- Budget breakdown: R80 meals + R20 snacks
- Payment tracker with 11 cousins
- All features working

---

## 📋 Environment Variable Checklist for Vercel

```
□ DATABASE_URL                                 ✅ CRITICAL
□ NEXT_PUBLIC_FIREBASE_API_KEY                 ✅ CRITICAL
□ NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN             ✅ CRITICAL
□ NEXT_PUBLIC_FIREBASE_PROJECT_ID              ✅ CRITICAL
□ NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET          ✅ CRITICAL
□ NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID     ✅ CRITICAL
□ NEXT_PUBLIC_FIREBASE_APP_ID                  ✅ CRITICAL
□ GOOGLE_GENAI_API_KEY                         ✅ CRITICAL
□ PUSHER_APP_ID                                ✅ CRITICAL
□ PUSHER_KEY                                   ✅ CRITICAL
□ PUSHER_SECRET                                ✅ CRITICAL
□ NEXT_PUBLIC_PUSHER_KEY                       ✅ CRITICAL
□ NEXT_PUBLIC_PUSHER_CLUSTER                   ✅ CRITICAL (should be: sa1)
□ NEXT_PUBLIC_MAPBOX_TOKEN                     ⭕ Optional
```

---

## 🎯 Testing Checklist (After Deploy)

### Visit Demo Page
- ✅ `/demo` loads
- ✅ Girls Evening example displays
- ✅ All 4 metrics show (R100, 27% paid, R80/R20 split, 8/11 claimed)
- ✅ Payment tracker shows 11 cousins with correct names
- ✅ Feature grid displays all 8 features

### Create New Event
- ✅ `/events/new` page loads
- ✅ Can fill in event name
- ✅ Can select date and location
- ✅ Can submit

### Test Authentication
- ✅ Can sign up
- ✅ Can log in
- ✅ User data persists
- ✅ Can log out

### Test AI Suggestions
- ✅ Create event → Go to Shopping tab
- ✅ Click "Get AI Suggestions"
- ✅ See vendor suggestions (pizza, snacks, drinks)
- ✅ Can add suggestions to list

### Test Real-Time Updates
- ✅ Create contribution → See budget update
- ✅ Claim item → See in list
- ✅ Mark item bought → Update price

### Test WhatsApp Share
- ✅ Click "Share on WhatsApp"
- ✅ Pre-filled message appears
- ✅ Message includes event name, budget, cousin count
- ✅ Message includes shareable link

---

## 🚨 If Something Doesn't Work

### Demo page doesn't load
**Issue**: DATABASE_URL might be wrong
- **Fix**: Check Neon connection string
- **Test**: Try demo page again

### Can't sign up
**Issue**: Firebase credentials missing
- **Fix**: Double-check all FIREBASE_* variables in Vercel
- **Test**: Try signup again

### AI suggestions don't appear
**Issue**: GOOGLE_GENAI_API_KEY not set
- **Fix**: Add to Vercel env vars
- **Test**: Refresh page and try again

### Real-time updates don't work
**Issue**: Pusher credentials missing
- **Fix**: Add all PUSHER_* variables to Vercel
- **Test**: Create event from two different browsers

### Page just shows "Loading..."
**Issue**: One of the critical env vars is missing
- **Fix**: Check all 13 variables are set in Vercel
- **Action**: Redeploy after adding missing vars

---

## 💡 Pro Tips

### For Development (Local Testing)
Create `.env.local` file in root:
```bash
DATABASE_URL=your_neon_connection_string
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_key
# ... etc
```

**Never commit `.env.local`** — it's gitignored for security

### For Production (Vercel)
- Use Vercel's Environment Variables UI
- Never paste secrets in code
- Rotate keys regularly
- Monitor API usage (especially Gemini)

### Troubleshooting Deploys
1. Check **Build Logs** in Vercel dashboard
2. Look for "Error: missing environment variable"
3. Add the missing variable
4. Click **Redeploy**

---

## 📞 Support

### If Neon database fails:
- Check connection string has `?sslmode=require` at end
- Verify database exists in Neon dashboard
- Test locally first: `npm run db:push`

### If Firebase auth fails:
- Make sure you created a **Web** app in Firebase (not iOS/Android)
- Verify all 6 Firebase variables are set (even one missing breaks auth)

### If Gemini suggestions fail:
- Check API key is correct
- Verify API is enabled in Google Cloud Console
- Check rate limits (free tier: 60 requests/minute)

### If Pusher real-time fails:
- Make sure cluster is set to `sa1`
- Check both PUSHER_KEY and NEXT_PUBLIC_PUSHER_KEY are identical
- Verify PUSHER_CLUSTER matches NEXT_PUBLIC_PUSHER_CLUSTER

---

## ✨ Once Everything is Set Up

Your fiancée can:
1. Visit the demo to see how it works
2. Create her actual Girls Evening event
3. Share on WhatsApp with her 11 cousins
4. They join via the link instantly
5. Everything updates in real-time
6. AI suggests vendors automatically
7. She never touches a spreadsheet again!

---

**The moment she sees the demo page live on Vercel, the magic begins!** ✨
