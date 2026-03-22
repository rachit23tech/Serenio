/**
 * WellnessContext.tsx - Comprehensive mental health tracking and support
 */

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import type {
  ConversationContext,
  CrisisLevel,
  SleepEntry,
  RoutineEntry,
  MedicationReminder,
  Appointment,
  TherapistPrep,
  TriggerWarning,
  Accountability,
  VentingSession,
  GuidedExercise,
  EmotionState,
  SentimentAnalysis,
} from '../types/wellness';

interface WellnessContextType {
  // Conversation Memory
  conversationContext: ConversationContext;
  updateContext: (updates: Partial<ConversationContext>) => void;
  addMessage: (role: 'user' | 'assistant', text: string, emotion?: EmotionState) => void;
  
  // Crisis Management
  currentCrisisLevel: CrisisLevel;
  updateCrisisLevel: (level: CrisisLevel) => void;
  
  // Sleep Tracking
  sleepLog: SleepEntry[];
  addSleepEntry: (entry: SleepEntry) => void;
  getSleepInsights: () => string[];
  
  // Routine Tracking
  routines: RoutineEntry[];
  logRoutine: (entry: RoutineEntry) => void;
  
  // Medications & Appointments
  medications: MedicationReminder[];
  addMedication: (med: Omit<MedicationReminder, 'id'>) => void;
  updateMedication: (id: string, updates: Partial<MedicationReminder>) => void;
  appointments: Appointment[];
  addAppointment: (apt: Omit<Appointment, 'id'>) => void;
  
  // Therapist Support
  therapistPrep: TherapistPrep | null;
  updateTherapistPrep: (prep: Partial<TherapistPrep>) => void;
  
  // Triggers & Warnings
  triggers: TriggerWarning[];
  addTrigger: (trigger: Omit<TriggerWarning, 'id' | 'createdAt'>) => void;
  
  // Accountability
  accountabilities: Accountability[];
  addAccountability: (goal: Omit<Accountability, 'id'>) => void;
  updateAccountability: (id: string, updates: Partial<Accountability>) => void;
  
  // Venting Mode
  activeVentingSession: VentingSession | null;
  startVenting: () => void;
  endVenting: () => void;
  
  // Guided Exercises
  exercises: GuidedExercise[];
  startExercise: (type: GuidedExercise['type']) => GuidedExercise;
  updateExercise: (id: string, updates: Partial<GuidedExercise>) => void;
  
  // Sentiment Analysis
  analyzeSentiment: (text: string) => SentimentAnalysis;
  
  // Clear all data
  clearAllData: () => void;
}

const WellnessContext = createContext<WellnessContextType | null>(null);

const STORAGE_KEYS = {
  CONTEXT: 'serenio-wellness-context',
  CRISIS: 'serenio-crisis-level',
  SLEEP: 'serenio-sleep-log',
  ROUTINES: 'serenio-routines',
  MEDICATIONS: 'serenio-medications',
  APPOINTMENTS: 'serenio-appointments',
  THERAPIST: 'serenio-therapist-prep',
  TRIGGERS: 'serenio-triggers',
  ACCOUNTABILITY: 'serenio-accountability',
  EXERCISES: 'serenio-exercises',
};

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    const parsed = JSON.parse(item);
    
    // Convert date strings back to Date objects
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

