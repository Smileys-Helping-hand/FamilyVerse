# Groups Feature - Quick Start Guide

## What's New? 🎉

FamilyVerse now supports **Groups** - a powerful feature that lets you create collaborative spaces with friends (not just family) for trips, events, and projects!

## Perfect For:
- 🏔️ Weekend trips with friends
- 🎉 Party planning
- 🏖️ Holiday coordination
- 🎯 Group projects
- 👥 Any collaborative activity

## Main Features

### 1. Create Groups
- Choose group type: Trip, Event, Project, or Other
- Set location and dates
- Get a unique join code to share
- Invite unlimited members

### 2. Smart Checklists
Never forget anything again! Create categorized lists:
- 🎒 **Packing** - What to bring
- ✓ **To Do** - Tasks to complete
- 🛒 **Shopping** - Items to buy
- 📝 **Other** - Anything else

Each item can have:
- Priority level (high/medium/low)
- Due date
- Assigned member
- Completion status

### 3. Collaborative Recommendations
Share and vote on ideas:
- 🎯 Activities
- 🍽️ Restaurants
- 🏨 Accommodation
- 🎡 Attractions

Everyone can upvote/downvote, and recommendations are automatically sorted by popularity!

## How to Use

### Create Your First Group
1. Go to **Dashboard** → Click **"Groups"** card
2. Click the **"Create"** tab
3. Fill in:
   - Group name (e.g., "Weekend Mountain Trip")
   - Type (Trip)
   - Description
   - Location (e.g., "Lake District, UK")
   - Start/End dates
4. Click **"Create Group"**
5. Share the join code with your friends!

### Join a Group
1. Get a join code from a friend
2. Go to **Dashboard** → **"Groups"**
3. Click the **"Join"** tab
4. Enter the join code
5. Click **"Join Group"** - You're in!

### Add Checklist Items
1. Open your group
2. Go to **"Checklist"** tab
3. Click **"Add Item"**
4. Fill in:
   - Title (e.g., "Pack hiking boots")
   - Category (Packing)
   - Priority (High)
   - Optional: Due date, description
5. Check items off as you complete them!

### Share Recommendations
1. Open your group
2. Go to **"Recommendations"** tab
3. Click **"Add Recommendation"**
4. Fill in:
   - Type (e.g., Restaurant)
   - Title (e.g., "Mountain View Cafe")
   - Description, location, price range
   - Website link, notes
5. Vote on others' recommendations!

## Navigation

The Groups feature is accessible from:
- **Header** - "Groups" button in main navigation
- **Dashboard** - Blue "Groups" card

## Tips & Tricks

### Checklists
- Use filters to view specific categories
- Assign items to members to split work
- Set due dates for time-sensitive tasks
- Mark items complete as you go

### Recommendations
- Be detailed in descriptions
- Add website links for easy access
- Include personal tips in the notes field
- Use voting to decide as a group

### Groups
- Create separate groups for different trips/events
- Use descriptive names
- Keep join codes secure
- Update dates as plans change

## Example Use Case: Weekend Trip

1. **Create Group**: "Lake District Weekend"
2. **Add to Checklist**:
   - Packing: Hiking boots, Waterproof jacket, Camera
   - Shopping: Trail snacks, Water bottles
   - To Do: Book accommodation, Plan route, Check weather
3. **Add Recommendations**:
   - Restaurant: "The Mountain View Cafe" (Breakfast spot)
   - Activity: "Scafell Pike Summit" (Highest peak in England)
   - Attraction: "Windermere Lake Cruise"
4. **Invite Friends**: Share join code
5. **Collaborate**: Everyone votes on recommendations and checks off tasks
6. **Have Fun!**: Everything is organized and nothing forgotten!

## Firebase Setup (For Developers)

The feature uses **Neon Postgres** instead of Firestore for better relational data handling.

### Database Setup

1. **Create a Neon Account**: Go to [console.neon.tech](https://console.neon.tech)
2. **Create a Project**: Set up a new Postgres database
3. **Get Connection String**: Copy your DATABASE_URL
4. **Configure Environment**:
   ```bash
   # Create .env.local file
   DATABASE_URL=postgresql://user:password@host/database?sslmode=require
   ```

5. **Run Migration**: Execute the SQL in `drizzle/migration.sql`
   - Option A: Use Neon SQL Editor
   - Option B: Run `npm run db:push`
   - Option C: Use `psql $DATABASE_URL -f drizzle/migration.sql`

### Database Schema

Three main tables:
- **groups** - Group information (id, name, type, join_code, member_ids, dates)
- **checklist_items** - Tasks and to-dos (id, group_id, title, category, priority, completed)
- **recommendations** - Suggestions with voting (id, group_id, type, title, votes)

All use PostgreSQL with proper foreign keys and cascade deletes.

See [neon-postgres-setup.md](docs/neon-postgres-setup.md) for detailed setup instructions.

## What's Next?

Future enhancements could include:
- Group chat
- File sharing
- Expense splitting
- Calendar sync
- Photo albums
- AI-powered suggestions
- Template checklists
- Export to PDF

## Need Help?

Check out the detailed guides:
- **User Guide**: `docs/groups-feature-guide.md`
- **Implementation Details**: `GROUPS_FEATURE_SUMMARY.md`

## Enjoy Planning Together! 🎉

The Groups feature makes it easy to coordinate with friends, stay organized, and never forget important details. Create your first group today!
