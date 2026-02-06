-- ============================================
-- QUICK SETUP SCRIPT - RUN THESE IN ORDER
-- ============================================

-- ============================================
-- 1. RUN THE FULL MIGRATION
-- ============================================
-- (Copy from party-security-fix-migration.sql or run the file directly)

-- ============================================
-- 2. SET YOUR ADMIN PIN (REQUIRED!)
-- ============================================
-- ⚠️ IMPORTANT: Change '2026' to your secret PIN
-- ⚠️ IMPORTANT: Change 'Mohammed' to your actual name in the database

UPDATE party_users 
SET pin_code = '2026',  -- ← CHANGE THIS to your secret PIN
    role = 'admin' 
WHERE name ILIKE '%mohammed%';  -- ← Adjust if needed

-- Verify it worked:
SELECT id, name, pin_code, role, status 
FROM party_users 
WHERE role = 'admin';

-- ============================================
-- 3. VERIFY YOUR PARTY EXISTS
-- ============================================
SELECT * FROM parties WHERE join_code = '1696';

-- If nothing returned, create it manually:
INSERT INTO parties (name, join_code, is_active) 
VALUES ('Mohammed''s Party', '1696', TRUE);

-- ============================================
-- 4. CLEAN UP OLD DATA (OPTIONAL)
-- ============================================
-- Remove any old test guests if needed:
-- DELETE FROM party_users WHERE role = 'guest' AND name ILIKE '%test%';

-- ============================================
-- 5. QUICK VERIFICATION QUERIES
-- ============================================

-- Check all users and their roles:
SELECT name, pin_code, role, status, wallet_balance 
FROM party_users 
ORDER BY role DESC, created_at DESC;

-- Check active parties:
SELECT name, join_code, is_active, created_at 
FROM parties 
WHERE is_active = TRUE;

-- Count users by role:
SELECT role, COUNT(*) as count, SUM(wallet_balance) as total_coins
FROM party_users 
GROUP BY role;

-- ============================================
-- TROUBLESHOOTING QUERIES
-- ============================================

-- If guests are pending, approve them all:
UPDATE party_users 
SET status = 'approved' 
WHERE role = 'guest' AND status = 'pending';

-- If you forgot your PIN, reset it:
UPDATE party_users 
SET pin_code = 'admin-2026'  -- ← Your new PIN
WHERE name = 'Mohammed Parker';

-- If a guest got admin access somehow, fix it:
UPDATE party_users 
SET role = 'guest', 
    pin_code = NULL 
WHERE role = 'admin' AND name != 'Mohammed Parker';

-- ============================================
-- SUCCESS! 🎉
-- ============================================
-- Your party is now secure!
-- - Party Join Code: 1696 (PUBLIC - for guests)
-- - Your Admin PIN: [whatever you set] (SECRET - only you!)
-- ============================================
