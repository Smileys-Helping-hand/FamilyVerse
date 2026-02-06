# Unified Scannables System - Complete Guide

## 📋 Overview

The **Unified Scannables System** is a flexible QR code-based gameplay framework that supports three distinct use cases through a single database architecture:

1. **Tasks** - Physical challenges with QR scanning
2. **Treasure Hunts** - Multi-step sequential puzzles with order validation
3. **Killer Evidence** - Live-editable clues for mystery games (the "Blank Strategy")

### Key Features

✨ **Live Editing** - Update scannable content during the party from admin dashboard
🔗 **Treasure Chains** - Link multiple QR codes in sequence with automatic order validation
🔒 **Solution Codes** - Optional passcode protection for locked clues
📝 **Detective Notebook** - Evidence collection with player notes
🖨️ **Batch Printing** - A4 sheets (3x4 grid) and label printer layouts (62mm)
📊 **Progress Tracking** - Real-time analytics on scans and completions

---

## 🗄️ Database Schema

### Table: `scannables`

Main table storing all QR-based gameplay elements.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key, embedded in QR code URL |
| `event_id` | TEXT | Links to event/party |
| `type` | ENUM | 'TASK', 'TREASURE_NODE', or 'KILLER_EVIDENCE' |
| `label` | TEXT | Display name (e.g., "Evidence #1") |
| `content` | TEXT | Instructions/clue/evidence details |
| `solution_code` | TEXT | Optional passcode for locked clues |
| `chain_id` | TEXT | Groups treasure hunt steps together |
| `chain_order` | INTEGER | Step number in treasure hunt (1, 2, 3...) |
| `is_active` | BOOLEAN | Enable/disable without deleting |
| `qr_code_data` | TEXT | Base64 PNG for printing |
| `reward_points` | INTEGER | Points awarded on scan |
| `created_at` | TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | Last edit timestamp |

### Table: `scannable_scans`

Tracks all player scans with treasure hunt validation.

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL | Primary key |
| `scannable_id` | UUID | References scannables.id |
| `user_id` | TEXT | Player who scanned |
| `session_id` | TEXT | Game session |
| `is_correct_order` | BOOLEAN | False if treasure hunt step out of order |
| `scanned_at` | TIMESTAMP | Scan timestamp |

### Table: `detective_notebook`

Evidence collection for mystery games.

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL | Primary key |
| `user_id` | TEXT | Player's notebook |
| `session_id` | TEXT | Game session |
| `evidence_id` | UUID | References scannables.id |
| `notes` | TEXT | Player's detective notes |
| `collected_at` | TIMESTAMP | Collection timestamp |

---

## 🎮 Usage Scenarios

### Scenario 1: Physical Tasks

**Use Case**: Players scan QR codes to complete physical challenges.

**Setup**:
1. Go to **Admin Dashboard** → **Scannables** tab
2. Select **Tasks** type
3. Enter task label: "Task #1: Kitchen Challenge"
4. Enter instructions: "Find the secret ingredient in the pantry and take a photo"
5. Set reward points: 10
6. Click **Create & Download QR**
7. Print QR code and place in kitchen

**Player Experience**:
1. Player finds QR code
2. Scans with phone camera → opens `/game/scannable/{id}`
3. Sees task instructions
4. Completes task
5. Earns 10 points

---

### Scenario 2: Treasure Hunt

**Use Case**: Multi-step puzzle where players must find clues in order.

**Setup**:
1. Go to **Admin Dashboard** → **Scannables** → **Treasure Hunt**
2. Create Step 1:
   - Label: "Clue #1: The Kitchen"
   - Content: "Look where the family gathers to read"
   - Chain ID: `treasure-hunt-1`
   - Step Number: `1`
3. Create Step 2:
   - Label: "Clue #2: The Library"
   - Content: "Check where dreams are made"
   - Chain ID: `treasure-hunt-1` (same as step 1)
   - Step Number: `2`
