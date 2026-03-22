/**
 * NotificationContext.tsx - Comprehensive notification system
 */

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { AppNotification, NotificationSettings, MoodRecommendation, ActivityCompletion, EmotionState } from '../types/wellness';

interface NotificationContextType {
  // Notifications
  notifications: AppNotification[];
  unreadCount: number;
  scheduleNotification: (notification: Omit<AppNotification, 'id' | 'delivered'>) => void;
  markAsDelivered: (id: string) => void;
  dismissNotification: (id: string) => void;
  clearAllNotifications: () => void;
  
  // Settings
  settings: NotificationSettings;
  updateSettings: (updates: Partial<NotificationSettings>) => void;
  requestPermission: () => Promise<boolean>;
  hasPermission: boolean;
  
  // Mood Recommendations
  recommendations: MoodRecommendation[];
  getRecommendations: (mood: EmotionState, context?: any) => MoodRecommendation;
  completeActivity: (completion: Omit<ActivityCompletion, 'id'>) => void;
  activityCompletions: ActivityCompletion[];
  
  // Smart scheduling
  scheduleMedicationReminder: (medicationId: string, time: string) => void;
  scheduleAppointmentReminder: (appointmentId: string, appointmentDate: Date) => void;
  scheduleMoodCheckin: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

const STORAGE_KEYS = {
  NOTIFICATIONS: 'serenio-notifications',
  SETTINGS: 'serenio-notification-settings',
  RECOMMENDATIONS: 'serenio-mood-recommendations',
  COMPLETIONS: 'serenio-activity-completions',
};

// Default notification settings
const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  medicationReminders: true,
  appointmentReminders: true,
  moodCheckins: true,
  exercisePrompts: true,
  celebrations: true,
  quiet: {
    enabled: false,
    startTime: '22:00',
    endTime: '08:00',
  },
  reminderTiming: {
    medicationBefore: 15, // 15 minutes before
    appointmentBefore: 60, // 1 hour before
    moodCheckinInterval: 4, // every 4 hours
  },
};

