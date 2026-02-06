# Scannables System - Quick Installation Script

## 🚀 Run These Commands

```bash
# Step 1: Install required packages
npm install qrcode @types/qrcode

# Step 2: Run database migration
# Option A: Using psql command line
psql "postgresql://neondb_owner:npg_lCB8qhoisV0p@ep-lucky-surf-a8bwawn5t-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require" -f drizzle/scannables-migration.sql

# Option B: Using Drizzle Kit
npx drizzle-kit push:pg

# Step 3: Verify installation
npm run dev

# Step 4: Test admin dashboard
# Open: http://localhost:3000/admin/dashboard
# PIN: 1234
```

---

## ✅ Verification Checklist

After running the above commands, verify:

- [ ] **Packages installed**: Check `package.json` has `qrcode` and `@types/qrcode`
- [ ] **Database tables created**: Run this query:
  ```sql
  SELECT table_name FROM information_schema.tables 
  WHERE table_name IN ('scannables', 'scannable_scans', 'detective_notebook');
  ```
  Should return 3 rows.

- [ ] **Dev server running**: `npm run dev` starts without errors

- [ ] **Admin dashboard accessible**: http://localhost:3000/admin/dashboard loads

- [ ] **Scannables tab exists**: See 6 tabs (Config, Content, Tasks, Scannables, Print, Players)

- [ ] **No TypeScript errors**: All files compile successfully

---

## 🎯 Quick Test (5 Minutes)

### Test 1: Create a Task
1. Go to Admin Dashboard → Scannables tab
2. Select "Tasks" type
3. Label: "Test Task #1"
4. Content: "This is a test task"
5. Reward: 10 points
6. Click "Create & Download QR"
7. ✅ QR code PNG downloads

### Test 2: Scan the Task
1. Open the downloaded PNG
2. Use phone camera to scan QR code
3. Should open: `http://localhost:3000/game/scannable/[uuid]`
4. ✅ See task content and success screen

### Test 3: Create Treasure Hunt
1. Go to Scannables → Treasure Hunt tab
2. Create Step 1:
   - Label: "Clue #1"
   - Content: "Find the next clue in the kitchen"
   - Chain ID: "test-hunt"
   - Step: 1
3. Create Step 2:
   - Label: "Clue #2"
   - Content: "You found the treasure!"
   - Chain ID: "test-hunt"
   - Step: 2
4. ✅ Both QR codes download

### Test 4: Test Order Validation
1. Scan Step 2 QR code first
2. ✅ Should show "Locked Clue!" message
3. Scan Step 1 QR code
4. ✅ Should show clue content
5. Scan Step 2 QR code again
6. ✅ Should now show content and winner screen

### Test 5: Live Editing
1. Create evidence scannable:
   - Label: "Evidence #1"
   - Content: "" (leave blank)
2. Download QR code
3. Scan QR code → ✅ Shows empty content
4. In admin dashboard, click Edit on "Evidence #1"
5. Update content: "The killer wore red shoes"
6. Click Save
7. Scan QR code again → ✅ Shows updated content

### Test 6: Print Manager
1. Go to Print tab
2. ✅ See all created scannables listed
3. Select "A4 Sheet" layout
4. Click "Print Sheet"
5. ✅ Print preview shows 3×4 grid
6. Select "Label Printer" layout
7. ✅ Print preview shows single column, 62mm width

---

## 🐛 Troubleshooting

### Error: "Cannot find module 'qrcode'"
**Fix**: 
```bash
npm install qrcode @types/qrcode
```

### Error: "relation 'scannables' does not exist"
**Fix**:
```bash
psql $DATABASE_URL -f drizzle/scannables-migration.sql
```

### Error: "TypeScript error in scannables.ts"
**Fix**: All TypeScript errors should be resolved. If you see any:
1. Check that schema.ts has been updated
2. Restart TypeScript server: Cmd+Shift+P → "Restart TS Server"
3. Clear build cache: `rm -rf .next && npm run dev`

### Error: "QR code won't scan"
**Fix**: 
- Ensure QR code is at least 2cm × 2cm when printed
- Test with QR scanner app (not just camera)
- Check printer quality settings
- Regenerate QR code if image corrupted

### Error: "Print layout is broken"
**Fix**:
- Enable "Background Graphics" in print dialog
- Set margins to default (not "None")
- Set scale to 100%
- Select correct paper size (A4 or custom for labels)

---

## 📊 Database Quick Reference

### Check Table Exists
```sql
\dt scannables
\dt scannable_scans
\dt detective_notebook
```

### View All Scannables
```sql
SELECT id, type, label, is_active 
FROM scannables 
ORDER BY created_at DESC;
```

### Check Scans
```sql
SELECT 
  s.label,
  ss.user_id,
  ss.is_correct_order,
  ss.scanned_at
FROM scannable_scans ss
JOIN scannables s ON ss.scannable_id = s.id
ORDER BY ss.scanned_at DESC
LIMIT 10;
```

### View Detective Notebooks
```sql
SELECT 
  dn.user_id,
  s.label AS evidence,
  dn.notes,
  dn.added_at
FROM detective_notebook dn
JOIN scannables s ON dn.evidence_id = s.id
ORDER BY dn.added_at DESC;
```

---

## 🎉 You're All Set!

If all checks pass, the scannables system is ready to use!

**Next Steps**:
1. Create scannables for your Sunday event
2. Print QR codes using Print Manager
3. Place around venue
4. During party: Edit evidence content live
5. Players scan and solve mystery!

**Documentation**:
- Complete Guide: `SCANNABLES_GUIDE.md`
- Installation Checklist: `SCANNABLES_CHECKLIST.md`
- This File: `SCANNABLES_INSTALL.md`

**Support**:
- Check troubleshooting sections in documentation
- Review server action logs for errors
- Test with simple task before complex treasure hunt

Happy scanning! 🎊
