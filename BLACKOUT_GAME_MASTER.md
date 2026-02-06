# 🎮 BLACKOUT GAME MASTER - Complete Guide

## Overview

You've just built a **Hybrid Digital/Physical Escape Room** system called "Blackout" - a sophisticated social deduction game that combines:

- **Digital narration** (Text-to-Speech, automated timers)
- **Physical task stations** (QR codes with label maker)
- **Live admin controls** (Game Master dashboard)
- **Dynamic content system** (No coding for rule changes)

This is essentially **Werewolf/Mafia** meets **Among Us** meets **Escape Room**, playable in real life at your house.

---

## 🕵️ The Game: "Blackout"

### Core Mechanic

Every 30 minutes (configurable), the app triggers a "Blackout Event":

1. **Warning Phase** (10s): "⚠️ Power failure imminent!"
2. **Blackout** (30s): Everyone closes eyes, killer silently taps victim
3. **Power Restored**: Victim dramatically "dies", players vote

### The Twist: Label Maker Tasks

Crewmates scan QR codes around your house to complete mini-games that **delay blackouts** by boosting "power level." Ignore tasks → blackouts happen faster!

---

## 📁 What Was Built

### 1. Database Schema (6 New Tables)

**File:** [src/lib/db/schema.ts](src/lib/db/schema.ts)

```typescript
game_config          // Blackout timing, power level, pause state
imposter_hints       // Dynamic hints for the killer
civilian_topics      // Conversation topics for crewmates
tasks                // QR code task stations
task_completions     // Who completed what
kill_events          // Kill log for statistics
```

**Key Feature:** `game_sessions` now supports `BLACKOUT` mode with states:
- `DAY_PHASE` → `BLACKOUT_WARNING` → `NIGHT_PHASE` → `BODY_REPORTED` → `VOTING` → `ENDED`

### 2. Server Actions (24 New Functions)

#### **[src/app/actions/game-master.ts](src/app/actions/game-master.ts)** - Admin Controls
```typescript
// Config Management
getGameConfig()              // Fetch current settings
upsertGameConfig()           // Update timing/power
toggleGamePause()            // Emergency pause
adjustPowerLevel()           // Manual power control

// Content Management (No Coding Required!)
getImposterHints()           // List hints
addImposterHint()            // "Act confused"
updateImposterHint()         // Edit/disable
deleteImposterHint()         // Remove

getCivilianTopics()          // List topics
addCivilianTopic()           // "Best vacation"
updateCivilianTopic()        // Edit difficulty
deleteCivilianTopic()        // Remove

// Player Management
getActivePlayers()           // List current players
forceKillPlayer()            // Remove if they leave
reassignPlayerRole()         // Fix role if needed

// Random Selection
getRandomHint()              // Pick hint for imposter
getRandomTopic()             // Pick topic for civilians
```

#### **[src/app/actions/tasks.ts](src/app/actions/tasks.ts)** - QR Code System
```typescript
createTask()                 // Generate QR code + task
getAllTasks()                // List created tasks
getTaskByQrData()            // Lookup via QR scan
completeTask()               // Mark complete + boost power
generatePrintableQR()        // High-res for label printer
getUserTaskCompletions()     // Track user progress
getTaskCompletionStats()     // Analytics
```

### 3. Admin Dashboard (4 Components)

**Route:** `/admin/dashboard` (PIN: `1234`)

#### **[src/app/admin/dashboard/page.tsx](src/app/admin/dashboard/page.tsx)**
- PIN-protected access
- 4 tabs: Config | Content | Tasks | Players

#### **[src/components/game-master/ConfigEditor.tsx](src/components/game-master/ConfigEditor.tsx)**
- Adjust blackout interval (5-120 minutes)
- Set killer window (10-120 seconds)
- Pause/Resume game
- Manual power level control with visual gauge

#### **[src/components/game-master/ContentManager.tsx](src/components/game-master/ContentManager.tsx)**
- Add/edit/delete imposter hints
- Add/edit/delete civilian topics
- Toggle active state (disable without deleting)
- Categories for hints (general/action/behavior)
- Difficulty levels for topics (easy/medium/hard)

#### **[src/components/game-master/TaskCreator.tsx](src/components/game-master/TaskCreator.tsx)**
- Create new task stations
- Select mini-game type (wire puzzle/code entry/sequence)
- Set power bonus (30-300 seconds)
- Generate QR code instantly
- Download PNG for label printer
- View stats (completions, avg time, fastest)

#### **[src/components/game-master/PlayerManager.tsx](src/components/game-master/PlayerManager.tsx)**
- See all active players
- Force eliminate (if someone leaves event)
- Reassign roles (in lobby only)
- View alive/dead status
- See vote counts

