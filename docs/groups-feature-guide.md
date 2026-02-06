# Groups Feature Guide

The Groups feature allows users to create collaborative spaces beyond family connections - perfect for friends planning trips, organizing events, or managing projects together.

## Overview

Groups provide:
- **Flexible membership** - Create groups with friends, not just family
- **Smart checklists** - Organize tasks by category (packing, to-do, shopping, etc.)
- **Collaborative recommendations** - Share and vote on places, activities, and restaurants
- **Event planning** - Set dates, locations, and manage group details

## Key Features

### 1. Create Groups
Users can create groups for different purposes:
- **Trips/Holidays** - Weekend getaways, vacations
- **Events** - Parties, gatherings, celebrations
- **Projects** - Collaborative work
- **Other** - Any group activity

Each group includes:
- Name and description
- Type and location
- Start and end dates
- Unique join code for invitations
- Member management

### 2. Checklists
Keep everyone organized with shared checklists:

**Categories:**
- 🎒 **Packing** - Items to bring
- ✓ **To Do** - Tasks to complete
- 🛒 **Shopping** - Items to buy
- 📝 **Other** - Miscellaneous items

**Features:**
- Priority levels (high, medium, low)
- Due dates
- Assigned members
- Completion tracking
- Category filtering

### 3. Recommendations
Share and discover ideas together:

**Types:**
- 🎯 **Activities** - Things to do
- 🍽️ **Restaurants** - Places to eat
- 🏨 **Accommodation** - Places to stay
- 🎡 **Attractions** - Sights to see
- 💡 **Other** - General suggestions

**Features:**
- Upvote/downvote system
- Price range indicators
- Location details
- Website links
- Personal notes and tips
- Sorted by popularity

## Usage

### Creating a Group

1. Navigate to **Dashboard > Groups**
2. Click the **Create** tab
3. Fill in group details:
   - Name (e.g., "Weekend Mountain Trip")
   - Type (Trip, Event, Project, Other)
   - Description
   - Location
   - Start and end dates
4. Click **Create Group**
5. Share the join code with friends

### Joining a Group

1. Get a join code from a friend
2. Navigate to **Dashboard > Groups**
3. Click the **Join** tab
4. Enter the join code
5. Click **Join Group**

### Managing Checklists

1. Open your group
2. Go to the **Checklist** tab
3. Click **Add Item**
4. Fill in details:
   - Title
   - Description (optional)
   - Category
   - Priority
   - Due date (optional)
5. Check off items as you complete them
6. Filter by category to focus on specific types

### Adding Recommendations

1. Open your group
2. Go to the **Recommendations** tab
3. Click **Add Recommendation**
4. Provide details:
   - Type
   - Title and description
   - Location
   - Price range
   - Website link
   - Additional notes
5. Group members can vote on recommendations
6. Recommendations are sorted by votes

## Firebase Data Structure

### Groups Collection
```typescript
{
  id: string;
  name: string;
  description: string;
  type: 'trip' | 'event' | 'project' | 'other';
  joinCode: string;
  creatorId: string;
  memberIds: string[];
  createdAt: Timestamp;
  startDate?: Timestamp;
  endDate?: Timestamp;
  location?: string;
  coverImage?: string;
}
```

### ChecklistItems Collection
```typescript
{
  id: string;
  groupId: string;
  title: string;
  description?: string;
  category: 'packing' | 'todo' | 'shopping' | 'other';
  completed: boolean;
  assignedTo?: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: Timestamp;
  createdBy: string;
  createdAt: Timestamp;
  completedAt?: Timestamp;
  completedBy?: string;
}
```

### Recommendations Collection
```typescript
{
  id: string;
  groupId: string;
  type: 'activity' | 'restaurant' | 'accommodation' | 'attraction' | 'other';
  title: string;
  description: string;
  location?: string;
  url?: string;
  imageUrl?: string;
  rating?: number;
  price?: '$' | '$$' | '$$$' | '$$$$';
  notes?: string;
  suggestedBy: string;
  votes: { userId: string; vote: 'up' | 'down' }[];
  createdAt: Timestamp;
}
```

## Components

### Created Components
- `CreateGroupForm.tsx` - Form to create new groups
- `JoinGroupForm.tsx` - Form to join existing groups
- `GroupCard.tsx` - Display group summary
- `ChecklistManager.tsx` - Manage group checklists
- `RecommendationsManager.tsx` - Manage group recommendations

### Pages
- `/dashboard/groups` - List all groups, create/join
- `/dashboard/groups/[id]` - Individual group detail page with tabs

## Integration

The groups feature integrates with:
- **Authentication** - Uses existing user profiles
- **Navigation** - Added to main header
- **Dashboard** - New card on main dashboard
- **Firebase** - Firestore collections for data storage

## Future Enhancements

Potential additions:
- Group chat/messaging
- File sharing
- Expense splitting
- Calendar integration
- Photo albums
- AI-powered recommendations based on location
- Template checklists (e.g., "Beach Trip", "Camping")
- Export checklist to PDF
- Push notifications for updates
- Group roles and permissions

## Notes

- Join codes are automatically generated and unique
- Groups are independent of family structures
- Users can be members of multiple groups
- Voting is private (users can't see who voted what)
- Only recommendation creators can delete their own recommendations
- Anyone in the group can complete checklist items
