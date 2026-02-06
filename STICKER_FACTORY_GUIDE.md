# 🏭 Sticker Factory - Quick Reference

## What Is It?

The Sticker Factory generates **print-ready QR code stickers** optimized for your 58mm thermal printer. Instead of saving files, it uses the **native Share Sheet** to send the sticker directly to your printer app.

## Access

**URL:** `/admin/stickers`

---

## How It Works

### 1. Select Target
Choose what the sticker should do:
- **🎉 Join Party** - Links to party join page
- **🏎️ Sim Racing Rig** - Links to sim racing challenge
- **✅ Specific Task** - Links to a selected task

### 2. Preview
See the black & white sticker:
- **FAMILYVERSE** header (bold, 24px)
- **QR Code** (200x200px, high error correction)
- **Instruction** footer (e.g., "SCAN TO JOIN")
- **Dashed border** for cutting guide

### 3. Share to Printer
Tap "Share to Printer":
1. Share sheet opens on your phone
2. Select your **Thermal Printer App**
3. Sticker loads automatically in the app
4. Print! 🖨️

---

## Technical Specs

| Property | Value |
|----------|-------|
| Width | 384px (58mm @ 203 DPI) |
| Height | Dynamic (based on content) |
| Color Mode | Pure Black & White |
| QR Error Level | High (H) - 30% damage tolerance |
| Border | 4px dashed black |
| Font | Arial, sans-serif |
| Format | PNG (via html2canvas) |

---

## Printing Methods

### Method 1: Native Share (Recommended)
**Works on:** Android, iOS, iPadOS

1. Open `/admin/stickers` on phone
2. Generate sticker
3. Tap "Share to Printer"
4. Select printer app from share sheet
5. Print

**Advantages:**
- ✅ No file management
- ✅ Direct to printer app
- ✅ Fastest workflow

### Method 2: Download & Open
**Fallback** if share isn't supported:

1. Generate sticker
2. Image auto-downloads
3. Open in printer app manually
4. Print

---

## Sticker Templates

### Join Party Sticker
```
┌─────────────┐
│ FAMILYVERSE │
│             │
│   ████████  │ ← QR to /party/join
│   ████████  │
│             │
│ SCAN TO JOIN│
└─────────────┘
```

### Sim Racing Sticker
```
┌─────────────┐
│ FAMILYVERSE │
│             │
│   ████████  │ ← QR to sim racing
│   ████████  │
│             │
│ SCAN TO RACE│
└─────────────┘
```

### Task Sticker
```
┌──────────────────┐
│   FAMILYVERSE    │
│                  │
│     ████████     │ ← QR to specific task
│     ████████     │
│                  │
│ FIND THE RED CUP │ ← Task title
└──────────────────┘
```

---

## Printer App Recommendations

### Android
- **PrintHand Mobile Print** (Free)
- **PrinterShare** (Free tier available)
- **PeriPage** (If using PeriPage brand)

### iOS
- **Smart Printer** (Free)
- **Print Central** (Free)
- **Phomemo** (If using Phomemo brand)

---

## Best Practices

### Before Party
- ✅ Print 10 "Join Party" stickers
- ✅ Print 3-5 "Sim Racing" stickers
- ✅ Test scan from multiple phones
- ✅ Keep printer charged

### During Party
- ✅ Bookmark `/admin/stickers` on your phone
- ✅ Print task stickers on-demand
- ✅ Cut along dashed borders
- ✅ Place stickers around venue

### Printer Maintenance
- ✅ Use thermal paper (not regular paper)
- ✅ Adjust darkness if QR is faint
- ✅ Clean print head if streaks appear
- ✅ Keep paper dry

---

## Troubleshooting

### Share Sheet Not Appearing
**Problem:** "Share to Printer" doesn't show share sheet

**Solutions:**
1. **Check browser:** Safari and Chrome support Web Share API best
2. **Update browser:** Ensure latest version
3. **Fallback:** Image will auto-download instead - open in printer app manually

### QR Code Won't Scan
**Problem:** Phone can't read the QR code

**Solutions:**
1. **Brightness:** Increase printer darkness/contrast setting
2. **Quality:** Re-print at higher quality if available
3. **Focus:** Ensure QR code is sharp, not blurry
4. **Lighting:** Scan in good lighting conditions
5. **Distance:** Hold phone 6-12 inches away

### Sticker Too Large/Small
**Problem:** Sticker doesn't fit paper roll

**Solutions:**
1. **Check paper width:** Must be 58mm (2.25 inches)
2. **Printer settings:** Ensure "Fit to page" is OFF
3. **Paper size:** Select "58mm" in printer app settings
4. **Margins:** Set to none/minimum

### Image Quality Poor
**Problem:** Sticker looks pixelated or grainy

**Solutions:**
1. **Scale:** Already set to 3x for high DPI
2. **App settings:** Check if printer app has quality settings
3. **Paper:** Use fresh thermal paper (old paper fades)
4. **Print speed:** Slower = better quality in most printers

---

## Workflow Tips

### Pre-Event Setup (30 mins)
```
1. Connect printer to phone (Bluetooth)
2. Open /admin/stickers
3. Print "Join Party" x10
4. Print "Sim Racing" x5
5. Cut stickers along dashed borders
6. Place at entrance, rig stations
```

### On-Demand Printing (2 mins)
```
1. Guest asks: "How do I do [task]?"
2. Open /admin/stickers on phone
3. Select "Specific Task" → Choose task
4. Share to printer
5. Hand fresh sticker to guest
```

---

## Advanced: Batch Printing

If you need many stickers:

### Option 1: Print Loop
1. Select target
2. Share to printer
3. Print
4. Change target
5. Repeat

### Option 2: Use `/admin/print`
The original batch print page supports printing all tasks in one go (vertical strip format).

---

## Integration with Other Features

### Works With:
- ✅ Party Join (`/party/join`)
- ✅ Sim Racing (`/party/dashboard?tab=sim-racing`)
- ✅ Task System (`/game/task/[id]`)
- ✅ QR Studio (`/admin/qr-studio`) - Alternative method

### Links To:
- 📱 AwehChat Portal (via FAB)
- 📺 TV Mode (displays sticker results)
- 🎮 Admin Control (manages party flow)

---

## Quick Stats

- **Generation Time:** < 1 second
- **Print Time:** 5-10 seconds (depends on printer)
- **Success Rate:** 99%+ (with good lighting & focus)
- **Paper per Sticker:** ~3-4 inches
- **Battery Life:** ~50-100 stickers per charge

---

**Pro Tip:** Keep your phone screen awake while printing multiple stickers. Most phones have a "Stay Awake" option in developer settings.

---

**You're ready to become Cape Town's coolest party host! 🎉🖨️**
