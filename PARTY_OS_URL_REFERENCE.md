# 🎮 Party OS - Quick Access URLs

## 📺 For Display/TV
```
http://localhost:3000/party/tv
```
**Purpose:** Auto-cycling dashboard for living room TV  
**Features:** Leaderboards, wallet heat map, game status  
**Cast:** Use browser's cast feature or HDMI cable

---

## 🎰 For Guests (Mobile)
```
http://localhost:3000/party/join
```
**Purpose:** Guest entry point  
**Flow:** Enter name → Get PIN → Join party

### Quick Join (QR Code)
```
http://localhost:3000/party/join?code=BIRTHDAY26
```
**Purpose:** Skip code entry, direct join  
**Flow:** Scan QR → Enter name → Upload photo → Join instantly

### Guest Dashboard
```
http://localhost:3000/party/dashboard
```
**Purpose:** View games, place bets, see leaderboard  
**Auto-redirect:** After successful join

---

## 🎮 For Host (Admin)
```
http://localhost:3000/admin/control
```
**Purpose:** God Mode control panel  
**Features:**
- Submit lap times
- Manage race grids
- Start Imposter rounds
- Settle bets
- Emergency wallet funds

### Legacy Admin (Basic)
```
http://localhost:3000/admin/race-control
```
**Purpose:** Simple lap time and Imposter starter  
**Use:** If God Mode is too complex

---

## 🔗 Other Routes

### Main Dashboard
```
http://localhost:3000/dashboard
```
**Purpose:** Family/User dashboard (non-party features)

### Party Companion (Old)
```
http://localhost:3000/party/dashboard
```
**Purpose:** Party dashboard (redirects if not joined)

---

## 📱 Mobile-Optimized URLs

All URLs work on mobile, but these are optimized:
- `/party/join` - Touch-friendly, large buttons
- `/party/dashboard` - Swipeable tabs
- `/party/join?code=X` - One-tap entry

---

## 🖥️ Desktop-Optimized URLs

Best viewed on desktop/laptop:
- `/party/tv` - Full-screen for TV
- `/admin/control` - Multi-column layout

---

## 🔒 Security Notes

### Public Access (Safe)
- `/party/join` ✅
- `/party/join?code=X` ✅
- `/party/dashboard` ✅

### Admin Only (Secure)
- `/admin/control` ⚠️ Add PIN protection
- `/admin/race-control` ⚠️ Add PIN protection
- `/party/tv` ✅ Safe (read-only)

---

## 🎯 Party Flow Diagram

```
Guests scan QR code
      ↓
/party/join?code=X
      ↓
Enter name + photo
      ↓
/party/dashboard
      ↓
Browse games, place bets
```

```
Host opens laptop
      ↓
/admin/control
      ↓
Start games, submit scores
      ↓
TV updates in real-time
```

```
TV/Projector
      ↓
/party/tv
      ↓
Auto-cycles views
      ↓
Shows leaderboards & winners
```

---

## 🧪 Testing URLs

### Test Sequence
1. Open `/party/tv` on TV/laptop
2. Open `/admin/control` on admin device
3. Open 3 x `/party/join` in incognito tabs
4. Join as Alice, Bob, Charlie
5. Admin: Start Imposter round
6. Admin: Submit lap times
7. Guests: Place bets
8. Admin: Settle bets
9. Watch TV celebrate winner 🎉

---

## 🔗 QR Code Generator

Use this URL format for QR codes:
```
http://YOUR_IP:3000/party/join?code=PARTY_NAME_2026
```

**Example:**
```
http://192.168.1.100:3000/party/join?code=BIRTHDAY26
```

Generate at: https://qr-code-generator.com/

---

## 📡 Network Access

### Local Network
```
http://YOUR_LOCAL_IP:3000/party/join
```
Find your IP:
```bash
# Windows
ipconfig

# Look for "IPv4 Address"
# Example: 192.168.1.100
```

### Public Access (Advanced)
Use ngrok or similar:
```bash
npx ngrok http 3000
```
Share the https URL with guests.

---

## 🎊 Bookmark These!

**Host Essentials:**
- 🎮 Control Panel: `/admin/control`
- 📺 TV Display: `/party/tv`

**Guest Essentials:**
- 🚪 Entry: `/party/join`
- 🎰 Dashboard: `/party/dashboard`

---

## 🚀 Launch Checklist

Before party starts:
- [ ] Open `/party/tv` on TV
- [ ] Test `/party/join?code=X` on your phone
- [ ] Open `/admin/control` on laptop
- [ ] Print QR code for door
- [ ] Test Pusher connection (check console)
- [ ] Ensure WiFi is strong
- [ ] Have PIN codes ready for admins

**You're ready! 🎉**
