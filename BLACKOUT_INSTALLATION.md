# 🚀 Blackout Game Master - Installation Guide

## Quick Start (5 Minutes)

### Step 1: Install Dependencies
```powershell
npm install
```

**New packages added:**
- `qrcode@1.5.4` - QR code generation
- `@types/qrcode@1.5.5` - TypeScript types

### Step 2: Run Database Migration
```powershell
psql "postgresql://neondb_owner:npg_lCB8qhoisV0p@ep-lucky-surf-a8bwawn5t-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require" -f drizzle/blackout-migration.sql
```

**What this creates:**
- 6 new tables (game_config, imposter_hints, civilian_topics, tasks, task_completions, kill_events)
- Default configuration (30min blackouts, 30s killer window)
- Seed data (5 hints, 5 topics)

### Step 3: Start Dev Server
```powershell
npm run dev
```

### Step 4: Access Admin Dashboard
```
http://localhost:9002/admin/dashboard
PIN: 1234
```

---

## 📁 Files Created

### Database & Schema
- ✅ `src/lib/db/schema.ts` - Extended with 6 new tables
- ✅ `drizzle/blackout-migration.sql` - Complete migration script

### Server Actions (24 Functions)
- ✅ `src/app/actions/game-master.ts` - Config, content, player management
- ✅ `src/app/actions/tasks.ts` - QR generation, task completion

### UI Components
- ✅ `src/app/admin/dashboard/page.tsx` - Main admin page (PIN protected)
- ✅ `src/components/game-master/ConfigEditor.tsx` - Timing & power controls
- ✅ `src/components/game-master/ContentManager.tsx` - Hints & topics CRUD
- ✅ `src/components/game-master/TaskCreator.tsx` - QR code generator
- ✅ `src/components/game-master/PlayerManager.tsx` - Force kill, reassign roles

### Game Loop & Tasks
- ✅ `src/components/party/BlackoutGameLoop.tsx` - TTS, timers, state machine
- ✅ `src/app/game/task/[task_id]/page.tsx` - Task scanner page
- ✅ `src/components/party/mini-games/WirePuzzle.tsx` - Wire connection puzzle
- ✅ `src/components/party/mini-games/CodeEntry.tsx` - 4-digit code entry
- ✅ `src/components/party/mini-games/SequenceMatch.tsx` - Memory sequence game

### Documentation
- ✅ `BLACKOUT_GAME_MASTER.md` - Complete guide (11,000+ words)
- ✅ `BLACKOUT_INSTALLATION.md` - This file

---

## 🎮 First-Time Setup

### 1. Configure Game Settings

Access `/admin/dashboard` and go to **Configuration** tab:

- Set **Blackout Interval**: 20-30 minutes (recommended for first game)
- Set **Killer Window**: 30 seconds
- Leave **Power Level**: 100%

### 2. Add Custom Content

Go to **Content** tab:

**Add Imposter Hints** (what killer sees):
```
"Act confused when asked specific questions"
"Pretend to recall a vague memory"
"Ask clarifying questions to stall"
```

**Add Civilian Topics** (what crewmates discuss):
```
"Favorite childhood memory"
"Best vacation you've ever had"
"Most embarrassing moment"
```

### 3. Create Task Stations

Go to **Tasks** tab:

**Task 1: "Repair Wi-Fi"**
- Mini-game: Wire Puzzle
- Bonus: 120 seconds
- Click "Create Task & Generate QR"
- Download PNG
- Print and place on router

**Task 2: "Reboot Server"**
- Mini-game: Code Entry
- Bonus: 180 seconds
- Print and place near computer

**Task 3: "Restore Power"**
- Mini-game: Sequence Match
- Bonus: 150 seconds
- Print and place near breaker box

### 4. Test the System

**Test Admin Controls:**
```powershell
# 1. Open dashboard
http://localhost:9002/admin/dashboard

# 2. Try pause/resume
# 3. Adjust power level
# 4. View created tasks
```

**Test QR Scanning:**
```powershell
# 1. Scan QR with phone camera
# 2. Opens: /game/task/{uuid}
# 3. Complete mini-game
# 4. Check power boost applied
```