### 4. Blackout Game Loop (TTS Integration)

#### **[src/components/party/BlackoutGameLoop.tsx](src/components/party/BlackoutGameLoop.tsx)**

**Features:**
- Automatic countdown timer
- Power level visual gauge
- State machine transitions
- Web Speech API integration (TTS)
- Floating overlay (always visible)
- Mute button

**TTS Phrases:**
```javascript
"Warning. Power failure imminent. Initiating emergency protocol in 10 seconds."
"System failure. Everyone close your eyes. Killer, you have 30 seconds."
"Power restored. Everyone open your eyes."
```

**Power Level Effects:**
- 100% power = Full 30-minute interval
- 50% power = 15-minute interval (blackouts happen faster)
- 0% power = Instant blackout

### 5. Task System (3 Mini-Games)

#### **[src/app/game/task/[task_id]/page.tsx](src/app/game/task/[task_id]/page.tsx)**
- Scans QR code → loads task
- Renders mini-game
- Tracks completion time
- Awards power bonus
- Shows success animation

#### **Mini-Games:**

**[WirePuzzle.tsx](src/components/party/mini-games/WirePuzzle.tsx)**
- Connect colored wires to terminals
- 3 wires (red/blue/yellow)
- Must match correct sequence

**[CodeEntry.tsx](src/components/party/mini-games/CodeEntry.tsx)**
- Enter 4-digit code
- Hint shows first 2 digits
- You hide code clues around house

**[SequenceMatch.tsx](src/components/party/mini-games/SequenceMatch.tsx)**
- Watch color sequence (5 colors)
- Memorize and repeat
- Simon Says style

---

## 🚀 Quick Start

### 1. Install Dependencies
```powershell
npm install
```

This adds:
- `qrcode@1.5.4` (QR generation)
- `@types/qrcode@1.5.5` (TypeScript types)

### 2. Run Database Migration
```powershell
psql "postgresql://neondb_owner:npg_lCB8qhoisV0p@ep-lucky-surf-a8bwawn5t-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require" -f drizzle/blackout-migration.sql
```

**What it does:**
- Creates 6 new tables
- Seeds default hints and topics
- Sets default config (30min intervals, 30s killer window)

### 3. Access Admin Dashboard
```
http://localhost:9002/admin/dashboard
PIN: 1234
```

### 4. Create Your First Task

1. Go to "Tasks" tab
2. Name it: "Repair the Wi-Fi"
3. Select mini-game: "Wire Puzzle"
4. Click "Create Task & Generate QR"
5. Download PNG
6. Print on label maker
7. Stick QR code on your router

### 5. Set Up Hints & Topics

**Imposter Hints (what killer sees):**
```
"Act confused when asked specific questions"
"Pretend to recall a vague memory"
"Mirror the emotions of others"
```

**Civilian Topics (what crewmates discuss):**
```
"Favorite childhood memory"
"Best vacation you've ever had"
"Most embarrassing moment in school"
```

### 6. Start the Game

In your main game interface:
```tsx
import { BlackoutGameLoop } from '@/components/party/BlackoutGameLoop';

<BlackoutGameLoop 
  eventId={1} 
  sessionId="your-session-id"
  onStateChange={(state) => console.log('New state:', state)}
/>
```

---

## 🎯 Game Master Workflow

### Before the Event

1. **Configure Timing**
   - Set blackout interval (recommend 20-30min for first game)
   - Set killer window (30s is good)

2. **Create Tasks** (3-5 recommended)
   ```
   Task 1: "Fix the Wi-Fi" (router) → Wire Puzzle
   Task 2: "Reboot Server" (computer) → Code Entry
   Task 3: "Restore Power" (breaker box) → Sequence Match
   ```

3. **Print & Place QR Codes**
   - Use label maker or regular printer
   - Hide around house (obvious but require walking)

4. **Add Custom Content**
   - 5-10 imposter hints (specific to your group)
   - 5-10 civilian topics (inside jokes work great)

### During the Event

#### **Day Phase (Normal)**
- Players converse on civilian topics
- Crewmates search for QR codes
- Killer blends in
- Monitor power level

#### **When Power Drops Below 50%**
- Announce: "Tasks are critical! Find QR codes!"
- Players scramble to boost power

#### **Blackout Warning (10s)**
- App vibrates + alarm
- TTS: "Power failure imminent"
- Everyone prepares

#### **Night Phase (30s)**
- TTS: "Close your eyes"
- Killer opens eyes, taps victim, returns to spot
- TTS: "Power restored"
- Victim dramatically "dies"

