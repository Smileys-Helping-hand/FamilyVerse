# 🕵️ Spy Game - Quick Start Guide

## 🚀 Get Started in 3 Steps

### 1. Navigate to Setup
```
http://localhost:3000/party/spy-game/setup
```

### 2. Configure Game
- **Players**: Set number (min 3)
- **Spies**: Set count (max 50% of players)
- **Timer**: Choose duration (default 4 minutes)
- **Category**: Pick from 6 options (Countries, Sports, etc.)
- **Names**: Customize player names

### 3. Choose Play Mode

#### Option A: Digital Pass & Play
- Click **"Start Game"**
- Pass phone around
- Each player taps to reveal role
- Timer starts automatically

#### Option B: Physical Cards
- Click **"Print Cards"**
- Generate QR codes
- Download or share to print app
- Players scan their cards

---

## 📁 Routes

| Route | Purpose |
|-------|---------|
| `/party/spy-game/setup` | Game configuration |
| `/party/spy-game/reveal` | Role reveal (pass & play) |
| `/party/spy-game/active` | Live game with timer |
| `/party/spy-game/print` | QR card generator |

---

## 🎮 Game Flow

```
SETUP → REVEAL → ACTIVE → VOTE
  ↓       ↓        ↓       ↓
Config  Roles   Timer   Results
```

---

## ✨ Key Features

✅ **50% Spy Limit** - Prevents unfair games  
✅ **Auto Timer** - 10-min warning + time's up alerts  
✅ **Hint System** - Host can nudge stalled games  
✅ **Print Support** - 384px thermal printer cards  
✅ **Audio Alerts** - Sound effects for warnings  
✅ **Color-Coded Roles** - Red (spy) / Green (civilian)

---

## 🎯 Validation Rules

- Minimum 3 players
- Maximum spies = floor(players / 2)
- Timer: 1-60 minutes
- Must select category before starting

---

## 📱 Mobile Tips

- Works best in portrait mode
- Keep screen unlocked during pass & play
- Use volume buttons to test audio
- Share print cards via native share sheet

---

## 🎵 Audio Setup (Optional)

Place in `public/sounds/`:
- `alarm.mp3` - 10-minute warning
- `emergency.mp3` - Time's up siren

Game works without audio (visual alerts still show)!

---

## 🖨️ Printing Tips

1. Generate cards at 384px width
2. Share to "FunPrint" or similar app
3. Cut along borders
4. Distribute face-down
5. Players scan when ready

---

## 🎨 UI Colors

- **Purple**: Players configuration
- **Blue**: Spies configuration  
- **Indigo**: Timer configuration
- **Magenta**: Category selection
- **Red**: Spy reveals & warnings
- **Green**: Civilian reveals & success

---

## 🏁 Test Flow

Quick test (3 minutes):
1. Go to setup
2. Set: 3 players, 1 spy, 1 minute
3. Pick any category
4. Start game
5. Click through reveals
6. Skip to 10-min warning to test alert
7. End game to see voting overlay

---

## 📚 Categories Available

- **Countries** (22 words)
- **Objects** (22 words)
- **Sports** (22 words)
- **Places** (22 words)
- **Animals** (22 words)
- **Transport** (22 words)

Each word has 3+ hints for the host system!

---

## 🔥 Pro Tips

💡 **For Hosts:**
- Use "Send Hint" if players get stuck
- Pause timer for breaks
- You can see who the spy is (don't tell!)

💡 **For Players:**
- Spies: Listen carefully to blend in
- Civilians: Be specific but not too obvious
- Watch for hesitation and vague answers

💡 **For Print Mode:**
- Print on quality paper for better QR scans
- Use bright lighting when scanning
- Keep cards secret until game starts

---

## ✅ Quick Checklist

Before your party:
- [ ] Test setup page loads
- [ ] Configure sample game
- [ ] Test pass & play flow
- [ ] Verify timer countdown works
- [ ] Check audio files (optional)
- [ ] Test print generation (if using)

---

**Status:** ✅ Production Ready  
**Installation:** `npm install qrcode @types/qrcode`  
**No Backend Required:** Runs 100% client-side using localStorage

🎉 **Ready to Play!**
