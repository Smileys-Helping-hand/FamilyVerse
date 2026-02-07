# 🚀 SPY GAME - QUICK ACTION PLAN (10 Minutes)

## ⚡ Immediate Steps

### 1️⃣ Database Migration (2 minutes)
```powershell
# Run from project root:
npm run db:push

# OR manually in Neon Console:
# Copy/paste contents of: drizzle/spy-game-automation-migration.sql
```

### 2️⃣ Add Audio Files (3 minutes)
```powershell
# Download 2 sound files:
# 1. alarm.mp3 - 10-minute warning
# 2. emergency.mp3 - emergency meeting

# Place in: public/sounds/

# Quick option: Use text-to-speech
say "Warning! Ten minutes remaining!" -o public/sounds/alarm.aiff
say "Emergency Meeting!" -o public/sounds/emergency.aiff
# Then convert .aiff to .mp3 (or use online converter)
```

**Or skip audio for now** - Visual alerts will still work!

### 3️⃣ Start Server & Test (5 minutes)
```powershell
npm run dev
```

**Admin Test:**
1. http://localhost:3000/party/join
2. Click "Host Login"
3. Enter admin PIN (2026)
4. Go to "Spy Game" tab
5. Click "Start New Round" (choose 15 mins for quick test)
6. **See imposter marked in RED** ✅
7. Watch timer countdown ✅

**Guest Test:**
1. Open incognito window
2. http://localhost:3000/party/join
3. Enter code: 1696
4. Create profile
5. See role + timer ✅

---

## 🎯 Usage at Your Party

### Option 1: Auto-Mode (Recommended)
```
1. Admin Dashboard → Spy Game tab
2. Toggle "Auto-Mode" ON
3. Select 45 minutes
4. Click "Start New Round"
5. Walk away and enjoy! System handles everything 🎉
```

### Option 2: Manual Control
```
1. Start round manually
2. Watch players (imposter in RED)
3. Force 10-min warning when you want
4. Force voting when ready
```

---

## 📋 Quick Checklist

```
Setup:
□ Database migration applied
□ Server running (npm run dev)  
□ Audio files in place (optional)

Admin Test:
□ Login with admin PIN works
□ "Spy Game" tab visible
□ Can start new round
□ Imposter marked in RED
□ Timer counts down
□ Manual controls work

Guest Test:
□ Guest can join with party code
□ Role assignment works (shows IMPOSTER or CIVILIAN)
□ Topic displayed correctly
□ Timer visible and counting
□ 10-min warning appears (if tested)

Party Ready:
□ Create your party in "Parties" tab
□ Share join code with guests
□ Toggle Auto-Mode ON
□ Enjoy! 🎉
```

---

## 🎮 Game Flow (45-Minute Round)

```
0:00  → Round starts
       • Roles assigned
       • Topics revealed
       • Timer starts

35:00 → 10 minutes left
       • ⚠️ Warning overlay
       • 🔊 Alarm sound
       • Orange timer

45:00 → Time's up!
       • 🚨 Emergency meeting
       • 🔊 Emergency sound  
       • Voting phase
```

---

## 🆘 If Something Breaks

**Timer not showing:**
```sql
-- Check for active round:
SELECT * FROM party_imposter_rounds WHERE status = 'ACTIVE';
```

**Wrong imposter:**
```sql
-- Check who it is:
SELECT pr.*, pu.name as imposter_name
FROM party_imposter_rounds pr
JOIN party_users pu ON pr.imposter_id = pu.id
WHERE pr.status = 'ACTIVE';
```

**Audio not playing:**
- Check files exist: `public/sounds/alarm.mp3`
- Try clicking page first (browser autoplay policy)
- Check browser console for errors

---

## 📚 Full Documentation

See **[SPY_GAME_IMPLEMENTATION.md](SPY_GAME_IMPLEMENTATION.md)** for:
- Complete technical details
- All API endpoints
- Component architecture
- Troubleshooting guide

---

**Total Time:** ~10 minutes to be party-ready! 🚀

**Status:** Code complete, just run migration & test! ✅
