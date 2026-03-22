/**
 * GoalsHub.tsx - Unified Goals & Accountability Dashboard
 * Combined Goals, Medications, Appointments, and Therapy Prep
 */

import { useState, useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useWellness } from '../context/WellnessContext';
import { useNotifications } from '../context/NotificationContext';
import { getTheme } from '../tokens';
import Sidebar from '../components/Sidebar';

export default function GoalsHub() {
  const { dark } = useTheme();
  const t = getTheme(dark);
  const { accountabilities, addAccountability, updateAccountability, medications, appointments, addMedication, addAppointment } = useWellness();
  const { scheduleMedicationReminder, scheduleAppointmentReminder } = useNotifications();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'goals' | 'medications' | 'appointments'>('dashboard');

  // Goals state
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoal, setNewGoal] = useState('');
  const [goalType, setGoalType] = useState<'daily' | 'weekly' | 'once'>('once');

  // Medications state
  const [showAddMed, setShowAddMed] = useState(false);
  const [medForm, setMedForm] = useState({
    name: '',
    dosage: '',
    times: [''],
    frequency: 'daily' as const,
    enabled: true,
  });

  // Appointments state
  const [showAddApt, setShowAddApt] = useState(false);
  const [aptForm, setAptForm] = useState({
    type: 'therapy' as const,
    providerName: '',
    date: '',
    time: '',
    notes: '',
    reminder: true,
  });

  // Calculate stats
  const stats = useMemo(() => {
    const activeGoals = accountabilities.filter(g => !g.completed).length;
    const completedGoals = accountabilities.filter(g => g.completed).length;
    const completionRate = accountabilities.length > 0 ? ((completedGoals / accountabilities.length) * 100).toFixed(0) : '0';
    const upcomingAppointments = appointments.filter(apt => apt.date >= new Date()).length;

    return {
      activeGoals,
      completedGoals,
      completionRate,
      totalMeds: medications.length,
      activeMeds: medications.filter(m => m.enabled).length,
      upcomingAppointments,
    };
  }, [accountabilities, medications, appointments]);

  // Filter data
  const activeGoals = accountabilities.filter(g => !g.completed);
  const completedGoals = accountabilities.filter(g => g.completed);
  const upcomingAppointments = appointments.filter(apt => apt.date >= new Date()).slice(0, 5);

  // Goal handlers
  const handleAddGoal = () => {
    if (!newGoal.trim()) return;
    addAccountability({
      goal: newGoal,
      type: goalType,
      completed: false,
      checkIns: [],
    });
    setNewGoal('');
    setShowAddGoal(false);
  };

  const handleToggleComplete = (id: string, completed: boolean) => {
    updateAccountability(id, {
      completed,
      completedAt: completed ? new Date() : undefined,
    });
  };

  // Medication handlers
  const handleAddMedication = () => {
    if (medForm.name && medForm.dosage && medForm.times[0]) {
      const newMed = {
        name: medForm.name,
        dosage: medForm.dosage,
        times: medForm.times.filter(time => time.trim() !== ''),
        frequency: medForm.frequency,
        enabled: medForm.enabled,
      };

      addMedication(newMed);

      if (newMed.enabled && newMed.frequency === 'daily') {
        newMed.times.forEach(time => {
          const medicationId = Date.now().toString();
          scheduleMedicationReminder(medicationId, time);
        });
      }

      setMedForm({
        name: '',
        dosage: '',
        times: [''],
        frequency: 'daily',
        enabled: true,
      });
      setShowAddMed(false);
    }
  };

  const addMedicationTime = () => {
    setMedForm(prev => ({
      ...prev,
      times: [...prev.times, '']
    }));
  };

  const removeMedicationTime = (index: number) => {
    setMedForm(prev => ({
      ...prev,
      times: prev.times.filter((_, i) => i !== index)
    }));
  };

  const updateMedicationTime = (index: number, value: string) => {
    setMedForm(prev => ({
      ...prev,
      times: prev.times.map((time, i) => i === index ? value : time)
    }));
  };

  // Appointment handlers
  const handleAddAppointment = () => {
    if (aptForm.providerName && aptForm.date && aptForm.time) {
      const appointmentDate = new Date(aptForm.date);
      const [hours, minutes] = aptForm.time.split(':').map(Number);
      appointmentDate.setHours(hours, minutes, 0, 0);

      const newApt = {
        type: aptForm.type,
        providerName: aptForm.providerName,
        date: appointmentDate,
        time: aptForm.time,
        notes: aptForm.notes,
        reminder: aptForm.reminder,
      };

      addAppointment(newApt);

      if (newApt.reminder) {
        const appointmentId = Date.now().toString();
        scheduleAppointmentReminder(appointmentId, appointmentDate);
      }

      setAptForm({
        type: 'therapy',
        providerName: '',
        date: '',
        time: '',
        notes: '',
        reminder: true,
      });
      setShowAddApt(false);
    }
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
              Goals & Accountability Hub
            </h1>
            <p style={{
              fontSize: 16,
              color: t.textMuted,
              fontFamily: 'var(--font-sans)',
            }}>
              Track your goals, medications, and appointments in one place
            </p>
          </div>

          {/* Tab Navigation */}
          <div style={{
            display: 'flex',
            gap: 12,
            marginBottom: 32,
            borderBottom: `1px solid ${t.border}`,
          }}>
            {(['dashboard', 'goals', 'medications', 'appointments'] as const).map((tab) => (
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
                {tab === 'goals' && '🎯 Goals'}
                {tab === 'medications' && '💊 Medications'}
                {tab === 'appointments' && '📅 Appointments'}
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
                  { label: 'Active Goals', value: stats.activeGoals, icon: '🎯' },
                  { label: 'Goals Completed', value: stats.completedGoals, icon: '✅' },
                  { label: 'Completion Rate', value: `${stats.completionRate}%`, icon: '📈' },
                  { label: 'Medications', value: `${stats.activeMeds}/${stats.totalMeds}`, icon: '💊' },
                  { label: 'Upcoming Appointments', value: stats.upcomingAppointments, icon: '📅' },
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
                    onClick={() => setActiveTab('goals')}
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
                    🎯 Set a Goal
                  </button>
                  <button
                    onClick={() => setActiveTab('medications')}
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
                    💊 Add Medication
                  </button>
                  <button
                    onClick={() => setActiveTab('appointments')}
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
                    📅 Book Appointment
                  </button>
                </div>
              </div>

              {/* Active Goals Preview */}
              {activeGoals.length > 0 && (
                <div style={{ marginBottom: 32 }}>
                  <h3 style={{
                    fontSize: 18,
                    fontWeight: 600,
                    color: t.textPrimary,
                    margin: '0 0 16px',
                    fontFamily: 'var(--font-sans)',
                  }}>
                    Your Active Goals
                  </h3>
                  <div style={{ display: 'grid', gap: 12 }}>
                    {activeGoals.slice(0, 3).map((goal) => (
                      <div
                        key={goal.id}
                        style={{
                          background: t.card,
                          borderRadius: 12,
                          padding: 16,
                          border: `1px solid ${t.border}`,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={goal.completed}
                          onChange={(e) => handleToggleComplete(goal.id, e.target.checked)}
                          style={{ width: 20, height: 20, cursor: 'pointer' }}
                        />
                        <div style={{ flex: 1 }}>
                          <p style={{
                            fontSize: 15,
                            fontWeight: 500,
                            color: t.textPrimary,
                            margin: 0,
                            fontFamily: 'var(--font-sans)',
                          }}>
                            {goal.goal}
                          </p>
                        </div>
                        <span style={{ fontSize: 12, color: t.textMuted, fontFamily: 'var(--font-sans)' }}>
                          {goal.type === 'once' ? 'One-time' : goal.type === 'daily' ? 'Daily' : 'Weekly'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upcoming Appointments Preview */}
              {upcomingAppointments.length > 0 && (
                <div>
                  <h3 style={{
                    fontSize: 18,
                    fontWeight: 600,
                    color: t.textPrimary,
                    margin: '0 0 16px',
                    fontFamily: 'var(--font-sans)',
                  }}>
                    Upcoming Appointments
                  </h3>
                  <div style={{ display: 'grid', gap: 12 }}>
                    {upcomingAppointments.slice(0, 3).map((apt) => (
                      <div
                        key={apt.id}
                        style={{
                          background: t.card,
                          borderRadius: 12,
                          padding: 16,
                          border: `1px solid ${t.border}`,
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                          <div>
                            <p style={{
                              fontSize: 14,
                              fontWeight: 600,
                              color: t.accent,
                              margin: '0 0 4px',
                              fontFamily: 'var(--font-sans)',
                            }}>
                              {apt.providerName}
                            </p>
                            <p style={{
                              fontSize: 13,
                              color: t.textMuted,
                              margin: 0,
                              fontFamily: 'var(--font-sans)',
                            }}>
                              {apt.date.toLocaleDateString()} at {apt.time}
                            </p>
                          </div>
                          {apt.reminder && <span style={{ fontSize: 16 }}>🔔</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Goals Tab */}
          {activeTab === 'goals' && (
            <div>
              {/* Add Goal Button */}
              <button
                onClick={() => setShowAddGoal(!showAddGoal)}
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
                + Set a Goal
              </button>

              {/* Add Goal Form */}
              {showAddGoal && (
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

                    <div style={{ display: 'flex', gap: 12 }}>
                      <button
                        onClick={() => setShowAddGoal(false)}
                        style={{
                          flex: 1,
                          padding: '12px',
                          borderRadius: 8,
                          background: 'transparent',
                          color: t.textMuted,
                          border: `1px solid ${t.border}`,
                          fontSize: 14,
                          fontWeight: 600,
                          cursor: 'pointer',
                          fontFamily: 'var(--font-sans)',
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddGoal}
                        disabled={!newGoal.trim()}
                        style={{
                          flex: 1,
                          padding: '12px',
                          borderRadius: 8,
                          background: newGoal.trim() ? t.accent : t.textMuted,
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
                          style={{ width: 20, height: 20, cursor: 'pointer' }}
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
          )}

          {/* Medications Tab */}
          {activeTab === 'medications' && (
            <div>
              <button
                onClick={() => setShowAddMed(!showAddMed)}
                style={{
                  padding: '12px 24px',
                  borderRadius: 12,
                  background: '#8B5CF6',
                  color: 'white',
                  border: 'none',
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-sans)',
                  marginBottom: 24,
                }}
              >
                + Add Medication
              </button>

              {/* Add Medication Form */}
              {showAddMed && (
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
                    marginBottom: 20,
                    fontFamily: 'var(--font-sans)',
                  }}>
                    Add New Medication
                  </h3>

                  <div style={{ display: 'grid', gap: 16 }}>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: 14,
                        fontWeight: 600,
                        color: t.textPrimary,
                        marginBottom: 6,
                        fontFamily: 'var(--font-sans)',
                      }}>
                        Medication Name
                      </label>
                      <input
                        type="text"
                        value={medForm.name}
                        onChange={(e) => setMedForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Sertraline"
                        style={{
                          width: '100%',
                          padding: 12,
                          borderRadius: 8,
                          border: `1px solid ${t.border}`,
                          background: t.bg,
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
                        marginBottom: 6,
                        fontFamily: 'var(--font-sans)',
                      }}>
                        Dosage
                      </label>
                      <input
                        type="text"
                        value={medForm.dosage}
                        onChange={(e) => setMedForm(prev => ({ ...prev, dosage: e.target.value }))}
                        placeholder="e.g., 50mg"
                        style={{
                          width: '100%',
                          padding: 12,
                          borderRadius: 8,
                          border: `1px solid ${t.border}`,
                          background: t.bg,
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
                        marginBottom: 6,
                        fontFamily: 'var(--font-sans)',
                      }}>
                        Times
                      </label>
                      {medForm.times.map((time, index) => (
                        <div key={index} style={{
                          display: 'flex',
                          gap: 8,
                          marginBottom: 8,
                          alignItems: 'center',
                        }}>
                          <input
                            type="time"
                            value={time}
                            onChange={(e) => updateMedicationTime(index, e.target.value)}
                            style={{
                              flex: 1,
                              padding: 12,
                              borderRadius: 8,
                              border: `1px solid ${t.border}`,
                              background: t.bg,
                              color: t.textPrimary,
                              fontSize: 14,
                              fontFamily: 'var(--font-sans)',
                            }}
                          />
                          {medForm.times.length > 1 && (
                            <button
                              onClick={() => removeMedicationTime(index)}
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                border: 'none',
                                background: '#EF4444',
                                color: 'white',
                                cursor: 'pointer',
                                fontSize: 14,
                                fontWeight: 'bold',
                              }}
                            >
                              ×
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        onClick={addMedicationTime}
                        style={{
                          padding: '8px 16px',
                          borderRadius: 6,
                          background: 'transparent',
                          color: '#8B5CF6',
                          border: '1px dashed #8B5CF6',
                          fontSize: 14,
                          fontWeight: 600,
                          cursor: 'pointer',
                          fontFamily: 'var(--font-sans)',
                        }}
                      >
                        + Add Time
                      </button>
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
                        Frequency
                      </label>
                      <select
                        value={medForm.frequency}
                        onChange={(e) => setMedForm(prev => ({ ...prev, frequency: e.target.value as any }))}
                        style={{
                          width: '100%',
                          padding: 12,
                          borderRadius: 8,
                          border: `1px solid ${t.border}`,
                          background: t.bg,
                          color: t.textPrimary,
                          fontSize: 14,
                          fontFamily: 'var(--font-sans)',
                        }}
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="asneeded">As Needed</option>
                      </select>
                    </div>

                    <div style={{ display: 'flex', gap: 12 }}>
                      <button
                        onClick={() => setShowAddMed(false)}
                        style={{
                          flex: 1,
                          padding: '12px',
                          borderRadius: 8,
                          background: 'transparent',
                          color: t.textMuted,
                          border: `1px solid ${t.border}`,
                          fontSize: 14,
                          fontWeight: 600,
                          cursor: 'pointer',
                          fontFamily: 'var(--font-sans)',
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddMedication}
                        disabled={!medForm.name || !medForm.dosage || !medForm.times[0]}
                        style={{
                          flex: 1,
                          padding: '12px',
                          borderRadius: 8,
                          background: (!medForm.name || !medForm.dosage || !medForm.times[0]) ? t.textMuted : '#8B5CF6',
                          color: 'white',
                          border: 'none',
                          fontSize: 14,
                          fontWeight: 600,
                          cursor: (!medForm.name || !medForm.dosage || !medForm.times[0]) ? 'not-allowed' : 'pointer',
                          fontFamily: 'var(--font-sans)',
                        }}
                      >
                        Add Medication
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {medications.length === 0 ? (
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
                    No medications tracked yet
                  </p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: 12 }}>
                  {medications.map((med) => (
                    <div
                      key={med.id}
                      style={{
                        background: t.card,
                        borderRadius: 12,
                        padding: 20,
                        border: `1px solid ${t.border}`,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <p style={{
                          fontSize: 16,
                          fontWeight: 600,
                          color: t.textPrimary,
                          margin: '0 0 4px',
                          fontFamily: 'var(--font-sans)',
                        }}>
                          {med.name}
                        </p>
                        <p style={{
                          fontSize: 14,
                          color: t.textMuted,
                          margin: 0,
                          fontFamily: 'var(--font-sans)',
                        }}>
                          {med.dosage} • {med.times.join(', ')}
                        </p>
                      </div>
                      <div style={{
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        background: med.enabled ? '#10B981' : t.textMuted,
                      }} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Appointments Tab */}
          {activeTab === 'appointments' && (
            <div>
              <button
                onClick={() => setShowAddApt(!showAddApt)}
                style={{
                  padding: '12px 24px',
                  borderRadius: 12,
                  background: '#EC4899',
                  color: 'white',
                  border: 'none',
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-sans)',
                  marginBottom: 24,
                }}
              >
                + Add Appointment
              </button>

              {/* Add Appointment Form */}
              {showAddApt && (
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
                    marginBottom: 20,
                    fontFamily: 'var(--font-sans)',
                  }}>
                    Add New Appointment
                  </h3>

                  <div style={{ display: 'grid', gap: 16 }}>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: 14,
                        fontWeight: 600,
                        color: t.textPrimary,
                        marginBottom: 6,
                        fontFamily: 'var(--font-sans)',
                      }}>
                        Type
                      </label>
                      <select
                        value={aptForm.type}
                        onChange={(e) => setAptForm(prev => ({ ...prev, type: e.target.value as any }))}
                        style={{
                          width: '100%',
                          padding: 12,
                          borderRadius: 8,
                          border: `1px solid ${t.border}`,
                          background: t.bg,
                          color: t.textPrimary,
                          fontSize: 14,
                          fontFamily: 'var(--font-sans)',
                        }}
                      >
                        <option value="therapy">Therapy</option>
                        <option value="doctor">Doctor</option>
                        <option value="psychiatrist">Psychiatrist</option>
                        <option value="other">Other</option>
                      </select>
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
                        Provider Name
                      </label>
                      <input
                        type="text"
                        value={aptForm.providerName}
                        onChange={(e) => setAptForm(prev => ({ ...prev, providerName: e.target.value }))}
                        placeholder="e.g., Dr. Smith"
                        style={{
                          width: '100%',
                          padding: 12,
                          borderRadius: 8,
                          border: `1px solid ${t.border}`,
                          background: t.bg,
                          color: t.textPrimary,
                          fontSize: 14,
                          fontFamily: 'var(--font-sans)',
                        }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: 14,
                          fontWeight: 600,
                          color: t.textPrimary,
                          marginBottom: 6,
                          fontFamily: 'var(--font-sans)',
                        }}>
                          Date
                        </label>
                        <input
                          type="date"
                          value={aptForm.date}
                          onChange={(e) => setAptForm(prev => ({ ...prev, date: e.target.value }))}
                          style={{
                            width: '100%',
                            padding: 12,
                            borderRadius: 8,
                            border: `1px solid ${t.border}`,
                            background: t.bg,
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
                          marginBottom: 6,
                          fontFamily: 'var(--font-sans)',
                        }}>
                          Time
                        </label>
                        <input
                          type="time"
                          value={aptForm.time}
                          onChange={(e) => setAptForm(prev => ({ ...prev, time: e.target.value }))}
                          style={{
                            width: '100%',
                            padding: 12,
                            borderRadius: 8,
                            border: `1px solid ${t.border}`,
                            background: t.bg,
                            color: t.textPrimary,
                            fontSize: 14,
                            fontFamily: 'var(--font-sans)',
                          }}
                        />
                      </div>
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
                        Notes (optional)
                      </label>
                      <textarea
                        value={aptForm.notes}
                        onChange={(e) => setAptForm(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Any additional details..."
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
                          resize: 'vertical',
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input
                        type="checkbox"
                        id="reminder"
                        checked={aptForm.reminder}
                        onChange={(e) => setAptForm(prev => ({ ...prev, reminder: e.target.checked }))}
                        style={{ width: 16, height: 16 }}
                      />
                      <label
                        htmlFor="reminder"
                        style={{
                          fontSize: 14,
                          color: t.textPrimary,
                          fontFamily: 'var(--font-sans)',
                          cursor: 'pointer',
                        }}
                      >
                        Send me a reminder
                      </label>
                    </div>

                    <div style={{ display: 'flex', gap: 12 }}>
                      <button
                        onClick={() => setShowAddApt(false)}
                        style={{
                          flex: 1,
                          padding: '12px',
                          borderRadius: 8,
                          background: 'transparent',
                          color: t.textMuted,
                          border: `1px solid ${t.border}`,
                          fontSize: 14,
                          fontWeight: 600,
                          cursor: 'pointer',
                          fontFamily: 'var(--font-sans)',
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddAppointment}
                        disabled={!aptForm.providerName || !aptForm.date || !aptForm.time}
                        style={{
                          flex: 1,
                          padding: '12px',
                          borderRadius: 8,
                          background: (!aptForm.providerName || !aptForm.date || !aptForm.time) ? t.textMuted : '#EC4899',
                          color: 'white',
                          border: 'none',
                          fontSize: 14,
                          fontWeight: 600,
                          cursor: (!aptForm.providerName || !aptForm.date || !aptForm.time) ? 'not-allowed' : 'pointer',
                          fontFamily: 'var(--font-sans)',
                        }}
                      >
                        Add Appointment
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {upcomingAppointments.length === 0 ? (
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
                    No upcoming appointments
                  </p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: 12 }}>
                  {appointments.map((apt) => (
                    <div
                      key={apt.id}
                      style={{
                        background: t.card,
                        borderRadius: 12,
                        padding: 20,
                        border: `1px solid ${t.border}`,
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'start',
                      }}>
                        <div>
                          <p style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: '#EC4899',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            margin: '0 0 8px',
                            fontFamily: 'var(--font-sans)',
                          }}>
                            {apt.type}
                          </p>
                          <p style={{
                            fontSize: 16,
                            fontWeight: 600,
                            color: t.textPrimary,
                            margin: '0 0 4px',
                            fontFamily: 'var(--font-sans)',
                          }}>
                            {apt.providerName}
                          </p>
                          <p style={{
                            fontSize: 14,
                            color: t.textMuted,
                            margin: 0,
                            fontFamily: 'var(--font-sans)',
                          }}>
                            {apt.date.toLocaleDateString()} at {apt.time}
                          </p>
                        </div>
                        {apt.reminder && (
                          <span style={{ fontSize: 20 }}>🔔</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
