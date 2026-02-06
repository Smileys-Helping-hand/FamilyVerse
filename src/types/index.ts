import type { Timestamp } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  email: string | null;
  name: string | null;
  familyId: string | null;
  familyName: string | null;
  role: 'admin' | 'member' | null;
}

export interface Family {
  id: string;
  name:string;
  joinCode: string;
  creatorId: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  gender: 'male' | 'female' | 'other';
  birthDate: Timestamp | null;
  deathDate: Timestamp | null;
  photoUrl: string | null;
  parents: string[];
  spouses: string[];
  children: string[];
  addedBy: string;
  createdAt: Timestamp;
}

export interface ActivityLog {
  id: string;
  user: string; // User's name or email
  action: string;
  timestamp: Timestamp;
  details: string;
}

// Parental Control Types
export interface ChildProfile {
  id: string;
  name: string;
  age: number;
  birthDate: Timestamp;
  parentId: string;
  familyMemberId?: string; // Link to family tree member
  avatar?: string;
  createdAt: Timestamp;
}

export interface ContentPolicy {
  childId: string;
  ageRating: 'all' | 'kid' | 'teen' | 'mature'; // Content age ratings
  allowedCategories: string[]; // ['educational', 'entertainment', 'creative', 'social']
  blockedKeywords: string[];
  requireApproval: boolean; // Require parent approval for new content
  educationalPriority: boolean; // Prioritize educational content
  screenTimeEnabled: boolean;
  updatedAt: Timestamp;
}

export interface ScreenTimeRules {
  childId: string;
  dailyLimitMinutes: number;
  weeklyLimitMinutes: number;
  allowedHours: {
    start: string; // "08:00"
    end: string; // "20:00"
  };
  bedtimeMode: {
    enabled: boolean;
    start: string; // "21:00"
    end: string; // "07:00"
  };
  breakReminders: {
    enabled: boolean;
    intervalMinutes: number; // Remind every X minutes
  };
  deviceFreeZones: string[]; // ['bedroom', 'dining']
  updatedAt: Timestamp;
}

export interface ActivityReport {
  id: string;
  childId: string;
  date: Timestamp;
  screenTimeMinutes: number;
  contentViewed: {
    category: string;
    title: string;
    duration: number;
    educational: boolean;
    timestamp: Timestamp;
  }[];
  interactions: {
    type: string; // 'message', 'post', 'comment'
    content: string;
    flagged: boolean;
    timestamp: Timestamp;
  }[];
  achievements: {
    type: 'educational' | 'creative' | 'social';
    title: string;
    description: string;
    timestamp: Timestamp;
  }[];
  alerts: {
    type: 'screen_time' | 'inappropriate_content' | 'unusual_activity';
    message: string;
    severity: 'low' | 'medium' | 'high';
    timestamp: Timestamp;
  }[];
}

export interface ParentalControls {
  id: string;
  parentId: string;
  familyId: string;
  children: ChildProfile[];
  enabled: boolean;
  notificationsEnabled: boolean;
  weeklyReportsEnabled: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Group Feature Types (Postgres-based)
export interface Group {
  id: number;
  name: string;
  description: string;
  type: 'trip' | 'event' | 'project' | 'other';
  joinCode: string;
  creatorId: string;
  memberIds: string[];
  createdAt: Date;
  startDate?: Date | null;
  endDate?: Date | null;
  location?: string | null;
  coverImage?: string | null;
}

export interface GroupMember {
  userId: string;
  userName: string;
  email: string;
  role: 'admin' | 'member';
  joinedAt: Date;
}

export interface ChecklistItem {
  id: number;
  groupId: number;
  title: string;
  description?: string | null;
  category: 'packing' | 'todo' | 'shopping' | 'other';
  completed: boolean;
  assignedTo?: string | null;
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date | null;
  createdBy: string;
  createdAt: Date;
  completedAt?: Date | null;
  completedBy?: string | null;
}

export interface Recommendation {
  id: number;
  groupId: number;
  type: 'activity' | 'restaurant' | 'accommodation' | 'attraction' | 'other';
  title: string;
  description: string;
  location?: string | null;
  url?: string | null;
  imageUrl?: string | null;
  rating?: number | null;
  price?: '$' | '$$' | '$$$' | '$$$$' | null;
  notes?: string | null;
  suggestedBy: string;
  votes: { userId: string; vote: 'up' | 'down' }[];
  createdAt: Date;
}
