export type Subject = 
  | 'Physics' 
  | 'Chemistry' 
  | 'Math' 
  | 'Biology' 
  | 'Earth Science' 
  | 'Geography' 
  | 'IT / Computer Science' 
  | 'Robotics';

export type GradeLevel = 'K-2' | '3-5' | '6-8' | '9-12';

export type Difficulty = 'Exploratory' | 'Introductory' | 'Intermediate' | 'Advanced';

export interface Simulation {
  id: string;
  phetId?: number;
  slug: string;
  title: string;
  description: string;
  learningGoals?: string;
  subject: Subject;
  file: string;
  directUrl: string;
  thumbnail: string;
  grades: string[];
  languages: string[];
  keywords: string[];
  featured?: boolean;
  version?: string;
  difficulty?: Difficulty;
  relatedIds?: string[];
  related?: Simulation[];
}

export type UserRole = 'STUDENT' | 'TEACHER' | 'ADMIN' | 'SUPER_ADMIN' | 'student' | 'teacher' | 'admin' | 'super_admin';

export interface UserLearningActivity {
  simulationsExplored: number;
  inquiriesCompleted: number;
  favoritesCount: number;
  lastActive?: string;
}

export interface User {
  id: string;
  clerkUserId?: string;
  name: string;
  displayName?: string;
  email: string;
  username?: string;
  role: UserRole;
  subject?: Subject;
  grade?: string; // e.g. '5', '6', '7', '8', '9', '10', '11', 'university', 'all'
  avatar?: string;
  bio?: string;
  createdAt: string;
  updatedAt?: string;
  learningActivity?: UserLearningActivity;
  authoredSimulations?: string[]; // IDs of simulations created by this user
}

export type ActivityStatus = 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';

export interface TeacherActivity {
  id: string;
  title: string;
  simulationId: string;
  simulationTitle?: string;
  subject: Subject;
  grade: string;
  difficulty: Difficulty;
  objective: string;
  questions?: string[];
  templateId: 'guided-inquiry' | 'concept-challenge' | 'free-exploration' | 'lab-worksheet';
  configuration?: Record<string, unknown>;
  status: ActivityStatus;
  feedback?: string;
  teacherId: string;
  teacherName: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubjectSummary {
  subject: Subject;
  count: number;
  description: string;
  accentColor: string;
}

export interface CatalogStats {
  totalSimulations: number;
  subjectCounts: Record<string, number>;
  gradeCounts: Record<string, number>;
  activeLearners: number;
  totalExplorations: number;
}

export interface FavoriteItem {
  id: string;
  userId: string;
  simulationId: string;
  createdAt: string;
}

export interface RecentItem {
  id: string;
  userId: string;
  simulationId: string;
  lastAccessedAt: string;
}

export interface Banner {
  id: string;
  message: string;
  tag: string;
  link?: string;
  active: boolean;
}

// AI Conversation Types
export interface AiChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string; // e.g. "14:31"
  simulationId?: string;
  mode?: string;
  fallback?: boolean;
}

export interface AiConversation {
  id: string;
  userId: string;
  title: string;
  subject?: Subject;
  simulationId?: string;
  messages: AiChatMessage[];
  createdAt: string;
  updatedAt: string;
}

// Community & Class Chat Types
export interface CommunityConversation {
  id: string;
  name: string;
  type: 'direct' | 'group' | 'announcement';
  subject?: Subject;
  grade?: string; // e.g. '5', '6', '7', '8', '9', '10', '11', 'university', 'all'
  teacherId?: string;
  teacherName?: string;
  members: string[]; // userIds
  avatar?: string;
  lastMessage?: string;
  lastMessageTimestamp?: string;
  unreadCount?: number;
  description?: string;
}

export interface CommunityMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  senderAvatar?: string;
  content: string;
  timestamp: string; // e.g. "14:35"
  createdAt: string;
  reactions?: Record<string, string[]>; // emoji -> [userIds]
  simulationAttachment?: {
    id: string;
    title: string;
    subject: Subject;
    thumbnail?: string;
  };
  isAnnouncement?: boolean;
}

export interface ModerationReport {
  id: string;
  reporterId: string;
  reporterName: string;
  targetType: 'user' | 'message';
  targetId: string;
  targetContent?: string;
  reason: string;
  status: 'pending' | 'reviewed' | 'dismissed' | 'action_taken';
  timestamp: string;
}
