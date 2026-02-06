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
  pinCode: text('pin_code').unique(), // SECRET PIN for admin/host login (e.g., 'admin-9999')
  avatarUrl: text('avatar_url'),
  walletBalance: integer('wallet_balance').notNull().default(1000), // Party currency
  role: varchar('role', { length: 20 }).notNull().default('guest'), // 'admin', 'host', 'guest'
  status: varchar('status', { length: 20 }).notNull().default('approved'), // 'pending', 'approved', 'rejected'
  partyId: uuid('party_id'), // Which party they joined
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Party Games (Sim Racing, Imposter, Dominoes, etc.)
export const partyGames = pgTable('party_games', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  type: varchar('type', { length: 20 }).notNull(), // 'SIM_RACE', 'IMPOSTER', 'DOMINOES', 'OTHER'
  status: varchar('status', { length: 20 }).notNull().default('OPEN'), // 'OPEN', 'LOCKED', 'FINISHED'
  raceState: varchar('race_state', { length: 20 }).notNull().default('REGISTRATION'), // 'REGISTRATION', 'BETTING_OPEN', 'RACE_STARTED', 'FINISHED'
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
  status: varchar('status', { length: 20 }).notNull().default('ACTIVE'), // 'ACTIVE', 'VOTING', 'REVEALED'
  imposterId: uuid('imposter_id').notNull().references(() => partyUsers.id),
  secretWord: text('secret_word').notNull(), // The word civilians see
  imposterHint: text('imposter_hint').notNull(), // The hint imposter sees
  round: integer('round').notNull().default(1),
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
