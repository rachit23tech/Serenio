/**
 * NotificationCenter.tsx - In-app notification display component
 */

import { useState, useEffect } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../tokens';
import { useAnimation } from '../lib/animations';

export default function NotificationCenter() {
  const { dark } = useTheme();
  const t = getTheme(dark);
  const { 
    notifications, 
    unreadCount, 
    dismissNotification, 
    clearAllNotifications,
    hasPermission,
    requestPermission,
    settings,
    updateSettings
  } = useNotifications();
  
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const { isAnimating: isNotificationAnimating, show: showNotification, hide: hideNotification } = useAnimation();
  const { isAnimating: isSettingsAnimating, show: showSettingsPanel, hide: hideSettingsPanel } = useAnimation();

  const recentNotifications = notifications
    .filter(n => n.delivered)
    .sort((a, b) => (b.deliveredAt?.getTime() || 0) - (a.deliveredAt?.getTime() || 0))
    .slice(0, 20);

  // Handle panel open/close with animations
  useEffect(() => {
    if (isOpen) {
      showNotification();
    } else {
      hideNotification();
    }
  }, [isOpen, showNotification, hideNotification]);

  useEffect(() => {
    if (showSettings) {
      showSettingsPanel();
    } else {
      hideSettingsPanel();
    }
  }, [showSettings, showSettingsPanel, hideSettingsPanel]);

  const getNotificationIcon = (type: string) => {
    const icons = {
      medication: '💊',
      appointment: '📅',
      mood_checkin: '💭',
      exercise: '🏃',
      celebration: '🎉',
      reminder: '⏰',
      crisis: '🚨',
    };
    return icons[type as keyof typeof icons] || '📱';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: '#10B981',
      normal: '#3B82F6',
      high: '#F59E0B',
      urgent: '#EF4444',
    };
    return colors[priority as keyof typeof colors] || colors.normal;
  };

  const handleRequestPermission = async () => {
    await requestPermission();
  };

  return (
    <>
      {/* Notification Bell Button */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="hover-scale focus-ring"
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            border: 'none',
            background: t.card,
            color: t.textPrimary,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            position: 'relative',
            transition: 'all 0.2s ease-out',
            ...(isOpen && { 
              transform: 'scale(1.1)',
              boxShadow: '0 8px 25px -5px rgba(59, 130, 246, 0.3)',
            }),
          }}
          title="Notifications"
        >
          <span style={{ 
            transition: 'transform 0.2s ease-out',
            transform: isOpen ? 'rotate(15deg)' : 'rotate(0deg)',
          }}>
            🔔
          </span>
          {unreadCount > 0 && (
            <span 
              className="scale-enter"
              style={{
                position: 'absolute',
                top: -4,
                right: -4,
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: '#EF4444',
                color: 'white',
                fontSize: 12,
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: unreadCount > 0 ? 'pulse 2s ease-in-out infinite' : 'none',
              }}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {/* Notification Panel */}
        {isOpen && (
          <div 
            className={isNotificationAnimating ? 'scale-enter' : ''}
            style={{
              position: 'absolute',
              top: 50,
              right: 0,
              width: 400,
              maxHeight: 600,
              background: t.card,
              border: `1px solid ${t.border}`,
              borderRadius: 16,
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              zIndex: 1000,
              overflow: 'hidden',
              opacity: isNotificationAnimating ? 1 : 0,
              transform: isNotificationAnimating ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(10px)',
              transition: 'all 0.2s ease-out',
            }}
          >
            {/* Header */}
            <div style={{
              padding: 20,
              borderBottom: `1px solid ${t.border}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <h3 style={{
                fontSize: 18,
                fontWeight: 600,
                color: t.textPrimary,
                margin: 0,
                fontFamily: 'var(--font-sans)',
              }}>
                Notifications
              </h3>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="hover-scale focus-ring"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    border: 'none',
                    background: showSettings ? '#3B82F6' : 'transparent',
                    color: showSettings ? 'white' : t.textMuted,
                    cursor: 'pointer',
                    fontSize: 16,
                    transition: 'all 0.2s ease-out',
                  }}
                  title="Settings"
                >
                  ⚙️
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="hover-scale focus-ring"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    border: 'none',
                    background: 'transparent',
                    color: t.textMuted,
                    cursor: 'pointer',
                    fontSize: 18,
                    fontWeight: 'bold',
                    transition: 'all 0.2s ease-out',
                  }}
                >
                  ×
                </button>
              </div>
            </div>

            {/* Settings Panel */}
            {showSettings && (
              <div 
                className={`stagger-children ${isSettingsAnimating ? 'fade-enter' : ''}`}
                style={{
                  padding: 20,
                  borderBottom: `1px solid ${t.border}`,
                  background: dark ? '#1F2937' : '#F9FAFB',
                  opacity: isSettingsAnimating ? 1 : 0,
                  maxHeight: isSettingsAnimating ? '400px' : '0',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease-out',
                }}
              >
                <h4 style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: t.textPrimary,
                  margin: '0 0 16px',
                  fontFamily: 'var(--font-sans)',
                }}>
                  Notification Settings
                </h4>
                
                {!hasPermission && (
                  <div style={{
                    background: '#FEF3C7',
                    border: '1px solid #F59E0B',
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 16,
                  }}>
                    <p style={{
                      fontSize: 14,
                      color: '#92400E',
                      margin: '0 0 8px',
                      fontFamily: 'var(--font-sans)',
                    }}>
                      Browser notifications are disabled
                    </p>
                    <button
                      onClick={handleRequestPermission}
                      className="hover-lift focus-ring"
                      style={{
                        padding: '6px 12px',
                        borderRadius: 6,
                        background: '#F59E0B',
                        color: 'white',
                        border: 'none',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontFamily: 'var(--font-sans)',
                        transition: 'all 0.2s ease-out',
                      }}
                    >
                      Enable Notifications
                    </button>
                  </div>
                )}

                <div style={{ display: 'grid', gap: 12 }}>
                  {[
                    { key: 'medicationReminders', label: '💊 Medication Reminders' },
                    { key: 'appointmentReminders', label: '📅 Appointment Reminders' },
                    { key: 'moodCheckins', label: '💭 Mood Check-ins' },
                    { key: 'exercisePrompts', label: '🏃 Exercise Prompts' },
                    { key: 'celebrations', label: '🎉 Celebrations' },
                  ].map(({ key, label }) => (
                    <label key={key} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      cursor: 'pointer',
                    }}>
                      <input
                        type="checkbox"
                        checked={settings[key as keyof typeof settings] as boolean}
                        onChange={(e) => updateSettings({ [key]: e.target.checked })}
                        style={{ width: 16, height: 16 }}
                      />
                      <span style={{
                        fontSize: 14,
                        color: t.textPrimary,
                        fontFamily: 'var(--font-sans)',
                      }}>
                        {label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Notification List */}
            <div 
              className="stagger-children"
              style={{
                maxHeight: 400,
                overflowY: 'auto',
              }}
            >
              {recentNotifications.length === 0 ? (
                <div style={{
                  padding: 40,
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>🔕</div>
                  <p style={{
                    fontSize: 16,
                    color: t.textMuted,
                    margin: 0,
                    fontFamily: 'var(--font-sans)',
                  }}>
                    No notifications yet
                  </p>
                </div>
              ) : (
                <>
                  {recentNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="hover-lift"
                      style={{
                        padding: 16,
                        borderBottom: `1px solid ${t.border}`,
                        display: 'flex',
                        gap: 12,
                        alignItems: 'start',
                        transition: 'all 0.2s ease-out',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: `${getPriorityColor(notification.priority)}22`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 20,
                        flexShrink: 0,
                      }}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'start',
                          marginBottom: 4,
                        }}>
                          <h4 style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: t.textPrimary,
                            margin: 0,
                            fontFamily: 'var(--font-sans)',
                          }}>
                            {notification.title}
                          </h4>
                          <button
                            onClick={() => dismissNotification(notification.id)}
                            className="hover-scale focus-ring"
                            style={{
                              width: 20,
                              height: 20,
                              borderRadius: '50%',
                              border: 'none',
                              background: 'transparent',
                              color: t.textMuted,
                              cursor: 'pointer',
                              fontSize: 14,
                              flexShrink: 0,
                              transition: 'all 0.15s ease-out',
                            }}
                          >
                            ×
                          </button>
                        </div>
                        
                        <p style={{
                          fontSize: 13,
                          color: t.textMuted,
                          margin: '0 0 4px',
                          lineHeight: 1.4,
                          fontFamily: 'var(--font-sans)',
                        }}>
                          {notification.message}
                        </p>
                        
                        <p style={{
                          fontSize: 11,
                          color: t.textMuted,
                          margin: 0,
                          fontFamily: 'var(--font-sans)',
                        }}>
                          {notification.deliveredAt?.toLocaleDateString()} at {notification.deliveredAt?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>

                        {/* Actions */}
                        {notification.actions && (
                          <div style={{
                            display: 'flex',
                            gap: 8,
                            marginTop: 8,
                          }}>
                            {notification.actions.map((action) => (
                              <button
                                key={action.action}
                                className="hover-lift focus-ring"
                                style={{
                                  padding: '4px 8px',
                                  borderRadius: 4,
                                  background: getPriorityColor(notification.priority),
                                  color: 'white',
                                  border: 'none',
                                  fontSize: 11,
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  fontFamily: 'var(--font-sans)',
                                  transition: 'all 0.15s ease-out',
                                }}
                              >
                                {action.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {recentNotifications.length > 0 && (
                    <div style={{ padding: 16, textAlign: 'center' }}>
                      <button
                        onClick={clearAllNotifications}
                        className="hover-lift focus-ring"
                        style={{
                          padding: '8px 16px',
                          borderRadius: 8,
                          background: 'transparent',
                          color: t.textMuted,
                          border: `1px solid ${t.border}`,
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                          fontFamily: 'var(--font-sans)',
                          transition: 'all 0.2s ease-out',
                        }}
                      >
                        Clear All
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999,
          }}
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}