# Neon Postgres Migration Guide

## Setup Instructions

### 1. Create a Neon Database
1. Go to [Neon Console](https://console.neon.tech)
2. Create a new project
3. Copy the connection string

### 2. Configure Environment Variables
Create a `.env.local` file in the project root:
```env
DATABASE_URL=postgresql://[user]:[password]@[host]/[database]?sslmode=require
```

### 3. Run the Migration
Execute the SQL migration file to create the tables:

**Option A: Using Neon Console**
1. Open your Neon project dashboard
2. Go to SQL Editor
3. Copy and paste the contents of `drizzle/migration.sql`
4. Run the query

**Option B: Using Drizzle Kit**
```bash
npm run db:push
```

**Option C: Using psql**
```bash
psql $DATABASE_URL -f drizzle/migration.sql
```

### 4. Verify Tables
Run this query in Neon SQL Editor to verify tables were created:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

You should see:
- `groups`
- `checklist_items`
- `recommendations`

## Database Schema

### Groups Table
Stores group information for trips, events, and projects.
- Primary Key: `id` (serial)
- Unique: `join_code`
- JSONB: `member_ids` (array of user IDs)

### Checklist Items Table
Stores tasks and to-dos for each group.
- Foreign Key: `group_id` → `groups(id)` CASCADE DELETE
- Categories: packing, todo, shopping, other
- Priorities: low, medium, high

### Recommendations Table
Stores suggestions with voting for group activities.
- Foreign Key: `group_id` → `groups(id)` CASCADE DELETE
- Types: activity, restaurant, accommodation, attraction, other
- JSONB: `votes` (array of {userId, vote})

## Indexes
Indexes are automatically created for:
- `groups.creator_id`
- `groups.join_code`
- `groups.member_ids` (GIN index for JSONB array contains)
- `checklist_items.group_id`
- `checklist_items.created_by`
- `recommendations.group_id`
- `recommendations.suggested_by`

## Testing the Database

### 1. Create a Test Group
```sql
INSERT INTO groups (name, description, type, join_code, creator_id, member_ids)
VALUES (
  'Test Trip',
  'A test group',
  'trip',
  'TEST123',
  'user1',
  '["user1"]'::jsonb
)
RETURNING *;
```

### 2. Add a Checklist Item
```sql
INSERT INTO checklist_items (group_id, title, category, priority, created_by)
VALUES (
  1, -- Replace with your group_id
  'Pack sunscreen',
  'packing',
  'high',
  'user1'
)
RETURNING *;
```

### 3. Add a Recommendation
```sql
INSERT INTO recommendations (group_id, type, title, description, suggested_by)
VALUES (
  1, -- Replace with your group_id
  'restaurant',
  'Mountain View Cafe',
  'Great breakfast spot',
  'user1'
)
RETURNING *;
```

### 4. Query Groups by Member
```sql
SELECT * FROM groups 
WHERE member_ids @> '["user1"]'::jsonb;
```

## Drizzle Kit Commands

Add these scripts to your `package.json`:
```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio"
  }
}
```

Then run:
- `npm run db:generate` - Generate migration files
- `npm run db:push` - Push schema to database
- `npm run db:studio` - Open Drizzle Studio (database GUI)

## Troubleshooting

### Connection Issues
- Verify `DATABASE_URL` is correct
- Check that `?sslmode=require` is appended
- Ensure your IP is allowed in Neon project settings

### JSONB Queries
To check if a user is in `member_ids`:
```sql
WHERE member_ids @> '["user_id_here"]'::jsonb
```

To add a member:
```sql
UPDATE groups 
SET member_ids = member_ids || '["new_user_id"]'::jsonb
WHERE id = 1;
```

### Schema Updates
If you modify `src/lib/db/schema.ts`:
1. Run `npm run db:generate` to create migration
2. Run `npm run db:push` to apply changes

## Production Considerations

1. **Connection Pooling**: Neon serverless driver handles this automatically
2. **Environment Variables**: Never commit `.env.local` to git
3. **Migrations**: Use Drizzle Kit for schema changes
4. **Backups**: Configure automatic backups in Neon dashboard
5. **Monitoring**: Use Neon's built-in monitoring for query performance

## Next Steps

Once the database is set up:
1. Update the components to fetch real data from Postgres
2. Implement user authentication integration
3. Add real-time updates (optional)
4. Set up row-level security if needed
