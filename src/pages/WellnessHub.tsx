import { useState, useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useWellness } from '../context/WellnessContext';
import { getTheme } from '../tokens';
import Sidebar from '../components/Sidebar';
import ExerciseModal from '../components/ExerciseModal';
import type { GuidedExercise } from '../types/wellness';
import {
  Brain,
  HeartHandshake,
  Star,
  Target,
  Moon,
  Heart,
  BarChart2,
  Activity,
  Lightbulb,
  TrendingUp,
  Edit3,
  Play,
  CheckCircle2,
  Folder,
  Clock,
  Sparkles,
} from 'lucide-react';

const EXERCISE_TYPES: Array<{
  type: GuidedExercise['type'];
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  category: 'mood' | 'sleep' | 'resilience' | 'mindfulness';
  duration: number;
}> = [
  {
    type: 'cbt',
    name: 'Challenge Negative Thoughts',
    description: 'CBT technique to reframe unhelpful thinking patterns',
    icon: <Brain className="w-6 h-6" />,
    color: '#8B5CF6',
    category: 'resilience',
    duration: 10,
  },
  {
    type: 'gratitude',
    name: 'Gratitude Practice',
    description: 'Focus on positive aspects of your day',
    icon: <HeartHandshake className="w-6 h-6" />,
    color: '#EC4899',
    category: 'mindfulness',
    duration: 5,
  },
  {
    type: 'values',
    name: 'Values Clarification',
    description: 'Identify what truly matters to you',
    icon: <Star className="w-6 h-6" />,
    color: '#F59E0B',
    category: 'resilience',
    duration: 15,
  },
  {
    type: 'goal',
    name: 'SMART Goal Setting',
    description: 'Set specific, achievable goals',
    icon: <Target className="w-6 h-6" />,
    color: '#10B981',
    category: 'resilience',
    duration: 10,
  },
  {
    type: 'sleep',
    name: 'Sleep Hygiene Check',
    description: 'Review and improve sleep habits',
    icon: <Moon className="w-6 h-6" />,
    color: '#6366F1',
    category: 'sleep',
    duration: 7,
  },
  {
    type: 'compassion',
    name: 'Self-Compassion',
    description: 'Practice being kind to yourself',
    icon: <Heart className="w-6 h-6" />,
    color: '#14B8A6',
    category: 'mindfulness',
    duration: 8,
  },
];

