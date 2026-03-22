/**
 * NotificationDemo.tsx - Demo page for testing notifications
 */

import { useState } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../tokens';
import Sidebar from '../components/Sidebar';

export default function NotificationDemo() {
  const { dark } = useTheme();
  const t = getTheme(dark);
  const { scheduleNotification, hasPermission, requestPermission } = useNotifications();

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [delay, setDelay] = useState(5); // seconds

  const handleTestNotification = () => {
    if (!title || !message) return;

    scheduleNotification({
      type: 'reminder',
      title,
      message,
      scheduledFor: new Date(Date.now() + delay * 1000),
      priority: 'normal',
    });

    // Reset form
    setTitle('');
    setMessage('');
    setDelay(5);
  };

  const testNotifications = [
    {
      title: '💊 Medication Reminder',
      message: 'Time to take your Sertraline 50mg',
      type: 'medication' as const,
    },
    {
      title: '📅 Appointment Reminder',
      message: 'Therapy session with Dr. Smith in 1 hour',
      type: 'appointment' as const,
    },
    {
      title: '💭 Mood Check-in',
      message: 'How are you feeling right now?',
      type: 'mood_checkin' as const,
    },
    {
      title: '🏃 Exercise Reminder',
      message: 'Time for some gentle movement!',
      type: 'exercise' as const,
    },
    {
      title: '🎉 Celebration',
      message: 'Great job completing that activity! You rated it 5/5',
      type: 'celebration' as const,
    },
  ];

  return (
    <div style={{ minHeight: '100vh', background: t.bg, display: 'flex' }}>
      <Sidebar active="mood" />
      <main style={{
        flex: 1,
        marginLeft: 240,
        padding: '48px 24px',
        overflowY: 'auto',
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h1 style={{
            fontSize: 32,
            fontWeight: 700,
            color: t.textPrimary,
            margin: '0 0 8px',
            fontFamily: 'var(--font-sans)',
          }}>
            Notification System Demo
          </h1>
          <p style={{
            fontSize: 16,
            color: t.textMuted,
            margin: '0 0 32px',
            fontFamily: 'var(--font-sans)',
          }}>
            Test the notification system and see how it works
          </p>

          {/* Permission Status */}
          <div style={{
            background: hasPermission ? '#D1FAE5' : '#FEF3C7',
            border: hasPermission ? '1px solid #10B981' : '1px solid #F59E0B',
            borderRadius: 12,
            padding: 16,
            marginBottom: 32,
          }}>
            <h3 style={{
              fontSize: 16,
              fontWeight: 600,
              color: hasPermission ? '#065F46' : '#92400E',
              margin: '0 0 8px',
              fontFamily: 'var(--font-sans)',
            }}>
              {hasPermission ? '✅ Browser notifications enabled' : '⚠️ Browser notifications disabled'}
            </h3>
            <p style={{
              fontSize: 14,
              color: hasPermission ? '#047857' : '#B45309',
              margin: hasPermission ? 0 : '0 0 12px',
              fontFamily: 'var(--font-sans)',
            }}>
              {hasPermission 
                ? 'You\'ll receive browser notifications for scheduled reminders'
                : 'Enable browser notifications to receive reminders outside the app'
              }
            </p>
            {!hasPermission && (
              <button
                onClick={requestPermission}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  background: '#F59E0B',
                  color: 'white',
                  border: 'none',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                Enable Notifications
              </button>
            )}
          </div>

          {/* Custom Notification Form */}
          <div style={{
            background: t.card,
            borderRadius: 16,
            padding: 24,
            border: `1px solid ${t.border}`,
            marginBottom: 32,
          }}>
            <h2 style={{
              fontSize: 20,
              fontWeight: 600,
              color: t.textPrimary,
              margin: '0 0 20px',
              fontFamily: 'var(--font-sans)',
            }}>
              Create Custom Notification
            </h2>

            <div style={{ display: 'grid', gap: 16, marginBottom: 20 }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: 14,
                  fontWeight: 600,
                  color: t.textPrimary,
                  marginBottom: 6,
                  fontFamily: 'var(--font-sans)',
                }}>
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Notification title..."
                  style={{
                    width: '100%',
                    padding: 12,
                    borderRadius: 8,
                    border: `1px solid ${t.border}`,
                    background: t.bg,
                    color: t.textPrimary,
                    fontSize: 14,
                    fontFamily: 'var(--font-sans)',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: 14,
                  fontWeight: 600,
                  color: t.textPrimary,
                  marginBottom: 6,
                  fontFamily: 'var(--font-sans)',
                }}>
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Notification message..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: 12,
                    borderRadius: 8,
                    border: `1px solid ${t.border}`,
                    background: t.bg,
                    color: t.textPrimary,
                    fontSize: 14,
                    fontFamily: 'var(--font-sans)',
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: 14,
                  fontWeight: 600,
                  color: t.textPrimary,
                  marginBottom: 6,
                  fontFamily: 'var(--font-sans)',
                }}>
                  Delay (seconds)
                </label>
                <input
                  type="number"
                  value={delay}
                  onChange={(e) => setDelay(Number(e.target.value))}
                  min="1"
                  max="60"
                  style={{
                    width: '100%',
                    padding: 12,
                    borderRadius: 8,
                    border: `1px solid ${t.border}`,
                    background: t.bg,
                    color: t.textPrimary,
                    fontSize: 14,
                    fontFamily: 'var(--font-sans)',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <button
              onClick={handleTestNotification}
              disabled={!title || !message}
              style={{
                padding: '12px 24px',
                borderRadius: 8,
                background: (!title || !message) ? t.textMuted : '#10B981',
                color: 'white',
                border: 'none',
                fontSize: 14,
                fontWeight: 600,
                cursor: (!title || !message) ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font-sans)',
              }}
            >
              Schedule Notification
            </button>
          </div>

          {/* Quick Test Buttons */}
          <div style={{
            background: t.card,
            borderRadius: 16,
            padding: 24,
            border: `1px solid ${t.border}`,
          }}>
            <h2 style={{
              fontSize: 20,
              fontWeight: 600,
              color: t.textPrimary,
              margin: '0 0 20px',
              fontFamily: 'var(--font-sans)',
            }}>
              Quick Tests
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: 16,
            }}>
              {testNotifications.map((notification, index) => (
                <button
                  key={index}
                  onClick={() => {
                    scheduleNotification({
                      ...notification,
                      scheduledFor: new Date(Date.now() + 3000), // 3 seconds
                      priority: 'normal',
                    });
                  }}
                  style={{
                    padding: 16,
                    borderRadius: 12,
                    background: t.bg,
                    border: `1px solid ${t.border}`,
                    color: t.textPrimary,
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  <div style={{
                    fontSize: 14,
                    fontWeight: 600,
                    marginBottom: 4,
                  }}>
                    {notification.title}
                  </div>
                  <div style={{
                    fontSize: 13,
                    color: t.textMuted,
                  }}>
                    {notification.message}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}