4. Create Step 3 (final):
   - Label: "Clue #3: The Bedroom"
   - Content: "Congratulations! You found the treasure!"
   - Chain ID: `treasure-hunt-1`
   - Step Number: `3`

**Player Experience**:
1. Player finds QR code #2 first (out of order)
2. Scans → sees "Locked Clue! Find previous clues first"
3. Finds QR code #1 → scans → reads clue pointing to library
4. Finds QR code #2 → now unlocked → reads clue pointing to bedroom
5. Finds QR code #3 → winner animation!

**Validation Logic**:
```typescript
// Automatic in scanScannable() function
if (scannable.type === 'TREASURE_NODE') {
  // Check if all previous steps scanned
  const previousSteps = [1, 2, ..., currentOrder - 1];
  const hasAllPrevious = checkCompletedSteps(userId, chainId, previousSteps);
  
  if (!hasAllPrevious) {
    return { isCorrectOrder: false, message: "Locked clue!" };
  }
}
```

---

### Scenario 3: Killer Evidence (Blank Strategy)

**Use Case**: Print QR codes now, edit content live during party as killer is revealed.

**Setup** (Before Party):
1. Go to **Admin Dashboard** → **Scannables** → **Evidence**
2. Create 10 evidence scannables with empty content:
   - Label: "Evidence #1", Content: "" (blank)
   - Label: "Evidence #2", Content: "" (blank)
   - ... up to Evidence #10
3. Go to **Print** tab → Print all as labels (62mm)
4. Stick labels around house (kitchen counter, bookshelf, behind TV, etc.)

**Live Editing** (During Party):
1. Killer is revealed to be "Sarah wearing blue jeans"
2. Game Master opens **Admin Dashboard** → **Scannables** → **Evidence**
3. Clicks **Edit** on "Evidence #1"
4. Updates content: "The killer was seen wearing blue jeans"
5. Clicks **Save** ✅
6. Evidence is now LIVE - any player scanning gets updated clue

**Player Experience**:
1. Player scans "Evidence #1" label
2. Sees clue: "The killer was seen wearing blue jeans"
3. Evidence auto-added to **Detective Notebook**
4. Player opens notebook → adds notes: "Sarah was wearing jeans tonight!"
5. Collects more evidence to build case

**Detective Notebook**:
```
🔍 Evidence #1
   "The killer was seen wearing blue jeans"
   📝 My Notes: "Sarah was wearing jeans tonight!"
   
🔍 Evidence #3
   "Witnesses heard arguing near the kitchen"
   📝 My Notes: "Sarah and John had fight earlier"
   
🔍 Evidence #7
   "Fingerprints found on wine glass"
   📝 My Notes: "Need to check who drank wine"
```

---

## 🖨️ Printing Strategies

### A4 Sheet Layout (3x4 Grid)

**Best For**: Cutting into individual cards, classroom activities, large QR codes

**Layout**:
```
┌─────────┬─────────┬─────────┐
│ Task #1 │ Task #2 │ Task #3 │
│  [QR]   │  [QR]   │  [QR]   │
├─────────┼─────────┼─────────┤
│ Task #4 │ Task #5 │ Task #6 │
│  [QR]   │  [QR]   │  [QR]   │
├─────────┼─────────┼─────────┤
│ Task #7 │ Task #8 │ Task #9 │
│  [QR]   │  [QR]   │  [QR]   │
├─────────┼─────────┼─────────┤
│Task #10 │Clue #1  │Evid. #1 │
│  [QR]   │  [QR]   │  [QR]   │
└─────────┴─────────┴─────────┘
```

**Print Settings**:
- Paper: A4 (210mm × 297mm)
- Margins: 10mm all sides
- Background Graphics: ✅ Enabled
- Scale: 100%

---

### Label Printer Layout (62mm)

**Best For**: Brother P-Touch, Dymo label makers, sticker paper

