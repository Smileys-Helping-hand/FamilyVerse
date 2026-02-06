# 📚 Party Companion Documentation Index

## ⭐ NEW: Blackout Game Master System (February 2026)

### Quick Start - Blackout
1. **[BLACKOUT_INSTALLATION.md](./BLACKOUT_INSTALLATION.md)** ⭐ START HERE
   - 5-minute setup guide
   - Database migration steps
   - Admin dashboard access (PIN: 1234)

2. **[BLACKOUT_GAME_MASTER.md](./BLACKOUT_GAME_MASTER.md)** 📖 COMPLETE GUIDE
   - Full game rules & mechanics
   - Admin dashboard reference
   - QR code task system
   - Game Master workflow

3. **[BLACKOUT_SUMMARY.md](./BLACKOUT_SUMMARY.md)** 🎯 TECHNICAL OVERVIEW
   - Architecture & design decisions
   - Component breakdown
   - API reference
   - Extension points

---

## Overview

This is the complete implementation of a Next.js 14 event management and party companion app with AI-powered features plus the new **Blackout Game Master** system - a hybrid digital/physical escape room game. All code is production-ready, fully typed, and tested.

---

## 🗂️ Documentation Structure

### 1. Quick Start (15 min)
**File**: [QUICK_REFERENCE.md](QUICK_REFERENCE.md)
- ⚡ Fastest way to get started
- Essential commands
- Component usage examples
- Troubleshooting tips

**Best for**: Experienced developers who want to jump right in

---

### 2. Installation Guide (30 min)
**File**: [INSTALLATION_GUIDE.md](INSTALLATION_GUIDE.md)
- 📦 Step-by-step setup
- Environment configuration
- Database migration
- Verification steps

**Best for**: First-time setup, ensuring everything works

---

### 3. Complete Technical Documentation (2 hours)
**File**: [PARTY_COMPANION_README.md](PARTY_COMPANION_README.md)
- 🔧 Full API reference for all 4 modules
- Code examples and usage patterns
- Database schema explanations
- SQL query examples
- Production deployment guide

**Best for**: Understanding how everything works, customizing features

---

### 4. Implementation Summary
**File**: [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)
- ✅ What was built
- File structure overview
- Technology decisions
- Feature matrix
- Production readiness checklist

**Best for**: Project managers, stakeholders, code review

---

### 5. TypeScript Definitions
**File**: [src/types/party-companion.ts](src/types/party-companion.ts)
- 📘 All TypeScript types and interfaces
- Type guards and helpers
- Constants and enums
- Component prop types

**Best for**: TypeScript autocomplete, understanding data structures

---

## 📖 Learning Path

### For Developers New to the Project:
1. Start with **QUICK_REFERENCE.md** (get overview)
2. Follow **INSTALLATION_GUIDE.md** (set up)
3. Read **PARTY_COMPANION_README.md** Module 1 (try AI planning)
4. Explore other modules as needed
5. Reference **types/party-companion.ts** when coding

### For Project Leads:
1. Read **IMPLEMENTATION_SUMMARY.md** (understand scope)
2. Skim **PARTY_COMPANION_README.md** (see features)
3. Check **QUICK_REFERENCE.md** (quick lookup)

### For DevOps/Deployment:
1. Read **INSTALLATION_GUIDE.md** Section 2 (environment)
2. Check **PARTY_COMPANION_README.md** "Production" section
3. Review database migration file

---

## 🎯 By Use Case

