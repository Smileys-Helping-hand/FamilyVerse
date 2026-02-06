# 🏷️ QR Studio & Label Engine Documentation

## Overview
The QR Studio transforms your FamilyVerse app into a physical party experience by generating QR codes that can be printed on thermal label printers and placed around your venue. Turn your digital party into tangible game assets!

## 🖨️ Hardware Compatibility
- **Thermal Label Printers** (50mm width recommended)
- **Mini Portable Printers** (Bluetooth/USB)
- **Brother QL Series**
- **DYMO Label Printers**
- **Phomemo, Munbyn, Rollo** (any thermal printer)

## 🎯 QR Code Types

### 1. **Party Join** 🎉
- **Purpose**: Allow guests to join your party by scanning
- **Input**: Party code (e.g., PARTY123)
- **Generated URL**: `yourapp.com/party/join?code=PARTY123`
- **Use Case**: Stick on front door, entrance table, or hand out as invitations

### 2. **Task Completion** ✅
- **Purpose**: Let guests complete Among Us-style tasks by scanning
- **Input**: Select from existing tasks in your party
- **Generated URL**: `yourapp.com/api/tasks/complete?taskId=[ID]`
- **Use Cases**:
  - Stick on fridge ("Empty Dishwasher")
  - Under chairs ("Find Hidden Task")
  - On bathroom mirror ("Wash Hands Task")
  - In garage ("Check Tool Inventory")
  - **Scavenger Hunt Mode**: Print all tasks and hide them!

### 3. **Sim Rig Check-in** 🏎️
- **Purpose**: Quick access to sim racing lap time submission
- **Generated URL**: `yourapp.com/party/sim-racing`
- **Use Case**: Stick directly on your sim racing rig so drivers can quickly submit times

### 4. **Wi-Fi Login** 📶
- **Purpose**: Instant WiFi connection for guests
- **Input**: 
  - Network Name (SSID)
  - Password
  - Security Type (WPA/WEP/None)
- **Format**: Standard WiFi QR code compatible with all phones
- **Use Cases**:
  - Welcome table
  - Guest bedroom
  - Gaming area
  - By the router

### 5. **Custom URL** 🔗
- **Purpose**: Link to anything
- **Input**: Any URL or text
- **Use Cases**:
  - Link to party playlist
  - Photo album URL
  - Food delivery menu
  - Emergency contact info

## 🎨 Label Settings

### Paper Dimensions
- **Width**: Default 50mm (adjustable)
- **Height**: Default 30mm (adjustable or continuous)
- **Aspect Ratio**: Automatically calculated for QR code size

### Customization Options
- **Helper Text**: Toggle on/off
- **Custom Text**: Change the label text (e.g., "Scan Me!", "Task Here", etc.)
- **QR Size**: Automatically scaled to paper size
- **High Contrast**: Optimized for thermal printing (black & white only)

## 🖨️ Printing Guide

### Single Label Print
1. Configure your QR code in the studio
2. Preview appears on the right
3. Click **"Print Now"** button
4. Print dialog opens automatically

### Batch Print (Task Scavenger Hunt)
1. Click **"Print All Task QRs"** button
2. Generates all active tasks as separate labels
3. Prints as continuous strip
4. Cut between labels
5. Hide around the venue!

### Printer Settings (IMPORTANT!)
When the print dialog opens:

1. **Select Printer**: Choose your thermal label printer
2. **Margins**: Set to "None" or "0mm" (crucial!)
3. **Scale**: Adjust to 90-100% to fit label
4. **Orientation**: Portrait
5. **Color**: Black & White
6. **Paper Size**: Match your label width (50mm)

### Troubleshooting Print Issues

**QR code is too small:**
- Increase scale to 100%
- Check paper width matches actual label

**QR code is cut off:**
- Set margins to 0mm
- Reduce scale to 90%
- Verify paper dimensions in settings

**Nothing prints:**
- Check printer is online
- Verify printer driver is installed
- Try "More Settings" → "System Print Dialog"

**Gray instead of black:**
- Enable "Black & White" in printer settings
- Some printers: "Print as Image" mode

## 💡 Creative Use Cases

### Scavenger Hunt Party
1. Create 10-15 tasks in your party
2. Use batch print to generate all QR codes
3. Hide them around house/yard
4. First person to complete all tasks wins!
5. Track progress in real-time on the TV dashboard

### Sim Racing Tournament
1. Print "Sim Rig Check-in" QR
2. Stick on steering wheel or monitor
3. Drivers scan to submit lap times instantly
4. No need to find phone/laptop

### Guest Welcome Station
1. Print "Party Join" QR
2. Print "Wi-Fi Login" QR
3. Place both on entry table
4. Guests self-onboard in seconds

### Photo Booth Integration
1. Create custom URL QR to photo album
2. Print and stick near photo booth
3. Guests scan to view/download photos

### Food & Drinks
1. Custom QR to delivery menu
2. Custom QR to recipe instructions
3. Custom QR to cocktail recipes

## 🎯 Label Placement Ideas

### High-Traffic Areas
- Front door (Party Join)
- Kitchen (Wi-Fi, Tasks)
- Living room (TV dashboard link)
- Bathroom (funny tasks)

### Game-Specific
- **Sim Rig**: Lap time submission
- **Board Game Table**: Custom rules link
- **Pool Table**: Score tracking link
- **Dart Board**: Tournament bracket link

### Hidden (Scavenger Hunt)
- Under furniture
- Inside books
- Behind picture frames
- In plant pots
- Inside cabinets
- On ceiling (look up!)

