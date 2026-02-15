# Event Hub Extended - Quick Start Guide

## 🚀 Quick Setup (5 Minutes)

### Step 1: Apply Database Migration
```bash
cd i:\Projects\FamilyVerse
npx drizzle-kit push
```

This creates 8 new tables:
- `eventSupplies` - Supply chain tracking
- `children` - Child profiles
- `guardianships` - Adult-child assignments
- `childCheckIns` - Safety check-ins
- `sosAlerts` - Emergency alerts
- `dietaryPreferences` - User diet restrictions
- `menuItems` - Event menu planning
- `tacticalLocations` - Nearby safety locations

### Step 2: (Optional) Add Google Places API Key
```bash
# Edit .env.local:
GOOGLE_PLACES_API_KEY=your_key_here
```

**Without API key**: Tactical map works but shows "No locations found" message.  
**With API key**: Automatically fetches nearby hospitals, police, pharmacies within 5km.

### Step 3: Test Features
1. Create a new event or open existing event
2. You'll see 8 tabs now (was 5 before):
   - 📋 Plan (Itinerary)
   - 📍 Radar (Live map)
   - 🛒 **Supplies** (NEW)
   - 💰 Kitty (Expenses)
   - 👶 **Guardian** (NEW)
   - 🍽️ **Menu** (NEW)
   - 🗳️ Polls
   - 💬 Chat

---

## 🧪 Testing Each Feature

### Test Supply Chain
1. Go to **Supplies** tab
2. Click "Add Item"
3. Add "2kg Boerewors" (Food category)
4. Click "I'll Bring This"
5. Item turns blue with your name
6. Click "Mark Bought"
7. Item turns green ✅

**Real-time Test**: Open event in 2 browsers, claim item in one → see update in other.

### Test Guardian Eye
1. Go to **Guardian** tab
2. Click "Add Child"
3. Add child (e.g., "Sarah, 5 years old, nut allergy")
4. Click status buttons: "With Parent", "Playing", etc.
5. Click "SOS" button
6. Red alert banner appears with emergency details
7. Click "Mark Resolved" ✅

**Alert Test**: Windows will play alert sound (if .mp3 file exists).

### Test Tactical Map
1. Go to **Radar** tab (📍 tab)
2. Enable "Safety Layer" toggle
3. Map shows colored markers:
   - 🏥 Red = Hospital
   - 👮 Blue = Police
   - 💊 Green = Pharmacy
4. Click marker → popup shows name, address, phone
5. Click phone number → opens phone dialer ✅

**Without API**: Shows "Add GOOGLE_PLACES_API_KEY" message.

### Test Feast Manager
1. Go to **Menu** tab
2. Click "Add Dish"
3. Add "Braai Boerewors" (Main Course)
4. Check dietary flags (e.g., "Halal")
5. Submit
6. Dish appears with green badge ✅

**Conflict Test**:
1. Add user dietary preference (Settings → Profile)
2. Add "Peanut Satay" to menu with "Contains Nuts" flag
3. Red conflict banner appears with user's name

---

## 📂 File Structure

```
src/
├── app/
│   └── actions/
│       └── events-extended.ts      # NEW - 25 server actions
├── components/
│   └── events/
│       ├── SupplyChainTab.tsx      # NEW - Supply management
│       ├── GuardianTab.tsx         # NEW - Child safety
│       ├── MenuTab.tsx             # NEW - Menu planning
│       ├── FamilyRadarClient.tsx   # EXTENDED - Tactical map
│       └── EventDetailClient.tsx   # MODIFIED - 8 tabs
└── lib/
    └── db/
        └── schema.ts               # EXTENDED - 8 new tables
```

---

## 🔍 Troubleshooting

### "Module not found" errors
```bash
# Restart Next.js dev server:
npm run dev
```

### Database errors
```bash
# Check DATABASE_URL in .env.local
# Re-run migration:
npx drizzle-kit push
```

### Pusher not working
```bash
# Check environment variables:
NEXT_PUBLIC_PUSHER_KEY=xxx
NEXT_PUBLIC_PUSHER_CLUSTER=sa1
PUSHER_APP_ID=xxx
PUSHER_SECRET=xxx
```

### Tactical map shows no markers
- **Expected**: API key required for Google Places
- **Fix**: Add `GOOGLE_PLACES_API_KEY` to .env.local
- **Alternative**: Feature degrades gracefully without key

### TypeScript errors
```bash
# Rebuild types:
npm run build
```

---

## 🎨 UI Components Used

All UI components from Radix UI:
- ✅ Button
- ✅ Input
- ✅ Textarea
- ✅ Select
- ✅ Card
- ✅ Badge
- ✅ Switch
- ✅ Checkbox
- ✅ Tabs

No new dependencies needed!

---

## 🔧 Configuration

### Pusher Events
New events added to `event-{eventId}` channel:
- `supply-added` - Item added to supply list
- `supply-claimed` - Item claimed by user
- `supply-unclaimed` - Claim released
- `supply-bought` - Item marked as bought
- `supply-deleted` - Item removed
- `child-checked-in` - Child status updated
- `guardian-assigned` - Guardian assigned to child
- `sos-alert` - Emergency alert triggered
- `sos-resolved` - Emergency resolved
- `menu-item-added` - Dish added to menu