export default function WellnessHub() {
  const { dark } = useTheme();
  const t = getTheme(dark);
  const {
    exercises,
    sleepLog,
    addSleepEntry,
    startExercise,
    getSleepInsights,
  } = useWellness();

  // Derived stats
  const stats = useMemo(() => {
    const totalExercises = exercises.length;
    const exercisesCompleted = exercises.filter(e => Boolean(e.completedAt)).length;
    const completionRate = totalExercises > 0 ? Math.round((exercisesCompleted / totalExercises) * 100) : 0;
    
    const avgSleep = sleepLog.length > 0
      ? Number((sleepLog.reduce((acc, curr) => acc + curr.hoursSlept, 0) / sleepLog.length).toFixed(1))
      : 0;

    const sleepQuality = sleepLog.length > 0
      ? Math.round((sleepLog.reduce((acc, curr) => acc + curr.quality, 0) / (sleepLog.length * 5)) * 100)
      : 0;

    return { totalExercises, exercisesCompleted, completionRate, avgSleep, sleepQuality };
  }, [exercises, sleepLog]);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'exercises' | 'sleep' | 'insights'>('dashboard');
  const [selectedExercise, setSelectedExercise] = useState<GuidedExercise | null>(null);
  const [showSleepLogger, setShowSleepLogger] = useState(false);

  // Sleep Logger Form State
  const [sleepForm, setSleepForm] = useState({
    date: new Date().toISOString().split('T')[0],
    hoursSlept: 7.5,
    quality: 4 as 1 | 2 | 3 | 4 | 5,
    bedTime: '23:00',
    wakeTime: '06:30',
    notes: '',
  });

  const handleStartExercise = (type: GuidedExercise['type']) => {
    const exercise = startExercise(type);
    setSelectedExercise(exercise);
  };

  const handleSleepSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addSleepEntry({
      date: new Date(sleepForm.date),
      hoursSlept: Number(sleepForm.hoursSlept),
      quality: sleepForm.quality,
      bedTime: sleepForm.bedTime,
      wakeTime: sleepForm.wakeTime,
      notes: sleepForm.notes,
    });
    setShowSleepLogger(false);
  };

  // Generate personalized insights based on data
  const insights = useMemo(() => {
    const insightList: string[] = [];

    // Sleep insights
    if (sleepLog.length < 3) {
      insightList.push('Log more sleep data to get personalized insights');
    } else {
      const avgSleep = stats.avgSleep;
      if (avgSleep < 6) {
        insightList.push('You\'re getting less than 6 hours - try going to bed 30 mins earlier');
      } else if (avgSleep >= 7 && avgSleep <= 9) {
        insightList.push('Great sleep duration! You\'re in the healthy 7-9 hour range');
      } else {
        insightList.push('You\'re oversleeping - this might affect energy levels');
      }

      if (stats.sleepQuality < 60) {
        insightList.push('Sleep quality is low - consider the Sleep Hygiene exercise');
      }
    }

    // Exercise insights
    if (stats.exercisesCompleted > 5) {
      insightList.push('Great consistency! Keep up the exercise practice');
    } else if (stats.exercisesCompleted > 0) {
      insightList.push('You\'ve started exercising - build momentum with daily practice');
    } else {
      insightList.push('Start an exercise to boost your resilience and mood');
    }

    // Combined insight
    if (stats.avgSleep >= 7 && stats.exercisesCompleted >= 3) {
      insightList.push('Your wellness routine is working well - you\'re taking great care of yourself!');
    }

    return insightList;
  }, [sleepLog, stats]);

  return (
    <div style={{
      minHeight: '100vh',
      background: t.bg,
      color: t.textPrimary,
      fontFamily: 'var(--font-sans)',
      paddingLeft: 240,
    }}>
      <Sidebar active="wellness" />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 32px 80px' }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{
            fontSize: 28,
            fontWeight: 700,
            color: t.textPrimary,
            margin: '0 0 8px',
            fontFamily: 'var(--font-sans)',
          }}>
            Wellness Hub
          </h1>
          <p style={{
            fontSize: 15,
            color: t.textMuted,
            margin: 0,
            fontFamily: 'var(--font-sans)',
          }}>
            Your complete toolkit for mental fitness, sleep tracking, and resilience
          </p>
        </div>

        {/* Tab Bar */}
        <div style={{
          display: 'flex',
          gap: 12,
          borderBottom: `1px solid ${t.border}`,
          marginBottom: 32,
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
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              {tab === 'dashboard' && <><BarChart2 className="w-4 h-4" /> Dashboard</>}
              {tab === 'exercises' && <><Activity className="w-4 h-4" /> Exercises</>}
              {tab === 'sleep' && <><Moon className="w-4 h-4" /> Sleep</>}
              {tab === 'insights' && <><Lightbulb className="w-4 h-4" /> Insights</>}
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
                { label: 'Avg Sleep', value: `${stats.avgSleep}h`, icon: <Moon className="w-5 h-5 text-indigo-400" /> },
                { label: 'Sleep Quality', value: `${stats.sleepQuality}%`, icon: <Star className="w-5 h-5 text-amber-400" /> },
                { label: 'Exercises Done', value: `${stats.exercisesCompleted}/${stats.totalExercises}`, icon: <Target className="w-5 h-5 text-emerald-400" /> },
                { label: 'Completion Rate', value: `${stats.completionRate}%`, icon: <TrendingUp className="w-5 h-5 text-teal-400" /> },
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
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
                    {stat.icon}
                  </div>
                  <p style={{
                    fontSize: 24,
                    fontWeight: 700,
                    color: t.textPrimary,
                    margin: '4px 0',
                    fontFamily: 'var(--font-sans)',
                  }}>
                    {stat.value}
                  </p>
                  <p style={{
                    fontSize: 13,
                    color: t.textMuted,
                    margin: 0,
                    fontFamily: 'var(--font-sans)',
                  }}>
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div style={{
              background: t.card,
              borderRadius: 20,
              padding: 24,
              marginBottom: 32,
              border: `1px solid ${t.border}`,
            }}>
              <h2 style={{
                fontSize: 18,
                fontWeight: 600,
                color: t.textPrimary,
                margin: '0 0 16px',
                fontFamily: 'var(--font-sans)',
              }}>
                Quick Actions
              </h2>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button
                  onClick={() => { setActiveTab('sleep'); setShowSleepLogger(true); }}
                  style={{
                    padding: '12px 16px',
                    borderRadius: 12,
                    background: t.accent,
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 14,
                    fontWeight: 600,
                    fontFamily: 'var(--font-sans)',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Edit3 className="w-4 h-4" /> Log Sleep
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
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Play className="w-4 h-4" /> Start Exercise
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
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Lightbulb className="w-4 h-4" /> View Insights
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
                Recommended Exercises
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: 16,
              }}>
                {EXERCISE_TYPES.slice(0, 3).map((ex) => (
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                      <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: `${ex.color}20`,
                        color: ex.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        {ex.icon}
                      </div>
                      <div>
                        <h4 style={{
                          fontSize: 15,
                          fontWeight: 600,
                          color: t.textPrimary,
                          margin: 0,
                          fontFamily: 'var(--font-sans)',
                        }}>
                          {ex.name}
                        </h4>
                        <span style={{
                          fontSize: 12,
                          color: t.textMuted,
                          fontFamily: 'var(--font-sans)',
                        }}>
                          {ex.duration} min
                        </span>
                      </div>
                    </div>
                    <p style={{
                      fontSize: 13,
                      color: t.textMuted,
                      margin: 0,
                      lineHeight: 1.4,
                      fontFamily: 'var(--font-sans)',
                    }}>
                      {ex.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Active/Recent Exercises */}
            {exercises.length > 0 && (
              <div>
                <h3 style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: t.textPrimary,
                  margin: '0 0 16px',
                  fontFamily: 'var(--font-sans)',
                }}>
                  Your Exercise Progress
                </h3>
                <div style={{ display: 'grid', gap: 12 }}>
                  {exercises.map((ex) => (
                    <div
                      key={ex.id}
                      onClick={() => setSelectedExercise(ex)}
                      style={{
                        background: t.card,
                        borderRadius: 12,
                        padding: 16,
                        border: `1px solid ${t.border}`,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      <div>
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
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}>
                          {ex.completedAt ? <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Completed</> : `Step ${ex.steps.filter(s => s.userInput).length}/${ex.steps.length}`}
                        </p>
                      </div>
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
                    color: exercise.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
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
                    gap: 12,
                    fontSize: 12,
                    color: t.textMuted,
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock className="w-3.5 h-3.5" /> {exercise.duration} min</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Folder className="w-3.5 h-3.5" /> {exercise.category}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Sleep Tab */}
        {activeTab === 'sleep' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{
                fontSize: 20,
                fontWeight: 700,
                color: t.textPrimary,
                margin: 0,
                fontFamily: 'var(--font-sans)',
              }}>
                Sleep Tracker
              </h2>
              <button
                onClick={() => setShowSleepLogger(!showSleepLogger)}
                style={{
                  padding: '10px 16px',
                  borderRadius: 12,
                  background: t.accent,
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 600,
                  fontFamily: 'var(--font-sans)',
                }}
              >
                {showSleepLogger ? 'Cancel' : 'Log Sleep'}
              </button>
            </div>

            {/* Sleep Logger Form */}
            {showSleepLogger && (
              <form onSubmit={handleSleepSubmit} style={{
                background: t.card,
                borderRadius: 16,
                padding: 24,
                marginBottom: 32,
                border: `1px solid ${t.border}`,
              }}>
                <h3 style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: t.textPrimary,
                  margin: '0 0 20px',
                  fontFamily: 'var(--font-sans)',
                }}>
                  New Sleep Entry
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 20 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, color: t.textMuted, marginBottom: 6, fontFamily: 'var(--font-sans)' }}>
                      Date
                    </label>
                    <input
                      type="date"
                      value={sleepForm.date}
                      onChange={(e) => setSleepForm({ ...sleepForm, date: e.target.value })}
                      style={{
                        width: '100%',
                        padding: 10,
                        borderRadius: 8,
                        background: t.bg,
                        border: `1px solid ${t.border}`,
                        color: t.textPrimary,
                        fontSize: 14,
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 13, color: t.textMuted, marginBottom: 6, fontFamily: 'var(--font-sans)' }}>
                      Hours Slept
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="24"
                      value={sleepForm.hoursSlept}
                      onChange={(e) => setSleepForm({ ...sleepForm, hoursSlept: Number(e.target.value) })}
                      style={{
                        width: '100%',
                        padding: 10,
                        borderRadius: 8,
                        background: t.bg,
                        border: `1px solid ${t.border}`,
                        color: t.textPrimary,
                        fontSize: 14,
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 13, color: t.textMuted, marginBottom: 6, fontFamily: 'var(--font-sans)' }}>
                      Bedtime
                    </label>
                    <input
                      type="time"
                      value={sleepForm.bedTime}
                      onChange={(e) => setSleepForm({ ...sleepForm, bedTime: e.target.value })}
                      style={{
                        width: '100%',
                        padding: 10,
                        borderRadius: 8,
                        background: t.bg,
                        border: `1px solid ${t.border}`,
                        color: t.textPrimary,
                        fontSize: 14,
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 13, color: t.textMuted, marginBottom: 6, fontFamily: 'var(--font-sans)' }}>
                      Wake Time
                    </label>
                    <input
                      type="time"
                      value={sleepForm.wakeTime}
                      onChange={(e) => setSleepForm({ ...sleepForm, wakeTime: e.target.value })}
                      style={{
                        width: '100%',
                        padding: 10,
                        borderRadius: 8,
                        background: t.bg,
                        border: `1px solid ${t.border}`,
                        color: t.textPrimary,
                        fontSize: 14,
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 13, color: t.textMuted, marginBottom: 8, fontFamily: 'var(--font-sans)' }}>
                    Quality Rating (1-5 Stars)
                  </label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setSleepForm({ ...sleepForm, quality: star as any })}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: 4,
                        }}
                      >
                        <Star className={`w-6 h-6 ${star <= sleepForm.quality ? 'text-amber-400 fill-amber-400' : 'text-slate-500'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 13, color: t.textMuted, marginBottom: 6, fontFamily: 'var(--font-sans)' }}>
                    Notes (Optional)
                  </label>
                  <textarea
                    value={sleepForm.notes}
                    onChange={(e) => setSleepForm({ ...sleepForm, notes: e.target.value })}
                    placeholder="How did you feel waking up?"
                    style={{
                      width: '100%',
                      padding: 10,
                      borderRadius: 8,
                      background: t.bg,
                      border: `1px solid ${t.border}`,
                      color: t.textPrimary,
                      fontSize: 14,
                      minHeight: 80,
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setShowSleepLogger(false)}
                    style={{
                      padding: '10px 20px',
                      borderRadius: 8,
                      background: 'transparent',
                      color: t.textMuted,
                      border: `1px solid ${t.border}`,
                      cursor: 'pointer',
                      fontSize: 14,
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: '10px 20px',
                      borderRadius: 8,
                      background: t.accent,
                      color: '#fff',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 14,
                      fontWeight: 600,
                    }}
                  >
                    Save Sleep Entry
                  </button>
                </div>
              </form>
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
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}>
                  <Lightbulb className="w-5 h-5" /> Sleep Insights
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
                        <div style={{ display: 'flex', gap: 4 }}>
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < entry.quality ? 'text-amber-400 fill-amber-400' : 'text-slate-600 opacity-30'}`} />
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
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}>
                <Sparkles className="w-5 h-5 text-amber-400" /> Your Personalized Wellness Insights
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
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}>
                  <BarChart2 className="w-4 h-4" /> Your Wellness Overview
                </h3>
                <div style={{ display: 'grid', gap: 8 }}>
                  <p style={{ fontSize: 14, color: t.textPrimary, margin: 0, fontFamily: 'var(--font-sans)' }}>
                    <strong>Sleep Average:</strong> {stats.avgSleep} hours per night
                  </p>
                  <p style={{ fontSize: 14, color: t.textPrimary, margin: 0, fontFamily: 'var(--font-sans)' }}>
                    <strong>Exercise Completion:</strong> {stats.completionRate}% ({stats.exercisesCompleted} of {stats.totalExercises})
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Guided Exercise Modal */}
      {selectedExercise && (
        <ExerciseModal
          isOpen={true}
          exercise={selectedExercise}
          onClose={() => setSelectedExercise(null)}
        />
      )}
    </div>
  );
}
