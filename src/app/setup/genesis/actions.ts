'use server';

import { db } from '@/lib/db';
import { parties, partyUsers, globalSettings, systemLogs } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { ensurePartySchema } from '@/lib/db/ensure-party-schema';
import { ensureGlobalSettingsSchema } from '@/lib/db/ensure-global-settings-schema';
import { ensureSystemLogsSchema } from '@/lib/db/ensure-system-logs-schema';
import { ensurePartyUsersSchema } from '@/lib/db/ensure-party-users-schema';

interface InitializeParams {
  adminPin: string;
  partyJoinCode: string;
  hostName: string;
  partyName: string;
}

/**
 * Check if the system has already been initialized
 */
export async function checkSystemStatusAction() {
  try {
    await ensurePartySchema();
    await ensurePartyUsersSchema();
    await ensureGlobalSettingsSchema();
    await ensureSystemLogsSchema();
    const existingParties = await db.select().from(parties).limit(1);
    return {
      partyExists: existingParties.length > 0,
      success: true,
    };
  } catch (error) {
    console.error('Error checking system status:', error);
    return {
      partyExists: false,
      success: false,
      error: 'Failed to check system status',
    };
  }
}

/**
 * The "Big Bang" - Initialize the entire Party OS system
 * Creates admin user, party, and seeds all default settings
 * PIN is auto-generated - you're logged in automatically after creation!
 */