**Test TTS:**
```powershell
# 1. Open BlackoutGameLoop component
# 2. Wait for blackout warning
# 3. Hear TTS: "Power failure imminent"
# 4. Test mute button
```

---

## 🔧 Configuration

### Environment Variables

Add to `.env.local`:
```env
# Your Neon connection (already set)
DATABASE_URL=postgresql://neondb_owner:...

# For QR codes (set to your local IP for phone access)
NEXT_PUBLIC_APP_URL=http://192.168.1.100:9002

# Admin PIN (optional, defaults to 1234)
ADMIN_PIN=your-secret-pin

# Gemini API (already set)
GEMINI_API_KEY=your-key
```

### Get Your Local IP

**Windows:**
```powershell
ipconfig
# Look for "IPv4 Address"
```

**Why:** Phones on same Wi-Fi need this to scan QR codes and access tasks.

### Update Admin PIN

**File:** `src/app/admin/dashboard/page.tsx`
```typescript
const ADMIN_PIN = '1234'; // Change this
```

Or use environment variable:
```typescript
const ADMIN_PIN = process.env.ADMIN_PIN || '1234';
```

---

## 🎯 Integration with Existing App

### Add to Your Dashboard

```tsx
// src/app/dashboard/page.tsx
import { BlackoutGameLoop } from '@/components/party/BlackoutGameLoop';

export default function Dashboard() {
  const eventId = 1; // Your event ID
  const sessionId = 'current-session-id'; // From game session
  
  return (
    <>
      {/* Your existing dashboard */}
      
      {/* Add Blackout overlay (only shows during active game) */}
      <BlackoutGameLoop 
        eventId={eventId} 
        sessionId={sessionId}
        onStateChange={(state) => {
          console.log('Game state:', state);
          // Update your UI based on state
        }}
      />
    </>
  );
}
```

### Add Admin Link to Header

```tsx
// src/components/layout/Header.tsx
import { Shield } from 'lucide-react';

<Button variant="ghost" asChild>
  <Link href="/admin/dashboard">
    <Shield className="h-4 w-4 mr-2" />
    Admin
  </Link>
</Button>
```

### Add Tasks to Game Hub

```tsx
// src/components/party/PartyHub.tsx
import { QrCode } from 'lucide-react';

<TabsTrigger value="tasks">
  <QrCode className="h-4 w-4 mr-2" />
  Tasks
</TabsTrigger>

<TabsContent value="tasks">
  <TaskScanner eventId={eventId} sessionId={sessionId} />
</TabsContent>
```

---

## 📱 Mobile Setup (For Players)

### Connect Phones to Wi-Fi

1. All players connect to **same Wi-Fi** as host laptop
2. Share URL: `http://192.168.1.100:9002` (your local IP)
3. Bookmark on home screen for easy access

### PWA Installation (Optional)

Add to `next.config.ts`:
```typescript
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
});

module.exports = withPWA({
  // Your existing config
});
```

Create `public/manifest.json`:
```json
{
  "name": "Blackout Game",
  "short_name": "Blackout",
  "description": "Hybrid social deduction game",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0f172a",
  "theme_color": "#8b5cf6",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

Now players can "Add to Home Screen" for app-like experience!

---

## 🐛 Common Issues

### Issue: "Cannot find module 'qrcode'"

**Fix:**
```powershell
npm install qrcode @types/qrcode
```

### Issue: Migration fails with "table already exists"

**Fix:**
```sql
-- Drop tables and retry
DROP TABLE IF EXISTS kill_events CASCADE;
DROP TABLE IF EXISTS task_completions CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS civilian_topics CASCADE;
DROP TABLE IF EXISTS imposter_hints CASCADE;
DROP TABLE IF EXISTS game_config CASCADE;

-- Then re-run migration
\i drizzle/blackout-migration.sql
```

### Issue: TTS not speaking

**Fix:** Web Speech API requires user gesture. Add a "Start Game" button:
```tsx
<Button onClick={() => window.speechSynthesis.speak(new SpeechSynthesisUtterance('Ready'))}>
  Start Game
