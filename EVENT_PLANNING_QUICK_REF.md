# 🗓️ Event Planning & Coordination - Quick Reference

**Last Updated:** February 15, 2026  
**Version:** 1.0

---

## 🚀 Quick Actions

### Create Event from Template
```
/events → "Quick Create" → Select Template → Fill Details → Create
⏱️ Takes ~30 seconds
```

### Add Checklist Item
```
Event Detail → "Checklist" Tab → "Add Task" → Fill Form → Save
✅ Auto-syncs with family
```

### View Calendar
```
/events → Toggle "Calendar" View → Navigate months
📅 Shows all events in month view
```

### Create Recurring Event
```
Create Event → Save → Open Event → Settings → "Make Recurring"
🔁 Generates instances automatically
```

---

## 📋 Cheat Sheet

### Checklist Categories
| Category | Icon | Use For |
|----------|------|---------|
| VENUE | 📍 | Booking, setup, cleanup |
| CATERING | 🍽️ | Food prep, ordering |
| SUPPLIES | 🛒 | Shopping, equipment |
| COMMUNICATION | 📢 | Invites, reminders |
| GENERAL | 📝 | Everything else |

### Event Tags
```
Popular Tags:
#birthday #braai #outdoor #kids-friendly
#halal #vegan #pet-friendly #budget-friendly
#adults-only #bring-your-own #potluck
```

### System Categories
```
🏔️ Outdoor Activities → Hikes, beach, picnics
🏆 Sports & Fitness → Games, workouts
🎉 Celebrations → Birthdays, anniversaries
🍽️ Food & Dining → Braais, dinners
✈️ Travel → Vacations, road trips
🎓 Educational → Workshops, classes
👥 Social → Reunions, meetups
```

---

## 💻 Code Snippets

### Quick Event Creation
```typescript
import { quickCreateEvent } from '@/app/actions/event-planning';

await quickCreateEvent({
  title: 'Family Braai',
  startTime: new Date('2026-03-20T15:00:00'),
  categorySlug: 'food',
  creatorId: user.uid,
  familyId: user.familyId,
});
```

### Add Checklist Item
```typescript
import { createChecklistItem } from '@/app/actions/event-planning';

await createChecklistItem({
  eventId: 'event-uuid',
  title: 'Buy decorations',
  category: 'SUPPLIES',
  dueDate: new Date(eventDate.getTime() - (48 * 60 * 60 * 1000)), // 2 days before
  createdBy: user.uid,
  isCompleted: false,
  sortOrder: 0,
});
```

### Create from Template
```typescript
import { createEventFromTemplate } from '@/app/actions/event-planning';

const result = await createEventFromTemplate(templateId, {
  title: 'Summer Beach Day',
  startTime: new Date('2026-04-15T10:00:00'),
  locationName: 'Clifton Beach',
  coordinates: { lat: -33.9360, lng: 18.3775 },
  creatorId: user.uid,
  familyId: user.familyId,
});
```

---

## 🎯 Workflows

### Friends & Family Delegation (Quick Flow)

```
Setup:
1. Host creates event from template and sets date/location
2. Assign roles: Host (final call), Co-host (checklist owner), Helpers (tasks/supplies), Guests (RSVP)
3. Pin the top 3 priorities in Chat

Execution:
4. Helpers claim tasks in "Checklist" and items in "Supplies"
5. Co-host clears blockers and nudges unclaimed items
6. Day-before: lock menu, confirm RSVPs, finalize roster
7. Event day: check-ins, photos, and expenses handled live
```

Role Handoff (Mini):
```
Host: set date/location, assign roles, approve checklist/supplies
Co-host: ensure claims complete, nudge gaps, pin day-before summary
```

RSVP Pin (Copy/Paste):
```
RSVP by [DATE]. Claim one task or item today. Add dietary notes. Reply if you need a swap.
```

Swap Policy:
```
Swaps welcome up to 24 hours before the event. Post your request in chat.
```