export function WellnessProvider({ children }: { children: ReactNode }) {
  // Conversation Context
  const [conversationContext, setConversationContext] = useState<ConversationContext>(() =>
    loadFromStorage(STORAGE_KEYS.CONTEXT, {
      recentMessages: [],
      ongoingSituations: [],
      triggers: [],
      copingStrategies: [],
      importantPeople: [],
    })
  );

  // Crisis Management
  const [currentCrisisLevel, setCurrentCrisisLevel] = useState<CrisisLevel>(() =>
    loadFromStorage(STORAGE_KEYS.CRISIS, {
      level: 'none',
      detectedKeywords: [],
      timestamp: new Date(),
    })
  );

  // Sleep Tracking
  const [sleepLog, setSleepLog] = useState<SleepEntry[]>(() =>
    loadFromStorage(STORAGE_KEYS.SLEEP, [])
  );

  // Routine Tracking
  const [routines, setRoutines] = useState<RoutineEntry[]>(() =>
    loadFromStorage(STORAGE_KEYS.ROUTINES, [])
  );

  // Medications
  const [medications, setMedications] = useState<MedicationReminder[]>(() =>
    loadFromStorage(STORAGE_KEYS.MEDICATIONS, [])
  );

  // Appointments
  const [appointments, setAppointments] = useState<Appointment[]>(() =>
    loadFromStorage(STORAGE_KEYS.APPOINTMENTS, [])
  );

  // Therapist Prep
  const [therapistPrep, setTherapistPrep] = useState<TherapistPrep | null>(() =>
    loadFromStorage(STORAGE_KEYS.THERAPIST, null)
  );

  // Triggers
  const [triggers, setTriggers] = useState<TriggerWarning[]>(() =>
    loadFromStorage(STORAGE_KEYS.TRIGGERS, [])
  );

  // Accountability
  const [accountabilities, setAccountabilities] = useState<Accountability[]>(() =>
    loadFromStorage(STORAGE_KEYS.ACCOUNTABILITY, [])
  );

  // Venting Session
  const [activeVentingSession, setActiveVentingSession] = useState<VentingSession | null>(null);

  // Guided Exercises
  const [exercises, setExercises] = useState<GuidedExercise[]>(() =>
    loadFromStorage(STORAGE_KEYS.EXERCISES, [])
  );

  // Save to localStorage on changes
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.CONTEXT, conversationContext);
  }, [conversationContext]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.CRISIS, currentCrisisLevel);
  }, [currentCrisisLevel]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.SLEEP, sleepLog);
  }, [sleepLog]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.ROUTINES, routines);
  }, [routines]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.MEDICATIONS, medications);
  }, [medications]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.APPOINTMENTS, appointments);
  }, [appointments]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.THERAPIST, therapistPrep);
  }, [therapistPrep]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.TRIGGERS, triggers);
  }, [triggers]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.ACCOUNTABILITY, accountabilities);
  }, [accountabilities]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.EXERCISES, exercises);
  }, [exercises]);

  // Conversation Memory Functions
  const updateContext = useCallback((updates: Partial<ConversationContext>) => {
    setConversationContext((prev) => ({ ...prev, ...updates }));
  }, []);

  const addMessage = useCallback((role: 'user' | 'assistant', text: string, emotion?: EmotionState) => {
    setConversationContext((prev) => ({
      ...prev,
      recentMessages: [
        { role, text, timestamp: new Date(), emotion },
        ...prev.recentMessages.slice(0, 9), // Keep last 10 messages
      ],
    }));
  }, []);

  // Crisis Management
  const updateCrisisLevel = useCallback((level: CrisisLevel) => {
    setCurrentCrisisLevel(level);
  }, []);

  // Sleep Tracking
  const addSleepEntry = useCallback((entry: SleepEntry) => {
    setSleepLog((prev) => [entry, ...prev.slice(0, 29)]); // Keep last 30 days
  }, []);

  const getSleepInsights = useCallback((): string[] => {
    const insights: string[] = [];
    const recent = sleepLog.slice(0, 7);
    
    if (recent.length < 3) return ['Log more sleep data to get insights'];
    
    const avgHours = recent.reduce((sum, e) => sum + e.hoursSlept, 0) / recent.length;
    const avgQuality = recent.reduce((sum, e) => sum + e.quality, 0) / recent.length;
    
    if (avgHours < 6) {
      insights.push('You\'re averaging less than 6 hours - try going to bed 30 minutes earlier');
    } else if (avgHours >= 7 && avgHours <= 9) {
      insights.push('Great sleep duration! You\'re in the healthy range.');
    }
    
    if (avgQuality < 3) {
      const withCaffeine = recent.filter(e => e.caffeineAfterNoon).length;
      const withScreen = recent.filter(e => e.screenTimeBeforeBed).length;
      
      if (withCaffeine > recent.length / 2) {
        insights.push('Afternoon caffeine seems to affect your sleep quality');
      }
      if (withScreen > recent.length / 2) {
        insights.push('Screen time before bed may be impacting your sleep');
      }
    }
    
    return insights;
  }, [sleepLog]);

  // Routine Tracking
  const logRoutine = useCallback((entry: RoutineEntry) => {
    setRoutines((prev) => [entry, ...prev.slice(0, 99)]); // Keep last 100
  }, []);

  // Medications
  const addMedication = useCallback((med: Omit<MedicationReminder, 'id'>) => {
    const newMed = { ...med, id: Date.now().toString() };
    setMedications((prev) => [...prev, newMed]);
  }, []);

  const updateMedication = useCallback((id: string, updates: Partial<MedicationReminder>) => {
    setMedications((prev) =>
      prev.map((med) => (med.id === id ? { ...med, ...updates } : med))
    );
  }, []);

  // Appointments
  const addAppointment = useCallback((apt: Omit<Appointment, 'id'>) => {
    const newApt = { ...apt, id: Date.now().toString() };
    setAppointments((prev) => [...prev, newApt].sort((a, b) => a.date.getTime() - b.date.getTime()));
  }, []);

  // Therapist Prep
  const updateTherapistPrep = useCallback((prep: Partial<TherapistPrep>) => {
    setTherapistPrep((prev) => {
      if (!prev) {
        return {
          id: Date.now().toString(),
          nextSessionDate: new Date(),
          topicsToDiscuss: [],
          questionsToAsk: [],
          progressToShare: [],
          concernsToMention: [],
          ...prep,
        } as TherapistPrep;
      }
      return { ...prev, ...prep };
    });
  }, []);

  // Triggers
  const addTrigger = useCallback((trigger: Omit<TriggerWarning, 'id' | 'createdAt'>) => {
    const newTrigger = {
      ...trigger,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setTriggers((prev) => [...prev, newTrigger]);
  }, []);

  // Accountability
  const addAccountability = useCallback((goal: Omit<Accountability, 'id'>) => {
    const newGoal = {
      ...goal,
      id: Date.now().toString(),
    };
    setAccountabilities((prev) => [...prev, newGoal]);
  }, []);

  const updateAccountability = useCallback((id: string, updates: Partial<Accountability>) => {
    setAccountabilities((prev) =>
      prev.map((acc) => (acc.id === id ? { ...acc, ...updates } : acc))
    );
  }, []);

  // Venting Mode
  const startVenting = useCallback(() => {
    setActiveVentingSession({
      id: Date.now().toString(),
      startTime: new Date(),
      rawText: '',
      noAdvice: true,
      private: true,
    });
  }, []);

  const endVenting = useCallback(() => {
    setActiveVentingSession(null);
  }, []);

  // Guided Exercises
  const startExercise = useCallback((type: GuidedExercise['type']): GuidedExercise => {
    const templates: Record<GuidedExercise['type'], Omit<GuidedExercise, 'id'>> = {
      cbt: {
        type: 'cbt',
        name: 'Challenge Negative Thoughts',
        description: 'CBT thought record to identify and reframe unhelpful thoughts',
        durationMinutes: 10,
        steps: [
          { stepNumber: 1, title: 'Situation', prompt: 'What happened? Describe the situation briefly.' },
          { stepNumber: 2, title: 'Automatic Thought', prompt: 'What thought immediately came to mind?' },
          { stepNumber: 3, title: 'Evidence For', prompt: 'What evidence supports this thought?' },
          { stepNumber: 4, title: 'Evidence Against', prompt: 'What evidence contradicts this thought?' },
          { stepNumber: 5, title: 'Balanced Thought', prompt: 'What\'s a more balanced way to think about this?' },
        ],
      },
      gratitude: {
        type: 'gratitude',
        name: 'Gratitude Practice',
        description: 'Daily gratitude to shift focus to positive aspects',
        durationMinutes: 5,
        steps: [
          { stepNumber: 1, title: 'Thing 1', prompt: 'One thing you\'re grateful for today:' },
          { stepNumber: 2, title: 'Thing 2', prompt: 'Another thing you appreciate:' },
          { stepNumber: 3, title: 'Thing 3', prompt: 'A third thing that brought you joy or comfort:' },
          { stepNumber: 4, title: 'Why', prompt: 'Why does one of these matter to you?' },
        ],
      },
      values: {
        type: 'values',
        name: 'Values Clarification',
        description: 'Identify what truly matters to you',
        durationMinutes: 15,
        steps: [
          { stepNumber: 1, title: 'Core Values', prompt: 'What 3-5 things matter most to you in life?' },
          { stepNumber: 2, title: 'Living Them', prompt: 'Are your daily actions aligned with these values?' },
          { stepNumber: 3, title: 'One Change', prompt: 'One small thing you could do this week to live more aligned:' },
        ],
      },
      goal: {
        type: 'goal',
        name: 'SMART Goal Setting',
        description: 'Set a specific, achievable goal',
        durationMinutes: 10,
        steps: [
          { stepNumber: 1, title: 'Specific', prompt: 'What exactly do you want to achieve?' },
          { stepNumber: 2, title: 'Measurable', prompt: 'How will you know you\'ve achieved it?' },
          { stepNumber: 3, title: 'Achievable', prompt: 'What makes this realistic for you right now?' },
          { stepNumber: 4, title: 'Timeline', prompt: 'When do you want to achieve this by?' },
          { stepNumber: 5, title: 'First Step', prompt: 'What\'s one tiny action you can take today?' },
        ],
      },
      sleep: {
        type: 'sleep',
        name: 'Sleep Hygiene Check',
        description: 'Review and improve your sleep habits',
        durationMinutes: 7,
        steps: [
          { stepNumber: 1, title: 'Current Pattern', prompt: 'What time do you typically go to bed and wake up?' },
          { stepNumber: 2, title: 'Challenges', prompt: 'What makes it hard to sleep well?' },
          { stepNumber: 3, title: 'Evening Routine', prompt: 'What do you do in the hour before bed?' },
          { stepNumber: 4, title: 'Improvement', prompt: 'One change you could make to your evening routine:' },
        ],
      },
      compassion: {
        type: 'compassion',
        name: 'Self-Compassion Exercise',
        description: 'Practice being kind to yourself',
        durationMinutes: 8,
        steps: [
          { stepNumber: 1, title: 'Difficulty', prompt: 'What are you struggling with right now?' },
          { stepNumber: 2, title: 'Common Humanity', prompt: 'How might many other people be experiencing something similar?' },
          { stepNumber: 3, title: 'Kind Words', prompt: 'What would you say to a friend in this situation?' },
          { stepNumber: 4, title: 'Self-Kindness', prompt: 'Can you say those same kind words to yourself?' },
        ],
      },
    };

    const newExercise: GuidedExercise = {
      ...templates[type],
      id: Date.now().toString(),
    };

    setExercises((prev) => [...prev, newExercise]);
    return newExercise;
  }, []);

  const updateExercise = useCallback((id: string, updates: Partial<GuidedExercise>) => {
    setExercises((prev) =>
      prev.map((ex) => (ex.id === id ? { ...ex, ...updates } : ex))
    );
  }, []);

  // Sentiment Analysis
  const analyzeSentiment = useCallback((text: string): SentimentAnalysis => {
    const lower = text.toLowerCase();
    
    // Emotion detection
    const emotionPatterns: Record<EmotionState, RegExp> = {
      anxious: /(anxious|worried|panic|stress|nervous|afraid|scared|fear)/,
      sad: /(sad|depressed|down|hopeless|empty|numb|miserable)/,
      angry: /(angry|mad|furious|frustrated|irritated|annoyed)/,
      stressed: /(stressed|overwhelmed|too much|pressure|burden)/,
      lonely: /(lonely|alone|isolated|nobody|no one)/,
      tired: /(tired|exhausted|drained|fatigue|worn out)/,
      positive: /(happy|good|great|better|excited|proud|glad)/,
      neutral: /(okay|fine|alright)/,
      overwhelmed: /(overwhelmed|too much|can't handle|drowning)/,
    };

    const emotions: Array<{ emotion: EmotionState; confidence: number }> = [];
    for (const [emotion, pattern] of Object.entries(emotionPatterns)) {
      if (pattern.test(lower)) {
        emotions.push({ emotion: emotion as EmotionState, confidence: 0.8 });
      }
    }

    // Urgency detection
    const urgencyKeywords = ['urgent', 'emergency', 'now', 'immediately', 'crisis', 'help', 'can\'t'];
    const urgency = urgencyKeywords.filter(k => lower.includes(k)).length / urgencyKeywords.length;

    // Energy level detection
    const lowEnergyWords = ['tired', 'exhausted', 'drained', 'can\'t', 'don\'t want'];
    const highEnergyWords = ['excited', 'motivated', 'ready', 'let\'s', 'want to'];
    const energyScore = 
      (highEnergyWords.filter(w => lower.includes(w)).length - 
       lowEnergyWords.filter(w => lower.includes(w)).length + 3) / 6;
    const energyLevel = Math.max(0, Math.min(1, energyScore));

    // Masking detection ("I'm fine" but sentiment shows otherwise)
    const maskingPhrases = ['i\'m fine', 'im fine', 'i\'m okay', 'im okay', 'don\'t worry'];
    const saysFine = maskingPhrases.some(p => lower.includes(p));
    const hasNegativeEmotions = emotions.some(e => 
      ['anxious', 'sad', 'angry', 'stressed', 'lonely', 'overwhelmed'].includes(e.emotion)
    );
    const masking = saysFine && hasNegativeEmotions;

    // Overall sentiment
    let overall: SentimentAnalysis['overall'] = 'neutral';
    if (emotions.some(e => e.emotion === 'positive')) {
      overall = 'positive';
    } else if (emotions.filter(e => ['sad', 'anxious', 'overwhelmed'].includes(e.emotion)).length >= 2) {
      overall = 'very_negative';
    } else if (emotions.some(e => ['sad', 'anxious', 'stressed'].includes(e.emotion))) {
      overall = 'negative';
    }

    return {
      overall,
      emotions: emotions.length > 0 ? emotions : [{ emotion: 'neutral', confidence: 0.5 }],
      urgency,
      energyLevel,
      masking,
    };
  }, []);

  // Clear all data
  const clearAllData = useCallback(() => {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
    setConversationContext({
      recentMessages: [],
      ongoingSituations: [],
      triggers: [],
      copingStrategies: [],
      importantPeople: [],
    });
    setCurrentCrisisLevel({ level: 'none', detectedKeywords: [], timestamp: new Date() });
    setSleepLog([]);
    setRoutines([]);
    setMedications([]);
    setAppointments([]);
    setTherapistPrep(null);
    setTriggers([]);
    setAccountabilities([]);
    setActiveVentingSession(null);
    setExercises([]);
  }, []);

  const value: WellnessContextType = {
    conversationContext,
    updateContext,
    addMessage,
    currentCrisisLevel,
    updateCrisisLevel,
    sleepLog,
    addSleepEntry,
    getSleepInsights,
    routines,
    logRoutine,
    medications,
    addMedication,
    updateMedication,
    appointments,
    addAppointment,
    therapistPrep,
    updateTherapistPrep,
    triggers,
    addTrigger,
    accountabilities,
    addAccountability,
    updateAccountability,
    activeVentingSession,
    startVenting,
    endVenting,
    exercises,
    startExercise,
    updateExercise,
    analyzeSentiment,
    clearAllData,
  };

  return <WellnessContext.Provider value={value}>{children}</WellnessContext.Provider>;
}

export function useWellness() {
  const context = useContext(WellnessContext);
  if (!context) {
    throw new Error('useWellness must be used within WellnessProvider');
  }
  return context;
}