export async function initializeSystemAction(params: InitializeParams) {
  const { partyJoinCode, hostName, partyName } = params;
  
  // Auto-generate a random PIN (not needed for login since you're auto-logged in)
  const autoPin = Math.random().toString(36).substring(2, 10);

  try {
    await ensurePartySchema();
    await ensurePartyUsersSchema();
    // Validate inputs
    if (!hostName) {
      return { success: false, error: 'Host name is required' };
    }
    if (!partyName) {
      return { success: false, error: 'Party name is required' };
    }
    
    // Auto-generate join code if not provided, ensure it's unique
    let joinCode = partyJoinCode || '';
    
    // Generate a unique join code
    const generateUniqueCode = async (): Promise<string> => {
      for (let attempt = 0; attempt < 10; attempt++) {
        const code = Math.floor(10000 + Math.random() * 90000).toString(); // 5 digits
        const [existing] = await db.select().from(parties).where(eq(parties.joinCode, code));
        if (!existing) return code;
      }
      // Fallback: use timestamp-based code
      return Date.now().toString().slice(-6);
    };
    
    // If user provided a code, check if it exists
    if (joinCode) {
      const [existing] = await db.select().from(parties).where(eq(parties.joinCode, joinCode));
      if (existing) {
        // Code taken, generate a new one
        joinCode = await generateUniqueCode();
      }
    } else {
      joinCode = await generateUniqueCode();
    }

    // Create the party (no need to delete existing - just add new)
    const [party] = await db.insert(parties).values({
      name: partyName,
      joinCode: joinCode,
      isActive: true,
    }).returning();

    // Step 3: Create the admin user (PIN auto-generated, not needed for login)
    const [adminUser] = await db.insert(partyUsers).values({
      name: hostName,
      pinCode: autoPin,
      role: 'admin',
      walletBalance: 10000, // Admin gets bonus starting balance
      status: 'approved',
      partyId: party.id,
    }).returning();

    // Step 4: Update party with host ID
    await db.update(parties)
      .set({ hostId: adminUser.id })
      .where(eq(parties.id, party.id));

    // Step 5: Seed default settings
    await seedDefaultSettings();

    // Step 6: Log the initialization
    await ensureSystemLogsSchema();
    await db.insert(systemLogs).values({
      level: 'INFO',
      source: 'Genesis',
      message: `System initialized by ${hostName}`,
      metaData: { partyId: party.id, adminId: adminUser.id },
    });

    // Step 7: Set auth cookie for admin (use party_user_id for consistency)
    const cookieStore = await cookies();
    cookieStore.set('party_user_id', adminUser.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    return {
      success: true,
      partyId: party.id,
      adminId: adminUser.id,
      joinCode: joinCode, // Return the actual code used
    };
  } catch (error) {
    console.error('Error initializing system:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to initialize system',
    };
  }
}

/**
 * Seed all default settings for Party OS
 */
async function seedDefaultSettings() {
  const defaultSettings = [
    // 🕵️‍♂️ SPY GAME
    { key: 'spy_round_timer', value: '8', description: 'Timer duration in minutes for Spy Game rounds', category: 'game', inputType: 'NUMBER', label: 'Spy Round Timer (mins)' },
    { key: 'spy_imposter_count', value: '1', description: 'Number of imposters per game', category: 'game', inputType: 'NUMBER', label: 'Imposter Count' },
    { key: 'spy_chaos_enabled', value: 'true', description: 'Enable Chaos Mode random events', category: 'game', inputType: 'BOOLEAN', label: 'Chaos Mode Enabled' },
    { key: 'spy_chaos_interval', value: '3', description: 'Random events happen every X minutes', category: 'game', inputType: 'NUMBER', label: 'Chaos Interval (mins)' },
    { key: 'spy_allow_nudge', value: 'true', description: 'Admin can send hints to players', category: 'game', inputType: 'BOOLEAN', label: 'Allow Nudges' },
    { key: 'spy_vote_timeout', value: '60', description: 'Seconds allowed for voting', category: 'game', inputType: 'NUMBER', label: 'Vote Timeout (secs)' },

    // 🏎️ SIM RACING
    { key: 'race_points_first', value: '500', description: 'Points for 1st place', category: 'game', inputType: 'NUMBER', label: '1st Place Points' },
    { key: 'race_points_second', value: '250', description: 'Points for 2nd place', category: 'game', inputType: 'NUMBER', label: '2nd Place Points' },
    { key: 'race_points_third', value: '100', description: 'Points for 3rd place', category: 'game', inputType: 'NUMBER', label: '3rd Place Points' },
    { key: 'race_betting_multiplier', value: '2.0', description: 'Payout odds multiplier for bets', category: 'game', inputType: 'NUMBER', label: 'Betting Multiplier' },
    { key: 'race_betting_duration', value: '60', description: 'Seconds allowed for placing bets', category: 'game', inputType: 'NUMBER', label: 'Betting Duration (secs)' },
    { key: 'race_min_bet', value: '50', description: 'Minimum bet amount', category: 'game', inputType: 'NUMBER', label: 'Minimum Bet' },
    { key: 'race_max_bet', value: '5000', description: 'Maximum bet amount', category: 'game', inputType: 'NUMBER', label: 'Maximum Bet' },

    // 💰 ECONOMY
    { key: 'eco_welcome_bonus', value: '1000', description: 'Starting coins for new guests', category: 'economy', inputType: 'NUMBER', label: 'Welcome Bonus' },
    { key: 'eco_poverty_line', value: '50', description: 'Balance threshold for stimulus', category: 'economy', inputType: 'NUMBER', label: 'Poverty Line' },
    { key: 'eco_stimulus_check', value: '200', description: 'Auto-bonus when below poverty line', category: 'economy', inputType: 'NUMBER', label: 'Stimulus Check' },
    { key: 'eco_max_bet_cap', value: '5000', description: 'Maximum single bet limit', category: 'economy', inputType: 'NUMBER', label: 'Max Bet Cap' },
    { key: 'eco_daily_bonus', value: '100', description: 'Daily login bonus', category: 'economy', inputType: 'NUMBER', label: 'Daily Bonus' },

    // ⚙️ SYSTEM
    { key: 'sys_party_name', value: "Mohammed's 26th", description: 'Current party name', category: 'system', inputType: 'TEXT', label: 'Party Name' },
    { key: 'sys_maintenance_mode', value: 'false', description: 'Lock out all users except admin', category: 'system', inputType: 'BOOLEAN', label: 'Maintenance Mode' },
    { key: 'sys_max_party_size', value: '50', description: 'Maximum guests allowed', category: 'system', inputType: 'NUMBER', label: 'Max Party Size' },
    { key: 'sys_music_volume', value: '0.5', description: 'Default music volume (0-1)', category: 'system', inputType: 'NUMBER', label: 'Music Volume' },
    { key: 'sys_enable_confetti', value: 'true', description: 'Show confetti on wins', category: 'system', inputType: 'BOOLEAN', label: 'Enable Confetti' },
    { key: 'sys_enable_sounds', value: 'true', description: 'Enable sound effects', category: 'system', inputType: 'BOOLEAN', label: 'Enable Sounds' },
    { key: 'sys_session_timeout', value: '120', description: 'Auto-logout after X minutes idle', category: 'system', inputType: 'NUMBER', label: 'Session Timeout (mins)' },
  ];

  await ensureGlobalSettingsSchema();

  // Insert settings (upsert)
  for (const setting of defaultSettings) {
    try {
      await db.execute(sql`
        INSERT INTO global_settings (key, value, description, category, input_type, label)
        VALUES (${setting.key}, ${setting.value}, ${setting.description}, ${setting.category}, ${setting.inputType}, ${setting.label})
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
      `);
    } catch {
      // Try simpler insert without new columns
      await db.execute(sql`
        INSERT INTO global_settings (key, value, description, category)
        VALUES (${setting.key}, ${setting.value}, ${setting.description}, ${setting.category})
        ON CONFLICT (key) DO NOTHING
      `);
    }
  }
}

/**
 * Reset the party (keep admin, reset games and wallets)
 */
export async function resetPartyAction() {
  try {
    // Reset all guest wallets to welcome bonus
    const welcomeBonus = 1000;
    await db.execute(sql`
      UPDATE party_users 
      SET wallet_balance = ${welcomeBonus}
      WHERE role != 'admin'
    `);

    // Log the reset
    await db.insert(systemLogs).values({
      level: 'INFO',
      source: 'Admin',
      message: 'Party reset - wallets restored',
      metaData: { welcomeBonus },
    });

    return { success: true };
  } catch (error) {
    console.error('Error resetting party:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to reset party' 
    };
  }
}