## 📊 Technical Details

### QR Code Specifications
- **Error Correction**: Level H (30% damage tolerance)
- **Encoding**: UTF-8
- **Format**: SVG (scalable, lossless)
- **Size**: Auto-calculated based on paper dimensions
- **Margins**: Included in QR for better scanning

### Print CSS
- Uses `@media print` for clean output
- Removes all UI elements during print
- Forces black & white colors
- Sets margins to 0mm
- Page breaks for batch printing

### Data Storage
- No server storage of QR codes
- Generated on-demand in browser
- URLs use your actual domain
- Task data fetched from database

## 🔒 Security Considerations

### Public QR Codes (Safe to Share)
- Party Join (with code - temporary)
- Wi-Fi Login (if you're comfortable)
- Custom URLs (public content)

### Private QR Codes (Keep Secure)
- Task Completion (party-only features)
- Admin dashboard links
- Sim Rig links (party-only)

**Tip**: Task completion QRs only work when a party is active. They're safe to leave around your house between parties.

## 📱 Scanning

### Compatible Devices
- **iPhone**: Camera app (iOS 11+)
- **Android**: Camera or Google Lens
- **Any smartphone** with QR scanner app

### Scanning Tips
- Hold phone 6-12 inches from QR
- Ensure good lighting
- QR should fill most of camera view
- Most phones auto-detect and show notification
- Tap notification to open link

## 🎨 Label Design Tips

### Text Guidelines
- **Keep it short**: 1-5 words max
- **Be clear**: "Scan to Join Party" better than "Scan Me"
- **Task-specific**: "Complete: Empty Dishwasher" vs generic text
- **Fun emojis**: Add personality (printer renders as text)

### Label Sizes
- **Tiny (25mm)**: QR only, no text
- **Small (50mm)**: Perfect for most uses
- **Medium (80mm)**: Large QR, easy scanning
- **Large (100mm+)**: Visible from distance

### Durability
- **Paper labels**: Indoor, dry areas
- **Laminated**: Outdoor, wet areas (DIY)
- **Clear labels**: Stick on any surface
- **Colored labels**: Match party theme (if printer supports)

## 🚀 Quick Start Workflow

### First Time Setup
1. Go to `/admin/control` → Click "QR Studio"
2. Enter your paper dimensions (check label roll)
3. Test print a "Wi-Fi Login" QR first
4. Adjust scale if needed
5. Once working, generate party codes!

### Party Prep (Day Before)
1. Create all tasks in party system
2. Use batch print for task scavenger hunt
3. Print party join QR (multiple copies)
4. Print Wi-Fi QR
5. Print sim rig check-in if racing
6. Hide task QRs around venue

### During Party
- Print more join codes if needed
- Print custom URLs for spontaneous needs
- Generate new task QRs on the fly

## 💾 Export Options

### Download as SVG
- Scalable vector format
- Print later at any size
- Edit in design software
- Perfect quality at any scale

### Copy URL
- Share via text/email
- Paste into QR generator websites
- Use with online QR services

### Print Now
- Instant thermal printing
- No intermediate steps
- Optimized for label printers

## 🎉 Advanced Tips

### QR Code Art
1. Download SVG
2. Edit in Inkscape/Illustrator
3. Add colors, borders, logos
4. Print on regular printer
5. Laminate for durability

### Multiple Locations
- Print 5+ party join codes
- Place at different entry points
- Front door, back door, garage
- Guests find whichever is closest

### Time-Saving Hacks
- Create template labels
- Save frequently used settings
- Batch print at start of setup
- Keep label roll in printer

### Integration Ideas
- QR code business cards
- Party invitation QRs
- Thank you cards with photo QRs
- Scoreboard link QRs

## 📖 Workflow Examples

### Example 1: Family Game Night
```
1. Print "Party Join" QR → stick on front door
2. Print "Wi-Fi" QR → stick on kitchen counter
3. Print 5 task QRs → hide in living room
4. Print "Games Dashboard" QR → tape to TV
5. Start party!
```

### Example 2: Sim Racing Tournament
```
1. Print "Party Join" QR → entry table
2. Print "Sim Rig Check-in" QR → racing wheel
3. Print "Betting Dashboard" QR → spectator area
4. Print "Leaderboard" QR → wall
5. Race time!
```

### Example 3: Birthday Party
```
1. Print 10 "Party Join" QRs → invitations
2. Print "Wi-Fi" QR → guest bedroom
3. Print 20 task QRs → scavenger hunt
4. Print "Photo Album" QR → photo booth
5. Party started!
```

## 🆘 Support

### Common Issues

**"QR won't scan"**
- Check lighting
- Clean camera lens
- Ensure QR is sharp/not blurry
- Try different phone

**"Prints blank page"**
- Check printer has paper
- Verify thermal side is facing up
- Test with printer's self-test
- Update printer drivers

**"Wrong size prints"**
- Check actual paper dimensions
- Adjust scale in print dialog
- Verify margins are 0mm

**"Too many labels print"**
- You may be in batch mode
- Close batch window
- Use single print mode

## 🎓 Best Practices

1. **Test First**: Always test print one label before batch
2. **Clean QRs**: Don't cover with tape/stickers
3. **Good Placement**: Eye level, well-lit, accessible
4. **Multiple Copies**: Print extras of important ones
5. **Clear Instructions**: Add text to labels
6. **Backup Plan**: Have phone numbers as backup
7. **Remove After**: Take down QRs after party

---

**Ready to print? Head to `/admin/qr-studio` and start creating your physical party experience!** 🎉🏷️