**Layout** (single column, 62mm width):
```
┌──────────────────────────┐
│      Evidence #1         │
│                          │
│       [QR CODE]          │
│       50mm × 50mm        │
│                          │
│        [Badge]           │
└──────────────────────────┘
       62mm width
```

**Compatible Printers**:
- Brother P-Touch Cube Plus (PT-P710BT)
- Dymo LabelWriter 450 Turbo
- Generic thermal label printers (62mm tape)

**Print Settings**:
- Label Width: 62mm
- Cut After Each Label: Yes
- High Quality Mode: Yes

---

## 🎯 Advanced Features

### Solution Codes (Locked Clues)

Add passcode protection to any scannable:

```typescript
// Create locked treasure hunt node
await createScannable({
  eventId: 'party-1',
  type: 'TREASURE_NODE',
  label: 'Secret Clue',
  content: 'The treasure is buried under the oak tree',
  solutionCode: 'TREE42', // Player must enter this
  chainId: 'hunt-1',
  chainOrder: 2,
});
```

**Player Experience**:
1. Scans QR code
2. Sees "Password Protected" screen
3. Must enter `TREE42` to unlock content
4. Gets access to clue

**Use Cases**:
- Riddles where answer is the password
- Team coordination (one player finds code, another scans QR)
- Delayed reveals (give password at specific time)

---

### Progress Tracking

Check treasure hunt completion:

```typescript
const progress = await getTreasureChainProgress(
  userId: 'player-1',
  sessionId: 'party-1',
  chainId: 'treasure-hunt-1'
);

// Returns:
{
  success: true,
  completedSteps: [
    { order: 1, label: "Clue #1", scannedAt: "2024-01-15T14:30:00Z" },
    { order: 2, label: "Clue #2", scannedAt: "2024-01-15T14:45:00Z" }
  ]
}
```

**Display Progress Bar**:
```jsx
const totalSteps = 5;
const completed = progress.completedSteps.length;
const percentage = (completed / totalSteps) * 100;

<ProgressBar value={percentage} />
<p>{completed} of {totalSteps} clues found</p>
```

---

### Live Analytics

Track scans in real-time:

```typescript
// Get all scans for an event
const scans = await db
  .select()
  .from(scannableScans)
  .innerJoin(scannables, eq(scannableScans.scannableId, scannables.id))
  .where(eq(scannables.eventId, 'party-1'))
  .orderBy(desc(scannableScans.scannedAt));

// Who's winning the treasure hunt?
const leaderboard = scans
  .filter(scan => scan.scannables.type === 'TREASURE_NODE')
  .reduce((acc, scan) => {
    acc[scan.scannable_scans.userId] = (acc[scan.scannable_scans.userId] || 0) + 1;
    return acc;
  }, {});
```

---

## 🔧 Server Actions Reference

### Create Scannable

```typescript
const result = await createScannable({
  eventId: 'party-1',
  type: 'TASK', // or 'TREASURE_NODE' or 'KILLER_EVIDENCE'
  label: 'Task #1',
  content: 'Complete the challenge',
  rewardPoints: 10, // optional
  solutionCode: 'SECRET', // optional
  chainId: 'hunt-1', // optional (treasure hunts only)
  chainOrder: 1, // optional (treasure hunts only)
});

// Returns: { success: true, scannableId: UUID, qrCodeData: base64PNG }
```

### Update Content (Live Editing)

```typescript
const result = await updateScannableContent(
  scannableId: '123e4567-e89b-12d3-a456-426614174000',
  content: 'New clue: The killer wore a red hat'
);

// Immediately affects all future scans
```

### Scan Scannable

```typescript
const result = await scanScannable({
  scannableId: '123e4567-e89b-12d3-a456-426614174000',
  userId: 'player-1',
  sessionId: 'party-1',
});

// Returns:
{
  success: true,
  scannable: { id, type, label, content, ... },
  isCorrectOrder: true, // false if treasure hunt step out of order
}
```

