/**
 * WellnessHub.tsx - Unified Wellness & Exercises Dashboard
 * Combined exercises, sleep tracking, and wellness management with AI insights
 */

import { useState, useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useWellness } from '../context/WellnessContext';
import { getTheme } from '../tokens';
import Sidebar from '../components/Sidebar';
import ExerciseModal from '../components/ExerciseModal';
import type { GuidedExercise } from '../types/wellness';

const EXERCISE_TYPES: Array<{
  type: GuidedExercise['type'];
  name: string;
  description: string;
  icon: string;
  color: string;
  category: 'mood' | 'sleep' | 'resilience' | 'mindfulness';
  duration: number;
}> = [
  {
    type: 'cbt',
    name: 'Challenge Negative Thoughts',
    description: 'CBT technique to reframe unhelpful thinking patterns',
    icon: '🧠',
    color: '#8B5CF6',
    category: 'resilience',
    duration: 10,
  },
  {
    type: 'gratitude',
    name: 'Gratitude Practice',
    description: 'Focus on positive aspects of your day',
    icon: '🙏',
    color: '#EC4899',
    category: 'mindfulness',
    duration: 5,
  },
  {
    type: 'values',
    name: 'Values Clarification',
    description: 'Identify what truly matters to you',
    icon: '⭐',
    color: '#F59E0B',
    category: 'resilience',
    duration: 15,
  },
  {
    type: 'goal',
    name: 'SMART Goal Setting',
    description: 'Set specific, achievable goals',
    icon: '🎯',
    color: '#10B981',
    category: 'resilience',
    duration: 10,
  },
  {
    type: 'sleep',
    name: 'Sleep Hygiene Check',
    description: 'Review and improve sleep habits',
    icon: '😴',
    color: '#6366F1',
    category: 'sleep',
    duration: 7,
  },
  {
    type: 'compassion',
    name: 'Self-Compassion',
    description: 'Practice being kind to yourself',
    icon: '💙',
    color: '#14B8A6',
    category: 'mindfulness',
    duration: 8,
  },
];

