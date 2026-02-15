# 🏗️ EVENT HUB - System Architecture

## 📊 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT (Browser)                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Events  │  │  RSVP    │  │  Expenses│  │  Polls   │  │
│  │  List    │  │  Tracking│  │  Splitter│  │  Voting  │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  │
│       │             │              │             │         │
│  ┌────▼─────────────▼──────────────▼─────────────▼──────┐ │
│  │          Family Radar (Leaflet Map)                   │ │
│  │  • Real-time markers  • Ghost Mode  • Meet-Here pins  │ │
│  └───────────────────────┬───────────────────────────────┘ │
│                          │                                  │
└──────────────────────────┼──────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │      NEXT.JS 14 SERVER               │
        ├──────────────────────────────────────┤
        │                                      │
        │  ┌────────────────────────────┐    │
        │  │   Server Actions           │    │
        │  │   /app/actions/events.ts   │    │
        │  ├────────────────────────────┤    │
        │  │ • createEvent()            │    │
        │  │ • rsvpToEvent()            │    │
        │  │ • addExpense()             │    │
        │  │ • updateLiveLocation()     │    │
        │  │ • createPoll()             │    │
        │  │ • votePoll()               │    │
        │  └──────────┬─────────────────┘    │
        │             │                       │
        └─────────────┼───────────────────────┘
                      │
         ┌────────────┼────────────┐
         │            │            │
         ▼            ▼            ▼
    ┌────────┐  ┌─────────┐  ┌─────────┐
    │ Pusher │  │  Neon   │  │   APIs  │
    │  sa1   │  │Postgres │  │         │
    └────────┘  └─────────┘  └─────────┘
    Real-time   Database     External
    
    Triggers:   Tables:       Services:
    • location  • events      • Unsplash
    • expenses  • attendees   • Open-Meteo
    • polls     • waypoints   • OSM Tiles
    • RSVPs     • locations
                • expenses
                • splits
                • polls
                • votes
```

---

## 🔄 Data Flow Diagrams

### **1. Event Creation Flow**

```
User clicks "Create Event"
        ↓
CreateEventForm (Client)
        ↓
Submit form data
        ↓
createEvent() server action
        ↓
Insert into events table
        ↓
Generate hero image URL (Unsplash)
        ↓
Return event ID
        ↓
Redirect to /events/[id]
        ↓
Event detail page loads
```

### **2. Live Location Flow**

```
User clicks "Start Tracking"
        ↓
Request geolocation permission
        ↓
navigator.geolocation.watchPosition()
        ↓
Get position every 10 seconds
        ↓
Throttle to 30-second updates
        ↓
updateLiveLocation() server action
        ↓
Upsert into live_locations table
        ↓
Trigger Pusher event on presence-event-[id]
        ↓
All subscribed clients receive update
        ↓
Update marker position on map
```

### **3. Expense Splitting Flow**

```
User clicks "Add Expense"
        ↓
Fill form: Amount, Description, Split Type
        ↓
Calculate splits (equal or custom)
        ↓
addExpense() server action
        ↓
Insert into expenses table
        ↓
Insert splits into expense_splits table
        ↓
Trigger Pusher event: expense-added
        ↓
All clients refresh expenses tab
        ↓
Show updated settlement summary
```

### **4. Poll Voting Flow**

```
Creator clicks "Create Poll"
        ↓
Set question, options, expiry time
        ↓
createPoll() server action
        ↓
Insert into event_polls table
        ↓
Trigger Pusher event: poll-created
        ↓
All clients see new poll
        ↓
Users vote by clicking option
        ↓
votePoll() server action
        ↓
Upsert into poll_votes table
        ↓
Trigger Pusher event: poll-vote
        ↓
All clients see updated vote counts
        ↓
