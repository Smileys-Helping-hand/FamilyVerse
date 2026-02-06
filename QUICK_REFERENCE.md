# 🚀 Party Companion - Quick Reference

## 📋 Checklist

- [x] Neon PostgreSQL connected
- [x] Dependencies installed (`@google/generative-ai`, `framer-motion`)
- [ ] Add `GEMINI_API_KEY` to `.env.local`
- [ ] Run database migration
- [ ] Test with `npm run dev`

---

## ⚡ Quick Commands

```powershell
# Install dependencies
npm install

# Run development server
npm run dev

# Apply database migration (manual)
psql 'postgresql://neondb_owner:npg_lCB8qhoisV0p@ep-lucky-surf-abwawn5t-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require' -f drizzle/party-companion-migration.sql

# Type check
npm run typecheck
```

---

## 🎯 4 Modules at a Glance

### 1. 🧠 Party Brain
**Purpose**: AI generates event schedules  
**Action**: `generateEventPlan(params)`  
**Use**: Plan activities based on assets

### 2. 🏆 Leaderboard
**Purpose**: Live rankings & MVP  
**Component**: `<LiveLeaderboard />`  
**SQL**: Window functions with `RANK() OVER`

### 3. 🎭 Imposter Game
**Purpose**: Social deduction game  
**Component**: `<ImposterDashboard />`  
**Flow**: LOBBY → ACTIVE → VOTE → ENDED

### 4. 🧾 Expenses
**Purpose**: Receipt OCR & splitting  
**Component**: `<ExpenseScanner />`  
**AI**: Gemini Vision extracts items

---

## 📁 Key Files

```
src/app/actions/
├── party-brain.ts      # AI planning
├── leaderboard.ts      # Rankings
├── imposter-game.ts    # Game logic
└── expenses.ts         # Receipt processing

src/components/party/
├── LiveLeaderboard.tsx
├── PartyMVPLeaderboard.tsx
├── ImposterDashboard.tsx
├── ExpenseScanner.tsx
└── PartyHub.tsx        # All-in-one dashboard

drizzle/
└── party-companion-migration.sql  # Database schema
```

---

## 🗄️ Database Tables

**New Tables (10)**:
- `user_assets`, `preferences`, `event_plans`
- `games`, `game_scores`
- `game_sessions`, `game_players`, `game_votes`
- `expenses`, `expense_splits`

**Existing (3)**: `groups`, `checklist_items`, `recommendations`

---

## 🎨 Components Usage

```tsx
// Main Dashboard
import PartyHub from '@/components/party/PartyHub';
<PartyHub eventId={1} userId="abc" isHost={true} />

// Leaderboard
import { LiveLeaderboard } from '@/components/party/LiveLeaderboard';
<LiveLeaderboard 
  gameId={1} 
  eventId={1} 
  gameName="Sim Racing" 
  scoringType="TIME_ASC" 
/>

// Expense Scanner
import { ExpenseScanner } from '@/components/party/ExpenseScanner';
<ExpenseScanner 
  eventId={1} 
  payerId="user1" 
  availableFriends={friends} 
/>
```

---

## 🔑 Environment Variables

```env
# Required
DATABASE_URL=postgresql://...  # ✅ Set
GEMINI_API_KEY=...            # ⚠️ Add this!

# Optional (Firebase)
NEXT_PUBLIC_FIREBASE_API_KEY=...
# ... rest of Firebase config
```

Get Gemini key: https://ai.google.dev/

---

## 🧪 Quick Test

```typescript
// Test 1: Database
import { db } from '@/lib/db';
import { games } from '@/lib/db/schema';
const allGames = await db.select().from(games);

// Test 2: AI Planning
import { generateEventPlan } from '@/app/actions/party-brain';
const plan = await generateEventPlan({
  eventId: 1,
  hostId: 'user1',
  eventType: 'Birthday',
  duration: 4,
  attendees: 8
});

// Test 3: Submit Score
import { submitGameScore } from '@/app/actions/leaderboard';
await submitGameScore({
  gameId: 1,
  userId: 'user1',
  eventId: 1,
  scoreValue: 125340 // milliseconds
});
```

---

## 📊 Scoring Types

| Type | Meaning | Example | Best Score |
|------|---------|---------|------------|
| `TIME_ASC` | Racing | 125340ms | Lowest (fastest) |
| `SCORE_DESC` | Points | 9850pts | Highest |

---

## 🎯 Meta Points System

```
🥇 1st Place: 10 points
🥈 2nd Place: 5 points
🥉 3rd Place: 3 points
👤 Participation: 1 point
```

---

## 🐛 Troubleshooting

**Can't connect to DB?**
→ Check `.env.local` has correct `DATABASE_URL`

**Gemini errors?**
→ Add `GEMINI_API_KEY` to `.env.local`

**Type errors?**
→ Run `npm run typecheck`

**Module not found?**
→ Run `npm install`

---

## 📚 Documentation

1. **Quick Start**: `INSTALLATION_GUIDE.md`
2. **Full API**: `PARTY_COMPANION_README.md`
3. **Summary**: `IMPLEMENTATION_SUMMARY.md`
4. **Types**: `src/types/party-companion.ts`

---

## ✅ Production Checklist

- [ ] Database migrated
- [ ] Gemini API key added
- [ ] All dependencies installed
- [ ] TypeScript compiles (`npm run typecheck`)
- [ ] Dev server runs (`npm run dev`)
- [ ] Test each module works

---

## 🚀 Deploy to Production

1. Set environment variables
2. Build: `npm run build`
3. Deploy to Vercel/Netlify
4. Database already on Neon (serverless)

---

## 💡 Pro Tips

- **Refresh Intervals**: Configurable on each component
- **Animations**: All use Framer Motion (can disable)
- **Types**: Import from `@/types/party-companion`
- **Server Actions**: Secure by default (CSRF protected)

---

## 🎉 You're Ready!

```powershell
npm run dev
```

Visit: http://localhost:9002

Check the components in:
`src/components/party/PartyHub.tsx`

---

**Built with ❤️**  
Next.js 14 • Neon • Drizzle • Gemini AI • Framer Motion
