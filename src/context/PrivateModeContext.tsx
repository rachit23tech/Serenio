/**
 * PrivateModeContext.tsx - Incognito mode for private conversations
 */

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { useNotifications } from './NotificationContext';

interface PrivateMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

interface PrivateModeContextType {
  // Private mode state
  isPrivateMode: boolean;
  togglePrivateMode: () => void;
  
  // Private messages (not stored permanently)
  privateMessages: PrivateMessage[];
  addPrivateMessage: (role: 'user' | 'assistant', text: string) => void;
  clearPrivateMessages: () => void;
  
  // Private session info
  privateSessionStarted: Date | null;
  getPrivateSessionDuration: () => number; // in minutes
}

const PrivateModeContext = createContext<PrivateModeContextType | null>(null);

export function PrivateModeProvider({ children }: { children: ReactNode }) {
  const [isPrivateMode, setIsPrivateMode] = useState(false);
  const [privateMessages, setPrivateMessages] = useState<PrivateMessage[]>([]);
  const [privateSessionStarted, setPrivateSessionStarted] = useState<Date | null>(null);
  const { scheduleNotification } = useNotifications();

  const togglePrivateMode = useCallback(() => {
    const newPrivateMode = !isPrivateMode;
    setIsPrivateMode(newPrivateMode);
    
    if (newPrivateMode) {
      // Starting private mode
      setPrivateSessionStarted(new Date());
      setPrivateMessages([]);
      
      // Show notification about private mode
      scheduleNotification({
        type: 'reminder',
        title: '🔒 Private Mode Active',
        message: 'This conversation won\'t be saved to your history. Feel free to share anything.',
        scheduledFor: new Date(Date.now() + 1000),
        priority: 'normal',
      });
    } else {
      // Ending private mode
      if (privateSessionStarted) {
        const duration = Math.round((Date.now() - privateSessionStarted.getTime()) / (1000 * 60));
        
        scheduleNotification({
          type: 'reminder',
          title: '🔓 Private Mode Ended',
          message: `Your ${duration} minute private session has ended. All messages have been cleared.`,
          scheduledFor: new Date(Date.now() + 1000),
          priority: 'low',
        });
      }
      
      // Clear all private data
      setPrivateMessages([]);
      setPrivateSessionStarted(null);
    }
  }, [isPrivateMode, privateSessionStarted, scheduleNotification]);

  const addPrivateMessage = useCallback((role: 'user' | 'assistant', text: string) => {
    if (!isPrivateMode) return;
    
    const message: PrivateMessage = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      role,
      text,
      timestamp: new Date(),
    };
    
    setPrivateMessages(prev => [...prev, message]);
  }, [isPrivateMode]);

  const clearPrivateMessages = useCallback(() => {
    setPrivateMessages([]);
  }, []);

  const getPrivateSessionDuration = useCallback(() => {
    if (!privateSessionStarted) return 0;
    return Math.round((Date.now() - privateSessionStarted.getTime()) / (1000 * 60));
  }, [privateSessionStarted]);

  const value: PrivateModeContextType = {
    isPrivateMode,
    togglePrivateMode,
    privateMessages,
    addPrivateMessage,
    clearPrivateMessages,
    privateSessionStarted,
    getPrivateSessionDuration,
  };

  return <PrivateModeContext.Provider value={value}>{children}</PrivateModeContext.Provider>;
}

export function usePrivateMode() {
  const context = useContext(PrivateModeContext);
  if (!context) {
    throw new Error('usePrivateMode must be used within PrivateModeProvider');
  }
  return context;
}