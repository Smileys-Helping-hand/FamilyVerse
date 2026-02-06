# 🎮 Party OS - Setup Guide

## Overview
Your complete Party Operating System for LAN/Birthday parties! Features:
- 🏎️ **Sim Racing Leaderboard** - Real-time lap times with live updates
- 💰 **Betting System** - Bet on racers with party currency
- 🎭 **Imposter Game** - AI-powered word game with roles
- 📱 **Mobile-First** - Perfect for guests on phones

## Quick Start (4 Days to Party!)

### Step 1: Environment Setup (5 minutes)

Edit your `.env.local` file and add:

```env
# Pusher (Get from https://dashboard.pusher.com/)
PUSHER_APP_ID=your_app_id
PUSHER_KEY=your_key
PUSHER_SECRET=your_secret
PUSHER_CLUSTER=us2
NEXT_PUBLIC_PUSHER_KEY=your_key
NEXT_PUBLIC_PUSHER_CLUSTER=us2

# Google AI (Get from https://aistudio.google.com/app/apikey)
GOOGLE_GENERATIVE_AI_API_KEY=your_api_key
```

### Step 2: Get API Keys

#### Pusher (Real-Time Updates)
1. Go to https://dashboard.pusher.com/
2. Create free account
3. Click "Create app" → Name it "PartyOS"
4. Copy App ID, Key, Secret, and Cluster
5. Paste into `.env.local`

#### Google AI (Imposter Game)
1. Go to https://aistudio.google.com/app/apikey
2. Sign in with Google
3. Click "Create API Key"
4. Copy the key
5. Paste into `.env.local`

### Step 3: Database Migration (Already Done! ✅)

The party tables are already created. You're ready to go!

### Step 4: Start the Server

```bash
npm run dev
```

## Party Day Operations

### For the Admin (You!)

**Race Control Page:** http://localhost:9002/admin/race-control

This is your command center. Here you:
1. Enter lap times as racers finish
2. Start imposter rounds
3. Settle bets after races

**Keep this URL private!** Only you should access it.

### For Your Guests

**Join Page:** http://localhost:9002/party/join

Guests visit this on their phones to:
1. Enter their name
2. Get a 4-digit PIN
3. Start playing!

**Share this URL with everyone at the party.**

## Game Flows

### Sim Racing Flow

1. **Admin:** Navigate to `/admin/race-control`
2. **Racer:** Completes a lap
3. **Admin:** Enter lap time (e.g., "1:24.500")
4. **System:** Leaderboard updates instantly for all guests
5. **Guests:** See their rank with gold/silver/bronze styling
6. **Admin:** After all laps, click "Settle Bets"
7. **System:** Winners get 2x payout automatically

### Betting Flow

1. **Guest:** Opens "Betting" tab on their phone
2. **Guest:** Clicks a racer's avatar
3. **Guest:** Clicks "Bet 100" (default amount)
4. **System:** Deducts 100 coins from wallet
5. **System:** After race, if their racer wins, they get 200 coins back!

### Imposter Game Flow

1. **Admin:** Click "Start New Imposter Round"
2. **AI:** Generates secret word + imposter hint
3. **System:** Assigns roles to all logged-in guests
4. **Guests:** Tap to reveal their word/hint
5. **Everyone:** Discusses and tries to find imposter
6. **Admin:** Start new round when done

## Tips & Tricks

### Mobile Optimization
- App is designed for phones
- Guests can keep their phones open during games
- Real-time updates happen instantly
- No need to refresh!

### Wallet Management
- Each guest starts with 1000 coins
- Bets cost 100 coins (default)
- Winning pays 2x (200 coins)
- Admin can manually adjust wallets in database if needed

### Real-Time Events
All updates are instant thanks to Pusher:
- New lap times appear immediately
- Bets placed show to everyone
- Game state changes sync across all devices

### Troubleshooting

**"Missing Pusher environment variables"**
- Make sure `.env.local` has all Pusher keys
- Restart the dev server

**"Failed to start imposter round"**
- Check GOOGLE_GENERATIVE_AI_API_KEY is set
- Verify API key is valid at Google AI Studio

**"Not authenticated"**
- Guest needs to visit `/party/join` first
- Check browser cookies are enabled

**Leaderboard not updating?**
- Check Pusher dashboard for connection status
- Verify NEXT_PUBLIC_PUSHER_KEY matches PUSHER_KEY

## Database Tables

Your party uses these tables:

- `party_users` - Guest profiles with PINs and wallets
- `party_games` - Game sessions (sim racing, imposter, etc.)
- `sim_race_entries` - Lap times and leaderboard
- `bets` - All bets placed by guests
- `party_imposter_rounds` - Active imposter game states
- `party_events` - Real-time event log

## Security Notes

- Admin pages (`/admin/*`) have no auth by default
- Keep the race control URL private
- Consider adding password protection for production
- PINs are 4-digit for quick party login (not secure for real use)

## Party Day Checklist

**Day Before:**
- [ ] Test `/party/join` on your phone
- [ ] Test `/admin/race-control` on your laptop
- [ ] Submit a test lap time
- [ ] Place a test bet
- [ ] Start a test imposter round
- [ ] Verify Pusher events are working

**Party Day:**
- [ ] Start dev server 30 minutes early
- [ ] Share join URL with guests (QR code?)
- [ ] Keep race control open on your laptop
- [ ] Have fun! 🎉

## Need Help?

Check these files:
- Server actions: `src/app/actions/party-logic.ts`
- Components: `src/components/party/`
- Admin page: `src/app/admin/race-control/page.tsx`
- Schema: `src/lib/db/schema.ts` (Module 7)

## Future Enhancements

Ideas for after the party:
- [ ] Custom bet amounts
- [ ] Multiple simultaneous races
- [ ] Dominoes game integration
- [ ] Points-based tournament mode
- [ ] Photo uploads for avatars
- [ ] Voting system for imposter game
- [ ] Admin dashboard with analytics

---

**Built with:** Next.js 14 • Neon PostgreSQL • Pusher • Google AI • Drizzle ORM

**Party On! 🎊**
