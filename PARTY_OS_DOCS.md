# 🎮 Party OS - Complete Technical Documentation

## System Architecture

### Tech Stack
- **Framework:** Next.js 16 (App Router, Server Actions)
- **Database:** Neon (Serverless PostgreSQL)
- **ORM:** Drizzle ORM
- **Real-Time:** Pusher Channels (pusher-js client, pusher server)
- **AI:** Vercel AI SDK with Google Gemini Provider
- **UI:** Tailwind CSS + Shadcn/UI + Framer Motion
- **Authentication:** Cookie-based with 4-digit PINs

### Database Schema (Module 7)

#### party_users
Guest management with wallet system.

```typescript
{
  id: uuid (PK)
  name: text
  pin_code: integer (unique, 4-digit)
  avatar_url: text?
  wallet_balance: integer (default 1000)
  created_at: timestamp
}
```

#### party_games
Game sessions for different game types.

```typescript
{
  id: uuid (PK)
  title: text
  type: 'SIM_RACE' | 'IMPOSTER' | 'DOMINOES' | 'OTHER'
  status: 'OPEN' | 'LOCKED' | 'FINISHED'
  description: text?
  start_time: timestamp?
  end_time: timestamp?
  created_at: timestamp
}
```

#### sim_race_entries
Leaderboard entries for sim racing.

```typescript
{
  id: uuid (PK)
  game_id: uuid (FK → party_games)
  user_id: uuid (FK → party_users)
  lap_time_ms: integer? (null if DNF)
  car_model: text?
  track: text?
  is_dnf: boolean
  submitted_at: timestamp
}
```

#### bets
Betting system with payouts.

```typescript
{
  id: uuid (PK)
  game_id: uuid (FK → party_games)
  bettor_id: uuid (FK → party_users)
  target_user_id: uuid (FK → party_users)
  amount: integer
  status: 'PENDING' | 'WON' | 'LOST'
  payout: integer?
  created_at: timestamp
  settled_at: timestamp?
}
```

#### party_imposter_rounds
Imposter game state with AI-generated words.

```typescript
{
  id: uuid (PK)
  game_id: uuid (FK → party_games)
  status: 'ACTIVE' | 'VOTING' | 'REVEALED'
  imposter_id: uuid (FK → party_users)
  secret_word: text (civilians see this)
  imposter_hint: text (imposter sees this)
  round: integer
  created_at: timestamp
}
```

#### party_events
Event log for debugging and history.

```typescript
{
  id: serial (PK)
  event_type: varchar(50)
  channel: text (Pusher channel name)
  data: jsonb (event payload)
  triggered_by: uuid? (FK → party_users)
  created_at: timestamp
}
```

### Indexes
Performance optimizations:
- `idx_sim_race_entries_game` on game_id
- `idx_sim_race_entries_user` on user_id
- `idx_sim_race_entries_lap_time` on lap_time_ms (for sorting)
- `idx_bets_game`, `idx_bets_bettor`, `idx_bets_target`
- `idx_party_events_type`, `idx_party_events_created`

## Server Actions

All in `src/app/actions/party-logic.ts`.

### Authentication

#### joinPartyAction(name: string)
Creates a new party user with random PIN.

**Flow:**
1. Generate 4-digit PIN (1000-9999)
2. Insert into party_users
3. Set cookie: party_user_id
4. Trigger Pusher: party-lobby/user-joined
5. Return user + PIN

#### loginWithPinAction(pinCode: number)
Login with existing PIN.

**Flow:**
1. Query party_users WHERE pin_code = ?
2. If found, set cookie
3. Return user

#### getCurrentPartyUserAction()
Get current logged-in user from cookie.

### Sim Racing

#### submitLapTimeAction(timeString, carModel?, track?)
Parse and submit lap time.

**Time Parser:**
```typescript
// "1:24.500" → 84500 ms
// "84.5" → 84500 ms
const parts = timeString.split(':');
if (parts.length === 2) {
  const minutes = parseInt(parts[0]);
  const seconds = parseFloat(parts[1]);
  totalMs = (minutes * 60 * 1000) + (seconds * 1000);
}
```

**Flow:**
1. Parse time string
2. Get or create active SIM_RACE game
3. Upsert sim_race_entries (update if faster)
4. Trigger Pusher: sim-racing/leaderboard-update
5. Return success

