/**
 * notificationSystem.ts - Browser notification management
 */

export type NotificationType = 
  | 'medication'
  | 'appointment'
  | 'goal_checkin'
  | 'mood_checkin'
  | 'sleep_reminder'
  | 'crisis_followup';

export interface NotificationConfig {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  scheduledFor: Date;
  actions?: Array<{
    action: string;
    title: string;
  }>;
  data?: Record<string, unknown>;
}

export interface NotificationPermissionStatus {
  granted: boolean;
  denied: boolean;
  canRequest: boolean;
}

/**
 * Check notification permission status
 */
export function getNotificationPermission(): NotificationPermissionStatus {
  if (!('Notification' in window)) {
    return { granted: false, denied: true, canRequest: false };
  }

  const permission = Notification.permission;
  return {
    granted: permission === 'granted',
    denied: permission === 'denied',
    canRequest: permission === 'default',
  };
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('Notifications not supported');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Failed to request notification permission:', error);
    return false;
  }
}

/**
 * Show a notification immediately
 */
export async function showNotification(config: Omit<NotificationConfig, 'id' | 'scheduledFor'>): Promise<boolean> {
  const permission = getNotificationPermission();
  
  if (!permission.granted) {
    if (permission.canRequest) {
      const granted = await requestNotificationPermission();
      if (!granted) return false;
    } else {
      return false;
    }
  }

  try {
    const notification = new Notification(config.title, {
      body: config.body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: `serenio-${config.type}`,
      requireInteraction: config.type === 'medication' || config.type === 'appointment',
      data: config.data,
    });

    // Auto-close after 10 seconds for non-critical notifications
    if (config.type !== 'medication' && config.type !== 'appointment') {
      setTimeout(() => notification.close(), 10000);
    }

    notification.onclick = () => {
      window.focus();
      notification.close();
      
      // Navigate based on notification type
      const routes: Record<NotificationType, string> = {
        medication: '/reminders',
        appointment: '/reminders',
        goal_checkin: '/goals',
        mood_checkin: '/mood',
        sleep_reminder: '/wellness',
        crisis_followup: '/session',
      };
      
      if (routes[config.type]) {
        window.location.hash = routes[config.type];
      }
    };

    return true;
  } catch (error) {
    console.error('Failed to show notification:', error);
    return false;
  }
}

/**
 * Schedule a notification for later
 */
export function scheduleNotification(config: NotificationConfig): void {
  const now = new Date();
  const scheduledTime = new Date(config.scheduledFor);
  const delay = scheduledTime.getTime() - now.getTime();

  if (delay <= 0) {
    // Already past, show immediately
    showNotification(config);
    return;
  }

  // Store in localStorage for persistence
  const scheduled = getScheduledNotifications();
  scheduled.push(config);
  localStorage.setItem('serenio-notifications', JSON.stringify(scheduled));

  // Schedule the notification
  setTimeout(() => {
    showNotification(config);
    // Remove from scheduled list
    const updated = getScheduledNotifications().filter(n => n.id !== config.id);
    localStorage.setItem('serenio-notifications', JSON.stringify(updated));
  }, delay);
}

/**
 * Get all scheduled notifications
 */
export function getScheduledNotifications(): NotificationConfig[] {
  try {
    const stored = localStorage.getItem('serenio-notifications');
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    // Convert date strings back to Date objects
    return parsed.map((n: any) => ({
      ...n,
      scheduledFor: new Date(n.scheduledFor),
    }));
  } catch {
    return [];
  }
}

/**
 * Cancel a scheduled notification
 */
export function cancelNotification(id: string): void {
  const scheduled = getScheduledNotifications();
  const updated = scheduled.filter(n => n.id !== id);
  localStorage.setItem('serenio-notifications', JSON.stringify(updated));
}

/**
 * Initialize notification system on app start
 */
export function initNotificationSystem(): void {
  // Re-schedule any notifications that haven't fired yet
  const scheduled = getScheduledNotifications();
  const now = new Date();
  
  scheduled.forEach(notification => {
    if (new Date(notification.scheduledFor) > now) {
      scheduleNotification(notification);
    } else {
      // Clean up past notifications
      cancelNotification(notification.id);
    }
  });
}

/**
 * Helper: Schedule medication reminder
 */
export function scheduleMedicationReminder(medName: string, time: string): void {
  const [hours, minutes] = time.split(':').map(Number);
  const scheduledDate = new Date();
  scheduledDate.setHours(hours, minutes, 0, 0);
  
  // If time has passed today, schedule for tomorrow
  if (scheduledDate < new Date()) {
    scheduledDate.setDate(scheduledDate.getDate() + 1);
  }

  scheduleNotification({
    id: `med-${medName}-${time}`,
    type: 'medication',
    title: '💊 Time for your medication',
    body: `Don't forget to take ${medName}`,
    scheduledFor: scheduledDate,
  });
}

/**
 * Helper: Schedule appointment reminder
 */
export function scheduleAppointmentReminder(providerName: string, date: Date, time: string): void {
  // Remind 1 hour before
  const reminderDate = new Date(date);
  const [hours, minutes] = time.split(':').map(Number);
  reminderDate.setHours(hours - 1, minutes, 0, 0);

  scheduleNotification({
    id: `apt-${date.getTime()}`,
    type: 'appointment',
    title: '📅 Appointment in 1 hour',
    body: `${providerName} at ${time}`,
    scheduledFor: reminderDate,
  });
}

/**
 * Helper: Schedule daily mood check-in
 */
export function scheduleDailyMoodCheckin(): void {
  const checkinTime = new Date();
  checkinTime.setHours(20, 0, 0, 0); // 8 PM

  if (checkinTime < new Date()) {
    checkinTime.setDate(checkinTime.getDate() + 1);
  }

  scheduleNotification({
    id: `mood-daily-${checkinTime.getDate()}`,
    type: 'mood_checkin',
    title: '😊 How was your day?',
    body: 'Take a moment to check in with yourself',
    scheduledFor: checkinTime,
  });
}

/**
 * Helper: Schedule sleep reminder
 */
export function scheduleSleepReminder(bedTime: string): void {
  const [hours, minutes] = bedTime.split(':').map(Number);
  const reminderDate = new Date();
  reminderDate.setHours(hours, minutes - 30, 0, 0); // 30 min before bed

  if (reminderDate < new Date()) {
    reminderDate.setDate(reminderDate.getDate() + 1);
  }

  scheduleNotification({
    id: `sleep-${reminderDate.getDate()}`,
    type: 'sleep_reminder',
    title: '😴 Start winding down',
    body: 'Your bedtime is in 30 minutes',
    scheduledFor: reminderDate,
  });
}
