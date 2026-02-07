-- 🔐 CRITICAL: Update Admin PIN
-- Run this SQL in Neon Console or Drizzle Studio after applying the migration

-- ============================================
-- STEP 1: Create Party with Join Code
-- ============================================

-- Insert Mohammed's Party with public join code 1696
INSERT INTO parties (name, join_code, is_active) 
VALUES ('Mohammed''s Party', '1696', TRUE)
ON CONFLICT (join_code) DO NOTHING;

-- Verify party was created
SELECT * FROM parties WHERE join_code = '1696';

-- ============================================
-- STEP 2: Update Admin PIN (⚠️ REQUIRED!)
-- ============================================

-- Update Mohammed's PIN to secret admin code
-- ⚠️ CHANGE 'Mohammed Parker' to your actual user name if different
UPDATE party_users 
SET 
  pin_code = '114477',    -- YOUR SECRET ADMIN PIN (change if you want)
  role = 'admin'          -- Ensure admin role is set
WHERE 
  name = 'Mohammed Parker'  -- Change this to your actual name
  OR name = 'Mohammed';     -- Or this variant

-- Verify admin was updated correctly
SELECT id, name, pin_code, role, wallet_balance 
FROM party_users 
WHERE role = 'admin';

-- ============================================
-- STEP 3: Clean Up Any Test Guests
-- ============================================

-- Optional: Remove any test guest accounts
-- DELETE FROM party_users WHERE name LIKE '%Test%' AND role = 'guest';

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check all users (should see admin with secret PIN, no duplicate 1696)
SELECT name, role, pin_code, wallet_balance, party_id 
FROM party_users 
ORDER BY role DESC, created_at;

-- Check parties (should see party with join_code 1696)
SELECT id, name, join_code, is_active 
FROM parties;

-- ============================================
-- EXPECTED RESULTS
-- ============================================

/*
✅ parties table should show:
   - name: "Mohammed's Party"
   - join_code: "1696"
   - is_active: true

✅ party_users table should show:
   - Your admin user with:
     * pin_code: "2026" (or your chosen secret)
     * role: "admin"
     * wallet_balance: 1000 (or more)
   
❌ NO user should have pin_code = "1696" anymore!
   That's now the PARTY code, not a user PIN!
*/

-- ============================================
-- TROUBLESHOOTING
-- ============================================

-- If you can't find your admin user:
-- SELECT * FROM party_users;

-- If party code isn't working:
-- SELECT * FROM parties;

-- If guests are getting admin access:
-- UPDATE party_users SET role = 'guest' WHERE role IS NULL OR role = '';
