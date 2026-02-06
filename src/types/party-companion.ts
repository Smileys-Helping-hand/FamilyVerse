/**
 * Party Companion App - TypeScript Type Definitions
 * Extends the existing types from the schema
 */

// ============================================
// MODULE 1: PARTY BRAIN TYPES
// ============================================

export interface AssetInput {
  name: string;
  type: 'digital' | 'analog' | 'food';
  isSetupRequired: boolean;
  tags: string[];
  description?: string;
}

export interface PreferencesInput {
  dietaryRestrictions?: string[];
  favorites?: string[];
  allergens?: string[];
  additionalNotes?: string;
}

export interface GenerateEventPlanInput {
  eventId: number;
  hostId: string;
  eventType: string;
  duration: number; // hours
  attendees: number;
}

export interface EventActivity {
  name: string;
  duration: number; // minutes
  startTime: string; // HH:MM format
  assetIds: number[];
  participants: number;
}

export interface GeneratedSchedule {
  activities: EventActivity[];
  suggestions: string[];
}

// ============================================
// MODULE 2: LEADERBOARD TYPES
// ============================================

export type ScoringType = 'TIME_ASC' | 'SCORE_DESC';

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  scoreValue: number;
  rank: number;
  proofImageUrl?: string | null;
  createdAt: Date;
}

export interface PartyMVPEntry {
  userId: string;
  userName: string;
  metaPoints: number;
  gamesWon: number;
  totalGames: number;
}

export interface SubmitScoreInput {
  gameId: number;
  userId: string;
  eventId: number;
  scoreValue: number;
  proofImageUrl?: string;
}

export interface CreateGameInput {
  name: string;
  scoringType: ScoringType;
  icon?: string;
  description?: string;
}

// ============================================
// MODULE 3: IMPOSTER GAME TYPES
// ============================================

export type GameSessionStatus = 'LOBBY' | 'ACTIVE' | 'VOTE' | 'ENDED';
export type PlayerRole = 'CIVILIAN' | 'IMPOSTER';

export interface CreateGameSessionInput {
  eventId: number;
  secretTopic: string;
  imposterHint: string;
}

export interface JoinGameInput {
  sessionId: string;
  userId: string;
  userName: string;
}

export interface PlayerRoleInfo {
  role: PlayerRole;
  information: string;
  isAlive: boolean;
}

export interface GamePlayer {
  id: number;
  userId: string;
  userName: string;
  isAlive: boolean;
  votesReceived: number;
}

export interface GameStateResponse {
  session: {
    id: string;
    status: GameSessionStatus;
    round: number;
    votingEnabled: boolean;
  };
  players: GamePlayer[];
}

export interface EliminationResult {
  eliminated: {
    userId: string;
    userName: string;
    role: PlayerRole;
  };
  winner: 'CIVILIANS' | 'IMPOSTER' | null;
}

// ============================================
// MODULE 4: EXPENSE TYPES
// ============================================

export interface ExpenseItem {
  name: string;
  price: number;
  quantity: number;
}

export interface ExtractedReceiptData {
  total: number;
  merchant: string;
  items: ExpenseItem[];
}

export interface ExpenseSplit {
  expenseId: number;
  userId: string;
  amountOwed: number; // in cents
  isPaid: boolean;
  paidAt?: Date | null;
}

export interface ExpenseWithSplits {
  id: number;
  eventId: number;
  payerId: string;
  totalAmount: number; // in cents
  merchant?: string | null;
  receiptUrl?: string | null;
  description?: string | null;
  aiExtractedData?: ExtractedReceiptData | null;
  createdAt: Date;
  splits: ExpenseSplit[];
}

export interface CreateExpenseFromReceiptInput {
  eventId: number;
  payerId: string;
  file: File;
  splitWith: string[];
}

export interface CreateManualExpenseInput {
  eventId: number;
  payerId: string;
  totalAmount: number; // in cents
  merchant?: string;
  description?: string;
  splitWith: string[];
}

export interface UserExpenseSummary {
  totalPaid: number; // in dollars
  totalOwed: number; // in dollars
  netBalance: number; // in dollars
  unpaidSplits: ExpenseSplit[];
}

// ============================================
// SERVER ACTION RESPONSE TYPES
// ============================================

export interface ServerActionSuccess<T> {
  success: true;
  data: T;
}

export interface ServerActionError {
  success: false;
  error: string;
}

export type ServerActionResponse<T> = ServerActionSuccess<T> | ServerActionError;

// ============================================
// UTILITY TYPES
// ============================================

export interface Friend {
  id: string;
  name: string;
  avatar?: string;
}

export interface EventMetadata {
  id: number;
  name: string;
  date: Date;
  attendeeCount: number;
  hostId: string;
}

// ============================================
// COMPONENT PROP TYPES
// ============================================

export interface LiveLeaderboardProps {
  gameId: number;
  eventId: number;
  gameName: string;
  scoringType: ScoringType;
  refreshInterval?: number;
}

export interface PartyMVPLeaderboardProps {
  eventId: number;
  refreshInterval?: number;
}

export interface ImposterDashboardProps {
  sessionId: string;
  userId: string;
  isHost: boolean;
}

export interface RoleRevealCardProps {
  role: PlayerRole;
  information: string;
  onRevealed?: () => void;
}

export interface ExpenseScannerProps {
  eventId: number;
  payerId: string;
  availableFriends: Friend[];
  onSuccess?: () => void;
}

export interface PartyHubProps {
  eventId: number;
  userId: string;
  isHost?: boolean;
}

// ============================================
// TYPE GUARDS
// ============================================

export function isServerActionSuccess<T>(
  response: ServerActionResponse<T>
): response is ServerActionSuccess<T> {
  return response.success === true;
}

export function isServerActionError<T>(
  response: ServerActionResponse<T>
): response is ServerActionError {
  return response.success === false;
}

// ============================================
// CONSTANTS
// ============================================

export const META_POINTS = {
  FIRST_PLACE: 10,
  SECOND_PLACE: 5,
  THIRD_PLACE: 3,
  PARTICIPATION: 1,
} as const;

export const GAME_SESSION_STATUS = {
  LOBBY: 'LOBBY',
  ACTIVE: 'ACTIVE',
  VOTE: 'VOTE',
  ENDED: 'ENDED',
} as const;

export const PLAYER_ROLES = {
  CIVILIAN: 'CIVILIAN',
  IMPOSTER: 'IMPOSTER',
} as const;

export const ASSET_TYPES = {
  DIGITAL: 'digital',
  ANALOG: 'analog',
  FOOD: 'food',
} as const;

export const SCORING_TYPES = {
  TIME_ASC: 'TIME_ASC',
  SCORE_DESC: 'SCORE_DESC',
} as const;

// ============================================
// VALIDATION SCHEMAS (for use with zod if needed)
// ============================================

export const MIN_PLAYERS_FOR_IMPOSTER_GAME = 3;
export const MAX_RECEIPT_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const LEADERBOARD_REFRESH_INTERVAL = 10000; // 10 seconds
export const GAME_STATE_REFRESH_INTERVAL = 3000; // 3 seconds