### Add to Detective Notebook

```typescript
const result = await addToDetectiveNotebook({
  userId: 'player-1',
  sessionId: 'party-1',
  evidenceId: '123e4567-e89b-12d3-a456-426614174000',
  notes: 'This seems suspicious...' // optional
});
```

### Get Detective Notebook

```typescript
const result = await getDetectiveNotebook(
  userId: 'player-1',
  sessionId: 'party-1'
);

// Returns:
{
  success: true,
  notebook: [
    {
      id: 1,
      evidence: { id, label, content },
      notes: 'My detective notes',
      collectedAt: '2024-01-15T14:30:00Z'
    },
    ...
  ]
}
```

---

## 🚀 Quick Start Workflows

### Workflow 1: Simple Party Tasks (15 minutes)

1. **Create 5 tasks**:
   ```
   Task #1: Kitchen Challenge → 10 points
   Task #2: Living Room Riddle → 15 points
   Task #3: Backyard Hunt → 20 points
   Task #4: Basement Mystery → 25 points
   Task #5: Final Challenge → 50 points
   ```

2. **Print QR codes**:
   - Admin Dashboard → Scannables → Print tab
   - Select "A4 Sheet"
   - Click "Print Sheet"

3. **Hide around house**:
   - Place in obvious spots for easy mode
   - Hide cleverly for hard mode

4. **Players scan and compete**:
   - First to complete all 5 tasks wins
   - Track on leaderboard

---

### Workflow 2: Treasure Hunt (30 minutes)

1. **Plan the route**:
   ```
   Clue #1 (Kitchen) → Clue #2 (Library) → Clue #3 (Bedroom) → Prize!
   ```

2. **Create chain**:
   ```typescript
   // All use chain_id: "main-hunt"
   Step 1: "Look where books are kept" (order: 1)
   Step 2: "Check where you sleep" (order: 2)
   Step 3: "You found the treasure!" (order: 3)
   ```

3. **Print labels**:
   - Select "Label Printer (62mm)"
   - Print 3 labels

4. **Place strategically**:
   - Hide in reverse order (end first, start last)
   - Players must find in correct sequence

5. **Monitor progress**:
   - Watch dashboard for scan activity
   - See who's ahead in the race

---

### Workflow 3: Mystery Game with Live Editing (45 minutes)

**Before Party** (10 min):
1. Create 10 evidence scannables (all blank)
2. Print as labels
3. Stick around venue

**During Party** (35 min):
1. **Phase 1: Introduction** (5 min)
   - Explain murder mystery scenario
   - Tell players to collect evidence

2. **Phase 2: First Clues** (10 min)
   - Edit Evidence #1-3 with initial clues:
     ```
     #1: "Victim was found in the library"
     #2: "Time of death: 9:45 PM"
     #3: "Weapon: Candlestick"
     ```
   - Players start scanning and taking notes

3. **Phase 3: Suspect Reveals** (10 min)
   - Edit Evidence #4-6 with suspect info:
     ```
     #4: "Three suspects: Sarah, John, Emily"
     #5: "Sarah's alibi: Was in kitchen"
     #6: "John's alibi: Was on phone"
     ```

4. **Phase 4: Final Clues** (10 min)
   - Edit Evidence #7-10 with decisive clues:
     ```
     #7: "Emily has no alibi!"
     #8: "Emily was seen with candlestick"
     #9: "Emily had motive: inheritance"
     #10: "Case closed: Emily is the killer!"
     ```

5. **Winner**: First to correctly identify Emily wins!

---

## 🐛 Troubleshooting

### QR Code Won't Scan

**Symptom**: Phone camera doesn't recognize QR code

**Solutions**:
- Ensure QR code is at least 2cm × 2cm
- Check lighting (not too bright/dark)
- Clean printer (streaks cause scan failures)
- Regenerate QR code if corrupted
- Test with QR scanner app (not just camera)