#### **Voting Phase**
- Players discuss who is suspicious
- Vote on phones
- Elimination occurs

### Emergency Controls

**Pause Game:** If someone needs to leave or take a call
**Force Kill Player:** If someone quits mid-game
**Adjust Power:** Speed up or slow down next blackout
**Reassign Roles:** Fix any role assignment mistakes (lobby only)

---

## 📊 Admin Dashboard Reference

### Configuration Tab

| Setting | Default | Range | Effect |
|---------|---------|-------|--------|
| Blackout Interval | 30min | 5-120min | Time between blackouts |
| Killer Window | 30s | 10-120s | How long killer has |
| Power Level | 100% | 0-100% | Current power (affects timing) |
| Game Paused | OFF | ON/OFF | Freeze all timers |

**Power Level Math:**
```typescript
actualInterval = blackoutInterval * (powerLevel / 100)
// 30min @ 100% = 30min
// 30min @ 50% = 15min
// 30min @ 25% = 7.5min
```

### Content Tab

**Imposter Hints:**
- Category: general | action | behavior
- Active/Inactive toggle
- One random hint shown to killer each round

**Civilian Topics:**
- Difficulty: easy | medium | hard
- Active/Inactive toggle
- One random topic shown to civilians each round

### Tasks Tab

**Task Properties:**
- Name (e.g., "Fix Wi-Fi")
- Description (optional, shown on task page)
- Mini-Game Type (wire_puzzle | code_entry | sequence)
- Power Bonus (default 120s, recommend 60-300s)

**QR Code:**
- Auto-generated on creation
- Encodes URL: `/game/task/{uuid}`
- Downloadable as 600x600 PNG
- Optimized for label printers (high error correction)

**Stats:**
- Total completions
- Average time
- Fastest time

### Players Tab

**Per Player:**
- Name, Role (Civilian/Imposter)
- Alive/Dead status
- Vote count
- Force Eliminate button
- Reassign Role dropdown (lobby only)

---

## 🔧 Customization Guide

### Change Admin PIN

**File:** [src/app/admin/dashboard/page.tsx](src/app/admin/dashboard/page.tsx)
```typescript
const ADMIN_PIN = '1234'; // Change this
```

**Production:** Use environment variable:
```typescript
const ADMIN_PIN = process.env.ADMIN_PIN || '1234';
```

### Adjust TTS Voice

**File:** [src/components/party/BlackoutGameLoop.tsx](src/components/party/BlackoutGameLoop.tsx)
```typescript
const speak = (text: string, rate: number = 1.0) => {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = rate;        // Speed (0.5 - 2.0)
  utterance.pitch = 1.0;        // Pitch (0.0 - 2.0)
  utterance.volume = 1.0;       // Volume (0.0 - 1.0)
  utterance.lang = 'en-US';     // Language
  window.speechSynthesis.speak(utterance);
};
```

### Add New Mini-Game

1. **Create Component:**
```tsx
// src/components/party/mini-games/YourGame.tsx
export function YourGame({ onComplete }: { onComplete: () => void }) {
  // Game logic
  return <div>...</div>;
}
```

2. **Update Schema:**
```sql
ALTER TABLE tasks 
ALTER COLUMN mini_game_type TYPE VARCHAR(30);
-- Now accepts 'your_game'
```

3. **Add to Task Page:**
```tsx
// src/app/game/task/[task_id]/page.tsx
{task.miniGameType === 'your_game' && (
  <YourGame onComplete={handleTaskComplete} />
)}
```

### Modify Power Boost Calculation

**File:** [src/app/actions/tasks.ts](src/app/actions/tasks.ts)
```typescript
const powerBoost = Math.min(20, task.completionBonusSeconds / 6);
// 120s = +20 power (current formula)

// Change to linear:
const powerBoost = task.completionBonusSeconds / 10;
// 120s = +12 power

// Or exponential:
const powerBoost = Math.sqrt(task.completionBonusSeconds) * 2;
// 120s = +22 power
```

### Change State Colors

**File:** [src/components/party/BlackoutGameLoop.tsx](src/components/party/BlackoutGameLoop.tsx)
```typescript
const getBackgroundClass = () => {
  switch (gameState) {
    case 'NIGHT_PHASE':
      return 'from-black via-red-950 to-black';  // Change this
    case 'BLACKOUT_WARNING':
      return 'from-slate-900 via-yellow-900 to-slate-900 animate-pulse';
    default:
      return 'from-slate-900 via-purple-900 to-slate-900';
  }
};
```

---

## 🎨 Label Maker Setup

