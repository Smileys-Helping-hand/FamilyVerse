# Party OS "Brain" Implementation Summary

## ✅ Complete Implementation

All core game systems have been implemented for the Party OS. This creates the full loop for tasks, kills, betting, and economy.

---

## 🎯 Feature 1: Among Us Task Engine

### Database Tables Created
- **`party_tasks`**: Master list of available tasks
  - `id`, `description`, `points_reward`, `verification_type`, `qr_code`, `is_active`
- **`player_tasks`**: Individual task assignments
  - `id`, `user_id`, `task_id`, `is_completed`, `completed_at`, `proof_url`

### Server Actions
- **`assignTasksToPlayer(userId)`**: Randomly assigns 3 tasks to a player
- **`getPlayerTasksAction(userId)`**: Fetches player's task list with completion status
- **`completeTaskAction(userId, playerTaskId, proof)`**:
  - ✅ Validates user is CREWMATE (Imposters can't earn task points)
  - ✅ Adds `points_reward` to wallet transactionally
  - ✅ Calculates completion rate (completed/total)
  - ✅ Triggers `task-progress-update` Pusher event for TV
  - ✅ Triggers `crew-victory` event if 100% completion

### UI Component
**`TaskChecklist`** (`src/components/party/TaskChecklist.tsx`):
- Shows 3 assigned tasks per player
- Displays progress bar (X/3 completed)
- Animated +Points floating effect when completed
- Strike-through styling for completed tasks
- Icons for verification type (📷 PHOTO, 📱 QR_SCAN, ⚡ BUTTON)

### Default Tasks Seeded
1. Selfie with the Birthday Boy (100 points)
2. Find the Ace of Spades (75 points)
3. Win Rock-Paper-Scissors (50 points)
4. Scan QR Code on Fridge (50 points)
5. Do 10 Push-ups (50 points)
6. Make someone laugh (50 points)

---

## 💀 Feature 2: Imposter Kill System

### Database Tables Created
- **`player_status`**: Tracks ALIVE/GHOST/SPECTATOR status
  - `user_id`, `status`, `role` (CREWMATE/IMPOSTER), `killed_at`, `killed_by`
- **`kill_cooldowns`**: Enforces 30s cooldown between kills
  - `imposter_id`, `last_kill_at`, `cooldown_seconds`

### Server Actions
- **`initializePlayerStatus(userId, role)`**: Sets player as CREWMATE or IMPOSTER
- **`getAlivePlayersAction()`**: Returns all players with `status='ALIVE'`
- **`killPlayerAction(imposterId, targetId)`**:
  - ✅ Verifies imposter role
  - ✅ Checks 30s kill cooldown
  - ✅ Updates target status to GHOST
  - ✅ Triggers `you-are-dead` event to **target's phone ONLY** (user-specific channel)
  - ✅ Broadcasts `player-eliminated` to all other players
  - ✅ Updates kill cooldown timer
- **`reportBodyAction(reporterId)`**: Triggers emergency meeting
  - Broadcasts `emergency-meeting` event to all players

### UI Components
**`KillMenu`** (`src/components/party/KillMenu.tsx`):
- Shows list of all alive players (excludes imposter)
- Displays kill cooldown timer
- Confirmation dialog before kill
- Disabled during cooldown period

**`DeathOverlay`** (`src/components/party/DeathOverlay.tsx`):
- Full-screen RED "YOU ARE DEAD" overlay (5 seconds)
- Animated skull icon
- Ghost Rules card:
  - 🤫 Cannot speak about the game
  - 🍕 Can eat snacks and watch
  - 👻 Can roam "Graveyard" zone
  - 📱 Keep phone to spectate
- Persistent "You are a GHOST" badge after overlay

---

## 🏁 Feature 3: Enhanced Race Betting Calculator

### Updated Server Action
**`settleRaceAction(gameId, winnerId)`**:
- ✅ Uses 2.0x multiplier for winners
- ✅ Finds all `PENDING` bets for the race
- ✅ Transactionally processes all payouts:
  - Winners: Add `(bet_amount * 2.0)` to wallet, mark bet as `WON`
  - Losers: Mark bet as `LOST` (amount already deducted at bet time)
- ✅ Triggers `payout-celebration` event to each winner's phone (with "CHA-CHING!" sound)
- ✅ Broadcasts `race-settled` event to all players

### Race Manager Flow (Admin Control Panel)
1. **Grid Setup**: Select 3 drivers
2. **Open Market**: Lock drivers, clear old bets, broadcast `BETS_OPEN`
3. **Start Engine**: Broadcast `RACE_LOCKED` (no more bets)
4. **Result Entry**: Select winner (P1), P2, P3
5. **Settle**: Run `settleRaceAction` to distribute payouts

---

## 💰 Feature 4: Welfare/Stimulus System

### Server Action
**`checkAndGrantStimulus(userId)`**:
- ✅ Checks if `wallet_balance < 50`
- ✅ Auto-grants 200 coins
- ✅ Triggers `stimulus-check` event with message:
  > "Don't give up! Here is a bailout."
- Can be called automatically after any transaction or on dashboard load

### Integration Points
- Call after bet placement
- Call after race settlement (if balance drops)
- Call on dashboard mount
- Prevents players from quitting due to bankruptcy

---

## 📊 Database Migration Status

**Migration File**: `drizzle/party-task-system-migration.sql`

**Tables Created**:
- ✅ `party_tasks`
- ✅ `player_tasks`
- ✅ `player_status`
- ✅ `kill_cooldowns`

**Indexes Created**:
- ✅ `idx_player_tasks_user_id`
- ✅ `idx_player_tasks_task_id`
- ✅ `idx_player_tasks_completed`
- ✅ `idx_player_status_user_id`
- ✅ `idx_player_status_status`

**Migration Executed**: ✅ Successfully run

---

## 🎮 How to Use (Host Guide)

### Starting an Among Us Round
1. Go to `/admin/control` → "Imposter" tab
2. Click "Start New Round" (assigns secret word)
3. One player is secretly chosen as IMPOSTER
4. Crewmates see the secret word, Imposter sees a hint
5. IMPOSTER gets access to `KillMenu` component
6. Crewmates complete tasks to earn points

### Managing the Game
- **Tasks**: Automatically assigned when player joins (3 random tasks)
- **Kills**: Imposter uses `KillMenu` to eliminate players (30s cooldown)
- **Report Body**: Any player can trigger emergency meeting
- **Victory Conditions**:
  - Crew Wins: 100% of tasks completed
  - Imposter Wins: Eliminate enough players (manual host decision)

### Race Betting Flow
1. Admin: "Open Market" → Shout "Betting is OPEN! 60 seconds!"
2. Guests place bets on their phones
3. Admin: "Start Engine" → Race begins IRL
4. Admin: Enter winner in control panel
5. Admin: Click "Settle Race" → Winners get 2x payout + celebration

### Economy Management
- Players start with 1000 coins
- Task completion: +50-100 coins
- Betting wins: 2.0x multiplier
- Auto-stimulus: +200 coins when balance < 50
- Host can grant emergency funds via "Wallet Control" tab

---

## 🎯 Key Pusher Events

| Event | Channel | Triggered When |
|-------|---------|---------------|
| `task-progress-update` | `party-lobby` | Task completed |
| `crew-victory` | `party-lobby` | 100% tasks done |
| `you-are-dead` | `party-user-{id}` | Player killed |
| `player-eliminated` | `party-lobby` | Someone died |
| `emergency-meeting` | `party-lobby` | Body reported |
| `payout-celebration` | `party-user-{id}` | Bet won |
| `race-settled` | `party-lobby` | Race finished |
| `stimulus-check` | `party-user-{id}` | Bailout granted |

---

## 🚀 Next Steps for You

1. **Test Task System**:
   - Join as player → Check `/party/dashboard` for `TaskChecklist`
   - Complete a task → Verify +Points animation
   - Check TV Mode → Confirm progress bar updates

2. **Test Kill System**:
   - Assign IMPOSTER role to a test user
   - Open `/party/dashboard` as imposter → See `KillMenu`
   - Kill a player → Verify death overlay appears on their phone
   - Check 30s cooldown enforcement

3. **Test Race Betting**:
   - Place bets on different drivers
   - Settle race with winner
   - Verify 2x payout and celebration sound

4. **Test Stimulus**:
   - Lose bets until balance < 50
   - Verify auto +200 coins bailout notification

---

## 📁 Files Created/Modified

### New Files
- `src/components/party/TaskChecklist.tsx`
- `src/components/party/KillMenu.tsx`
- `src/components/party/DeathOverlay.tsx`
- `drizzle/party-task-system-migration.sql`

### Modified Files
- `src/lib/db/schema.ts` (added 4 new tables)
- `src/app/actions/party-logic.ts` (added 10+ new actions)

---

## 💡 Party Tips

### The "Ghost" Rule
> "If your phone turns RED and says DEAD, you are a Ghost. You can eat snacks, but you cannot talk about the game."

### Task Ideas to Add Later
- "Selfie with every guest"
- "Find the hidden treasure"
- "Beat the host at a mini-game"
- "Perform a 30-second dance"

### Race Hype Strategy
When you hit "Open Market":
> "BETTING IS OPEN! 60 SECONDS TO PLACE YOUR BETS! WHO'S GOING TO WIN?!"

This builds massive energy in the room! 🎉