### "I want to use the Leaderboard"
→ [PARTY_COMPANION_README.md](PARTY_COMPANION_README.md#module-2-universal-leaderboard-time-vs-points)
- Component: `LiveLeaderboard.tsx`
- Actions: `leaderboard.ts`
- Example usage included

### "I want to integrate AI planning"
→ [PARTY_COMPANION_README.md](PARTY_COMPANION_README.md#module-1-the-party-brain-context--assets)
- Component: None (backend only)
- Actions: `party-brain.ts`
- Prompt engineering tips included

### "I want to add the Imposter game"
→ [PARTY_COMPANION_README.md](PARTY_COMPANION_README.md#module-3-the-imposter-game-engine-real-time)
- Component: `ImposterDashboard.tsx`
- Actions: `imposter-game.ts`
- Game flow explained

### "I want receipt scanning"
→ [PARTY_COMPANION_README.md](PARTY_COMPANION_README.md#module-4-expense-intelligence-ocr)
- Component: `ExpenseScanner.tsx`
- Actions: `expenses.ts`
- OCR setup required

---

## 🗄️ Database Documentation

### Schema Reference
**Primary Source**: [src/lib/db/schema.ts](src/lib/db/schema.ts)
- Complete Drizzle schema definitions
- All relations defined
- Type exports

### Migration SQL
**File**: [drizzle/party-companion-migration.sql](drizzle/party-companion-migration.sql)
- Raw SQL for manual application
- Includes indexes and foreign keys
- Seed data examples

### Schema Explanation
**Section**: PARTY_COMPANION_README.md → "Database Schema Highlights"
- Design decisions explained
- JSONB usage rationale
- Indexing strategy

---

## 🎨 Component Documentation

### All Components Listed
**File**: [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md#-files-created)
- 6 React components created
- Props and usage examples
- Animation details

### Component Props Reference
**File**: [src/types/party-companion.ts](src/types/party-companion.ts)
- Interface definitions for all props
- Optional vs required props
- Event handler types

---

## 🔧 API Reference

### Server Actions Catalog
**Location**: `src/app/actions/`
- `party-brain.ts` - 4 actions
- `leaderboard.ts` - 6 actions
- `imposter-game.ts` - 8 actions
- `expenses.ts` - 6 actions

**Documentation**: Each action documented in [PARTY_COMPANION_README.md](PARTY_COMPANION_README.md)

### Response Types
All server actions return:
```typescript
ServerActionResponse<T> = 
  | { success: true; data: T }
  | { success: false; error: string }
```

---

## 🚀 Deployment Guides

### Development
**File**: [INSTALLATION_GUIDE.md](INSTALLATION_GUIDE.md#step-by-step-installation)
```powershell
npm install
npm run dev
```

### Production
**File**: [PARTY_COMPANION_README.md](PARTY_COMPANION_README.md#-next-steps) → "Production Enhancements"
- Environment variables checklist
- Build command
- Deployment platforms (Vercel, Netlify)

---

## 🧪 Testing & Examples

### Quick Tests
**File**: [QUICK_REFERENCE.md](QUICK_REFERENCE.md#-quick-test)
- 3 copy-paste test snippets
- Verify each module works

### Full Examples
**File**: [PARTY_COMPANION_README.md](PARTY_COMPANION_README.md#-quick-start-guide)
- Complete usage examples for all 4 modules
- Real code you can run

---

## 🎓 Learning Resources

### Understanding the Stack
- **Next.js 14**: Server Actions, RSC → [nextjs.org/docs](https://nextjs.org/docs)
- **Drizzle ORM**: [orm.drizzle.team](https://orm.drizzle.team)
- **Neon**: Serverless Postgres → [neon.tech/docs](https://neon.tech/docs)
- **Gemini AI**: [ai.google.dev](https://ai.google.dev)
- **Framer Motion**: Animations → [framer.com/motion](https://framer.com/motion)

### SQL Window Functions
**Explained in**: [PARTY_COMPANION_README.md](PARTY_COMPANION_README.md#-sql-query-examples)
- `RANK() OVER` usage
- `DISTINCT ON` for best scores
- Meta points calculation

---

## 🔍 Search Tips

### Find by Feature
- **AI features** → Search for "Gemini" or "generateContent"
- **Animations** → Search for "Framer Motion" or "motion."
- **Database** → Look in `schema.ts` or `.sql` files
- **UI Components** → Check `components/party/`

### Find by Error
- **Type errors** → Check `types/party-companion.ts`
- **Import errors** → Verify package.json dependencies
- **Database errors** → Check connection string in `.env.local`
- **API errors** → Console.log in server actions

---

## 📝 Cheat Sheets

### Commands
```powershell
npm install                    # Install dependencies
npm run dev                    # Start dev server
npm run typecheck              # Check TypeScript
npm run db:generate            # Generate migrations
```

### File Naming Convention
- `*.ts` - Server actions, utilities
- `*.tsx` - React components
- `schema.ts` - Database definitions
- `*.sql` - Raw SQL migrations

### Import Paths
```typescript
'@/lib/db'                     // Database client
'@/lib/db/schema'              // Tables & types
'@/app/actions/*'              // Server actions
'@/components/party/*'         // UI components
'@/types/party-companion'      // Type definitions
```

---

## 🆘 Support Matrix

| Issue | Documentation | Location |
|-------|--------------|----------|
| Installation failing | INSTALLATION_GUIDE.md | Section "Troubleshooting" |
| Type error | party-companion.ts | Full type definitions |
| Database error | PARTY_COMPANION_README.md | "Database Connection Issues" |
| API not working | PARTY_COMPANION_README.md | Module-specific sections |
| Component not rendering | QUICK_REFERENCE.md | "Components Usage" |

---

## ✅ Documentation Quality

- ✅ **Complete**: All features documented
- ✅ **Tested**: Examples are copy-paste ready
- ✅ **Layered**: Quick ref → Full docs → Source code
- ✅ **Searchable**: Keywords, headings, code blocks
- ✅ **Updated**: Matches current implementation

---

## 🎯 Next Actions

### After Reading This Index:
1. **Choose your path** (Developer/Lead/DevOps)
2. **Follow the learning path** above
3. **Bookmark relevant files** for quick access
4. **Test one module** to verify setup
5. **Customize** for your needs

---

## 📌 Quick Links

- [Quick Reference](QUICK_REFERENCE.md) ⚡
- [Installation Guide](INSTALLATION_GUIDE.md) 📦
- [Full Documentation](PARTY_COMPANION_README.md) 📚
- [Implementation Summary](IMPLEMENTATION_SUMMARY.md) ✅
- [TypeScript Types](src/types/party-companion.ts) 📘

---

## 📞 Getting Help

1. **Check the docs** (you're here!)
2. **Read error messages** carefully
3. **Search documentation** for keywords
4. **Check TypeScript types** for API details
5. **Review examples** in README files

---

**Last Updated**: February 2026  
**Version**: 1.0.0  
**Status**: Production Ready ✅

---

Happy coding! 🎉 Start with [QUICK_REFERENCE.md](QUICK_REFERENCE.md) to get up and running in 15 minutes.
