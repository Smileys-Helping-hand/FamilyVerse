# 🚀 EVENT HUB - Quick Reference

## 📍 Navigation Routes

| Page | URL | Description |
|------|-----|-------------|
| **Event List** | `/events` | View all events (upcoming, live, past) |
| **Create Event** | `/events/create` | Create a new event |
| **Event Detail** | `/events/[id]` | View event details, RSVP, manage |
| **Family Radar** | `/events/[id]/map` | Live location tracking map |

---

## 🎯 Quick Actions

### **Create an Event**
```
1. Click "Create Event" button
2. Fill in: Title, Date/Time, Location
3. Optional: Add coordinates for map features
4. Submit → Auto-generates hero image
```

### **RSVP to Event**
```
1. Open event page
2. Click: "I'm Going" / "Maybe" / "Can't Make It"
3. See who else is coming
```

### **Track Live Location**
```
1. Go to event → "Map" tab
2. Click "Start Tracking"
3. Grant location permission
4. Your marker appears on map
5. Updates every 30 seconds
```

### **Add Expense**
```
1. Go to event → "Kitty" tab
2. Click "Add Expense"
3. Enter: Amount, Description, Category
4. Choose: Equal Split or Custom
5. Submit → Everyone gets notified
```

### **Create Poll**
```
1. Go to event → "Polls" tab
2. Click "Create Poll"
3. Enter question + 2-6 options
4. Set auto-close timer (5 min default)
5. Submit → Live voting begins
```

---

## 🗺️ Map Features

### **Ghost Mode**
Toggle to hide your location (privacy mode)

### **Meet-Here Pin**
Click map → Everyone gets notified where to meet

### **Convoy Mode**
See who's driving vs stopped:
- 🚗 Moving: Shows speed in km/h
- 🛑 Idle: Speed < 5 km/h

---

## 💰 Expense Categories

| Icon | Category | Use For |
|------|----------|---------|
| 🍕 | FOOD | Meals, snacks, drinks |
| 🚗 | TRANSPORT | Fuel, parking, tolls |
| 🏨 | ACCOMMODATION | Hotels, Airbnb |
| 🎢 | ACTIVITY | Tickets, entry fees |
| 📦 | OTHER | Everything else |

---

## 📊 Event Statuses

| Status | Color | Meaning |
|--------|-------|---------|
| **UPCOMING** | 🔵 Blue | Event not started yet |
| **LIVE** | 🔴 Red | Event is happening now |
| **PAST** | ⚫ Gray | Event finished |

---

## 🎮 Real-Time Features

All updates happen **instantly** via Pusher:
- ✅ RSVPs
- 📍 Location updates
- 💰 New expenses
- 🗳️ Poll votes
- 📌 Meet-here pins

---

## 🔧 Troubleshooting

**Map not loading?**
```
- Check internet connection
- Refresh page
- Clear browser cache
```

**Location not updating?**
```
- Grant location permission
- Check GPS is enabled
- Verify HTTPS connection
```

**Expense not splitting?**
```
- Ensure people have RSVP'd "Going"
- Check amount is valid number
- Verify network connection
```

---

## 📱 Mobile Tips

- Use full-screen map for better view
- Enable "Keep screen on" when tracking
- Close other apps to save battery
- Use Ghost Mode when not needed

---

## 🔐 Privacy

- **Ghost Mode:** Your location hidden
- **Location Data:** Not stored permanently
- **Pins Expire:** Auto-delete after 30 min
- **RSVPs:** Visible to all attendees

---

## 🎯 Pro Tips

1. **Add coordinates** for map features (get from Google Maps)
2. **Set realistic poll timers** (5-10 minutes)
3. **Use Ghost Mode** when idle to save battery
4. **Split expenses immediately** while fresh in mind
5. **Pin meeting spots** before asking "Where are you?"

---

## 📞 Quick Help

**Weather not showing?**
→ Add event coordinates

**Can't see others on map?**
→ They need to "Start Tracking"

**Who paid what?**
→ Kitty tab → Settlement Summary

**Need to vote?**
→ Polls tab → Tap your choice

---

## 🚀 Power User Shortcuts

### **Organizer Mode**
1. Create event with full details
2. Add waypoints for itinerary
3. Pre-create polls for decisions
4. Monitor Family Radar for stragglers

### **Attendee Mode**
1. RSVP as soon as invited
2. Start tracking 10 min before departure
3. Check polls regularly
4. Settle expenses same day

---

## 📈 Event Planning Checklist

**Before Event:**
- [ ] Create event with date/time
- [ ] Add location + coordinates
- [ ] Send invites (share link)
- [ ] Create pre-event polls
- [ ] Set up itinerary waypoints

**During Event:**
- [ ] Start location tracking
- [ ] Add expenses as they happen
- [ ] Use polls for decisions
- [ ] Drop meet-here pins if separated

**After Event:**
- [ ] Settle all expenses
- [ ] Mark event as PAST
- [ ] Review settlement summary
- [ ] Close any open polls

---

## 🎉 Fun Use Cases

**Road Trip:**
- Track convoy in real-time
- Split fuel costs
- Vote on lunch stops

**Wedding:**
- RSVPs in one place
- Track who's arrived
- Split accommodation

**Family Picnic:**
- Pin exact meetup spot
- Share grocery expenses
- Vote on activities

**Beach Day:**
- Weather forecast
- Split beach gear costs
- Track who's still coming

---

**Need more help?** Check [EVENT_HUB_GUIDE.md](./EVENT_HUB_GUIDE.md)
