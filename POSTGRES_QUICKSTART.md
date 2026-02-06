# 🚀 Quick Start: Neon Postgres Setup

## 1. Create Neon Account
→ Go to [console.neon.tech](https://console.neon.tech)
→ Sign up (free tier available)

## 2. Create Database
→ Click "New Project"
→ Name it "FamilyVerse" or similar
→ Copy the connection string

## 3. Set Environment Variable
Create `.env.local` in project root:
```env
DATABASE_URL=postgresql://[user]:[password]@[host]/[database]?sslmode=require
```

## 4. Run Migration
Open Neon SQL Editor and paste the contents of `drizzle/migration.sql`, then execute.

OR use CLI:
```bash
npm run db:push
```

## 5. Verify
```bash
npm run db:studio
```

You should see 3 tables:
- ✅ groups
- ✅ checklist_items
- ✅ recommendations

## 6. Start Development
```bash
npm run dev
```

## 🎉 Done!
The Groups feature is now connected to Postgres.

## Need Help?
See detailed guide: [docs/neon-postgres-setup.md](docs/neon-postgres-setup.md)