export default function WellnessHub() {
  const { dark } = useTheme();
  const t = getTheme(dark);
  const { exercises, startExercise, sleepLog, addSleepEntry, getSleepInsights, analyzeSentiment } = useWellness();
  
  const [selectedExercise, setSelectedExercise] = useState<GuidedExercise | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'exercises' | 'sleep' | 'insights'>('dashboard');
  const [showAddSleep, setShowAddSleep] = useState(false);
  const [bedTime, setBedTime] = useState('23:00');
  const [wakeTime, setWakeTime] = useState('07:00');
  const [quality, setQuality] = useState<1 | 2 | 3 | 4 | 5>(3);

  // Smart exercise recommendations
  const recommendedExercises = useMemo(() => {
    const recent = sleepLog.slice(0, 7);
    const avgQuality = recent.length > 0 ? recent.reduce((sum, e) => sum + e.quality, 0) / recent.length : 3;
    const avgHours = recent.length > 0 ? recent.reduce((sum, e) => sum + e.hoursSlept, 0) / recent.length : 7;

    let recommendations = [...EXERCISE_TYPES];

    // Prioritize based on wellness data
    if (avgQuality < 3) {
      // If sleep quality is poor, recommend sleep hygiene and relaxation
      recommendations.sort((a, b) => {
        const aScore = a.type === 'sleep' ? 10 : a.category === 'mindfulness' ? 8 : 5;
        const bScore = b.type === 'sleep' ? 10 : b.category === 'mindfulness' ? 8 : 5;
        return bScore - aScore;
      });
    } else if (avgHours < 6) {
      // If not getting enough sleep, recommend sleep focus
      const sleepEx = recommendations.find(e => e.type === 'sleep');
      if (sleepEx) {
        recommendations = [sleepEx, ...recommendations.filter(e => e.type !== 'sleep')];
      }
    } else {
      // If sleep is good, focus on mood and resilience
      recommendations.sort((a, b) => {
        const aScore = a.category === 'resilience' ? 9 : a.category === 'mindfulness' ? 7 : 5;
        const bScore = b.category === 'resilience' ? 9 : b.category === 'mindfulness' ? 7 : 5;
        return bScore - aScore;
      });
    }

    return recommendations.slice(0, 3);
  }, [sleepLog]);

  // Calculate wellness stats
  const stats = useMemo(() => {
    const recent = sleepLog.slice(0, 7);
    const completed = exercises.filter(e => e.completedAt).length;
    
    return {
      avgSleep: recent.length > 0 ? (recent.reduce((sum, e) => sum + e.hoursSlept, 0) / recent.length).toFixed(1) : '0',
      sleepQuality: recent.length > 0 ? ((recent.reduce((sum, e) => sum + e.quality, 0) / recent.length) * 20).toFixed(0) : '0',
      exercisesCompleted: completed,
      totalExercises: exercises.length,
      completionRate: exercises.length > 0 ? ((completed / exercises.length) * 100).toFixed(0) : '0',
    };
  }, [exercises, sleepLog]);

  // Generate wellness insights
  const insights = useMemo(() => {
    const insightList: string[] = [];
    const recent = sleepLog.slice(0, 7);
    
    if (recent.length < 3) {
      insightList.push('📊 Log more sleep data to get personalized insights');
      return insightList;
    }

    const avgHours = recent.reduce((sum, e) => sum + e.hoursSlept, 0) / recent.length;
    const avgQuality = recent.reduce((sum, e) => sum + e.quality, 0) / recent.length;
    const completionRate = parseInt(stats.completionRate);

    // Sleep insights
    if (avgHours < 6) {
      insightList.push('😴 You\'re getting less than 6 hours - try going to bed 30 mins earlier');
    } else if (avgHours >= 7 && avgHours <= 9) {
      insightList.push('✨ Great sleep duration! You\'re in the healthy 7-9 hour range');
    } else if (avgHours > 9) {
      insightList.push('💤 You\'re oversleeping - this might affect energy levels');
    }

    // Quality insights
    if (avgQuality < 3) {
      insightList.push('⚠️ Sleep quality is low - consider the Sleep Hygiene exercise');
    }

    // Exercise insights
    if (completionRate > 50) {
      insightList.push('🎉 Great consistency! Keep up the exercise practice');
    } else if (completionRate > 0) {
      insightList.push('💪 You\'ve started exercising - build momentum with daily practice');
    } else {
      insightList.push('🚀 Start an exercise to boost your resilience and mood');
    }

    // Holistic wellness
    if (avgQuality >= 4 && completionRate > 50) {
      insightList.push('🌟 Your wellness routine is working well - you\'re taking great care of yourself!');
    }

    return insightList;
  }, [sleepLog, stats]);

  const handleStartExercise = (type: GuidedExercise['type']) => {
    const exercise = startExercise(type);
    setSelectedExercise(exercise);
    setIsModalOpen(true);
  };

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

  const recentExercises = exercises.slice(0, 3);

  return (
    <div style={{ minHeight: '100vh', background: t.bg, display: 'flex' }}>
      <Sidebar active="wellness" />
      
      <main style={{
        flex: 1,
        marginLeft: 240,
        padding: '48px 24px',
        overflowY: 'auto',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {/* Header */}
          <div style={{ marginBottom: 40 }}>
            <h1 style={{
              fontSize: 32,
              fontWeight: 700,
              color: t.textPrimary,
              margin: '0 0 8px',
              fontFamily: 'var(--font-sans)',
            }}>
              Wellness Hub
            </h1>
            <p style={{
              fontSize: 16,
              color: t.textMuted,
              fontFamily: 'var(--font-sans)',
            }}>
              Your complete wellness center combining exercises, sleep tracking, and insights
            </p>
          </div>

          {/* Tab Navigation */}
          <div style={{
            display: 'flex',
            gap: 12,
            marginBottom: 32,
            borderBottom: `1px solid ${t.border}`,
          }}>
            {(['dashboard', 'exercises', 'sleep', 'insights'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '12px 24px',
                  background: activeTab === tab ? t.accent : 'transparent',
                  color: activeTab === tab ? '#fff' : t.textMuted,
                  border: 'none',
                  borderRadius: '8px 8px 0 0',
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 600,
                  fontFamily: 'var(--font-sans)',
                  transition: 'all 0.2s',
                  textTransform: 'capitalize',
                }}
              >
                {tab === 'dashboard' && '📊 Dashboard'}
                {tab === 'exercises' && '🧘 Exercises'}
                {tab === 'sleep' && '😴 Sleep'}
                {tab === 'insights' && '💡 Insights'}
              </button>
            ))}
          </div>

          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div>
              {/* Stats Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 16,
                marginBottom: 32,
              }}>
                {[
                  { label: 'Avg Sleep', value: `${stats.avgSleep}h`, icon: '😴' },
                  { label: 'Sleep Quality', value: `${stats.sleepQuality}%`, icon: '⭐' },
                  { label: 'Exercises Done', value: `${stats.exercisesCompleted}/${stats.totalExercises}`, icon: '🎯' },
                  { label: 'Completion Rate', value: `${stats.completionRate}%`, icon: '📈' },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    style={{
                      background: t.card,
                      borderRadius: 16,
                      padding: 20,
                      border: `1px solid ${t.border}`,
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: 32, marginBottom: 8 }}>{stat.icon}</div>
                    <p style={{
                      fontSize: 12,
                      color: t.textMuted,
                      fontWeight: 600,
                      margin: '0 0 4px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      fontFamily: 'var(--font-sans)',
                    }}>
                      {stat.label}
                    </p>
                    <p style={{
                      fontSize: 24,
                      fontWeight: 700,
                      color: t.textPrimary,
                      margin: 0,
                      fontFamily: 'var(--font-sans)',
                    }}>
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div style={{ marginBottom: 32 }}>
                <h3 style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: t.textPrimary,
                  margin: '0 0 16px',
                  fontFamily: 'var(--font-sans)',
                }}>
                  Quick Actions
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: 12,
                }}>
                  <button
                    onClick={() => { setShowAddSleep(!showAddSleep); setActiveTab('sleep'); }}
                    style={{
                      padding: '12px 16px',
                      borderRadius: 12,
                      background: `${t.accent}20`,
                      color: t.accent,
                      border: `1px solid ${t.accent}`,
                      cursor: 'pointer',
                      fontSize: 14,
                      fontWeight: 600,
                      fontFamily: 'var(--font-sans)',
                      transition: 'all 0.2s',
                    }}
                  >
                    📝 Log Sleep
                  </button>
                  <button
                    onClick={() => setActiveTab('exercises')}
                    style={{
                      padding: '12px 16px',
                      borderRadius: 12,
                      background: `${t.accent}20`,
                      color: t.accent,
                      border: `1px solid ${t.accent}`,
                      cursor: 'pointer',
                      fontSize: 14,
                      fontWeight: 600,
                      fontFamily: 'var(--font-sans)',
                      transition: 'all 0.2s',
                    }}
                  >
                    🧘 Start Exercise
                  </button>
                  <button
                    onClick={() => setActiveTab('insights')}
                    style={{
                      padding: '12px 16px',
                      borderRadius: 12,
                      background: `${t.accent}20`,
                      color: t.accent,
                      border: `1px solid ${t.accent}`,
                      cursor: 'pointer',
                      fontSize: 14,
                      fontWeight: 600,
                      fontFamily: 'var(--font-sans)',
                      transition: 'all 0.2s',
                    }}
                  >
                    💡 View Insights
                  </button>
                </div>
              </div>

              {/* Recommended Exercises */}
              <div style={{ marginBottom: 32 }}>
                <h3 style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: t.textPrimary,
                  margin: '0 0 16px',
                  fontFamily: 'var(--font-sans)',
                }}>
                  Recommended For You
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: 16,
                }}>
                  {recommendedExercises.map((ex) => (
                    <button
                      key={ex.type}
                      onClick={() => handleStartExercise(ex.type)}
                      style={{
                        background: t.card,
                        borderRadius: 16,
                        padding: 20,
                        border: `1px solid ${t.border}`,
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      <div style={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        background: dark ? `${ex.color}22` : `${ex.color}11`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 24,
                        marginBottom: 12,
                      }}>
                        {ex.icon}
                      </div>
                      <h4 style={{
                        fontSize: 16,
                        fontWeight: 600,
                        color: t.textPrimary,
                        margin: '0 0 8px',
                        fontFamily: 'var(--font-sans)',
                      }}>
                        {ex.name}
                      </h4>
                      <p style={{
                        fontSize: 13,
                        color: t.textMuted,
                        margin: '0 0 8px',
                        fontFamily: 'var(--font-sans)',
                      }}>
                        {ex.description}
                      </p>
                      <p style={{
                        fontSize: 12,
                        color: t.accent,
                        fontWeight: 600,
                        margin: 0,
                        fontFamily: 'var(--font-sans)',
                      }}>
                        ⏱️ {ex.duration} min
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Recent Exercises */}
              {recentExercises.length > 0 && (
                <div>
                  <h3 style={{
                    fontSize: 18,
                    fontWeight: 600,
                    color: t.textPrimary,
                    margin: '0 0 16px',
                    fontFamily: 'var(--font-sans)',
                  }}>
                    Continue Where You Left Off
                  </h3>
                  <div style={{ display: 'grid', gap: 12 }}>
                    {recentExercises.map((ex) => (
                      <div
                        key={ex.id}
                        onClick={() => {
                          setSelectedExercise(ex);
                          setIsModalOpen(true);
                        }}
                        style={{
                          background: t.card,
                          borderRadius: 12,
                          padding: 16,
                          border: `1px solid ${t.border}`,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                      >
                        <p style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: t.textPrimary,
                          margin: 0,
                          fontFamily: 'var(--font-sans)',
                        }}>
                          {ex.name}
                        </p>
                        <p style={{
                          fontSize: 12,
                          color: t.textMuted,
                          margin: '4px 0 0',
                          fontFamily: 'var(--font-sans)',
                        }}>
                          {ex.completedAt ? '✅ Completed' : `Step ${ex.steps.filter(s => s.userInput).length}/${ex.steps.length}`}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Exercises Tab */}
          {activeTab === 'exercises' && (
            <div>
              <h2 style={{
                fontSize: 18,
                fontWeight: 600,
                color: t.textPrimary,
                marginBottom: 20,
                fontFamily: 'var(--font-sans)',
              }}>
                All Guided Exercises
              </h2>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 20,
              }}>
                {EXERCISE_TYPES.map((exercise) => (
                  <button
                    key={exercise.type}
                    onClick={() => handleStartExercise(exercise.type)}
                    style={{
                      background: t.card,
                      borderRadius: 16,
                      padding: 24,
                      border: `1px solid ${t.border}`,
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease-out',
                      boxShadow: t.cardShadow,
                    }}
                  >
                    <div style={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      background: dark ? `${exercise.color}22` : `${exercise.color}11`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 24,
                      marginBottom: 16,
                    }}>
                      {exercise.icon}
                    </div>

                    <h3 style={{
                      fontSize: 16,
                      fontWeight: 600,
                      color: t.textPrimary,
                      margin: '0 0 8px',
                      fontFamily: 'var(--font-sans)',
                    }}>
                      {exercise.name}
                    </h3>

                    <p style={{
                      fontSize: 14,
                      color: t.textMuted,
                      lineHeight: 1.5,
                      margin: '0 0 12px',
                      fontFamily: 'var(--font-sans)',
                    }}>
                      {exercise.description}
                    </p>

                    <div style={{
                      display: 'flex',
                      gap: 8,
                      fontSize: 12,
                      color: t.textMuted,
                    }}>
                      <span>⏱️ {exercise.duration} min</span>
                      <span>📂 {exercise.category}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sleep Tab */}
          {activeTab === 'sleep' && (
            <div>
              {/* Add Sleep Button */}
              <button
                onClick={() => setShowAddSleep(!showAddSleep)}
                style={{
                  padding: '12px 24px',
                  borderRadius: 12,
                  background: `linear-gradient(135deg, ${t.accent} 0%, ${t.accent}dd 100%)`,
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
                        background: t.accent,
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

              {/* Sleep Insights */}
              {sleepLog.length >= 3 && (
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
                  {getSleepInsights().map((insight, i) => (
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

                {sleepLog.slice(0, 7).length === 0 ? (
                  <p style={{
                    fontSize: 14,
                    color: t.textMuted,
                    fontFamily: 'var(--font-sans)',
                  }}>
                    No sleep data yet. Start tracking to see patterns!
                  </p>
                ) : (
                  <div style={{ display: 'grid', gap: 12 }}>
                    {sleepLog.slice(0, 7).map((entry, i) => (
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
          )}

          {/* Insights Tab */}
          {activeTab === 'insights' && (
            <div>
              <div style={{
                background: dark ? `${t.accent}11` : `${t.accent}08`,
                borderRadius: 16,
                padding: 24,
                border: `1px solid ${t.border}`,
              }}>
                <h2 style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: t.textPrimary,
                  margin: '0 0 24px',
                  fontFamily: 'var(--font-sans)',
                }}>
                  🎯 Your Personalized Wellness Insights
                </h2>

                <div style={{ display: 'grid', gap: 16 }}>
                  {insights.map((insight, i) => (
                    <div
                      key={i}
                      style={{
                        background: t.card,
                        borderRadius: 12,
                        padding: 16,
                        border: `1px solid ${t.border}`,
                        display: 'flex',
                        gap: 12,
                        alignItems: 'flex-start',
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <p style={{
                          fontSize: 15,
                          color: t.textPrimary,
                          lineHeight: 1.6,
                          margin: 0,
                          fontFamily: 'var(--font-sans)',
                        }}>
                          {insight}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Wellness Summary */}
                <div style={{
                  marginTop: 24,
                  padding: 16,
                  borderRadius: 12,
                  background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                  border: `1px solid ${t.border}`,
                }}>
                  <h3 style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: t.textPrimary,
                    margin: '0 0 12px',
                    fontFamily: 'var(--font-sans)',
                  }}>
                    📊 Your Wellness Overview
                  </h3>
                  <div style={{ display: 'grid', gap: 8 }}>
                    <p style={{
                      fontSize: 14,
                      color: t.textPrimary,
                      margin: 0,
                      fontFamily: 'var(--font-sans)',
                    }}>
                      <strong>Sleep Average:</strong> {stats.avgSleep} hours per night
                    </p>
                    <p style={{
                      fontSize: 14,
                      color: t.textPrimary,
                      margin: 0,
                      fontFamily: 'var(--font-sans)',
                    }}>
                      <strong>Exercise Completion:</strong> {stats.completionRate}% ({stats.exercisesCompleted} of {stats.totalExercises})
                    </p>
                    <p style={{
                      fontSize: 14,
                      color: t.textPrimary,
                      margin: 0,
                      fontFamily: 'var(--font-sans)',
                    }}>
                      <strong>Overall Sleep Quality:</strong> {stats.sleepQuality}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Exercise Modal */}
      {selectedExercise && (
        <ExerciseModal
          exercise={selectedExercise}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedExercise(null);
          }}
        />
      )}
    </div>
  );
}
