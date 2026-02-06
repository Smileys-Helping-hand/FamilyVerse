# 🚀 Quick Installation Guide

## Prerequisites
- Node.js 18+ installed
- Neon PostgreSQL account (✅ Already configured)
- Google Gemini API key

---

## Step-by-Step Installation

### 1️⃣ Install Dependencies

```powershell
npm install
```

**New packages added automatically:**
- `@google/generative-ai` - Google Gemini SDK
- `framer-motion` - Animation library

---

### 2️⃣ Environment Setup

Your `.env.local` is already configured with Neon! Just add your Gemini API key:

```env
# ✅ Neon PostgreSQL (Already configured)
DATABASE_URL=postgresql://neondb_owner:npg_lCB8qhoisV0p@ep-lucky-surf-abwawn5t-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require

# ⚠️ ADD THIS: Get your free API key from https://ai.google.dev/
GEMINI_API_KEY=your_api_key_here

# Your existing Firebase config...
```

**Get Gemini API Key:**
1. Visit https://ai.google.dev/
2. Click "Get API Key in Google AI Studio"
3. Create new key
4. Copy and paste into `.env.local`

---

### 3️⃣ Database Migration

**Option A: Automatic (Recommended)**

```powershell
# Generate migration files
npm run db:generate

# Push to Neon
npm run db:push
```

**Option B: Manual SQL**

```powershell
psql 'postgresql://neondb_owner:npg_lCB8qhoisV0p@ep-lucky-surf-abwawn5t-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require' -f drizzle/party-companion-migration.sql
```

---

### 4️⃣ Verify Installation

```powershell
# Check TypeScript types
npm run typecheck

# Start development server
npm run dev
```

Visit: http://localhost:9002

---

### 5️⃣ Optional: Seed Example Data

Create some example games:

```powershell
# Run the seed script
psql 'postgresql://neondb_owner:npg_lCB8qhoisV0p@ep-lucky-surf-abwawn5t-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require' <<EOF
INSERT INTO games (name, scoring_type, icon, description) VALUES
  ('Sim Racing', 'TIME_ASC', '🏎️', 'Fastest lap time wins'),
  ('Dominoes', 'SCORE_DESC', '🎲', 'Highest score wins'),
  ('VR Beat Saber', 'SCORE_DESC', '🎮', 'Highest score wins'),
  ('Chess', 'SCORE_DESC', '♟️', 'Points based on outcomes'),
  ('Mario Kart', 'TIME_ASC', '🏁', 'Fastest race time')
ON CONFLICT DO NOTHING;
EOF
```

---

## 📁 What Was Created

### Database Schema
- ✅ `src/lib/db/schema.ts` - Complete database schema
- ✅ `drizzle/party-companion-migration.sql` - Migration file

### Server Actions (Backend)
- ✅ `src/app/actions/party-brain.ts` - AI event planning
- ✅ `src/app/actions/leaderboard.ts` - Rankings & MVP
- ✅ `src/app/actions/imposter-game.ts` - Social deduction game
- ✅ `src/app/actions/expenses.ts` - Receipt OCR & splitting

### React Components (Frontend)
- ✅ `src/components/party/LiveLeaderboard.tsx` - Animated rankings
- ✅ `src/components/party/PartyMVPLeaderboard.tsx` - Overall winner
- ✅ `src/components/party/ImposterDashboard.tsx` - Game interface
- ✅ `src/components/party/RoleRevealCard.tsx` - Role animations
- ✅ `src/components/party/ExpenseScanner.tsx` - Receipt upload
- ✅ `src/components/party/PartyHub.tsx` - Main dashboard

### Documentation
- ✅ `PARTY_COMPANION_README.md` - Complete documentation
- ✅ `src/types/party-companion.ts` - TypeScript definitions
- ✅ `setup-party-companion.ps1` - Automated setup script

---

## 🧪 Quick Test

### Test 1: Database Connection
```typescript
// In any server component or action
import { db } from '@/lib/db';
import { games } from '@/lib/db/schema';

const allGames = await db.select().from(games);
console.log('Games:', allGames);
```

### Test 2: AI Planning
```typescript
import { generateEventPlan } from '@/app/actions/party-brain';

const result = await generateEventPlan({
  eventId: 1,
  hostId: 'test-user',
  eventType: 'Birthday Party',
  duration: 4,
  attendees: 10
});
```

### Test 3: Leaderboard
```tsx
import { LiveLeaderboard } from '@/components/party/LiveLeaderboard';

<LiveLeaderboard
  gameId={1}
  eventId={1}
  gameName="Sim Racing"
  scoringType="TIME_ASC"
/>
```

---

## ⚠️ Troubleshooting

### Issue: "Module not found @google/generative-ai"
```powershell
npm install @google/generative-ai
```

### Issue: "Module not found framer-motion"
```powershell
npm install framer-motion
```

### Issue: Database connection fails
```powershell
# Test connection
psql 'postgresql://neondb_owner:npg_lCB8qhoisV0p@ep-lucky-surf-abwawn5t-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require'

# If it connects, check .env.local has correct DATABASE_URL
```

### Issue: Gemini API errors
- Verify `GEMINI_API_KEY` is in `.env.local`
- Check quota at https://console.cloud.google.com/
- Make sure API key has Gemini API enabled

### Issue: TypeScript errors
```powershell
npm run typecheck
```

---

## 🎯 Next Steps

1. **Read Full Docs**: `PARTY_COMPANION_README.md`
2. **Test Each Module**: Use the test examples above
3. **Customize**: Modify components to match your app's style
4. **Add Features**: Build on top of the foundation

---

## 📚 Module Overview

| Module | Purpose | Key Files |
|--------|---------|-----------|
| 🧠 Party Brain | AI event planning | `party-brain.ts` |
| 🏆 Leaderboard | Live rankings & MVP | `leaderboard.ts`, `LiveLeaderboard.tsx` |
| 🎭 Imposter Game | Social deduction | `imposter-game.ts`, `ImposterDashboard.tsx` |
| 🧾 Expenses | Receipt OCR & splits | `expenses.ts`, `ExpenseScanner.tsx` |

---

## ✅ Checklist

- [ ] Dependencies installed (`npm install`)
- [ ] Gemini API key added to `.env.local`
- [ ] Database migrated (`npm run db:push`)
- [ ] Dev server running (`npm run dev`)
- [ ] Can view http://localhost:9002
- [ ] Read `PARTY_COMPANION_README.md`

---

## 🤝 Need Help?

All code is:
- ✅ Fully typed (TypeScript)
- ✅ Server Actions (secure by default)
- ✅ Responsive (mobile-first)
- ✅ Animated (Framer Motion)
- ✅ Production-ready

Check the comprehensive README for API references, examples, and advanced usage!

---

**Happy coding! 🎉**
