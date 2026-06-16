// ============================================
// WEB PUSH SUBSCRIPTIONS
// ============================================

export const pushSubscriptions = pgTable('push_subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(),
  endpoint: text('endpoint').notNull(),
  p256dh: text('p256dh').notNull(),
  auth: text('auth').notNull(),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
// ============================================
// NOTIFICATION CENTER
// ============================================

export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  type: varchar('type', { length: 30 }).notNull(), // e.g., 'GEAR_ASSIGNED', 'EXPENSE_ADDED', 'GAME_INVITE'
  read: boolean('read').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
import { pgTable, text, timestamp, boolean, integer, jsonb, varchar, serial, bigint, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============================================
// MODULE -1: USER & FAMILY MANAGEMENT
// ============================================

// Users table
export const users = pgTable('users', {
  uid: text('uid').primaryKey(), // Firebase Auth UID
  email: text('email').notNull(),
  name: text('name'),
  familyId: text('family_id'),
  familyName: text('family_name'),
  role: varchar('role', { length: 20 }), // 'admin', 'member'
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Friends table (Cross-app integration)
export const friends = pgTable('friends', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => users.uid, { onDelete: 'cascade' }),
  friendName: text('friend_name').notNull(),
  friendEmail: text('friend_email'),
  avatarEmoji: varchar('avatar_emoji', { length: 10 }).default('😎'),
  apiKey: text('api_key'), // Maps to external app API keys
  externalAppUrl: text('external_app_url'), // e.g. "https://awehchat.co.za"
  status: varchar('status', { length: 20 }).notNull().default('ACTIVE'), // 'ACTIVE', 'PENDING'
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Families table
export const families = pgTable('families', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  creatorId: text('creator_id').notNull(),
  joinCode: varchar('join_code', { length: 10 }).notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Family members table
export const familyMembers = pgTable('family_members', {
  id: serial('id').primaryKey(),
  familyId: text('family_id').notNull().references(() => families.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull(),
  name: text('name').notNull(),
  role: varchar('role', { length: 20 }).notNull().default('member'), // 'admin', 'member'
  gender: varchar('gender', { length: 20 }),
  birthDate: timestamp('birth_date'),
  deathDate: timestamp('death_date'),
  photoUrl: text('photo_url'),
  parents: jsonb('parents').$type<string[]>().notNull().default([]),
  spouses: jsonb('spouses').$type<string[]>().notNull().default([]),
  children: jsonb('children').$type<string[]>().notNull().default([]),
  addedBy: text('added_by').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Activity log table
export const activityLog = pgTable('activity_log', {
  id: serial('id').primaryKey(),
  familyId: text('family_id').notNull().references(() => families.id, { onDelete: 'cascade' }),
  user: text('user').notNull(), // User's name or email
  action: text('action').notNull(),
  details: text('details').notNull(),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
});

// Gang invitations table (for easy friend/gang invitations)
export const gangInvitations = pgTable('gang_invitations', {
  id: serial('id').primaryKey(),
  familyId: text('family_id').notNull().references(() => families.id, { onDelete: 'cascade' }),
  token: varchar('token', { length: 20 }).notNull().unique(), // Short invitation code
  invitedBy: text('invited_by').notNull(),
  invitedByName: text('invited_by_name').notNull(),
  acceptedAt: timestamp('accepted_at'),
  expiresAt: timestamp('expires_at').notNull(),
  status: varchar('status', { length: 20 }).notNull().default('PENDING'), // 'PENDING', 'ACCEPTED', 'REVOKED'
  createdAt: timestamp('created_at').notNull().defaultNow(),
});


// ============================================
// OUTING ORGANIZER: USER INVENTORY & TEMPLATES
// ============================================

// User Inventory: Saved Preferences (Who owns what)
export const userInventory = pgTable('user_inventory', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  itemName: text('item_name').notNull(), // e.g., "Camping Chairs", "Braai Grid"
  autoVolunteer: boolean('auto_volunteer').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Outing Templates
export const outingTemplates = pgTable('outing_templates', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(), // e.g., "Beach Day", "Park Picnic", "LAN Party", "Braai"
  defaultItems: jsonb('default_items').notNull().$type<string[]>(), // e.g., ["Sunblock", "Towels", ...]
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ============================================
// MODULE 0: EXISTING GROUP FEATURES
// ============================================

// Groups table
export const groups = pgTable('groups', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  type: varchar('type', { length: 20 }).notNull(), // 'trip', 'event', 'project', 'other'
  joinCode: varchar('join_code', { length: 10 }).notNull().unique(),
  creatorId: text('creator_id').notNull(),
  memberIds: jsonb('member_ids').notNull().$type<string[]>(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  location: text('location'),
  coverImage: text('cover_image'),
});

// Checklist items table
export const checklistItems = pgTable('checklist_items', {
  id: serial('id').primaryKey(),
  groupId: integer('group_id').notNull().references(() => groups.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  category: varchar('category', { length: 20 }).notNull(), // 'packing', 'todo', 'shopping', 'other'
  completed: boolean('completed').notNull().default(false),
  assignedTo: text('assigned_to'),
  priority: varchar('priority', { length: 10 }).notNull(), // 'low', 'medium', 'high'
  dueDate: timestamp('due_date'),
  createdBy: text('created_by').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  completedAt: timestamp('completed_at'),
  completedBy: text('completed_by'),
});

// Recommendations table
export const recommendations = pgTable('recommendations', {
  id: serial('id').primaryKey(),
  groupId: integer('group_id').notNull().references(() => groups.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 20 }).notNull(), // 'activity', 'restaurant', 'accommodation', 'attraction', 'other'
  title: text('title').notNull(),
  description: text('description').notNull(),
  location: text('location'),
  url: text('url'),
  imageUrl: text('image_url'),
  rating: integer('rating'),
  price: varchar('price', { length: 5 }), // '$', '$$', '$$$', '$$$$'
  notes: text('notes'),
  suggestedBy: text('suggested_by').notNull(),
  votes: jsonb('votes').notNull().$type<{ userId: string; vote: 'up' | 'down' }[]>().default([]),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ============================================
// MODULE 1: PARTY BRAIN (Context & Assets)
// ============================================

export const userAssets = pgTable('user_assets', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  name: text('name').notNull(),
  type: varchar('type', { length: 20 }).notNull(), // 'digital', 'analog', 'food'
  isSetupRequired: boolean('is_setup_required').notNull().default(false),
  tags: jsonb('tags').$type<string[]>().notNull().default([]),
  description: text('description'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const preferences = pgTable('preferences', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().unique(),
  dietaryRestrictions: jsonb('dietary_restrictions').$type<string[]>().notNull().default([]),
  favorites: jsonb('favorites').$type<string[]>().notNull().default([]),
  allergens: jsonb('allergens').$type<string[]>().notNull().default([]),
  additionalNotes: text('additional_notes'),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const eventPlans = pgTable('event_plans', {
  id: serial('id').primaryKey(),
  eventId: integer('event_id').notNull(),
  hostId: text('host_id').notNull(),
  generatedScheduleJson: jsonb('generated_schedule_json').notNull().$type<{
    activities: Array<{
      name: string;
      duration: number;
      startTime: string;
      assetIds: number[];
      participants: number;
    }>;
    suggestions: string[];
  }>(),
  assetsUsedIds: jsonb('assets_used_ids').$type<number[]>().notNull().default([]),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ============================================
// MODULE 2: UNIVERSAL LEADERBOARD
// ============================================

export const games = pgTable('games', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  scoringType: varchar('scoring_type', { length: 20 }).notNull(), // 'TIME_ASC', 'SCORE_DESC'
  icon: text('icon'),
  description: text('description'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const gameScores = pgTable('game_scores', {
  id: serial('id').primaryKey(),
  gameId: integer('game_id').notNull().references(() => games.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull(),
  eventId: integer('event_id').notNull(),
  scoreValue: bigint('score_value', { mode: 'number' }).notNull(), // milliseconds or points
  proofImageUrl: text('proof_image_url'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const familyGameParticipants = pgTable('family_game_participants', {
  id: serial('id').primaryKey(),
  gameId: text('game_id').notNull(),
  userId: text('user_id'),
  userName: text('user_name').notNull(),
  addedBy: text('added_by').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ============================================
// MODULE 3: IMPOSTER GAME ENGINE
// ============================================

export const gameSessions = pgTable('game_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: integer('event_id').notNull(),
  status: varchar('status', { length: 20 }).notNull().default('LOBBY'), // 'LOBBY', 'DAY_PHASE', 'BLACKOUT_WARNING', 'NIGHT_PHASE', 'BODY_REPORTED', 'VOTING', 'ENDED'
  gameMode: varchar('game_mode', { length: 20 }).notNull().default('CLASSIC'), // 'CLASSIC', 'BLACKOUT'
  secretTopic: text('secret_topic').notNull(),
  imposterHint: text('imposter_hint').notNull(),
  round: integer('round').notNull().default(1),
  votingEnabled: boolean('voting_enabled').notNull().default(false),
  nightPhaseStartedAt: timestamp('night_phase_started_at'), // For blackout mode
  dayPhaseEndsAt: timestamp('day_phase_ends_at'), // When next blackout occurs
  createdAt: timestamp('created_at').notNull().defaultNow(),
  startedAt: timestamp('started_at'),
  endedAt: timestamp('ended_at'),
});

export const gamePlayers = pgTable('game_players', {
  id: serial('id').primaryKey(),
  sessionId: uuid('session_id').notNull().references(() => gameSessions.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull(),
  userName: text('user_name').notNull(),
  role: varchar('role', { length: 20 }).notNull(), // 'CIVILIAN', 'IMPOSTER'
  isAlive: boolean('is_alive').notNull().default(true),
  votesReceived: integer('votes_received').notNull().default(0),
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
});

export const gameVotes = pgTable('game_votes', {
  id: serial('id').primaryKey(),
  sessionId: uuid('session_id').notNull().references(() => gameSessions.id, { onDelete: 'cascade' }),
  voterId: text('voter_id').notNull(),
  targetId: text('target_id').notNull(),
  round: integer('round').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ============================================
// MODULE 4: EXPENSE INTELLIGENCE
// ============================================

export const expenses = pgTable('expenses', {
  id: serial('id').primaryKey(),
  eventId: integer('event_id').notNull(),
  payerId: text('payer_id').notNull(),
  totalAmount: integer('total_amount').notNull(), // in cents
  merchant: text('merchant'),
  receiptUrl: text('receipt_url'),
  description: text('description'),
  aiExtractedData: jsonb('ai_extracted_data').$type<{
    total: number;
    merchant: string;
    items: Array<{ name: string; price: number; quantity: number }>;
  }>(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const expenseSplits = pgTable('expense_splits', {
  id: serial('id').primaryKey(),
  expenseId: integer('expense_id').notNull().references(() => expenses.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull(),
  amountOwed: integer('amount_owed').notNull(), // in cents
  isPaid: boolean('is_paid').notNull().default(false),
  paidAt: timestamp('paid_at'),
});

// ============================================
// MODULE 5: BLACKOUT GAME MASTER (CMS)
// ============================================

export const gameConfig = pgTable('game_config', {
  id: serial('id').primaryKey(),
  eventId: integer('event_id').notNull().unique(),
  blackoutIntervalMinutes: integer('blackout_interval_minutes').notNull().default(30),
  killerWindowSeconds: integer('killer_window_seconds').notNull().default(30),
  isGamePaused: boolean('is_game_paused').notNull().default(false),
  powerLevel: integer('power_level').notNull().default(100), // 0-100, affects blackout timing
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const imposterHints = pgTable('imposter_hints', {
  id: serial('id').primaryKey(),
  eventId: integer('event_id').notNull(),
  hintText: text('hint_text').notNull(),
  category: varchar('category', { length: 20 }).notNull().default('general'), // 'general', 'action', 'behavior'
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const civilianTopics = pgTable('civilian_topics', {
  id: serial('id').primaryKey(),
  eventId: integer('event_id').notNull(),
  topicText: text('topic_text').notNull(),
  difficulty: varchar('difficulty', { length: 20 }).notNull().default('medium'), // 'easy', 'medium', 'hard'
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const tasks = pgTable('tasks', {
  id: serial('id').primaryKey(),
  eventId: integer('event_id').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  taskType: varchar('task_type', { length: 20 }).notNull().default('qr_scan'), // 'qr_scan', 'mini_game'
  miniGameType: varchar('mini_game_type', { length: 20 }), // 'wire_puzzle', 'code_entry', 'sequence'
  qrCodeData: text('qr_code_data').notNull(), // URL or encoded data
  completionBonusSeconds: integer('completion_bonus_seconds').notNull().default(120), // Delays blackout
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const taskCompletions = pgTable('task_completions', {
  id: serial('id').primaryKey(),
  taskId: integer('task_id').notNull().references(() => tasks.id, { onDelete: 'cascade' }),
  sessionId: uuid('session_id').notNull().references(() => gameSessions.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull(),
  completedAt: timestamp('completed_at').notNull().defaultNow(),
  timeTakenSeconds: integer('time_taken_seconds'),
});

export const killEvents = pgTable('kill_events', {
  id: serial('id').primaryKey(),
  sessionId: uuid('session_id').notNull().references(() => gameSessions.id, { onDelete: 'cascade' }),
  killerId: text('killer_id').notNull(),
  victimId: text('victim_id').notNull(),
  round: integer('round').notNull(),
  killMethod: varchar('kill_method', { length: 50 }).notNull().default('silent_tap'), // Customizable
  killedAt: timestamp('killed_at').notNull().defaultNow(),
});

// ============================================
// MODULE 6: UNIFIED SCANNABLES SYSTEM
// ============================================

export const scannables = pgTable('scannables', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: integer('event_id').notNull(),
  type: varchar('type', { length: 20 }).notNull(), // 'TASK', 'TREASURE_NODE', 'KILLER_EVIDENCE'
  label: text('label').notNull(), // Display name (e.g., "Evidence #1", "Clue: Kitchen")
  content: text('content').notNull(), // The clue text, evidence description, or task instruction
  solutionCode: text('solution_code'), // Optional passcode to unlock
  chainId: uuid('chain_id'), // For linking treasure hunt steps
  chainOrder: integer('chain_order'), // Step number in chain (1, 2, 3...)
  isActive: boolean('is_active').notNull().default(true),
  qrCodeData: text('qr_code_data').notNull(), // URL for this scannable
  rewardPoints: integer('reward_points').default(0), // Points for completion
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const scannableScans = pgTable('scannable_scans', {
  id: serial('id').primaryKey(),
  scannableId: uuid('scannable_id').notNull().references(() => scannables.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull(),
  sessionId: text('session_id').notNull(), // Can be any session identifier, not just game sessions
  isCorrectOrder: boolean('is_correct_order').notNull().default(true), // For treasure hunts
  scannedAt: timestamp('scanned_at').notNull().defaultNow(),
});

export const detectiveNotebook = pgTable('detective_notebook', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  sessionId: text('session_id').notNull(), // Can be any session identifier, not just game sessions
  evidenceId: uuid('evidence_id').notNull().references(() => scannables.id, { onDelete: 'cascade' }),
  notes: text('notes'), // Player's personal notes
  addedAt: timestamp('added_at').notNull().defaultNow(),
});

// ============================================
// MODULE 7: PARTY OPERATING SYSTEM
// ============================================

// Parties Table (Each party event has its own entry)
export const parties = pgTable('parties', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(), // e.g., "Mohammed's Birthday Party"
  hostId: uuid('host_id'), // Reference to the host user
  joinCode: text('join_code').notNull().unique(), // Public join code (e.g., '1696')
  startTime: timestamp('start_time'),
  endTime: timestamp('end_time'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Party Users (Extended with wallet and PIN)
export const partyUsers = pgTable('party_users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  displayName: text('display_name'), // Custom display name (nickname)
  pinCode: text('pin_code').unique(), // SECRET PIN for admin/host login (e.g., 'admin-9999')
  avatarUrl: text('avatar_url'),
  avatarEmoji: varchar('avatar_emoji', { length: 10 }).default('😎'), // Quick emoji avatar
  walletBalance: integer('wallet_balance').notNull().default(1000), // Party currency
  role: varchar('role', { length: 20 }).notNull().default('guest'), // 'admin', 'host', 'guest'
  status: varchar('status', { length: 20 }).notNull().default('approved'), // 'pending', 'approved', 'rejected'
  partyId: uuid('party_id'), // Which party they joined
  bio: text('bio'), // Short bio/tagline
  favoriteColor: varchar('favorite_color', { length: 20 }), // For theming
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Party Games (Sim Racing, Imposter, Dominoes, etc.)
export const partyGames = pgTable('party_games', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  type: varchar('type', { length: 20 }).notNull(), // 'SIM_RACE', 'IMPOSTER', 'DOMINOES', 'OTHER'
  status: varchar('status', { length: 20 }).notNull().default('OPEN'), // 'OPEN', 'LOCKED', 'FINISHED'
  raceState: varchar('race_state', { length: 20 }).notNull().default('PENDING'), // 'PENDING', 'OPEN_FOR_BETS', 'LIVE', 'FINISHED'
  bettingClosed: boolean('betting_closed').notNull().default(false),
  registeredDrivers: jsonb('registered_drivers').$type<string[]>().notNull().default([]),
  description: text('description'),
  startTime: timestamp('start_time'),
  endTime: timestamp('end_time'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Sim Racing Entries (Leaderboard)
export const simRaceEntries = pgTable('sim_race_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  gameId: uuid('game_id').notNull().references(() => partyGames.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => partyUsers.id, { onDelete: 'cascade' }),
  isReady: boolean('is_ready').notNull().default(false), // Driver declared ready
  lapTimeMs: integer('lap_time_ms'), // Lap time in milliseconds (nullable if DNF)
  carModel: text('car_model'),
  track: text('track'),
  isDnf: boolean('is_dnf').notNull().default(false), // Did Not Finish
  submittedAt: timestamp('submitted_at').notNull().defaultNow(),
});

// Betting System
export const bets = pgTable('bets', {
  id: uuid('id').primaryKey().defaultRandom(),
  gameId: uuid('game_id').notNull().references(() => partyGames.id, { onDelete: 'cascade' }),
  bettorId: uuid('bettor_id').notNull().references(() => partyUsers.id, { onDelete: 'cascade' }),
  targetUserId: uuid('target_user_id').notNull().references(() => partyUsers.id, { onDelete: 'cascade' }), // Who they bet on
  amount: integer('amount').notNull(), // Bet amount in party currency
  status: varchar('status', { length: 20 }).notNull().default('PENDING'), // 'PENDING', 'WON', 'LOST'
  payout: integer('payout'), // Amount won (if won)
  createdAt: timestamp('created_at').notNull().defaultNow(),
  settledAt: timestamp('settled_at'),
});

// Imposter Rounds (Extended for Party OS)
export const partyImposterRounds = pgTable('party_imposter_rounds', {
  id: uuid('id').primaryKey().defaultRandom(),
  gameId: uuid('game_id').notNull().references(() => partyGames.id, { onDelete: 'cascade' }),
  status: varchar('status', { length: 20 }).notNull().default('ACTIVE'), // 'ACTIVE', 'WARNING', 'VOTING', 'REVEALED'
  imposterId: uuid('imposter_id').notNull().references(() => partyUsers.id),
  secretWord: text('secret_word').notNull(), // The word civilians see ("Golf")
  imposterHint: text('imposter_hint').notNull(), // The hint imposter sees ("Sport with a stick")
  round: integer('round').notNull().default(1),
  startTime: timestamp('start_time').notNull().defaultNow(), // Round start time
  endTime: timestamp('end_time'), // Calculated end time (startTime + duration)
  durationMinutes: integer('duration_minutes').notNull().default(45), // Round duration (default 45 mins)
  warningSent: boolean('warning_sent').notNull().default(false), // 10-minute warning triggered
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Party Real-Time Events Log (for Pusher debugging/history)
export const partyEvents = pgTable('party_events', {
  id: serial('id').primaryKey(),
  eventType: varchar('event_type', { length: 50 }).notNull(), // 'leaderboard-update', 'bet-placed', 'game-state-change', etc.
  channel: text('channel').notNull(), // Pusher channel name
  data: jsonb('data').notNull(), // Event payload
  triggeredBy: uuid('triggered_by'), // User who triggered event
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Party Task System (Among Us style)
export const partyTasks = pgTable('party_tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  description: text('description').notNull(), // e.g., "Selfie with the Birthday Boy"
  pointsReward: integer('points_reward').notNull().default(50),
  verificationType: varchar('verification_type', { length: 20 }).notNull().default('BUTTON'), // 'BUTTON', 'QR_SCAN', 'PHOTO'
  qrCode: text('qr_code'), // Optional QR code data
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const playerTasks = pgTable('player_tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => partyUsers.id, { onDelete: 'cascade' }),
  taskId: uuid('task_id').notNull().references(() => partyTasks.id, { onDelete: 'cascade' }),
  isCompleted: boolean('is_completed').notNull().default(false),
  completedAt: timestamp('completed_at'),
  proofUrl: text('proof_url'), // Optional photo proof URL
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Player Status (for kill system)
export const playerStatus = pgTable('player_status', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().unique().references(() => partyUsers.id, { onDelete: 'cascade' }),
  status: varchar('status', { length: 20 }).notNull().default('ALIVE'), // 'ALIVE', 'GHOST', 'SPECTATOR'
  role: varchar('role', { length: 20 }).notNull().default('CREWMATE'), // 'CREWMATE', 'IMPOSTER'
  killedAt: timestamp('killed_at'),
  killedBy: uuid('killed_by').references(() => partyUsers.id),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Trickshot Scores (Party OS)
export const trickshotScores = pgTable('trickshot_scores', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => partyUsers.id, { onDelete: 'cascade' }),
  shotType: varchar('shot_type', { length: 20 }).notNull(),
  points: integer('points').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Kill Cooldown Tracker
export const killCooldowns = pgTable('kill_cooldowns', {
  id: uuid('id').primaryKey().defaultRandom(),
  imposterId: uuid('imposter_id').notNull().unique().references(() => partyUsers.id, { onDelete: 'cascade' }),
  lastKillAt: timestamp('last_kill_at').notNull().defaultNow(),
  cooldownSeconds: integer('cooldown_seconds').notNull().default(30),
});

// ============================================
// RELATIONS
// ============================================

// User & Family relations
export const usersRelations = relations(users, ({ one }) => ({
  family: one(families, {
    fields: [users.familyId],
    references: [families.id],
  }),
}));

export const familiesRelations = relations(families, ({ many }) => ({
  members: many(familyMembers),
  activityLogs: many(activityLog),
}));

export const familyMembersRelations = relations(familyMembers, ({ one }) => ({
  family: one(families, {
    fields: [familyMembers.familyId],
    references: [families.id],
  }),
}));

export const activityLogRelations = relations(activityLog, ({ one }) => ({
  family: one(families, {
    fields: [activityLog.familyId],
    references: [families.id],
  }),
}));

// Existing relations
export const groupsRelations = relations(groups, ({ many }) => ({
  checklistItems: many(checklistItems),
  recommendations: many(recommendations),
}));

export const checklistItemsRelations = relations(checklistItems, ({ one }) => ({
  group: one(groups, {
    fields: [checklistItems.groupId],
    references: [groups.id],
  }),
}));

export const recommendationsRelations = relations(recommendations, ({ one }) => ({
  group: one(groups, {
    fields: [recommendations.groupId],
    references: [groups.id],
  }),
}));

// New relations
export const gamesRelations = relations(games, ({ many }) => ({
  scores: many(gameScores),
}));

export const gameScoresRelations = relations(gameScores, ({ one }) => ({
  game: one(games, {
    fields: [gameScores.gameId],
    references: [games.id],
  }),
}));

export const gameSessionsRelations = relations(gameSessions, ({ many }) => ({
  players: many(gamePlayers),
  votes: many(gameVotes),
}));

export const gamePlayersRelations = relations(gamePlayers, ({ one }) => ({
  session: one(gameSessions, {
    fields: [gamePlayers.sessionId],
    references: [gameSessions.id],
  }),
}));

export const expensesRelations = relations(expenses, ({ many }) => ({
  splits: many(expenseSplits),
}));

export const expenseSplitsRelations = relations(expenseSplits, ({ one }) => ({
  expense: one(expenses, {
    fields: [expenseSplits.expenseId],
    references: [expenses.id],
  }),
}));

export const tasksRelations = relations(tasks, ({ many }) => ({
  completions: many(taskCompletions),
}));

export const taskCompletionsRelations = relations(taskCompletions, ({ one }) => ({
  task: one(tasks, {
    fields: [taskCompletions.taskId],
    references: [tasks.id],
  }),
  session: one(gameSessions, {
    fields: [taskCompletions.sessionId],
    references: [gameSessions.id],
  }),
}));

export const killEventsRelations = relations(killEvents, ({ one }) => ({
  session: one(gameSessions, {
    fields: [killEvents.sessionId],
    references: [gameSessions.id],
  }),
}));

export const scannablesRelations = relations(scannables, ({ many }) => ({
  scans: many(scannableScans),
  notebookEntries: many(detectiveNotebook),
}));

export const scannableScansRelations = relations(scannableScans, ({ one }) => ({
  scannable: one(scannables, {
    fields: [scannableScans.scannableId],
    references: [scannables.id],
  }),
}));

export const detectiveNotebookRelations = relations(detectiveNotebook, ({ one }) => ({
  evidence: one(scannables, {
    fields: [detectiveNotebook.evidenceId],
    references: [scannables.id],
  }),
}));

// Party OS relations
export const partyUsersRelations = relations(partyUsers, ({ many }) => ({
  raceEntries: many(simRaceEntries),
  betsPlaced: many(bets, { relationName: 'bettor' }),
  betsReceived: many(bets, { relationName: 'target' }),
  trickshotScores: many(trickshotScores),
}));

export const partyGamesRelations = relations(partyGames, ({ many }) => ({
  raceEntries: many(simRaceEntries),
  bets: many(bets),
  imposterRounds: many(partyImposterRounds),
}));

export const simRaceEntriesRelations = relations(simRaceEntries, ({ one }) => ({
  game: one(partyGames, {
    fields: [simRaceEntries.gameId],
    references: [partyGames.id],
  }),
  user: one(partyUsers, {
    fields: [simRaceEntries.userId],
    references: [partyUsers.id],
  }),
}));

export const betsRelations = relations(bets, ({ one }) => ({
  game: one(partyGames, {
    fields: [bets.gameId],
    references: [partyGames.id],
  }),
  bettor: one(partyUsers, {
    fields: [bets.bettorId],
    references: [partyUsers.id],
    relationName: 'bettor',
  }),
  target: one(partyUsers, {
    fields: [bets.targetUserId],
    references: [partyUsers.id],
    relationName: 'target',
  }),
}));

export const partyImposterRoundsRelations = relations(partyImposterRounds, ({ one }) => ({
  game: one(partyGames, {
    fields: [partyImposterRounds.gameId],
    references: [partyGames.id],
  }),
  imposter: one(partyUsers, {
    fields: [partyImposterRounds.imposterId],
    references: [partyUsers.id],
  }),
}));

// ============================================
// TYPES
// ============================================

// User & Family types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Friend = typeof friends.$inferSelect;
export type NewFriend = typeof friends.$inferInsert;
export type Family = typeof families.$inferSelect;
export type NewFamily = typeof families.$inferInsert;
export type FamilyMember = typeof familyMembers.$inferSelect;
export type NewFamilyMember = typeof familyMembers.$inferInsert;
export type ActivityLog = typeof activityLog.$inferSelect;
export type NewActivityLog = typeof activityLog.$inferInsert;

// Existing types
export type Group = typeof groups.$inferSelect;
export type NewGroup = typeof groups.$inferInsert;
export type ChecklistItem = typeof checklistItems.$inferSelect;
export type NewChecklistItem = typeof checklistItems.$inferInsert;
export type Recommendation = typeof recommendations.$inferSelect;
export type NewRecommendation = typeof recommendations.$inferInsert;

// Module 1 types
export type UserAsset = typeof userAssets.$inferSelect;
export type NewUserAsset = typeof userAssets.$inferInsert;
export type Preference = typeof preferences.$inferSelect;
export type NewPreference = typeof preferences.$inferInsert;
export type EventPlan = typeof eventPlans.$inferSelect;
export type NewEventPlan = typeof eventPlans.$inferInsert;

// Module 2 types
export type Game = typeof games.$inferSelect;
export type NewGame = typeof games.$inferInsert;
export type GameScore = typeof gameScores.$inferSelect;
export type NewGameScore = typeof gameScores.$inferInsert;
export type FamilyGameParticipant = typeof familyGameParticipants.$inferSelect;
export type NewFamilyGameParticipant = typeof familyGameParticipants.$inferInsert;

// Module 3 types
export type GameSession = typeof gameSessions.$inferSelect;
export type NewGameSession = typeof gameSessions.$inferInsert;
export type GamePlayer = typeof gamePlayers.$inferSelect;
export type NewGamePlayer = typeof gamePlayers.$inferInsert;
export type GameVote = typeof gameVotes.$inferSelect;
export type NewGameVote = typeof gameVotes.$inferInsert;

// Module 4 types
export type Expense = typeof expenses.$inferSelect;
export type NewExpense = typeof expenses.$inferInsert;
export type ExpenseSplit = typeof expenseSplits.$inferSelect;
export type NewExpenseSplit = typeof expenseSplits.$inferInsert;

// Module 5 types
export type GameConfig = typeof gameConfig.$inferSelect;
export type NewGameConfig = typeof gameConfig.$inferInsert;
export type ImposterHint = typeof imposterHints.$inferSelect;
export type NewImposterHint = typeof imposterHints.$inferInsert;
export type CivilianTopic = typeof civilianTopics.$inferSelect;
export type NewCivilianTopic = typeof civilianTopics.$inferInsert;
export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
export type TaskCompletion = typeof taskCompletions.$inferSelect;
export type NewTaskCompletion = typeof taskCompletions.$inferInsert;
export type KillEvent = typeof killEvents.$inferSelect;
export type NewKillEvent = typeof killEvents.$inferInsert;

// Module 6 types
export type Scannable = typeof scannables.$inferSelect;
export type NewScannable = typeof scannables.$inferInsert;
export type ScannableScan = typeof scannableScans.$inferSelect;
export type NewScannableScan = typeof scannableScans.$inferInsert;
export type DetectiveNotebook = typeof detectiveNotebook.$inferSelect;
export type NewDetectiveNotebook = typeof detectiveNotebook.$inferInsert;

// Module 7 types (Party OS)
export type PartyUser = typeof partyUsers.$inferSelect;
export type NewPartyUser = typeof partyUsers.$inferInsert;
export type PartyGame = typeof partyGames.$inferSelect;
export type NewPartyGame = typeof partyGames.$inferInsert;
export type SimRaceEntry = typeof simRaceEntries.$inferSelect;
export type NewSimRaceEntry = typeof simRaceEntries.$inferInsert;
export type Bet = typeof bets.$inferSelect;
export type NewBet = typeof bets.$inferInsert;
export type PartyImposterRound = typeof partyImposterRounds.$inferSelect;
export type NewPartyImposterRound = typeof partyImposterRounds.$inferInsert;
export type PartyEvent = typeof partyEvents.$inferSelect;
export type NewPartyEvent = typeof partyEvents.$inferInsert;
export type TrickshotScore = typeof trickshotScores.$inferSelect;
export type NewTrickshotScore = typeof trickshotScores.$inferInsert;

// ============================================
// MODULE 8: SYSTEM ADMINISTRATION
// ============================================

// System logs for tracking events and errors
export const systemLogs = pgTable('system_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  level: varchar('level', { length: 10 }).notNull(), // 'INFO', 'WARN', 'ERROR'
  source: varchar('source', { length: 50 }).notNull(), // 'SpyGame', 'Auth', 'RaceGame', etc.
  message: text('message').notNull(),
  metaData: jsonb('meta_data').$type<Record<string, any>>(),
  userId: text('user_id'), // Optional: which user triggered this
  ipAddress: varchar('ip_address', { length: 45 }), // IPv4 or IPv6
});

// Global settings that can be changed without redeploying
export const globalSettings = pgTable('global_settings', {
  key: varchar('key', { length: 50 }).primaryKey(),
  value: text('value').notNull(),
  description: text('description').notNull(),
  category: varchar('category', { length: 20 }).notNull().default('general'), // 'game', 'economy', 'system'
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  updatedBy: text('updated_by'), // Email of admin who changed it
});

// Module 8 types
export type SystemLog = typeof systemLogs.$inferSelect;
export type NewSystemLog = typeof systemLogs.$inferInsert;
export type GlobalSetting = typeof globalSettings.$inferSelect;
export type NewGlobalSetting = typeof globalSettings.$inferInsert;

// ============================================
// MODULE 9: SMART QR SYSTEM
// ============================================

// Smart QRs with tracking and dynamic content
export const smartQrs = pgTable('smart_qrs', {
  id: uuid('id').primaryKey().defaultRandom(),
  token: varchar('token', { length: 10 }).notNull().unique(), // Short 6-char code
  type: varchar('type', { length: 10 }).notNull().default('CLUE'), // 'CLUE', 'TASK', 'INFO', 'TRAP'
  title: text('title').notNull(), // Internal name (e.g., "Fridge Clue")
  content: text('content').notNull(), // The actual message shown to user
  // Gamification fields
  points: integer('points').notNull().default(100), // Points awarded (or deducted if trap)
  isTrap: boolean('is_trap').notNull().default(false), // If true, DEDUCTS points
  bonusFirstFinder: integer('bonus_first_finder').notNull().default(200), // Extra for first scanner
  // Tracking
  scanCount: integer('scan_count').notNull().default(0),
  lastScannedAt: timestamp('last_scanned_at'),
  lastScannedBy: text('last_scanned_by'), // Name of last scanner
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  createdBy: text('created_by'), // Admin who created it
});

// Smart QR scan history
export const smartQrScans = pgTable('smart_qr_scans', {
  id: serial('id').primaryKey(),
  qrId: uuid('qr_id').notNull().references(() => smartQrs.id, { onDelete: 'cascade' }),
  scannerName: text('scanner_name').notNull().default('Guest'),
  scannedAt: timestamp('scanned_at').notNull().defaultNow(),
  userAgent: text('user_agent'), // Device info
});

// QR Claims - prevents double-scanning for points
export const qrClaims = pgTable('qr_claims', {
  id: uuid('id').primaryKey().defaultRandom(),
  qrId: uuid('qr_id').notNull().references(() => smartQrs.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull(), // User who claimed it
  userName: text('user_name').notNull().default('Guest'),
  pointsAwarded: integer('points_awarded').notNull(), // Can be negative for traps
  wasFirstFinder: boolean('was_first_finder').notNull().default(false),
  claimedAt: timestamp('claimed_at').notNull().defaultNow(),
});

// Module 9 types
export type SmartQr = typeof smartQrs.$inferSelect;
export type NewSmartQr = typeof smartQrs.$inferInsert;
export type SmartQrScan = typeof smartQrScans.$inferSelect;
export type NewSmartQrScan = typeof smartQrScans.$inferInsert;
export type QrClaim = typeof qrClaims.$inferSelect;
export type NewQrClaim = typeof qrClaims.$inferInsert;

// ============================================
// MODULE 10: EVENT HUB (Real-World Outings)
// ============================================

// Event categories - Organize events by type (must be defined before events)
export const eventCategories = pgTable('event_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(), // e.g., "Outdoor", "Sports", "Family Gathering"
  slug: text('slug').notNull().unique(), // e.g., "outdoor", "sports"
  icon: text('icon').notNull().default('Calendar'), // Lucide icon name
  color: text('color').notNull().default('blue'), // Tailwind color
  description: text('description'),
  familyId: text('family_id'), // null = system categories
  isSystem: boolean('is_system').notNull().default(false), // System vs custom
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Events table - for family outings, trips, and gatherings
export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(), // e.g., "Sunday Hike"
  description: text('description'),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time'),
  locationName: text('location_name'), // e.g., "Lion's Head Trail"
  coordinates: jsonb('coordinates').$type<{ lat: number; lng: number }>(), // Lat/lng for maps
  status: varchar('status', { length: 20 }).notNull().default('UPCOMING'), // 'UPCOMING', 'LIVE', 'PAST'
  categoryId: uuid('category_id').references(() => eventCategories.id), // Event category
  heroImageUrl: text('hero_image_url'), // Hero image URL (Unsplash or custom)
  creatorId: text('creator_id').notNull(),
  familyId: text('family_id'), // Link to family
  isRecurring: boolean('is_recurring').notNull().default(false), // Part of recurring series
  venuePlaceId: text('venue_place_id'), // Google Places/Mapbox ID
  weatherSnapshot: jsonb('weather_snapshot').$type<any>(), // Forecast at creation
  aiResearch: jsonb('ai_research').$type<{ placeDetails: string; weatherAdvice: string; suggestedSupplies: string[]; suggestedTasks: string[] }>(),
  bookingDetails: jsonb('booking_details').$type<{ isBooked: boolean; venueName: string; guests: number; estimatedPrice: number; reference: string; date: string }>(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Event attendees - who's going?
export const eventAttendees = pgTable('event_attendees', {
  id: serial('id').primaryKey(),
  eventId: uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull(),
  userName: text('user_name').notNull(),
  rsvpStatus: varchar('rsvp_status', { length: 20 }).notNull().default('PENDING'), // 'GOING', 'MAYBE', 'CANT_MAKE_IT', 'PENDING'
  addedAt: timestamp('added_at').notNull().defaultNow(),
  respondedAt: timestamp('responded_at'),
  plusOnes: integer('plus_ones').notNull().default(0), // Number of additional guests
  dietaryNotes: text('dietary_notes'), // Allergies, restrictions, preferences
  needsTransport: boolean('needs_transport').notNull().default(false),
  specialNeeds: text('special_needs'), // Accessibility requirements
});

// Event waypoints/itinerary - timeline of activities
export const eventWaypoints = pgTable('event_waypoints', {
  id: serial('id').primaryKey(),
  eventId: uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  time: text('time').notNull(), // e.g., "10:00 AM"
  title: text('title').notNull(), // e.g., "Meet at Parking"
  description: text('description'),
  location: text('location'),
  coordinates: jsonb('coordinates').$type<{ lat: number; lng: number }>(),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Live location tracking - the "Family Radar" / Overwatch
export const liveLocations = pgTable('live_locations', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull(),
  userName: text('user_name').notNull(),
  latitude: text('latitude').notNull(), // Using text for precision
  longitude: text('longitude').notNull(),
  accuracy: integer('accuracy'), // GPS accuracy in meters
  speed: integer('speed'), // Speed in km/h (for convoy feature)
  batteryLevel: integer('battery_level'), // 0-100 (null = unknown / iOS)
  isCharging: boolean('is_charging'), // null = unknown
  speedKmh: integer('speed_kmh'), // Explicit km/h field (mirrors speed for new clients)
  lastPingAt: timestamp('last_ping_at'), // When the last telemetry ping arrived
  isGhostMode: boolean('is_ghost_mode').notNull().default(false), // Privacy toggle
  lastUpdated: timestamp('last_updated').notNull().defaultNow(),
});

// Event polls - Quick decision maker
export const eventPolls = pgTable('event_polls', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  question: text('question').notNull(), // e.g., "Dinner Spot?"
  options: jsonb('options').notNull().$type<string[]>(), // e.g., ["Burgers", "Sushi", "Braai"]
  creatorId: text('creator_id').notNull(),
  creatorName: text('creator_name').notNull(),
  expiresAt: timestamp('expires_at'), // Auto-close time
  isClosed: boolean('is_closed').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Poll votes
export const pollVotes = pgTable('poll_votes', {
  id: serial('id').primaryKey(),
  pollId: uuid('poll_id').notNull().references(() => eventPolls.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull(),
  userName: text('user_name').notNull(),
  optionIndex: integer('option_index').notNull(), // Index of selected option
  votedAt: timestamp('voted_at').notNull().defaultNow(),
});

// Meet-here pins (temporary map markers)
export const meetHerePins = pgTable('meet_here_pins', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  creatorId: text('creator_id').notNull(),
  creatorName: text('creator_name').notNull(),
  latitude: text('latitude').notNull(),
  longitude: text('longitude').notNull(),
  message: text('message'), // e.g., "Meet at the entrance!"
  expiresAt: timestamp('expires_at'), // Auto-remove after time
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Event tags - Flexible tagging system
export const eventTags = pgTable('event_tags', {
  id: serial('id').primaryKey(),
  eventId: uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  tag: text('tag').notNull(), // e.g., "birthday", "kids-friendly", "outdoor"
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Event templates - Pre-configured event setups
export const eventTemplates = pgTable('event_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(), // e.g., "Birthday Party", "Beach Day", "Braai"
  categoryId: uuid('category_id').references(() => eventCategories.id),
  description: text('description'),
  defaultDuration: integer('default_duration'), // Hours
  defaultTags: jsonb('default_tags').$type<string[]>().default([]),
  checklistItems: jsonb('checklist_items').$type<Array<{ 
    title: string; 
    category: string; 
    dueBeforeHours?: number;
  }>>().default([]),
  suggestedSupplies: jsonb('suggested_supplies').$type<Array<{
    itemName: string;
    quantityNeeded: string;
    category: string;
  }>>().default([]),
  waypoints: jsonb('waypoints').$type<Array<{
    time: string;
    title: string;
    description?: string;
  }>>().default([]),
  familyId: text('family_id'), // null = system templates
  isSystem: boolean('is_system').notNull().default(false),
  usageCount: integer('usage_count').notNull().default(0),
  createdBy: text('created_by'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Event planning checklist - Tasks for event preparation
export const eventChecklists = pgTable('event_checklists', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  title: text('title').notNull(), // e.g., "Book venue", "Send invites"
  description: text('description'),
  category: varchar('category', { length: 30 }).notNull().default('GENERAL'), // 'VENUE', 'CATERING', 'SUPPLIES', 'COMMUNICATION', 'GENERAL'
  assignedToUserId: text('assigned_to_user_id'),
  assignedToUserName: text('assigned_to_user_name'),
  dueDate: timestamp('due_date'), // When this should be done by
  isCompleted: boolean('is_completed').notNull().default(false),
  completedAt: timestamp('completed_at'),
  completedBy: text('completed_by'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdBy: text('created_by').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Event invitations - Track who's been invited
export const eventInvitations = pgTable('event_invitations', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  inviteeEmail: text('invitee_email'),
  inviteePhone: text('invitee_phone'),
  inviteeName: text('invitee_name').notNull(),
  invitedBy: text('invited_by').notNull(),
  invitedByName: text('invited_by_name').notNull(),
  message: text('message'), // Personal invitation message
  status: varchar('status', { length: 20 }).notNull().default('PENDING'), // 'PENDING', 'SENT', 'VIEWED', 'RESPONDED'
  sentAt: timestamp('sent_at'),
  viewedAt: timestamp('viewed_at'),
  respondedAt: timestamp('responded_at'),
  inviteCode: text('invite_code').notNull().unique(), // Unique code for tracking
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Event reminders - Scheduled notifications
export const eventReminders = pgTable('event_reminders', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull(),
  reminderType: varchar('reminder_type', { length: 30 }).notNull(), // 'EVENT_START', 'CHECKLIST_DUE', 'RSVP_REMINDER', 'CUSTOM'
  reminderTime: timestamp('reminder_time').notNull(), // When to send
  message: text('message').notNull(),
  isSent: boolean('is_sent').notNull().default(false),
  sentAt: timestamp('sent_at'),
  deliveryMethod: varchar('delivery_method', { length: 20 }).notNull().default('APP'), // 'APP', 'EMAIL', 'SMS'
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Recurring events - Support for repeating events
export const recurringEvents = pgTable('recurring_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  masterEventId: uuid('master_event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  recurrencePattern: varchar('recurrence_pattern', { length: 20 }).notNull(), // 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'
  recurrenceInterval: integer('recurrence_interval').notNull().default(1), // e.g., every 2 weeks
  daysOfWeek: jsonb('days_of_week').$type<number[]>(), // For weekly: [0,6] = Sunday, Saturday
  dayOfMonth: integer('day_of_month'), // For monthly: 15 = 15th of each month
  monthsOfYear: jsonb('months_of_year').$type<number[]>(), // For yearly: [0,11] = Jan, Dec
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date'), // null = no end date
  maxOccurrences: integer('max_occurrences'), // Alternative to end date
  generatedIds: jsonb('generated_ids').$type<string[]>().default([]), // Track created event instances
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Module 10 types
export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
export type EventAttendee = typeof eventAttendees.$inferSelect;
export type NewEventAttendee = typeof eventAttendees.$inferInsert;
export type EventWaypoint = typeof eventWaypoints.$inferSelect;
export type NewEventWaypoint = typeof eventWaypoints.$inferInsert;
export type LiveLocation = typeof liveLocations.$inferSelect;
export type NewLiveLocation = typeof liveLocations.$inferInsert;
export type EventPoll = typeof eventPolls.$inferSelect;
export type NewEventPoll = typeof eventPolls.$inferInsert;
export type PollVote = typeof pollVotes.$inferSelect;
export type NewPollVote = typeof pollVotes.$inferInsert;
export type MeetHerePin = typeof meetHerePins.$inferSelect;
export type NewMeetHerePin = typeof meetHerePins.$inferInsert;
export type EventCategory = typeof eventCategories.$inferSelect;
export type NewEventCategory = typeof eventCategories.$inferInsert;
export type EventTag = typeof eventTags.$inferSelect;
export type NewEventTag = typeof eventTags.$inferInsert;
export type EventTemplate = typeof eventTemplates.$inferSelect;
export type NewEventTemplate = typeof eventTemplates.$inferInsert;
export type EventChecklist = typeof eventChecklists.$inferSelect;
export type NewEventChecklist = typeof eventChecklists.$inferInsert;
export type EventInvitation = typeof eventInvitations.$inferSelect;
export type NewEventInvitation = typeof eventInvitations.$inferInsert;
export type EventReminder = typeof eventReminders.$inferSelect;
export type NewEventReminder = typeof eventReminders.$inferInsert;
export type RecurringEvent = typeof recurringEvents.$inferSelect;
export type NewRecurringEvent = typeof recurringEvents.$inferInsert;

// ============================================
// MODULE 11: EVENT HUB EXTENDED (Supply Chain, Guardian, Tactical)
// ============================================

// Event supplies - "Who's Bringing What?"
export const eventSupplies = pgTable('event_supplies', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  itemName: text('item_name').notNull(), // e.g., "Ice", "Charcoal", "Salad"
  quantityNeeded: text('quantity_needed').notNull().default('1'), // e.g., "2kg", "5 bottles"
  assignedToUserId: text('assigned_to_user_id'), // Who claimed it
  assignedToUserName: text('assigned_to_user_name'),
  status: varchar('status', { length: 20 }).notNull().default('PENDING'), // 'PENDING', 'CLAIMED', 'BOUGHT'
  category: varchar('category', { length: 20 }).notNull().default('OTHER'), // 'FOOD', 'DRINK', 'EQUIPMENT', 'DECORATION', 'OTHER'
  notes: text('notes'), // Special instructions
  createdAt: timestamp('created_at').notNull().defaultNow(),
  claimedAt: timestamp('claimed_at'),
  boughtAt: timestamp('bought_at'),
});

// Children profiles - For Guardian Eye
export const children = pgTable('children', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  parentId: text('parent_id').notNull(), // User ID of parent
  parentName: text('parent_name').notNull(),
  age: integer('age'), // Optional age
  allergies: text('allergies'), // Comma-separated or JSON
  emergencyNotes: text('emergency_notes'), // Medical conditions, emergency contacts
  photoUrl: text('photo_url'), // Optional photo
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Guardian assignments - Who's watching whom
export const guardianships = pgTable('guardianships', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  childId: uuid('child_id').notNull().references(() => children.id, { onDelete: 'cascade' }),
  assignedAdultId: text('assigned_adult_id').notNull(),
  assignedAdultName: text('assigned_adult_name').notNull(),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time'),
  location: text('location'), // e.g., "Pool", "Park", "House"
  status: varchar('status', { length: 20 }).notNull().default('ACTIVE'), // 'ACTIVE', 'COMPLETED', 'EMERGENCY'
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Child check-ins - Digital roll call
export const childCheckIns = pgTable('child_check_ins', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  childId: uuid('child_id').notNull().references(() => children.id, { onDelete: 'cascade' }),
  guardianId: text('guardian_id').notNull(), // Who checked them in
  guardianName: text('guardian_name').notNull(),
  status: varchar('status', { length: 30 }).notNull(), // 'SAFE_WITH_PARENT', 'PLAYING', 'WITH_GUARDIAN', 'EATING', 'MISSING'
  location: text('location'), // Where they are
  notes: text('notes'),
  checkedInAt: timestamp('checked_in_at').notNull().defaultNow(),
});

// SOS Alerts - Emergency notifications
export const sosAlerts = pgTable('sos_alerts', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  alertType: varchar('alert_type', { length: 30 }).notNull().default('LOST_CHILD'), // 'LOST_CHILD', 'MEDICAL', 'SECURITY', 'WEATHER'
  childId: uuid('child_id').references(() => children.id), // If child-related
  triggeredBy: text('triggered_by').notNull(), // User who triggered alert
  triggeredByName: text('triggered_by_name').notNull(),
  message: text('message').notNull(), // e.g., "AMY IS MISSING (Last seen: Pool)"
  lastSeenLocation: text('last_seen_location'),
  isResolved: boolean('is_resolved').notNull().default(false),
  resolvedAt: timestamp('resolved_at'),
  resolvedBy: text('resolved_by'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Dietary preferences - User food restrictions
export const dietaryPreferences = pgTable('dietary_preferences', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().unique(),
  preferences: jsonb('preferences').notNull().$type<{
    vegetarian?: boolean;
    vegan?: boolean;
    halal?: boolean;
    kosher?: boolean;
    glutenFree?: boolean;
    dairyFree?: boolean;
    nutAllergy?: boolean;
    seafoodAllergy?: boolean;
    other?: string[];
  }>().default({}),
  customNotes: text('custom_notes'),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Menu items - Feast Manager
export const menuItems = pgTable('menu_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  dishName: text('dish_name').notNull(), // e.g., "Lamb Spit", "Chicken Curry"
  description: text('description'),
  category: varchar('category', { length: 20 }).notNull().default('MAIN'), // 'STARTER', 'MAIN', 'SIDE', 'DESSERT', 'DRINK'
  servings: integer('servings'), // Expected servings
  dietaryFlags: jsonb('dietary_flags').notNull().$type<{
    vegetarian?: boolean;
    vegan?: boolean;
    halal?: boolean;
    containsNuts?: boolean;
    containsGluten?: boolean;
    containsDairy?: boolean;
    containsSeafood?: boolean;
  }>().default({}),
  ingredients: text('ingredients'), // Comma-separated or detailed list
  preparedBy: text('prepared_by'), // Who's cooking
  preparedByName: text('prepared_by_name'),
  notes: text('notes'),
  createdBy: text('created_by').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Tactical map locations - Safety and amenities
export const tacticalLocations = pgTable('tactical_locations', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  locationType: varchar('location_type', { length: 20 }).notNull(), // 'HOSPITAL', 'POLICE', 'PHARMACY', 'SUPERMARKET', 'GAS_STATION', 'PLAYGROUND'
  name: text('name').notNull(),
  address: text('address'),
  latitude: text('latitude').notNull(),
  longitude: text('longitude').notNull(),
  phoneNumber: text('phone_number'),
  placeId: text('place_id'), // Google Places ID
  distance: integer('distance'), // Distance in meters from event location
  isOpen: boolean('is_open'), // Currently open status
  fetchedAt: timestamp('fetched_at').notNull().defaultNow(),
});

// Event media - Photo/Video gallery (+ Time Capsule)
export const eventMedia = pgTable('event_media', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  uploaderId: text('uploader_id').notNull(), // User ID who uploaded
  uploaderName: text('uploader_name').notNull(),
  url: text('url').notNull(), // Storage URL
  type: varchar('type', { length: 10 }).notNull(), // 'IMAGE' | 'VIDEO'
  caption: text('caption'),
  thumbnailUrl: text('thumbnail_url'), // For videos
  mimeType: text('mime_type'), // e.g., 'image/jpeg', 'video/mp4'
  fileSize: integer('file_size'), // In bytes
  likes: integer('likes').notNull().default(0), // Heart count
  likedBy: jsonb('liked_by').$type<string[]>().default([]), // Array of user IDs
  lockedUntil: timestamp('locked_until'), // Time capsule feature - unlocks on date
  isTimeCapsule: boolean('is_time_capsule').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Event chat messages - In-event discussion
export const eventChatMessages = pgTable('event_chat_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  senderId: text('sender_id').notNull(),
  senderName: text('sender_name').notNull(),
  senderAvatar: text('sender_avatar'),
  message: text('message').notNull(),
  replyToId: uuid('reply_to_id'), // Optional reply reference
  attachments: jsonb('attachments').$type<Array<{ type: string; url: string }>>(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

// ============================================================================
// MODULE 12: FAMILY TREE & HERITAGE VAULT
// ============================================================================

// Shadow Users - Ancestors without app accounts (for complete family tree)
export const shadowUsers = pgTable('shadow_users', {
  id: uuid('id').primaryKey().defaultRandom(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name'),
  displayName: text('display_name').notNull(),
  birthYear: integer('birth_year'),
  deathYear: integer('death_year'), // null if still living
  bio: text('bio'),
  avatarUrl: text('avatar_url'),
  gender: varchar('gender', { length: 20 }), // 'MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'
  createdById: text('created_by_id').notNull(), // Who added them to the tree
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Relationships - Parent-child and partner relationships
export const relationships = pgTable('relationships', {
  id: uuid('id').primaryKey().defaultRandom(),
  // For parent-child relationships
  parentId: text('parent_id'), // Can be real user ID or shadow user ID
  childId: text('child_id'), // Can be real user ID or shadow user ID
  relationshipType: varchar('relationship_type', { length: 20 }).notNull(), // 'BIOLOGICAL', 'ADOPTED', 'STEP', 'PARTNER', 'SPOUSE'
  // For partner/spouse relationships
  partnerId: text('partner_id'), // For PARTNER/SPOUSE types
  // Metadata
  startDate: timestamp('start_date'), // Marriage date for spouses
  endDate: timestamp('end_date'), // Divorce/separation date if applicable
  notes: text('notes'),
  createdById: text('created_by_id').notNull(), // Who created this connection
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Heritage Items - Recipes, stories, traditions (the family vault)
export const heritageItems = pgTable('heritage_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  type: varchar('type', { length: 20 }).notNull(), // 'RECIPE', 'STORY', 'TRADITION', 'PHOTO', 'VIDEO'
  content: text('content').notNull(), // Rich text content (markdown or HTML)
  mediaUrl: text('media_url'), // Optional photo/video
  thumbnailUrl: text('thumbnail_url'),
  contributorId: text('contributor_id').notNull(), // Who added this
  contributorName: text('contributor_name').notNull(),
  visibility: varchar('visibility', { length: 20 }).notNull().default('FAMILY_ONLY'), // 'PUBLIC', 'FAMILY_ONLY', 'PRIVATE'
  familyId: text('family_id').references(() => families.id, { onDelete: 'cascade' }),
  // Recipe-specific fields
  prepTime: integer('prep_time'), // minutes
  cookTime: integer('cook_time'), // minutes
  servings: integer('servings'),
  difficulty: varchar('difficulty', { length: 20 }), // 'EASY', 'MEDIUM', 'HARD'
  ingredients: jsonb('ingredients').$type<Array<{ item: string; amount: string }>>(),
  steps: jsonb('steps').$type<string[]>(),
  // Story-specific fields
  storyDate: timestamp('story_date'), // When did this story take place
  tags: jsonb('tags').$type<string[]>(), // e.g., ['grandmother', 'breyani', 'wedding']
  // Engagement
  likes: integer('likes').notNull().default(0),
  likedBy: jsonb('liked_by').$type<string[]>().default([]),
  views: integer('views').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Module 11 types
export type EventSupply = typeof eventSupplies.$inferSelect;
export type NewEventSupply = typeof eventSupplies.$inferInsert;
export type Child = typeof children.$inferSelect;
export type NewChild = typeof children.$inferInsert;
export type Guardianship = typeof guardianships.$inferSelect;
export type NewGuardianship = typeof guardianships.$inferInsert;
export type ChildCheckIn = typeof childCheckIns.$inferSelect;
export type NewChildCheckIn = typeof childCheckIns.$inferInsert;
export type SosAlert = typeof sosAlerts.$inferSelect;
export type NewSosAlert = typeof sosAlerts.$inferInsert;
export type DietaryPreference = typeof dietaryPreferences.$inferSelect;
export type NewDietaryPreference = typeof dietaryPreferences.$inferInsert;
export type MenuItem = typeof menuItems.$inferSelect;
export type NewMenuItem = typeof menuItems.$inferInsert;
export type TacticalLocation = typeof tacticalLocations.$inferSelect;
export type NewTacticalLocation = typeof tacticalLocations.$inferInsert;
export type EventMedia = typeof eventMedia.$inferSelect;
export type NewEventMedia = typeof eventMedia.$inferInsert;
export type EventChatMessage = typeof eventChatMessages.$inferSelect;
export type NewEventChatMessage = typeof eventChatMessages.$inferInsert;

// Module 12 types
export type ShadowUser = typeof shadowUsers.$inferSelect;
export type NewShadowUser = typeof shadowUsers.$inferInsert;
export type Relationship = typeof relationships.$inferSelect;
export type NewRelationship = typeof relationships.$inferInsert;
export type HeritageItem = typeof heritageItems.$inferSelect;
export type NewHeritageItem = typeof heritageItems.$inferInsert;

// ============================================
// MODULE 13: APP INTEGRATIONS & AUTHENTICATION
// ============================================

// App integrations - Store API credentials for connected apps
export const appIntegrations = pgTable('app_integrations', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => users.uid, { onDelete: 'cascade' }),
  appId: varchar('app_id', { length: 50 }).notNull(), // 'LIFESTACK', 'NEXUS_OS', 'CUSTOM'
  appName: text('app_name').notNull(), // Display name
  credentials: text('credentials').notNull(), // Encrypted API key/token
  isEncrypted: boolean('is_encrypted').notNull().default(true),
  status: varchar('status', { length: 20 }).notNull().default('ACTIVE'), // 'ACTIVE', 'REVOKED', 'EXPIRED'
  connectionUrl: text('connection_url'), // OAuth redirect URL if applicable
  metadata: jsonb('metadata').$type<Record<string, any>>(), // App-specific config
  lastUsedAt: timestamp('last_used_at'),
  expiresAt: timestamp('expires_at'), // Token expiration
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// App integration logs - Audit trail
export const appIntegrationLogs = pgTable('app_integration_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  integrationId: uuid('integration_id').notNull().references(() => appIntegrations.id, { onDelete: 'cascade' }),
  action: varchar('action', { length: 30 }).notNull(), // 'CREATED', 'REVOKED', 'ACCESSED', 'FAILED'
  details: jsonb('details').$type<Record<string, any>>(), // Error message, status code, etc.
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Claude Auth sessions - For multi-device auth
export const claudeAuthSessions = pgTable('claude_auth_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => users.uid, { onDelete: 'cascade' }),
  claudeAuthId: text('claude_auth_id').unique(), // Claude's user ID
  sessionToken: text('session_token').notNull().unique(), // For device sync
  deviceId: text('device_id').notNull(), // Device identifier
  isActive: boolean('is_active').notNull().default(true),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  lastUsedAt: timestamp('last_used_at').notNull().defaultNow(),
});

// Auth linked accounts - Migration from Firebase to Claude
export const authLinkedAccounts = pgTable('auth_linked_accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().unique().references(() => users.uid, { onDelete: 'cascade' }),
  firebaseUid: text('firebase_uid'), // Old Firebase UID
  claudeAuthId: text('claude_auth_id'), // New Claude Auth ID
  migrationStatus: varchar('migration_status', { length: 20 }).notNull().default('PENDING'), // 'PENDING', 'MIGRATED', 'MERGED'
  createdAt: timestamp('created_at').notNull().defaultNow(),
  migratedAt: timestamp('migrated_at'),
});

// Event comments - Public discussion on events
export const eventComments = pgTable('event_comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  userId: text('user_id'), // NULL for anonymous
  userName: text('user_name').notNull(), // Display name
  content: text('content').notNull(),
  isAnonymous: boolean('is_anonymous').notNull().default(false),
  isApproved: boolean('is_approved').notNull().default(false),
  parentCommentId: uuid('parent_comment_id').references(() => eventComments.id, { onDelete: 'cascade' }), // For replies
  likesCount: integer('likes_count').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Comment likes - Engagement tracking
export const commentLikes = pgTable('comment_likes', {
  id: uuid('id').primaryKey().defaultRandom(),
  commentId: uuid('comment_id').notNull().references(() => eventComments.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Comment approvals - Admin moderation log
export const commentApprovals = pgTable('comment_approvals', {
  id: uuid('id').primaryKey().defaultRandom(),
  commentId: uuid('comment_id').notNull().references(() => eventComments.id, { onDelete: 'cascade' }),
  approvedBy: text('approved_by').notNull(),
  approvedAt: timestamp('approved_at').notNull().defaultNow(),
});

// ============================================
// MODULE 13: FAST-PASS GUEST RSVP
// ============================================

// Magic link RSVP tokens — one per guest invite, expires after use or TTL
export const guestRsvps = pgTable('guest_rsvps', {
  id: uuid('id').primaryKey().defaultRandom(),
  token: varchar('token', { length: 64 }).notNull().unique(), // The URL-safe token
  eventId: uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  invitedByUserId: text('invited_by_user_id').notNull(),
  guestName: text('guest_name'), // Filled when they RSVP
  guestEmail: text('guest_email'), // Optional contact
  rsvpStatus: varchar('rsvp_status', { length: 20 }).notNull().default('PENDING'), // 'PENDING', 'GOING', 'CANT_MAKE_IT'
  expiresAt: timestamp('expires_at').notNull(), // TTL for the link
  usedAt: timestamp('used_at'), // When they first opened it
  respondedAt: timestamp('responded_at'), // When they submitted
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Module 13 types - App Integrations & Auth
export type AppIntegration = typeof appIntegrations.$inferSelect;
export type NewAppIntegration = typeof appIntegrations.$inferInsert;
export type AppIntegrationLog = typeof appIntegrationLogs.$inferSelect;
export type NewAppIntegrationLog = typeof appIntegrationLogs.$inferInsert;
export type ClaudeAuthSession = typeof claudeAuthSessions.$inferSelect;
export type NewClaudeAuthSession = typeof claudeAuthSessions.$inferInsert;
export type AuthLinkedAccount = typeof authLinkedAccounts.$inferSelect;
export type NewAuthLinkedAccount = typeof authLinkedAccounts.$inferInsert;
export type EventComment = typeof eventComments.$inferSelect;
export type NewEventComment = typeof eventComments.$inferInsert;
export type CommentLike = typeof commentLikes.$inferSelect;
export type NewCommentLike = typeof commentLikes.$inferInsert;
export type CommentApproval = typeof commentApprovals.$inferSelect;
export type NewCommentApproval = typeof commentApprovals.$inferInsert;

// Module 14 types - Guest RSVP
export type GuestRsvp = typeof guestRsvps.$inferSelect;
export type NewGuestRsvp = typeof guestRsvps.$inferInsert;

// ============================================
// MODULE 15: GROUP BUDGETING & SHOPPING (NEW)
// ============================================

// Event budgets - Track shared expenses
export const eventBudgets = pgTable('event_budgets', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id').notNull().unique().references(() => events.id, { onDelete: 'cascade' }),
  totalBudget: integer('total_budget').notNull(), // In cents for precision (e.g., 50000 = R500)
  perPersonAmount: integer('per_person_amount').notNull(), // Individual share in cents
  currency: varchar('currency', { length: 3 }).notNull().default('ZAR'),
  description: text('description'), // e.g., "R100 per person for food & drinks"
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Event contributions - Who paid what
export const eventContributions = pgTable('event_contributions', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull(),
  userName: text('user_name').notNull(),
  amount: integer('amount').notNull(), // In cents
  paymentMethod: varchar('payment_method', { length: 20 }).notNull().default('OTHER'), // 'CASH', 'BANK_TRANSFER', 'OTHER', 'PENDING'
  notes: text('notes'), // e.g., "Paid via Capitec"
  paidAt: timestamp('paid_at').notNull().defaultNow(),
  status: varchar('status', { length: 20 }).notNull().default('CONFIRMED'), // 'PENDING', 'CONFIRMED'
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Shopping list items - What needs to be bought
export const shoppingListItems = pgTable('shopping_list_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  itemName: text('item_name').notNull(), // e.g., "Coca-Cola 2L"
  category: varchar('category', { length: 30 }).notNull().default('OTHER'), // 'DRINKS', 'SNACKS', 'FOOD', 'EQUIPMENT', 'DECORATION', 'OTHER'
  quantity: text('quantity').notNull(), // e.g., "3", "2L", "1 case"
  estimatedPrice: integer('estimated_price'), // In cents, optional
  suggestedShop: text('suggested_shop'), // e.g., "Checkers Muizenberg"
  shopCoordinates: jsonb('shop_coordinates').$type<{ lat: number; lng: number; placeId: string }>(),
  assignedToUserId: text('assigned_to_user_id'), // Who's buying
  assignedToUserName: text('assigned_to_user_name'),
  status: varchar('status', { length: 20 }).notNull().default('PENDING'), // 'PENDING', 'CLAIMED', 'BOUGHT', 'DELIVERED'
  boughtAt: timestamp('bought_at'),
  actualPrice: integer('actual_price'), // Actual price paid
  notes: text('notes'), // e.g., "Prefer diet coke"
  aiSuggested: boolean('ai_suggested').notNull().default(false), // Was this AI-generated?
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Shop recommendations - Nearby stores with details
export const shopRecommendations = pgTable('shop_recommendations', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  shopName: text('shop_name').notNull(), // e.g., "Checkers Muizenberg"
  shopType: varchar('shop_type', { length: 30 }).notNull(), // 'SUPERMARKET', 'CONVENIENCE', 'SPECIALTY', 'WAREHOUSE'
  address: text('address').notNull(),
  latitude: text('latitude').notNull(),
  longitude: text('longitude').notNull(),
  distance: integer('distance'), // In meters from event location
  openingHours: jsonb('opening_hours').$type<{ open: string; close: string; days: string[] }>(),
  website: text('website'),
  phone: text('phone'),
  rating: integer('rating'), // 0-5 stars
  imageUrl: text('image_url'),
  placeId: text('place_id'), // Google Places ID or similar
  notes: text('notes'), // Why we recommend it
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Event suggestions - AI-generated recommendations
export const eventSuggestions = pgTable('event_suggestions', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  suggestionType: varchar('suggestion_type', { length: 30 }).notNull(), // 'DRINK', 'SNACK', 'ITEM', 'SHOP', 'ACTIVITY'
  title: text('title').notNull(), // e.g., "Coca-Cola 2L"
  description: text('description'), // Why suggested
  category: varchar('category', { length: 30 }), // For items/drinks/snacks
  quantity: text('quantity'), // How much needed
  estimatedPrice: integer('estimated_price'), // In cents
  reason: text('reason'), // AI reasoning
  confidence: integer('confidence').notNull().default(80), // 0-100, how confident the AI is
  accepted: boolean('accepted').notNull().default(false),
  addedToList: boolean('added_to_list').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Module 15 types
export type EventBudget = typeof eventBudgets.$inferSelect;
export type NewEventBudget = typeof eventBudgets.$inferInsert;
export type EventContribution = typeof eventContributions.$inferSelect;
export type NewEventContribution = typeof eventContributions.$inferInsert;
export type ShoppingListItem = typeof shoppingListItems.$inferSelect;
export type NewShoppingListItem = typeof shoppingListItems.$inferInsert;
export type ShopRecommendation = typeof shopRecommendations.$inferSelect;
export type NewShopRecommendation = typeof shopRecommendations.$inferInsert;
export type EventSuggestion = typeof eventSuggestions.$inferSelect;
export type NewEventSuggestion = typeof eventSuggestions.$inferInsert;

// ============================================
// SYSTEM API KEYS (Imported from apiKeys.ts for Drizzle tracking)
// ============================================
export { apiKeys } from './apiKeys';


