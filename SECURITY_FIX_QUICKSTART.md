# 🚨 SECURITY FIX - QUICK START

## The Problem
**CRITICAL BUG:** Party code `1696` logs you in as Admin! ❌

## The Solution  
**Separate codes:** Party Join Code (public) vs Admin PIN (secret) ✅

---

## ⚡ FASTEST FIX (3 Steps)

### 1️⃣ Run PowerShell Script
```powershell
.\apply-security-fix.ps1
```
Choose option 1 (Push Schema) or 2 (Open Studio)

### 2️⃣ Update Admin PIN
**In Neon Console or Drizzle Studio:**
```sql
UPDATE party_users 
SET pin_code = '2026', role = 'admin' 
WHERE name = 'Mohammed Parker';
```

### 3️⃣ Test It
- **Incognito window** → Enter `1696` → Should ask for name ✅
- **Admin access** → Click "Host Login" → Enter `2026` ✅

---

## 📊 The Changes

### Before (BROKEN) ❌
```
Code: 1696
↓
Logs in as Mohammed (ADMIN)
↓
Guests get admin access! 💀
```

### After (FIXED) ✅
```
Guest Path:
Code: 1696 → Party Join → Enter Name → Guest Access

Admin Path:
"Host Login" → PIN: 2026 → Admin Dashboard
```

---

## 🎯 What Each Code Does Now

| Code | Type | Who Uses It | Access Level |
|------|------|-------------|--------------|
| **1696** | Party Join Code | GUESTS (public) | Limited (games, betting) |
| **2026** | Admin PIN | YOU ONLY (secret) | Full control |

---

## ✅ Quick Verification

Run this SQL to check everything:
```sql
-- Should show party with code 1696
SELECT * FROM parties WHERE join_code = '1696';

-- Should show YOU with secret PIN 2026
SELECT name, pin_code, role FROM party_users WHERE role = 'admin';
```

---

## 🧪 Test Commands

```powershell
# 1. Start dev server
npm run dev

# 2. Open in Incognito
start http://localhost:3000/party/join

# 3. Test guest: Enter 1696
# 4. Test admin: Click "Host Login", enter 2026
```

---

## 🆘 If Something Breaks

### Issue: Code 1696 doesn't work
```sql
INSERT INTO parties (name, join_code, is_active) 
VALUES ('Mohammed''s Party', '1696', TRUE);
```

### Issue: Admin PIN doesn't work
```sql
UPDATE party_users 
SET pin_code = '2026', role = 'admin' 
WHERE name = 'Mohammed Parker';
```

### Issue: Guests still get admin
```sql
UPDATE party_users 
SET role = 'guest' 
WHERE role != 'admin' OR role IS NULL;
```

---

## 📁 Files Changed

✅ **Schema** → [src/lib/db/schema.ts](src/lib/db/schema.ts)
- Added `joinCode` to parties
- Made `pinCode` unique and secret

✅ **Server Actions** → [src/app/actions/party-logic.ts](src/app/actions/party-logic.ts)
- `checkCodeAction()` - Routes based on code type
- `createGuestUserAction()` - Creates guest users

✅ **Join Page** → [src/app/party/join/page.tsx](src/app/party/join/page.tsx)
- Added "Host Login" backdoor

✅ **Guest Onboarding** → [src/app/party/guest-onboarding/page.tsx](src/app/party/guest-onboarding/page.tsx)
- Name + Avatar selection
- Auto-approved guests

---

## 🎉 After You're Done

**Share with guests:**
> "Join the party! Go to [your-url]/party/join and enter code **1696**"

**Keep secret:**
> Admin PIN: **2026** (NEVER share this!)

---

## 📖 Full Documentation
- **Complete Guide:** [SECURITY_FIX_IMPLEMENTATION.md](SECURITY_FIX_IMPLEMENTATION.md)
- **SQL Script:** [drizzle/UPDATE_ADMIN_PIN.sql](drizzle/UPDATE_ADMIN_PIN.sql)
- **PowerShell Helper:** [apply-security-fix.ps1](apply-security-fix.ps1)

---

**Status:** ✅ Code is ready → Just need database update!
