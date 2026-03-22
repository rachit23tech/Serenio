/**
 * Goals.tsx - Gentle Accountability Tracker
 */

import { useState } from 'react';
import { useWellness } from '../context/WellnessContext';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../tokens';
import Sidebar from '../components/Sidebar';

export default function Goals() {
  const { dark } = useTheme();
  const t = getTheme(dark);
  const { accountabilities, addAccountability, updateAccountability } = useWellness();
  
  const [showAdd, setShowAdd] = useState(false);
  const [newGoal, setNewGoal] = useState('');
  const [goalType, setGoalType] = useState<'daily' | 'weekly' | 'once'>('once');

  const activeGoals = accountabilities.filter(g => !g.completed);
  const completedGoals = accountabilities.filter(g => g.completed);

  const handleAddGoal = () => {
    if (!newGoal.trim()) return;

    addAccountability({
      goal: newGoal,
      type: goalType,
      completed: false,
      checkIns: [],
    });

    setNewGoal('');
    setShowAdd(false);
  };

  const handleToggleComplete = (id: string, completed: boolean) => {
    updateAccountability(id, {
      completed,
      completedAt: completed ? new Date() : undefined,
    });
  };

  return (
    <div style={{ minHeight: '100vh', background: t.bg, display: 'flex' }}>
      <Sidebar active="goals" />
      <main style={{
        flex: 1,
        marginLeft: 240,
        padding: '48px 24px',
        overflowY: 'auto',
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          {/* Header */}
          <div style={{ marginBottom: 40 }}>
            <h1 style={{
              fontSize: 32,
              fontWeight: 700,
              color: t.textPrimary,
              margin: '0 0 8px',
              fontFamily: 'var(--font-sans)',
            }}>
              My Goals
            </h1>
            <p style={{
              fontSize: 16,
              color: t.textMuted,
              fontFamily: 'var(--font-sans)',
            }}>
              Small steps, no pressure. Just gentle accountability.
            </p>
          </div>

          {/* Add Goal Button */}
          <button
            onClick={() => setShowAdd(!showAdd)}
            style={{
              padding: '12px 24px',
              borderRadius: 12,
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              color: 'white',
              border: 'none',
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
              marginBottom: 24,
            }}
          >
            + Set a Goal
          </button>

          {/* Add Goal Form */}
          {showAdd && (
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
                What do you want to work on?
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
                    Your Goal
                  </label>
                  <input
                    type="text"
                    value={newGoal}
                    onChange={(e) => setNewGoal(e.target.value)}
                    placeholder="e.g., Go for a 10-minute walk"
                    style={{
                      width: '100%',
                      padding: '12px',
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
                    Frequency
                  </label>
                  <select
                    value={goalType}
                    onChange={(e) => setGoalType(e.target.value as typeof goalType)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: 8,
                      background: t.input,
                      border: `1px solid ${t.border}`,
                      color: t.textPrimary,
                      fontSize: 14,
                      fontFamily: 'var(--font-sans)',
                    }}
                  >
                    <option value="once">One-time goal</option>
                    <option value="daily">Daily goal</option>
                    <option value="weekly">Weekly goal</option>
                  </select>
                </div>

                <button
                  onClick={handleAddGoal}
                  disabled={!newGoal.trim()}
                  style={{
                    padding: '12px',
                    borderRadius: 8,
                    background: newGoal.trim() ? '#10B981' : t.textMuted,
                    color: 'white',
                    border: 'none',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: newGoal.trim() ? 'pointer' : 'not-allowed',
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  Add Goal
                </button>
              </div>
            </div>
          )}

          {/* Active Goals */}
          <div style={{ marginBottom: 32 }}>
            <h2 style={{
              fontSize: 20,
              fontWeight: 600,
              color: t.textPrimary,
              marginBottom: 16,
              fontFamily: 'var(--font-sans)',
            }}>
              Active Goals ({activeGoals.length})
            </h2>

            {activeGoals.length === 0 ? (
              <div style={{
                background: t.card,
                borderRadius: 16,
                padding: 32,
                border: `1px solid ${t.border}`,
                textAlign: 'center',
              }}>
                <p style={{
                  fontSize: 14,
                  color: t.textMuted,
                  margin: 0,
                  fontFamily: 'var(--font-sans)',
                }}>
                  No active goals. Set one above!
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 12 }}>
                {activeGoals.map((goal) => (
                  <div
                    key={goal.id}
                    style={{
                      background: t.card,
                      borderRadius: 12,
                      padding: 20,
                      border: `1px solid ${t.border}`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={goal.completed}
                      onChange={(e) => handleToggleComplete(goal.id, e.target.checked)}
                      style={{
                        width: 20,
                        height: 20,
                        cursor: 'pointer',
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <p style={{
                        fontSize: 15,
                        fontWeight: 500,
                        color: t.textPrimary,
                        margin: '0 0 4px',
                        fontFamily: 'var(--font-sans)',
                      }}>
                        {goal.goal}
                      </p>
                      <p style={{
                        fontSize: 12,
                        color: t.textMuted,
                        margin: 0,
                        fontFamily: 'var(--font-sans)',
                      }}>
                        {goal.type === 'once' ? 'One-time' : goal.type === 'daily' ? 'Daily' : 'Weekly'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Completed Goals */}
          {completedGoals.length > 0 && (
            <div>
              <h2 style={{
                fontSize: 20,
                fontWeight: 600,
                color: t.textPrimary,
                marginBottom: 16,
                fontFamily: 'var(--font-sans)',
              }}>
                Completed 🎉 ({completedGoals.length})
              </h2>

              <div style={{ display: 'grid', gap: 12 }}>
                {completedGoals.slice(0, 5).map((goal) => (
                  <div
                    key={goal.id}
                    style={{
                      background: dark ? 'rgba(16,185,129,0.1)' : '#ECFDF5',
                      borderRadius: 12,
                      padding: 20,
                      border: `1px solid ${dark ? 'rgba(16,185,129,0.2)' : '#A7F3D0'}`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      opacity: 0.8,
                    }}
                  >
                    <span style={{ fontSize: 20 }}>✅</span>
                    <div style={{ flex: 1 }}>
                      <p style={{
                        fontSize: 15,
                        fontWeight: 500,
                        color: t.textPrimary,
                        margin: '0 0 4px',
                        fontFamily: 'var(--font-sans)',
                        textDecoration: 'line-through',
                      }}>
                        {goal.goal}
                      </p>
                      <p style={{
                        fontSize: 12,
                        color: t.textMuted,
                        margin: 0,
                        fontFamily: 'var(--font-sans)',
                      }}>
                        {goal.completedAt?.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