Timer expires → Poll auto-closes
```

---

## 🗄️ Database Schema Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                           EVENTS                                      │
│  id (uuid, PK)                                                       │
│  title, description, startTime, endTime                              │
│  locationName, coordinates (json)                                    │
│  status (UPCOMING/LIVE/PAST)                                         │
│  heroImageUrl, creatorId, familyId                                   │
└────────────────────┬─────────────────────────────────────────────────┘
                     │
     ┌───────────────┼───────────────┬──────────────┬──────────────┐
     │               │               │              │              │
     ▼               ▼               ▼              ▼              ▼
┌─────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│ATTENDEES│   │WAYPOINTS │   │LOCATIONS │   │EXPENSES  │   │  POLLS   │
│         │   │          │   │          │   │          │   │          │
│eventId  │   │eventId   │   │eventId   │   │eventId   │   │eventId   │
│userId   │   │time      │   │userId    │   │payerId   │   │question  │
│rsvpStatus   │title     │   │latitude  │   │amount    │   │options[] │
│         │   │location  │   │longitude │   │category  │   │expiresAt │
└─────────┘   └──────────┘   │speed     │   └────┬─────┘   └────┬─────┘
                              │isGhost   │        │              │
                              └──────────┘        │              │
                                                  ▼              ▼
                                            ┌──────────┐   ┌──────────┐
                                            │  SPLITS  │   │  VOTES   │
                                            │          │   │          │
                                            │expenseId │   │pollId    │
                                            │userId    │   │userId    │
                                            │amountOwed│   │optionIdx │
                                            │isPaid    │   │votedAt   │
                                            └──────────┘   └──────────┘

Additional Table:
┌──────────────┐
│ MEET_HERE_PINS
│ eventId
│ creatorId
│ latitude, longitude
│ message
│ expiresAt
└──────────────┘
```

---

## 🔌 Pusher Channel Structure

```
Channel Naming Convention:
├── event-[eventId]              (Standard)
│   └── Events:
│       ├── rsvp-update
│       ├── status-update
│       ├── expense-added
│       ├── poll-created
│       ├── poll-vote
│       ├── poll-closed
│       ├── waypoint-added
│       └── meet-here-pin
│
└── presence-event-[eventId]     (Presence)
    └── Events:
        ├── location-update
        └── ghost-mode-toggle
```

**Event Payloads:**

```typescript
// location-update
{
  userId: string,
  userName: string,
  latitude: string,
  longitude: string,
  speed: number,
  accuracy: number
}

// expense-added
{
  expense: Expense,
  splits: ExpenseSplit[]
}

// poll-vote
{
  pollId: string,
  votes: PollVote[]
}

// rsvp-update
{
  userId: string,
  userName: string,
  status: 'GOING' | 'MAYBE' | 'CANT_MAKE_IT'
}
```

---

## 🌐 External API Integration

### **1. Unsplash (Hero Images)**
```
URL: https://source.unsplash.com/1600x900/?{keywords}

Request: GET (no auth required)
Response: Image redirect
Cost: FREE
Rate Limit: 50 requests/hour

Used in: CreateEventForm.tsx
Fallback: Generic family/gathering image
```

### **2. Open-Meteo (Weather)**
```
URL: https://api.open-meteo.com/v1/forecast
Params:
  - latitude: number
  - longitude: number
  - daily: temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode
  - start_date: YYYY-MM-DD
  - end_date: YYYY-MM-DD

Request: GET (no auth required)
Response: JSON forecast data
Cost: FREE
Rate Limit: ~10,000 requests/day

Used in: getWeatherForecast() action
Fallback: No weather widget shown
```

### **3. OpenStreetMap (Map Tiles)**
```
URL: https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png

Request: GET tiles on-demand
Response: PNG image tiles
Cost: FREE
Rate Limit: Fair use (cached in browser)

Used in: FamilyRadarClient.tsx
Fallback: None (required for map)
Alternative: Mapbox (50k loads/month free)
```

---

## 📱 Client-Side State Management

### **React Hooks Pattern**
```typescript
// Event Detail
const [attendees, setAttendees] = useState<Attendee[]>([]);
const [userRsvp, setUserRsvp] = useState<RsvpStatus>('PENDING');

useEffect(() => {
  // Subscribe to Pusher
  const pusher = getPusherClient();
  const channel = pusher.subscribe(`event-${eventId}`);
  
  channel.bind('rsvp-update', (data) => {
    setAttendees(prev => updateAttendee(prev, data));
  });
  
  return () => {
    channel.unbind_all();
    channel.unsubscribe();
  };
}, [eventId]);
```

### **Location Tracking**
```typescript
// Geolocation Watch
const watchIdRef = useRef<number | null>(null);
const lastUpdateRef = useRef<number>(0);

const startTracking = () => {
  watchIdRef.current = navigator.geolocation.watchPosition(
    (position) => {
      const now = Date.now();
      if (now - lastUpdateRef.current > 30000) {
        // Update every 30 seconds
        updateLiveLocation(position);
        lastUpdateRef.current = now;
      }
    },
    (error) => handleError(error),
    { enableHighAccuracy: true, maximumAge: 10000 }
  );
};
```

---

## 🔒 Security Architecture

### **Authentication Flow**
```
Client Request
      ↓
Middleware checks session cookie
      ↓
Firebase Admin SDK verifies
      ↓
Decode user token
      ↓
Attach user to request
      ↓
Server action executes
      ↓
Validate user owns resource
      ↓
Execute database query
```

