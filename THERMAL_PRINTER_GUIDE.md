# 🖨️ Thermal Printer Quick Reference

## How to Print Stickers with Your 58mm Printer

### On Mobile (Android/iOS)

#### Method 1: Native Print (Recommended)
1. Open `/admin/print` in Chrome or Safari
2. Select what to print (Join Party, Sim Racing, or Task)
3. Tap "Print Single" or "Print All Tasks"
4. Tap **Share** → **Print**
5. Select your **Bluetooth Printer**
6. Print!

#### Method 2: Printer App (If browser printing doesn't work)
1. Open `/admin/print`
2. Generate the QR code
3. Take a **screenshot**
4. Open your printer's companion app (e.g., "PrintHand", "PrinterShare")
5. Select the screenshot and print

### On Desktop (Windows/Mac)

#### USB Thermal Printer
1. Connect printer via USB
2. Open `/admin/print` in Chrome
3. Press **Ctrl+P** (Windows) or **Cmd+P** (Mac)
4. Select your thermal printer
5. Set margins to **"None"** or **"Minimum"**
6. Paper size: **58mm** (or select "Custom" if not available)
7. Click **Print**

#### Bluetooth Thermal Printer
1. Pair printer via Bluetooth settings first
2. Follow same steps as USB
3. Select Bluetooth printer when prompted

---

## 🏷️ What Gets Printed

### Single Print Mode
```
┌──────────────┐
│ SCAN TO JOIN │  ← Bold helper text
│              │
│   ████████   │  ← QR Code (160x160px)
│   ████████   │
│   ████████   │
│              │
│ Scan Now! 🔥 │  ← Small footer text
└──────────────┘
   58mm wide
```

### Batch Print Mode (All Tasks)
```
┌──────────────┐
│ FIND THE      │
│  IMPOSTER     │
│   ████████    │
│   ████████    │
│   Task #1     │
├──────────────┤  ← Page break (cut here)
│ SIM RACING    │
│  CHALLENGE    │
│   ████████    │
│   ████████    │
│   Task #2     │
├──────────────┤
│     ...       │
└──────────────┘
One long vertical strip - cut between tasks
```

---

## 🎨 Customization Options

### QR Code Types
- **Join Party** - Brings guests to the party join page
- **Sim Racing** - Opens the sim racing challenge
- **Specific Task** - Links to a particular task

### Helper Text
- Automatically set based on QR type
- Bold, uppercase, high contrast for easy reading
- Examples: "SCAN TO JOIN", "SCAN TO RACE", "FIND IMPOSTER"

---

## 🛠️ Troubleshooting

### QR Code Won't Scan
- **Too small?** Try printing at higher resolution
- **Blurry?** Clean printer head
- **Low contrast?** Adjust printer darkness settings

### Nothing Prints
- **Check connection:** USB plugged in? Bluetooth paired?
- **Paper loaded?** Thermal paper installed correctly?
- **Browser support:** Try Chrome if Safari doesn't work
- **Printer selected?** Make sure you select the right printer in dialog

### Print is Cut Off
- Set margins to **None** or **Minimum**
- Select paper size **58mm** (not A4 or Letter)
- Try printing one at a time instead of batch

### Mobile Bluetooth Not Working
- **Pair first** in phone Settings → Bluetooth
- **Restart printer** if connection fails
- **Use printer app** as fallback (Method 2 above)

---

## 📐 Technical Specs

| Setting | Value |
|---------|-------|
| Paper width | **58mm** |
| QR Code size | 160x160px |
| QR Error correction | High (Level H) |
| Font family | Arial, sans-serif |
| Print quality | 203 DPI (typical thermal) |

---

## 🎯 Before Event Day

1. **Test print 3-5 stickers** to verify setup
2. **Check ink/paper supply** - thermal printers use special paper
3. **Charge printer** if wireless
4. **Save QR codes** as backup (screenshot)
5. **Print "Join Party" QR** in advance for entrance

---

## 🚨 Day-Of Quick Actions

### Pre-Print All Tasks (Recommended)
```
1. Go to /admin/print
2. Click "Print All Tasks"
3. Cut the strip into individual stickers
4. Place around the venue
```

### Print On-Demand
```
1. Open /admin/print on phone/tablet
2. Select task when needed
3. Print and hand to guest immediately
```

---

## 💡 Pro Tips

✨ **Pre-cut stickers** before the event starts  
✨ **Laminate** QR codes for reusability (optional)  
✨ **Print extras** - always have backups  
✨ **Test scanning** from different phones  
✨ **Keep printer charged** throughout event  

---

**Quick Access:** [`/admin/print`](/admin/print) 🖨️
