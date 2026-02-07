# 🕵️ Spy Game Module - Complete Implementation

## Overview
A fully-featured "Spy/Imposter" party game built in Next.js 14 with Pass & Play functionality, automated game master, and thermal printer support.

---

## 📁 File Structure

```
src/
├── lib/
│   └── spy-game-data.ts           # Categories data & hint system
├── app/party/spy-game/
│   ├── setup/page.tsx             # Phase 1: Configuration UI
│   ├── reveal/page.tsx            # Phase 2: Pass & Play role reveal
│   ├── active/page.tsx            # Phase 3: Auto-game master with timer
│   └── print/page.tsx             # Phase 4: Thermal printer QR cards
```

---

## 🎮 Phase 1: Configuration UI

**Route:** `/party/spy-game/setup`

### Features:
- **2x2 Grid Layout** with color-coded configuration cards
- **Card 1 - Players** (Purple): 
  - Dynamic player count with +/- controls
  - Minimum 3 players
  - Auto-generates player name inputs below
  
- **Card 2 - Spies** (Blue):
  - Dynamic spy count with +/- controls
  - **50% Validation Rule**: Max spies = floor(players / 2)
  - Shows error toast if limit exceeded
  
- **Card 3 - Timer** (Indigo):
  - Minutes selector (1-60 minutes)
  - Default 4 minutes
  
- **Card 4 - Categories** (Magenta):
  - Opens modal with 6 category options
  - Countries, Objects, Sports, Places, Animals, Transport
  - Each category has 20+ words

### Player Names:
- Dynamic input list below grid
- Updates automatically when player count changes
- Default names: "Player 1", "Player 2", etc.

### Actions:
- **Start Game**: Pass & Play mode (reveals on device)
- **Print Cards**: Physical gameplay with QR codes

---

## 🎭 Phase 2: Pass & Play Logic

**Route:** `/party/spy-game/reveal`

### State Machine:
Three states: `COVER` | `REVEAL` | `NEXT_PLAYER`

#### View 1: COVER
- **Background**: Deep purple gradient
- **Icon**: Large animated eye
- **Text**: "Player [Name]... Tap to see your role"
- **Action**: Tap to transition to REVEAL
- **Progress**: Shows "Player X of Y"

#### View 2: REVEAL - Spy
- **Background**: Red/orange gradient
- **Icon**: Spy icon with animation
- **Text**: "YOU'RE A SPY" (huge text)
- **Instructions**: Blend in without knowing the word
- **Action**: Tap to pass phone to next player

#### View 2: REVEAL - Civilian
- **Background**: Green/teal gradient
- **Category**: Shows category name
- **Word**: Displays secret word in huge text
- **Instructions**: Describe without saying it directly
- **Action**: Tap to pass phone to next player

### Logic Flow:
1. Randomly assigns spy roles (respecting 50% limit)
2. Generates secret word from selected category
3. Cycles through all players
4. After last player, redirects to active game

---

## ⏱️ Phase 3: Auto-Game Master

**Route:** `/party/spy-game/active`

### Main Timer Display:
- **Large Countdown**: MM:SS format (8xl/9xl text)
- **Color-Coded**: 
  - Green: > 10 minutes
  - Orange: 3-10 minutes
  - Red: < 3 minutes
- **Progress Bar**: Visual gradient (green → orange → red)

### Audio Triggers:
- **10-Minute Warning**:
  - Plays `alarm.mp3`
  - Shows orange banner at top
  - Toast notification: "⚠️ 10 Minute Warning!"
  
- **Time's Up (0:00)**:
  - Plays `emergency.mp3`
  - Full-screen red overlay
  - Large "VOTE NOW!" text
  - Emergency siren sound

### Host Controls:
- **Pause/Resume**: Stop timer if needed
- **Skip to 10 Min**: Test warning quickly
- **End Now**: Force voting phase
- **Sound Toggle**: Enable/disable audio

### Hint System:
- **Send Hint Button**: Host can help if game stalls
- **Random Hints**: Picks sub-category clue
  - Example: If word is "Lion" → "King of the jungle" or "Has a mane"
- **Auto-Hide**: Hint disappears after 10 seconds
- **Toast Notification**: Shows hint to all players

### Admin View:
- **Secret Word Display**: Large card showing the word
- **Spy Reveal**: Shows spy name(s) in red
- **Player Grid**: All players with role badges
  - Red badge: "🕵️ SPY"
  - Green badge: "✅ Civilian"

