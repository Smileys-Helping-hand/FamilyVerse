# 🔐 MANUAL DATABASE UPDATE GUIDE

## ⚠️ CRITICAL: Fix Your Identity Before Testing!

Before the new code will work properly, you MUST separate the party join code from your admin PIN.

---

## 🎯 Option 1: Using Neon Console (Recommended)

### Step 1: Log into Neon
1. Go to https://console.neon.tech
2. Select your FamilyVerse database
3. Click "SQL Editor"

### Step 2: Find Your User ID
```sql
-- Find your user info
SELECT id, name, pin_code, role FROM party_users;
```

Copy your `id` (it will be a UUID like `550e8400-e29b-41d4-a716-446655440000`)

### Step 3: Update Your Admin PIN
```sql
-- Replace YOUR_USER_ID with the ID from step 2
UPDATE party_users 
SET pin_code = '2026', role = 'admin' 
WHERE id = 'YOUR_USER_ID';
```

### Step 4: Create Your Party
```sql
-- Create party with join code 1696
INSERT INTO parties (name, join_code, is_active, host_id) 
VALUES ('Mohammed''s Party', '1696', TRUE, 'YOUR_USER_ID')
ON CONFLICT (join_code) DO NOTHING;
```

### Step 5: Verify Everything Worked
```sql
-- Check your admin user
SELECT id, name, pin_code, role FROM party_users WHERE role = 'admin';
-- Should show: pin_code = '2026', role = 'admin'

-- Check party
SELECT * FROM parties WHERE join_code = '1696';
-- Should show: join_code = '1696', is_active = true
```

---

## 🎯 Option 2: Using Drizzle Studio

### Step 1: Open Studio
```powershell
npm run db:studio
```

### Step 2: Update User
1. Click "party_users" table
2. Find your user row (your name)
3. Edit these columns:
   - **pin_code**: Change to `2026`
   - **role**: Set to `admin`
4. Click Save

### Step 3: Create Party
1. Click "parties" table
2. Click "Add Row" button
3. Fill in:
   - **name**: `Mohammed's Party`
   - **join_code**: `1696`
   - **is_active**: `true` (check the box)
   - **host_id**: Copy from your user ID in party_users
4. Click Save

---

## 🎯 Option 3: Quick SQL Script

Copy this entire block and run it in Neon Console:

```sql
-- ============================================
-- QUICK FIX: Separate Party Code from Admin PIN
-- ============================================

-- Step 1: Update admin user PIN (change 'Mohammed Parker' to your actual name)
UPDATE party_users 
SET pin_code = '2026', role = 'admin' 
WHERE name = 'Mohammed Parker' OR name = 'Mohammed';

-- Step 2: Insert party with public join code
INSERT INTO parties (name, join_code, is_active) 
VALUES ('Mohammed''s Party', '1696', TRUE)
ON CONFLICT (join_code) DO NOTHING;

-- Step 3: Set party host_id
UPDATE parties 
SET host_id = (SELECT id FROM party_users WHERE role = 'admin' LIMIT 1)
WHERE join_code = '1696' AND host_id IS NULL;

-- Step 4: Verification
SELECT 'Admin User:' as check_type, name, pin_code, role 
FROM party_users WHERE role = 'admin'
UNION ALL
SELECT 'Party:' as check_type, name, join_code::text, is_active::text 
FROM parties WHERE join_code = '1696';
```

---

## ✅ Expected Results

After running the updates, you should see:

### Admin User:
```
name: Mohammed Parker
pin_code: 2026
role: admin
```

### Party:
```
name: Mohammed's Party
join_code: 1696
is_active: true
```

---

## 🧪 Test It Works

### Test Admin Login:
1. Go to http://localhost:3000/party/join
2. Click "Host Login"
3. Enter PIN: **2026**
4. Should redirect to `/admin/dashboard` ✅

### Test Guest Join:
1. Open incognito window
2. Go to http://localhost:3000/party/join
3. Enter code: **1696**
4. Should see "Welcome to Mohammed's Party!" ✅
5. Should NOT log you in as admin ✅

---

## 🚨 Troubleshooting

### Error: "Invalid code" when entering 1696
**Problem:** Party doesn't exist in database

**Fix:**
```sql
INSERT INTO parties (name, join_code, is_active) 
VALUES ('Mohammed''s Party', '1696', TRUE);
```

### Error: "Invalid admin PIN" when entering 2026
**Problem:** User PIN not updated

**Fix:**
```sql
UPDATE party_users 
SET pin_code = '2026', role = 'admin' 
WHERE name = 'Mohammed Parker';
```

### Guests still get admin access
**Problem:** Old code still checking wrong table

**Fix:** Make sure you pulled latest code and restarted server:
```powershell
git pull
npm install
npm run dev
```

---

## 🎉 After Database is Fixed

Run the Spy Game migration:

```powershell
npm run db:push
```

Or manually run: `drizzle/spy-game-automation-migration.sql`

---

## 📋 Quick Checklist

```
Database Updates:
□ Admin PIN changed to 2026
□ Admin role set to 'admin'
□ Party created with join code 1696
□ Party is_active = true
□ Verification queries run successfully

Testing:
□ Admin login works (PIN 2026)
□ Guest join works (code 1696)
□ Guests don't get admin access
□ Spy Game migration applied

Ready to Party:
□ Server running (npm run dev)
□ Admin dashboard accessible
□ Guest onboarding working
□ Spy Game tab visible
```

---

**Next:** See [SPY_GAME_QUICKSTART.md](SPY_GAME_QUICKSTART.md) for testing the Spy Game!
