# Scannables System - Installation Checklist

## ✅ Pre-Installation

- [ ] Neon PostgreSQL database running
- [ ] Drizzle ORM configured (v0.45.1+)
- [ ] `qrcode` package installed: `npm install qrcode @types/qrcode`
- [ ] `framer-motion` installed: `npm install framer-motion@12.30.0`

## ✅ Database Setup

- [ ] Run migration: `psql $DATABASE_URL -f drizzle/scannables-migration.sql`
- [ ] Verify tables created:
  ```sql
  SELECT table_name FROM information_schema.tables 
  WHERE table_name IN ('scannables', 'scannable_scans', 'detective_notebook');
  ```
- [ ] Check indexes created:
  ```sql
  SELECT indexname FROM pg_indexes 
  WHERE tablename = 'scannables';
  ```

## ✅ Schema Updates

- [ ] File: `src/lib/db/schema.ts`
  - [ ] Added `scannables` table definition
  - [ ] Added `scannableScans` table definition
  - [ ] Added `detectiveNotebook` table definition
  - [ ] Added `scannablesRelations`
  - [ ] Added `scannableScansRelations`
  - [ ] Added `detectiveNotebookRelations`
  - [ ] Added Module 6 types (Scannable, NewScannable, etc.)

## ✅ Server Actions

- [ ] File: `src/app/actions/scannables.ts` created
  - [ ] `createScannable()` - Generate QR with UUID
  - [ ] `getAllScannables()` - List by type
  - [ ] `updateScannableContent()` - Live editing
  - [ ] `toggleScannableActive()` - Enable/disable
  - [ ] `deleteScannable()` - Remove scannable
  - [ ] `scanScannable()` - Record scan with order validation
  - [ ] `getTreasureChainProgress()` - Check completion
  - [ ] `addToDetectiveNotebook()` - Collect evidence
  - [ ] `getDetectiveNotebook()` - View evidence
  - [ ] `updateDetectiveNotes()` - Edit notes

## ✅ UI Components

- [ ] File: `src/components/game-master/ScannableManager.tsx` created
  - [ ] Tab interface (Tasks / Treasure Hunt / Evidence)
  - [ ] Create form with type-specific fields
  - [ ] Inline content editing
  - [ ] Active/inactive toggle
  - [ ] Download individual QR codes
  
- [ ] File: `src/components/game-master/PrintManager.tsx` created
  - [ ] A4 layout (3×4 grid)
  - [ ] Label layout (62mm width)
  - [ ] Print button with @media print CSS
  - [ ] Download all button
  
- [ ] File: `src/app/game/scannable/[scannable_id]/page.tsx` created
  - [ ] Treasure hunt order validation UI
  - [ ] Solution code input form
  - [ ] Type-specific success screens
  - [ ] Auto-add evidence to notebook
  
- [ ] File: `src/app/game/notebook/page.tsx` created
  - [ ] Evidence list with details
  - [ ] Inline note editing
  - [ ] Chronological sorting
  - [ ] Back to dashboard button

## ✅ Admin Dashboard Integration

- [ ] File: `src/app/admin/dashboard/page.tsx` updated
  - [ ] Imported `ScannableManager` component
  - [ ] Imported `PrintManager` component
  - [ ] Added "Scannables" tab
  - [ ] Added "Print" tab
  - [ ] Updated TabsList to 6 columns

## ✅ Environment Variables

- [ ] `.env.local` file configured:
  ```bash
  DATABASE_URL="postgresql://..."
  NEXT_PUBLIC_APP_URL="http://localhost:3000"  # or production URL
  ADMIN_PIN="1234"  # Change in production!
  ```

## ✅ Documentation

- [ ] File: `SCANNABLES_GUIDE.md` created
- [ ] File: `drizzle/scannables-migration.sql` created
- [ ] File: `SCANNABLES_CHECKLIST.md` created (this file)

## ✅ Testing

### Unit Tests
- [ ] Create scannable (all 3 types)
- [ ] Update scannable content (live editing)
- [ ] Toggle active/inactive
- [ ] Delete scannable
- [ ] Scan scannable (record in database)
- [ ] Treasure hunt order validation
- [ ] Add to detective notebook
- [ ] Update detective notes

### Integration Tests
- [ ] Admin dashboard loads
- [ ] Scannables tab shows create form
- [ ] Create TASK → QR downloads
- [ ] Create TREASURE_NODE with chain
- [ ] Create KILLER_EVIDENCE (blank)
- [ ] Edit evidence content inline
- [ ] Print manager generates layout
- [ ] Player scans QR → sees content
- [ ] Out-of-order treasure hunt shows locked screen
- [ ] Solution code validation works
- [ ] Detective notebook collects evidence