Day-Before Summary (Co-host Post):
```
Tomorrow: [TIME] at [PLACE]. Roster: [NAMES].
Unclaimed: [LIST]. Notes: [DETAILS].
```

Who's Bringing What (Ping):
```
Please confirm your item/task. Swaps now if needed.
```

Post-Event Debrief:
```
What worked? What to change next time? One shout-out.
```

Host Kickoff (Day-Of):
```
Welcome! Plan: [TOP 3]. Check in with co-host if you have a task.
Have fun.
```

Thanks + Recap:
```
Thanks all. Highlights: [WINS]. Photos welcome. Next time: [CHANGE].
```

### Birthday Party Planning (2 Weeks Out)

```
Week 1:
□ Use "Birthday Party" template
□ Customize guest list
□ Send invitations
□ Book venue

Week 2:
□ Confirm RSVPs
□ Order cake
□ Buy supplies (assign family members)

Day Before:
□ Final headcount
□ Prepare party bags
□ Set up venue

Event Day:
□ Check in guests
□ Track expenses in Kitty
□ Add photos to gallery
□ Send thank-yous

Post-Event:
□ Review what worked
□ Save as custom template
```

### Weekly Braai (Recurring)

```
Setup Once:
1. Create "Sunday Braai" event
2. Use "Braai" template
3. Make recurring (every Sunday)
4. Set roster for supplies

Each Week (Auto):
- Event created automatically
- Checklist pre-filled
- Reminders sent 24h before
- Family claims items
- GPS tracking on day
```

---

## 🔧 Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| New Event | `Alt + N` |
| Calendar View | `Alt + C` |
| Search Events | `Ctrl + K` |
| Quick Create | `Alt + Q` |

---

## 📞 Support

### Common Issues

**Q: Checklist not saving?**
```
A: Check internet connection → Refresh → Try again
```

**Q: Template not loading?**
```
A: Run: npx tsx scripts/seed-event-planning.ts
```

**Q: Calendar shows wrong month?**
```
A: Click "Today" button → Should reset to current month
```

**Q: Recurring events stopped generating?**
```
A: Check end date → Check max occurrences → Check logs
```

---

## 🎓 Tips & Tricks

### Pro Tips
1. **Start with Templates** - Saves 80% of planning time
2. **Assign Due Dates** - Work backwards from event
3. **Tag Everything** - Future you will thank you
4. **Use Recurring for Regular Events** - Set & forget
5. **Check Calendar Weekly** - Stay ahead of schedule

### Power User Features
```typescript
// Bulk create checklists
const items = [
  { title: 'Task 1', category: 'VENUE' },
  { title: 'Task 2', category: 'CATERING' },
];
await Promise.all(items.map(item => createChecklistItem({ ...item, eventId })));

// Clone event as template
await createEventTemplate({
  name: event.title + ' Template',
  checklistItems: checklists.map(c => ({
    title: c.title,
    category: c.category,
    dueBeforeHours: calculateHoursBefore(c.dueDate, event.startTime),
  })),
});
```

### Mobile Optimization
- Checklist items have large touch targets
- Swipe to complete tasks
- Quick add button always visible
- Calendar optimized for small screens

---

## 📊 Metrics to Track

### Event Success Metrics
- ✅ Tasks completed on time: 95%+
- 📍 RSVP accuracy: 90%+
- 💰 Budget variance: <10%
- 😊 Satisfaction score: 4.5+/5

### Planning Efficiency
- ⏱️ Time saved with templates: 60-80%
- 🔁 Recurring events adoption: 40%+
- 👥 Family participation rate: 75%+
- 📋 Checklist completion rate: 85%+

---

## 🔗 Quick Links

- [Full Guide](./EVENT_PLANNING_COORDINATION_GUIDE.md)
- [Event Hub Core](./EVENT_HUB_GUIDE.md)
- [Extended Features](./EVENT_HUB_EXTENDED_GUIDE.md)

---

**Need Help?** Check the full guide or contact support! 💬