---

### Treasure Hunt Order Not Working

**Symptom**: All clues unlock regardless of order

**Check**:
```typescript
// Verify chain_id is identical for all steps
SELECT id, label, chain_id, chain_order 
FROM scannables 
WHERE chain_id = 'treasure-hunt-1';

// Should show:
// Clue #1 | treasure-hunt-1 | 1
// Clue #2 | treasure-hunt-1 | 2  ← Same chain_id
// Clue #3 | treasure-hunt-1 | 3
```

**Fix**: Update chain_id to match:
```typescript
await db
  .update(scannables)
  .set({ chainId: 'treasure-hunt-1' })
  .where(eq(scannables.id, problematicId));
```

---

### Live Editing Not Updating

**Symptom**: Changed content in admin dashboard but players see old content

**Cause**: Browser cache

**Solutions**:
1. Add `updated_at` timestamp to scannable display
2. Force refresh: Add cache-busting query param
3. Tell players to refresh page after scan

**Code Fix**:
```typescript
// In ScannableViewer component
useEffect(() => {
  const interval = setInterval(() => {
    // Refetch scannable every 30 seconds
    handleScan();
  }, 30000);
  return () => clearInterval(interval);
}, []);
```

---

### Print Layout Broken

**Symptom**: QR codes overlap or cut off

**Check Print Settings**:
- ✅ Background Graphics: Enabled
- ✅ Margins: Default (not "None")
- ✅ Scale: 100% (not "Fit to page")
- ✅ Paper Size: A4 (not Letter)

**CSS Debug**:
```css
@media print {
  * {
    outline: 1px solid red; /* Visual debugging */
  }
}
```

---

## 📊 Database Queries

### Find All Active Scannables

```sql
SELECT * FROM scannables 
WHERE event_id = 'party-1' 
  AND is_active = true 
ORDER BY type, created_at;
```

### Treasure Hunt Completion Report

```sql
SELECT 
  u.name AS player,
  COUNT(DISTINCT ss.scannable_id) AS clues_found,
  MAX(ss.scanned_at) AS last_scan
FROM scannable_scans ss
JOIN scannables s ON ss.scannable_id = s.id
JOIN users u ON ss.user_id = u.id
WHERE s.chain_id = 'treasure-hunt-1'
  AND ss.is_correct_order = true
GROUP BY u.name
ORDER BY clues_found DESC, last_scan ASC;
```

### Evidence Collection Stats

```sql
SELECT 
  s.label,
  COUNT(DISTINCT dn.user_id) AS collectors,
  AVG(LENGTH(dn.notes)) AS avg_note_length
FROM detective_notebook dn
JOIN scannables s ON dn.evidence_id = s.id
WHERE s.type = 'KILLER_EVIDENCE'
  AND s.event_id = 'party-1'
GROUP BY s.label
ORDER BY collectors DESC;
```

---

## 🎨 UI Components Reference

### ScannableManager.tsx

Admin component for creating/editing scannables.

**Features**:
- Tab interface (Tasks / Treasure Hunt / Evidence)
- Inline content editing
- Active/inactive toggle
- QR code download
- Live preview

**Props**:
```typescript
interface ScannableManagerProps {
  eventId: string;
}
```

---

### ScannableViewer.tsx

Player-facing scan result page.

**Features**:
- Type-specific UI (Task/Hunt/Evidence)
- Solution code input
- Treasure hunt order validation
- Auto-add evidence to notebook
- Success animations

**URL Pattern**:
```
/game/scannable/[scannable_id]
```

---

### DetectiveNotebook.tsx

Evidence collection and note-taking.

**Features**:
- Chronological evidence list
- Inline note editing
- Rich text formatting
- Export to PDF (future)

**URL**:
```
/game/notebook
```

---

### PrintManager.tsx

Batch QR code printing interface.

