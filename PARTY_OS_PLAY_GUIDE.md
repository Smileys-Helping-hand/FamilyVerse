# 🎮 Party OS - Quick Play Guide

## 🚀 Getting Started

### Access Party Games
From your FamilyVerse dashboard:
1. Click the **Party Games** card (purple/pink gradient)
2. Or click your profile → **Party Games 🎮**
3. Or use Quick Actions → **Party Games**

### Join the Party
You'll be taken to `/party/join` where you can:
- **New Guest**: Enter your name to get a 4-digit PIN
- **Returning**: Login with your existing PIN

## 🏁 Sim Racing Championship

### View Leaderboard
1. Go to Party Dashboard → **Racing** tab
2. See live leaderboard with:
   - 🥇 Gold for 1st place
   - 🥈 Silver for 2nd place
   - 🥉 Bronze for 3rd place
   - Lap times, car models, track names

### Submit Lap Times (Admin)
1. Go to `/admin/race-control`
2. Enter lap time (format: "1:24.500" or "84.5")
3. Optionally add car model and track
4. Click **Submit Lap Time**
5. Leaderboard updates in real-time!

## 💰 Betting System

### Place Bets
1. Go to Party Dashboard → **Betting** tab
2. See all racers with avatars
3. Click **Bet 100** on any racer
4. Your wallet balance updates instantly
5. Wait for admin to settle bets

### Settle Bets (Admin)
1. Go to `/admin/race-control`
2. After all lap times are in, click **Settle Bets**
3. Winners get 2x payout (200 coins per 100 bet)
4. Everyone sees "Bets Settled" notification

### Track Your Bets
- See "My Bets" section in Betting tab
- Shows status: Pending / Won / Lost
- Won bets show payout amount

## 🎭 Imposter Game

### Start Round (Admin)
1. Go to `/admin/race-control`
2. Click **Start Imposter Round**
3. Google Gemini AI generates:
   - Secret word for civilians
   - Related hint for imposter

### Play the Game
1. Go to Party Dashboard → **Imposter** tab
2. Tap your card to reveal your role:
   - 🟢 **Green Card**: You're a Civilian - memorize the secret word
   - 🔴 **Red Card**: You're the Imposter - use the hint to blend in
3. In real life: Take turns describing the word without saying it
4. Vote on who the imposter is!

## 🎮 Demo Racers

For testing, we created 4 demo racers with lap times:

| Racer | PIN | Lap Time | Car |
|-------|-----|----------|-----|
| Speed Demon | 1111 | 1:22.500 | Porsche 911 GT3 |
| Drift King | 2222 | 1:23.200 | BMW M4 GT3 |
| Track Master | 3333 | 1:24.100 | Ferrari 488 GT3 |
| Nitro Boost | 4444 | 1:25.750 | McLaren 720S GT3 |

Login as any of these to test betting!

## 💡 Pro Tips

1. **Multiple Devices**: Each person can use their own device/browser
2. **Real-Time Updates**: All changes appear instantly via Pusher
3. **Wallet**: Everyone starts with 1000 coins
4. **Cross-Family**: Party system works independently from family accounts
5. **Admin Access**: Use your FamilyVerse profile dropdown → Admin Panel

## 🎪 Party Day Checklist

### Before Guests Arrive
- [ ] Run dev server: `npm run dev`
- [ ] Test leaderboard at `/party/dashboard`
- [ ] Open admin panel at `/admin/race-control`
- [ ] Verify real-time updates work

### When Guests Join
- [ ] Have them go to your server URL (e.g., `http://192.168.1.100:9002`)
- [ ] Click "Party Games"
- [ ] Join as new guest → they get a PIN
- [ ] Write down their PIN for re-login later

### During Sim Racing
- [ ] Racers compete on actual sim rig
- [ ] Admin enters lap times as they finish
- [ ] Others place bets during warm-up laps
- [ ] After all times in: Admin settles bets
- [ ] Winners celebrate! 🎉

### Imposter Game Rounds
- [ ] Admin starts new round
- [ ] Everyone reveals their card
- [ ] Play 5-10 minutes of discussion
- [ ] Vote and start next round

## 🔧 Troubleshooting

**Issue: Betting slip shows empty**
- Solution: Run `npx tsx scripts/seed-party-data.ts` to add demo racers

**Issue: No leaderboard data**
- Solution: Admin needs to submit lap times from `/admin/race-control`

**Issue: Real-time updates not working**
- Solution: Check Pusher connection (look for green "Live" indicator)

**Issue: Switched to wrong profile**
- Solution: Party system uses separate cookies - if you have multiple browser profiles, use separate browsers/incognito windows

## 📱 Recommended Setup

- **Sim Racing Station**: Large monitor showing `/party/dashboard` (Racing tab)
- **Betting Station**: Tablet showing `/party/dashboard` (Betting tab)
- **Admin Station**: Laptop with `/admin/race-control`
- **Guests**: Their phones at `/party/dashboard`

Have an amazing party! 🎉
