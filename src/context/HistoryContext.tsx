/**
 * HistoryContext.tsx
 * Stores session history (voice + chat) and mood log in memory.
 * No backend, no auth — fully private, on-device only.
 * Usage: const { sessions, addSession, moodLog, logMood } = useHistory();
 */

import { createContext, useContext, useState, ReactNode } from "react";

export type MoodLevel = "struggling" | "low" | "okay" | "good" | "great";

export interface SessionEntry {
  id: string;
  type: "voice" | "chat";
  date: Date;
  mood: MoodLevel;
  userText: string;
  serenioResponse: string;
}

export interface MoodEntry {
  date: Date;
  mood: MoodLevel;
}

interface HistoryContextType {
  sessions: SessionEntry[];
  addSession: (entry: Omit<SessionEntry, "id">) => void;
  moodLog: MoodEntry[];
  logMood: (mood: MoodLevel) => void;
  clearHistory: () => void;
}

const SEED_SESSIONS: SessionEntry[] = [
  {
    id: "1", type: "chat", date: new Date("2026-03-21T14:45:00"), mood: "okay",
    userText: "I've been feeling a bit overwhelmed with work lately, but I'm trying to take things one step at a time.",
    serenioResponse: "That's a really healthy approach. Breaking things down into manageable steps can make even the biggest challenges feel more achievable. Remember to celebrate the small victories along the way.",
  },
  {
    id: "2", type: "voice", date: new Date("2026-03-20T09:30:00"), mood: "good",
    userText: "Had a great morning! Went for a walk and the weather was perfect.",
    serenioResponse: "That sounds wonderful! Starting your day with movement and fresh air is such a positive way to set the tone. How does it make you feel when you connect with nature?",
  },
  {
    id: "3", type: "chat", date: new Date("2026-03-19T20:10:00"), mood: "low",
    userText: "Couldn't sleep well last night. Mind was racing with thoughts.",
    serenioResponse: "I'm sorry to hear that. Racing thoughts at night can be exhausting. Have you tried any grounding techniques before bed, like slow breathing or writing down your worries?",
  },
];

const SEED_MOOD_LOG: MoodEntry[] = [
  { date: new Date("2026-03-15"), mood: "good"  },
  { date: new Date("2026-03-16"), mood: "great" },
  { date: new Date("2026-03-17"), mood: "okay"  },
  { date: new Date("2026-03-18"), mood: "good"  },
  { date: new Date("2026-03-19"), mood: "low"   },
];

const HistoryContext = createContext<HistoryContextType>({
  sessions: [], addSession: () => {}, moodLog: [], logMood: () => {}, clearHistory: () => {},
});

export function HistoryProvider({ children }: { children: ReactNode }) {
  const [sessions, setSessions] = useState<SessionEntry[]>(SEED_SESSIONS);
  const [moodLog, setMoodLog] = useState<MoodEntry[]>(SEED_MOOD_LOG);

  const addSession = (entry: Omit<SessionEntry, "id">) =>
    setSessions((prev) => [{ ...entry, id: Date.now().toString() }, ...prev]);

  const logMood = (mood: MoodLevel) =>
    setMoodLog((prev) => [{ date: new Date(), mood }, ...prev]);

  const clearHistory = () => { setSessions([]); setMoodLog([]); };

  return (
    <HistoryContext.Provider value={{ sessions, addSession, moodLog, logMood, clearHistory }}>
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistory() {
  return useContext(HistoryContext);
}