/**
 * Wellness.tsx - Sleep & Routine Tracking
 */

import { useState } from 'react';
import { useWellness } from '../context/WellnessContext';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../tokens';
import Sidebar from '../components/Sidebar';

export default function Wellness() {
  const { dark } = useTheme();
  const t = getTheme(dark);
  const { sleepLog, addSleepEntry, getSleepInsights } = useWellness();
  
  const [showAddSleep, setShowAddSleep] = useState(false);
  const [bedTime, setBedTime] = useState('23:00');
  const [wakeTime, setWakeTime] = useState('07:00');
  const [quality, setQuality] = useState<1 | 2 | 3 | 4 | 5>(3);

  const insights = getSleepInsights();
  const recentSleep = sleepLog.slice(0, 7);

  const handleAddSleep = () => {
    const bed = new Date(`2000-01-01T${bedTime}`);
    const wake = new Date(`2000-01-01T${wakeTime}`);
    let hours = (wake.getTime() - bed.getTime()) / (1000 * 60 * 60);
    if (hours < 0) hours += 24;

    addSleepEntry({
      date: new Date(),
      bedTime,
      wakeTime,
      hoursSlept: hours,
      quality,
      caffeineAfterNoon: false,
      screenTimeBeforeBed: false,
    });

    setShowAddSleep(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: t.bg, display: 'flex' }}>
      <Sidebar active="wellness" />
      <main style={{
        flex: 1,
        marginLeft: 240,
        padding: '48px 24px',
        overflowY: 'auto',
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <h1 style={{
              fontSize: 32,
              fontWeight: 700,
              color: t.textPrimary,
              margin: '0 0 8px',
              fontFamily: 'var(--font-sans)',
            }}>
              Sleep & Wellness Tracking
            </h1>
            <p style={{
              fontSize: 16,
              color: t.textMuted,
              fontFamily: 'var(--font-sans)',
            }}>
              Track your sleep patterns and routines
            </p>
          </div>

          {/* Add Sleep Button */}
          <button
            onClick={() => setShowAddSleep(!showAddSleep)}
            style={{
              padding: '12px 24px',
              borderRadius: 12,
              background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
              color: 'white',
              border: 'none',
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
              marginBottom: 24,
            }}
          >
            + Log Sleep
          </button>

          {/* Add Sleep Form */}
          {showAddSleep && (
            <div style={{
              background: t.card,
              borderRadius: 16,
              padding: 24,
              marginBottom: 24,
              border: `1px solid ${t.border}`,
            }}>
              <h3 style={{
                fontSize: 18,
                fontWeight: 600,
                color: t.textPrimary,
                margin: '0 0 20px',
                fontFamily: 'var(--font-sans)',
              }}>
                Log Last Night's Sleep
              </h3>

              <div style={{ display: 'grid', gap: 16 }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: 14,
                    fontWeight: 600,
                    color: t.textPrimary,
                    marginBottom: 8,
                    fontFamily: 'var(--font-sans)',
                  }}>
                    Bed Time
                  </label>
                  <input
                    type="time"
                    value={bedTime}
                    onChange={(e) => setBedTime(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 8,
                      background: t.input,
                      border: `1px solid ${t.border}`,
                      color: t.textPrimary,
                      fontSize: 14,
                      fontFamily: 'var(--font-sans)',
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: 14,
                    fontWeight: 600,
                    color: t.textPrimary,
                    marginBottom: 8,
                    fontFamily: 'var(--font-sans)',
                  }}>
                    Wake Time
                  </label>
                  <input
                    type="time"
                    value={wakeTime}
                    onChange={(e) => setWakeTime(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 8,
                      background: t.input,
                      border: `1px solid ${t.border}`,
                      color: t.textPrimary,
                      fontSize: 14,
                      fontFamily: 'var(--font-sans)',
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: 14,
                    fontWeight: 600,
                    color: t.textPrimary,
                    marginBottom: 8,
                    fontFamily: 'var(--font-sans)',
                  }}>
                    Sleep Quality: {quality}/5
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value) as 1 | 2 | 3 | 4 | 5)}
                    style={{ width: '100%' }}
                  />
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 12,
                    color: t.textMuted,
                    marginTop: 4,
                  }}>
                    <span>Terrible</span>
                    <span>Excellent</span>
                  </div>
                </div>

                <button
                  onClick={handleAddSleep}
                  style={{
                    padding: '12px',
                    borderRadius: 8,
                    background: '#6366F1',
                    color: 'white',
                    border: 'none',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  Save Sleep Entry
                </button>
              </div>
            </div>
          )}

          {/* Insights */}
          {insights.length > 0 && (
            <div style={{
              background: dark ? 'rgba(99,102,241,0.1)' : '#EEF2FF',
              borderRadius: 16,
              padding: 20,
              marginBottom: 24,
              border: `1px solid ${dark ? 'rgba(99,102,241,0.2)' : '#C7D2FE'}`,
            }}>
              <h3 style={{
                fontSize: 16,
                fontWeight: 600,
                color: '#6366F1',
                margin: '0 0 12px',
                fontFamily: 'var(--font-sans)',
              }}>
                💡 Sleep Insights
              </h3>
              {insights.map((insight, i) => (
                <p key={i} style={{
                  fontSize: 14,
                  color: t.textPrimary,
                  margin: '8px 0',
                  fontFamily: 'var(--font-sans)',
                }}>
                  • {insight}
                </p>
              ))}
            </div>
          )}

          {/* Recent Sleep Log */}
          <div style={{
            background: t.card,
            borderRadius: 16,
            padding: 24,
            border: `1px solid ${t.border}`,
          }}>
            <h3 style={{
              fontSize: 18,
              fontWeight: 600,
              color: t.textPrimary,
              margin: '0 0 20px',
              fontFamily: 'var(--font-sans)',
            }}>
              Last 7 Nights
            </h3>

            {recentSleep.length === 0 ? (
              <p style={{
                fontSize: 14,
                color: t.textMuted,
                fontFamily: 'var(--font-sans)',
              }}>
                No sleep data yet. Start tracking to see patterns!
              </p>
            ) : (
              <div style={{ display: 'grid', gap: 12 }}>
                {recentSleep.map((entry, i) => (
                  <div
                    key={i}
                    style={{
                      padding: 16,
                      borderRadius: 12,
                      background: dark ? 'rgba(255,255,255,0.03)' : '#F9FAFB',
                      border: `1px solid ${t.border}`,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: t.textPrimary,
                          margin: 0,
                          fontFamily: 'var(--font-sans)',
                        }}>
                          {entry.date.toLocaleDateString()}
                        </p>
                        <p style={{
                          fontSize: 13,
                          color: t.textMuted,
                          margin: '4px 0 0',
                          fontFamily: 'var(--font-sans)',
                        }}>
                          {entry.bedTime} - {entry.wakeTime} ({entry.hoursSlept.toFixed(1)} hours)
                        </p>
                      </div>
                      <div style={{
                        display: 'flex',
                        gap: 4,
                      }}>
                        {[...Array(5)].map((_, i) => (
                          <span key={i} style={{
                            fontSize: 16,
                            opacity: i < entry.quality ? 1 : 0.2,
                          }}>
                            ⭐
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