### Audio Files Required:
Place in `public/sounds/`:
- `alarm.mp3` - 10-minute warning sound
- `emergency.mp3` - Game end siren

---

## 🖨️ Phase 4: Card Printer

**Route:** `/party/spy-game/print`

### Features:
- **QR Code Generation**: Uses `qrcode` library
- **Thermal Printer Standard**: 384px width
- **Individual Cards**: One per player

### Card Design:
```
┌─────────────────────────┐
│  PLAYER: [Name]         │
│ ─────────────────────── │
│                         │
│       [QR CODE]         │
│    (280x280 pixels)     │
│                         │
│ ⚠️ DON'T SCAN UNTIL     │
│    GAME STARTS!         │
│                         │
│ Scan with camera to     │
│ reveal your role        │
└─────────────────────────┘
```

### QR Code Data:
- **Spy**: "YOU ARE A SPY"
- **Civilian**: "WORD: [SecretWord]"

### Actions:
- **Generate Cards**: Creates printable image strip
- **Download**: Saves PNG to device
- **Share**: Opens native share sheet for printing apps
- **Regenerate**: Create new cards with different assignments

### Workflow:
1. Click "Generate Cards"
2. App creates long vertical image (384px × [500px * numPlayers])
3. Download or share to "FunPrint" app
4. Print on thermal printer
5. Cut into individual cards
6. Players draw cards and scan with phone camera
7. Camera app or QR scanner shows their role
8. **No phone passing required!** 🎉

### Physical Gameplay Benefits:
- No device passing (more hygienic)
- Creates physical game artifacts
- Players can keep cards as souvenirs
- Works great for large groups
- Fun unboxing/reveal moment

---

## 📊 Categories Data

**File:** `src/lib/spy-game-data.ts`

### Available Categories:
Each category contains 20+ words:

1. **Countries**: South Africa, Nigeria, Egypt, Kenya, etc.
2. **Objects**: Laptop, Phone, Watch, Wallet, etc.
3. **Sports**: Golf, Tennis, Rugby, Cricket, etc.
4. **Places**: Beach, Mountain, Desert, Forest, etc.
5. **Animals**: Lion, Elephant, Giraffe, Zebra, etc.
6. **Transport**: Car, Bus, Train, Plane, etc.

### Hint System:
Pre-defined hints for each word:
```typescript
"Lion": [
  "King of the jungle",
  "Has a mane",
  "Big cat"
]
```

**Function:** `getRandomHint(word: string)`
- Returns random hint for stalled games
- Fallback: "Think about the category..."

---

## 🎯 Game Rules

### Setup:
1. Host chooses number of players (min 3)
2. Select number of spies (max 50%)
3. Set timer duration (1-60 minutes)
4. Pick category

### Gameplay:
1. **Role Assignment**: Random spy selection
2. **Reveal Phase**: Players see their roles one by one
3. **Discussion**: Players take turns describing the word
   - Civilians: Know the word, must describe it
   - Spies: Don't know the word, must blend in
4. **Warnings**: 10-minute alert helps pace the game
5. **Voting**: When time's up, discuss and vote for spy

### Winning:
- **Civilians Win**: Correctly identify the spy
- **Spy Wins**: Avoids detection OR guesses the word

---

## 🔧 Technical Details

### State Management:
- **localStorage**: Persists game config between routes
  - `spyGameConfig`: Setup configuration
  - `spyGameAssignments`: Role assignments & word

### Dependencies:
```json
{
  "qrcode": "^1.5.x",
  "@types/qrcode": "^1.5.x"
}
```

### UI Components (shadcn/ui):
- Button
- Card
- Input
- Dialog
- Toast (useToast hook)

### Icons (lucide-react):
- Users, Spy, Timer, Shapes
- Eye, EyeOff, Lightbulb
- Printer, Download, Share2
- AlertTriangle, Home, Volume2

### Animations:
- Tailwind animate-pulse for attention
- Tailwind animate-bounce for tap indicators
- Gradient transitions for timer colors
- Framer Motion for overlays (optional)

---

## 🚀 Usage Flow

### Option 1: Pass & Play (Digital)
```
Setup → Start Game → Reveal (pass phone) → Active Timer → Vote
```

