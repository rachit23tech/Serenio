/**
 * wellness.ts - Type definitions for comprehensive wellness tracking
 */

export type EmotionState = 
  | 'anxious' 
  | 'sad' 
  | 'angry' 
  | 'stressed' 
  | 'lonely' 
  | 'tired'
  | 'positive' 
  | 'neutral'
  | 'overwhelmed';

export interface ConversationContext {
  recentMessages: Array<{
    role: 'user' | 'assistant';
    text: string;
    timestamp: Date;
    emotion?: EmotionState;
  }>;
  userName?: string;
  userPronouns?: string;
  ongoingSituations: Array<{
    id: string;
    description: string;
    lastMentioned: Date;
    resolved: boolean;
  }>;
  triggers: string[];
  copingStrategies: Array<{
    strategy: string;
    effectiveness: number; // 1-10
    lastUsed?: Date;
  }>;
  importantPeople: Array<{
    name: string;
    relationship: string;
  }>;
  therapistName?: string;
  nextTherapySession?: Date;
}

export interface CrisisLevel {
  level: 'none' | 'mild' | 'moderate' | 'severe';
  detectedKeywords: string[];
  timestamp: Date;
}

export interface CopingTool {
  id: string;
  type: 'breathing' | 'grounding' | 'distraction' | 'physical' | 'social' | 'emergency';
  name: string;
  description: string;
  duration: string; // e.g., "4 minutes"
  effectiveFor: EmotionState[];
  instructions: string[];
  icon: string;
}

export interface GuidedExercise {
  id: string;
  type: 'cbt' | 'gratitude' | 'values' | 'goal' | 'sleep' | 'compassion';
  name: string;
  description: string;
  durationMinutes: number;
  steps: Array<{
    stepNumber: number;
    title: string;
    prompt: string;
    userInput?: string;
  }>;
  completedAt?: Date;
}

export interface SleepEntry {
  date: Date;
  bedTime: string; // "23:30"
  wakeTime: string; // "07:00"
  hoursSlept: number;
  quality: 1 | 2 | 3 | 4 | 5; // 1=terrible, 5=excellent
  caffeineAfterNoon: boolean;
  screenTimeBeforeBed: boolean;
  notes?: string;
}

export interface RoutineEntry {
  date: Date;
  type: 'morning' | 'evening' | 'exercise' | 'social' | 'selfcare';
  completed: boolean;
  notes?: string;
}

export interface MedicationReminder {
  id: string;
  name: string;
  dosage: string;
  times: string[]; // ["08:00", "20:00"]
  frequency: 'daily' | 'weekly' | 'asneeded';
  enabled: boolean;
  sideEffects?: string[];
}

export interface Appointment {
  id: string;
  type: 'therapy' | 'doctor' | 'psychiatrist' | 'other';
  providerName: string;
  date: Date;
  time: string;
  notes?: string;
  reminder: boolean;
}

export interface TherapistPrep {
  id: string;
  nextSessionDate: Date;
  topicsToDiscuss: string[];
  questionsToAsk: string[];
  progressToShare: string[];
  concernsToMention: string[];
  lastSessionNotes?: string;
}

export interface TriggerWarning {
  id: string;
  trigger: string;
  description: string;
  copingPlan: string;
  supportContacts: string[];
  createdAt: Date;
}

export interface Accountability {
  id: string;
  goal: string;
  type: 'daily' | 'weekly' | 'once';
  targetDate?: Date;
  completed: boolean;
  completedAt?: Date;
  checkIns: Array<{
    date: Date;
    progress: string;
    mood: string;
  }>;
}

export interface VentingSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  rawText: string; // Unfiltered venting
  noAdvice: boolean;
  private: boolean; // Never logged in regular history
}

export interface SentimentAnalysis {
  overall: 'very_negative' | 'negative' | 'neutral' | 'positive' | 'very_positive';
  emotions: Array<{
    emotion: EmotionState;
    confidence: number; // 0-1
  }>;
  urgency: number; // 0-1, how urgent the situation feels
  energyLevel: number; // 0-1, how much energy user has
  masking: boolean; // Saying "I'm fine" but sentiment shows otherwise
}

export interface AppNotification {
  id: string;
  type: 'medication' | 'appointment' | 'mood_checkin' | 'exercise' | 'celebration' | 'reminder' | 'crisis';
  title: string;
  message: string;
  scheduledFor: Date;
  delivered: boolean;
  deliveredAt?: Date;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  actions?: Array<{
    label: string;
    action: string; // Action identifier
  }>;
  relatedId?: string; // ID of related medication, appointment, etc.
  persistent?: boolean; // Stay visible until dismissed
}

export interface NotificationSettings {
  enabled: boolean;
  medicationReminders: boolean;
  appointmentReminders: boolean;
  moodCheckins: boolean;
  exercisePrompts: boolean;
  celebrations: boolean;
  quiet: {
    enabled: boolean;
    startTime: string; // "22:00"
    endTime: string; // "08:00"
  };
  reminderTiming: {
    medicationBefore: number; // minutes before
    appointmentBefore: number; // minutes before
    moodCheckinInterval: number; // hours between mood check-ins
  };
}

export interface MoodRecommendation {
  id: string;
  mood: EmotionState;
  activities: Array<{
    id: string;
    type: 'exercise' | 'breathing' | 'journaling' | 'music' | 'movement' | 'social' | 'creative' | 'rest';
    title: string;
    description: string;
    duration: string; // "5-10 minutes"
    difficulty: 'easy' | 'moderate' | 'challenging';
    icon: string;
    instructions?: string[];
    externalLink?: string;
  }>;
  reasoning: string; // Why these activities were recommended
}

export interface ActivityCompletion {
  id: string;
  activityId: string;
  completedAt: Date;
  mood: EmotionState;
  moodAfter?: EmotionState;
  effectiveness: number; // 1-5 rating
  notes?: string;
}
