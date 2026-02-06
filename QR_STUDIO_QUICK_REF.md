# 🏷️ QR Studio Quick Reference Card

## 📍 Access
**URL**: `/admin/qr-studio` (from admin control panel)  
**Button**: "QR Studio" in admin control header

## ⚙️ Settings (Left Panel)
| Setting | Default | Purpose |
|---------|---------|---------|
| Paper Width | 50mm | Match your label roll |
| Paper Height | 30mm | Or use continuous mode |
| Helper Text Toggle | ON | Show/hide text on label |
| Custom Text | "Scan Me!" | Change label message |

## 🎯 QR Types (Quick Select)

### 1️⃣ Party Join
- **For**: Guest entry
- **Need**: Party code (e.g., PARTY123)
- **Place**: Front door, invitations
- **Action**: Joins party instantly

### 2️⃣ Task Completion  
- **For**: Interactive scavenger hunt
- **Need**: Select task from dropdown
- **Place**: Hide around venue
- **Action**: Completes task when scanned

### 3️⃣ Sim Rig Check-in
- **For**: Lap time submission
- **Need**: Nothing (auto-generated)
- **Place**: On sim racing rig
- **Action**: Opens lap time page

### 4️⃣ Wi-Fi Login
- **For**: Guest WiFi access
- **Need**: SSID, password, security type
- **Place**: Entry area, guest room
- **Action**: Auto-connects to WiFi

### 5️⃣ Custom URL
- **For**: Anything else
- **Need**: Any URL
- **Place**: Anywhere
- **Action**: Opens URL

## 🖨️ Print Settings Checklist

When print dialog opens:
- ✅ **Printer**: Select thermal printer
- ✅ **Margins**: Set to "None" (0mm)
- ✅ **Scale**: 90-100%
- ✅ **Orientation**: Portrait
- ✅ **Color**: Black & White

## 🚀 Quick Actions

| Button | Action | Result |
|--------|--------|--------|
| **Print Now** | Single label | Opens print dialog |
| **Copy URL** | Copy to clipboard | For manual sharing |
| **Download SVG** | Save as file | For later use/editing |
| **Print All Tasks** | Batch print | All task QRs in one go |

## 💡 Top Use Cases

1. **Front Door Welcome**
   - Party Join QR + Wi-Fi QR
   - 2 labels, side by side

2. **Scavenger Hunt**
   - Click "Print All Task QRs"
   - Cut strip, hide labels
   - First to find all wins!

3. **Sim Racing Setup**
   - Sim Rig QR on steering wheel
   - Quick lap submission

4. **Wi-Fi for Guests**
   - One WiFi QR in main area
   - Copies in bedrooms

5. **Photo Sharing**
   - Custom URL to photo album
   - Near photo booth

## ⚡ Keyboard Shortcuts
None currently - all mouse/touch based

## 🔧 Troubleshooting

| Problem | Solution |
|---------|----------|
| QR too small | Increase scale to 100% |
| QR cut off | Set margins to 0mm |
| Blank page | Check paper loaded correctly |
| Won't scan | Check lighting, clean camera |
| Gray instead of black | Enable B&W in printer settings |

## 📏 Label Size Guide

| Width | Best For |
|-------|----------|
| 25mm | QR only, no text |
| 50mm | **Standard** (recommended) |
| 80mm | Large, easy scanning |
| 100mm+ | Visible from distance |

## 🎯 Placement Tips

**High Traffic**: Front door, kitchen, living room  
**Hidden**: Under chairs, behind frames, in books  
**Eye Level**: Easier to scan  
**Well-Lit**: Avoid shadows on QR  
**Accessible**: Don't block with furniture  

## 🔄 Workflow

### Setup (Once)
1. Go to QR Studio
2. Enter paper dimensions
3. Test print WiFi QR
4. Adjust scale if needed

### Before Party
1. Batch print all tasks
2. Print 3-5 party join codes
3. Print WiFi code
4. Hide task QRs

### During Party
- Print more as needed
- Generate custom URLs on the fly

## 📱 Scanning

**Works with**: iPhone Camera, Android Camera, any QR app  
**Distance**: 6-12 inches  
**Lighting**: Good light required  
**Angle**: Straight on  

## 💾 Data

- No QR codes stored on server
- Generated in browser real-time
- Task data from database
- URLs use your domain

## 🆘 Quick Fixes

**Print dialog won't open**: Allow popups  
**QR won't generate**: Fill required fields  
**Batch print empty**: No tasks in party  
**Label too big**: Reduce paper dimensions  

## 🎨 Label Tips

- **Short text**: 3-5 words max
- **Clear message**: "Scan to Join Party"  
- **Task name**: Show which task it completes
- **Multiple copies**: Print extras of important ones

## 🔗 URLs Generated

All QR codes use your actual domain:
- Party Join: `yourapp.com/party/join?code=XXX`
- Task: `yourapp.com/api/tasks/complete?taskId=XXX`
- Sim Rig: `yourapp.com/party/sim-racing`
- WiFi: `WIFI:S:SSID;T:WPA;P:pass;;`

## 📊 Print Preview

The preview shows **exact physical size** at 2x scale for visibility.

## 🎉 Pro Tips

1. Test print one before batch
2. Use high-contrast areas for placement
3. Laminate outdoor labels
4. Keep label roll in printer
5. Print extras for backup
6. Take photo of QR locations
7. Remove after party

---

**Print Count Tracker**: Track how many you've printed to manage inventory!

**Label Roll**: 50mm × 30mm = ~150 labels per roll

**Estimated Usage Per Party**: 
- 5 party join
- 10-20 tasks
- 2-3 WiFi
- 5 custom
- **Total: ~25-35 labels**

---

**Need more help? See full guide: `QR_STUDIO_GUIDE.md`**