### Option 2: Print Cards (Physical)
```
Setup → Print Cards → Generate QR Codes → Share/Download → 
Print → Cut Cards → Distribute → Scan → Active Timer → Vote
```

---

## 📱 Responsive Design

All pages are fully responsive:
- **Desktop**: Full 2x2 grid, large timers
- **Tablet**: Adjusted layouts, readable text
- **Mobile**: Single column, optimized for one-handed use
- **Pass & Play**: Optimized for phone passing

---

## 🎨 Color Scheme

Matches provided UI screenshots:

- **Purple** (#7c3aed): Players card
- **Blue** (#2563eb): Spies card
- **Indigo** (#4f46e5): Timer card
- **Magenta/Pink** (#ec4899): Categories card
- **Red** (#dc2626): Spy reveals, warnings
- **Green** (#16a34a): Civilian reveals, success
- **Slate** (#1e293b): Backgrounds, cards

---

## ✅ Implementation Checklist

- [x] Phase 1: Configuration UI with 2x2 grid
- [x] Phase 1: Player/Spy/Timer/Category cards
- [x] Phase 1: 50% spy validation with error toast
- [x] Phase 1: Categories modal with 6 options
- [x] Phase 1: Dynamic player name inputs
- [x] Phase 2: Pass & Play state machine
- [x] Phase 2: Cover view with eye icon
- [x] Phase 2: Spy reveal (red background)
- [x] Phase 2: Civilian reveal (green, shows word)
- [x] Phase 2: Player cycling logic
- [x] Phase 3: Active game page with timer
- [x] Phase 3: Countdown with color coding
- [x] Phase 3: 10-minute audio warning
- [x] Phase 3: Time's up overlay with siren
- [x] Phase 3: Hint system for hosts
- [x] Phase 3: Admin view (spy reveal)
- [x] Phase 4: Print page with QR generation
- [x] Phase 4: 384px thermal printer format
- [x] Phase 4: Download functionality
- [x] Phase 4: Share to print apps

---

## 🏁 Quick Start

1. Navigate to setup page:
   ```
   http://localhost:3000/party/spy-game/setup
   ```

2. Configure game settings

3. Choose gameplay mode:
   - **Start Game**: Digital pass & play
   - **Print Cards**: Physical QR codes

4. Enjoy the automated experience!

---

## 🎉 Key Features

✨ **Replicates UI Screenshots Exactly**
- Purple/Blue/Indigo/Magenta color scheme
- 2x2 grid layout
- Large tap-to-reveal interface

🔒 **50% Spy Validation**
- Prevents imbalanced games
- Shows helpful error messages

🎵 **Audio Integration**
- 10-minute warning alarm
- Emergency meeting siren
- Toggle sound on/off

🖨️ **Physical Gameplay Support**
- Thermal printer compatible (384px)
- QR code generation
- Share directly to print apps

🤖 **Auto-Game Master**
- No manual intervention needed
- Automated warnings and alerts
- Host can send hints if needed

🎨 **Beautiful UI**
- Smooth animations
- Gradient backgrounds
- Color-coded roles

📱 **Mobile-First Design**
- Touch-optimized
- Responsive layouts
- Works great in portrait mode

---

## 🐛 Troubleshooting

### Audio Not Playing:
- Ensure files exist in `public/sounds/`
- Browser may block autoplay (user must interact first)
- Check console for errors
- Use sound toggle to test

### QR Codes Not Scanning:
- Ensure adequate lighting
- Hold phone steady
- Try different QR scanner apps
- Check print quality

### Timer Skipping:
- Don't minimize browser
- Keep screen awake
- Disable power-saving mode

---

## 📚 Additional Notes

### Testing Flow:
1. Test with 3 players, 1 spy, 1 minute timer
2. Verify pass & play works smoothly
3. Test 10-minute warning (skip to it)
4. Test print generation
5. Scale up for real party!

### Customization Ideas:
- Add more categories
- Custom word lists
- Theme variants
- Sound effect options
- Multiple languages

### Performance:
- QR generation is async (doesn't block UI)
- Timer uses 1-second intervals (not resource-intensive)
- LocalStorage for state (no database needed)
- All client-side (no backend required)

---

**Built by:** Senior React Native / Next.js Developer  
**Stack:** Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, qrcode  
**Status:** ✅ Production Ready

🕵️ **Happy Spy Gaming!** 🎉
