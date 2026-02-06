# 🎮 Party OS - Quick Reference Card

## 🔗 URLs (Save These!)

### For Admin (You)
```
http://localhost:9002/admin/race-control
```
**Keep this private!** Your command center for:
- ⏱️ Entering lap times
- 🎮 Starting imposter rounds  
- 💰 Settling bets

### For Guests (Share This!)
```
http://localhost:9002/party/join
```
**Share with everyone!** Guests will:
- 📝 Enter their name
- 🔢 Get a 4-digit PIN
- 🎯 Start playing

---

## ⚡ Quick Actions

### Start the Server
```bash
npm run dev
```
Server starts on: http://localhost:9002

### Submit a Lap Time
1. Go to `/admin/race-control`
2. Enter time: `1:24.500` or `84.5`
3. Click "Submit Lap Time"
4. ✨ Leaderboard updates instantly for everyone

### Start Imposter Game
1. Go to `/admin/race-control`
2. Click "🎭 Start New Imposter Round"
3. ✨ AI generates words, players get roles instantly

### Settle Race Bets
1. After all racers finish
2. Click "Settle Bets" in race control
3. ✨ Winners get 2x payout automatically

---

## 🎯 Game Modes

### 🏎️ Sim Racing
**How it works:**
- Each player races
- You enter their lap time
- Leaderboard sorts automatically
- Top 3 get Gold/Silver/Bronze

**Format:** `M:SS.mmm` (e.g., `1:24.500`)

### 💰 Betting
**How it works:**
- Guests bet 100 coins on a racer
- After race, winners get 200 coins back
- Losers keep nothing

**Flow:**
1. Guests place bets before race
2. Race happens
3. You click "Settle Bets"
4. Money distributed automatically

### 🎭 Imposter Game
**How it works:**
- You start a round
- AI picks random imposter
- AI generates secret word + hint
- Players discuss and vote

**Example:**
- Civilians see: "SpaceX"
- Imposter sees: "Rocket Company"

---

## 🔑 Environment Variables

**Required in `.env.local`:**

```env
# Pusher (Real-time updates)
PUSHER_APP_ID=your_app_id
PUSHER_KEY=your_key
PUSHER_SECRET=your_secret
PUSHER_CLUSTER=us2
NEXT_PUBLIC_PUSHER_KEY=your_key
NEXT_PUBLIC_PUSHER_CLUSTER=us2

# Google AI (Imposter game)
GOOGLE_GENERATIVE_AI_API_KEY=your_api_key
```

**Get keys:**
- Pusher: https://dashboard.pusher.com/
- Google AI: https://aistudio.google.com/app/apikey

---

## 🚨 Troubleshooting

### Leaderboard not updating?
- Check Pusher dashboard
- Verify `NEXT_PUBLIC_PUSHER_KEY` is set
- Restart dev server

### Imposter game won't start?
- Check `GOOGLE_GENERATIVE_AI_API_KEY`
- Verify at Google AI Studio
- Check API quota

### Guest can't join?
- Check server is running
- Verify `/party/join` URL
- Test on your phone first

### Bets not settling?
- Ensure at least one lap time exists
- Check console for errors
- Verify correct game ID

---

## 📱 Mobile Tips

- App works best on phones
- No need to refresh - updates are instant
- Keep screen on during games
- WiFi recommended (less data usage)

---

## 💡 Pro Tips

### For Best Experience
1. **Test everything 1 day before**
2. **Start server 30 min early**
3. **Create QR code for join URL**
4. **Keep race control open on laptop**
5. **Have backup (paper scores) just in case**

### Wallet Management
- Everyone starts with 1000 coins
- Bets cost 100 coins (default)
- Winners get 200 coins (2x)
- Can manually adjust in database if needed

### Race Control Tips
- Keep consistent time format
- Enter car model for bragging rights
- Wait for all bets before settling
- Start new race by submitting first lap

---

## 🎊 Party Day Checklist

**30 minutes before:**
- [ ] Start dev server
- [ ] Test join page on phone
- [ ] Keep race control open on laptop
- [ ] Share join URL with early arrivals

**During party:**
- [ ] Enter lap times as races finish
- [ ] Start imposter rounds between races
- [ ] Settle bets after each race
- [ ] Monitor Pusher for connection issues

**After party:**
- [ ] Screenshot final leaderboard
- [ ] Export stats (optional)
- [ ] Clean database for next party

---

## 📊 Database Commands

### View all guests:
```sql
SELECT name, pin_code, wallet_balance FROM party_users;
```

### View current leaderboard:
```sql
SELECT u.name, e.lap_time_ms, e.car_model
FROM sim_race_entries e
JOIN party_users u ON e.user_id = u.id
ORDER BY e.lap_time_ms ASC;
```

### Clear all party data:
```sql
DELETE FROM bets;
DELETE FROM sim_race_entries;
DELETE FROM party_imposter_rounds;
DELETE FROM party_games;
DELETE FROM party_users;
```

---

## 🆘 Emergency Contacts

**If tech fails:**
1. Have paper + pen ready
2. Manual leaderboard works fine!
3. Restart server
4. Check WiFi
5. Reboot computer if needed

**Pusher Status:** https://status.pusher.com/  
**Google AI Status:** https://status.cloud.google.com/

---

## 📞 Support

**Files to check:**
- Setup guide: `PARTY_OS_SETUP.md`
- Full docs: `PARTY_OS_DOCS.md`
- Server actions: `src/app/actions/party-logic.ts`
- Database schema: `src/lib/db/schema.ts` (Module 7)

**Console logs:**
- Check browser DevTools (F12)
- Check terminal for server logs
- Check Pusher dashboard for events

---

**Have fun! 🎉 Your party is going to be awesome!**