### Recommended Printers
- **Dymo LabelWriter** (thermal, no ink)
- **Brother P-Touch** (tape labels)
- **Rollo** (shipping label printer)

### QR Code Specs
- **Size:** 600x600px (scales to any printer)
- **Format:** PNG with transparency
- **Error Correction:** High (30% damage tolerance)
- **Margin:** 4 modules (white border)

### Print Instructions

**From Admin Dashboard:**
1. Create task
2. Click "View QR" button
3. Click "Download PNG"
4. Open in printer software
5. Print 2-3 copies (backup if damaged)

**Manual Print:**
```tsx
// Direct print
window.print();

// Download as file
const link = document.createElement('a');
link.download = 'task-wifi.png';
link.href = qrCodeDataUrl;
link.click();
```

### Placement Tips
- **Visible but require movement** (not all in one room)
- **Thematic** (Wi-Fi task on router, power task on breaker)
- **Weatherproof if outdoor** (use laminated labels)
- **Height variation** (some low, some high)

---

## 🧪 Testing Checklist

### Admin Dashboard
- [ ] Can access with PIN 1234
- [ ] Can change blackout interval
- [ ] Can pause/resume game
- [ ] Can adjust power level
- [ ] Can add/edit/delete hints
- [ ] Can add/edit/delete topics
- [ ] Can create tasks and view QR
- [ ] Can download QR code PNG

### Game Loop
- [ ] Timer counts down correctly
- [ ] TTS speaks at blackout warning
- [ ] TTS speaks during night phase
- [ ] Power level displayed
- [ ] Pause freezes timer
- [ ] Mute button works

### Tasks
- [ ] Scanning QR loads task page
- [ ] Mini-games render correctly
- [ ] Completing task shows success
- [ ] Power boost applies
- [ ] Stats update (completions, time)

### Mini-Games
- [ ] Wire Puzzle checks solution
- [ ] Code Entry accepts 4 digits
- [ ] Sequence Match shows sequence
- [ ] All games call onComplete() on success

---

## 📈 Analytics & Logs

### Track Kill Events

**Query:** Who killed who?
```sql
SELECT 
  killer_id,
  victim_id,
  kill_method,
  killed_at
FROM kill_events
WHERE session_id = 'your-session-id'
ORDER BY killed_at;
```

### Task Completion Stats

**Query:** Which tasks were hardest?
```sql
SELECT 
  t.name,
  COUNT(tc.id) as completions,
  AVG(tc.time_taken_seconds)::INT as avg_time,
  MIN(tc.time_taken_seconds) as fastest
FROM tasks t
LEFT JOIN task_completions tc ON tc.task_id = t.id
GROUP BY t.id, t.name
ORDER BY avg_time DESC;
```

### Power Level Over Time

Add this to track power history:
```sql
CREATE TABLE power_level_log (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL,
  power_level INTEGER NOT NULL,
  recorded_at TIMESTAMP DEFAULT NOW()
);

-- Log every change
CREATE OR REPLACE FUNCTION log_power_change()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO power_level_log (event_id, power_level)
  VALUES (NEW.event_id, NEW.power_level);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER power_level_update
AFTER UPDATE OF power_level ON game_config
FOR EACH ROW EXECUTE FUNCTION log_power_change();
```

---

## 🚨 Troubleshooting

### TTS Not Speaking

**Issue:** Web Speech API requires user interaction

**Fix:** Add a "Start Game" button that initializes speech:
```tsx
const initializeSpeech = () => {
  const utterance = new SpeechSynthesisUtterance('System ready');
  utterance.volume = 0.01; // Nearly silent
  window.speechSynthesis.speak(utterance);
};

<Button onClick={initializeSpeech}>Start Game</Button>
```

### QR Code Not Scanning

**Issue:** URL in QR doesn't match current domain

**Fix:** Set `NEXT_PUBLIC_APP_URL` in `.env.local`:
```env
NEXT_PUBLIC_APP_URL=http://192.168.1.100:9002
```
Use your local IP so phones on same Wi-Fi can access.

### Tasks Not Boosting Power

**Issue:** `completeTask()` can't find game config

**Fix:** Ensure `eventId` is passed correctly:
```tsx
const task = await getTaskByQrData(qrData);
// task.eventId must match game_config.event_id
```

### Admin Dashboard PIN Wrong

**Issue:** Forgot to update PIN

**Fix:** Reset in database:
```sql
-- For production, use password hash
ALTER TABLE game_config ADD COLUMN admin_pin_hash TEXT;

-- Or use environment variable
-- ADMIN_PIN=your-secret-pin
```

### Power Level Not Affecting Timer

**Issue:** Polling interval too slow