// Mood-based activity recommendations
const MOOD_ACTIVITIES: Record<EmotionState, MoodRecommendation['activities']> = {
  anxious: [
    {
      id: 'box-breathing',
      type: 'breathing',
      title: '4-7-8 Breathing',
      description: 'Calm your nervous system with this proven breathing technique',
      duration: '3-5 minutes',
      difficulty: 'easy',
      icon: '🫁',
      instructions: [
        'Inhale through nose for 4 counts',
        'Hold breath for 7 counts',
        'Exhale through mouth for 8 counts',
        'Repeat 4-8 times',
      ],
    },
    {
      id: 'grounding-5-4-3-2-1',
      type: 'exercise',
      title: '5-4-3-2-1 Grounding',
      description: 'Use your senses to anchor yourself in the present moment',
      duration: '5-10 minutes',
      difficulty: 'easy',
      icon: '🌱',
      instructions: [
        'Name 5 things you can see',
        'Name 4 things you can touch',
        'Name 3 things you can hear',
        'Name 2 things you can smell',
        'Name 1 thing you can taste',
      ],
    },
    {
      id: 'progressive-muscle-relaxation',
      type: 'exercise',
      title: 'Progressive Muscle Relaxation',
      description: 'Release physical tension to calm your mind',
      duration: '10-15 minutes',
      difficulty: 'moderate',
      icon: '💪',
    },
  ],
  sad: [
    {
      id: 'gentle-movement',
      type: 'movement',
      title: 'Gentle Movement',
      description: 'Light stretching or walking to boost mood',
      duration: '10-20 minutes',
      difficulty: 'easy',
      icon: '🚶',
    },
    {
      id: 'gratitude-journaling',
      type: 'journaling',
      title: 'Gratitude Journaling',
      description: 'Write down 3 things you\'re grateful for today',
      duration: '5-10 minutes',
      difficulty: 'easy',
      icon: '📝',
    },
    {
      id: 'uplifting-music',
      type: 'music',
      title: 'Uplifting Playlist',
      description: 'Listen to music that makes you feel good',
      duration: '15-30 minutes',
      difficulty: 'easy',
      icon: '🎵',
    },
    {
      id: 'reach-out',
      type: 'social',
      title: 'Connect with Someone',
      description: 'Text or call a friend or family member',
      duration: '10-30 minutes',
      difficulty: 'moderate',
      icon: '📱',
    },
  ],
  angry: [
    {
      id: 'intense-exercise',
      type: 'movement',
      title: 'Physical Exercise',
      description: 'Channel anger into physical activity',
      duration: '15-30 minutes',
      difficulty: 'challenging',
      icon: '🏃',
    },
    {
      id: 'anger-journaling',
      type: 'journaling',
      title: 'Express Your Feelings',
      description: 'Write freely about what\'s making you angry',
      duration: '10-15 minutes',
      difficulty: 'moderate',
      icon: '✍️',
    },
    {
      id: 'cold-water',
      type: 'exercise',
      title: 'Cold Water Technique',
      description: 'Splash cold water on face or hold ice cubes',
      duration: '2-5 minutes',
      difficulty: 'easy',
      icon: '❄️',
    },
  ],
  stressed: [
    {
      id: 'priority-list',
      type: 'exercise',
      title: 'Priority List',
      description: 'Write down what needs to be done and prioritize',
      duration: '10-15 minutes',
      difficulty: 'moderate',
      icon: '📋',
    },
    {
      id: 'meditation',
      type: 'breathing',
      title: 'Short Meditation',
      description: 'Guided meditation or mindful breathing',
      duration: '5-10 minutes',
      difficulty: 'easy',
      icon: '🧘',
    },
    {
      id: 'break-time',
      type: 'rest',
      title: 'Take a Break',
      description: 'Step away from stressful tasks for a few minutes',
      duration: '10-20 minutes',
      difficulty: 'easy',
      icon: '⏸️',
    },
  ],
  lonely: [
    {
      id: 'video-call',
      type: 'social',
      title: 'Video Call Friend',
      description: 'Connect face-to-face with someone you care about',
      duration: '20-60 minutes',
      difficulty: 'moderate',
      icon: '📹',
    },
    {
      id: 'online-community',
      type: 'social',
      title: 'Join Online Community',
      description: 'Participate in a forum or social group with shared interests',
      duration: '15-30 minutes',
      difficulty: 'easy',
      icon: '👥',
    },
    {
      id: 'self-care',
      type: 'rest',
      title: 'Self-Care Activity',
      description: 'Do something nurturing just for you',
      duration: '20-60 minutes',
      difficulty: 'easy',
      icon: '🛁',
    },
  ],
  tired: [
    {
      id: 'power-nap',
      type: 'rest',
      title: 'Power Nap',
      description: 'Short 10-20 minute nap to recharge',
      duration: '10-20 minutes',
      difficulty: 'easy',
      icon: '😴',
    },
    {
      id: 'energizing-breath',
      type: 'breathing',
      title: 'Energizing Breath Work',
      description: 'Breathing exercises to boost energy',
      duration: '5-10 minutes',
      difficulty: 'easy',
      icon: '⚡',
    },
    {
      id: 'hydrate-snack',
      type: 'rest',
      title: 'Hydrate & Healthy Snack',
      description: 'Drink water and have a nutritious snack',
      duration: '5-10 minutes',
      difficulty: 'easy',
      icon: '🥤',
    },
  ],
  overwhelmed: [
    {
      id: 'brain-dump',
      type: 'journaling',
      title: 'Brain Dump',
      description: 'Write down everything on your mind without editing',
      duration: '10-15 minutes',
      difficulty: 'easy',
      icon: '🧠',
    },
    {
      id: 'one-thing',
      type: 'exercise',
      title: 'Just One Thing',
      description: 'Pick just one small task to focus on',
      duration: '15-30 minutes',
      difficulty: 'moderate',
      icon: '🎯',
    },
    {
      id: 'calming-environment',
      type: 'rest',
      title: 'Create Calm Space',
      description: 'Dim lights, reduce noise, make your space peaceful',
      duration: '5-10 minutes',
      difficulty: 'easy',
      icon: '🕯️',
    },
  ],
  positive: [
    {
      id: 'celebrate',
      type: 'creative',
      title: 'Celebrate Your Mood',
      description: 'Do something creative or fun to maintain this feeling',
      duration: '15-30 minutes',
      difficulty: 'easy',
      icon: '🎉',
    },
    {
      id: 'share-joy',
      type: 'social',
      title: 'Share Your Joy',
      description: 'Tell someone about something good in your life',
      duration: '10-20 minutes',
      difficulty: 'easy',
      icon: '😊',
    },
    {
      id: 'creative-activity',
      type: 'creative',
      title: 'Creative Expression',
      description: 'Draw, write, sing, or create something',
      duration: '20-60 minutes',
      difficulty: 'moderate',
      icon: '🎨',
    },
  ],
  neutral: [
    {
      id: 'mood-check',
      type: 'exercise',
      title: 'Deeper Mood Check',
      description: 'Take a moment to really notice how you\'re feeling',
      duration: '5-10 minutes',
      difficulty: 'easy',
      icon: '🤔',
    },
    {
      id: 'gentle-exercise',
      type: 'movement',
      title: 'Gentle Movement',
      description: 'Light stretching or a short walk',
      duration: '10-20 minutes',
      difficulty: 'easy',
      icon: '🚶',
    },
    {
      id: 'mindfulness',
      type: 'breathing',
      title: 'Mindfulness Practice',
      description: 'Simple awareness of the present moment',
      duration: '5-15 minutes',
      difficulty: 'easy',
      icon: '🌸',
    },
  ],
};

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    return JSON.parse(item, (key, value) => {
      if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
        return new Date(value);
      }
      return value;
    });
  } catch {
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Failed to save ${key}:`, e);
  }
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    loadFromStorage(STORAGE_KEYS.NOTIFICATIONS, [])
  );
  
  const [settings, setSettings] = useState<NotificationSettings>(() =>
    loadFromStorage(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS)
  );
  
  const [recommendations, setRecommendations] = useState<MoodRecommendation[]>(() =>
    loadFromStorage(STORAGE_KEYS.RECOMMENDATIONS, [])
  );
  
  const [activityCompletions, setActivityCompletions] = useState<ActivityCompletion[]>(() =>
    loadFromStorage(STORAGE_KEYS.COMPLETIONS, [])
  );
  
  const [hasPermission, setHasPermission] = useState(false);

  // Check notification permission on load
  useEffect(() => {
    if ('Notification' in window) {
      setHasPermission(Notification.permission === 'granted');
    }
  }, []);

  // Save to localStorage on changes
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);
  }, [notifications]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.SETTINGS, settings);
  }, [settings]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.RECOMMENDATIONS, recommendations);
  }, [recommendations]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.COMPLETIONS, activityCompletions);
  }, [activityCompletions]);

  // Check for due notifications every minute
  useEffect(() => {
    const checkNotifications = () => {
      const now = new Date();
      const dueNotifications = notifications.filter(
        n => !n.delivered && n.scheduledFor <= now
      );

      dueNotifications.forEach(notification => {
        if (hasPermission && settings.enabled) {
          // Check quiet hours
          const currentTime = now.getHours() * 100 + now.getMinutes();
          const quietStart = parseInt(settings.quiet.startTime.replace(':', ''));
          const quietEnd = parseInt(settings.quiet.endTime.replace(':', ''));
          
          const isQuietTime = settings.quiet.enabled && (
            quietStart < quietEnd ? 
            (currentTime >= quietStart && currentTime <= quietEnd) :
            (currentTime >= quietStart || currentTime <= quietEnd)
          );

          if (!isQuietTime) {
            showBrowserNotification(notification);
          }
        }
        
        markAsDelivered(notification.id);
      });
    };

    const interval = setInterval(checkNotifications, 60000); // Check every minute
    checkNotifications(); // Check immediately
    
    return () => clearInterval(interval);
  }, [notifications, hasPermission, settings]);

  const showBrowserNotification = (notification: AppNotification) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id,
      });

      browserNotification.onclick = () => {
        // Handle notification click - could navigate to relevant page
        browserNotification.close();
      };

      // Auto-close after 10 seconds unless persistent
      if (!notification.persistent) {
        setTimeout(() => {
          browserNotification.close();
        }, 10000);
      }
    }
  };

  const scheduleNotification = useCallback((notificationData: Omit<AppNotification, 'id' | 'delivered'>) => {
    const notification: AppNotification = {
      ...notificationData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      delivered: false,
    };
    
    setNotifications(prev => [...prev, notification]);
  }, []);

  const markAsDelivered = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, delivered: true, deliveredAt: new Date() } : n)
    );
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const updateSettings = useCallback((updates: Partial<NotificationSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      const granted = permission === 'granted';
      setHasPermission(granted);
      return granted;
    }
    return false;
  }, []);

  const getRecommendations = useCallback((mood: EmotionState, context?: any): MoodRecommendation => {
    const activities = MOOD_ACTIVITIES[mood] || MOOD_ACTIVITIES.neutral;
    
    // Filter based on user preferences and past completions
    const recentCompletions = activityCompletions
      .filter(c => c.completedAt > new Date(Date.now() - 24 * 60 * 60 * 1000)) // Last 24 hours
      .map(c => c.activityId);
    
    const availableActivities = activities.filter(a => !recentCompletions.includes(a.id));
    const finalActivities = availableActivities.length > 0 ? availableActivities : activities;

    const recommendation: MoodRecommendation = {
      id: Date.now().toString(),
      mood,
      activities: finalActivities.slice(0, 4), // Limit to 4 recommendations
      reasoning: getReasoningForMood(mood),
    };

    setRecommendations(prev => [recommendation, ...prev.slice(0, 9)]); // Keep last 10
    return recommendation;
  }, [activityCompletions]);

  const completeActivity = useCallback((completion: Omit<ActivityCompletion, 'id'>) => {
    const newCompletion: ActivityCompletion = {
      ...completion,
      id: Date.now().toString(),
    };
    
    setActivityCompletions(prev => [newCompletion, ...prev.slice(0, 99)]); // Keep last 100
    
    // Schedule celebration notification for high effectiveness ratings
    if (completion.effectiveness >= 4) {
      scheduleNotification({
        type: 'celebration',
        title: 'Great job! 🎉',
        message: `You rated that activity ${completion.effectiveness}/5. Keep up the great self-care!`,
        scheduledFor: new Date(Date.now() + 2000), // 2 seconds delay
        priority: 'low',
      });
    }
  }, [scheduleNotification]);

  const scheduleMedicationReminder = useCallback((medicationId: string, time: string) => {
    if (!settings.medicationReminders) return;
    
    const [hours, minutes] = time.split(':').map(Number);
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(hours, minutes - settings.reminderTiming.medicationBefore, 0, 0);
    
    // If time has passed today, schedule for tomorrow
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    scheduleNotification({
      type: 'medication',
      title: '💊 Medication Reminder',
      message: `Time to take your medication in ${settings.reminderTiming.medicationBefore} minutes`,
      scheduledFor: scheduledTime,
      priority: 'high',
      relatedId: medicationId,
      actions: [
        { label: 'Taken', action: 'medication_taken' },
        { label: 'Snooze', action: 'medication_snooze' },
      ],
    });
  }, [settings, scheduleNotification]);

  const scheduleAppointmentReminder = useCallback((appointmentId: string, appointmentDate: Date) => {
    if (!settings.appointmentReminders) return;
    
    const reminderTime = new Date(appointmentDate.getTime() - settings.reminderTiming.appointmentBefore * 60 * 1000);
    
    if (reminderTime > new Date()) {
      scheduleNotification({
        type: 'appointment',
        title: '📅 Appointment Reminder',
        message: `You have an appointment in ${settings.reminderTiming.appointmentBefore} minutes`,
        scheduledFor: reminderTime,
        priority: 'high',
        relatedId: appointmentId,
        persistent: true,
      });
    }
  }, [settings, scheduleNotification]);

  const scheduleMoodCheckin = useCallback(() => {
    if (!settings.moodCheckins) return;
    
    const nextCheckin = new Date(Date.now() + settings.reminderTiming.moodCheckinInterval * 60 * 60 * 1000);
    
    scheduleNotification({
      type: 'mood_checkin',
      title: '💭 How are you feeling?',
      message: 'Take a moment to check in with your mood and get personalized recommendations',
      scheduledFor: nextCheckin,
      priority: 'normal',
    });
  }, [settings, scheduleNotification]);

  const unreadCount = notifications.filter(n => n.delivered && !n.persistent).length;

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    scheduleNotification,
    markAsDelivered,
    dismissNotification,
    clearAllNotifications,
    settings,
    updateSettings,
    requestPermission,
    hasPermission,
    recommendations,
    getRecommendations,
    completeActivity,
    activityCompletions,
    scheduleMedicationReminder,
    scheduleAppointmentReminder,
    scheduleMoodCheckin,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

function getReasoningForMood(mood: EmotionState): string {
  const reasonings: Record<EmotionState, string> = {
    anxious: "When feeling anxious, grounding techniques and breathing exercises can help calm your nervous system and bring you back to the present moment.",
    sad: "For sadness, gentle movement, connection with others, and gratitude practices can help lift your mood and provide emotional support.",
    angry: "When angry, physical activities and expressive writing can help you process and release intense emotions in healthy ways.",
    stressed: "Stress benefits from organization, prioritization, and relaxation techniques that help you regain control and perspective.",
    lonely: "Loneliness calls for connection - whether through reaching out to others or nurturing your relationship with yourself.",
    tired: "When tired, rest and gentle energizing activities can help restore your energy without overwhelming your system.",
    overwhelmed: "Feeling overwhelmed benefits from simplification, grounding exercises, and breaking things down into manageable pieces.",
    positive: "Great mood! These activities can help you maintain and even amplify your positive feelings.",
    neutral: "A neutral mood is perfect for gentle exploration and building positive momentum for your day.",
  };
  
  return reasonings[mood] || reasonings.neutral;
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}