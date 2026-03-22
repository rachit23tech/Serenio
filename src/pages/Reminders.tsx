/**
 * Reminders.tsx - Medication & Appointment Management
 */

import { useState } from 'react';
import { useWellness } from '../context/WellnessContext';
import { useNotifications } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../tokens';
import Sidebar from '../components/Sidebar';

export default function Reminders() {
  const { dark } = useTheme();
  const t = getTheme(dark);
  const { medications, appointments, addMedication, addAppointment } = useWellness();
  const { scheduleMedicationReminder, scheduleAppointmentReminder } = useNotifications();
  
  const [showAddMed, setShowAddMed] = useState(false);
  const [showAddApt, setShowAddApt] = useState(false);
  
  // Medication form state
  const [medForm, setMedForm] = useState({
    name: '',
    dosage: '',
    times: [''],
    frequency: 'daily' as const,
    enabled: true,
  });
  
  // Appointment form state
  const [aptForm, setAptForm] = useState({
    type: 'therapy' as const,
    providerName: '',
    date: '',
    time: '',
    notes: '',
    reminder: true,
  });

  const upcomingAppointments = appointments
    .filter(apt => apt.date >= new Date())
    .slice(0, 5);

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
      
      // Schedule reminders for each time
      if (newMed.enabled && newMed.frequency === 'daily') {
        newMed.times.forEach(time => {
          const medicationId = Date.now().toString(); // We'll get the actual ID after creation
          scheduleMedicationReminder(medicationId, time);
        });
      }
      
      // Reset form
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
      
      // Schedule reminder if enabled
      if (newApt.reminder) {
        const appointmentId = Date.now().toString(); // We'll get the actual ID after creation
        scheduleAppointmentReminder(appointmentId, appointmentDate);
      }
      
      // Reset form
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

  return (
    <div 
      className="page-container"
      style={{ minHeight: '100vh', background: t.bg, display: 'flex' }}
    >
      <Sidebar active="reminders" />
      <main style={{
        flex: 1,
        marginLeft: 240,
        padding: '48px 24px',
        overflowY: 'auto',
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          {/* Header */}
          <div style={{ marginBottom: 40 }}>
            <h1 style={{
              fontSize: 32,
              fontWeight: 700,
              color: t.textPrimary,
              margin: '0 0 8px',
              fontFamily: 'var(--font-sans)',
            }}>
              Medications & Appointments
            </h1>
            <p style={{
              fontSize: 16,
              color: t.textMuted,
              fontFamily: 'var(--font-sans)',
            }}>
              Keep track of your health routines
            </p>
          </div>

          <div style={{ display: 'grid', gap: 32 }}>
            {/* Medications Section */}
            <div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 20,
              }}>
                <h2 style={{
                  fontSize: 22,
                  fontWeight: 600,
                  color: t.textPrimary,
                  margin: 0,
                  fontFamily: 'var(--font-sans)',
                }}>
                  💊 Medications
                </h2>
                <button
                  onClick={() => setShowAddMed(!showAddMed)}
                  className="hover-lift focus-ring"
                  style={{
                    padding: '10px 20px',
                    borderRadius: 8,
                    background: '#8B5CF6',
                    color: 'white',
                    border: 'none',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-sans)',
                    transition: 'all 0.2s ease-out',
                  }}
                >
                  + Add Medication
                </button>
              </div>

              {/* Add Medication Form */}
              {showAddMed && (
                <div 
                  className="scale-enter"
                  style={{
                    background: t.card,
                    borderRadius: 16,
                    padding: 24,
                    border: `1px solid ${t.border}`,
                    marginBottom: 20,
                  }}
                >
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
                              outline: 'none',
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
                          border: `1px dashed #8B5CF6`,
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
                          outline: 'none',
                        }}
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="asneeded">As Needed</option>
                      </select>
                    </div>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    gap: 12,
                    justifyContent: 'flex-end',
                    marginTop: 24,
                  }}>
                    <button
                      onClick={() => setShowAddMed(false)}
                      style={{
                        padding: '10px 20px',
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
                        padding: '10px 20px',
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
                <div 
                  className="stagger-children"
                  style={{ display: 'grid', gap: 12 }}
                >
                  {medications.map((med) => (
                    <div
                      key={med.id}
                      className="hover-lift"
                      style={{
                        background: t.card,
                        borderRadius: 12,
                        padding: 20,
                        border: `1px solid ${t.border}`,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'all 0.2s ease-out',
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

            {/* Appointments Section */}
            <div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 20,
              }}>
                <h2 style={{
                  fontSize: 22,
                  fontWeight: 600,
                  color: t.textPrimary,
                  margin: 0,
                  fontFamily: 'var(--font-sans)',
                }}>
                  📅 Upcoming Appointments
                </h2>
                <button
                  onClick={() => setShowAddApt(!showAddApt)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: 8,
                    background: '#EC4899',
                    color: 'white',
                    border: 'none',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  + Add Appointment
                </button>
              </div>

              {/* Add Appointment Form */}
              {showAddApt && (
                <div style={{
                  background: t.card,
                  borderRadius: 16,
                  padding: 24,
                  border: `1px solid ${t.border}`,
                  marginBottom: 20,
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
                          outline: 'none',
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
                          outline: 'none',
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
                            outline: 'none',
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
                          outline: 'none',
                          resize: 'vertical',
                        }}
                      />
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}>
                      <input
                        type="checkbox"
                        id="reminder"
                        checked={aptForm.reminder}
                        onChange={(e) => setAptForm(prev => ({ ...prev, reminder: e.target.checked }))}
                        style={{
                          width: 16,
                          height: 16,
                        }}
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
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    gap: 12,
                    justifyContent: 'flex-end',
                    marginTop: 24,
                  }}>
                    <button
                      onClick={() => setShowAddApt(false)}
                      style={{
                        padding: '10px 20px',
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
                        padding: '10px 20px',
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
                  {upcomingAppointments.map((apt) => (
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
          </div>
        </div>
      </main>
    </div>
  );
}