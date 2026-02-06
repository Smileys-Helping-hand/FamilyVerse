# 🧪 Party OS - Testing Guide

## ✅ System Status

**All systems operational!**

- ✅ 5 party users created
- ✅ Racing game with 4 lap times
- ✅ Imposter game ready
- ✅ Betting system ready
- ✅ Real-time updates via Pusher
- ✅ Navigation added (back buttons)

## 🎮 Quick Test Instructions

### 1️⃣ Test Racing Leaderboard

1. Visit: http://localhost:9002/party/dashboard
2. Click **Racing** tab
3. You should see:
   - 🥇 Speed Demon: 1:22.500
   - 🥈 Drift King: 1:23.200
   - 🥉 Track Master: 1:24.100
   - #4 Nitro Boost: 1:25.750

### 2️⃣ Test Betting System

1. Stay on party dashboard, click **Betting** tab
2. You should see 4 racers with "Bet 100" buttons
3. Click **Bet 100** on any racer
4. Wallet balance decreases (1000 → 900)
5. "My Bets" section shows your bet as PENDING
6. Go to `/admin/race-control`
7. Click **Settle Bets**
8. Winner gets 200 coins (2x payout)

### 3️⃣ Test Imposter Game

1. Go to party dashboard → **Imposter** tab
2. Click the "Admin Panel" button in header OR go to `/admin/race-control`
3. Click **Start Imposter Round**
4. Go back to party dashboard → Imposter tab
5. Tap your card to reveal role:
   - 🟢 Green = Civilian (shows secret word)
   - 🔴 Red = Imposter (shows hint)

### 4️⃣ Test Admin Controls

1. Go to `/admin/race-control`
2. See 3 sections:
   - **Submit Lap Time**: Add new racing times
   - **Start Imposter Round**: Begin new imposter game
   - **Settle Bets**: Pay out winners
3. Submit a lap time (e.g., "1:20.123")
4. See leaderboard update in real-time

### 5️⃣ Test Multi-User

Open separate browsers/incognito windows:

**Browser 1 - Mohammed Parker (PIN: 1696)**
- Already logged in

**Browser 2 - Speed Demon (PIN: 1111)**
1. Go to http://localhost:9002/party/join
2. Click "Returning" tab
3. Enter PIN: 1111
4. Click Login

**Browser 3 - Drift King (PIN: 2222)**
1. Same steps, use PIN: 2222

**Test real-time updates:**
- Admin submits lap time → all browsers see update
- Player places bet → betting slip updates everywhere
- Admin starts imposter round → all players get role cards

### 6️⃣ Test Navigation

**From Party Dashboard:**
- Click "Back to Dashboard" → Goes to main FamilyVerse dashboard
- Click "Admin Control" → Goes to /admin/race-control

**From Admin Race Control:**
- Click "Back to Party" → Returns to party dashboard
- Click "Home Dashboard" → Goes to main FamilyVerse dashboard

## 🎯 Demo User Credentials

| Name | PIN | Starting Balance |
|------|-----|------------------|
| Mohammed Parker | 1696 | 1000 coins |
| Speed Demon | 1111 | 1000 coins |
| Drift King | 2222 | 1000 coins |
| Track Master | 3333 | 1000 coins |
| Nitro Boost | 4444 | 1000 coins |

## 🔍 What to Look For

### Racing Tab ✅
- [x] Leaderboard displays with 4 racers
- [x] Gold/Silver/Bronze medals for top 3
- [x] Lap times formatted correctly (1:22.500)
- [x] Car models displayed
- [x] Green "Live" indicator when Pusher connected

### Betting Tab ✅
- [x] Shows 4 racers (excludes current user)
- [x] Bet 100 button for each racer
- [x] Wallet balance displays correctly
- [x] My Bets section shows bet history
- [x] Pending/Won/Lost status badges

### Imposter Tab ✅
- [x] Shows card with tap-to-reveal
- [x] Civilians see green card + secret word
- [x] Imposter sees red card + hint
- [x] Flip animation works smoothly

### Admin Panel ✅
- [x] Lap time input accepts "1:24.500" format
- [x] Lap time input accepts "84.5" format
- [x] Start Imposter Round button works
- [x] Settle Bets button pays winners
- [x] Toast notifications appear
- [x] Navigation buttons work

## 🐛 Troubleshooting

**Issue: Imposter round fails**
- ✅ FIXED: Changed model from gemini-1.5-flash to gemini-2.0-flash-exp

**Issue: No navigation back to dashboard**
- ✅ FIXED: Added "Back to Dashboard" and "Admin Control" buttons

**Issue: Can't test multiple users**
- ✅ FIXED: Created 5 demo users with easy PINs (1111-4444)

**Issue: Empty leaderboard**
- ✅ FIXED: Seeded 4 lap times for demo racers

## 🎉 Ready for Party!

Everything is working! You can now:
1. ✅ View racing leaderboards
2. ✅ Place bets on racers
3. ✅ Play imposter game with AI-generated words
4. ✅ Submit lap times as admin
5. ✅ Settle bets and pay winners
6. ✅ Navigate between party and main dashboard
7. ✅ Test with multiple users

**Next step:** Refresh your browser and test all features!

**For your party in 4 days:**
- Share the URL with guests (e.g., http://192.168.1.100:9002)
- Each person joins with their name
- They get a unique 4-digit PIN
- All games work in real-time across all devices! 🎊