#### getSimRacingLeaderboardAction(gameId?)
Get sorted leaderboard with user info.

**Query:**
```sql
SELECT 
  entries.*,
  users.name,
  users.avatar_url
FROM sim_race_entries entries
JOIN party_users users ON entries.user_id = users.id
WHERE entries.game_id = ?
ORDER BY entries.lap_time_ms ASC
```

### Betting

#### placeBetAction(targetUserId, amount)
Place bet on a racer.

**Flow (Transactional):**
1. Check wallet_balance >= amount
2. BEGIN TRANSACTION
3. UPDATE party_users SET wallet_balance = wallet_balance - amount
4. INSERT INTO bets
5. COMMIT
6. Trigger Pusher: betting/bet-placed
7. Return success

#### settleBetsAction(gameId)
Admin: Settle all bets for a game.

**Flow:**
1. Get winner (first place by lap_time_ms)
2. For each bet:
   - If target = winner: status = WON, payout = amount * 2, add to wallet
   - Else: status = LOST
3. Update party_games.status = FINISHED
4. Trigger Pusher: betting/bets-settled

#### getUserBetsAction()
Get current user's bet history.

### Imposter Game

#### startImposterRoundAction()
Admin: Start new imposter round with AI.

**Flow:**
1. Get all party_users (min 3)
2. Select random imposter
3. Call Google Gemini API:
```typescript
const { text } = await generateText({
  model: google('gemini-1.5-flash'),
  prompt: 'Generate JSON with civilian_word and imposter_hint...'
});
```
4. Parse AI response
5. Insert party_imposter_rounds
6. Trigger Pusher: imposter-game/round-started
7. Return round + player count

#### getActiveImposterRoundAction()
Get current round with role-specific data.

**Logic:**
```typescript
if (round.imposter_id === currentUserId) {
  return { isImposter: true, word: round.imposter_hint };
} else {
  return { isImposter: false, word: round.secret_word };
}
```

## Pusher Integration

### Server (`src/lib/pusher/server.ts`)

```typescript
export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: 'us2',
  useTLS: true,
});

export async function triggerPartyEvent(
  channel: string,
  event: string,
  data: any,
  triggeredBy?: string
) {
  // Trigger Pusher
  await pusherServer.trigger(channel, event, data);
  
  // Log to database
  await db.insert(partyEvents).values({
    eventType: event,
    channel,
    data,
    triggeredBy,
  });
}
```

### Client (`src/lib/pusher/client.ts`)

```typescript
export function getPusherClient() {
  return new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
  });
}
```

### Channels & Events

| Channel | Event | Payload | Triggered By |
|---------|-------|---------|--------------|
| `party-lobby` | `user-joined` | `{userId, name, timestamp}` | joinPartyAction |
| `sim-racing` | `leaderboard-update` | `{userId, userName, lapTimeMs, timestamp}` | submitLapTimeAction |
| `betting` | `bet-placed` | `{bettorId, bettorName, targetId, targetName, amount, timestamp}` | placeBetAction |
| `betting` | `bets-settled` | `{gameId, winnerId, timestamp}` | settleBetsAction |
| `imposter-game` | `round-started` | `{roundId, playerCount, timestamp}` | startImposterRoundAction |

## React Hooks

### usePartySocket(channelName: string)

Real-time hook with Pusher integration.

```typescript
const { lastEvent, bind, unbind, isConnected } = usePartySocket('sim-racing');

useEffect(() => {
  bind('leaderboard-update', (data) => {
    console.log('New lap time:', data);
    refreshLeaderboard();
  });
}, []);
```

**Features:**
- Auto-subscribe on mount
- Auto-unsubscribe on unmount
- Connection status tracking
- Event binding helpers

## UI Components

### SimLeaderboard

**Location:** `src/components/party/SimLeaderboard.tsx`

**Features:**
- Framer Motion animations for rank changes
- Gold/Silver/Bronze styling for top 3
- Real-time updates via Pusher
- Lap time formatting (1:24.50)
- Car model and track display
- DNF support

**Props:**
```typescript
{ gameId?: string }
```

### BettingSlip

**Location:** `src/components/party/BettingSlip.tsx`

**Features:**
- Grid of racer avatars
- One-click betting (100 coins)
- Wallet balance display
- Bet history with status badges
- Real-time bet notifications