### End-to-End Test
- [ ] **Scenario 1: Simple Task**
  1. Create task in admin dashboard
  2. Download QR code
  3. Scan with phone camera
  4. Verify task content displays
  5. Check database for scan record

- [ ] **Scenario 2: Treasure Hunt**
  1. Create 3-step chain (same chain_id)
  2. Print QR codes
  3. Scan step 2 first → verify locked
  4. Scan step 1 → verify unlocked
  5. Scan step 2 → verify unlocked
  6. Scan step 3 → verify winner screen

- [ ] **Scenario 3: Live Editing**
  1. Create blank evidence
  2. Print QR code
  3. Scan → verify empty content
  4. Edit in admin dashboard
  5. Scan again → verify updated content
  6. Check detective notebook has entry

## ✅ Print Testing

- [ ] **A4 Layout**
  - [ ] Print preview shows 3×4 grid
  - [ ] QR codes are readable (min 4cm × 4cm)
  - [ ] Labels and badges visible
  - [ ] Page breaks correctly
  
- [ ] **Label Layout**
  - [ ] Print preview shows single column
  - [ ] Width fits 62mm tape
  - [ ] QR code centered
  - [ ] Each label on separate page
  - [ ] Compatible with Brother P-Touch/Dymo

## ✅ Production Checklist

Before deploying to production:

- [ ] Change `ADMIN_PIN` from "1234" to secure value
- [ ] Set `NEXT_PUBLIC_APP_URL` to production domain
- [ ] Enable HTTPS for QR code URLs
- [ ] Test QR codes from multiple phone cameras
- [ ] Verify database backups configured
- [ ] Test print layouts on actual hardware
- [ ] Rate limit scan endpoints (prevent spam)
- [ ] Add error tracking (Sentry, etc.)
- [ ] Monitor database performance
- [ ] Create admin user documentation

## ✅ Optional Enhancements

- [ ] Add webhook for scan notifications
- [ ] Implement real-time dashboard updates
- [ ] Add QR code customization (colors, logos)
- [ ] Create scannable templates library
- [ ] Add analytics dashboard (scan heatmap)
- [ ] Export detective notebook to PDF
- [ ] Multi-language support
- [ ] Voice narration for clues (TTS)
- [ ] Photo upload evidence
- [ ] Team competition mode

---

## 🚀 Quick Start Commands

```bash
# Install dependencies
npm install qrcode @types/qrcode framer-motion

# Run database migration
psql $DATABASE_URL -f drizzle/scannables-migration.sql

# Start development server
npm run dev

# Open admin dashboard
open http://localhost:3000/admin/dashboard

# Enter PIN: 1234
# Navigate to "Scannables" tab
# Create your first scannable!
```

---

## 📊 Verification Queries

```sql
-- Check if tables exist
SELECT COUNT(*) FROM scannables;  -- Should return 0 (empty)
SELECT COUNT(*) FROM scannable_scans;  -- Should return 0
SELECT COUNT(*) FROM detective_notebook;  -- Should return 0

-- Create test scannable
INSERT INTO scannables (event_id, type, label, content, qr_code_data)
VALUES ('test-event', 'TASK', 'Test Task', 'Test content', 'data:image/png;base64,test');

-- Verify created
SELECT * FROM scannables WHERE event_id = 'test-event';

-- Clean up test
DELETE FROM scannables WHERE event_id = 'test-event';
```

---

## 🐛 Common Issues

### Issue: QR codes not generating
**Fix**: `npm install qrcode @types/qrcode`

### Issue: Database tables not found
**Fix**: Run `drizzle/scannables-migration.sql`

### Issue: Treasure hunt always unlocks
**Fix**: Verify all nodes have same `chain_id`

### Issue: Print layout broken
**Fix**: Enable "Background Graphics" in print dialog

### Issue: Admin dashboard 404
**Fix**: Verify file at `src/app/admin/dashboard/page.tsx`

### Issue: Framer Motion animations not working
**Fix**: `npm install framer-motion@12.30.0`

---

## ✅ Sign-Off

Once all items checked:

- [ ] System tested end-to-end
- [ ] Documentation reviewed
- [ ] Ready for Sunday event! 🎉

**Installation completed by**: _______________  
**Date**: _______________  
**Notes**: _______________