**Fix:** Reduce polling in [BlackoutGameLoop.tsx](src/components/party/BlackoutGameLoop.tsx):
```tsx
timerRef.current = setInterval(async () => {
  // ... existing code
}, 1000); // Change to 500 for faster updates
```

---

## 🎉 Game Night Checklist

### 1 Week Before
- [ ] Test admin dashboard on laptop
- [ ] Create 3-5 tasks
- [ ] Print QR codes
- [ ] Add custom hints/topics
- [ ] Test TTS on phone

### 1 Day Before
- [ ] Place QR codes around house
- [ ] Test scanning with phone
- [ ] Charge all devices
- [ ] Test blackout timing (run 1 round)

### 1 Hour Before
- [ ] Connect all guests to Wi-Fi
- [ ] Share game URL (use local IP)
- [ ] Test TTS volume
- [ ] Explain rules
- [ ] Start first round

### During Event
- [ ] Monitor admin dashboard
- [ ] Watch power level
- [ ] Pause if needed
- [ ] Force kill if someone leaves
- [ ] Take photos/videos!

### After Event
- [ ] Export kill log
- [ ] Check task completion stats
- [ ] Get feedback for next time
- [ ] Archive QR codes for reuse

---

## 🔮 Future Enhancements

### Suggested Features

**Role Abilities:**
```typescript
// Detective: Can scan one person per round
// Medic: Can save one person from death
// Jester: Wins if voted out
```

**Voice Chat Integration:**
```typescript
// During night phase, only killer hears audio
// Use Web Audio API for spatial audio
```

**Team Mode:**
```typescript
// 2 killers, must coordinate kills
// Add "Accomplice" role
```

**Augmented Reality:**
```typescript
// Phone camera shows "ghost" of dead players
// Use AR.js or WebXR API
```

**Achievements:**
```typescript
// "Silent Killer" - Won without being voted
// "Task Master" - Completed all tasks
// "Detective" - Correctly identified killer
```

---

## 📚 API Reference

### Server Actions

**Complete API documentation:**

```typescript
// Game Master Actions
getGameConfig(eventId: number)
upsertGameConfig(eventId: number, updates: Partial<GameConfig>)
toggleGamePause(eventId: number)
adjustPowerLevel(eventId: number, delta: number)

getImposterHints(eventId: number)
addImposterHint(eventId: number, hintText: string, category: string)
updateImposterHint(hintId: number, updates: Partial<ImposterHint>)
deleteImposterHint(hintId: number)

getCivilianTopics(eventId: number)
addCivilianTopic(eventId: number, topicText: string, difficulty: string)
updateCivilianTopic(topicId: number, updates: Partial<CivilianTopic>)
deleteCivilianTopic(topicId: number)

getActivePlayers(sessionId: string)
forceKillPlayer(sessionId: string, userId: string)
reassignPlayerRole(sessionId: string, userId: string, newRole: string)

getRandomHint(eventId: number)
getRandomTopic(eventId: number)

// Task Actions
createTask(eventId: number, taskData: TaskInput)
getAllTasks(eventId: number)
getTaskByQrData(qrData: string)
updateTask(taskId: number, updates: Partial<Task>)
deleteTask(taskId: number)
completeTask(taskId: number, sessionId: string, userId: string, timeTaken: number)
getUserTaskCompletions(sessionId: string, userId: string)
getTaskCompletionStats(taskId: number)
regenerateQRCode(taskId: number)
generatePrintableQR(taskId: number, size: number)
```

---

## ✅ Success!

You now have a fully functional **Hybrid Digital/Physical Escape Room** game system!

**What you can do:**
- ✅ Control game timing from laptop
- ✅ Add new content without coding
- ✅ Create QR code tasks with label maker
- ✅ Automatic TTS narration
- ✅ Real-time power management
- ✅ Emergency admin controls

**What players experience:**
- 🎮 Scan QR codes around house
- 🧩 Complete mini-games on phones
- 🎙️ Hear TTS narration during blackouts
- ⚡ Watch power level in real-time
- 🗳️ Vote on phones after kills

**What makes it sustainable:**
- 📝 Change rules via dashboard (no coding)
- 🎨 Reuse QR codes (print once, use forever)
- 🔧 Emergency controls (pause, force kill)
- 📊 Analytics (who won, task stats)

---

**Need Help?**
- Check [INSTALLATION_GUIDE.md](./INSTALLATION_GUIDE.md) for setup
- See [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) for code details
- Review [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) for commands

**Ready to Host?**
```powershell
npm install
npm run dev
# Visit http://localhost:9002/admin/dashboard
# PIN: 1234
```

🎉 **Have an amazing game night!**