**Props:**
```typescript
{ currentUser: PartyUser }
```

### ImposterCard

**Location:** `src/components/party/ImposterCard.tsx`

**Features:**
- Role-based styling (red for imposter, green for civilian)
- Tap-to-reveal mechanism
- Flip animation
- Different instructions per role
- Real-time round updates

**Props:** None (fetches current user internally)

## Pages

### /party/join

Guest onboarding page.

**Tabs:**
1. **New Guest:** Name input → Generate PIN
2. **Returning:** PIN input → Login

**Flow:**
1. Enter name/PIN
2. Call joinPartyAction or loginWithPinAction
3. Set cookie
4. Redirect to /party/dashboard

### /party/dashboard

Main guest interface.

**Tabs:**
1. **Racing:** SimLeaderboard component
2. **Imposter:** ImposterCard + rules
3. **Betting:** BettingSlip + bet history

**Header:**
- User avatar
- Name + PIN display
- Wallet balance (large, prominent)

### /admin/race-control

Admin command center.

**Sections:**
1. **Sim Racing Control:**
   - Lap time input (1:24.500)
   - Car model input
   - Track input
   - Submit button → submitLapTimeAction
   - Settle Bets button → settleBetsAction

2. **Imposter Game Control:**
   - Start Round button → startImposterRoundAction
   - Shows player count

3. **Instructions:**
   - Step-by-step for each game type

## Real-Time Flow Examples

### Lap Time Submission

```
1. Admin enters "1:24.500" at /admin/race-control
2. submitLapTimeAction() called
3. Server: Parse → 84500ms
4. Server: Upsert sim_race_entries
5. Server: pusherServer.trigger('sim-racing', 'leaderboard-update', {...})
6. All guests: usePartySocket receives event
7. All guests: getSimRacingLeaderboardAction() called
8. All guests: SimLeaderboard re-renders with new order
9. Framer Motion: Animate rows to new positions
```

### Betting & Settlement

```
BETTING:
1. Guest taps "Bet 100" on User A
2. placeBetAction(userA, 100)
3. Server: wallet_balance -= 100
4. Server: INSERT bet PENDING
5. Server: pusher.trigger('betting', 'bet-placed', {...})
6. All guests: Toast notification "X bet 100 on Y"

SETTLEMENT (After Race):
1. Admin clicks "Settle Bets"
2. settleBetsAction(gameId)
3. Server: Find winner (lowest lap_time_ms)
4. Server: For each bet:
   - If target = winner: status = WON, payout = 200, wallet += 200
   - Else: status = LOST
5. Server: pusher.trigger('betting', 'bets-settled', {...})
6. Winners: Toast "You won 200 coins!"
```

### Imposter Round

```
1. Admin clicks "Start New Imposter Round"
2. startImposterRoundAction()
3. Server: Get all users
4. Server: Random select imposter
5. Server: Call Google AI:
   {
     "civilian_word": "SpaceX",
     "imposter_hint": "Rocket Company"
   }
6. Server: INSERT party_imposter_rounds
7. Server: pusher.trigger('imposter-game', 'round-started', {...})
8. All guests: ImposterCard receives event
9. All guests: getActiveImposterRoundAction()
10. Each guest:
    - If imposter: Red card with "Rocket Company"
    - Else: Green card with "SpaceX"
11. Guests tap to reveal
12. Discussion begins!
```

## Performance Optimizations

1. **Database Indexes:** Fast queries on frequently accessed columns
2. **Pusher Throttling:** Only trigger events on actual state changes
3. **React Memoization:** Components re-render only when data changes
4. **Server Actions:** Direct DB access, no API round-trips
5. **Upsert Logic:** Avoids duplicate entries for lap times

## Security Considerations

### Current Implementation
- Cookie-based authentication
- 4-digit PINs (for party use only)
- No admin authentication
- Server actions validate current user

### Production Recommendations
1. Add admin password to `/admin/race-control`
2. Implement proper session management
3. Rate limit server actions
4. Add CSRF protection
5. Use longer PINs or proper OAuth

## Deployment Checklist

### Before Party (Test Phase)
- [ ] Set all environment variables
- [ ] Run migration: `npx tsx scripts/migrate-party-os.ts`
- [ ] Test join flow on mobile device
- [ ] Test lap time submission
- [ ] Verify Pusher events fire
- [ ] Test bet placement and settlement
- [ ] Test imposter round with AI