### **Authorization Rules**
```typescript
// Event Access
- Creator: Full control
- Attendees: View, RSVP, add expenses
- Family Members: Can create events
- Public: No access

// Location Data
- Ghost Mode: User controls visibility
- Live Locations: Only visible to event attendees
- Historical: Not stored (only last position)

// Financial Data
- Expenses: Visible to all attendees
- Splits: Can only settle your own debts
- Summary: Aggregated view for everyone
```

---

## ⚡ Performance Optimizations

### **Database Layer**
```sql
-- Indexes created by Drizzle
CREATE INDEX idx_event_attendees_event ON event_attendees(event_id);
CREATE INDEX idx_event_attendees_user ON event_attendees(user_id);
CREATE INDEX idx_expenses_event ON expenses(event_id);
CREATE INDEX idx_live_locations_event ON live_locations(event_id);
CREATE INDEX idx_event_polls_event ON event_polls(event_id);
```

### **React Optimizations**
```typescript
// Lazy load map component
const FamilyRadarClient = dynamic(
  () => import('@/components/events/FamilyRadarClient'),
  { ssr: false }
);

// Debounced location updates
const debouncedUpdate = useMemo(
  () => debounce(updateLocation, 30000),
  []
);

// Optimistic UI updates
const handleRsvp = async (status) => {
  setUserRsvp(status); // Immediate UI update
  await rsvpToEvent({ status }); // Background sync
};
```

### **Pusher Optimization**
```typescript
// Shared connection
let pusherInstance: Pusher | null = null;

export function getPusherClient() {
  if (!pusherInstance) {
    pusherInstance = new PusherClient(key, { cluster: 'sa1' });
  }
  return pusherInstance;
}

// Unsubscribe on unmount
useEffect(() => {
  return () => {
    channel.unbind_all();
    channel.unsubscribe();
  };
}, []);
```

---

## 🧪 Testing Architecture

### **Manual Testing Checklist**

**Unit Tests (Component Level):**
```
✅ Event creation form validation
✅ Expense split calculation
✅ Poll vote counting
✅ Settlement summary logic
✅ Date/time formatting
```

**Integration Tests (Feature Level):**
```
✅ RSVP flow (create → update → view)
✅ Expense flow (add → split → settle)
✅ Poll flow (create → vote → close)
✅ Location flow (track → broadcast → update)
```

**End-to-End Tests (User Journey):**
```
✅ Create event → RSVP → View details
✅ Add expense → Calculate splits → Settle
✅ Create poll → Vote → See results
✅ Start tracking → See on map → Stop tracking
```

---

## 🎯 Deployment Architecture

### **Vercel Deployment**
```
Git Push
    ↓
Vercel Build
    ↓
Next.js SSR Functions
    ↓
Edge Network (CDN)
    ↓
User Receives Page
```

### **Database Migration**
```
Schema Changes (schema.ts)
    ↓
Generate Migration
    ↓
npx drizzle-kit push
    ↓
Apply to Neon Postgres
    ↓
Schema Updated
```

### **Environment Variables**
```
Vercel Project Settings
    ↓
Add Environment Variables:
  - DATABASE_URL (Neon)
  - PUSHER_* (Real-time)
  - FIREBASE_* (Auth)
    ↓
Automatic Deployment
```

---

## 📊 Monitoring & Observability

### **Key Metrics to Track**

**Application Metrics:**
```
- Event creation rate (events/day)
- RSVP conversion (% who respond)
- Location tracking sessions (active trackers)
- Expense volume (total amount split)
- Poll participation (average votes)
```

**Performance Metrics:**
```
- Page load time (< 2s target)
- Location update latency (< 100ms)
- Pusher message delivery (< 100ms)
- Database query time (< 50ms)
```

**Error Tracking:**
```
- Failed location updates
- Pusher connection errors
- Database query failures
- API rate limits (Unsplash, Open-Meteo)
```

---

## 🔮 Scalability Roadmap

### **Phase 1: Current (1-100 concurrent events)**
✅ Single Postgres instance  
✅ Pusher free tier  
✅ Serverless functions  

### **Phase 2: Growth (100-1000 events)**
- [ ] Database connection pooling
- [ ] Pusher paid tier (unlimited connections)
- [ ] Redis caching layer
- [ ] CDN for static assets

### **Phase 3: Scale (1000+ events)**
- [ ] Read replicas for database
- [ ] Horizontal scaling (multiple regions)
- [ ] Dedicated Pusher cluster
- [ ] GraphQL API for flexibility

---

**Architecture Status:** ✅ **PRODUCTION READY**

*Built for scale, optimized for performance, designed for growth.*