**Features**:
- A4 grid layout (3×4)
- Label printer layout (62mm)
- Download all QR codes
- Print preview
- CSS @media print optimized

**Props**:
```typescript
interface PrintManagerProps {
  eventId: string;
}
```

---

## 🔐 Security Considerations

### QR Code Security

**Risk**: Anyone with QR code URL can scan

**Mitigations**:
1. Use UUIDs (not sequential IDs)
2. Add session validation
3. Implement rate limiting
4. Check `isActive` flag

**Example**:
```typescript
// In scanScannable()
if (!scannable.isActive) {
  return { success: false, error: 'Scannable disabled' };
}

// Rate limit: Max 10 scans per minute per user
const recentScans = await getRecentScans(userId, 60);
if (recentScans.length > 10) {
  return { success: false, error: 'Too many scans' };
}
```

---

### Live Editing Access Control

**Risk**: Non-admins editing evidence

**Solution**: PIN-protected admin dashboard

```typescript
// src/app/admin/dashboard/page.tsx
const ADMIN_PIN = process.env.ADMIN_PIN || '1234';

if (pin !== ADMIN_PIN) {
  return { error: 'Unauthorized' };
}
```

**Production**:
```bash
# .env.local
ADMIN_PIN=your-secure-pin-here
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

---

## 📈 Future Enhancements

### Planned Features

- [ ] Multi-language support
- [ ] Voice narration (TTS for clues)
- [ ] Photo upload evidence
- [ ] Team competition mode
- [ ] Realtime dashboard updates (WebSockets)
- [ ] Mobile app (React Native)
- [ ] AR treasure hunt overlays
- [ ] Export detective notebook to PDF
- [ ] Scannable templates library
- [ ] Analytics dashboard

---

## 💡 Creative Ideas

### Murder Mystery Party

Create blank evidence labels, print and hide, then:
- 7:00 PM: Enable Evidence #1-3 (crime scene)
- 7:30 PM: Enable Evidence #4-6 (suspects)
- 8:00 PM: Enable Evidence #7-9 (alibis)
- 8:30 PM: Enable Evidence #10 (killer reveal)

### Escape Room at Home

Chain 10 puzzles in sequence:
1. Scan QR in living room → riddle
2. Solve riddle → answer is password for QR in kitchen
3. Scan kitchen QR → math puzzle
4. Answer → password for bathroom QR
5. Continue until final escape code!

### Scavenger Hunt Birthday

Kids scan QR codes to collect points:
- Easy clues: 5 points (balloons, cake table)
- Medium clues: 10 points (hidden in books)
- Hard clues: 20 points (require teamwork)
- Bonus: Treasure chain unlocks prize closet!

### Educational Tour

Museum/zoo/park tour with scannable plaques:
- Scan animal exhibit → fun facts
- Scan historical marker → story
- Complete all → certificate of completion

---

## 📞 Support

For issues or questions:
- Check troubleshooting section above
- Review server action logs
- Test with simple task first
- Verify database migrations ran

**Common Gotchas**:
- Forgot to run migration? Run `drizzle/scannables-migration.sql`
- QR codes not generating? Check `qrcode` package installed
- Print layout broken? Enable background graphics
- Treasure hunt always unlocked? Verify `chain_id` matches
- Live editing not working? Check admin PIN auth

---

## 🎉 Summary

The Unified Scannables System provides:

✅ **Flexibility** - One system, three use cases (tasks, hunts, evidence)
✅ **Live Editing** - Update content during party
✅ **Order Validation** - Automatic treasure hunt step checking
✅ **Batch Printing** - A4 sheets and label maker support
✅ **Player Engagement** - Detective notebook with notes
✅ **Admin Control** - PIN-protected dashboard
✅ **Scalability** - Unlimited scannables per event

**Start using today**: `npm run dev` → http://localhost:3000/admin/dashboard

Happy scanning! 🎊