### Party Day
- [ ] Start server 30 min early
- [ ] Share `/party/join` URL (QR code recommended)
- [ ] Keep `/admin/race-control` open on laptop
- [ ] Monitor Pusher dashboard for connection issues
- [ ] Have backup plan (manual scoreboard) if tech fails

### Post-Party
- [ ] Export leaderboard for memories
- [ ] Clear party_users if reusing for next party
- [ ] Review party_events for interesting stats

## Troubleshooting Guide

### Issue: "Missing Pusher environment variables"
**Solution:** Check `.env.local` has all 4 Pusher keys, restart server

### Issue: Leaderboard not updating in real-time
**Solution:** 
1. Check Pusher dashboard for connection status
2. Verify `NEXT_PUBLIC_PUSHER_KEY` is set
3. Open browser console, look for Pusher connection logs

### Issue: "Failed to start imposter round"
**Solution:**
1. Verify `GOOGLE_GENERATIVE_AI_API_KEY` is set
2. Test key at https://aistudio.google.com/
3. Check API quota hasn't been exceeded

### Issue: Bets not settling correctly
**Solution:**
1. Ensure at least one lap time exists
2. Check console for error messages
3. Verify `settleBetsAction` received correct gameId

### Issue: Users getting logged out
**Solution:**
1. Check cookie settings (secure, httpOnly, sameSite)
2. Verify browser allows cookies
3. Check cookie expiration (default: 7 days)

## Future Enhancements

### High Priority
- [ ] Voting system for imposter game
- [ ] Custom bet amounts (not just 100)
- [ ] Photo upload for avatars
- [ ] Admin authentication

### Medium Priority
- [ ] Multiple simultaneous races
- [ ] Tournament bracket mode
- [ ] Dominoes game integration
- [ ] Spectator mode (view-only)

### Low Priority
- [ ] Replay system for races
- [ ] Stats export (JSON/CSV)
- [ ] Custom themes per party
- [ ] Social sharing (Twitter/Discord)

## File Structure

```
src/
├── app/
│   ├── actions/
│   │   └── party-logic.ts          # All server actions
│   ├── admin/
│   │   └── race-control/
│   │       └── page.tsx            # Admin panel
│   └── party/
│       ├── join/
│       │   └── page.tsx            # Guest onboarding
│       └── dashboard/
│           ├── page.tsx            # Server component
│           └── client.tsx          # Client component
├── components/
│   └── party/
│       ├── SimLeaderboard.tsx      # Racing leaderboard
│       ├── BettingSlip.tsx         # Betting interface
│       └── ImposterCard.tsx        # Imposter game card
├── hooks/
│   └── use-party-socket.ts         # Pusher hook
└── lib/
    ├── db/
    │   └── schema.ts               # Database schema (Module 7)
    └── pusher/
        ├── server.ts               # Server-side Pusher
        └── client.ts               # Client-side Pusher

drizzle/
└── party-os-migration.sql          # Migration SQL

scripts/
└── migrate-party-os.ts             # Migration script
```

## API Reference

### Server Actions

```typescript
// Auth
joinPartyAction(name: string): Promise<Result>
loginWithPinAction(pinCode: number): Promise<Result>
getCurrentPartyUserAction(): Promise<PartyUser | null>

// Racing
submitLapTimeAction(timeString: string, carModel?: string, track?: string): Promise<Result>
getSimRacingLeaderboardAction(gameId?: string): Promise<Result>

// Betting
placeBetAction(targetUserId: string, amount: number): Promise<Result>
settleBetsAction(gameId: string): Promise<Result>
getUserBetsAction(): Promise<Result>

// Imposter
startImposterRoundAction(): Promise<Result>
getActiveImposterRoundAction(): Promise<Result>

// Users
getAllPartyUsersAction(): Promise<Result>
```

### Types

```typescript
type Result = {
  success: boolean;
  error?: string;
  [key: string]: any;
};

type PartyUser = {
  id: string;
  name: string;
  pinCode: number;
  avatarUrl: string | null;
  walletBalance: number;
  createdAt: Date;
};
```

---

**Version:** 1.0.0  
**Last Updated:** February 2026  
**Maintainer:** Party OS Team  
**License:** MIT