</Button>
```

### Issue: QR codes don't scan

**Fix 1:** Use correct URL in `.env.local`:
```env
NEXT_PUBLIC_APP_URL=http://192.168.1.100:9002
```

**Fix 2:** Check QR in browser first:
```
http://localhost:9002/game/task/your-task-id
```

### Issue: Admin PIN not working

**Fix:** Clear browser cache or try incognito mode. PIN is stored in component state.

---

## 🧪 Testing Checklist

Before your first event:

### Admin Dashboard
- [ ] Access `/admin/dashboard` with PIN 1234
- [ ] Change blackout interval to 20 minutes
- [ ] Pause and resume game
- [ ] Adjust power level manually

### Content Management
- [ ] Add 3 custom imposter hints
- [ ] Add 3 custom civilian topics
- [ ] Toggle one hint to inactive
- [ ] Delete a topic

### Task System
- [ ] Create task with Wire Puzzle
- [ ] Download QR code PNG
- [ ] Scan QR with phone camera
- [ ] Complete mini-game
- [ ] Verify power boost applied
- [ ] Check task completion stats

### Game Loop
- [ ] Component renders without errors
- [ ] Timer counts down
- [ ] TTS speaks at blackout
- [ ] Mute button works
- [ ] Pause freezes timer
- [ ] Power level updates

### Mini-Games
- [ ] Wire Puzzle: Connect 3 wires correctly
- [ ] Code Entry: Enter 4-digit code
- [ ] Sequence Match: Repeat 5-color sequence

---

## 📊 Database Schema

**New tables:**
```sql
game_config          -- Timing, power, pause state
imposter_hints       -- Dynamic killer hints
civilian_topics      -- Dynamic conversation topics
tasks                -- QR code task stations
task_completions     -- Who completed what
kill_events          -- Kill log for analytics
```

**Modified tables:**
```sql
game_sessions        -- Added: game_mode, night_phase_started_at, day_phase_ends_at
```

**Indexes created:**
```sql
-- Fast lookups
idx_game_config_event_id
idx_imposter_hints_event_id
idx_civilian_topics_event_id
idx_tasks_event_id
idx_tasks_qr_code_data
idx_task_completions_unique (task_id, session_id, user_id)
```

---

## 🚀 Deployment Checklist

### Before Going Live

1. **Change Admin PIN**
   ```typescript
   const ADMIN_PIN = process.env.ADMIN_PIN || '1234';
   ```

2. **Set Public URL**
   ```env
   NEXT_PUBLIC_APP_URL=https://yourdomain.com
   ```

3. **Run Migration on Production**
   ```powershell
   psql $DATABASE_URL -f drizzle/blackout-migration.sql
   ```

4. **Test on Production**
   - Access admin dashboard
   - Create test task
   - Scan QR code
   - Verify TTS works

### Post-Deployment

1. **Add Authentication** (Optional but recommended)
   ```tsx
   // Protect admin routes
   if (!session?.user?.isAdmin) {
     redirect('/login');
   }
   ```

2. **Enable Analytics**
   ```sql
   -- Track all game sessions
   SELECT * FROM kill_events ORDER BY killed_at DESC LIMIT 10;
   SELECT * FROM task_completions ORDER BY completed_at DESC LIMIT 10;
   ```

3. **Backup QR Codes**
   - Download all QR PNGs
   - Store in cloud storage
   - Create printable PDF booklet

---

## 🎉 Ready to Play!

Your **Hybrid Digital/Physical Escape Room** is ready!

**Next steps:**
1. Run `npm install` (if not done)
2. Run database migration
3. Access `/admin/dashboard`
4. Create 3-5 tasks
5. Print QR codes
6. Host your first Blackout game night!

**Need help?**
- See [BLACKOUT_GAME_MASTER.md](./BLACKOUT_GAME_MASTER.md) - Complete guide
- Check [PARTY_COMPANION_README.md](./PARTY_COMPANION_README.md) - API docs

---

**Installation complete!** 🎮✨

Run the verification script to test everything:
```powershell
npm run verify
```