### Map Markers
Custom marker colors (from leaflet-color-markers):
- Red: Hospitals, Meet Here pins
- Blue: Police stations
- Green: Pharmacies
- Orange: Supermarkets
- Yellow: Gas stations
- Pink: Playgrounds
- Default: User locations

---

## 📊 Performance Notes

### Database Queries
- Optimized with Drizzle ORM
- Indexed foreign keys (eventId, userId, childId)
- JSON columns for flexible data (dietary flags, preferences)

### Real-time Updates
- Throttled location updates (30 seconds)
- Pusher connection reuse
- Optimistic UI updates

### Map Performance
- OpenStreetMap tiles (free, fast)
- Tactical locations cached in database
- Lazy-loaded markers (only when layer enabled)

---

## 🚢 Deployment Checklist

Before deploying to production:

- [ ] Run `npx drizzle-kit push` on production database
- [ ] Add `GOOGLE_PLACES_API_KEY` to Vercel env vars (optional)
- [ ] Test all features in production
- [ ] Monitor Pusher usage (connections spike with active events)
- [ ] Set up error tracking (Sentry recommended)
- [ ] Add rate limiting to Google Places API calls
- [ ] Test on mobile devices (iOS Safari, Android Chrome)
- [ ] Verify HTTPS for geolocation (required by browsers)

---

## 📱 Mobile Testing

### iOS Safari
- Location permission requires HTTPS
- Audio autoplay blocked by default
- Geolocation watchPosition may drain battery

### Android Chrome
- Better geolocation accuracy
- Supports background location tracking
- Audio alerts work reliably

### PWA Considerations
- Install prompt appears after 2+ visits
- Offline map tiles (future enhancement)
- Push notifications for SOS alerts (future)

---

## 🤝 Contributing

### Adding New Features
1. Extend `schema.ts` with new table
2. Run `npx drizzle-kit generate` to create migration
3. Add server actions to `events-extended.ts`
4. Create UI component in `components/events/`
5. Integrate into `EventDetailClient.tsx`
6. Add Pusher events for real-time sync

### Code Style
- TypeScript strict mode
- Server actions use `'use server'` directive
- Client components use `'use client'` directive
- Tailwind CSS for styling
- Radix UI for components

---

## 📚 API Reference

### Supply Chain Actions
```typescript
addSupplyItem(data: NewEventSupply)
claimSupplyItem(itemId, userId, userName, eventId)
unclaimSupplyItem(itemId, userId, eventId)
markSupplyBought(itemId, userId, eventId)
getEventSupplies(eventId)
deleteSupplyItem(itemId, eventId)
```

### Guardian Eye Actions
```typescript
addChild(data: NewChild)
getChildren(parentId)
assignGuardian(data: NewGuardianship)
checkInChild(data: NewChildCheckIn)
triggerSOS(data: NewSosAlert)
resolveSOS(alertId, resolvedBy, eventId)
getActiveSOSAlerts(eventId)
getEventGuardianships(eventId)
getChildCheckIns(eventId)
```

### Feast Manager Actions
```typescript
addMenuItem(data: NewMenuItem)
getMenuItems(eventId)
setDietaryPreferences(data: NewDietaryPreference)
getDietaryPreferences(userId)
checkDietaryConflicts(eventId)
calculatePortions(eventId)
```

### Tactical Map Actions
```typescript
fetchNearbyPlaces(eventId, lat, lng)
getTacticalLocations(eventId)
```

---

## 🎯 What's Next?

### Immediate (Week 1)
- [ ] User testing with real families
- [ ] Fix any bugs discovered
- [ ] Mobile optimization
- [ ] Documentation polish

### Short-term (Month 1)
- [ ] Photo uploads for children
- [ ] Export shopping list to WhatsApp
- [ ] Recipe integration for menu
- [ ] GPS geofencing alerts

### Long-term (Quarter 1)
- [ ] Offline mode with service workers
- [ ] Apple AirTag integration
- [ ] Premium tier with Google Places included
- [ ] Multi-language support (Afrikaans, Zulu, Xhosa)

---

## 💡 Pro Tips

### Supply Chain Best Practices
- Add items early (2-3 days before event)
- Use specific quantities ("2kg" not "some")
- Add notes for brand preferences

### Guardian Eye Best Practices
- Check in kids every 30 minutes
- Update location when moving to new area
- Test SOS alerts before arrival
- Add emergency contacts to child notes

### Tactical Map Best Practices
- Enable safety layer upon arrival
- Share nearest hospital location in group chat
- Save important phone numbers
- Check pharmacy hours before relying on it

### Feast Manager Best Practices
- Ask about allergies during RSVP
- Mark all dishes clearly (vegetarian, halal, etc.)
- Use portion calculator for shopping
- Add prep time estimates in notes

---

## ✅ Success Metrics

Track these KPIs:
- **Supply Chain**: Duplicate purchase prevention rate
- **Guardian Eye**: SOS response time, check-in frequency
- **Tactical Map**: Safety location usage during emergencies
- **Feast Manager**: Dietary conflict prevention rate

---

## 🙏 Support

Questions? Issues?
1. Check `EVENT_HUB_EXTENDED_GUIDE.md` for detailed docs
2. Review code comments in `events-extended.ts`
3. Test in dev environment first
4. Monitor browser console for errors

---

**Built with ❤️ for South African families**  
**"Ubuntu" - I am because we are** 🤝

---

Last Updated: $(date)  
Version: 2.0.0 (Module 11 Complete)
